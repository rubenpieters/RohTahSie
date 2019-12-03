import { newEntity, initializeEntity, updateRoh, EntityDisplay, Entity } from "../shared/entity";
import { Anim, TweenTo, mkAnimTarget, runAnimation, mkAccessTarget, Seq, Par } from "./animation";
import { playerInitialLayout, initializeLayout, Layout, LayoutDisplay } from "../shared/layout";
import { GameState } from "../shared/game";

const renderer = PIXI.autoDetectRenderer();

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
};

let animations: Anim[] = [];

function main(): void {
  const app = new PIXI.Application({ width: 540, height: 540 });
  document.body.appendChild(app.view);

  const appContainer = new PIXI.Container();
  app.stage.addChild(appContainer);

  const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
  Object.assign(bg, { width: 540, height: 540, tint: 0x00d3ff });
  appContainer.addChild(bg);

  const state: GameState = {
    player: {
      entity: newEntity(100, 100, 100),
      layout: playerInitialLayout(),
    }
  };

  const display = {
    player: {
      entity: initializeEntity(state.player.entity, 50, 50, appContainer, cache),
      layout: initializeLayout(state.player.layout, 50, 150, appContainer, cache),
    }
  };

  // attach initial animation
  animations = [
    new Seq([
      new TweenTo(1, mkAccessTarget(display.player.layout.bar, "x", display.player.layout.bar.x + 50)),
      new Par([
        new TweenTo(0.5, mkAccessTarget(display.player.layout.bar.scale, "x", 2)),
        new TweenTo(0.5, mkAccessTarget(display.player.layout.bar.scale, "y", 2)),
        new TweenTo(0.5, mkAccessTarget(display.player.layout.bar, "alpha", 0)),
      ]),
    ]),
  ];

  window.requestAnimationFrame(update(state, display));
}

function update(state: GameState, display: { player: { entity: EntityDisplay, layout: LayoutDisplay } }): () => void {
  return () => {
    prevTime = currentTime;
    currentTime = new Date().getTime();
    deltaTime = (currentTime - prevTime) / 1000;
  
    // updateRoh(state.entity, display.entity, deltaTime % 2 === 0 ? 50 : 100);
    const newAnims: Anim[] = [];
    animations.forEach(anim => {
      const result = runAnimation(deltaTime, anim);
      if (result.remainingAnim !== "nothing") {
        newAnims.push(result.remainingAnim);
      }
    });
    animations = newAnims;
  
    requestAnimationFrame(update(state, display));
  }
}