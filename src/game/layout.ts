import { Ability } from "./definitions/ability";
import * as Ab from "./definitions/ability";
import { Cache, attachAnimation, clearExplWindowAnimation, attachExplWindowAnimation } from "../app/main";
import { GameState } from "./state";
import { mkEff, Noop, Anim, Par, TweenTo, mkAccessTarget, Seq } from "../app/animation";
import { hotbarSelectedNode } from "./hotbar";
import { Display } from "./display";
import { EnemyTarget, PlayerTarget } from "./definitions/target";
import { loadNodeExpl } from "./nodeExpl";
import { nodeSprite } from "./ability";

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
  bg: PIXI.Sprite,
  container: PIXI.Container,
  nodes: PIXI.Sprite[],
  abilitySlots: PIXI.Sprite[],
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

  const bg = new PIXI.Sprite(cache["layout_bg"]);
  bg.alpha = 0.5;
  container.addChild(bg);

  let nodes: PIXI.Sprite[] = [];
  let abilitySlots: PIXI.Sprite[] = [];
  for (let i = 0; i < nodeAmount; i++) {
    const abilitySlot = new PIXI.Sprite(cache["ability_slot"]);
    abilitySlot.x = (i % xAmount) * 55 + 40;
    abilitySlot.y = Math.floor(i / xAmount) * 55 + 40;
    abilitySlot.pivot.set(26, 26);

    container.addChild(abilitySlot);
    abilitySlots.push(abilitySlot);

    const box =
      layout !== undefined && layout.nodes[i] !== undefined ?
      new PIXI.Sprite(cache[nodeSprite(layout.nodes[i])]) :
      new PIXI.Sprite();
    box.x = (i % xAmount) * 55 + 40;
    box.y = Math.floor(i / xAmount) * 55 + 40;
    box.pivot.set(25, 25);

    box.interactive = true;
    box.on("pointerup", layoutPointerUpCb(state, display, cache, i, type));
    box.on("pointerdown", layoutPointerDownCb(state, display, cache, i, type));

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

  return { container, bg, nodes, bar, abilitySlots };
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
    display.player.nodeExpl.container.visible = false;
    display.player.nodeExpl.loading.visible = false;
    const layout = state[type]?.layout;
    if (layout !== undefined) {
      const anim = loadNodeExpl(layout.nodes[index], display.player.nodeExpl);
      attachExplWindowAnimation(anim);
    }
  };
}

function layoutPointerUpCb(
  state: GameState,
  display: Display,
  cache: Cache,
  index: number,
  type: "player" | "enemy",
) {
  return () => {
    clearExplWindowAnimation();
    // if node expl container is not visible: do click action
    if (! display.player.nodeExpl.container.visible && type === "player") {
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
    }
    // if loading sprite is visible: cancel loading
    else if (display.player.nodeExpl.loading.visible) {
      display.player.nodeExpl.container.visible = false;
    }
  };
}

export function barLocation(
  index: number,
): { x: number, y: number } {
  return {
    x: (index % xAmount) * 52.5 + 15,
    y: (Math.floor(index / xAmount) % yAmount) * 55 + 35,
  };
}

export function playerInitialLayout(): Layout {
  return {
    nodes: [
      new Ab.Dormant(),
      new Ab.Dormant(),
      new Ab.Dormant(),
      new Ab.Dormant(),

      new Ab.Dormant(),
      new Ab.Dormant(),
      new Ab.Dormant(),
      new Ab.Dormant(),

      new Ab.Dormant(),
      new Ab.Dormant(),
      new Ab.Dormant(),
      new Ab.Dormant(),

      new Ab.Dormant(),
      new Ab.Dormant(),
      new Ab.Dormant(),
      new Ab.Dormant(),
    ],
    currentIndex: 0,
  }
}