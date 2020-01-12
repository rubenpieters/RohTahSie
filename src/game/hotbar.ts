import { Ability, SummonNode, GenerateNode, AttackNode, ShieldNode, Empty, AddArmor, AddArmor2 } from "./definitions/ability";
import { Cache, attachAnimation, attachExplWindowAnimation, clearExplWindowAnimation } from "../app/main";
import { nodeSprite, GameState } from "./state";
import { Anim, TweenTo, mkAccessTarget, Par, mkEff, Noop } from "../app/animation";
import { IPoint } from "pixi.js";
import { Display } from "./display";
import { showNodeExpl, NodeExplDisplay, hideNodeExpl, resetNodeExpl } from "./nodeExpl";
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

    /*box.on("mouseover", () => {
      attachAnimation(hotbarMouseOverAnim(box));
      clearExplWindowAnimation();
      resetNodeExpl(display.player.nodeExpl);
      attachExplWindowAnimation(showNodeExpl(state.player.hotbar.elements[i].node, display.player.nodeExpl));
    });
    box.on("mouseout", hotbarMouseOutCb(state, box, display, i));*/
    box.on("pointerup", hotbarPointerUpCb(state, elements, i));
    box.on("pointerdown", hotbarPointerDownCb(state, elements, i));

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
  hotbarElements: PIXI.Sprite[],
  index: number,
): () => void {
  return () => {
    const hotbar = state.player.hotbar;
    for (let i = 0; i < hotbar.elements.length; i++) {
      if (i !== index && hotbar.elements[i].selected) {
        attachAnimation(hotbarMouseOutAnim(hotbarElements[i]));
        hotbar.elements[i].selected = false;
      }
    }
    hotbar.elements[index].selected = ! hotbar.elements[index].selected;
  };
}

function hotbarPointerDownCb(
  state: GameState,
  hotbarElements: PIXI.Sprite[],
  index: number,
): () => void {
  return () => {
    // TODO: attach cancelable animation to display node expl
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
  const elementsCrafts = fillUndefinedUpTo(elementsUnfilled, { node: new Empty(), selected: false }, craftedCardSize);
  // zone cards
  const selectedZone = zones.find(x => x.selected === true);
  if (selectedZone === undefined) {
    throw "no selected zone";
  }
  const elementsZoneUnfilled: { node: Ability, selected: boolean }[] = selectedZone.enemyIds.map(x => {
    return {
      node: new SummonNode(x),
      selected: false,
    };
  });
  const elementsZone = fillUndefinedUpTo(elementsZoneUnfilled, { node: new Empty(), selected: false }, 4);

  const elements = elementsCrafts.concat(elementsZone);
  return { elements };
}

export function initialHotbar(): Hotbar {
  return {
    elements: [
      {
        node: new GenerateNode(10, "roh", new PlayerTarget()),
        selected: false,
      },
      {
        node: new GenerateNode(10, "tah", new PlayerTarget()),
        selected: false,
      },
      {
        node: new GenerateNode(10, "sie", new PlayerTarget()),
        selected: false,
      },
      {
        node: new SummonNode("en1"),
        selected: false,
      },
      {
        node: new AttackNode(10, new EnemyTarget()),
        selected: false,
      },
      {
        node: new AddArmor(new PlayerTarget()),
        selected: false,
      },
      {
        node: new AddArmor(new EnemyTarget()),
        selected: false,
      },
      {
        node: new ShieldNode("roh", new PlayerTarget()),
        selected: false,
      },
      {
        node: new ShieldNode("tah", new PlayerTarget()),
        selected: false,
      },
      {
        node: new ShieldNode("sie", new PlayerTarget()),
        selected: false,
      },
      {
        node: new AddArmor2(new PlayerTarget()),
        selected: false,
      },
      {
        node: new Empty,
        selected: false,
      },
      {
        node: new Empty,
        selected: false,
      },
      {
        node: new Empty,
        selected: false,
      },
    ],
  }
}