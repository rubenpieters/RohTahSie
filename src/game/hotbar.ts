import { Ability, SummonNode, GenerateNode, AttackNode, ShieldNode, Empty } from "./definitions/ability";
import { Cache, attachAnimation, attachExplWindowAnimation, clearExplWindowAnimation } from "../app/main";
import { nodeSprite, GameState } from "./state";
import { Anim, TweenTo, mkAccessTarget, Par, mkEff, Noop } from "../app/animation";
import { IPoint } from "pixi.js";
import { Display } from "./display";
import { showNodeExpl, NodeExplDisplay, hideNodeExpl, resetNodeExpl } from "./nodeExpl";

const hotbarSize = 14;
const xAmount = 7;
const yAmount = 2;

export type Hotbar = {
  elements: {
    node: Ability,
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
  display: Display,
  cache: Cache,
): HotbarDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x, y });

  let elements: PIXI.Sprite[] = [];

  for (let i = 0; i < hotbarSize; i++) {
    const element = hotbar.elements[i];
    const box = new PIXI.Sprite(cache[nodeSprite(element.node)]);
    box.x = (i % xAmount) * 55;
    box.y = Math.floor(i / xAmount) * 55;
    box.pivot.set(25, 25);

    box.interactive = true;

    box.on("mouseover", () => {
      attachAnimation(hotbarMouseOverAnim(box));
      clearExplWindowAnimation();
      resetNodeExpl(display.player.nodeExpl);
      attachExplWindowAnimation(showNodeExpl(state.player.hotbar.elements[i].node, display.player.nodeExpl));
    });
    box.on("mouseout", hotbarMouseOutCb(state, box, display, i));
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
): Ability | undefined {
  const selectedElement = hotbar.elements.find(x => x.selected);
  return selectedElement === undefined ? undefined : selectedElement.node;
}

export function initialHotbar(): Hotbar {
  return {
    elements: [
      {
        node: new GenerateNode(10, "roh", "player"),
        selected: false,
      },
      {
        node: new GenerateNode(10, "tah", "player"),
        selected: false,
      },
      {
        node: new GenerateNode(10, "sie", "player"),
        selected: false,
      },
      {
        node: new SummonNode("en1"),
        selected: false,
      },
      {
        node: new AttackNode(10, "enemy"),
        selected: false,
      },
      {
        node: new AttackNode(10, "enemy"),
        selected: false,
      },
      {
        node: new AttackNode(10, "enemy"),
        selected: false,
      },
      {
        node: new ShieldNode("roh", "player"),
        selected: false,
      },
      {
        node: new ShieldNode("tah", "player"),
        selected: false,
      },
      {
        node: new ShieldNode("sie", "player"),
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
      {
        node: new Empty,
        selected: false,
      },
    ],
  }
}