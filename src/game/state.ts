import { CacheValues } from "../app/main";
import { Ability } from "./definitions/ability";
import { Layout, playerInitialLayout } from "./layout";
import { Entity, playerInitialEntity, entityFindStatus, StateStatus, StateTrigger } from "./entity";
import { Hotbar, calcHotbar } from "./hotbar";
import { GamePhase, Charging, Waiting } from "./definitions/phase";
import { MenuType } from "../menu/menu";
import { CardCrafts, allCardCrafts, DirCrafts, allDirCrafts, ConditionCrafts, allConditionCrafts } from "../craft/all";
import { Zones, allZones } from "../zone/all";
import { EnemyKey } from "./enemy";
import { StatusCA } from "./definitions/status";
import { effect1 } from "./definitions/effect";

export type MenuState = {
  menuSelected: MenuType,
}

export type GameStateBase = {
  player: {
    entity: Entity,
    layout: Layout,
    hotbar: Hotbar,
    effects: StatusCA[],
  },
  enemy: {
    entity: Entity,
    layout: Layout,
    reward: number,
  } | undefined,
  initiate: EnemyKey[] | undefined,
  continuous: boolean,
  heal: boolean,
  random: boolean,
  idCounter: number,
  menuState: MenuState,
  cardCrafts: CardCrafts,
  condCrafts: ConditionCrafts,
  dirCrafts: DirCrafts,
  gems: number,
  zones: Zones,
  variables: { [K in string]: { v: number, count: number } },
};

export type GameState = GameStateBase & {
  phase: GamePhase,
};

export function initializeState(state: GameState): void {
  state.cardCrafts = allCardCrafts();
  state.dirCrafts = allDirCrafts();
  state.condCrafts = allConditionCrafts();
  state.zones = allZones();
  state.player = {
    entity: playerInitialEntity(),
    layout: playerInitialLayout(),
    hotbar: calcHotbar(state.cardCrafts, state.zones),
    effects: [
      effect1,
    ],
  };
  state.enemy = undefined;
  state.idCounter = 0;
  state.phase = new Waiting();
  state.menuState = { menuSelected: "combat" };
  state.gems = 0;
  state.variables = {};
  state.continuous = false;
  state.heal = true;
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
    const enemyStatus = entityFindStatus(state.enemy.entity, statusId);
    return enemyStatus === undefined ? undefined : { statusIndex: enemyStatus, owner: "enemy" };
  } else {
    // status is not found
    return undefined;
  }
}

export function getStatus(
  state: GameState,
  statusId: number,
): StateStatus | StateTrigger | undefined {
  const result = findStatus(state, statusId);
  if (result !== undefined) {
    const { statusIndex, owner } = result;
    const ownerObj = state[owner];
    if (ownerObj !== undefined) {
      return ownerObj.entity.statuses[statusIndex];
    }
  }
  return undefined;
}