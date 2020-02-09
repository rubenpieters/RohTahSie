import { GameState } from "./state"
import { Var } from "./definitions/var";
import { ConcreteTarget, AbstractTarget } from "./definitions/target";
import { concretizeTarget } from "./target";

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
  }
}

export function concretizeVar<A>(
  varDef: Var<A, AbstractTarget>,
  source: "player" | "enemy",
): Var<A, ConcreteTarget> {
  switch (varDef.tag) {
    case "CountAbility": return { ...varDef, target: concretizeTarget(varDef.target, source) };
    case "Div": return { ...varDef, x1: concretizeVar(varDef.x1, source), x2: concretizeVar(varDef.x2, source) };
    default: return varDef;
  }
}