import { DirAbility, MoveRight, MoveLeft, MoveUp, MoveDown } from "./definitions/dirAbility";
import { CacheValues } from "src/app/main";
import { Dir } from "./dir";

export function dirAbilitySprite(
  ability: DirAbility,
): {
  sprite: CacheValues,
  angle: number,
 } {
  switch (ability.name) {
    case "MoveRight": return { sprite: "ability_slot_r", angle: 0 };
    case "MoveLeft": return { sprite: "ability_slot_r", angle: 180 };
    case "MoveUp": return { sprite: "ability_slot_r", angle: -90 };
    case "MoveDown": return { sprite: "ability_slot_r", angle: 90 };
  }
}

export function dirToAbility(
  dir: Dir
): DirAbility {
  switch (dir) {
    case "right": return new MoveRight();
    case "left": return new MoveLeft();
    case "up": return new MoveUp();
    case "down": return new MoveDown();
  }
}