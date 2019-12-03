import { GameNode, GenerateNode } from "./gameNode";
import { Cache } from "../app/main";
import { nodeSprite } from "./game";

export type Layout = {
  nodes: GameNode[],
  currentIndex: number,
};

export type LayoutDisplay = {
  container: PIXI.Container,
  nodes: PIXI.Sprite[],
  bar: PIXI.Sprite,
}

export function initializeLayout(
  layout: Layout,
  x: number,
  y: number,
  parentContainer: PIXI.Container,
  cache: Cache,
): LayoutDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x, y });

  const xAmount = 4;

  let nodes: PIXI.Sprite[] = [];

  let i = 0;
  layout.nodes.forEach((node: GameNode) => {
    const box = new PIXI.Sprite(cache[nodeSprite(node)]);
    box.x = (i % xAmount) * 55;
    box.y = Math.floor(i / xAmount) * 55;
    container.addChild(box);
    nodes.push(box);
    i += node.size;
  });

  const bar: PIXI.Sprite = new PIXI.Sprite(cache.bar);
  bar.x = (layout.currentIndex % xAmount) * 52.5;
  bar.y = Math.floor(layout.currentIndex / xAmount) * 55 + 22.5;
  bar.pivot.set(2.5, 30);
  container.addChild(bar);

  parentContainer.addChild(container);

  return { container, nodes, bar };
}

export function playerInitialLayout(): Layout {
  return {
    nodes: [
      new GenerateNode("roh"),
      new GenerateNode("roh"),
      new GenerateNode("roh"),
      new GenerateNode("roh"),

      new GenerateNode("roh"),
      new GenerateNode("roh"),
      new GenerateNode("roh"),
      new GenerateNode("roh"),

      new GenerateNode("tah"),
      new GenerateNode("tah"),
      new GenerateNode("tah"),
      new GenerateNode("tah"),

      new GenerateNode("sie"),
      new GenerateNode("sie"),
      new GenerateNode("sie"),
      new GenerateNode("sie"),
    ],
    currentIndex: 0,
  }
}