import * as PIXI from "pixi.js";
import { Layout, GameState, advanceState, nodeSprite } from "../shared/game";
import { Template, template1, template2 } from "../shared/template";
import { PixiFps } from "./fps";
import { GenerateNode, AttackNode, SummonNode, GameNode } from "../shared/gameNode";

// TODO: create load screen with pixi loader https://pixijs.download/dev/docs/PIXI.Loader.html

const renderer = PIXI.autoDetectRenderer();

let draggingObj: PIXI.DisplayObject | undefined;

let currentTime = new Date().getTime();
let prevTime = currentTime;
let deltaTime = 0;

let prevHitIndex: number | undefined;

window.addEventListener("load", main);
window.requestAnimationFrame(update);

const text = new PIXI.Text(`Index: 0 Time: 0`, {
  fontFamily : "Arial",
  fontSize: 24,
  align: "center",
});
text.x = 200;
text.y = 200;

const barTexture = PIXI.Texture.from("assets/sprites/bar.png");
const bar = new PIXI.Sprite(barTexture);

const layout: Layout = [
  new GenerateNode("res_red"),
  new GenerateNode("res_red"),
  new GenerateNode("res_red"),
  new GenerateNode("res_red"),
  new GenerateNode("res_red"),
  new GenerateNode("res_red"),
  new GenerateNode("res_red"),
  new GenerateNode("res_gre"),
  new GenerateNode("res_gre"),
  new GenerateNode("res_gre"),
  new GenerateNode("res_gre"),
  new GenerateNode("res_yel"),
  new GenerateNode("res_yel"),
  new GenerateNode("res_yel"),
];

const nodes: PIXI.Sprite[] = [];

const state: GameState = {
  nodeIndex: 0,
  timeInNode: 0,
  layout,
  runes: {},
  templates: [
    new GenerateNode("res_red"),
    new GenerateNode("res_gre"),
    new GenerateNode("res_yel"),
    new AttackNode(1, "enemy"),
    new GenerateNode("shield"),
    new SummonNode("en1"),
  ],
  currentEnemy: undefined,
};

type Cache = typeof cache;
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
}

const barRed = new PIXI.Sprite(cache["bar_red"]);
const barGreen = new PIXI.Sprite(cache["bar_gre"]);
const barYellow = new PIXI.Sprite(cache["bar_yel"]);

const barRedE = new PIXI.Sprite(cache["bar_red"]);
const barGreenE = new PIXI.Sprite(cache["bar_gre"]);
const barYellowE = new PIXI.Sprite(cache["bar_yel"]);

function main(): void {
  const app = new PIXI.Application({width: 540, height: 960});

  document.body.appendChild(app.view);

  const container = new PIXI.Container();
  app.stage.addChild(container);

  const bg = new PIXI.Sprite(PIXI.Texture.WHITE);
  bg.width = 540;
  bg.height = 960;
  bg.tint = 0x00d3ff;
  container.addChild(bg);

  // rotation
  let i = 0;
  layout.forEach((node: GameNode) => {
    const box = new PIXI.Sprite(cache[nodeSprite(node)]);
    box.x = (i % 7) * 55 + 50;
    box.y = Math.floor(i / 7) * 55 + 50;
    container.addChild(box);
    nodes.push(box);
    i += node.size;
  });
  /*container.addChild(text);*/

  bar.x = 50;
  bar.y = 45;
  container.addChild(bar);

  // resource bars
  barRed.x = 50;
  barRed.y = 200;
  barRed.width = 0;
  container.addChild(barRed);
  barGreen.x = 50;
  barGreen.y = 250;
  barGreen.width = 0;
  container.addChild(barGreen);
  barYellow.x = 50;
  barYellow.y = 300;
  barYellow.width = 0;
  container.addChild(barYellow);

  // resource bars enemy
  barRedE.x = 300;
  barRedE.y = 200;
  barRedE.width = 0;
  barRedE.visible = false;
  container.addChild(barRedE);
  barGreenE.x = 300;
  barGreenE.y = 250;
  barGreenE.width = 0;
  barGreenE.visible = false;
  container.addChild(barGreenE);
  barYellowE.x = 300;
  barYellowE.y = 300;
  barYellowE.width = 0;
  barYellowE.visible = false;
  container.addChild(barYellowE);

  // hotbar
  state.templates.forEach((template: GameNode, i) => {
    const box2 = new PIXI.Sprite(cache[nodeSprite(template)]);
    box2.x = i * 55 + 50;
    box2.y = 500;
    box2.interactive = true;
    box2
      .on("mousedown", onDragStart)
      .on("touchstart", onDragStart)
      .on("mouseup", onDragEnd)
      .on("mouseupoutside", onDragEnd)
      .on("touchend", onDragEnd)
      .on("touchendoutside", onDragEnd)
      .on("mousemove", onDragMove)
      .on("touchmove", onDragMove);
    (box2 as any).template = template;
    (box2 as any).templateIndex = i;
    container.addChild(box2);
  });

  const fpsCounter = new PixiFps();

  container.addChild(fpsCounter);
}

function update(): void {
  prevTime = currentTime;
  currentTime = new Date().getTime();
  deltaTime = (currentTime - prevTime) / 5;
  advanceState(state, deltaTime);
  //text.text = `Index: ${state.nodeIndex} Time: ${Math.floor(state.timeInNode)} X: ${state.runes.x} Y: ${state.runes.y}`;
  barRed.width = state.runes["res_red"] / 100 * 140;
  barGreen.width = state.runes["res_gre"] / 100 * 140;
  barYellow.width = state.runes["res_yel"] / 100 * 140;
  if (state.currentEnemy !== undefined) {
    barRedE.visible = true;
    barGreenE.visible = true;
    barYellowE.visible = true;
    barRedE.width = state.currentEnemy.red / 10 * 140;
    barGreenE.width = state.currentEnemy.green / 10 * 140;
    barYellowE.width = state.currentEnemy.yellow / 10 * 140;
  } else {
    barRedE.visible = false;
    barGreenE.visible = false;
    barYellowE.visible = false;
  }
  const timerValue = state.nodeIndex + state.timeInNode / 100;
  bar.x = (timerValue % 7 / 7) * (50 * 7 + 5 * 6) + 50;
  bar.y = Math.floor(timerValue / 7) * 55 + 45;
  requestAnimationFrame(update);
}

function onDragStart(event: PIXI.interaction.InteractionEvent) {
  draggingObj = event.currentTarget;
  draggingObj.alpha = 0.8;
  (draggingObj as any).dragData = {
    dragX: draggingObj.x - event.data.global.x,
    dragY: draggingObj.y - event.data.global.y,
  };
}

function onDragEnd(event: PIXI.interaction.InteractionEvent) {
  if (draggingObj !== undefined) {
    (draggingObj as any).dragData = undefined;
    draggingObj.alpha = 1;
    if (prevHitIndex !== undefined) {
      state.layout[prevHitIndex] = (draggingObj as any).template;
      (nodes[prevHitIndex] as PIXI.Sprite).texture = cache[nodeSprite((draggingObj as any).template)];
    }
    draggingObj.x = (draggingObj as any).templateIndex * 55 + 50;
    draggingObj.y = 500;
    draggingObj = undefined;
    nodes.forEach(node => {
      node.alpha = 1;
    });
  }
}

function onDragMove(event: PIXI.interaction.InteractionEvent) {
  const tgt = event.currentTarget;
  if ((tgt as any).dragData !== undefined) {    
    tgt.position.x = event.data.global.x + (tgt as any).dragData.dragX;
    tgt.position.y = event.data.global.y + (tgt as any).dragData.dragY;
    let hitIndex: number | undefined;
    for (let i = 0; i < nodes.length; i++) {
      if (hitTestRectangle(nodes[i], tgt as PIXI.Sprite)) {
        hitIndex = i;
        break;
      }
    }
    if (hitIndex !== prevHitIndex) {
      nodes.forEach((node, i) => {
        if (i === hitIndex) {
          node.alpha = 0.5;
        } else {
          node.alpha = 1;
        }
      });
    }
    prevHitIndex = hitIndex;
  }
}

// https://github.com/kittykatattack/learningPixi#collision
function hitTestRectangle(r1: PIXI.Sprite, r2: PIXI.Sprite) {

  //Define the variables we'll need to calculate
  let hit, combinedHalfWidths, combinedHalfHeights, vx, vy;

  //hit will determine whether there's a collision
  hit = false;

  //Find the center points of each sprite
  const r1CenterX = r1.x + r1.width / 2;
  const r1CenterY = r1.y + r1.height / 2;
  const r2CenterX = r2.x + r2.width / 2;
  const r2CenterY = r2.y + r2.height / 2;

  //Find the half-widths and half-heights of each sprite
  const r1HalfWidth = r1.width / 2;
  const r1HalfHeight = r1.height / 2;
  const r2HalfWidth = r2.width / 2;
  const r2HalfHeight = r2.height / 2;

  //Calculate the distance vector between the sprites
  vx = r1CenterX - r2CenterX;
  vy = r1CenterY - r2CenterY;

  //Figure out the combined half-widths and half-heights
  combinedHalfWidths = r1HalfWidth + r2HalfWidth;
  combinedHalfHeights = r1HalfHeight + r2HalfHeight;

  //Check for a collision on the x axis
  if (Math.abs(vx) < combinedHalfWidths) {

    //A collision might be occurring. Check for a collision on the y axis
    if (Math.abs(vy) < combinedHalfHeights) {

      //There's definitely a collision happening
      hit = true;
    } else {

      //There's no collision on the y axis
      hit = false;
    }
  } else {

    //There's no collision on the x axis
    hit = false;
  }

  //`hit` will be either `true` or `false`
  return hit;
};
