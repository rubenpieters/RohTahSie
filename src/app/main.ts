import * as PIXI from "pixi.js";
import { Layout, GenerateNode, GameNode, GameState, advanceState } from "../shared/game";

let currentTime = new Date().getTime();
let prevTime = currentTime;
let deltaTime = 0;

window.addEventListener("load", main);
window.requestAnimationFrame(update);

const text = new PIXI.Text(`Index: 0 Time: 0`, {
    fontFamily : 'Arial',
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
};

function main(): void {
    const app = new PIXI.Application({width: 540, height: 960});
    
    document.body.appendChild(app.view);

    const container = new PIXI.Container();
    app.stage.addChild(container);

    const boxTexture = PIXI.Texture.from("assets/sprites/box.png");
    let i = 0;
    layout.forEach((node: GameNode) => {const box = new PIXI.Sprite(boxTexture);
        box.x = (i % 7) * 55 + 50;
        box.y = Math.floor(i / 7) * 55 + 50;
        container.addChild(box);
        i += node.size;
    });

    container.addChild(text);

    bar.x = 50;
    bar.y = 45;
    container.addChild(bar);
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