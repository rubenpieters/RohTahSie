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

export function gameLoopAnimation(
  state: GameState,
  display: Display,
  cache: Cache,
): Anim {
  return new Seq([
    new Par([
      // advance player bar animation
      new TweenTo(1, 50, "relativeIncrease", mkAccessTarget(display.player.layout.bar, "x")),
      // advance enemy bar animation
      new TweenTo(1, 50, "relativeIncrease", mkAccessTarget(display.enemy.layout.bar, "x")),
    ]),
    // fade out bar
    new Par([
      new TweenTo(0.25, 2, "absolute", mkAccessTarget(display.player.layout.bar.scale, "x")),
      new TweenTo(0.25, 2, "absolute", mkAccessTarget(display.player.layout.bar.scale, "y")),
      new TweenTo(0.25, 0, "absolute", mkAccessTarget(display.player.layout.bar, "alpha")),
      new TweenTo(0.25, 2, "absolute", mkAccessTarget(display.enemy.layout.bar.scale, "x")),
      new TweenTo(0.25, 2, "absolute", mkAccessTarget(display.enemy.layout.bar.scale, "y")),
      new TweenTo(0.25, 0, "absolute", mkAccessTarget(display.enemy.layout.bar, "alpha")),
    ]),
    mkEff({
      eff: () => {
        // capture just completed player node
        const justCompletedNodes = {
          player: state.player.layout.nodes[state.player.layout.currentIndex],
          enemy: state.enemy === undefined ? undefined : state.enemy.layout.nodes[state.enemy.layout.currentIndex]
        }
        // reset bar values
        display.player.layout.bar.alpha = 1;
        display.player.layout.bar.scale.x = 1;
        display.player.layout.bar.scale.y = 1;
        display.enemy.layout.bar.alpha = 1;
        display.enemy.layout.bar.scale.x = 1;
        display.enemy.layout.bar.scale.y = 1;
        // advance current node for player
        state.player.layout.currentIndex += 1;
        if (state.player.layout.currentIndex >= state.player.layout.nodes.length) {
          state.player.layout.currentIndex = 0;
        }
        Object.assign(display.player.layout.bar, barLocation(state.player.layout.currentIndex));
        // advance current node for enemy
        if (state.enemy !== undefined) {
          state.enemy.layout.currentIndex += 1;
          if (state.enemy.layout.currentIndex >= state.enemy.layout.nodes.length) {
            state.enemy.layout.currentIndex = 0;
          }
          Object.assign(display.enemy.layout.bar, barLocation(state.enemy.layout.currentIndex));
        }
        // return just completed node
        return justCompletedNodes;
      },
      k: (completedNodes: { player: GameNode, enemy: GameNode | undefined }) => {
        // embed node activation animation
        return new Seq([
          activateAndAnimateNode(completedNodes.player, state, display, cache),
          completedNodes.enemy === undefined ? new Noop() : activateAndAnimateNode(completedNodes.enemy, state, display, cache),
        ]);
      },
    }),
  ]);
}

function activateAndAnimateNode(
  node: GameNode,
  state: GameState,
  display: Display,
  cache: Cache,
) {
  return mkEff({
    eff: () => {
      activateNode(node, state);
    },
    k: () => {
      return activateNodeAnim(node, state, display, cache)
    },
  })
}