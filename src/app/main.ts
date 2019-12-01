import { newEntity, initializeEntity, updateRoh, EntityDisplay, Entity } from "../shared/entity";
import { Anim, TweenTo, mkAnimTarget, runAnimation } from "./animation";

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

  const state = {
    entity: newEntity(100, 100, 100),
  };

  const display = {
    entity: initializeEntity(state.entity, 50, 50, appContainer, cache),
  };

  const box2 = new PIXI.Sprite(cache["res_red"]);
  box2.x = 50;
  box2.y = 500;
  box2.interactive = true;
  box2.on("mousedown", () => {
    console.log("test");
    animations.push(new TweenTo(1, mkAnimTarget(state.entity, 50, (e, v) => updateRoh(e, display.entity, v), e => e.roh)));
  });
  appContainer.addChild(box2);

  window.requestAnimationFrame(update(state, display));
}

function update(state: { entity: Entity }, display: { entity: EntityDisplay }): () => void {
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