import { EnemyKey } from "../enemy";
import { Action, Damage, Regen, ChangeShield, Summon } from "./action";
import { ResourceType, TargetType } from "../types";

export class GenerateNode {
  public readonly tag: "GenerateNode" = "GenerateNode";
  public readonly size = 1;

  constructor(
    public readonly value: number,
    public readonly resource: ResourceType,
    public readonly target: TargetType,
  ) {}
}

export class SummonNode {
  public readonly tag: "SummonNode" = "SummonNode";
  public readonly size = 1;

  constructor(
    public readonly enemyId: EnemyKey,
  ) {}
}

export class AttackNode {
  public readonly tag: "AttackNode" = "AttackNode";
  public readonly size = 1;

  constructor(
    public readonly damage: number,
    public readonly target: TargetType,
  ) {}
}

export class ShieldNode {
  public readonly tag: "ShieldNode" = "ShieldNode";
  public readonly size = 1;

  constructor(
    public readonly resource: ResourceType,
    public readonly target: TargetType,
  ) {}
}

export class Empty {
  public readonly tag: "Empty" = "Empty";
  public readonly size = 1;

  constructor(
  ) {}
}

export type Ability
  = GenerateNode
  | SummonNode
  | AttackNode
  | ShieldNode
  | Empty
  ;
  