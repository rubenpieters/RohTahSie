import * as lo from "lodash";
import { GameState } from "./state";
import { Anim, Noop, mkEff, Par, Seq } from "../app/animation";
import { Display } from "./display";
import { updateResourceAnim, newEntityAnim, changeShieldAnim, statusAmount, updateEntityStatusDisplay } from "./entity";
import { barLocation, newLayoutAnim } from "./layout";
import { Cache } from "../app/main";
import { Action, Death } from "./definitions/action";
import { allEnemies } from "./enemy";

export function applyAction(
  action: Action,
  state: GameState,
  display: Display,
  cache: Cache,
): { animation: Anim, newActions: Action[] } {
  switch (action.tag) {
    case "Regen": {
      const target = action.target === "enemy" ? state.enemy : state.player;
      if (target !== undefined) {
        const prevValue = target.entity[action.resource];
        target.entity[action.resource] = Math.min(100, target.entity[action.resource] + action.value);
        const valueChange = target.entity[action.resource] - prevValue;
        // increase resource animation
        const animation = updateResourceAnim(target.entity, display, action.resource, action.target, `+${valueChange}`)
        return { animation, newActions: [] };
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
      const target = action.target === "enemy" ? state.enemy : state.player;
      if (target !== undefined) {
        const shieldType = target.entity.shield;
        const prevValue = target.entity[shieldType];
        target.entity[shieldType] = Math.max(0, target.entity[shieldType] - action.value);
        const valueChange = prevValue - target.entity[shieldType];
        // decrease resource animation
        const animation = updateResourceAnim(target.entity, display, shieldType, action.target, `-${valueChange}`);
        let newActions: Action[] = [];
        if (action.target === "enemy" && target.entity[shieldType] <= 0) {
          newActions = [new Death("enemy")];
        }
        return { animation, newActions };
      }
      return { animation: new Noop(), newActions: [] };
    }
    case "ChangeShield": {
      const target = action.target === "enemy" ? state.enemy : state.player;
      if (
        target !== undefined &&
        target.entity.shield !== action.resource
      ) {
        target.entity.shield = action.resource;
        const animation = changeShieldAnim(display[action.target].entity, action.target, action.resource, cache);
        return { animation, newActions: [] };
      }
      return { animation: new Noop(), newActions: [] };
    }
    case "AddStatus": {
      const target = action.target === "enemy" ? state.enemy : state.player;
      if (
        target !== undefined &&
        target.entity.statuses.length < statusAmount
      ) {
        target.entity.statuses.push(lo.cloneDeep(action.status));
        const animation = mkEff({
          eff: () => {
            updateEntityStatusDisplay(target.entity, display[action.target].entity.statusSprites, cache);
          },
          k: () => new Noop(),
        });
        return { animation, newActions: [] };
      }
      return { animation: new Noop(), newActions: [] };
    }
    case "Death": {
      if (action.target === "enemy") {
        state.enemy = undefined;
        // enemy death animation
        const animation: Anim = mkEff({ eff: () => {
          display.enemy.layout.container.visible = false;
          display.enemy.entity.container.visible = false;
        }, k: () => new Noop () });
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
  actions: Action[],
  state: GameState,
  display: Display,
  cache: Cache,
): Anim {
  if (actions.length === 0) {
    return new Noop();
  }
  const { animation, newActions } = applyAction(actions[0], state, display, cache);
  return new Seq([
    animation,
    applyActions(newActions.concat(actions.slice(1)), state, display, cache),
  ]);
}