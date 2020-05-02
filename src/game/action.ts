import * as lo from "lodash";
import { GameState, findStatus } from "./state";
import { Anim, Noop, mkEff, Par, Seq, TweenTo, mkAccessTarget, mkParticle } from "../app/animation";
import { Display } from "./display";
import { updateResourceAnim, newEntityAnim, changeShieldAnim, statusAmount, updateEntityStatusDisplay, removeStatusAnim, damageStatusAnim, sizeUsed, resourceMaxField, StateStatus, StateTrigger } from "./entity";
import { barLocation, newLayoutAnim, changeLayoutNode } from "./layout";
import { Cache } from "../app/main";
import { Action, Death, Regen, Lower } from "./definitions/action";
import { allEnemies } from "./enemy";
import { applyStatuses, statusExpl } from "./status";
import { ConcreteTarget, EnemyTarget, StatusTarget, AbstractTarget, PlayerTarget } from "./definitions/target";
import { targetToEntity, targetToEntityDisplay, targetExpl, concretizeTarget } from "./target";
import { updateGemText } from "../craft/card";
import { evalVar, concretizeVar, varExpl } from "./var";
import { SideExpl, StatusExpl, varIdToVarName, nextVarId, VarExpl } from "./nodeExpl"
import { evalTriggerCondition } from "./trigger";
import { ResourceType } from "./types";
import { indexInDir } from "./dir";
import { ActionInQueue } from "./definitions/phase";
import { mkAbility } from "./definitions/ability";
import * as V from "./definitions/var";

export function applyAction(
  action: Action<ConcreteTarget>,
  state: GameState,
  display: Display,
  cache: Cache,
  source: "player" | "enemy",
  indexSource: number | undefined,
): { animation: Anim, newActions: ActionInQueue[] } {
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
      } else if (action.target.tag === "StatusTarget") {
        const status = findStatus(state, action.target.id);
        if (status !== undefined) {
          // if a status is found on enemy, then it is not undefined
          const targetEntity = state[status.owner]!.entity;
          const varValue = evalVar(state, action.value, source);
          const newHp = Math.min(targetEntity.statuses[status.statusIndex].maxHp, targetEntity.statuses[status.statusIndex].hp + varValue);
          targetEntity.statuses[status.statusIndex].hp = newHp;
          const animation = damageStatusAnim(status, targetEntity, state, display, cache);
          let newActions: ActionInQueue[] = [];
          if (newHp <= 0) {
            newActions = [{ action: new Death(new StatusTarget(action.target.id)), indexSource }];
          }
          return { animation, newActions };
        } else {
          return { animation: new Noop(), newActions: [] };
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
      return {
        animation: new Noop(),
        newActions: [{
          action: new Lower(action.value, action.resource, action.target),
          indexSource,
        }],
      };
    }
    case "Cost": {
      return {
        animation: new Noop(),
        newActions: [{
          action: new Lower(action.value, action.resource, action.target),
          indexSource,
        }],
      };
    }
    case "Lower": {
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
          let newActions: ActionInQueue[] = [];
          if (
              action.target.tag === "EnemyTarget" &&
              (targetEntity.roh <= 0 || targetEntity.tah <= 0 || targetEntity.sie <= 0)
            ) {
              newActions = [{ action: new Death(new EnemyTarget()), indexSource }];
          }
          return { animation, newActions };
        }
      } else if (action.target.tag === "StatusTarget") {
        const status = findStatus(state, action.target.id);
        if (status !== undefined) {
          // if a status is found on enemy, then it is not undefined
          const targetEntity = state[status.owner]!.entity;
          const varValue = evalVar(state, action.value, source);
          const newHp = Math.max(0, targetEntity.statuses[status.statusIndex].hp - varValue);
          targetEntity.statuses[status.statusIndex].hp = newHp;
          const animation = damageStatusAnim(status, targetEntity, state, display, cache);
          let newActions: ActionInQueue[] = [];
          if (newHp <= 0) {
            newActions = [{ action: new Death(new StatusTarget(action.target.id)), indexSource }];
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
          // @ts-ignore
          const stateStatus: StateStatus | StateTrigger = { ...action.status, id, hp: action.status.startHp, owner: targetOwner };
          state.idCounter++;
          targetEntity.statuses.push(stateStatus);
          if (stateStatus.type === "Trigger") {
            const cond = action.status.type === "Status" ? false : evalTriggerCondition(stateStatus, state, targetOwner, new StatusTarget(id));
            // initialize condition field
            stateStatus.cond = cond;
          }
          const animation = mkEff({
            eff: () => {
              updateEntityStatusDisplay(targetEntity, targetEntityDisplay.statuses, cache);
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
            .map(x => { return { action: new Death(new StatusTarget(x.id)), indexSource } })
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
        return { animation: new Noop(), newActions: [{ action: action.actionThen, indexSource }] };
      } else {
        return { animation: new Noop(), newActions: [{ action: action.actionElse, indexSource }] };
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
    case "ClearVar": {
      delete state.variables[action.name];
      return { animation: new Noop(), newActions: [] };
    }
    case "ActionFrom": {
      if (indexSource === undefined) {
        throw "ActionFrom: undefined indexSource";
      }
      if (
        action.target.tag === "PlayerTarget" ||
        action.target.tag === "EnemyTarget"
      ) {
        const target = action.target.tag === "PlayerTarget" ? "player" : "enemy";
        const targetObj = state[target];
        if (targetObj !== undefined) {
          const layout = targetObj.layout;
          const curr = indexSource;
          const targetIndex = indexInDir(curr, action.from);
          if (targetIndex !== undefined) {
            const ability = layout.nodes[targetIndex];
            const actions = lo.cloneDeep(ability.ability.actions);
            const concrActions = actions.map(a => {
              // update index source to index target by actionFrom
              return { action: concretizeAction(a, source), indexSource: targetIndex };
            });
            return { animation: new Noop(), newActions: concrActions };
          }
        }
      }
      return { animation: new Noop(), newActions: [] };
    }
    case "ChangeTo": {
      if (
        action.target.tag === "PlayerTarget" ||
        action.target.tag === "EnemyTarget"
      ) {
        const target = action.target.tag === "PlayerTarget" ? "player" : "enemy";
        const targetObj = state[target];
        if (targetObj !== undefined) {
          const currIndex = targetObj.layout.currentIndex;
          // TODO: return animation instead of attaching immediately?
          changeLayoutNode(target, state, display, currIndex, mkAbility(action.name), cache);
          return { animation: new Noop(), newActions: [] };
        }
      }
      return { animation: new Noop(), newActions: [] };
    }
    case "RegenAllStatuses": {
      let newActions: ActionInQueue[] = [];
      newActions = newActions.concat(state.player.entity.statuses.map(x => {
        return {
          indexSource,
          action: new Regen(action.value, "essence", new StatusTarget(x.id))
        };
      }));
      if (state.enemy !== undefined) {
        newActions = newActions.concat(state.enemy.entity.statuses.map(x => {
          return {
            indexSource,
            action: new Regen(action.value, "essence", new StatusTarget(x.id))
          };
        }));
      }
      return { animation: new Noop(), newActions };
    }
    case "MoveDir": {
      if (
        action.target.tag === "PlayerTarget" ||
        action.target.tag === "EnemyTarget"
      ) {
        const target = action.target.tag === "PlayerTarget" ? "player" : "enemy";
        const targetObj = state[target];
        if (targetObj !== undefined) {
          const dir = action.dir;
          let newIndex = targetObj.layout.currentIndex + 1;
          const v = indexInDir(targetObj.layout.currentIndex, dir);
          if (v !== undefined) {
            newIndex = v;
          }
          targetObj.layout.currentIndex = newIndex;
          if (targetObj.layout.currentIndex >= targetObj.layout.nodes.length) {
            targetObj.layout.currentIndex = 0;
          }
        }
      }
      return { animation: new Noop(), newActions: [] };
    }
    case "GoTo": {
      if (
        action.target.tag === "PlayerTarget" ||
        action.target.tag === "EnemyTarget"
      ) {
        const target = action.target.tag === "PlayerTarget" ? "player" : "enemy";
        const targetObj = state[target];
        if (targetObj !== undefined) {
          targetObj.layout.currentIndex = action.i;
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
          let newActions: ActionInQueue[] = [];
          if (state.heal) {
            newActions = [
              { action: new Regen(new V.Constant(100), "roh", new PlayerTarget()), indexSource: undefined },
              { action: new Regen(new V.Constant(100), "tah", new PlayerTarget()), indexSource: undefined },
              { action: new Regen(new V.Constant(100), "sie", new PlayerTarget()), indexSource: undefined },
            ]
          }
          return { animation, newActions };
        }
      } else if (action.target.tag === "StatusTarget") {
        const status = findStatus(state, action.target.id);
        if (status !== undefined) {
          // if a status is found on enemy, then it is not undefined
          const targetEntity = state[status.owner]!.entity;
          targetEntity.statuses.splice(status.statusIndex, 1);
          const animation = removeStatusAnim(status, action.target.id, targetEntity, display, cache);
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
    case "Damage": {
      const varExpls = varExpl(action.value, variables);
      return {
        mainExpl: `damage ${varExpls.mainExpl} ${action.resource} to ${targetExpl(action.target)}`,
        sideExpl: varExpls.sideExpl,
        variables,
      };
    }
    case "Cost": {
      const varExpls = varExpl(action.value, variables);
      return {
        mainExpl: `cost ${varExpls.mainExpl} ${action.resource} to ${targetExpl(action.target)}}`,
        sideExpl: [],
        variables,
      }
    };
    case "Lower": return {
      mainExpl: `-${action.value} ${action.resource} to ${targetExpl(action.target)}}`,
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
    case "ClearVar": {
      return {
        mainExpl: undefined,
        sideExpl: [],
        variables,
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
    case "ActionFrom": return {
      mainExpl: `Action from ${action.from}`,
      sideExpl: [],
      variables,
    };
    case "RegenAllStatuses": {
      const valueExpl = varExpl(action.value, variables);
      return {
        mainExpl: `Regen ${valueExpl.mainExpl} to all statuses`,
        sideExpl: valueExpl.sideExpl,
        variables,
      }
    }
    case "MoveDir": {
      return {
        mainExpl: `${targetExpl(action.target)} move ${action.dir}`,
        sideExpl: [],
        variables,
      };
    }
    case "GoTo": {
      return {
        mainExpl: `${targetExpl(action.target)} goto ${action.i}`,
        sideExpl: [],
        variables,
      };
    }
    case "ChangeTo": return {
      mainExpl: `Change to ${action.name}`,
      sideExpl: [],
      variables,
    }
  }
}

export function concretizeAction(
  action: Action<AbstractTarget>,
  source: "player" | "enemy",
  thisStatus?: StatusTarget,
): Action<ConcreteTarget> {
  switch (action.tag) {
    case "Death": // fallthrough
    case "AddStatus": // fallthrough
    case "EndTurn": // fallthrough
    case "ActionFrom": // fallthrough
    case "ChangeTo": // fallthrough
    case "MoveDir": // fallthrough
    case "GoTo": // fallthrough
    case "ChangeShield":
      return { ...action, target: concretizeTarget(action.target, source, thisStatus) };
    case "Regen": // fallthrough
    case "Cost": // fallthrough
    case "Lower": // fallthrough
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
    case "RegenAllStatuses":
      return {
        ...action,
        value: concretizeVar(action.value, source),
      };
    default: return action;
  }
}