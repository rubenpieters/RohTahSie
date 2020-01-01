import { EnemyKey } from "../enemy";
import { ResourceType } from "../types";
import { TargetType } from "./target";

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

export class AddArmor {
  public readonly tag: "AddArmor" = "AddArmor";
  public readonly size = 1;

  constructor(
    public readonly target: TargetType,
  ) {}
}

export class AddArmor2 {
  public readonly tag: "AddArmor2" = "AddArmor2";
  public readonly size = 1;

  constructor(
    public readonly target: TargetType,
  ) {}
}

export class Empty {
  public readonly tag: "Empty" = "Empty";
  public readonly size = 1;

  constructor(
  ) {}
}

export class Harvest {
  public readonly tag: "Harvest" = "Harvest";
  public readonly size = 1;

  constructor() {}
}


export type Ability
  = GenerateNode
  | SummonNode
  | AttackNode
  | ShieldNode
  | AddArmor
  | AddArmor2
  | Empty
  | Harvest
  ;
  