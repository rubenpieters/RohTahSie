import { GenerateNode, Ability } from "../game/definitions/ability";
import { PlayerTarget } from "../game/definitions/target";

export type CardCrafts = {
  node: Ability,
  included: number,
  available: number,
}[];

export function allCardCrafts(): CardCrafts {
  return [
    {
      node: new GenerateNode(10, "roh", new PlayerTarget()),
      included: 1,
      available: 1,
    },
    {
      node: new GenerateNode(10, "tah", new PlayerTarget()),
      included: 1,
      available: 1,
    },
    {
      node: new GenerateNode(10, "sie", new PlayerTarget()),
      included: 1,
      available: 1,
    },
  ];
}