import { Display } from "../game/display";
import { Cache } from "../app/main";
import { Zones } from "./all";
import { GameState } from "../game/state";
import { changePlayerLayoutNode } from "../game/layout"
import { Initiate } from "../game/definitions/ability";
import { transitionScreen } from "../menu/menu";

const maxZoneX = 5;

export type ZoneDisplay = {
  zoneContainer: PIXI.Container,
  bg: PIXI.Sprite,
}

export type ZoneOverviewDisplay = {
  container: PIXI.Container,
  zones: ZoneDisplay[],
  initiateBtn: PIXI.Sprite,
  continuousBtn: PIXI.Sprite,
}

export function initializeZones(
  parentContainer: PIXI.Container,
  state: GameState,
  display: Display,
  cache: Cache,
): ZoneOverviewDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x: 0, y: 80 });

  // initialize icons
  let zones: ZoneDisplay[] = [];
  for (let i = 0; i < state.zones.length; i++) {
    const row = Math.floor(i % maxZoneX);
    const col = Math.floor(i / maxZoneX);
    const zone = state.zones[i];
    const zoneContainer = new PIXI.Container();
    zoneContainer.interactive = true;
    zoneContainer.on("pointerdown", changeZoneSelected(i, state.zones, display));
    zoneContainer.width = 60;
    zoneContainer.height = 75;

    const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
    bg.tint = 0x00AAAA;
    bg.x = col * 60 + 45;
    bg.y = row * 100 + 50;
    bg.width = 50;
    bg.height = 75;

    zoneContainer.addChild(bg);
    container.addChild(zoneContainer);
    zones.push({ zoneContainer, bg });
  }

  updateZoneSelected(state.zones, zones);

  const initiateBtn = new PIXI.Sprite(cache["refresh"]);
  initiateBtn.x = 400;
  initiateBtn.y = 42.5;
  container.addChild(initiateBtn);

  initiateBtn.interactive = true;
  initiateBtn.on("pointerdown", () => initiateBattle(state, display, cache));

  const continuousBtn = new PIXI.Sprite(PIXI.Texture.WHITE);
  continuousBtn.width = 50;
  continuousBtn.height = 50;
  continuousBtn.tint = 0x00AAAA;
  continuousBtn.x = 400;
  continuousBtn.y = 100;
  container.addChild(continuousBtn);

  continuousBtn.interactive = true;
  continuousBtn.on("pointerdown", () => changeContinuous(state, display));

  parentContainer.addChild(container);

  return { container, zones, initiateBtn, continuousBtn };
}

function updateZoneSelected(
  zones: Zones,
  zoneDisplay: ZoneDisplay[],
) {
  for (let i = 0; i < zones.length; i++) {
    const zone = zones[i];
    const selected = zone.selected;
    if (selected) {
      zoneDisplay[i].bg.tint = 0x00CC11;
    } else {
      zoneDisplay[i].bg.tint = 0x00AAAA;
    }
  }
}

function changeZoneSelected(
  i: number,
  zones: Zones,
  display: Display,
): () => void {
  return () => {
    zones.forEach(zone => {
      zone.selected = false;
    });
    zones[i].selected = true;
    updateZoneSelected(zones, display.zone.zones);
  }
}

function initiateBattle(
  state: GameState,
  display: Display,
  cache: Cache,
) {
  const selectedZone = state.zones.find(x => x.selected === true);
  // TODO: fixme
  const ability = new Initiate(selectedZone!.enemyIds[0]);
  state.initiate = ability;
  transitionScreen("combat", display, state)();
}

function changeContinuous(
  state: GameState,
  display: Display,
) {
  switch (state.continuous) {
    case false: {
      display.zone.continuousBtn.tint = 0x00CC11;
      state.initiate = undefined;
      break;
    }
    case true: {
      display.zone.continuousBtn.tint = 0x00AAAA;
      break;
    }
  }
  state.continuous = ! state.continuous;
}