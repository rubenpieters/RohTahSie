import { Ability, GenerateNode, SummonNode, AttackNode, Empty } from "./definitions/ability";
import { Cache, attachAnimation } from "../app/main";
import { nodeSprite, GameState } from "./state";
import { mkEff, Noop, Anim, Par, TweenTo, mkAccessTarget, Seq } from "../app/animation";
import { hotbarSelectedNode } from "./hotbar";
import { Display } from "./display";
import { EnemyTarget, PlayerTarget } from "./definitions/target";

// the amount of nodes on the x-axis
const xAmount = 4;
// the amount of nodes on the y-axis
const yAmount = 4;
// total amount of nodes
const nodeAmount = xAmount * yAmount;

export type Layout = {
  nodes: Ability[],
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
  state: GameState,
  display: Display,
  cache: Cache,
  type: "player" | "enemy",
): LayoutDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x, y });

  let nodes: PIXI.Sprite[] = [];

  for (let i = 0; i < nodeAmount; i++) {
    const box =
      layout !== undefined && layout.nodes[i] !== undefined ?
      new PIXI.Sprite(cache[nodeSprite(layout.nodes[i])]) :
      new PIXI.Sprite();
    box.x = (i % xAmount) * 55 + 25;
    box.y = Math.floor(i / xAmount) * 55 + 25;
    box.pivot.set(25, 25);

    if (type === "player") {
      box.interactive = true;
  
      box.on("pointerdown", layoutPointerDownCb(state, display, cache, i, type));
    }

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
  layout: Layout | undefined,
  layoutDisplay: LayoutDisplay,
  cache: Cache,
): Anim {
  return mkEff({
    eff: () => {
      if (layout !== undefined) {
        layoutDisplay.container.visible = true;
        for (let i = 0; i < nodeAmount; i++) {
          layoutDisplay.nodes[i].texture = cache[nodeSprite(layout.nodes[i])];
        }
      } else {
        layoutDisplay.container.visible = false;
      }
    },
    k: () => new Noop(),
  })
}

function layoutPointerDownCb(
  state: GameState,
  display: Display,
  cache: Cache,
  index: number,
  type: "player" | "enemy",
): () => void {
  return () => {
    const selectedNode = hotbarSelectedNode(state.player.hotbar);
    if (selectedNode !== undefined) {
      state.player.layout.nodes[index] = selectedNode;
      display.player.layout.nodes[index].texture = cache[nodeSprite(selectedNode)];
      attachAnimation(
        new Seq([
          new Par([
            new TweenTo(0.05, 1.2, "absolute", mkAccessTarget(display[type].layout.nodes[index].scale, "x")),
            new TweenTo(0.05, 1.2, "absolute", mkAccessTarget(display[type].layout.nodes[index].scale, "y")),
          ]),
          new Par([
            new TweenTo(0.1, 1, "absolute", mkAccessTarget(display[type].layout.nodes[index].scale, "x")),
            new TweenTo(0.1, 1, "absolute", mkAccessTarget(display[type].layout.nodes[index].scale, "y")),
          ]),
        ]),
      );
    }
  };
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
      new Empty(),
      new Empty(),
      new Empty(),
      new Empty(),

      new Empty(),
      new Empty(),
      new Empty(),
      new Empty(),

      new Empty(),
      new Empty(),
      new Empty(),
      new Empty(),

      new Empty(),
      new Empty(),
      new Empty(),
      new Empty(),
    ],
    currentIndex: 0,
  }
}