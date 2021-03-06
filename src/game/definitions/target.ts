
export class PlayerTarget {
  public readonly tag: "PlayerTarget" = "PlayerTarget";

  constructor() {}
}

export class EnemyTarget {
  public readonly tag: "EnemyTarget" = "EnemyTarget";

  constructor() {}
}

export class StatusTarget {
  public readonly tag: "StatusTarget" = "StatusTarget";

  constructor(
    public readonly id: number,
  ) {}
}

export type ConcreteTarget
  = PlayerTarget
  | EnemyTarget
  | StatusTarget
  ;

export class Self {
  public readonly tag: "Self" = "Self";

  constructor() {}
}

export const mkSelf: AbstractTarget = new Self();

export class Other {
  public readonly tag: "Other" = "Other";

  constructor() {}
}

export const mkOther: AbstractTarget = new Other();

export class ThisStatus {
  public readonly tag: "ThisStatus" = "ThisStatus";

  constructor() {}
}

export type AbstractTarget
  = Self
  | Other
  | ThisStatus
  | ConcreteTarget
  ;

