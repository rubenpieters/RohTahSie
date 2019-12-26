import { Action } from "./action";

export class Charging {
  public readonly tag: "Charging" = "Charging";

  constructor() {}
}

export class Activating {
  public readonly tag: "Activating" = "Activating";

  constructor(
    public actionQueue: Action[],
    public transformed: boolean,
    public readonly source: "player" | "enemy",
  ) {}
}

export class Finalizing {
  public readonly tag: "Finalizing" = "Finalizing";

  constructor() {}
}

export type GamePhase
  = Charging
  | Activating
  | Finalizing
  ;