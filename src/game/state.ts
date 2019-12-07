import { CacheValues, Cache } from "../app/main";
import { allEnemies } from "./enemy";
import * as lo from "lodash";
import { GameNode } from "./gameNode";
import { Layout, newLayoutAnim, barLocation } from "./layout";
import { Entity, updateResourceDisplay, EntityDisplay, newEntityAnim } from "./entity";
import { Anim, TweenTo, mkAnimTarget, mkAccessTarget, Noop, mkEff, Par } from "../app/animation";
import { Display } from "./display";
import { Hotbar } from "./hotbar";

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

/*
export type GameState = {
  nodeIndex: number,
  timeInNode: number,
  layout: Layout,
  runes: any,
  templates: GameNode[],
  currentEnemy: Enemy | undefined,
};

export function advanceState(
  state: GameState,
  delta: number,
) {
  let newTimeInNode = state.timeInNode + delta;
  // TODO: need to take into account nodes with larger size
  let activationThreshold = 100; // state.layout[state.nodeIndex].size * 100;
  while (newTimeInNode > activationThreshold) {
    // activate node
    activateNode(state.layout[state.nodeIndex], state);
    if (state.currentEnemy !== undefined) {
      activateNode(state.currentEnemy.layout[state.nodeIndex], state);
    }
    // update node index
    state.nodeIndex = state.nodeIndex + state.layout[state.nodeIndex].size;
    if (state.nodeIndex >= 14) state.nodeIndex -= 14 * (Math.floor(state.nodeIndex / 14));
    // calculate new threshold and update new time in node
    activationThreshold = state.layout[state.nodeIndex].size * 100;
    newTimeInNode = newTimeInNode - activationThreshold;
  }
  state.timeInNode = newTimeInNode;
}
*/

export function activateNode(
  node: GameNode,
  state: GameState,
): void {
  switch (node.tag) {
    case "GenerateNode": {
      if (state.player.entity[node.resource] < 100) {
        state.player.entity[node.resource] += 10;
      }
      break;
    }
    case "SummonNode": {
      state.enemy = lo.cloneDeep(allEnemies[node.enemyId]);
      break;
    }
    case "AttackNode": {
      if (node.target === "enemy") {
        /*if (state.currentEnemy !== undefined) {
          state.currentEnemy.red = Math.max(0, state.currentEnemy.red - node.damage);
          if (state.currentEnemy.red <= 0) {
            state.currentEnemy = undefined;
          }
        }*/
      } else if (node.target === "player") {
        // TODO: implement
      }
      break;
    }
    case "Empty": {
      break;
    }
  }
}

export function activateNodeAnim(
  node: GameNode,
  state: GameState,
  display: Display,
  cache: Cache,
): Anim {
  switch (node.tag) {
    case "GenerateNode": {
      const maxResource = "max" + node.resource.charAt(0).toUpperCase() + node.resource.substring(1) as keyof Entity;
      const targetValue = 100 * state.player.entity[node.resource] / state.player.entity[maxResource];
      const resourceBar = node.resource + "Bar" as keyof EntityDisplay;
      return new TweenTo(0.1, targetValue, "absolute", mkAccessTarget(display.player.entity[resourceBar], "width"));
    }
    case "SummonNode": {
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
            newLayoutAnim(state.enemy!.layout, display.enemy.layout, cache),
            newEntityAnim(state.enemy!.entity, display.enemy.entity),
          ]);
        },
      });
    }
    default: return new Noop();
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