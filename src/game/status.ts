import { Action } from "./definitions/action";
import { ConcreteTarget, StatusTarget } from "./definitions/target";
import { GameState } from "./state";
import { Status } from "./definitions/status";
import { checkCondition, conditionExpl } from "./condition";
import { applyStatusAction, concretizeStatusAction, statusActionExpl } from "./statusAction";
import { Cache, CacheValues } from "../app/main";
import { Display } from "./display";
import { combineExpl, SideExpl } from "./nodeExpl";
import { Trigger } from "./definitions/trigger";
import { actionExpl } from "./action";
import { varExpl } from "./var";
import { mapRecord } from "src/util/util";
import { StateStatus } from "./entity";
import { ActionInQueue } from "./definitions/phase";

export function applyStatuses(
  action: Action<ConcreteTarget>,
  origin: ConcreteTarget,
  state: GameState,
  display: Display,
  cache: Cache,
): { transformed: Action<ConcreteTarget>, newActions: ActionInQueue[] } {
  const pStatuses = state.player.entity.statuses.map(x => Object.assign(x, { owner: "player" as ("player" | "enemy") }));
  const eStatuses = state.enemy === undefined ? [] : state.enemy.entity.statuses.map(x => Object.assign(x, { owner: "enemy" as ("player" | "enemy") }));
  console.log(`effects: ${state.player.effects.length}`);
  const pEffects = state.player.effects.map(x => { return { ca: x, owner: "player", id: -1, type: "Status" }});
  const statuses = pStatuses.concat(eStatuses).concat(pEffects as any);
  let transformed = action;
  let newActions: ActionInQueue[] = [];
  for (const status of statuses) {
    if (status.type === "Status") {
      const result = applyStatus(transformed, origin, status, state, display, cache);
      transformed = result.transformed;
      newActions = newActions.concat(result.newActions);
    }
  }
  return { transformed, newActions };
}

export function applyStatus(
  action: Action<ConcreteTarget>,
  origin: ConcreteTarget,
  status: StateStatus,
  state: GameState,
  display: Display,
  cache: Cache,
): { transformed: Action<ConcreteTarget>, newActions: ActionInQueue[] } {
  return status.ca(({ condition, actions }) => {
    const filteredAction = checkCondition(condition, action, status.owner);
    if (filteredAction === "conditionFalse") {
      return { transformed: action, newActions: [] };
    } else {
      let newActions: ActionInQueue[] = [];
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
  status: Status | Trigger,
): CacheValues {
  return "status1";
}

export function statusExpl(
  status: Status | Trigger,
  variables: Record<string, string>,
): { mainExpl: string, sideExpl: SideExpl[] } {
  switch (status.type) {
    case "Status": {
      const { mainExpl, sideExpl, condExpl } = status.ca(({ condition, actions }) => {
        const sActionsExpl = combineExpl(actions, statusActionExpl);
        const condExpl = conditionExpl(condition);
        return { ...sActionsExpl, condExpl };
      });
      return {
        mainExpl: `- ${condExpl}\n- ` + mainExpl.join("\n- "),
        sideExpl,
      };
    }
    case "Trigger": {
      const actionsExpl = combineExpl(status.actions, actionExpl);
      const condExpl = varExpl(status.condition, variables);
      return {
        mainExpl: `- ${condExpl.mainExpl}\n- ` + actionsExpl.mainExpl.join("\n- "),
        sideExpl: actionsExpl.sideExpl.concat(condExpl.sideExpl),
      };
    }
  }
}
