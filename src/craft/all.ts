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
      node: new Ab.FocusRoh(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.FocusTah(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.FocusSie(),
      included: 1,
      available: 1,
      cost: 0,
    },
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
      included: 0,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Isolation(),
      included: 0,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Demon(),
      included: 0,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.VoodooDoll(),
      included: 0,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Network(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Prayer(),
      included: 0,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Heresy(),
      included: 0,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Miracle(),
      included: 0,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.GuardianAngel(),
      included: 0,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Homeostasis(),
      included: 0,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Reflex(),
      included: 1,
      available: 1,
      cost: 0,
    },
  ];
}