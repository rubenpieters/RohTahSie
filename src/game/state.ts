import { CacheValues } from "../app/main";
import { Ability } from "./definitions/ability";
import { Layout, playerInitialLayout } from "./layout";
import { Entity, playerInitialEntity, entityFindStatus } from "./entity";
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

export function findStatus(
  state: GameState,
  statusId: number,
): { statusIndex: number, owner: "player" | "enemy" } | undefined {
  const playerStatus = entityFindStatus(state.player.entity, statusId);
  if (playerStatus !== undefined) {
    // is in player statuses, return it
    return { statusIndex: playerStatus, owner: "player" };
  } else if (
    state.enemy !== undefined
  ) {
    // else look in enemy statuses
    const enemyStatus = entityFindStatus(state.player.entity, statusId);
    return enemyStatus === undefined ? undefined : { statusIndex: enemyStatus, owner: "enemy" };
  } else {
    // status is not found
    return undefined;
  }
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