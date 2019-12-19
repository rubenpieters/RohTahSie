import { EnemyKey } from "./enemy";

export type ResourceType = "roh" | "tah" | "sie";

export type TargetType = "player" | "enemy";

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
    public readonly resource: ResourceType,
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

export type GameNode
  = GenerateNode
  | SummonNode
  | AttackNode
  | ShieldNode
  | Empty
  ;