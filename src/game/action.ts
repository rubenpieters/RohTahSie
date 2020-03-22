import * as lo from "lodash";
import { GameState, findStatus } from "./state";
import { Anim, Noop, mkEff, Par, Seq, TweenTo, mkAccessTarget, mkParticle } from "../app/animation";
import { Display } from "./display";
import { updateResourceAnim, newEntityAnim, changeShieldAnim, statusAmount, updateEntityStatusDisplay, removeStatusAnim, damageStatusAnim, sizeUsed } from "./entity";
import { barLocation, newLayoutAnim } from "./layout";
import { Cache } from "../app/main";
import { Action, Death } from "./definitions/action";
import { allEnemies } from "./enemy";
import { applyStatuses, statusExpl } from "./status";
import { ConcreteTarget, EnemyTarget, StatusTarget, AbstractTarget } from "./definitions/target";
import { targetToEntity, targetToEntityDisplay, targetExpl, concretizeTarget } from "./target";
import { updateGemText } from "../craft/card";
import { resourceMaxField } from "./entity";
import { evalVar, concretizeVar, varExpl } from "./var";
import { SideExpl, StatusExpl, varIdToVarName, nextVarId, VarExpl } from "./nodeExpl"
import { evalTriggerCondition } from "./trigger";
import { ResourceType } from "./types";

export function applyAction(
  action: Action<ConcreteTarget>,
  state: GameState,
  display: Display,
  cache: Cache,
  source: "player" | "enemy",
): { animation: Anim, newActions: Action<ConcreteTarget>[] } {
  switch (action.tag) {
    case "Regen": {
      if (
        action.target.tag === "PlayerTarget" ||
        action.target.tag === "EnemyTarget"
      ) {
        const targetEntity = targetToEntity(action.target, state);
        if (targetEntity !== undefined) {
          const resource = action.resource === "essence" ? targetEntity.shield : action.resource;
          let resources: ResourceType[] = [];
          if (resource === "lowest") {
            const lowest = Math.min(targetEntity.roh, targetEntity.tah, targetEntity.sie);
            resources = (["roh", "tah", "sie"] as ResourceType[])
              .map((x: ResourceType) => { return { res: x, v: targetEntity[x] } })
              .filter(({ res, v }) => v === lowest)
              .map(({ res, v }) => res)
              ;
          } else if (resource === "highest") {
            const highest = Math.max(targetEntity.roh, targetEntity.tah, targetEntity.sie);
            resources = (["roh", "tah", "sie"] as ResourceType[])
              .map((x: ResourceType) => { return { res: x, v: targetEntity[x] } })
              .filter(({ res, v }) => v === highest)
              .map(({ res, v }) => res)
              ;
          } else {
            resources = [resource];
          }
          const animation = new Seq(
            resources.map(res => {
              const prevValue = targetEntity[res];
              const maxValue = targetEntity[resourceMaxField(res)];
              const value = evalVar(state, action.value, source);
              targetEntity[res] = Math.min(maxValue, targetEntity[res] + value);
              const valueChange = targetEntity[res] - prevValue;
              // increase resource animation
              const target = action.target.tag === "PlayerTarget" ? "player" : "enemy";
              const animation = updateResourceAnim(targetEntity, display, res, target, `+${valueChange}`);
              return animation;
            })
          );
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
          const resource = action.resource === "essence" ? targetEntity.shield : action.resource;
          let resources: ResourceType[] = [];
          if (resource === "lowest") {
            const lowest = Math.min(targetEntity.roh, targetEntity.tah, targetEntity.sie);
            resources = (["roh", "tah", "sie"] as ResourceType[])
              .map((x: ResourceType) => { return { res: x, v: targetEntity[x] } })
              .filter(({ res, v }) => v === lowest)
              .map(({ res, v }) => res)
              ;
          } else if (resource === "highest") {
            const highest = Math.max(targetEntity.roh, targetEntity.tah, targetEntity.sie);
            resources = (["roh", "tah", "sie"] as ResourceType[])
              .map((x: ResourceType) => { return { res: x, v: targetEntity[x] } })
              .filter(({ res, v }) => v === highest)
              .map(({ res, v }) => res)
              ;
          } else {
            resources = [resource];
          }
          const animation = new Seq(
            resources.map(res => {
              const prevValue = targetEntity[res];
              const value = evalVar(state, action.value, source);
              targetEntity[res] = Math.max(0, targetEntity[res] - value);
              const valueChange = prevValue - targetEntity[res];
              // decrease resource animation
              const target = action.target.tag === "PlayerTarget" ? "player" : "enemy";
              const animation = updateResourceAnim(targetEntity, display, res, target, `-${valueChange}`);
              return animation;
            })
          );
          return { animation, newActions: [] };
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
          targetEntity.statuses.length < statusAmount &&
          sizeUsed(targetEntity) + action.status.size <= statusAmount
        ) {
          const id = state.idCounter;
          const targetOwner: "player" | "enemy" = action.target.tag === "PlayerTarget" ? "player" : "enemy";
          let cond = action.status.type === "Status" ? false : evalTriggerCondition(action.status, state, targetOwner);
          const stateStatus = { ...action.status, id, hp: action.status.maxHp, cond, owner: targetOwner };
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
    case "RemoveStatus": {
      if (
        action.target.tag === "PlayerTarget" ||
        action.target.tag === "EnemyTarget"
      ) {
        const targetEntity = targetToEntity(action.target, state);
        if (targetEntity !== undefined) {
          const amount = evalVar(state, action.amount, source);
          const newActions = targetEntity.statuses
            .filter(x => x.sType === action.sType)
            .filter((x, i) => i < amount)
            .map(x => new Death(new StatusTarget(x.id)))
            ;
          return { animation: new Noop(), newActions };
        }
        return { animation: new Noop(), newActions: [] };
      }
      return { animation: new Noop(), newActions: [] };
    }
    case "Conditional": {
      const evalCond = evalVar(state, action.cond, source);
      if (evalCond) {
        return { animation: new Noop(), newActions: [action.actionThen] };
      } else {
        return { animation: new Noop(), newActions: [action.actionElse] };
      }
    }
    case "StoreVar": {
      const evalV = evalVar(state, action.v, source);
      if (action.name in state.variables) {
        throw `Variable ${action.name} already defined in ${JSON.stringify(state.variables)}`;
      }
      state.variables[action.name] = { v: evalV, count: action.count };
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
  variables: Record<string, string>,
): { mainExpl: string | undefined, sideExpl: SideExpl[], variables: Record<string, string>, } {
  switch (action.tag) {
    case "Regen": {
      const varExpls = varExpl(action.value, variables);
      return {
        mainExpl: `+${varExpls.mainExpl} ${action.resource} to ${targetExpl(action.target)}`,
        sideExpl: varExpls.sideExpl,
        variables,
      };
    }
    case "Cost": return {
      mainExpl: `-${action.value} ${action.resource} to ${targetExpl(action.target)}`,
      sideExpl: [],
      variables,
    };
    case "AddStatus": {
      const sExpl = statusExpl(action.status, variables);
      return {
        mainExpl: `Add ${action.status.name} Status`,
        sideExpl: sExpl.sideExpl.concat([new StatusExpl(sExpl.mainExpl)]),
        variables,
      };
    }
    case "RemoveStatus": {
      const amountExpl = varExpl(action.amount, variables);
      return {
        mainExpl: `Remove first ${amountExpl.mainExpl} ${action.sType} statuses from ${targetExpl(action.target)}`,
        sideExpl: amountExpl.sideExpl,
        variables,
      };
    }
    case "ChangeShield": return {
      mainExpl: `${action.resource} Concentration`,
      sideExpl: [],
      variables,
    };
    case "Damage": {
      const varExpls = varExpl(action.value, variables);
      return {
        mainExpl: `-${varExpls.mainExpl} Essence to ${targetExpl(action.target)}`,
        sideExpl: varExpls.sideExpl,
        variables,
      };
    }
    case "Death": return {
      mainExpl: `Death`,
      sideExpl: [],
      variables,
    };
    case "EndTurn": return {
      mainExpl: `EndTurn`,
      sideExpl: [],
      variables,
    };
    case "NoAction": return {
      mainExpl: `NoAction`,
      sideExpl: [],
      variables,
    };
    case "Summon": return {
      mainExpl: `Summon ${action.enemyId}`,
      sideExpl: [],
      variables,
    };
    case "StoreVar": {
      const vExpl = varExpl(action.v, variables);
      const varId = nextVarId(vExpl.sideExpl);
      const varName = varIdToVarName(varId);
      const newExpl: SideExpl[] = [new VarExpl(varId, `${varName} is ${vExpl.mainExpl}`)];
      return {
        mainExpl: `Store ${varName}`,
        sideExpl: newExpl.concat(vExpl.sideExpl),
        variables: { ...variables, [action.name]: varName },
      };
    }
    case "Conditional": {
      const condExpl = varExpl(action.cond, variables);
      const thenExpl = actionExpl(action.actionThen, variables);
      const elseExpl = actionExpl(action.actionElse, thenExpl.variables);
      return {
        mainExpl: `if ${condExpl.mainExpl}\n   * then: ${thenExpl.mainExpl}\n   * else: ${elseExpl.mainExpl}`,
        sideExpl: condExpl.sideExpl.concat(thenExpl.sideExpl).concat(elseExpl.sideExpl),
        variables: elseExpl.variables,
      };
    }
  }
}

export function concretizeAction(
  action: Action<AbstractTarget>,
  source: "player" | "enemy",
  thisStatus?: StatusTarget,
): Action<ConcreteTarget> {
  switch (action.tag) {
    case "Cost": // fallthrough
    case "Death": // fallthrough
    case "AddStatus": // fallthrough
    case "EndTurn": // fallthrough
    case "ChangeShield":
      return { ...action, target: concretizeTarget(action.target, source, thisStatus) };
    case "Regen": // fallthrough
    case "Damage":
      return { ...action, target: concretizeTarget(action.target, source, thisStatus), value: concretizeVar(action.value, source) };
    case "RemoveStatus":
      return { ...action, target: concretizeTarget(action.target, source, thisStatus), amount: concretizeVar(action.amount, source) };
    case "Conditional":
      return {
        ...action,
        cond: concretizeVar(action.cond, source),
        actionThen: concretizeAction(action.actionThen, source, thisStatus),
        actionElse: concretizeAction(action.actionElse, source, thisStatus),
      };
    case "StoreVar":
      return {
        ...action,
        v: concretizeVar(action.v, source),
      };
    default: return action;
  }
}