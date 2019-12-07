import { GameNode, SummonNode, GenerateNode } from "./gameNode";
import { Cache, attachAnimation } from "../app/main";
import { nodeSprite } from "./state";
import { Anim, TweenTo, mkAccessTarget, Par } from "../app/animation";
import { IPoint } from "pixi.js";

export type Hotbar = {
  nodes: GameNode[],
}

export type HotbarDisplay = {
  container: PIXI.Container,
  nodes: PIXI.Sprite[],
}

export function initializeHotbar(
  hotbar: Hotbar,
  x: number,
  y: number,
  parentContainer: PIXI.Container,
  cache: Cache,
): HotbarDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x, y });

  let nodes: PIXI.Sprite[] = [];

  let i = 0;
  for (const node of hotbar.nodes) {
    const box = new PIXI.Sprite(cache[nodeSprite(node)]);
    box.x = i * 55;
    box.pivot.set(25, 25);

    box.interactive = true;

    box.on("mouseover", () => {
      attachAnimation(hotbarMouseOverAnim(box));
    });
    box.on("mouseout", () => {
      attachAnimation(hotbarMouseOutAnim(box));
    });

    container.addChild(box);
    nodes.push(box);
    i++;
  }

  parentContainer.addChild(container);

  return { container, nodes };
}

function hotbarMouseOverAnim<A extends { scale: IPoint }>(
  obj: A
) : Anim {
  return new Par([
    new TweenTo(0.2, 1.2, "absolute", mkAccessTarget(obj.scale, "x")),
    new TweenTo(0.2, 1.2, "absolute", mkAccessTarget(obj.scale, "y")),
  ]);
}

function hotbarMouseOutAnim<A extends { scale: IPoint }>(
  obj: A
) : Anim {
  return new Par([
    new TweenTo(0.2, 1, "absolute", mkAccessTarget(obj.scale, "x")),
    new TweenTo(0.2, 1, "absolute", mkAccessTarget(obj.scale, "y")),
  ]);
}

export function initialHotbar(): Hotbar {
  return {
    nodes: [
      new GenerateNode("roh"),
      new GenerateNode("tah"),
      new GenerateNode("sie"),
      new SummonNode("en1"),
    ],
  }
}