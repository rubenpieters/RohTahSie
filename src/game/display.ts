import { LayoutDisplay, barLocation } from "./layout";
import { EntityDisplay } from "./entity";
import { Anim, Seq, mkEff, Noop, TweenTo, Par, mkAccessTarget } from "../app/animation";
import { GameState, GameStateBase } from "./state";
import { concretizeAction } from "./action";
import { Action } from "./definitions/action";
import { Cache } from "../app/main";
import { HotbarDisplay } from "./hotbar";
import { NodeExplDisplay } from "./nodeExpl";
import { Pools } from "../app/pool";
import { PlayerTarget, EnemyTarget, AbstractTarget } from "./definitions/target";
import { applyAction } from "./action";
import { Activating } from "./definitions/phase";
import { applyStatuses } from "./status";
import { MenuDisplay } from "../menu/menu";
import { CardCraftDisplay } from "../craft/card";
import { ZoneOverviewDisplay } from "../zone/zone";

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
  menu: MenuDisplay,
  combatContainer: PIXI.Container,
  craftContainer: PIXI.Container,
  zoneContainer: PIXI.Container,
  cardCraft: CardCraftDisplay,
  zone: ZoneOverviewDisplay,
}


export function chargingAnimation(
  state: GameState,
  display: Display,
  cache: Cache,
) {
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
          
          // reset enemy dirty status
          state.enemy.entity.dirty = false;
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
  ]);
}

export function applyingAnimation(
  state: GameStateBase & { phase: Activating },
  display: Display,
  cache: Cache,
) {
  const action = state.phase.actionQueue.shift();
  if (action === undefined) {
    return new Noop();
  }
  const source = state.phase.source;
  const fadeOutBar = display[source].layout.bar.alpha < Number.EPSILON * 100 ?
    new Noop() :
    new Par([
      new TweenTo(0.5, 2, "absolute", mkAccessTarget(display[source].layout.bar.scale, "x")),
      new TweenTo(0.5, 2, "absolute", mkAccessTarget(display[source].layout.bar.scale, "y")),
      new TweenTo(0.5, 0, "absolute", mkAccessTarget(display[source].layout.bar, "alpha")),
    ]);
  return mkEff({
    eff: () => {
      // TODO: set aside next to be applied Action<ConcreteTarget>, queue is a list of Action<AbstractTarget>
      const { animation, newActions } = applyAction(action, state, display, cache);
      const newActionQueue = newActions.concat(state.phase.actionQueue);
      state.phase.actionQueue = newActionQueue;
      return animation;
    },
    k: (animation: Anim) => {
      return new Par([fadeOutBar, animation]);
    },
  });
}

export function transformingAnimation(
  state: GameStateBase & { phase: Activating },
  display: Display,
  cache: Cache,
) {
  const action = state.phase.actionQueue.shift();
  if (action === undefined) {
    return new Noop();
  }
  const source = state.phase.source;
  return mkEff({
    eff: () => {
      const origin = source === "player" ? new PlayerTarget() : new EnemyTarget();
      const concretized = concretizeAction(action, source);
      const { transformed, newActions } = applyStatuses(concretized, origin, state);
      state.phase.actionQueue = ([transformed] as Action<AbstractTarget>[])
        .concat(newActions).concat(state.phase.actionQueue);
      return new Noop();
    },
    k: (animation: Anim) => {
      return animation;
    },
  });
}

export function finalizingAnimation(
  state: GameState,
  display: Display,
  cache: Cache,
): Anim {
  return mkEff({
    eff: () => {
      // advance current node for player
      state.player.layout.currentIndex += 1;
      if (state.player.layout.currentIndex >= state.player.layout.nodes.length) {
        state.player.layout.currentIndex = 0;
      }
      // advance current node for enemy
      if (state.enemy !== undefined && ! state.enemy.entity.dirty) {
        state.enemy.layout.currentIndex += 1;
        if (state.enemy.layout.currentIndex >= state.enemy.layout.nodes.length) {
          state.enemy.layout.currentIndex = 0;
        }
      }
    },
    k: () => new Noop(),
  });
}
