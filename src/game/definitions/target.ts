
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

export type TargetType
  = PlayerTarget
  | EnemyTarget
  | StatusTarget
  ;
