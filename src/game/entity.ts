import { Cache, attachAnimation } from "../app/main";
import { ResourceType } from "./types";
import { ConcreteTarget } from "./definitions/target";
import { mkEff, Anim, Noop, TweenTo, mkAccessTarget, Par, Seq, mkParticle } from "../app/animation";
import { Display } from "./display";
import { Status } from "./definitions/status";
import { statusSprite } from "./status";
import { Trigger } from "./definitions/trigger";
import { wrappedLayout } from "../layout/layout";
import { Sprite } from "pixi.js";
import { loadStStatusExpl, updateStStatusExpl, checkAndUpdateStStatusExpl, fadeStStatusExpl } from "./stStatusExpl";
import { GameState } from "./state";

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
} as const;

const resourceMinSize = {
  roh: 10,
  tah: 5,
  sie: 0,
} as const;

const resourceVarSize = {
  roh: 99,
  tah: 90,
  sie: 83,
} as const;

const resourceVarField = {
  roh: "width",
  tah: "height",
  sie: "height",
} as const;

const resourceVarAxis = {
  roh: "x",
  tah: "y",
  sie: "y",
} as const;

export type StateStatus = Status & {
  id: number,
  hp: number,
  owner: "player" | "enemy",
}

export type StateTrigger = Trigger & {
  id: number,
  hp: number,
  cond: boolean,
  owner: "player" | "enemy",
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
  statuses: (StateStatus | StateTrigger)[],
}

export type StatusDisplay = {
  container: PIXI.Container,
  sprite: PIXI.Sprite,
  hp: PIXI.Sprite,
  slot: PIXI.Sprite,
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
  statusBg: PIXI.Sprite,
  statuses: StatusDisplay[],
}

// initialize: a function which takes a display and initializes it on the PIXI app
export function initializeEntity(
  entity: Entity | undefined,
  x: number,
  y: number,
  parentContainer: PIXI.Container,
  state: GameState,
  display: Display,
  cache: Cache,
  type: "player" | "enemy",
): EntityDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x, y });

  // initialize portrait inside
  const portraitInside = new PIXI.Sprite(cache["portrait_inside"]);
  portraitInside.x = 18;
  portraitInside.y = 8;

  container.addChild(portraitInside);

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

  // initialize status bg
  const statusBg = new PIXI.Sprite(cache["status_bg"]);
  statusBg.x = 160 - 12.5;
  statusBg.y = 15 - 12.5;
  statusBg.alpha = 0.5;
  container.addChild(statusBg);

  // initialize status icons
  const statuses: StatusDisplay[] = wrappedLayout(
    container,
    i => {
      const statusContainer = new PIXI.Container();
      statusContainer.width = 30;
      statusContainer.height = 30;
      statusContainer.interactive = true;
      statusContainer.on("pointerdown", () => {
        attachAnimation(loadStStatusExpl(i, type, state, display.player.stStatusExpl));
      });
      
      return statusContainer;
    },
    statusContainer => {
      const statusSlotSprite = new PIXI.Sprite(cache["status_slot"]);
      statusContainer.addChild(statusSlotSprite);

      const statusSprite = new PIXI.Sprite();
      statusSprite.x = 12.5;
      statusSprite.y = 12.5;
      statusSprite.pivot.set(12.5, 12.5);
      statusContainer.addChild(statusSprite);

      const statusHpSprite = new PIXI.Sprite(PIXI.Texture.WHITE);
      statusHpSprite.tint = 0xFF0000;
      statusHpSprite.height = 5;
      statusHpSprite.tint = 0xFF0000;
      statusContainer.addChild(statusHpSprite);

      return { container: statusContainer, slot: statusSlotSprite, sprite: statusSprite, hp: statusHpSprite };
    },
    statusAmount,
    { orientation: "horizontal", spacing: { x: 25, y: 25 }, start: { x: 160 - 12.5, y: 15 - 12.5 }, wrappingLimit: 3, },
  );

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
    updateEntityStatusDisplay(entity, statuses, cache);
  }

  if (entity === undefined) {
    container.visible = false;
  }

  parentContainer.addChild(container);

  return {
    container, rohMask, tahMask, sieMask, rohBar, tahBar, sieBar,
    rohText, tahText, sieText,
    shield,
    statusBg, statuses,
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
  statusDisplay: StatusDisplay[],
  cache: Cache,
) {
  let sizeOffset = 0;
  for (let i = 0; i < statusAmount - sizeOffset; i++) {
    const status: StateStatus | StateTrigger | undefined = entity.statuses[i];
    statusDisplay[i + sizeOffset].sprite.alpha = 1;
    if (status === undefined) {
      statusDisplay[i + sizeOffset].sprite.texture = PIXI.Texture.EMPTY;
      statusDisplay[i + sizeOffset].hp.visible = false;
    } else {
      statusDisplay[i + sizeOffset].sprite.texture = cache[statusSprite(status)];
      statusDisplay[i + sizeOffset].hp.visible = true;
      statusDisplay[i + sizeOffset].hp.width = status.hp * 25 / status.maxHp;
      sizeOffset += status.size - 1;
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
        updateEntityStatusDisplay(entity, entityDisplay.statuses, cache);
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
  target: ConcreteTarget,
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

export function damageStatusAnim(
  status: { statusIndex: number, owner: "player" | "enemy" },
  entity: Entity,
  state: GameState,
  display: Display,
  cache: Cache,
) {
  const entityDisplay = display[status.owner].entity;
  return new Seq([
    // new TweenTo(0.25, 0, "absolute", mkAccessTarget(entityDisplay.statusSprites[status.statusIndex], "alpha")),
    mkEff({
      eff: () => {
        updateEntityStatusDisplay(entity, entityDisplay.statuses, cache);
        checkAndUpdateStStatusExpl(status.statusIndex, status.owner, state, display.player.stStatusExpl);
      },
      k: () => new Noop(),
    })
  ]);
}

export function removeStatusAnim(
  status: { statusIndex: number, owner: "player" | "enemy" },
  statusId: number,
  entity: Entity,
  display: Display,
  cache: Cache,
) {
  const entityDisplay = display[status.owner].entity;
  return new Seq([
    new TweenTo(0.25, 0, "absolute", mkAccessTarget(entityDisplay.statuses[status.statusIndex].sprite, "alpha")),
    mkEff({
      eff: () => {
        updateEntityStatusDisplay(entity, entityDisplay.statuses, cache);
        fadeStStatusExpl(statusId, display.player.stStatusExpl);
      },
      k: () => new Noop(),
    })
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

export function resourceMaxField<T extends ResourceType>(
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
    roh: 100,
    maxRoh: 100,
    tah: 100,
    maxTah: 100,
    sie: 100,
    maxSie: 100,
    shield: "roh",
    dirty: false,
    statuses: [],
  };
}

export function sizeUsed(
  entity: Entity,
): number {
  return entity.statuses
    .map(x => x.size)
    .reduce((prev, acc) => prev + acc, 0)
  ; 
}
