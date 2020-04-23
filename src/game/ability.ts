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
    case "Dmg1": return "sword";
    case "Dmg2": return "sword";
    case "Dmg3": return "sword";
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
    case "Network": return "network";
    case "Prayer": return "prayer";
    case "Heresy": return "heresy";
    case "Miracle": return "miracle";
    case "GuardianAngel": return "guardianangel";
    case "Homeostasis": return "homeostasis";
    case "Reflex": return "reflex";
    case "Hypertrophy": return "hypertrophy";
    case "Paralysis": return "paralysis";
    case "Memetics": return "sword";
  }
}