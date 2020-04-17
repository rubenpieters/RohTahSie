import { Ability } from "./definitions/ability";
import * as Ab from "./definitions/ability";
import { Cache, attachAnimation, clearExplWindowAnimation, attachExplWindowAnimation } from "../app/main";
import { GameState } from "./state";
import { mkEff, Noop, Anim, Par, TweenTo, mkAccessTarget, Seq, embedEff } from "../app/animation";
import { hotbarSelectedNode } from "./hotbar";
import { Display } from "./display";
import { EnemyTarget, PlayerTarget } from "./definitions/target";
import { loadNodeExpl } from "./nodeExpl";
import { nodeSprite } from "./ability";
import { Dir, dirToDeg } from "./dir";
import { showDirSelect } from "./dirSelect";

// the amount of nodes on the x-axis
const xAmount = 4;
// the amount of nodes on the y-axis
const yAmount = 4;
// total amount of nodes
const nodeAmount = xAmount * yAmount;

export type Layout = {
  nodes: {
    ability: Ability,
    direction: Dir | undefined,
  }[],
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
    const abilitySlot = layout !== undefined && layout.nodes[i].direction === undefined ?
      new PIXI.Sprite(cache["ability_slot"]) :
      new PIXI.Sprite(cache["ability_slot_r"]);
    if (layout !== undefined && layout.nodes[i].direction !== undefined) {
      abilitySlot.angle = dirToDeg(layout.nodes[i].direction!);
    }
    abilitySlot.x = (i % xAmount) * 55 + 40;
    abilitySlot.y = Math.floor(i / xAmount) * 55 + 40;
    abilitySlot.pivot.set(26, 26);

    container.addChild(abilitySlot);
    abilitySlots.push(abilitySlot);

    const box =
      layout !== undefined && layout.nodes[i] !== undefined ?
      new PIXI.Sprite(cache[nodeSprite(layout.nodes[i].ability)]) :
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
          if (layout.nodes[i].direction === undefined) {
            layoutDisplay.abilitySlots[i].texture = cache["ability_slot"];
            layoutDisplay.abilitySlots[i].angle = 0;
          } else {
            layoutDisplay.abilitySlots[i].texture = cache["ability_slot_r"];
            layoutDisplay.abilitySlots[i].angle = dirToDeg(layout.nodes[i].direction!);
          }
          layoutDisplay.nodes[i].texture = cache[nodeSprite(layout.nodes[i].ability)];
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
      const anim = loadNodeExpl(layout.nodes[index].ability, display.player.nodeExpl);
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
        changeLayoutNode("player", state, display, index, selectedNode, cache);
      } else {
        attachAnimation(showDirSelect(display.player.dirSelect, index));
      }
    }
    // if loading sprite is visible: cancel loading
    else if (display.player.nodeExpl.loading.visible) {
      display.player.nodeExpl.container.visible = false;
    }
  };
}

export function changeLayoutNode(
  target: "player" | "enemy",
  state: GameState,
  display: Display,
  index: number,
  node: Ability,
  cache: Cache,
) {
  const targetObj = state[target];
  if (targetObj !== undefined) {
    targetObj.layout.nodes[index].ability = node;
    display[target].layout.nodes[index].texture = cache[nodeSprite(node)];
    attachAnimation(
      new Seq([
        new Par([
          new TweenTo(0.05, 1.2, "absolute", mkAccessTarget(display[target].layout.nodes[index].scale, "x")),
          new TweenTo(0.05, 1.2, "absolute", mkAccessTarget(display[target].layout.nodes[index].scale, "y")),
        ]),
        new Par([
          new TweenTo(0.1, 1, "absolute", mkAccessTarget(display[target].layout.nodes[index].scale, "x")),
          new TweenTo(0.1, 1, "absolute", mkAccessTarget(display[target].layout.nodes[index].scale, "y")),
        ]),
      ]),
    );
  }
}

export function changeDirNode(
  state: GameState,
  display: Display,
  index: number,
  dir: Dir | undefined,
  cache: Cache,
): Anim {
  return new Seq([
    embedEff(() => {
      state.player.layout.nodes[index].direction = dir;
      state.player.layout.nodes[index].direction = dir;
      if (dir === undefined) {
        display.player.layout.abilitySlots[index].texture = cache["ability_slot"];
        display.player.layout.abilitySlots[index].angle = 0;
      } else {
        display.player.layout.abilitySlots[index].texture = cache["ability_slot_r"];
        display.player.layout.abilitySlots[index].angle = dirToDeg(dir);
      }
    }),
    new Seq([
      new Par([
        new TweenTo(0.05, 1.2, "absolute", mkAccessTarget(display.player.layout.abilitySlots[index].scale, "x")),
        new TweenTo(0.05, 1.2, "absolute", mkAccessTarget(display.player.layout.abilitySlots[index].scale, "y")),
      ]),
      new Par([
        new TweenTo(0.1, 1, "absolute", mkAccessTarget(display.player.layout.abilitySlots[index].scale, "x")),
        new TweenTo(0.1, 1, "absolute", mkAccessTarget(display.player.layout.abilitySlots[index].scale, "y")),
      ]),
    ]),
  ]);
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
      { ability: new Ab.Dormant(), direction: "right" },
      { ability: new Ab.Dormant(), direction: "right" },
      { ability: new Ab.Dormant(), direction: "right" },
      { ability: new Ab.Dormant(), direction: "right" },

      { ability: new Ab.Dormant(), direction: "right" },
      { ability: new Ab.Dormant(), direction: "right" },
      { ability: new Ab.Dormant(), direction: "right" },
      { ability: new Ab.Dormant(), direction: "right" },

      { ability: new Ab.Dormant(), direction: "right" },
      { ability: new Ab.Dormant(), direction: "right" },
      { ability: new Ab.Dormant(), direction: "right" },
      { ability: new Ab.Dormant(), direction: "right" },

      { ability: new Ab.Dormant(), direction: "right" },
      { ability: new Ab.Dormant(), direction: "right" },
      { ability: new Ab.Dormant(), direction: "right" },
      { ability: new Ab.Dormant(), direction: "right" },
    ],
    currentIndex: 0,
  }
}