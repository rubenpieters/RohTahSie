import { GameNode } from "./gameNode";
import { Cache } from "../app/main";
import { mkAccessTarget, TweenTo, Par, Seq, mkEff, Noop, Anim } from "../app/animation";

export type NodeExplDisplay = {
  container: PIXI.Container,
  bg: PIXI.Sprite,
}

export function initializeNodeExpl(
  parentContainer: PIXI.Container,
  cache: Cache,
): NodeExplDisplay {
  const container = new PIXI.Container();
  Object.assign(container, { x: 30, alpha: 0 });

  // initialize bgs
  const nodeExplBg = new PIXI.Sprite(cache["node_expl_bg"]);
  container.addChild(nodeExplBg);

  parentContainer.addChild(container);

  return { container, bg: nodeExplBg };
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
      new TweenTo(0.1, 60, "absolute", mkAccessTarget(display.container, "y")),
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
        display.container.y = 30;
      },
      k: () => new Noop(),
    }),
  ]);
}