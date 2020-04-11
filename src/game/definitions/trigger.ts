import { AbstractTarget } from "./target";
import { Action } from "./action";
import * as A from "./action";
import { Var } from "./var";
import * as C from "./condition";
import * as V from "./var";
import * as T from "./target";
import { StatusType } from "./status";


export class NetworkTrigger {
  public readonly type: "Trigger" = "Trigger";
  public readonly name: "NetworkTrigger" = "NetworkTrigger";
  public readonly sType: StatusType = "relation";
  public readonly maxHp = 5;
  public readonly size = 1;

  public readonly condition: Var<boolean, AbstractTarget> = V.mkBelow(V.mkResource(T.mkSelf, "tah"), 5);
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Damage(new V.Constant(2), "essence", T.mkOther),
    new A.Damage(new V.Constant(1), "essence", new T.ThisStatus()),
  ];
}

export class PrayerTrigger {
  public readonly type: "Trigger" = "Trigger";
  public readonly name: "PrayerTrigger" = "PrayerTrigger";
  public readonly sType: StatusType = "spirit";
  public readonly maxHp = 1;
  public readonly size = 1;

  public readonly condition: Var<boolean, AbstractTarget> = V.mkBelow(V.mkResource(T.mkSelf, "essence"), 5);
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Regen(new V.Constant(15), "essence", T.mkSelf),
    new A.Damage(new V.Constant(1), "essence", new T.ThisStatus()),
  ];
}

export class ParalysisTrigger {
  public readonly type: "Trigger" = "Trigger";
  public readonly name: "ParalysisTrigger" = "ParalysisTrigger";
  public readonly sType: StatusType = "condition";
  public readonly maxHp = 8;
  public readonly size = 1;

  public readonly condition: Var<boolean, AbstractTarget> = V.mkAbove(V.mkResource(new T.ThisStatus(), "essence"), 4);
  public readonly actions: Action<AbstractTarget>[] = [
    new A.ChangeTo("Dormant", T.mkOther),
    new A.Death(new T.ThisStatus()),
  ];
}

export type Trigger
  = NetworkTrigger
  | PrayerTrigger
  | ParalysisTrigger
  ;
