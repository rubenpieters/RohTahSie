import { Display } from "../game/display";
import { Cache } from "../app/main";
import { Zones } from "./all";

const maxZoneX = 5;

export type ZoneDisplay = {
  zoneContainer: PIXI.Container,
  bg: PIXI.Sprite,
}

export type ZoneOverviewDisplay = {
  container: PIXI.Container,
  zones: ZoneDisplay[],
}

export function initializeZones(
  parentContainer: PIXI.Container,
  allZones: Zones,
  display: Display,
  cache: Cache,
): ZoneOverviewDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x: 0, y: 80 });

  // initialize icons
  let zones: ZoneDisplay[] = [];
  for (let i = 0; i < allZones.length; i++) {
    const row = Math.floor(i % maxZoneX);
    const col = Math.floor(i / maxZoneX);
    const zone = allZones[i];
    const zoneContainer = new PIXI.Container();
    zoneContainer.interactive = true;
    zoneContainer.on("pointerdown", changeZoneSelected(i, allZones, display));
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

  updateZoneSelected(allZones, zones);

  parentContainer.addChild(container);

  return { container, zones };
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