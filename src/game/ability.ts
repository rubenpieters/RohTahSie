import { Ability } from "./definitions/ability";
import { actionExpl } from "./action";
import { CacheValues } from "src/app/main";
import { combineExpl, SideExpl } from "./nodeExpl";

export function abilityExpl(
  ability: Ability,
): { mainExpl: string[], sideExpl: SideExpl[] } {
  return combineExpl(ability.actions, actionExpl);
}

export function abilityExplFormatted(
  ability: Ability,
): { mainExpl: string, sideExpl: SideExpl[] } {
  const { mainExpl, sideExpl } = abilityExpl(ability);
  return {
    mainExpl: "- " + mainExpl.join("\n- "),
    sideExpl,
  };
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
    case "Demon": return "test";
    case "Infection": return "ability1";
    case "VoodooDoll": return "ability1";
  }
}