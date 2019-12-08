import { Cache } from "../app/main";
import { ResourceType } from "./gameNode";
import { mkEff, Anim, Noop } from "../app/animation";

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

  if (entity === undefined) {
    container.visible = false;
  }

  parentContainer.addChild(container);

  return { container, rohBar, tahBar, sieBar };
}

export function newEntityAnim(
  entity: Entity | undefined,
  entityDisplay: EntityDisplay,
): Anim {
  return mkEff({
    eff: () => {
      if (entity !== undefined) {
        entityDisplay.container.visible = true;
        entityDisplay.rohBar.width = 100 * entity.roh / entity.maxRoh;
        entityDisplay.tahBar.width = 100 * entity.tah / entity.maxTah;
        entityDisplay.sieBar.width = 100 * entity.sie / entity.maxSie;
      } else {
        entityDisplay.container.visible = false;
      }
    },
    k: () => new Noop(),
  })
}

export function updateResourceDisplay(
  entity: Entity,
  display: EntityDisplay,
  resourceType: ResourceType,
): void {
  const resourceBar = resourceType + "bar" as keyof EntityDisplay;
  display[resourceBar].width = 100 * entity.roh / entity.maxRoh;
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