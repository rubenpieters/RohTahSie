import { Status } from "./definitions/status";
import { CacheValues } from "../app/main";
import { GameState } from "./state";
import { Action, Damage, NoAction, Death } from "./definitions/action";
import { ConcreteTarget, PlayerTarget, EnemyTarget, StatusTarget } from "./definitions/target";
import { eqTarget } from "./target";
import { StateStatus } from "./entity";
import { evalVar } from "./var";
import { Constant } from "./definitions/var";

/*
export function statusSprite(
  status: Status,
): CacheValues {
  switch (status.tag) {
    case "Armor1": {
      return "status1";
    }
    case "Armor2": {
      return "status1";
    }
    case "Dmg1": {
      return "status1";
    }
  }
}

export function applyStatuses(
  action: Action<ConcreteTarget>,
  origin: ConcreteTarget,
  state: GameState,
): { transformed: Action<ConcreteTarget>, newActions: Action<ConcreteTarget>[] } {
  const pStatuses = state.player.entity.statuses.map(x => Object.assign(x, { owner: new PlayerTarget() as ConcreteTarget }));
  const eStatuses = state.enemy === undefined ? [] : state.enemy.entity.statuses.map(x => Object.assign(x, { owner: new EnemyTarget() as ConcreteTarget }));
  const statuses = pStatuses.concat(eStatuses);
  let transformed = action;
  let newActions: Action<ConcreteTarget>[] = [];
  for (const status of statuses) {
    const result = applyStatus(transformed, origin, status, state);
    transformed = result.transformed;
    newActions = newActions.concat(result.newActions);
  }
  return { transformed, newActions };
}

function applyStatus(
  action: Action<ConcreteTarget>,
  origin: ConcreteTarget,
  status: StateStatus & { owner: ConcreteTarget },
  state: GameState,
): { transformed: Action<ConcreteTarget>, newActions: Action<ConcreteTarget>[] } {
  switch (status.tag) {
    case "Armor1": {
      if (
        action.tag === "Damage" &&
        eqTarget(status.owner, action.target)
      ) {
        const varValue = evalVar(state, action.value);
        const newValue = varValue - status.value;
        const transformed = newValue <= 0 ?
          new NoAction() :
          new Damage(new Constant(newValue), action.target);
        const newActions: Action<ConcreteTarget>[] = [
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
        const varValue = evalVar(state, action.value);
        const newValue = varValue - status.value;
        const transformed = newValue <= 0 ?
          new NoAction() :
          new Damage(new Constant(newValue), action.target);
        const newActions: Action<ConcreteTarget>[] = [
          new Damage(new Constant(status.loseValue), new StatusTarget(status.id)),
        ];
        return { transformed, newActions };
      } else {
        return { transformed: action, newActions: [] };
      }
    }
    case "Dmg1": {
      if (action.tag === "EndTurn") {
        const newActions = [
          new Damage(new Constant(1), new EnemyTarget()),
          new Damage(new Constant(status.loseValue), new StatusTarget(status.id)),
        ];
        return { transformed: action, newActions };
      } else {
        return { transformed: action, newActions: [] };
      }
    }
  }
}
*/