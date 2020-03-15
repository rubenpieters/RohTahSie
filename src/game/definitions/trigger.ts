import { AbstractTarget } from "./target";
import { Action } from "./action";
import * as A from "./action";
import { Var } from "./var";
import * as C from "./condition";
import * as V from "./var";
import * as T from "./target";


export class NetworkTrigger {
  public readonly type: "Trigger" = "Trigger";
  public readonly name: "NetworkTrigger" = "NetworkTrigger";
  public readonly maxHp = 5;
  public readonly size = 1;

  public readonly condition: Var<boolean, AbstractTarget> = V.mkBelow(V.mkResource(T.mkSelf, "tah"), 5);
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Damage(new V.Constant(2), T.mkOther),
    new A.Damage(new V.Constant(1), new T.ThisStatus()),
  ];
}

export class PrayerTrigger {
  public readonly type: "Trigger" = "Trigger";
  public readonly name: "PrayerTrigger" = "PrayerTrigger";
  public readonly maxHp = 1;
  public readonly size = 1;

  public readonly condition: Var<boolean, AbstractTarget> = V.mkBelow(V.mkResource(T.mkSelf, "essence"), 5);
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Regen(new V.Constant(15), "essence", T.mkSelf),
    new A.Damage(new V.Constant(1), new T.ThisStatus()),
  ];
}

export type Trigger
  = NetworkTrigger
  | PrayerTrigger
  ;
