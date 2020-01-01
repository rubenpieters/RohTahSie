import { GameState } from "./state";
import { GamePhase, Activating, Charging, Finalizing } from "./definitions/phase";
import { abilityToActions } from "./ability";

export function nextPhase(
  state: GameState,
): GamePhase {
  switch (state.phase.tag) {
    case "Charging": {
      const actionQueue = abilityToActions(state, state.player.layout.nodes[state.player.layout.currentIndex]);
      return new Activating(actionQueue, false, "player");
    }
    case "Activating": {
      // if queue is empty, advance to enemy turn or return to charging phase
      if (state.phase.actionQueue.length === 0) {
        if (state.phase.source === "enemy") {
          return new Finalizing();
        } else if (state.phase.source === "player" && state.enemy !== undefined && ! state.enemy.entity.dirty) {
          const actionQueue = abilityToActions(state, state.enemy.layout.nodes[state.enemy.layout.currentIndex]);
          return new Activating(actionQueue, false, "enemy");
        } else {
          return new Finalizing();
        }
      }
      // if queue is not empty, continue transforming / applying actions
      if (state.phase.transformed) {
        // previous phase was apply phase, set transform flag to false
        return { ...state.phase, transformed: false };
      } else {
        // previous phase was transform phase, set transform flag to true to apply action
        return { ...state.phase, transformed: true };
      }
    }
    case "Finalizing": {
      return new Charging();
    }
  }
}