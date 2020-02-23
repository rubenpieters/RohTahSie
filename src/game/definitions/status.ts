import { ConcreteTarget, AbstractTarget } from "./target";
import { Action, Damage } from "./action";
import { Condition } from "./condition";
import * as C from "./condition";
import * as V from "./var";
import * as T from "./target";
import { StatusAction, Increase } from "./statusAction";

type StatusK<A extends Action<ConcreteTarget>> = {
  condition: Condition<Action<ConcreteTarget>, A>
  actions: StatusAction<AbstractTarget>[]
}

export type Status = {
  maxHp: number,
  f: <R>(f: <A extends Action<ConcreteTarget>>(statusk: StatusK<A>) => R) => R,
}

export function mkStatus<A extends Action<ConcreteTarget>>(
  maxHp: number,
  statusk: StatusK<A>,
): Status {
  return { maxHp, f: k => k(statusk) };
}

export const demonStatus: Status = mkStatus(
  6,
  {
    condition: new C.And(C.mkIsTag("EndTurn"), new C.HasTarget(new T.Self())),
    actions: [
      new Damage(new V.Constant(1), new T.Other()),
      new Damage(new V.Constant(1), new T.ThisStatus()),
    ],
  });

export const infectionStatus: Status = mkStatus(
  6,
  {
    condition: new C.And(C.mkIsTag("EndTurn"), new C.HasTarget(new T.Self())),
    actions: [
      new Damage(new V.Constant(1), new T.Self()),
      new Damage(new V.Constant(1), new T.ThisStatus()),
    ],
  });

export const voodooDollStatus: Status = mkStatus(
  1,
  {
    condition: new C.And(C.mkIsTag("Damage"), new C.HasTarget(new T.Other())),
    actions: [
      new Increase("value", 8),
      new Damage(new V.Constant(1), new T.ThisStatus()),
    ],
  });

export const incrStatus: Status = mkStatus(
  1,
  {
    condition: C.mkIsTag("Damage"),
    actions: [
      new Increase("value", 1),
    ],
  });
