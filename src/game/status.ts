import { Action } from "./definitions/action";
import { ConcreteTarget, StatusTarget } from "./definitions/target";
import { GameState } from "./state";
import { Status } from "./definitions/status";
import { checkCondition, conditionExpl } from "./condition";
import { applyStatusAction, concretizeStatusAction, statusActionExpl } from "./statusAction";
import { Cache, CacheValues } from "../app/main";
import { Display } from "./display";
import { combineExpl } from "./nodeExpl";

export function applyStatuses(
  action: Action<ConcreteTarget>,
  origin: ConcreteTarget,
  state: GameState,
  display: Display,
  cache: Cache,
): { transformed: Action<ConcreteTarget>, newActions: Action<ConcreteTarget>[] } {
  const pStatuses = state.player.entity.statuses.map(x => Object.assign(x, { owner: "player" as ("player" | "enemy") }));
  const eStatuses = state.enemy === undefined ? [] : state.enemy.entity.statuses.map(x => Object.assign(x, { owner: "enemy" as ("player" | "enemy") }));
  const statuses = pStatuses.concat(eStatuses);
  let transformed = action;
  let newActions: Action<ConcreteTarget>[] = [];
  for (const status of statuses) {
    const result = applyStatus(transformed, origin, status, state, display, cache);
    transformed = result.transformed;
    newActions = newActions.concat(result.newActions);
  }
  return { transformed, newActions };
}

export function applyStatus(
  action: Action<ConcreteTarget>,
  origin: ConcreteTarget,
  status: Status & { id: number, hp: number, owner: "player" | "enemy" },
  state: GameState,
  display: Display,
  cache: Cache,
): { transformed: Action<ConcreteTarget>, newActions: Action<ConcreteTarget>[] } {
  return status.ca(({ condition, actions }) => {
    const filteredAction = checkCondition(condition, action, status.owner);
    if (filteredAction === "conditionFalse") {
      return { transformed: action, newActions: [] };
    } else {
      let newActions: Action<ConcreteTarget>[] = [];
      let transformed: Action<ConcreteTarget> = action;
      actions.forEach(action => {
        const concretizedAction = concretizeStatusAction(action, status.owner, new StatusTarget(status.id));
        const result = applyStatusAction(transformed, concretizedAction, state, display, cache);
        newActions = newActions.concat(result.newActions);
        transformed = result.transformed;
      });
      return { transformed, newActions };
    }
  });
}

export function statusSprite(
  status: Status,
): CacheValues {
  return "status1";
}

export function statusExpl(
  status: Status,
): { mainExpl: string, sideExpl: { [K in string]: string } } {
  const { mainExpl, sideExpl, condExpl } = status.ca(({ condition, actions }) => {
    // TODO: add condition expl
    const sActionsExpl = combineExpl(actions, statusActionExpl);
    const condExpl = conditionExpl(condition);
    return { ...sActionsExpl, condExpl };
  });
  return {
    mainExpl: `- ${condExpl}\n- ` + mainExpl.join("\n- "),
    sideExpl,
  };
}
