import * as PIXI from "pixi.js";

window.addEventListener("load", main);
  
function main(): void {
    const app = new PIXI.Application({width: 540, height: 960});
    
    document.body.appendChild(app.view);

    const container = new PIXI.Container();
    app.stage.addChild(container);

    const texture = PIXI.Texture.from("assets/sprites/box.png");
    const box = new PIXI.Sprite(texture);
    box.x = 50;
    box.y = 50;
    container.addChild(box);

}
