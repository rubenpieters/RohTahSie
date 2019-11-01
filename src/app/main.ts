import * as PIXI from "pixi.js";

let currentTime = new Date().getTime();
let prevTime = currentTime;
let deltaTime = 0;

let timer = 0;

window.addEventListener("load", main);
window.requestAnimationFrame(update);

let text = new PIXI.Text(`Timer: ${timer}`, {
    fontFamily : 'Arial',
    fontSize: 24,
    fill: 0xff1010,
    align: "center",
});
text.x = 200;
text.y = 200;
  
function main(): void {
    const app = new PIXI.Application({width: 540, height: 960});
    
    document.body.appendChild(app.view);

    const container = new PIXI.Container();
    app.stage.addChild(container);

    const texture = PIXI.Texture.from("assets/sprites/box.png");
    for (let i = 0; i < 14; i++) {
        const box = new PIXI.Sprite(texture);
        box.x = (i % 7) * 55 + 50;
        box.y = Math.floor(i / 7) * 55 + 50;
        container.addChild(box);
    }

    container.addChild(text);

}

function update(): void {
    currentTime = new Date().getTime();
    deltaTime = (currentTime - prevTime) / 1000;
    timer += deltaTime;
    if (timer >= 1000) timer = timer - 1000 * (Math.floor(timer / 1000));
    text.text = `Timer: ${Math.floor(timer)}`;
    requestAnimationFrame(update);
}