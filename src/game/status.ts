import { Status } from "./definitions/status";
import { CacheValues } from "../app/main";
import { GameState } from "./state";
import { Action, Damage, NoAction } from "./definitions/action";
import { TargetType, PlayerTarget, EnemyTarget } from "./definitions/target";
import { eqTarget } from "./target";


export function statusSprite(
  status: Status,
): CacheValues {
  switch (status.tag) {
    case "Armor": {
      return "status";
    }
  }
}

export function applyStatuses(
  action: Action,
  origin: TargetType,
  state: GameState,
) {
  const pStatuses = state.player.entity.statuses.map(x => Object.assign(x, { owner: new PlayerTarget() as TargetType }));
  const eStatuses = state.enemy === undefined ? [] : state.enemy.entity.statuses.map(x => Object.assign(x, { owner: new EnemyTarget() as TargetType }));
  const statuses = pStatuses.concat(eStatuses);
  let transformed = action;
  for (const status of statuses) {
    transformed = applyStatus(transformed, origin, status, state);
  }
  return transformed;
}

function applyStatus(
  action: Action,
  origin: TargetType,
  status: Status & { owner: TargetType },
  state: GameState,
): Action {
  switch (status.tag) {
    case "Armor": {
      if (
        action.tag === "Damage" &&
        eqTarget(status.owner, action.target)
      ) {
        const newValue = action.value - status.value;
        return newValue <= 0 ?
          new NoAction() :
          new Damage(newValue, action.target);
      } else {
        return action;
      }
    }
  }
}