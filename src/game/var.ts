import { GameState } from "./state"
import { Var, mkEquals } from "./definitions/var";
import { ConcreteTarget, AbstractTarget } from "./definitions/target";
import { concretizeTarget, targetExpl } from "./target";
import deepEqual from "deep-equal";
import lo from "lodash";

export function evalVar<A>(
  state: GameState,
  varDef: Var<A, ConcreteTarget>,
): A {
  switch (varDef.tag) {
    case "Constant": return varDef.a;
    case "CountAbility": {
      if (varDef.target.tag === "StatusTarget") {
        throw "CountAbility: Incorrect Target";
      }
      const target = varDef.target.tag === "PlayerTarget" ? state.player : state.enemy;
      if (target === undefined) {
        return 0 as any;
      }
      return target.layout.nodes.filter(x => x.name === varDef.ability).length as any;
    }
    case "Div": {
      const beforeRound = evalVar(state, varDef.x1) / evalVar(state, varDef.x2);
      switch (varDef.rounding) {
        case "ceil": return Math.ceil(beforeRound) as any;
        case "floor": return Math.floor(beforeRound) as any;
      }
    }
    case "Equals": {
      const isEqual = varDef.f(({ x1, x2 }) => {
        const evaled1 = evalVar(state, x1);
        const evaled2 = evalVar(state, x2);
        return deepEqual(evaled1, evaled2);
      });
      return isEqual as any;
    }
  }
}

export function concretizeVar<A>(
  varDef: Var<A, AbstractTarget>,
  source: "player" | "enemy",
): Var<A, ConcreteTarget> {
  switch (varDef.tag) {
    case "CountAbility": return { ...varDef, target: concretizeTarget(varDef.target, source) };
    case "Div": return { ...varDef, x1: concretizeVar(varDef.x1, source), x2: concretizeVar(varDef.x2, source) };
    case "Equals": {
      const { concretized1, concretized2 } = varDef.f(({ x1, x2 }) => {
        const concretized1 = concretizeVar(x1, source);
        const concretized2 = concretizeVar(x2, source);
        return { concretized1, concretized2 };
      });
      return mkEquals(concretized1, concretized2) as Var<A, ConcreteTarget>;
    }
    default: return varDef;
  }
}

export function varExpl<A>(
  varDef: Var<A, AbstractTarget>,
) {
  return _varExpl({}, varDef);
}

function _varExpl<A>(
  varExpl: { [K in string]: string },
  varDef: Var<A, AbstractTarget>,
): { mainExpl: string, varExpl: { [K in string]: string } } {
  switch (varDef.tag) {
    case "Constant": return { mainExpl: `${varDef.a}`, varExpl: {} };
    case "CountAbility": {
      const varName = newVarName(varExpl);
      const newVarExpl = lo.cloneDeep(varExpl);
      newVarExpl[varName] = `${varName} is count of ${varDef.ability} on layout`;
      return {
        mainExpl: `${varName}`,
        varExpl: newVarExpl,
      };
    }
    case "Div": {
      const result1 = _varExpl(varExpl, varDef.x1);
      const result2 = _varExpl(result1.varExpl, varDef.x2);
      return {
        mainExpl: `${result1.mainExpl} / ${result2.mainExpl}`,
        varExpl: result2.varExpl
      };
    }
    case "Equals": {
      return varDef.f(({ x1, x2 }) => {
        const result1 = _varExpl(varExpl, x1);
        const result2 = _varExpl(result1.varExpl, x2);
        return {
          mainExpl: `${result1.mainExpl} == ${result2.mainExpl}`,
          varExpl: result2.varExpl
        };
      });
    }
  }
}

function newVarName(
  varExpl: { [K in string]: string },
): string {
  switch (Object.keys(varExpl).length) {
    case 0: return "X";
    case 1: return "Y";
    case 2: return "Z";
    default: throw "newVarName: Unsupported Variable Count";
  }
}