import { GameNode } from "./gameNode";
import { Cache } from "../app/main";
import { mkAccessTarget, TweenTo, Par, Seq, mkEff, Noop, Anim } from "../app/animation";

export type NodeExplDisplay = {
  container: PIXI.Container,
  bg: PIXI.Sprite,
  title: PIXI.BitmapText,
}

export function initializeNodeExpl(
  parentContainer: PIXI.Container,
  cache: Cache,
): NodeExplDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x: 70, y: 15, alpha: 0 });

  // initialize bgs
  const nodeExplBg = new PIXI.Sprite(cache["node_expl_bg"]);
  container.addChild(nodeExplBg);

  const title = new PIXI.BitmapText("test", {
    font: {
      name: "Bahnschrift",
      size: 32,
    },
    tint: 0xFF0000,
  });
  Object.assign(title, { x: 30, y: 10 });
  container.addChild(title);

  parentContainer.addChild(container);

  return { container, bg: nodeExplBg, title };
}

export function showNodeExpl(
  node: GameNode,
  display: NodeExplDisplay,
): Anim {
  return new Seq([
    mkEff({
      eff: () => {
        display.container.visible = true;
      },
      k: () => new Noop(),
    }),
    new Par([
      new TweenTo(0.1, 45, "absolute", mkAccessTarget(display.container, "y")),
      new TweenTo(0.1, 1, "absolute", mkAccessTarget(display.container, "alpha")),
    ]),
  ]);
}

export function hideNodeExpl(
  display: NodeExplDisplay,
): Anim {
  return new Seq([
    new TweenTo(0.1, 0, "absolute", mkAccessTarget(display.container, "alpha")),
    mkEff({
      eff: () => {
        display.container.visible = false;
        display.container.y = 15;
      },
      k: () => new Noop(),
    }),
  ]);
}