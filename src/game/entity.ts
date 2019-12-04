import { Cache } from "../app/main";

export type Entity = {
  roh: number,
  maxRoh: number,
  tah: number,
  maxTah: number,
  sie: number,
  maxSie: number,
}

export type EntityDisplay = {
  container: PIXI.Container,
  rohBar: PIXI.Sprite,
  tahBar: PIXI.Sprite,
  sieBar: PIXI.Sprite,
}

// initialize: a function which takes a display and initialiezes it on the PIXI app
export function initializeEntity(
  entity: Entity | undefined,
  x: number,
  y: number,
  parentContainer: PIXI.Container,
  cache: Cache,
): EntityDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x, y });

  const rohBar = new PIXI.Sprite(cache["bar_red"]);
  const tahBar = new PIXI.Sprite(cache["bar_gre"]);
  const sieBar = new PIXI.Sprite(cache["bar_yel"]);
  Object.assign(rohBar, { x: 0, y: 0, width: 0, height: 25 });
  container.addChild(rohBar);
  Object.assign(tahBar, { x: 0, y: 25, width: 0, height: 25 });
  container.addChild(tahBar);
  Object.assign(sieBar, { x: 0, y: 50, width: 0, height: 25 });
  container.addChild(sieBar);

  if (entity !== undefined) {
    rohBar.width = 100 * entity.roh / entity.maxRoh;
    tahBar.width = 100 * entity.tah / entity.maxTah;
    sieBar.width = 100 * entity.sie / entity.maxSie;
  }

  parentContainer.addChild(container);

  return { container, rohBar, tahBar, sieBar };
}


// update the model and display
export function updateRoh(
  entity: Entity,
  display: EntityDisplay,
  newValue: number,
): void {
  entity.roh = newValue;
  display.rohBar.width = 100 * entity.roh / entity.maxRoh;
}

export function playerInitialEntity(): Entity {
  return {
    roh: 50,
    maxRoh: 100,
    tah: 50,
    maxTah: 100,
    sie: 50,
    maxSie: 100,
  };
}