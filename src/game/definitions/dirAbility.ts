import { Action } from "./action"
import { PlayerTarget, EnemyTarget, AbstractTarget, Self, Other, mkSelf, mkOther } from "./target";
import * as A from "./action";
import * as V from "./var";
import * as S from "./status";
import * as Tr from "./trigger";

export class MoveRight {
  public readonly name: "MoveRight" = "MoveRight"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.MoveDir("right", mkSelf),
  ]
}

export class MoveLeft {
  public readonly name: "MoveLeft" = "MoveLeft"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.MoveDir("left", mkSelf),
  ]
}

export class MoveUp {
  public readonly name: "MoveUp" = "MoveUp"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.MoveDir("up", mkSelf),
  ]
}

export class MoveDown {
  public readonly name: "MoveDown" = "MoveDown"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.MoveDir("down", mkSelf),
  ]
}

export class GoToX {
  public readonly name: "GoToX" = "GoToX"
  public readonly actions: Action<AbstractTarget>[]

  constructor(
    public readonly i: number,
  ) {
    this.actions = [
      new A.GoTo(i, mkSelf),
    ];
  }
}

export class MoveDownEssenceLow {
  public readonly name: "MoveDownEssenceLow" = "MoveDownEssenceLow"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Conditional(
      V.mkBelow(new V.Resource(mkSelf, "essence"), 30),
      new A.MoveDir("down", mkSelf),
      new A.MoveDir("right", mkSelf),
    ),
  ]
}

export class MoveUpEssenceHigh {
  public readonly name: "MoveUpEssenceHigh" = "MoveUpEssenceHigh"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Conditional(
      V.mkAbove(new V.Resource(mkSelf, "essence"), 80),
      new A.MoveDir("up", mkSelf),
      new A.MoveDir("right", mkSelf),
    ),
  ]
}

export type DirAbility
  = MoveRight
  | MoveLeft
  | MoveUp
  | MoveDown
  | GoToX
  | MoveDownEssenceLow
  | MoveUpEssenceHigh
  ;