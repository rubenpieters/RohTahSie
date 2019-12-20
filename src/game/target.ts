import { TargetType } from "./definitions/target";
import { Display } from "./display";
import { EntityDisplay, Entity } from "./entity";
import { GameState } from "./state";

export function targetToEntity<T extends TargetType>(
  target: T,
  state: GameState,
): { "PlayerTarget": Entity, "EnemyTarget": Entity | undefined, "StatusTarget": undefined }[T["tag"]] {
  switch (target.tag) {
    case "PlayerTarget": return state.player.entity;
    case "EnemyTarget": return state.enemy === undefined ? undefined : state.enemy.entity;
    case "StatusTarget": return undefined;
  }
}

export function targetToEntityDisplay<T extends TargetType>(
  target: T,
  display: Display,
): { "PlayerTarget": EntityDisplay, "EnemyTarget": EntityDisplay, "StatusTarget": undefined }[T["tag"]] {
  switch (target.tag) {
    case "PlayerTarget": return display.player.entity;
    case "EnemyTarget": return display.enemy.entity;
    case "StatusTarget": return undefined;
  }
}

export function eqTarget(
  target1: TargetType,
  target2: TargetType,
) {
  switch (target1.tag) {
    case "PlayerTarget": return target2.tag === "PlayerTarget";
    case "EnemyTarget": return target2.tag === "EnemyTarget";
    case "StatusTarget": return target2.tag === "StatusTarget" && target1.id === target2.id;
  }
}