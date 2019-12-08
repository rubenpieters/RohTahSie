import { GameNode, SummonNode, GenerateNode, AttackNode } from "./gameNode";
import { Cache, attachAnimation } from "../app/main";
import { nodeSprite, GameState } from "./state";
import { Anim, TweenTo, mkAccessTarget, Par, mkEff, Noop } from "../app/animation";
import { IPoint } from "pixi.js";

const hotbarSize = 5;

export type Hotbar = {
  elements: {
    node: GameNode,
    selected: boolean,
  }[],
}

export type HotbarDisplay = {
  container: PIXI.Container,
  elements: PIXI.Sprite[],
}

export function initializeHotbar(
  hotbar: Hotbar,
  x: number,
  y: number,
  parentContainer: PIXI.Container,
  state: GameState,
  cache: Cache,
): HotbarDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x, y });

  let elements: PIXI.Sprite[] = [];

  for (let i = 0; i < hotbarSize; i++) {
    const element = hotbar.elements[i];
    const box = new PIXI.Sprite(cache[nodeSprite(element.node)]);
    box.x = i * 55;
    box.pivot.set(25, 25);

    box.interactive = true;

    box.on("mouseover", () => {
      attachAnimation(hotbarMouseOverAnim(box));
    });
    box.on("mouseout", hotbarMouseOutCb(state, box, i));
    box.on("mousedown", hotbarMouseDownCb(state, elements, i));

    container.addChild(box);
    elements.push(box);
  }

  parentContainer.addChild(container);

  return { container, elements };
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
  index: number,
): () => void {
  return () => {
    if (! state.player.hotbar.elements[index].selected) {
      attachAnimation(hotbarMouseOutAnim(box));
    }
  };
}

function hotbarMouseDownCb(
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
  })
}

export function hotbarSelectedNode(
  hotbar: Hotbar,
): GameNode | undefined {
  const selectedElement = hotbar.elements.find(x => x.selected);
  return selectedElement === undefined ? undefined : selectedElement.node;
}

export function initialHotbar(): Hotbar {
  return {
    elements: [
      {
        node: new GenerateNode("roh"),
        selected: false,
      },
      {
        node: new GenerateNode("tah"),
        selected: false,
      },
      {
        node: new GenerateNode("sie"),
        selected: false,
      },
      {
        node: new SummonNode("en1"),
        selected: false,
      },
      {
        node: new AttackNode(50, "roh", "enemy"),
        selected: false,
      },
    ],
  }
}