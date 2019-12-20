import { CacheValues } from "../app/main";
import { Ability } from "./definitions/ability";
import { Layout, playerInitialLayout } from "./layout";
import { Entity, playerInitialEntity } from "./entity";
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
  idCounter: number,
};

export function initializeState(state: GameState): void {
  state.player = {
    entity: playerInitialEntity(),
    layout: playerInitialLayout(),
    hotbar: initialHotbar(),
  };
  state.enemy = undefined;
  state.idCounter = 0;
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