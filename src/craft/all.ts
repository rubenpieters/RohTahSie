import { GenerateNode, Ability, AttackNode, Harvest, AddDmg1 } from "../game/definitions/ability";
import { PlayerTarget, EnemyTarget } from "../game/definitions/target";

export type CardCrafts = {
  node: Ability,
  included: number,
  available: number,
  cost: number,
}[];

export function allCardCrafts(): CardCrafts {
  return [
    {
      node: new GenerateNode(10, "roh", new PlayerTarget()),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new GenerateNode(10, "tah", new PlayerTarget()),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new GenerateNode(10, "sie", new PlayerTarget()),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new Harvest(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new AddDmg1(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new GenerateNode(10, "sie", new PlayerTarget()),
      included: 0,
      available: 0,
      cost: 10,
    },
  ];
}