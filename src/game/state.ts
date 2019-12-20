import * as lo from "lodash";
import { CacheValues, Cache } from "../app/main";
import { allEnemies } from "./enemy";
import { Ability } from "./definitions/ability";
import { Layout, newLayoutAnim, barLocation, playerInitialLayout } from "./layout";
import { Entity, updateResourceAnim, EntityDisplay, newEntityAnim, playerInitialEntity, changeShieldAnim } from "./entity";
import { Anim, TweenTo, mkAnimTarget, mkAccessTarget, Noop, mkEff, Par, Seq } from "../app/animation";
import { Display } from "./display";
import { Hotbar, initialHotbar } from "./hotbar";
import { Action, Death } from "./definitions/action";

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

export function nodeSprite(
  node: Ability,
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
    case "ShieldNode": {
      return "shield";
    }
    case "AddArmor": {
      return "shield";
    }
    case "Empty": {
      return "skip";
    }
  }
}