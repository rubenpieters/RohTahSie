import { Status } from "./definitions/status";
import { CacheValues } from "../app/main";
import { GameState } from "./state";
import { Action, Damage, NoAction, Death } from "./definitions/action";
import { TargetType, PlayerTarget, EnemyTarget, StatusTarget } from "./definitions/target";
import { eqTarget } from "./target";
import { StateStatus } from "./entity";


export function statusSprite(
  status: Status,
): CacheValues {
  switch (status.tag) {
    case "Armor1": {
      return "status";
    }
    case "Armor2": {
      return "status";
    }
    case "Dmg1": {
      return "status";
    }
  }
}

export function applyStatuses(
  action: Action,
  origin: TargetType,
  state: GameState,
): { transformed: Action, newActions: Action[] } {
  const pStatuses = state.player.entity.statuses.map(x => Object.assign(x, { owner: new PlayerTarget() as TargetType }));
  const eStatuses = state.enemy === undefined ? [] : state.enemy.entity.statuses.map(x => Object.assign(x, { owner: new EnemyTarget() as TargetType }));
  const statuses = pStatuses.concat(eStatuses);
  let transformed = action;
  let newActions: Action[] = [];
  for (const status of statuses) {
    const result = applyStatus(transformed, origin, status, state);
    transformed = result.transformed;
    newActions = newActions.concat(result.newActions);
  }
  return { transformed, newActions };
}

function applyStatus(
  action: Action,
  origin: TargetType,
  status: StateStatus & { owner: TargetType },
  state: GameState,
): { transformed: Action, newActions: Action[] } {
  switch (status.tag) {
    case "Armor1": {
      if (
        action.tag === "Damage" &&
        eqTarget(status.owner, action.target)
      ) {
        const newValue = action.value - status.value;
        const transformed = newValue <= 0 ?
          new NoAction() :
          new Damage(newValue, action.target);
        const newActions: Action[] = [
          new Death(new StatusTarget(status.id)),
        ];
        return { transformed, newActions };
      } else {
        return { transformed: action, newActions: [] };
      }
    }
    case "Armor2": {
      if (
        action.tag === "Damage" &&
        eqTarget(status.owner, action.target)
      ) {
        const newValue = action.value - status.value;
        const transformed = newValue <= 0 ?
          new NoAction() :
          new Damage(newValue, action.target);
        const newActions: Action[] = [
          new Damage(status.loseValue, new StatusTarget(status.id)),
        ];
        return { transformed, newActions };
      } else {
        return { transformed: action, newActions: [] };
      }
    }
    case "Dmg1": {
      if (action.tag === "EndTurn") {
        const newActions = [
          new Damage(1, new EnemyTarget()),
          new Damage(status.loseValue, new StatusTarget(status.id)),
        ];
        return { transformed: action, newActions };
      } else {
        return { transformed: action, newActions: [] };
      }
    }
  }
}