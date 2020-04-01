import { Action } from "./action";
import { AbstractTarget, ConcreteTarget } from "./target";

export type ActionInQueue = {
  action: Action<AbstractTarget>,
  indexSource: number | undefined,
}

export class Charging {
  public readonly tag: "Charging" = "Charging";

  constructor() {}
}

export class Transforming {
  public readonly tag: "Transforming" = "Transforming";

  constructor(
    public actionQueue: ActionInQueue[],
    public readonly source: "player" | "enemy",
    public afterTransform?: {
      action: Action<ConcreteTarget>,
      indexSource: number | undefined,
    },
  ) {}
}

export class Applying {
  public readonly tag: "Applying" = "Applying";

  constructor(
    public nextAction: {
      action: Action<ConcreteTarget>,
      indexSource: number | undefined,
    },
    public actionQueue: ActionInQueue[],
    public readonly source: "player" | "enemy",
  ) {}
}

export class Finalizing {
  public readonly tag: "Finalizing" = "Finalizing";

  constructor() {}
}

export type GamePhase
  = Charging
  | Transforming
  | Applying
  | Finalizing
  ;