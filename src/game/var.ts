import { GameState } from "./state"
import { Var, mkEquals } from "./definitions/var";
import { ConcreteTarget, AbstractTarget } from "./definitions/target";
import { concretizeTarget, targetExpl } from "./target";
import deepEqual from "deep-equal";
import lo from "lodash";
import { SideExpl, nextVarId, VarExpl, varIdToVarName } from "./nodeExpl";

export function evalVar<A>(
  state: GameState,
  varDef: Var<A, ConcreteTarget>,
  source: "player" | "enemy",
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
    case "CountStatusType": {
      if (varDef.target.tag === "StatusTarget") {
        throw "CountStatusType: Incorrect Target";
      }
      const target = varDef.target.tag === "PlayerTarget" ? state.player : state.enemy;
      if (target === undefined) {
        return 0 as any;
      }
      return target.entity.statuses.filter(x => x.sType === varDef.sType).length as any;
    }
    case "Div": {
      const beforeRound = evalVar(state, varDef.x1, source) / evalVar(state, varDef.x2, source);
      switch (varDef.rounding) {
        case "ceil": return Math.ceil(beforeRound) as any;
        case "floor": return Math.floor(beforeRound) as any;
      }
    }
    case "Add": {
      return evalVar(state, varDef.x1, source) + evalVar(state, varDef.x2, source) as any;
    }
    case "Minus": {
      return Math.max(0, evalVar(state, varDef.x1, source) - evalVar(state, varDef.x2, source)) as any;
    }
    case "Mult": {
      return evalVar(state, varDef.x1, source) * evalVar(state, varDef.x2, source) as any;
    }
    case "Equals": {
      const isEqual = varDef.f(({ x1, x2 }) => {
        const evaled1 = evalVar(state, x1, source);
        const evaled2 = evalVar(state, x2, source);
        return deepEqual(evaled1, evaled2);
      });
      return isEqual as any;
    }
    case "LT": {
      return evalVar(state, varDef.x1, source) < evalVar(state, varDef.x2, source) as any;
    }
    case "Below": {
      return evalVar(state, varDef.x1, source) < varDef.v as any;
    }
    case "Min": {
      return Math.min(evalVar(state, varDef.x1, source), varDef.v) as any;
    }
    case "Resource": {
      const concTarget = concretizeTarget(varDef.target, source);
      if (concTarget.tag === "StatusTarget") {
        throw "Resource Var: invalid target";
      } else {
        const target = concTarget.tag === "PlayerTarget" ? "player" : "enemy";
        const targetEntity = state[target];
        if (targetEntity !== undefined) {
          const resource = varDef.res === "essence" ? targetEntity.entity.shield : varDef.res;
          console.log(`RESULT: ${targetEntity.entity[resource]}`);
          return targetEntity.entity[resource] as any;
        }
        // TODO: have some form of undefined result of condition evaluation?
        return 0 as any;
      }
    }
    case "GetVar": {
      if (! (varDef.name in state.variables)) {
        throw `Variable ${varDef.name} not in ${JSON.stringify(state.variables)}`;
      }
      const v = state.variables[varDef.name];
      state.variables[varDef.name].count -= varDef.count;
      if (state.variables[varDef.name].count == 0) {
        delete state.variables[varDef.name];
      }
      return v.v as any;
    }
  }
}

export function concretizeVar<A>(
  varDef: Var<A, AbstractTarget>,
  source: "player" | "enemy",
): Var<A, ConcreteTarget> {
  switch (varDef.tag) {
    case "LT": // fallthrough
    case "Div": // fallthrough
    case "Minus": // fallthrough
    case "Mult": // fallthrough
    case "Add": return { ...varDef, x1: concretizeVar(varDef.x1, source), x2: concretizeVar(varDef.x2, source) };
    case "Min": // fallthrough
    case "Below": return { ...varDef, x1: concretizeVar(varDef.x1, source) };
    case "Resource": // fallthrough
    case "CountStatusType": // fallthrough
    case "CountAbility": return { ...varDef, target: concretizeTarget(varDef.target, source) };
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
  variables: Record<string, string>,
): { mainExpl: string, sideExpl: SideExpl[] } {
  return _varExpl([], varDef, variables);
}

function _varExpl<A>(
  varExpl: SideExpl[],
  varDef: Var<A, AbstractTarget>,
  variables: Record<string, string>,
): { mainExpl: string, sideExpl: SideExpl[] } {
  switch (varDef.tag) {
    case "Constant": return { mainExpl: `${varDef.a}`, sideExpl: varExpl };
    case "CountAbility": {
      const varId = nextVarId(varExpl);
      const varName = varIdToVarName(varId);
      const toAddExpl = new VarExpl(varId, `${varName} is count of ${varDef.ability} on layout`);
      return {
        mainExpl: `${varName}`,
        sideExpl: varExpl.concat([toAddExpl]),
      };
    }
    case "Div": {
      const result1 = _varExpl(varExpl, varDef.x1, variables);
      const result2 = _varExpl(result1.sideExpl, varDef.x2, variables);
      return {
        mainExpl: `${result1.mainExpl} / ${result2.mainExpl}`,
        sideExpl: result2.sideExpl
      };
    }
    case "Add": {
      const result1 = _varExpl(varExpl, varDef.x1, variables);
      const result2 = _varExpl(result1.sideExpl, varDef.x2, variables);
      return {
        mainExpl: `${result1.mainExpl} + ${result2.mainExpl}`,
        sideExpl: result2.sideExpl
      };
    }
    case "Minus": {
      const result1 = _varExpl(varExpl, varDef.x1, variables);
      const result2 = _varExpl(result1.sideExpl, varDef.x2, variables);
      return {
        mainExpl: `${result1.mainExpl} - ${result2.mainExpl}`,
        sideExpl: result2.sideExpl
      };
    }
    case "Mult": {
      const result1 = _varExpl(varExpl, varDef.x1, variables);
      const result2 = _varExpl(result1.sideExpl, varDef.x2, variables);
      return {
        mainExpl: `${result1.mainExpl} * ${result2.mainExpl}`,
        sideExpl: result2.sideExpl
      };
    }
    case "Equals": {
      return varDef.f(({ x1, x2 }) => {
        const result1 = _varExpl(varExpl, x1, variables);
        const result2 = _varExpl(result1.sideExpl, x2, variables);
        return {
          mainExpl: `${result1.mainExpl} == ${result2.mainExpl}`,
          sideExpl: result2.sideExpl
        };
      });
    }
    case "LT": {
      const result1 = _varExpl(varExpl, varDef.x1, variables);
      const result2 = _varExpl(result1.sideExpl, varDef.x2, variables);
      return {
        mainExpl: `${result1.mainExpl} < ${result2.mainExpl}`,
        sideExpl: result2.sideExpl
      };
    }
    case "Below": {
      const result1 = _varExpl(varExpl, varDef.x1, variables);
      return {
        mainExpl: `${result1.mainExpl} < ${varDef.v}`,
        sideExpl: result1.sideExpl
      }
    }
    case "Min": {
      const result1 = _varExpl(varExpl, varDef.x1, variables);
      return {
        mainExpl: `lowest of ${result1.mainExpl} and ${varDef.v}`,
        sideExpl: result1.sideExpl
      }
    }
    case "Resource": {
      const varId = nextVarId(varExpl);
      const varName = varIdToVarName(varId);
      const toAddExpl = new VarExpl(varId, `${varName} is ${targetExpl(varDef.target)} ${varDef.res}`);
      return {
        mainExpl: `${varName}`,
        sideExpl: varExpl.concat([toAddExpl]),
      };
    }
    case "GetVar": {
      if (! (varDef.name in variables)) {
        throw `Variable ${varDef.name} not in ${JSON.stringify(variables)}`;
      }
      const varName = variables[varDef.name];
      return {
        mainExpl: `${varName}`,
        sideExpl: [],
      };
    }
    case "CountStatusType": {
      const varId = nextVarId(varExpl);
      const varName = varIdToVarName(varId);
      const toAddExpl = new VarExpl(varId, `${varName} is count of ${varDef.sType} statuses on ${targetExpl(varDef.target)}`);
      return {
        mainExpl: `${varName}`,
        sideExpl: varExpl.concat([toAddExpl]),
      };
    }
  }
}
