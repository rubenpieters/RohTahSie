import { Var } from "./var"
import * as V from "./var"
import { AbstractTarget } from "./target"

export class TrueCond {
  public readonly name: "TrueCond" = "TrueCond"
  public readonly cond: Var<boolean, AbstractTarget> =
    new V.Constant(true)
}

export class FalseCond {
  public readonly name: "FalseCond" = "FalseCond"
  public readonly cond: Var<boolean, AbstractTarget> =
    new V.Constant(false)
}

export type CondCard
  = TrueCond
  | FalseCond
  ;