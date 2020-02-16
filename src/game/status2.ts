import { Action } from "./definitions/action";
import { ConcreteTarget, PlayerTarget, EnemyTarget } from "./definitions/target";
import { GameState } from "./state";
import { Status2 } from "./definitions/status2";
import { checkCondition } from "./condition";
import { applyStatusAction } from "./statusAction";
import { Cache, CacheValues } from "../app/main";
import { Display } from "./display";

export function applyStatuses(
  action: Action<ConcreteTarget>,
  origin: ConcreteTarget,
  state: GameState,
  display: Display,
  cache: Cache,
): { transformed: Action<ConcreteTarget>, newActions: Action<ConcreteTarget>[] } {
  const pStatuses = state.player.entity.statuses.map(x => Object.assign(x, { owner: new PlayerTarget() as ConcreteTarget }));
  const eStatuses = state.enemy === undefined ? [] : state.enemy.entity.statuses.map(x => Object.assign(x, { owner: new EnemyTarget() as ConcreteTarget }));
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
  status: Status2 & { owner: ConcreteTarget },
  state: GameState,
  display: Display,
  cache: Cache,
): { transformed: Action<ConcreteTarget>, newActions: Action<ConcreteTarget>[] } {
  return status.f(({ condition, actions }) => {
    const filteredAction = checkCondition(condition, action, status.owner);
    if (filteredAction === "conditionFalse") {
      return { transformed: action, newActions: [] };
    } else {
      let newActions: Action<ConcreteTarget>[] = [];
      let transformed: Action<ConcreteTarget> = action;
      actions.forEach(x => {
        const result = applyStatusAction(transformed, x, state, display, cache);
        newActions = newActions.concat(result.newActions);
        transformed = result.transformed;
      });
      return { transformed, newActions };
    }
  });
}


export function statusSprite(
  status: Status2,
): CacheValues {
  return "status1";
}