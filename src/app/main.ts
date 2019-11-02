import * as PIXI from "pixi.js";
import { Layout, GenerateNode, GameNode, GameState, advanceState } from "../shared/game";
import { Template, template1, template2 } from "../shared/template";

// TODO: create load screen with pixi loader https://pixijs.download/dev/docs/PIXI.Loader.html

let draggingObj: PIXI.DisplayObject | undefined;

let currentTime = new Date().getTime();
let prevTime = currentTime;
let deltaTime = 0;

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
    draggingObj!.alpha = 1;
    draggingObj = undefined;
  }
}

function onDragMove(event: PIXI.interaction.InteractionEvent) {
  const tgt = event.currentTarget;
  if ((tgt as any).dragData !== undefined) {    
    tgt.position.x = event.data.global.x - (tgt as any).dragData.dragX;
    tgt.position.y = event.data.global.y - (tgt as any).dragData.dragY;
  }
}