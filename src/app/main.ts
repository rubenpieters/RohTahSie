import * as PIXI from "pixi.js";
import { Layout, GenerateNode, GameNode, GameState, advanceState } from "../shared/game";
import { Template, template1, template2 } from "../shared/template";
import { PixiFps } from "./fps";

// TODO: create load screen with pixi loader https://pixijs.download/dev/docs/PIXI.Loader.html

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
  fill: 0xff1010,
  align: "center",
});
text.x = 200;
text.y = 200;

const barTexture = PIXI.Texture.from("assets/sprites/bar.png");
const bar = new PIXI.Sprite(barTexture);

const layout: Layout = [
  new GenerateNode("x"),
  new GenerateNode("x"),
  new GenerateNode("x"),
  new GenerateNode("x"),
  new GenerateNode("x"),
  new GenerateNode("x"),
  new GenerateNode("x"),
  new GenerateNode("x"),
  new GenerateNode("x"),
  new GenerateNode("x"),
  new GenerateNode("x"),
  new GenerateNode("x"),
  new GenerateNode("x"),
  new GenerateNode("x"),
];

const nodes: PIXI.Sprite[] = [];

const state: GameState = {
  nodeIndex: 0,
  timeInNode: 0,
  layout,
  runes: {},
  templates: [
    template1,
    template2,
  ],
};

function main(): void {
  const app = new PIXI.Application({width: 540, height: 960});

  document.body.appendChild(app.view);

  const container = new PIXI.Container();
  app.stage.addChild(container);

  const boxTexture = PIXI.Texture.from("assets/sprites/box.png");
  let i = 0;
  layout.forEach((node: GameNode) => {
    const box = new PIXI.Sprite(boxTexture);
    box.x = (i % 7) * 55 + 50;
    box.y = Math.floor(i / 7) * 55 + 50;
    container.addChild(box);
    nodes.push(box);
    i += node.size;
  });
  container.addChild(text);

  bar.x = 50;
  bar.y = 45;
  container.addChild(bar);

  const box2Texture = PIXI.Texture.from("assets/sprites/box2.png");

  state.templates.forEach((template: Template, i) => {
    const box2 = new PIXI.Sprite(box2Texture);
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
  text.text = `Index: ${state.nodeIndex} Time: ${Math.floor(state.timeInNode)} X: ${state.runes.x}`;
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
    draggingObj = undefined;
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