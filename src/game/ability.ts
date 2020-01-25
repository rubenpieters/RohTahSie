import { Ability } from "./definitions/ability";
import { actionExpl } from "./action";

export function abilityExpl(
  ability: Ability,
): string[] {
  return ability.actions.map(actionExpl);
}

export function abilityExplFormatted(
  ability: Ability,
): string {
  return "- " + abilityExpl(ability).join("\n- ");
}