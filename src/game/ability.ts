import { Ability } from "./definitions/ability";
import { actionExpl } from "./action";
import { CacheValues } from "src/app/main";
import { combineExpl, SideExpl } from "./nodeExpl";

export function abilityExpl(
  ability: Ability,
): { mainExpl: string[], sideExpl: SideExpl[] } {
  return combineExpl(ability.actions, actionExpl);
}

export function nodeSprite(
  ability: Ability,
): CacheValues {
  switch (ability.name) {
    case "FocusRoh": return "sword";
    case "FocusTah": return "sword";
    case "FocusSie": return "sword";
    case "Rest": return "rest";
    case "Meditation": return "meditation";
    case "Requiem": return "requiem";
    case "Discussion": return "discussion";
    case "Community": return "sword";
    case "Isolation": return "isolation";
    case "Dormant": return "skip";
    case "Initiate": return "initiate";
    case "Demon": return "demon";
    case "Infection": return "infection";
    case "VoodooDoll": return "voodoodoll";
    case "Network": return "ability1";
    case "Heresy": return "heresy";
    case "Miracle": return "ability1";
    case "GuardianAngel": return "ability1";
    case "Homeostasis": return "ability1";
  }
}