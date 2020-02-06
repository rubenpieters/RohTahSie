import { GameState } from "./state"
import { Var } from "./definitions/var";

export function evalVar<A>(
  state: GameState,
  varDef: Var<A>,
): A {
  switch (varDef.tag) {
    case "Constant": return varDef.a;
    case "CommunityVar": return 1 as any; // TODO
  }
}