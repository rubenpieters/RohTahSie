import { Ability } from "./definitions/ability";
import { Action, Damage, Regen, ChangeShield, Summon, AddStatus, Cost } from "./definitions/action";
import { GameState } from "./state";
import { Armor1, Armor2, Dmg1 } from "./definitions/status";
import { EnemyTarget, PlayerTarget } from "./definitions/target";

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
    case "AddDmg1": {
      return [
        new AddStatus(new Dmg1(1, 1, 10), new PlayerTarget()),
      ];
    }
    case "Empty": return [];
  }
}