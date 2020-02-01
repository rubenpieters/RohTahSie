import { initializeEntity, playerInitialEntity } from "../game/entity";
import { Anim, TweenTo, runAnimation, mkAccessTarget, Seq, Par, Eff, mkEff, Noop } from "./animation";
import { playerInitialLayout, initializeLayout, barLocation } from "../game/layout";
import { GameState, initializeState } from "../game/state";
import { PixiFps } from "./fps";
import { Display, chargingAnimation, finalizingAnimation, applyingAnimation, transformingAnimation } from "../game/display";
import { Ability } from "../game/definitions/ability";
import { initializeHotbar } from "../game/hotbar";
import { initializeNodeExpl } from "../game/nodeExpl";
import { initializePools } from "./pool";
import { nextPhase } from "../game/phase";
import { initializeMenu } from "../menu/menu";
import { initializeCraftCards } from "../craft/card";
import { initializeZones } from "../zone/zone";

const WIDTH = 540;
const HEIGHT = 540;

const renderer = PIXI.autoDetectRenderer();

// TODO: experiment with nicer ways of scaling
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

window.addEventListener("load", load);
window.addEventListener("resize", resize);

let currentTime = new Date().getTime();
let prevTime = currentTime;
let deltaTime = 0;

export type Cache = typeof cache;
export type CacheValues = keyof Cache;

const cache = {
  "box": PIXI.Texture.from("assets/sprites/box.png"),
  "box2": PIXI.Texture.from("assets/sprites/box2.png"),
  "err": PIXI.Texture.from("assets/sprites/err.png"),
  "rune": PIXI.Texture.from("assets/sprites/rune.png"),
  "sword": PIXI.Texture.from("assets/sprites/sword.png"),
  "shield": PIXI.Texture.from("assets/sprites/shield.png"),
  "creep": PIXI.Texture.from("assets/sprites/creep.png"),
  "res_red": PIXI.Texture.from("assets/sprites/resource_red.png"),
  "res_gre": PIXI.Texture.from("assets/sprites/resource_green.png"),
  "res_yel": PIXI.Texture.from("assets/sprites/resource_yellow.png"),
  "bar_red": PIXI.Texture.from("assets/sprites/bar_red.png"),
  "bar_gre": PIXI.Texture.from("assets/sprites/bar_green.png"),
  "bar_yel": PIXI.Texture.from("assets/sprites/bar_yellow.png"),
  "bar": PIXI.Texture.from("assets/sprites/bar.png"),
  "portrait": PIXI.Texture.from("assets/sprites/portrait.png"),
  "portrait_inside": PIXI.Texture.from("assets/sprites/portrait_inside.png"),
  "portrait_roh": PIXI.Texture.from("assets/sprites/portrait_roh.png"),
  "portrait_tah": PIXI.Texture.from("assets/sprites/portrait_tah.png"),
  "portrait_sie": PIXI.Texture.from("assets/sprites/portrait_sie.png"),
  "bg": PIXI.Texture.from("assets/sprites/bg.jpg"),
  "node_expl_bg": PIXI.Texture.from("assets/sprites/node_expl_bg.png"),
  "skip": PIXI.Texture.from("assets/sprites/skip.png"),
  "shield_roh": PIXI.Texture.from("assets/sprites/shield_roh.png"),
  "shield_tah": PIXI.Texture.from("assets/sprites/shield_tah.png"),
  "shield_sie": PIXI.Texture.from("assets/sprites/shield_sie.png"),
  "status": PIXI.Texture.from("assets/sprites/status.png"),
  "menu_combat": PIXI.Texture.from("assets/sprites/menu_combat.png"),
  "menu_map": PIXI.Texture.from("assets/sprites/menu_map.png"),
  "menu_craft": PIXI.Texture.from("assets/sprites/menu_craft.png"),
  "menu_settings": PIXI.Texture.from("assets/sprites/menu_settings.png"),
  "refresh": PIXI.Texture.from("assets/sprites/refresh.png"),
  "gem": PIXI.Texture.from("assets/sprites/gem.png"),
  "hotbar_bg": PIXI.Texture.from("assets/sprites/hotbar_bg.png"),
  "status_slot": PIXI.Texture.from("assets/sprites/status_slot.png"),
  "status1": PIXI.Texture.from("assets/sprites/status1.png"),
  "ability1": PIXI.Texture.from("assets/sprites/ability1.png"),
  "ability_slot": PIXI.Texture.from("assets/sprites/ability_slot.png"),
  "card_bg": PIXI.Texture.from("assets/sprites/card_bg.png"),
  "card_name_bg": PIXI.Texture.from("assets/sprites/card_name_bg.png"),
};

let animations: Anim[] = [];
let explWindowAnimations: Anim[] = [];
let gameAnimations: Anim[] = [];

function load(): void {
  // TODO: create load screen with pixi loader https://pixijs.download/dev/docs/PIXI.Loader.html
  // add loading of cache in this loading part
  const loader = new PIXI.Loader();
  loader
    .add("test", "assets/fonts/test.fnt")
    .load(() => {
      console.log("loading done");
      main();
      resize();
    });
}

let app: PIXI.Application = undefined as any;
let appContainer: PIXI.Container = undefined as any;
let combatContainer: PIXI.Container = undefined as any;
let craftContainer: PIXI.Container = undefined as any;
let zoneContainer: PIXI.Container = undefined as any;

function main(): void {
  app = new PIXI.Application({ width: WIDTH, height: HEIGHT });
  document.body.appendChild(app.view);

  appContainer = new PIXI.Container();
  app.stage.addChild(appContainer);

  const bg = new PIXI.Sprite(cache["bg"]);
  Object.assign(bg, { width: WIDTH, height: HEIGHT });
  appContainer.addChild(bg);

  combatContainer = new PIXI.Container();
  appContainer.addChild(combatContainer);
  craftContainer = new PIXI.Container();
  craftContainer.visible = false;
  appContainer.addChild(craftContainer);
  zoneContainer = new PIXI.Container();
  zoneContainer.visible = false;
  appContainer.addChild(zoneContainer);

  const state: GameState = {} as GameState;
  initializeState(state);

  let display: Display = {} as Display;
  display.player = {
    entity: initializeEntity(state.player.entity, 40, 40, combatContainer, display, cache),
    layout: initializeLayout(state.player.layout, 50, 200, combatContainer, state, display, cache, "player"),
    hotbar: initializeHotbar(state.player.hotbar, 100, 455, combatContainer, state, display, cache),
    nodeExpl: undefined as any, // initialized later for z-index
  };
  display.enemy = {
    entity: initializeEntity(undefined, 270, 40, combatContainer, display, cache),
    layout: initializeLayout(undefined, 280, 200, combatContainer, state, display, cache, "enemy"),
  };
  display.pools = initializePools(combatContainer);
  display.player.nodeExpl = initializeNodeExpl(appContainer, cache);
  display.menu = initializeMenu(appContainer, cache, display, state);
  display.combatContainer = combatContainer;
  display.craftContainer = craftContainer;
  display.zoneContainer = zoneContainer;
  display.cardCraft = initializeCraftCards(craftContainer, state.cardCrafts, state, display, cache);
  display.zone = initializeZones(zoneContainer, state.zones, display, cache);

  // attach fps counter
  const fpsCounter = new PixiFps();
  appContainer.addChild(fpsCounter);

  // attach initial animation
  animatePhase(state, display, cache);

  window.requestAnimationFrame(update(state, display, cache));
}

function update(state: GameState, display: Display, cache: Cache): () => void {
  return () => {
    prevTime = currentTime;
    currentTime = new Date().getTime();
    deltaTime = (currentTime - prevTime) / 1000;
  
    let newAnims: Anim[] = [];
    animations.forEach(anim => {
      const result = runAnimation(deltaTime, anim);
      if (result.remainingAnim !== "nothing") {
        newAnims.push(result.remainingAnim);
      }
    });
    animations = newAnims;
  
    newAnims = [];
    explWindowAnimations.forEach(anim => {
      const result = runAnimation(deltaTime, anim);
      if (result.remainingAnim !== "nothing") {
        newAnims.push(result.remainingAnim);
      }
    });
    explWindowAnimations = newAnims;
  
    newAnims = [];
    gameAnimations.forEach(anim => {
      const result = runAnimation(deltaTime, anim);
      if (result.remainingAnim !== "nothing") {
        newAnims.push(result.remainingAnim);
      }
    });
    if (newAnims.length === 0) {
      state.phase = nextPhase(state);
      animatePhase(state, display, cache);
    } else {
      gameAnimations = newAnims;
    }
  
    requestAnimationFrame(update(state, display, cache));
  }
}

export function animatePhase(
  state: GameState,
  display: Display,
  cache: Cache,
): void {
  switch (state.phase.tag) {
    case "Charging": {
      gameAnimations = [chargingAnimation(state, display, cache)];
      break;
    }
    case "Activating": {
      if (state.phase.transformed) {
        // @ts-ignore state phase is Activating in this branch
        gameAnimations = [applyingAnimation(state, display, cache)]; 
      } else {
        // @ts-ignore state phase is Activating in this branch
        gameAnimations = [transformingAnimation(state, display, cache)]; 
      }
      break;
    }
    case "Finalizing": {
      gameAnimations = [finalizingAnimation(state, display, cache)];
      break;
    }
  }
}

export function attachAnimation(
  anim: Anim
): void {
  animations.push(anim);
}

export function attachExplWindowAnimation(
  anim: Anim
): void {
  explWindowAnimations.push(anim);
}

export function clearExplWindowAnimation(): void {
  explWindowAnimations = [];
}

function resize() {
  const ratio = Math.min(window.innerWidth / WIDTH, window.innerHeight / HEIGHT);

  if (app !== undefined) {
    app.renderer.resize(WIDTH * ratio, HEIGHT * ratio);
  }

  if (appContainer !== undefined) {
    appContainer.scale.x = ratio;
    appContainer.scale.y = ratio;
  }
}