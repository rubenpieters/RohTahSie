import { Ability } from "./definitions/ability";
import { Action, Damage, Regen, ChangeShield, Summon } from "./definitions/action";
import { Display } from "./display";
import { GameState } from "./state";
import { applyActions } from "./action";
import { Cache } from "../app/main";
import { Anim } from "../app/animation";

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
    case "Empty": return [];
  }
}

export function applyAbility(
  ability: Ability,
  state: GameState,
  display: Display,
  cache: Cache,
): Anim {
  const actions = abilityToActions(ability);
  return applyActions(actions, state, display, cache);
}