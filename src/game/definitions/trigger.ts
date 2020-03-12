import { AbstractTarget } from "./target";
import { Action } from "./action";
import { Var } from "./var";
import * as C from "./condition";
import * as V from "./var";
import * as T from "./target";


export class NetworkTrigger {
  public readonly name: "NetworkTrigger" = "NetworkTrigger";
  public readonly maxHp = 1;
  public readonly size = 1;

  public readonly condition: Var<boolean, AbstractTarget> = V.mkBelow(V.mkResource(T.mkSelf, "tah"), 5);
  public readonly actions: Action<AbstractTarget>[] = [];
}

export type Trigger
  = NetworkTrigger
  ;
