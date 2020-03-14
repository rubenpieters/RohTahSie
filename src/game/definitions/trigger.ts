import { AbstractTarget } from "./target";
import { Action, Damage } from "./action";
import { Var } from "./var";
import * as C from "./condition";
import * as V from "./var";
import * as T from "./target";


export class NetworkTrigger {
  public readonly name: "NetworkTrigger" = "NetworkTrigger";
  public readonly maxHp = 5;
  public readonly size = 1;

  public readonly condition: Var<boolean, AbstractTarget> = V.mkBelow(V.mkResource(T.mkSelf, "tah"), 5);
  public readonly actions: Action<AbstractTarget>[] = [
    new Damage(new V.Constant(2), T.mkOther),
    new Damage(new V.Constant(1), new T.ThisStatus()),
  ];
}

export type Trigger
  = NetworkTrigger
  ;
