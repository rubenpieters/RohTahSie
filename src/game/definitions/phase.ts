import { Action } from "./action";
import { AbstractTarget, ConcreteTarget } from "./target";

export class Charging {
  public readonly tag: "Charging" = "Charging";

  constructor() {}
}

export class Transforming {
  public readonly tag: "Transforming" = "Transforming";

  constructor(
    public actionQueue: Action<AbstractTarget>[],
    public readonly source: "player" | "enemy",
    public afterTransform?: Action<ConcreteTarget>,
  ) {}
}

export class Applying {
  public readonly tag: "Applying" = "Applying";

  constructor(
    public nextAction: Action<ConcreteTarget>,
    public actionQueue: Action<AbstractTarget>[],
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