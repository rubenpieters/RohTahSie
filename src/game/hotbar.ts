import { GameNode, SummonNode, GenerateNode, AttackNode } from "./gameNode";
import { Cache, attachAnimation } from "../app/main";
import { nodeSprite } from "./state";
import { Anim, TweenTo, mkAccessTarget, Par } from "../app/animation";
import { IPoint } from "pixi.js";

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
  cache: Cache,
): HotbarDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x, y });

  let elements: PIXI.Sprite[] = [];

  let i = 0;
  for (const element of hotbar.elements) {
    const box = new PIXI.Sprite(cache[nodeSprite(element.node)]);
    box.x = i * 55;
    box.pivot.set(25, 25);

    box.interactive = true;

    box.on("mouseover", () => {
      attachAnimation(hotbarMouseOverAnim(box));
    });
    box.on("mouseout", hotbarMouseOutCb(hotbar, box, i));
    box.on("mousedown", hotbarMouseDownCb(hotbar, elements, i));

    container.addChild(box);
    elements.push(box);
    i++;
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
  hotbar: Hotbar,
  box: PIXI.Sprite,
  index: number,
): () => void {
  return () => {
    if (! hotbar.elements[index].selected) {
      attachAnimation(hotbarMouseOutAnim(box));
    }
  };
}

function hotbarMouseDownCb(
  hotbar: Hotbar,
  hotbarElements: PIXI.Sprite[],
  index: number,
): () => void {
  return () => {
    for (let i = 0; i < hotbar.elements.length; i++) {
      if (i !== index && hotbar.elements[i].selected) {
        attachAnimation(hotbarMouseOutAnim(hotbarElements[i]));
        hotbar.elements[i].selected = false;
      }
    }
    hotbar.elements[index].selected = ! hotbar.elements[index].selected;
  };
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