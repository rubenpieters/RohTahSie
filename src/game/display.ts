import { LayoutDisplay, barLocation, newLayoutAnim } from "./layout";
import { EntityDisplay, newEntityAnim } from "./entity";
import { Anim, Seq, mkEff, Noop, TweenTo, Par, mkAccessTarget } from "../app/animation";
import { GameState, activateNode, initializeState } from "./state";
import { GameNode } from "./gameNode";
import { Cache } from "../app/main";
import { HotbarDisplay, newHotbarAnim } from "./hotbar";
import { NodeExplDisplay } from "./nodeExpl";
import { Pools } from "../app/pool";

export type Display = {
  player: {
    entity: EntityDisplay,
    layout: LayoutDisplay,
    hotbar: HotbarDisplay,
    nodeExpl: NodeExplDisplay,
  },
  enemy: {
    entity: EntityDisplay,
    layout: LayoutDisplay,
  },
  pools: Pools,
}

export function gameLoopAnimation(
  state: GameState,
  display: Display,
  cache: Cache,
): Anim {
  return new Seq([
    mkEff({
      eff: () => {
        // reset bar values
        display.player.layout.bar.alpha = 1;
        display.player.layout.bar.scale.x = 1;
        display.player.layout.bar.scale.y = 1;
        Object.assign(display.player.layout.bar, barLocation(state.player.layout.currentIndex));
        if (state.enemy !== undefined) {
          display.enemy.layout.bar.alpha = 1;
          display.enemy.layout.bar.scale.x = 1;
          display.enemy.layout.bar.scale.y = 1;
          Object.assign(display.enemy.layout.bar, barLocation(state.enemy.layout.currentIndex));
        }
      },
      k: () => new Noop(),
    }),
    new Par([
      // advance player bar animation
      new TweenTo(1, 50, "relativeIncrease", mkAccessTarget(display.player.layout.bar, "x")),
      // advance enemy bar animation
      // TODO: do not move bar if no enemy?
      new TweenTo(1, 50, "relativeIncrease", mkAccessTarget(display.enemy.layout.bar, "x")),
    ]),
    mkEff({
      eff: () => {
        // capture just completed player node
        const justCompletedNodes = {
          player: state.player.layout.nodes[state.player.layout.currentIndex],
          enemy: state.enemy === undefined ? undefined : state.enemy.layout.nodes[state.enemy.layout.currentIndex]
        }
        // advance current node for player
        state.player.layout.currentIndex += 1;
        if (state.player.layout.currentIndex >= state.player.layout.nodes.length) {
          state.player.layout.currentIndex = 0;
        }
        // advance current node for enemy
        if (state.enemy !== undefined) {
          state.enemy.layout.currentIndex += 1;
          if (state.enemy.layout.currentIndex >= state.enemy.layout.nodes.length) {
            state.enemy.layout.currentIndex = 0;
          }
        }
        // return just completed node
        return justCompletedNodes;
      },
      k: (completedNodes: { player: GameNode, enemy: GameNode | undefined }) => {
        // embed node activation animation
        return new Seq([
          activateAndAnimateNode("player", completedNodes.player, state, display, cache),
          completedNodes.enemy === undefined ? new Noop() :
            activateAndAnimateNode("enemy", completedNodes.enemy, state, display, cache),
          playerCheckDieAnimation(state, display, cache),
        ]);
      },
    }),
  ]);
}

export function playerCheckDieAnimation(
  state: GameState,
  display: Display,
  cache: Cache,
): Anim {
  return mkEff({
    eff: () => {
      return state.player.entity.roh <= 0 ||
      state.player.entity.tah <= 0 ||
      state.player.entity.sie <= 0;
    },
    k: (playerDead: boolean) => {
      if (! playerDead) {
        return new Noop();
      }
      return mkEff({
        eff: () => {
          initializeState(state);
        },
        k: () => new Seq([
          newEntityAnim(state.player.entity, display.player.entity, cache),
          newEntityAnim(state.enemy === undefined ? undefined : state.enemy.entity, display.enemy.entity, cache),
          newLayoutAnim(state.player.layout, display.player.layout, cache),
          newLayoutAnim(state.enemy === undefined ? undefined : state.enemy.layout, display.enemy.layout, cache),
          newHotbarAnim(state.player.hotbar, display.player.hotbar, cache),
        ]),
      });
    },
  });
}

function activateAndAnimateNode(
  source: "player" | "enemy",
  node: GameNode,
  state: GameState,
  display: Display,
  cache: Cache,
) {
  const fadeOutBar = new Par([
    new TweenTo(0.5, 2, "absolute", mkAccessTarget(display[source].layout.bar.scale, "x")),
    new TweenTo(0.5, 2, "absolute", mkAccessTarget(display[source].layout.bar.scale, "y")),
    new TweenTo(0.5, 0, "absolute", mkAccessTarget(display[source].layout.bar, "alpha")),
  ]);
  return mkEff({
    eff: () => {
      return activateNode(node, state, display, cache);
    },
    k: (anim: Anim) => {
      return new Par([fadeOutBar, anim]);
    },
  })
}