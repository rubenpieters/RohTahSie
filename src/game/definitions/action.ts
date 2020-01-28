import { EnemyKey } from "../enemy";
import { ResourceType } from "../types";
import { ConcreteTarget, AbstractTarget } from "./target";
import { Status } from "./status";

export class Regen {
  public readonly tag: "Regen" = "Regen";
  public readonly size = 1;

  constructor(
    public readonly value: number,
    public readonly resource: ResourceType,
    public readonly target: ConcreteTarget,
  ) {}
}

export class Summon {
  public readonly tag: "Summon" = "Summon";

  constructor(
    public readonly enemyId: EnemyKey,
  ) {}
}

export class Damage<T> {
  public readonly tag: "Damage" = "Damage";

  constructor(
    public readonly value: number,
    public readonly target: T,
  ) {}
}

export class ChangeShield {
  public readonly tag: "ChangeShield" = "ChangeShield";

  constructor(
    public readonly resource: ResourceType,
    public readonly target: ConcreteTarget,
  ) {}
}

export class AddStatus {
  public readonly tag: "AddStatus" = "AddStatus";

  constructor(
    public readonly status: Status,
    public readonly target: ConcreteTarget,
  ) {}
}

export class Death {
  public readonly tag: "Death" = "Death";

  constructor(
    public readonly target: ConcreteTarget,
  ) {}
}

export class Cost<T> {
  public readonly tag: "Cost" = "Cost";

  constructor(
    public readonly value: number,
    public readonly resource: ResourceType,
    public readonly target: T,
  ) {}
}

export class NoAction {
  public readonly tag: "NoAction" = "NoAction";

  constructor() {}
}

export class EndTurn {
  public readonly tag: "EndTurn" = "EndTurn";

  constructor() {}
}

export type Action<T>
  = Regen
  | Summon
  | Damage<T>
  | Cost<T>
  | ChangeShield
  | AddStatus
  | Death
  | NoAction
  | EndTurn
  ;