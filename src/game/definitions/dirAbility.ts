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

export type DirAbility
  = MoveRight
  | MoveLeft
  | MoveUp
  | MoveDown
  ;