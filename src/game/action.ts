import * as lo from "lodash";
import { GameState, findStatus } from "./state";
import { Anim, Noop, mkEff, Par, Seq, TweenTo, mkAccessTarget, mkParticle } from "../app/animation";
import { Display } from "./display";
import { updateResourceAnim, newEntityAnim, changeShieldAnim, statusAmount, updateEntityStatusDisplay, removeStatusAnim, damageStatusAnim } from "./entity";
import { barLocation, newLayoutAnim } from "./layout";
import { Cache } from "../app/main";
import { Action, Death } from "./definitions/action";
import { allEnemies } from "./enemy";
import { applyStatuses } from "./status";
import { ConcreteTarget, EnemyTarget, StatusTarget, AbstractTarget } from "./definitions/target";
import { targetToEntity, targetToEntityDisplay, targetExpl, concretizeTarget } from "./target";
import { updateGemText } from "../craft/card";
import { resourceMaxField } from "./entity";

export function applyAction(
  action: Action<ConcreteTarget>,
  state: GameState,
  display: Display,
  cache: Cache,
): { animation: Anim, newActions: Action<ConcreteTarget>[] } {
  switch (action.tag) {
    case "Regen": {
      if (
        action.target.tag === "PlayerTarget" ||
        action.target.tag === "EnemyTarget"
      ) {
        const targetEntity = targetToEntity(action.target, state);
        if (targetEntity !== undefined) {
          const prevValue = targetEntity[action.resource];
          const maxValue = targetEntity[resourceMaxField(action.resource)];
          targetEntity[action.resource] = Math.min(maxValue, targetEntity[action.resource] + action.value);
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
          display.enemy.layout.container.alpha = 1;
          display.enemy.entity.container.alpha = 1;
          // reset bar location
          state.enemy!.layout.currentIndex = 0;
          Object.assign(display.enemy.layout.bar, barLocation(state.enemy!.layout.currentIndex));
        },
        k: () => {
          return new Par([
            newLayoutAnim(state.enemy?.layout, display.enemy.layout, cache),
            newEntityAnim(state.enemy?.entity, display.enemy.entity, cache),
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
          let newActions: Action<ConcreteTarget>[] = [];
          if (action.target.tag === "EnemyTarget" && targetEntity[shieldType] <= 0) {
            newActions = [new Death(new EnemyTarget())];
          }
          return { animation, newActions };
        }
      } else if (action.target.tag === "StatusTarget") {
        const status = findStatus(state, action.target.id);
        if (status !== undefined) {
          // if a status is found on enemy, then it is not undefined
          const targetEntity = state[status.owner]!.entity;
          const newHp = Math.max(0, targetEntity.statuses[status.statusIndex].hp - action.value);
          targetEntity.statuses[status.statusIndex].hp = newHp;
          const animation = damageStatusAnim(status, targetEntity, display, cache);
          let newActions: Action<ConcreteTarget>[] = [];
          if (newHp <= 0) {
            newActions = [new Death(new StatusTarget(action.target.id))];
          }
          return { animation, newActions };
        } else {
          return { animation: new Noop(), newActions: [] };
        }
      }
      return { animation: new Noop(), newActions: [] };
    }
    case "Cost": {
      if (
        action.target.tag === "PlayerTarget" ||
        action.target.tag === "EnemyTarget"
      ) {
        const targetEntity = targetToEntity(action.target, state);
        if (targetEntity !== undefined) {
          const shieldType = action.resource;
          const prevValue = targetEntity[shieldType];
          targetEntity[shieldType] = Math.max(0, targetEntity[shieldType] - action.value);
          const valueChange = prevValue - targetEntity[shieldType];
          // decrease resource animation
          const target = action.target.tag === "PlayerTarget" ? "player" : "enemy";
          const animation = updateResourceAnim(targetEntity, display, shieldType, target, `-${valueChange}`);
          let newActions: Action<ConcreteTarget>[] = [];
          if (action.target.tag === "EnemyTarget" && targetEntity[shieldType] <= 0) {
            newActions = [new Death(new EnemyTarget())];
          }
          return { animation, newActions };
        }
      } else if (action.target.tag === "StatusTarget") {
        const status = findStatus(state, action.target.id);
        if (status !== undefined) {
          // if a status is found on enemy, then it is not undefined
          const targetEntity = state[status.owner]!.entity;
          const newHp = Math.max(0, targetEntity.statuses[status.statusIndex].hp - action.value);
          targetEntity.statuses[status.statusIndex].hp = newHp;
          const animation = damageStatusAnim(status, targetEntity, display, cache);
          let newActions: Action<ConcreteTarget>[] = [];
          if (newHp <= 0) {
            newActions = [new Death(new StatusTarget(action.target.id))];
          }
          return { animation, newActions };
        } else {
          return { animation: new Noop(), newActions: [] };
        }
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
        if (state.enemy !== undefined) {
          const gainedGems = state.enemy.reward;
          state.gems += gainedGems;
          state.enemy = undefined;
          // enemy death animation
          const animation: Anim = new Seq([
            new Par([
              new TweenTo(0.5, 0, "absolute", mkAccessTarget(display.enemy.layout.container, "alpha")),
              new TweenTo(0.5, 0, "absolute", mkAccessTarget(display.enemy.entity.container, "alpha")),
            ]),
            mkParticle({
              animation: (particle) => {
                return new Seq([
                  new Par([
                    new TweenTo(0.4, 10, "absolute", mkAccessTarget(particle, "x")),
                    new TweenTo(0.4, 290, "absolute", mkAccessTarget(particle, "y")),
                  ]),
                  new Par([
                    new TweenTo(0.4, 0, "absolute", mkAccessTarget(particle, "alpha")),
                    mkParticle({
                      animation: (particle) => {
                        return new TweenTo(0.4, 25, "relativeDecrease", mkAccessTarget(particle, "y"));
                      },
                      pool: display.pools.textParticlePool,
                      props: { text: `+${gainedGems}`, x: 10, y: 290, tint: 0x6600CC },
                    }),
                  ]),
                ]);
              },
              pool: display.pools.spriteParticlePool,
              props: { texture: cache["gem"], x: 250, y: 150, alpha: 1 },
            }),
            mkEff({
              eff: () => {
                updateGemText(display.cardCraft.gemText, state);
              },
              k: () => new Noop(),
            }),
          ]);
          return { animation, newActions: [] };
        }
      } else if (action.target.tag === "StatusTarget") {
        const status = findStatus(state, action.target.id);
        if (status !== undefined) {
          // if a status is found on enemy, then it is not undefined
          const targetEntity = state[status.owner]!.entity;
          targetEntity.statuses.splice(status.statusIndex, 1);
          const animation = removeStatusAnim(status, targetEntity, display, cache);
          return { animation, newActions: [] };
        } else {
          return { animation: new Noop(), newActions: [] };
        }
      }
      return { animation: new Noop(), newActions: [] };
    }
    case "NoAction": {
      return { animation: new Noop(), newActions: [] };
    }
    case "EndTurn": {
      return { animation: new Noop(), newActions: [] };
    }
  }
}

export function actionExpl<T extends AbstractTarget>(
  action: Action<T>,
) {
  switch (action.tag) {
    case "Regen": return `+${action.value} ${action.resource} to ${targetExpl(action.target)}`;
    case "Cost": return `-${action.value} ${action.resource} to ${targetExpl(action.target)}`;
    case "AddStatus": return `Add Status`;
    case "ChangeShield": return `${action.resource} Concentration`;
    case "Damage": return `-${action.value} Essence to ${targetExpl(action.target)}`;
    case "Death": return `Death`;
    case "EndTurn": return `EndTurn`;
    case "NoAction": return `NoAction`;
    case "Summon": return `Summon ${action.enemyId}`;
  }
}

export function concretizeAction(
  action: Action<AbstractTarget>,
  source: "player" | "enemy",
): Action<ConcreteTarget> {
  switch (action.tag) {
    case "Damage": return { ...action, target: concretizeTarget(action.target, source) };
    case "Cost": return { ...action, target: concretizeTarget(action.target, source) };
    default: return action;
  }
}