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
  rohMask: PIXI.Sprite,
  tahMask: PIXI.Sprite,
  sieMask: PIXI.Sprite,
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

  const rohBar = new PIXI.Sprite(cache["portrait_roh"]);
  const tahBar = new PIXI.Sprite(cache["portrait_tah"]);
  const sieBar = new PIXI.Sprite(cache["portrait_sie"]);

  const rohMask = new PIXI.Sprite(PIXI.Texture.WHITE);
  const tahMask = new PIXI.Sprite(PIXI.Texture.WHITE);
  const sieMask = new PIXI.Sprite(PIXI.Texture.WHITE);
  Object.assign(rohMask, { width: 0, height: 53 });
  Object.assign(rohBar, { x: 14, y: 85 });
  rohBar.mask = rohMask;
  rohBar.addChild(rohMask);
  container.addChild(rohBar);
  Object.assign(tahBar, { x: 13, y: 0 });
  container.addChild(tahBar);
  //Object.assign(sieBar, { x: 0, y: 50, width: 0, height: 25 });
  Object.assign(sieBar, { x: 43, y: 0 });
  container.addChild(sieBar);
  const portraitBg = new PIXI.Sprite(cache["portrait"]);
  container.addChild(portraitBg);

  if (entity !== undefined) {
    rohMask.width = 119 * entity.roh / entity.maxRoh;
    tahMask.width = 100 * entity.tah / entity.maxTah;
    sieMask.width = 100 * entity.sie / entity.maxSie;
  }

  if (entity === undefined) {
    container.visible = false;
  }

  parentContainer.addChild(container);

  return { container, rohMask, tahMask, sieMask, rohBar, tahBar, sieBar };
}

export function newEntityAnim(
  entity: Entity | undefined,
  entityDisplay: EntityDisplay,
): Anim {
  return mkEff({
    eff: () => {
      if (entity !== undefined) {
        entityDisplay.container.visible = true;
        entityDisplay.rohMask.width = 100 * entity.roh / entity.maxRoh;
        entityDisplay.tahMask.width = 100 * entity.tah / entity.maxTah;
        entityDisplay.sieMask.width = 100 * entity.sie / entity.maxSie;
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