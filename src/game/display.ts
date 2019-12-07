import { LayoutDisplay, barLocation } from "./layout";
import { EntityDisplay } from "./entity";
import { Anim, Seq, mkEff, Noop, TweenTo, Par, mkAccessTarget } from "../app/animation";
import { GameState, activateNode, activateNodeAnim } from "./state";
import { GameNode } from "./gameNode";
import { Cache } from "../app/main";

export type Display = {
  player: {
    entity: EntityDisplay,
    layout: LayoutDisplay,
  },
  enemy: {
    entity: EntityDisplay,
    layout: LayoutDisplay,
  },
}

export function gameLoopAnimation(state: GameState, display: Display, cache: Cache): Anim {
  return new Seq([
    // advance bar animation
    new TweenTo(1, 50, "relativeIncrease", mkAccessTarget(display.player.layout.bar, "x")),
    // fade out bar
    new Par([
      new TweenTo(0.25, 2, "absolute", mkAccessTarget(display.player.layout.bar.scale, "x")),
      new TweenTo(0.25, 2, "absolute", mkAccessTarget(display.player.layout.bar.scale, "y")),
      new TweenTo(0.25, 0, "absolute", mkAccessTarget(display.player.layout.bar, "alpha")),
    ]),
    mkEff({
      eff: () => {
        // activate just completed node
        const justCompletedNode = state.player.layout.nodes[state.player.layout.currentIndex];
        activateNode(justCompletedNode, state);
        // reset bar values
        display.player.layout.bar.alpha = 1;
        display.player.layout.bar.scale.x = 1;
        display.player.layout.bar.scale.y = 1;
        // advance current node
        state.player.layout.currentIndex += 1;
        if (state.player.layout.currentIndex >= state.player.layout.nodes.length) {
          state.player.layout.currentIndex = 0;
        }
        Object.assign(display.player.layout.bar, barLocation(state.player.layout.currentIndex));
        // return just completed node
        return justCompletedNode;
      },
      k: (node: GameNode) => {
        // embed node activation animation
        return activateNodeAnim(node, state, display, cache);
      },
    }),
  ]);
}