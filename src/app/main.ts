import { initializeEntity, playerInitialEntity } from "../game/entity";
import { Anim, TweenTo, runAnimation, mkAccessTarget, Seq, Par, Eff, mkEff, Noop } from "./animation";
import { playerInitialLayout, initializeLayout, barLocation } from "../game/layout";
import { GameState, initializeState } from "../game/state";
import { PixiFps } from "./fps";
import { Display, gameLoopAnimation } from "../game/display";
import { GameNode } from "../game/gameNode";
import { initialHotbar, initializeHotbar } from "../game/hotbar";
import { initializeNodeExpl } from "../game/nodeExpl";

const renderer = PIXI.autoDetectRenderer();

// TODO: experiment with nicer ways of scaling
PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

window.addEventListener("load", main);

let currentTime = new Date().getTime();
let prevTime = currentTime;
let deltaTime = 0;

export type Cache = typeof cache;
export type CacheValues = keyof Cache;

// TODO: create load screen with pixi loader https://pixijs.download/dev/docs/PIXI.Loader.html
// add loading of cache in this loading part

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
  "portrait_roh": PIXI.Texture.from("assets/sprites/portrait_roh.png"),
  "portrait_tah": PIXI.Texture.from("assets/sprites/portrait_tah.png"),
  "portrait_sie": PIXI.Texture.from("assets/sprites/portrait_sie.png"),
  "bg": PIXI.Texture.from("assets/sprites/bg.jpg"),
  "node_expl_bg": PIXI.Texture.from("assets/sprites/node_expl_bg.png"),
};

let animations: Anim[] = [];
let gameAnimations: Anim[] = [];
let gameLoopAnim: Anim;

function main(): void {
  const app = new PIXI.Application({ width: 540, height: 540 });
  document.body.appendChild(app.view);

  const appContainer = new PIXI.Container();
  app.stage.addChild(appContainer);

  const bg = new PIXI.Sprite(cache["bg"]);
  Object.assign(bg, { width: 540, height: 540 });
  appContainer.addChild(bg);

  const state: GameState = {} as GameState;
  initializeState(state);

  let display: Display = {} as Display;
  display.player = {
    entity: initializeEntity(state.player.entity, 20, 20, appContainer, cache),
    layout: initializeLayout(state.player.layout, 50, 200, appContainer, state, display, cache, "player"),
    hotbar: initializeHotbar(state.player.hotbar, 100, 480, appContainer, state, display, cache),
    nodeExpl: undefined as any,
  };
  display.enemy = {
    entity: initializeEntity(undefined, 300, 20, appContainer, cache),
    layout: initializeLayout(undefined, 320, 200, appContainer, state, display, cache, "enemy"),
  };
  display.player.nodeExpl = initializeNodeExpl(appContainer, cache);

  // attach initial animation
  gameLoopAnim = gameLoopAnimation(state, display, cache);
  gameAnimations = [gameLoopAnim];

  // attach fps counter
  const fpsCounter = new PixiFps();
  appContainer.addChild(fpsCounter);

  window.requestAnimationFrame(update(state, display));
}

function update(state: GameState, display: Display): () => void {
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
    gameAnimations.forEach(anim => {
      const result = runAnimation(deltaTime, anim);
      if (result.remainingAnim !== "nothing") {
        newAnims.push(result.remainingAnim);
      }
    });
    if (newAnims.length === 0) {
      gameAnimations = [gameLoopAnim];
    } else {
      gameAnimations = newAnims;
    }
  
    requestAnimationFrame(update(state, display));
  }
}

export function attachAnimation(
  anim: Anim
): void {
  animations.push(anim);
}