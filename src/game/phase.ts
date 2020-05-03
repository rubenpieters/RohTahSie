import * as lo from "lodash";
import { GameState } from "./state";
import { GamePhase, Transforming, Applying, Charging, Finalizing, ActionInQueue, Waiting } from "./definitions/phase";
import { EndTurn, Conditional, Action, NoAction } from "./definitions/action";
import { EnemyTarget, PlayerTarget, AbstractTarget } from "./definitions/target";
import { Initiate } from "./definitions/ability";
import { Noop } from "src/app/animation";

export function nextPhase(
  state: GameState,
): GamePhase {
  switch (state.phase.tag) {
    case "Waiting": {
      return new Charging();
    }
    case "Charging": {
      const abilityActions = lo.cloneDeep(state.player.layout.nodes[state.player.layout.currentIndex].ability.actions);
      const moveActions = lo.cloneDeep(state.player.layout.nodes[state.player.layout.currentIndex].direction.actions);
      const condMove = state.player.layout.nodes[state.player.layout.currentIndex].condMove;
      const condMoveAction: Action<AbstractTarget>[] = condMove !== undefined ? [new Conditional(
        lo.cloneDeep(condMove.cond.cond), lo.cloneDeep(condMove.move.actions), moveActions
      )] : moveActions;
      const actions = abilityActions.concat(condMoveAction);
      const actionQueue: ActionInQueue[] = actions.map(x => { return {
        action: x, indexSource: state.player.layout.currentIndex,
      }});
      actionQueue.push({ action: new EndTurn(new PlayerTarget()), indexSource: undefined });
      return new Transforming(actionQueue, "player");
    }
    case "Transforming": {
      if (state.phase.afterTransform === undefined) {
        // if after transform is empty, skip
        if (state.phase.source === "enemy") {
          return new Finalizing();
        } else if (state.phase.source === "player") {
          // if an enemy is defined, fill the action queue with enemy ability
          if (state.enemy !== undefined && ! state.enemy.entity.dirty) {
            const abilityActions = lo.cloneDeep(state.enemy.layout.nodes[state.enemy.layout.currentIndex].ability.actions);
            const moveActions = lo.cloneDeep(state.enemy.layout.nodes[state.enemy.layout.currentIndex].direction.actions);
            const condMove = state.player.layout.nodes[state.player.layout.currentIndex].condMove;
            const condMoveAction: Action<AbstractTarget>[] = condMove !== undefined ? [new Conditional(
              lo.cloneDeep(condMove.cond.cond), lo.cloneDeep(condMove.move.actions), moveActions
            )] : moveActions;
            const actions = abilityActions.concat(condMoveAction);
            const actionQueue: ActionInQueue[] = actions.map(x => { return {
              action: x, indexSource: state.player.layout.currentIndex,
            }});
            actionQueue.push({ action: new EndTurn(new EnemyTarget()), indexSource: undefined });
            return new Transforming(actionQueue, "enemy");
          // otherwise if an initiation is defined, fill the action queue with initiate ability
          } else if (state.initiate !== undefined) {
            const enIds = state.initiate;
            let enId = enIds[0];
            if (state.random) {
              enId = enIds[getRandomInt(0, enIds.length - 1)];
            }
            const actions = lo.cloneDeep(new Initiate(enId).actions);
            const actionQueue: ActionInQueue[] = actions.map(x => { return {
              action: x, indexSource: undefined,
            }});
            actionQueue.push({ action: new EndTurn(new EnemyTarget()), indexSource: undefined });
            // reset initiate field if not in continuous mode
            if (! state.continuous) {
              state.initiate = undefined;
            }
            return new Transforming(actionQueue, "enemy");
          }
        }
        // otherwise, go to finalizing phase
        return new Finalizing();
      } else {
        // else go to applying phase
        return { ...state.phase, tag: "Applying", nextAction: state.phase.afterTransform };
      }
    }
    case "Applying": {
      // if queue is empty, advance to enemy turn or return to charging phase
      if (state.phase.actionQueue.length === 0) {
        if (state.phase.source === "enemy") {
          return new Finalizing();
        } else if (state.phase.source === "player") {
          // if an enemy is defined, fill the action queue with enemy ability
          if (state.enemy !== undefined && ! state.enemy.entity.dirty) {
            const abilityActions = lo.cloneDeep(state.enemy.layout.nodes[state.enemy.layout.currentIndex].ability.actions);
            const moveActions = lo.cloneDeep(state.enemy.layout.nodes[state.enemy.layout.currentIndex].direction.actions);
            const condMove = state.player.layout.nodes[state.player.layout.currentIndex].condMove;
            const condMoveAction: Action<AbstractTarget>[] = condMove !== undefined ? [new Conditional(
              lo.cloneDeep(condMove.cond.cond), lo.cloneDeep(condMove.move.actions), moveActions
            )] : moveActions;
            const actions = abilityActions.concat(condMoveAction);
            const actionQueue: ActionInQueue[] = actions.map(x => { return {
              action: x, indexSource: state.player.layout.currentIndex,
            }});
            actionQueue.push({ action: new EndTurn(new EnemyTarget()), indexSource: undefined });
            return new Transforming(actionQueue, "enemy");
          // otherwise if an initiation is defined, fill the action queue with initiate ability
          } else if (state.initiate !== undefined) {
            const enIds = state.initiate;
            let enId = enIds[0];
            if (state.random) {
              enId = enIds[getRandomInt(0, enIds.length - 1)];
            }
            const actions = lo.cloneDeep(new Initiate(enId).actions);
            const actionQueue: ActionInQueue[] = actions.map(x => { return {
              action: x, indexSource: undefined,
            }});
            actionQueue.push({ action: new EndTurn(new EnemyTarget()), indexSource: undefined });
            // reset initiate field if not in continuous mode
            if (! state.continuous) {
              state.initiate = undefined;
            }
            return new Transforming(actionQueue, "enemy");
          }
        }
        // otherwise, go to finalizing phase
        return new Finalizing();
      }
      // otherwise, go to transforming phase
      return { ...state.phase, tag: "Transforming" };
    }
    case "Finalizing": {
      return new Waiting();
    }
  }
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}