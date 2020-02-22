import { Ability } from "./definitions/ability";
import { actionExpl } from "./action";
import { CacheValues } from "src/app/main";

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

export function nodeSprite(
  ability: Ability,
): CacheValues {
  switch (ability.name) {
    case "Rest": return "rest";
    case "Meditation": return "meditation";
    case "Requiem": return "requiem";
    case "Discussion": return "discussion";
    case "Community": return "sword";
    case "Isolation": return "sword";
    case "Dormant": return "skip";
    case "Initiate": return "creep";
    case "Demon": return "ability1";
    case "Infection": return "ability1";
  }
}