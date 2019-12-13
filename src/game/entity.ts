import { Cache } from "../app/main";
import { ResourceType } from "./gameNode";
import { mkEff, Anim, Noop, TweenTo, mkAccessTarget, Par } from "../app/animation";

// resource display size configuration
/*
  <------------> fullSize
  <--> minSize
     <------> varSize
  |--|------|--|
   ^ always present
       ^ present depending on resource %
             ^ present when >= 100%
*/
const resourceFullSize = {
  roh: 119,
  tah: 121,
  sie: 103,
};

const resourceMinSize = {
  roh: 10,
  tah: 5,
  sie: 0,
};

const resourceVarSize = {
  roh: 99,
  tah: 90,
  sie: 83,
};

// TODO: use as const when TS is upgraded
const resourceVarField: {
  roh: "width",
  tah: "height",
  sie: "height",
} = {
  roh: "width",
  tah: "height",
  sie: "height",
};

const resourceVarAxis: {
  roh: "x",
  tah: "y",
  sie: "y",
} = {
  roh: "x",
  tah: "y",
  sie: "y",
};

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

  // initialize bgs
  const rohBg = new PIXI.Sprite(cache["portrait_roh"]);
  Object.assign(rohBg, { x: 14, y: 85, tint: 0x777777 });
  container.addChild(rohBg);
  const tahBg = new PIXI.Sprite(cache["portrait_tah"]);
  Object.assign(tahBg, { x: 13, y: 0, tint: 0x777777 });
  container.addChild(tahBg);
  const sieBg = new PIXI.Sprite(cache["portrait_sie"]);
  Object.assign(sieBg, { x: 43, y: 0, tint: 0x777777 });
  container.addChild(sieBg);

    // initialize bars with mask
  const rohBar = new PIXI.Sprite(cache["portrait_roh"]);
  const rohMask = new PIXI.Sprite(PIXI.Texture.WHITE);
  Object.assign(rohMask, { width: 0, height: 53 });
  Object.assign(rohBar, { x: 14, y: 85 });
  rohBar.mask = rohMask;
  rohBar.addChild(rohMask);
  container.addChild(rohBar);
  const tahBar = new PIXI.Sprite(cache["portrait_tah"]);
  const tahMask = new PIXI.Sprite(PIXI.Texture.WHITE);
  Object.assign(tahMask, { width: 57, height: 0 });
  Object.assign(tahBar, { x: 13, y: 0 });
  tahBar.mask = tahMask;
  tahBar.addChild(tahMask);
  container.addChild(tahBar);
  const sieBar = new PIXI.Sprite(cache["portrait_sie"]);
  const sieMask = new PIXI.Sprite(PIXI.Texture.WHITE);
  Object.assign(sieMask, { width: 95, height: 0 });
  Object.assign(sieBar, { x: 43, y: 0 });
  sieBar.mask = sieMask;
  sieBar.addChild(sieMask);
  container.addChild(sieBar);

  // initialize portrait bg
  const portraitBg = new PIXI.Sprite(cache["portrait"]);
  container.addChild(portraitBg);

  if (entity !== undefined) {
    rohMask.width = resourceMaskTargets("roh", entity).fieldTarget;
    tahMask.height = resourceMaskTargets("tah", entity).fieldTarget;
    const sieTargets = resourceMaskTargets("sie", entity);
    sieMask.height = sieTargets.fieldTarget;
    sieMask.y = sieTargets.axisTarget;
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
        entityDisplay.rohMask.width = resourceMaskTargets("roh", entity).fieldTarget;
        entityDisplay.tahMask.height = resourceMaskTargets("tah", entity).fieldTarget;
        const sieTargets = resourceMaskTargets("sie", entity);
        entityDisplay.sieMask.height = sieTargets.fieldTarget;
        entityDisplay.sieMask.y = sieTargets.axisTarget;
      } else {
        entityDisplay.container.visible = false;
      }
    },
    k: () => new Noop(),
  })
}

export function updateResourceAnim(
  entity: Entity,
  display: EntityDisplay,
  resourceType: ResourceType,
): Anim {
  const varField = resourceVarField[resourceType];
  const { fieldTarget, axisTarget } = resourceMaskTargets(resourceType, entity);
  const varAxis = resourceVarAxis[resourceType];
  const resourceBar = resourceMaskSprite(resourceType);
  return new Par([
    new TweenTo(0.1, fieldTarget, "absolute", mkAccessTarget(display[resourceBar], varField)),
    new TweenTo(0.1, axisTarget, "absolute", mkAccessTarget(display[resourceBar], varAxis)),
  ]);
}

function resourceMaxField<T extends ResourceType>(
  resourceType: T,
): { roh: "maxRoh", tah: "maxTah", sie: "maxSie" }[T] {
  // @ts-ignore
  return "max" + resourceType.charAt(0).toUpperCase() + resourceType.substring(1);
}

function resourceMaskSprite<T extends ResourceType>(
  resourceType: T,
): { roh: "rohMask", tah: "tahMask", sie: "sieMask" }[T] {
  // @ts-ignore
  return resourceType + "Mask";
}

function resourceMaskTargets(
  resourceType: ResourceType,
  entity: Entity,
): { fieldTarget: number, axisTarget: number } {
  const maxResource = resourceMaxField(resourceType);
  const percentage = entity[resourceType] / entity[maxResource];
  if (resourceType === "roh" || resourceType === "tah") {
    if (percentage >= 0.99) {
      return {
        fieldTarget: resourceFullSize[resourceType],
        axisTarget: 0,
      };
    }
    return {
      fieldTarget: resourceMinSize[resourceType] + resourceVarSize[resourceType] * percentage,
      axisTarget: 0,
    };
  } else {
    
    const maxResource = resourceMaxField(resourceType);
    const invPercentage = 1 - (entity[resourceType] / entity[maxResource]);
    if (invPercentage <= 0.01) {
      return {
        fieldTarget: resourceFullSize[resourceType],
        axisTarget: 0,
      };
    }
    const axisTarget = resourceMinSize[resourceType] + resourceVarSize[resourceType] * invPercentage;
    return {
      fieldTarget: resourceFullSize[resourceType] - axisTarget,
      axisTarget,
    };
  }
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