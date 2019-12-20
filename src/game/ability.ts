import { Ability } from "./definitions/ability";
import { Action, Damage, Regen, ChangeShield, Summon, AddStatus } from "./definitions/action";
import { Display } from "./display";
import { GameState } from "./state";
import { applyActions } from "./action";
import { Cache } from "../app/main";
import { Anim } from "../app/animation";
import { Armor } from "./definitions/status";
import { TargetType } from "./types";

export function abilityToActions(
  ability: Ability,
): Action[] {
  switch (ability.tag) {
    case "AttackNode": {
      return [
        new Damage(ability.damage, ability.target),
      ];
    }
    case "GenerateNode": {
      return [
        new Regen(ability.value, ability.resource, ability.target),
      ];
    }
    case "ShieldNode": {
      return [
        new ChangeShield(ability.resource, ability.target),
      ];
    }
    case "SummonNode": {
      return [
        new Summon(ability.enemyId),
      ];
    }
    case "AddArmor": {
      return [
        new AddStatus(new Armor(5), ability.target),
      ];
    }
    case "Empty": return [];
  }
}

export function applyAbility(
  ability: Ability,
  origin: TargetType,
  state: GameState,
  display: Display,
  cache: Cache,
): Anim {
  const actions = abilityToActions(ability);
  return applyActions(actions, origin, state, display, cache);
}