import { Cache } from "../app/main";
import { ResourceType } from "./types";
import { TargetType } from "./definitions/target";
import { mkEff, Anim, Noop, TweenTo, mkAccessTarget, Par, Seq, Particle, mkParticle } from "../app/animation";
import { Display } from "./display";
import { Pool, mkPool } from "../app/pool";
import { Status } from "./definitions/status";
import { statusSprite } from "./status";

const statusAmountX = 3;
const statusAmountY = 5;
export const statusAmount = statusAmountX * statusAmountY;

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

export type StateStatus = Status & {
  id: number,
}

export type Entity = {
  roh: number,
  maxRoh: number,
  tah: number,
  maxTah: number,
  sie: number,
  maxSie: number,
  shield: ResourceType,
  dirty: boolean,
  statuses: StateStatus[],
}

export type EntityDisplay = {
  container: PIXI.Container,
  rohMask: PIXI.Sprite,
  tahMask: PIXI.Sprite,
  sieMask: PIXI.Sprite,
  rohBar: PIXI.Sprite,
  tahBar: PIXI.Sprite,
  sieBar: PIXI.Sprite,
  rohText: PIXI.BitmapText,
  tahText: PIXI.BitmapText,
  sieText: PIXI.BitmapText,
  shield: PIXI.Sprite,
  statusSprites: PIXI.Sprite[],
}

// initialize: a function which takes a display and initializes it on the PIXI app
export function initializeEntity(
  entity: Entity | undefined,
  x: number,
  y: number,
  parentContainer: PIXI.Container,
  display: Display,
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
  portraitBg.interactive = true;

  container.addChild(portraitBg);

  // initialize shield
  const shield = new PIXI.Sprite();
  container.addChild(shield);

  // initialize status icons
  let statusSprites: PIXI.Sprite[] = [];
  for (let i = 0; i < statusAmount; i++) {
    const statusSprite = new PIXI.Sprite();
    statusSprite.x = (i % statusAmountX) * 25 + 160;
    statusSprite.y = Math.floor(i / statusAmountX) * 25 + 15;
    statusSprite.pivot.set(12.5, 12.5);

    container.addChild(statusSprite);
    statusSprites.push(statusSprite);
  }

  // initialize resource text  
  const rohText = new PIXI.BitmapText("-", {
    font: {
      name: "Bahnschrift",
      size: 28,
    },
    align: "center",
    tint: 0x000000,
  });
  Object.assign(rohText, { x: 105, y: 100, visible: false });
  container.addChild(rohText);
  const tahText = new PIXI.BitmapText("-", {
    font: {
      name: "Bahnschrift",
      size: 28,
    },
    align: "center",
    tint: 0x000000,
  });
  Object.assign(tahText, { x: -25, y: 0, visible: false });
  container.addChild(tahText);
  const sieText = new PIXI.BitmapText("-", {
    font: {
      name: "Bahnschrift",
      size: 28,
    },
    align: "center",
    tint: 0x000000,
  });
  Object.assign(sieText, { x: 105, y: 0, visible: false });
  container.addChild(sieText);

  // portrait mouseover/out
  portraitBg.on("mouseover", () => {
    display.player.entity.rohText.visible = true;
    display.player.entity.tahText.visible = true;
    display.player.entity.sieText.visible = true;
    display.enemy.entity.rohText.visible = true;
    display.enemy.entity.tahText.visible = true;
    display.enemy.entity.sieText.visible = true;
  });
  portraitBg.on("mouseout", () => {
    display.player.entity.rohText.visible = false;
    display.player.entity.tahText.visible = false;
    display.player.entity.sieText.visible = false;
    display.enemy.entity.rohText.visible = false;
    display.enemy.entity.tahText.visible = false;
    display.enemy.entity.sieText.visible = false;
  });

  if (entity !== undefined) {
    rohMask.width = resourceMaskTargets("roh", entity).fieldTarget;
    tahMask.height = resourceMaskTargets("tah", entity).fieldTarget;
    const sieTargets = resourceMaskTargets("sie", entity);
    sieMask.height = sieTargets.fieldTarget;
    sieMask.y = sieTargets.axisTarget;
    rohText.text = `${entity.roh}\n(${entity.maxRoh})`;
    tahText.text = `${entity.tah}\n(${entity.maxTah})`;
    sieText.text = `${entity.sie}\n(${entity.maxSie})`;
    updateEntityShieldDisplay(entity, shield, cache);
    updateEntityStatusDisplay(entity, statusSprites, cache);
  }

  if (entity === undefined) {
    container.visible = false;
  }

  parentContainer.addChild(container);

  return {
    container, rohMask, tahMask, sieMask, rohBar, tahBar, sieBar,
    rohText, tahText, sieText,
    shield,
    statusSprites,
  };
}

export function entityFindStatus(
  entity: Entity,
  statusId: number,
): number | undefined {
  const statusIndex = entity.statuses.findIndex(x => x.id === statusId);
  return statusIndex === -1 ? undefined : statusIndex;
}

function updateEntityShieldDisplay(
  entity: Entity,
  shieldSprite: PIXI.Sprite,
  cache: Cache,
): void {
  const texture = resourceShieldTexture(entity.shield);
  shieldSprite.texture = cache[texture];
}

export function updateEntityStatusDisplay(
  entity: Entity,
  statusSprites: PIXI.Sprite[],
  cache: Cache,
) {
  for (let i = 0; i < statusAmount; i++) {
    const status: Status | undefined = entity.statuses[i];
    statusSprites[i].alpha = 1;
    if (status === undefined) {
      statusSprites[i].texture = PIXI.Texture.EMPTY;
    } else {
      statusSprites[i].texture = cache[statusSprite(status)];
    }
  }
}

export function newEntityAnim(
  entity: Entity | undefined,
  entityDisplay: EntityDisplay,
  cache: Cache,
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
        entityDisplay.rohText.text = `${entity.roh}\n(${entity.maxRoh})`;
        entityDisplay.tahText.text = `${entity.tah}\n(${entity.maxTah})`;
        entityDisplay.sieText.text = `${entity.sie}\n(${entity.maxSie})`;
        updateEntityShieldDisplay(entity, entityDisplay.shield, cache);
        updateEntityStatusDisplay(entity, entityDisplay.statusSprites, cache);
        entity.dirty = true;
      } else {
        entityDisplay.container.visible = false;
      }
    },
    k: () => new Noop(),
  });
}

export function updateResourceAnim(
  entity: Entity,
  display: Display,
  resourceType: ResourceType,
  target: "player" | "enemy",
  text: string,
): Anim {
  const entityDisplay = display[target].entity;
  const varField = resourceVarField[resourceType];
  const { fieldTarget, axisTarget } = resourceMaskTargets(resourceType, entity);
  const varAxis = resourceVarAxis[resourceType];
  const resourceBar = resourceMaskSprite(resourceType);
  const textParticleX = target === "player" ? 90 : 320;
  const textParticleY = 110;
  const textParticleTint = resourceTint(resourceType);
  return new Seq([
    mkEff({
      eff: () => {
        entityDisplay.rohText.text = `${entity.roh}\n(${entity.maxRoh})`;
        entityDisplay.tahText.text = `${entity.tah}\n(${entity.maxTah})`;
        entityDisplay.sieText.text = `${entity.sie}\n(${entity.maxSie})`;
      },
      k: () => new Noop(),
    }),
    new Par([
      new TweenTo(0.5, fieldTarget, "absolute", mkAccessTarget(entityDisplay[resourceBar], varField)),
      new TweenTo(0.5, axisTarget, "absolute", mkAccessTarget(entityDisplay[resourceBar], varAxis)),
      mkParticle({
        animation: (particle) => {
          return new TweenTo(0.5, textParticleY - 25, "absolute", mkAccessTarget(particle, "y"));
        },
        pool: display.pools.textParticlePool,
        props: { text, x: textParticleX, y: textParticleY, tint: textParticleTint },
      }),
    ]),
  ]);
}

export function changeShieldAnim(
  entityDisplay: EntityDisplay,
  target: TargetType,
  newShieldType: ResourceType,
  cache: Cache,
) {
  return new Seq([
    new TweenTo(0.25, 0, "absolute", mkAccessTarget(entityDisplay.shield, "alpha")),
    mkEff({
      eff: () => entityDisplay.shield.texture = cache[resourceShieldTexture(newShieldType)],
      k: () => new Noop(),
    }),
    new TweenTo(0.25, 1, "absolute", mkAccessTarget(entityDisplay.shield, "alpha")),
  ])
}

export function removeStatusAnim(
  entity: Entity,
  entityDisplay: EntityDisplay,
  statusId: number,
  cache: Cache,
) {
  return new Seq([
    new TweenTo(0.25, 0, "absolute", mkAccessTarget(entityDisplay.statusSprites[statusId], "alpha")),
    mkEff({
      eff: () => {
        entity.statuses.splice(statusId, 1);
        updateEntityStatusDisplay(entity, entityDisplay.statusSprites, cache);
      },
      k: () => new Noop(),
    }),
  ]);
}

function resourceTint(
  resourceType: ResourceType
) {
  switch (resourceType) {
    case "roh": return 0xDC143C;
    case "tah": return 0x32CD32;
    case "sie": return 0xFFFF66;
  }
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

function resourceShieldTexture<T extends ResourceType>(
  resourceType: T,
): { roh: "shield_roh", tah: "shield_tah", sie: "shield_sie" }[T] {
  // @ts-ignore
  return "shield_" + resourceType;
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
    shield: "roh",
    dirty: false,
    statuses: [],
  };
}