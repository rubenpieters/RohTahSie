import { Cache } from "../app/main";
import { Display } from "./display";
import { GameState } from "./state";
import { ConcreteTarget } from "./definitions/target";
import { Action } from "./definitions/action";
import { StatusAction } from "./definitions/statusAction";
import { applyAction } from "./action";
import * as V from "./definitions/var";
import { Anim, Noop } from "../app/animation";
import { cloneDeep } from "lodash";

export function applyStatusAction(
  action: Action<ConcreteTarget>,
  statusAction: StatusAction<ConcreteTarget>,
  state: GameState,
  display: Display,
  cache: Cache,
): { animation: Anim, transformed: Action<ConcreteTarget>, newActions: Action<ConcreteTarget>[] } {
  switch (statusAction.tag) {
    case "Increase": {
      const transformed = cloneDeep(action);
      // TODO: make this typesafe
      const currentVal = (transformed as any)[statusAction.field];
      (transformed as any)[statusAction.field] = new V.Add(currentVal, new V.Constant(1));
      return { animation: new Noop(), transformed, newActions: [] };
    }
    default: {
      return { animation: new Noop(), transformed: action, newActions: [statusAction] };
    }
  }
}