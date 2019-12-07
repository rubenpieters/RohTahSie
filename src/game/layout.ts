import { GameNode, GenerateNode, SummonNode } from "./gameNode";
import { Cache } from "../app/main";
import { nodeSprite } from "./state";
import { mkEff, Noop, Anim } from "../app/animation";

// the amount of nodes on the x-axis
const xAmount = 4;
// the amount of nodes on the y-axis
const yAmount = 4;
// total amount of nodes
const nodeAmount = xAmount * yAmount;

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
  layout: Layout | undefined,
  x: number,
  y: number,
  parentContainer: PIXI.Container,
  cache: Cache,
): LayoutDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x, y });

  let nodes: PIXI.Sprite[] = [];

  for (let i = 0; i < nodeAmount; i++) {
    const box =
      layout !== undefined && layout.nodes[i] !== undefined ?
      new PIXI.Sprite(cache[nodeSprite(layout.nodes[i])]) :
      new PIXI.Sprite();
    box.x = (i % xAmount) * 55;
    box.y = Math.floor(i / xAmount) * 55;
    container.addChild(box);
    nodes.push(box);
  }

  const bar: PIXI.Sprite = new PIXI.Sprite(cache.bar);
  const currIndex = layout !== undefined ? layout.currentIndex : 0;
  Object.assign(bar, barLocation(currIndex));
  bar.pivot.set(2.5, 30);
  container.addChild(bar);

  if (layout === undefined) {
    container.visible = false;
  }

  parentContainer.addChild(container);

  return { container, nodes, bar };
}

export function newLayoutAnim(
  layout: Layout,
  layoutDisplay: LayoutDisplay,
  cache: Cache,
): Anim {
  return mkEff({
    eff: () => {
      for (let i = 0; i < nodeAmount; i++) {
        layoutDisplay.nodes[i].texture = cache[nodeSprite(layout.nodes[i])];
      }
    },
    k: () => new Noop(),
  })
}

export function barLocation(
  index: number,
): { x: number, y: number } {
  return {
    x: (index % xAmount) * 52.5,
    y: (Math.floor(index / xAmount) % yAmount) * 55 + 22.5,
  };
}

export function playerInitialLayout(): Layout {
  return {
    nodes: [
      new SummonNode("en1"),
      new GenerateNode("roh"),
      new GenerateNode("roh"),
      new GenerateNode("roh"),

      new GenerateNode("roh"),
      new GenerateNode("roh"),
      new GenerateNode("roh"),
      new GenerateNode("roh"),

      new GenerateNode("roh"),
      new GenerateNode("roh"),
      new GenerateNode("roh"),
      new GenerateNode("roh"),

      new GenerateNode("roh"),
      new GenerateNode("roh"),
      new GenerateNode("roh"),
      new GenerateNode("roh"),
    ],
    currentIndex: 0,
  }
}