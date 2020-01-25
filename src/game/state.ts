import { CacheValues } from "../app/main";
import { Ability } from "./definitions/ability";
import { Layout, playerInitialLayout } from "./layout";
import { Entity, playerInitialEntity, entityFindStatus } from "./entity";
import { Hotbar, calcHotbar } from "./hotbar";
import { GamePhase, Charging } from "./definitions/phase";
import { MenuType } from "../menu/menu";
import { CardCrafts, allCardCrafts } from "../craft/all";
import { Zones, allZones } from "../zone/all";

export type MenuState = {
  menuSelected: MenuType,
}

export type GameStateBase = {
  player: {
    entity: Entity,
    layout: Layout,
    hotbar: Hotbar,
  },
  enemy: {
    entity: Entity,
    layout: Layout,
    reward: number,
  } | undefined,
  idCounter: number,
  menuState: MenuState,
  cardCrafts: CardCrafts,
  gems: number,
  zones: Zones,
};

export type GameState = GameStateBase & {
  phase: GamePhase,
};

export function initializeState(state: GameState): void {
  state.cardCrafts = allCardCrafts();
  state.zones = allZones();
  state.player = {
    entity: playerInitialEntity(),
    layout: playerInitialLayout(),
    hotbar: calcHotbar(state.cardCrafts, state.zones),
  };
  state.enemy = undefined;
  state.idCounter = 0;
  state.phase = new Charging();
  state.menuState = { menuSelected: "combat" };
  state.gems = 0;
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
  ability: Ability,
): CacheValues {
  switch (ability.name) {
    case "Rest": return "res_red";
    case "Meditation": return "res_gre";
    case "Requiem": return "res_yel";
    case "Discussion": return "sword";
    case "Dormant": return "skip";
    case "Initiate": return "creep";
    case "Demon": return "ability1";
  }
}