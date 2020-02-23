import { Ability } from "../game/definitions/ability";
import * as  Ab from "../game/definitions/ability";

export type CardCrafts = {
  node: Ability,
  included: number,
  available: number,
  cost: number,
}[];

export function allCardCrafts(): CardCrafts {
  return [
    {
      node: new Ab.Rest(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Meditation(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Requiem(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Discussion(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Community(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Isolation(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Demon(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.VoodooDoll(),
      included: 1,
      available: 1,
      cost: 0,
    },
  ];
}