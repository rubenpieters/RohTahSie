import { StateTrigger } from "./entity";
import { GameState } from "./state";
import { Display } from "./display";
import { evalVar, concretizeVar } from "./var";
import { Noop, Anim, Seq } from "../app/animation";
import { concretizeAction } from "./action";
import { StatusTarget, ConcreteTarget } from "./definitions/target";
import { Action } from "./definitions/action";
import { Cache } from "../app/main";
import { Trigger } from "./definitions/trigger";
import { ActionInQueue } from "./definitions/phase";

export function checkTriggers(
  state: GameState,
  display: Display,
  cache: Cache,
): { animation: Anim, newActions: ActionInQueue[] } {
  const pStatuses = state.player.entity.statuses.map(x => Object.assign(x, { owner: "player" as ("player" | "enemy") }));
  const eStatuses = state.enemy === undefined ? [] : state.enemy.entity.statuses.map(x => Object.assign(x, { owner: "enemy" as ("player" | "enemy") }));
  const statuses = pStatuses.concat(eStatuses);
  const anims: Anim[] = [];
  let newActions: ActionInQueue[] = [];
  for (const status of statuses) {
    if (status.type === "Trigger") {
      const result = checkTrigger(status, state, display, cache);
      anims.push(result.animation);
      newActions = newActions.concat(result.newActions);
    }
  }
  return { animation: new Seq(anims), newActions };
}

export function checkTrigger(
  trigger: StateTrigger,
  state: GameState,
  display: Display,
  cache: Cache,
): { animation: Anim, newActions: ActionInQueue[] } {
  const thisStatus = new StatusTarget(trigger.id);
  // previous value of the condition
  const prev = trigger.cond;
  // calculate next value of the condition
  const next = evalTriggerCondition(trigger, state, trigger.owner, thisStatus);
  
  trigger.cond = next;
  // if condition has changed, return trigger actions to add to queue
  if (prev !== next && next) {
    const newActions = trigger.actions.map(x => { return {
      action: concretizeAction(x, trigger.owner, thisStatus),
      indexSource: undefined,
    }});
    return { animation: new Noop(), newActions };
  } else {
    return { animation: new Noop(), newActions: [] };
  }
}

export function evalTriggerCondition(
  trigger: StateTrigger,
  state: GameState,
  owner: "player" | "enemy",
  thisStatus: StatusTarget,
) {
  const concreteCondition = concretizeVar(trigger.condition, owner, thisStatus);
  return evalVar(state, concreteCondition, owner, thisStatus);
}