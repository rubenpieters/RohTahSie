import { EnemyKey } from "../enemy";
import { ResourceType, AbstractResourceType } from "../types";
import { Var } from "./var";
import { Status, StatusType } from "./status";
import { Trigger } from "./trigger";

export class Regen<T> {
  public readonly tag: "Regen" = "Regen";
  public readonly size = 1;

  constructor(
    public readonly value: Var<number, T>,
    public readonly resource: AbstractResourceType,
    public readonly target: T,
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
    public readonly value: Var<number, T>,
    public readonly resource: AbstractResourceType,
    public readonly target: T,
  ) {}
}

export class ChangeShield<T> {
  public readonly tag: "ChangeShield" = "ChangeShield";

  constructor(
    public readonly resource: ResourceType,
    public readonly target: T,
  ) {}
}

export class AddStatus<T> {
  public readonly tag: "AddStatus" = "AddStatus";

  constructor(
    public readonly status: Status | Trigger,
    public readonly target: T,
  ) {}
}

export class Death<T> {
  public readonly tag: "Death" = "Death";

  constructor(
    public readonly target: T,
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

export class EndTurn<T> {
  public readonly tag: "EndTurn" = "EndTurn";

  constructor(
    public readonly target: T,
  ) {}
}

export class Conditional<T> {
  public readonly tag: "Conditional" = "Conditional";

  constructor(
    public readonly cond: Var<boolean, T>,
    public readonly actionThen: Action<T>,
    public readonly actionElse: Action<T>,
  ) {}
}

export class StoreVar<T> {
  public readonly tag: "StoreVar" = "StoreVar";

  constructor(
    public readonly v: Var<number, T>,
    public readonly name: string,
    public readonly count: number,
  ) {}
}

export class ClearVar {
  public readonly tag: "ClearVar" = "ClearVar";

  constructor(
    public readonly name: string,
  ) {}
}

export class RemoveStatus<T> {
  public readonly tag: "RemoveStatus" = "RemoveStatus";

  constructor(
    public readonly sType: StatusType,
    public readonly amount: Var<number, T>,
    public readonly target: T,
  ) {}
}

export type Action<T>
  = Regen<T>
  | Summon
  | Damage<T>
  | Cost<T>
  | ChangeShield<T>
  | AddStatus<T>
  | Death<T>
  | NoAction
  | EndTurn<T>
  | Conditional<T>
  | StoreVar<T>
  | ClearVar
  | RemoveStatus<T>
  ;