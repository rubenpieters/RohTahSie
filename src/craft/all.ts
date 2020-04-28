import { Ability } from "../game/definitions/ability";
import * as Ab from "../game/definitions/ability";
import { DirAbility } from "src/game/definitions/dirAbility";
import * as DAb from "../game/definitions/dirAbility";

export type CardCrafts = {
  node: Ability,
  included: number,
  available: number,
  cost: number,
}[];

export function allCardCrafts(): CardCrafts {
  return [
    {
      node: new Ab.Dmg1(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Dmg2(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Dmg3(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Buff1(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Buff2(),
      included: 1,
      available: 1,
      cost: 0,
    },
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
    {
      node: new Ab.Hypertrophy(),
      included: 0,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Paralysis(),
      included: 0,
      available: 1,
      cost: 0,
    },
    {
      node: new Ab.Memetics(),
      included: 0,
      available: 1,
      cost: 0,
    },
  ];
}

export type DirCrafts = {
  node: DirAbility,
  included: number,
  available: number,
  cost: number,
}[];

export function allDirCrafts(): DirCrafts {
  return [
    {
      node: new DAb.MoveDown(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new DAb.MoveUp(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new DAb.MoveRight(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new DAb.MoveLeft(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new DAb.MoveDownEssenceLow(),
      included: 1,
      available: 1,
      cost: 0,
    },
    {
      node: new DAb.MoveUpEssenceHigh(),
      included: 1,
      available: 1,
      cost: 0,
    },
  ];
}