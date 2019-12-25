import * as lo from "lodash";
import { GameState, findStatus } from "./state";
import { Anim, Noop, mkEff, Par, Seq } from "../app/animation";
import { Display } from "./display";
import { updateResourceAnim, newEntityAnim, changeShieldAnim, statusAmount, updateEntityStatusDisplay, removeStatusAnim, damageStatusAnim } from "./entity";
import { barLocation, newLayoutAnim } from "./layout";
import { Cache } from "../app/main";
import { Action, Death } from "./definitions/action";
import { allEnemies } from "./enemy";
import { applyStatuses } from "./status";
import { TargetType, EnemyTarget } from "./definitions/target";
import { targetToEntity, targetToEntityDisplay } from "./target";

export function applyAction(
  action: Action,
  state: GameState,
  display: Display,
  cache: Cache,
): { animation: Anim, newActions: Action[] } {
  switch (action.tag) {
    case "Regen": {
      if (
        action.target.tag === "PlayerTarget" ||
        action.target.tag === "EnemyTarget"
      ) {
        const targetEntity = targetToEntity(action.target, state);
        if (targetEntity !== undefined) {
          const prevValue = targetEntity[action.resource];
          targetEntity[action.resource] = Math.min(100, targetEntity[action.resource] + action.value);
          const valueChange = targetEntity[action.resource] - prevValue;
          // increase resource animation
          const target = action.target.tag === "PlayerTarget" ? "player" : "enemy";
          const animation = updateResourceAnim(targetEntity, display, action.resource, target, `+${valueChange}`)
          return { animation, newActions: [] };
        }
      }
      return { animation: new Noop(), newActions: [] };
    }
    case "Summon": {
      state.enemy = lo.cloneDeep(allEnemies[action.enemyId]);
      // summon enemy animation
      const animation = mkEff({
        eff: () => {
          display.enemy.layout.container.visible = true;
          display.enemy.entity.container.visible = true;
          // reset bar location
          state.enemy!.layout.currentIndex = 0;
          Object.assign(display.enemy.layout.bar, barLocation(state.enemy!.layout.currentIndex));
        },
        k: () => {
          return new Par([
            newLayoutAnim(state.enemy === undefined ? undefined : state.enemy.layout, display.enemy.layout, cache),
            newEntityAnim(state.enemy === undefined ? undefined : state.enemy.entity, display.enemy.entity, cache),
          ]);
        },
      });
      return { animation, newActions: [] };
    }
    case "Damage": {
      if (
        action.target.tag === "PlayerTarget" ||
        action.target.tag === "EnemyTarget"
      ) {
        const targetEntity = targetToEntity(action.target, state);
        if (targetEntity !== undefined) {
          const shieldType = targetEntity.shield;
          const prevValue = targetEntity[shieldType];
          targetEntity[shieldType] = Math.max(0, targetEntity[shieldType] - action.value);
          const valueChange = prevValue - targetEntity[shieldType];
          // decrease resource animation
          const target = action.target.tag === "PlayerTarget" ? "player" : "enemy";
          const animation = updateResourceAnim(targetEntity, display, shieldType, target, `-${valueChange}`);
          let newActions: Action[] = [];
          if (action.target.tag === "EnemyTarget" && targetEntity[shieldType] <= 0) {
            newActions = [new Death(new EnemyTarget())];
          }
          return { animation, newActions };
        }
      } else if (action.target.tag === "StatusTarget") {
        const animation = damageStatusAnim(action.target, action.value, state, display, cache);
        return { animation, newActions: [] };
      }
      return { animation: new Noop(), newActions: [] };
    }
    case "ChangeShield": {
      if (
        action.target.tag === "PlayerTarget" ||
        action.target.tag === "EnemyTarget"
      ) {
        const targetEntity = targetToEntity(action.target, state);
        const targetEntityDisplay = targetToEntityDisplay(action.target, display);
        if (
          targetEntity !== undefined &&
          targetEntity.shield !== action.resource
        ) {
          targetEntity.shield = action.resource;
          const animation = changeShieldAnim(targetEntityDisplay, action.target, action.resource, cache);
          return { animation, newActions: [] };
        }
      }
      return { animation: new Noop(), newActions: [] };
    }
    case "AddStatus": {
      if (
        action.target.tag === "PlayerTarget" ||
        action.target.tag === "EnemyTarget"
      ) {
        const targetEntity = targetToEntity(action.target, state);
        const targetEntityDisplay = targetToEntityDisplay(action.target, display);
        if (
          targetEntity !== undefined &&
          targetEntity.statuses.length < statusAmount
        ) {
          const id = state.idCounter;
          const stateStatus = { ...action.status, id, hp: action.status.maxHp };
          state.idCounter++;
          targetEntity.statuses.push(stateStatus);
          const animation = mkEff({
            eff: () => {
              updateEntityStatusDisplay(targetEntity, targetEntityDisplay.statusSprites, targetEntityDisplay.statusHpSprites, cache);
            },
            k: () => new Noop(),
          });
          return { animation, newActions: [] };
        }
      }
      return { animation: new Noop(), newActions: [] };
    }
    case "Death": {
      if (action.target.tag === "EnemyTarget") {
        state.enemy = undefined;
        // enemy death animation
        const animation: Anim = mkEff({ eff: () => {
          display.enemy.layout.container.visible = false;
          display.enemy.entity.container.visible = false;
        }, k: () => new Noop () });
        return { animation, newActions: [] };
      } else if (action.target.tag === "StatusTarget") {
        const animation = removeStatusAnim(action.target, state, display, cache);
        return { animation, newActions: [] };
      }
      return { animation: new Noop(), newActions: [] };
    }
    case "NoAction": {
      return { animation: new Noop(), newActions: [] };
    }
  }
}

export function applyActions(
  actionQueue: Action[],
  origin: TargetType,
  state: GameState,
  display: Display,
  cache: Cache,
): Anim {
  if (actionQueue.length === 0) {
    return new Noop();
  }
  const action = actionQueue[0];
  const applyStatusResult = applyStatuses(action, origin, state);
  const applyActionResult = applyAction(applyStatusResult.transformed, state, display, cache);
  const newActions = applyStatusResult.newActions.concat(applyActionResult.newActions).concat(actionQueue.slice(1));
  return new Seq([
    applyActionResult.animation,
    applyActions(newActions, origin, state, display, cache),
  ]);
}