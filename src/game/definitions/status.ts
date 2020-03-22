import { ConcreteTarget, AbstractTarget } from "./target";
import { Action, Damage } from "./action";
import { Condition } from "./condition";
import * as C from "./condition";
import * as V from "./var";
import * as T from "./target";
import { StatusAction, Increase, Reduce } from "./statusAction";

export type StatusType = "spirit" | "relation" | "condition";

type StatusK<A extends Action<ConcreteTarget>> = {
  condition: Condition<Action<ConcreteTarget>, A>
  actions: StatusAction<AbstractTarget>[]
}

export type StatusCA = <R>(f: <A extends Action<ConcreteTarget>>(statusk: StatusK<A>) => R) => R

export function mkStatusCA<A extends Action<ConcreteTarget>>(
  statusk: StatusK<A>,
): StatusCA {
  return k => k(statusk);
}

export class DemonStatus {
  public readonly type: "Status" = "Status";
  public readonly name: "DemonStatus" = "DemonStatus";
  public readonly sType: StatusType = "spirit";
  public readonly maxHp = 6;
  public readonly size = 1;

  public readonly ca = mkStatusCA({
    condition: new C.And(C.mkIsTag("EndTurn"), new C.HasTarget(new T.Self())),
    actions: [
      new Damage(new V.Constant(1), "essence", new T.Other()),
      new Damage(new V.Constant(1), "essence", new T.ThisStatus()),
    ],
  });
}

export class InfectionStatus {
  public readonly type: "Status" = "Status";
  public readonly name: "InfectionStatus" = "InfectionStatus";
  public readonly sType: StatusType = "condition";
  public readonly maxHp = 6;
  public readonly size = 1;

  public readonly ca = mkStatusCA({
    condition: new C.And(C.mkIsTag("EndTurn"), new C.HasTarget(new T.Self())),
    actions: [
      new Damage(new V.Constant(1), "essence", new T.Self()),
      new Damage(new V.Constant(1), "essence", new T.ThisStatus()),
    ],
  });
}

export class VoodooDollStatus {
  public readonly type: "Status" = "Status";
  public readonly name: "VoodooDollStatus" = "VoodooDollStatus";
  public readonly sType: StatusType = "spirit";
  public readonly maxHp = 1;
  public readonly size = 5;

  public readonly ca = mkStatusCA({
    condition: new C.And(C.mkIsTag("Damage"), new C.HasTarget(new T.Other())),
    actions: [
      new Increase("value", 8),
      new Damage(new V.Constant(1), "essence", new T.ThisStatus()),
    ],
  });
}

export class GuardianAngelStatus {
  public readonly type: "Status" = "Status";
  public readonly name: "GuardianAngelStatus" = "GuardianAngelStatus";
  public readonly sType: StatusType = "spirit";
  public readonly maxHp = 10;
  public readonly size = 1;

  public readonly ca = mkStatusCA({
    condition: new C.And(C.mkIsTag("Damage"), new C.HasTarget(new T.Self())),
    actions: [
      new Reduce("value", 1),
      new Damage(new V.Constant(1), "essence", new T.ThisStatus()),
    ],
  });
}

export type Status
  = DemonStatus
  | InfectionStatus
  | VoodooDollStatus
  | GuardianAngelStatus
  ;