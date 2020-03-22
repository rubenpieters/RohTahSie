import { Action } from "./action";

export class Increase {
  public readonly tag: "Increase" = "Increase";

  constructor(
    public readonly field: string,
    public readonly value: number,
  ) {}
}

export class Reduce {
  public readonly tag: "Reduce" = "Reduce";

  constructor(
    public readonly field: string,
    public readonly value: number,
  ) {}
}

export type StatusAction<T>
  = Action<T>
  | Increase
  | Reduce
  ;
