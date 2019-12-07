import { LayoutDisplay, barLocation } from "./layout";
import { EntityDisplay } from "./entity";
import { Anim, Seq, mkEff, Noop, TweenTo, Par, mkAccessTarget } from "../app/animation";
import { GameState, activateNode, activateNodeAnim } from "./state";
import { GameNode } from "./gameNode";

export type Display = {
  player: {
    entity: EntityDisplay,
    layout: LayoutDisplay,
  },
}

export function gameLoopAnimation(state: GameState, display: Display): Anim {
  return new Seq([
    mkEff({
      eff: () => {
        display.player.layout.bar.alpha = 1;
        display.player.layout.bar.scale.x = 1;
        display.player.layout.bar.scale.y = 1;
        state.player.layout.currentIndex += 1;
        if (state.player.layout.currentIndex >= state.player.layout.nodes.length) {
          state.player.layout.currentIndex = 0;
        }
        Object.assign(display.player.layout.bar, barLocation(state.player.layout.currentIndex));
      },
    k: () => new Noop()
    }),
    new TweenTo(1, 50, "relativeIncrease", mkAccessTarget(display.player.layout.bar, "x")),
    new Par([
      new TweenTo(0.25, 2, "absolute", mkAccessTarget(display.player.layout.bar.scale, "x")),
      new TweenTo(0.25, 2, "absolute", mkAccessTarget(display.player.layout.bar.scale, "y")),
      new TweenTo(0.25, 0, "absolute", mkAccessTarget(display.player.layout.bar, "alpha")),
    ]),
    mkEff({
      eff: () => {
        activateNode(state.player.layout.nodes[state.player.layout.currentIndex], state);
        return state.player.layout.nodes[state.player.layout.currentIndex];
      },
      k: (node: GameNode) => {
        return activateNodeAnim(node, state, display);
      },
    }),
  ]);
}