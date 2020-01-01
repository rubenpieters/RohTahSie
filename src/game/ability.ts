import { Ability } from "./definitions/ability";
import { Action, Damage, Regen, ChangeShield, Summon, AddStatus, Cost } from "./definitions/action";
import { Display } from "./display";
import { GameState } from "./state";
import { applyActions } from "./action";
import { Cache } from "../app/main";
import { Anim } from "../app/animation";
import { Armor1, Armor2 } from "./definitions/status";
import { TargetType, EnemyTarget, PlayerTarget } from "./definitions/target";

export function abilityToActions(
  state: GameState,
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
        new AddStatus(new Armor1(4, 5), ability.target),
      ];
    }
    case "AddArmor2": {
      return [
        new AddStatus(new Armor2(1, 1, 6), ability.target),
      ];
    }
    case "Harvest": {
      return [
        new Cost(3, "tah", new PlayerTarget()),
        new Damage(5, new EnemyTarget()),
      ];
    }
    case "Empty": return [];
  }
}