import { Ability, Initiate, Dormant } from "./definitions/ability";
import { Cache, attachAnimation, attachExplWindowAnimation, clearExplWindowAnimation } from "../app/main";
import { nodeSprite, GameState } from "./state";
import { Anim, TweenTo, mkAccessTarget, Par, mkEff, Noop } from "../app/animation";
import { IPoint } from "pixi.js";
import { Display } from "./display";
import { showNodeExpl, NodeExplDisplay, hideNodeExpl, resetNodeExpl, loadNodeExpl } from "./nodeExpl";
import { AddStatus } from "./definitions/action";
import { PlayerTarget, EnemyTarget } from "./definitions/target";
import { CardCrafts } from "../craft/all";
import { filterUndefined, fillUndefinedUpTo } from "../util/util";
import { Zones } from "src/zone/all";

const xAmount = 7;
const yAmount = 2;
const hotbarSize = xAmount * yAmount;

export type Hotbar = {
  elements: {
    node: Ability,
    selected: boolean,
  }[],
}

export type HotbarDisplay = {
  container: PIXI.Container,
  bg: PIXI.Sprite,
  elements: PIXI.Sprite[],
  refreshBtn: PIXI.Sprite,
}

export function initializeHotbar(
  hotbar: Hotbar,
  x: number,
  y: number,
  parentContainer: PIXI.Container,
  state: GameState,
  display: Display,
  cache: Cache,
): HotbarDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x, y });

  const bg = new PIXI.Sprite(cache["hotbar_bg"]);
  bg.x = -45;
  bg.y = -45;
  container.addChild(bg);

  let elements: PIXI.Sprite[] = [];

  for (let i = 0; i < hotbarSize; i++) {
    const element = hotbar.elements[i];
    const box = new PIXI.Sprite(cache[nodeSprite(element.node)]);
    box.x = (i % xAmount) * 55;
    box.y = Math.floor(i / xAmount) * 55;
    box.pivot.set(25, 25);

    box.interactive = true;

    box.on("pointerup", hotbarPointerUpCb(state, display, i));
    box.on("pointerdown", hotbarPointerDownCb(state, display, i));

    container.addChild(box);
    elements.push(box);
  }

  const refreshBtn = new PIXI.Sprite(cache["refresh"]);
  refreshBtn.x = 370;
  refreshBtn.y = 12.5;
  container.addChild(refreshBtn);

  refreshBtn.interactive = true;
  refreshBtn.on("pointerdown", refreshHotBar(state, display, cache));

  parentContainer.addChild(container);

  return { container, bg, elements, refreshBtn };
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

function hotbarMouseOutCb(
  state: GameState,
  box: PIXI.Sprite,
  display: Display,
  index: number,
): () => void {
  return () => {
    if (! state.player.hotbar.elements[index].selected) {
      attachAnimation(hotbarMouseOutAnim(box));
    }
    attachExplWindowAnimation(hideNodeExpl(display.player.nodeExpl));
  };
}

function hotbarPointerUpCb(
  state: GameState,
  display: Display,
  index: number,
): () => void {
  return () => {
    clearExplWindowAnimation();
    if (display.player.nodeExpl.loading.visible) {
      display.player.nodeExpl.container.visible = false;
    }
    const hotbar = state.player.hotbar;
    for (let i = 0; i < hotbar.elements.length; i++) {
      if (i !== index && hotbar.elements[i].selected) {
        attachAnimation(hotbarMouseOutAnim(display.player.hotbar.elements[i]));
        hotbar.elements[i].selected = false;
      }
    }
    hotbar.elements[index].selected = ! hotbar.elements[index].selected;
  };
}

function hotbarPointerDownCb(
  state: GameState,
  display: Display,
  index: number,
): () => void {
  return () => {
    const anim = loadNodeExpl(state.player.hotbar.elements[index].node, display.player.nodeExpl)
    attachExplWindowAnimation(anim);
  };
}

export function newHotbarAnim(
  hotbar: Hotbar,
  hotbarDisplay: HotbarDisplay,
  cache: Cache,
): Anim {
  return mkEff({
    eff: () => {
      for (let i = 0; i < hotbarSize; i++) {
        hotbarDisplay.elements[i].texture = cache[nodeSprite(hotbar.elements[i].node)];
        Object.assign(hotbarDisplay.elements[i].scale, { x: 1, y: 1 });
      }
    },
    k: () => new Noop(),
  });
}

export function hotbarSelectedNode(
  hotbar: Hotbar,
): Ability | undefined {
  const selectedElement = hotbar.elements.find(x => x.selected);
  return selectedElement === undefined ? undefined : selectedElement.node;
}

export function refreshHotBar(
  state: GameState,
  display: Display,
  cache: Cache,
): () => void {
  return () => {
    const newHotbar = calcHotbar(state.cardCrafts, state.zones);
    state.player.hotbar = newHotbar;
    attachAnimation(newHotbarAnim(newHotbar, display.player.hotbar, cache));
  };
}

export function calcHotbar(
  cardCrafts: CardCrafts,
  zones: Zones,
): Hotbar {
  // crafted cards
  const craftedCardSize = hotbarSize - 4;
  const elementsUnfiltered = cardCrafts.map(x => {
    if (x.included === 1) {
      return { 
        node: x.node,
        selected: false,
      };
    } else {
      return undefined;
    }
  });
  const elementsUnfilled = filterUndefined(elementsUnfiltered).slice(0, craftedCardSize - 1);
  const elementsCrafts = fillUndefinedUpTo(elementsUnfilled, { node: new Dormant(), selected: false }, craftedCardSize);
  // zone cards
  const selectedZone = zones.find(x => x.selected === true);
  if (selectedZone === undefined) {
    throw "no selected zone";
  }
  const elementsZoneUnfilled: { node: Ability, selected: boolean }[] = selectedZone.enemyIds.map(x => {
    return {
      node: new Initiate(x),
      selected: false,
    };
  });
  const elementsZone = fillUndefinedUpTo(elementsZoneUnfilled, { node: new Dormant(), selected: false }, 4);

  const elements = elementsCrafts.concat(elementsZone);
  return { elements };
}