import * as lo from "lodash";
import { GameState } from "./state";
import { GamePhase, Transforming, Applying, Charging, Finalizing } from "./definitions/phase";
import { EndTurn } from "./definitions/action";

export function nextPhase(
  state: GameState,
): GamePhase {
  switch (state.phase.tag) {
    case "Charging": {
      const actionQueue = lo.cloneDeep(state.player.layout.nodes[state.player.layout.currentIndex].actions);
      actionQueue.push(new EndTurn());
      return new Transforming(actionQueue, "player");
    }
    case "Transforming": {
      if (state.phase.afterTransform === undefined) {
        // if after transform is empty, skip
        if (state.phase.source === "enemy") {
          return new Finalizing();
        } else if (state.phase.source === "player" && state.enemy !== undefined && ! state.enemy.entity.dirty) {
          const actionQueue = lo.cloneDeep(state.enemy.layout.nodes[state.enemy.layout.currentIndex].actions);
          actionQueue.push(new EndTurn());
          return new Transforming(actionQueue, "enemy");
        } else {
          return new Finalizing();
        }
      } else {
        // else go to applying phase
        return { ...state.phase, tag: "Applying", nextAction: state.phase.afterTransform };
      }
    }
    case "Applying": {
      // if queue is empty, advance to enemy turn or return to charging phase
      if (state.phase.actionQueue.length === 0) {
        if (state.phase.source === "enemy") {
          return new Finalizing();
        } else if (state.phase.source === "player" && state.enemy !== undefined && ! state.enemy.entity.dirty) {
          const actionQueue = lo.cloneDeep(state.enemy.layout.nodes[state.enemy.layout.currentIndex].actions);
          actionQueue.push(new EndTurn());
          return new Transforming(actionQueue, "enemy");
        } else {
          return new Finalizing();
        }
      }
      // otherwise, go to transforming phase
      return { ...state.phase, tag: "Transforming" };
    }
    case "Finalizing": {
      return new Charging();
    }
  }
}