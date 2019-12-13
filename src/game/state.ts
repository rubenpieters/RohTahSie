import { CacheValues, Cache } from "../app/main";
import { allEnemies } from "./enemy";
import * as lo from "lodash";
import { GameNode } from "./gameNode";
import { Layout, newLayoutAnim, barLocation, playerInitialLayout } from "./layout";
import { Entity, updateResourceAnim, EntityDisplay, newEntityAnim, playerInitialEntity } from "./entity";
import { Anim, TweenTo, mkAnimTarget, mkAccessTarget, Noop, mkEff, Par, Seq } from "../app/animation";
import { Display } from "./display";
import { Hotbar, initialHotbar } from "./hotbar";

export type GameState = {
  player: {
    entity: Entity,
    layout: Layout,
    hotbar: Hotbar,
  },
  enemy: {
    entity: Entity,
    layout: Layout,
  } | undefined,
};

export function initializeState(state: GameState): void {
  state.player = {
    entity: playerInitialEntity(),
    layout: playerInitialLayout(),
    hotbar: initialHotbar(),
  };
  state.enemy = undefined;
}

export function activateNode(
  node: GameNode,
  state: GameState,
  display: Display,
  cache: Cache,
): Anim {
  switch (node.tag) {
    case "GenerateNode": {
      const target = node.target === "enemy" ? state.enemy : state.player;
      if (target !== undefined) {
        if (target.entity[node.resource] < 100) {
          target.entity[node.resource] = Math.min(100, state.player.entity[node.resource] + node.value);
        }
        // increase resource animation
        return updateResourceAnim(target.entity, display[node.target].entity, node.resource);
      }
      return new Noop();
    }
    case "SummonNode": {
      state.enemy = lo.cloneDeep(allEnemies[node.enemyId]);
      // summon enemy animation
      return mkEff({
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
            newEntityAnim(state.enemy === undefined ? undefined : state.enemy.entity, display.enemy.entity),
          ]);
        },
      });
    }
    case "AttackNode": {
      const target = node.target === "enemy" ? state.enemy : state.player;
      if (target !== undefined) {
        target.entity[node.resource] = Math.max(0, target.entity[node.resource] - node.damage);
        // decrease resource animation
        const decResourceAnim = updateResourceAnim(target.entity, display[node.target].entity, node.resource);
        if (node.target === "enemy" && target.entity[node.resource] <= 0) {
          state.enemy = undefined;
          // enemy death animation
          const dieAnim: Anim = mkEff({ eff: () => {
            display.enemy.layout.container.visible = false;
            display.enemy.entity.container.visible = false;
          }, k: () => new Noop () });
          return new Seq([
            decResourceAnim,
            dieAnim,
          ]);
        }
        return decResourceAnim;
      }
      return new Noop();
    }
    case "Empty": {
      return new Noop();
    }
  }
}

export function nodeSprite(
  node: GameNode,
): CacheValues {
  switch (node.tag) {
    case "GenerateNode": {
      switch (node.resource) {
        case "roh": return "res_red";
        case "tah": return "res_gre";
        case "sie": return "res_yel";
      }
      throw "impossible";
    }
    case "SummonNode": {
      return "creep";
    }
    case "AttackNode": {
      return "sword";
    }
    case "Empty": {
      return "err";
    }
  }
}