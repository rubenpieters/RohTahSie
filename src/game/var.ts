import { GameState } from "./state"
import { Var } from "./definitions/var";

export function evalVar<A>(
  state: GameState,
  varDef: Var<A>,
): A {
  switch (varDef.tag) {
    case "Constant": return varDef.a;
    case "CountAbility": {
      console.log(`test: ${state.player.layout.nodes.filter(x => x.name === varDef.ability).length}`);
      return state.player.layout.nodes.filter(x => x.name === varDef.ability).length as any;
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