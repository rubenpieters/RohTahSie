import { GameNode } from "./gameNode";
import { Cache } from "../app/main";
import { mkAccessTarget, TweenTo, Par, Seq, mkEff, Noop, Anim } from "../app/animation";

export type NodeExplDisplay = {
  container: PIXI.Container,
  bg: PIXI.Sprite,
  title: PIXI.BitmapText,
  effects: PIXI.BitmapText,
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

  // initialize title text
  const title = new PIXI.BitmapText("", {
    font: {
      name: "Bahnschrift",
      size: 32,
    },
    tint: 0xFF0000,
  });
  Object.assign(title, { x: 30, y: 10 });
  container.addChild(title);

  // intialize effect text
  const effects = new PIXI.BitmapText("", {
    font: {
      name: "Bahnschrift",
      size: 32,
    },
    tint: 0xFF0000,
  });
  Object.assign(effects, { x: 30, y: 80 });
  container.addChild(effects);

  parentContainer.addChild(container);

  return { container, bg: nodeExplBg, title, effects };
}

export function showNodeExpl(
  node: GameNode,
  display: NodeExplDisplay,
): Anim {
  return new Seq([
    mkEff({
      eff: () => {
        display.container.visible = true;
        display.title.text = node.tag;
        display.effects.text = nodeEffects(node);
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
      eff: () => resetNodeExpl(display),
      k: () => new Noop(),
    }),
  ]);
}

export function resetNodeExpl(
  display: NodeExplDisplay,
) {
  display.container.visible = false;
  display.container.y = 15;
  display.container.alpha = 0;
}

function nodeEffects(
  node: GameNode,
) {
  switch (node.tag) {
    case "AttackNode": return `-${node.damage} ${node.resource} to ${node.target}`;
    case "SummonNode": return `summon ${node.enemyId}`;
    case "GenerateNode": return `+${node.value} ${node.resource} to ${node.target}`;
    case "Empty": return `no effect`
  }
}