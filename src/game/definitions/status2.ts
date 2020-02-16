import { ConcreteTarget, AbstractTarget } from "./target";
import { Action, Damage } from "./action";
import { Condition } from "./condition";
import * as C from "./condition";
import * as V from "./var";
import * as T from "./target";
import { StatusAction, Increase } from "./statusAction";

type StatusK<A extends Action<ConcreteTarget>> = {
  condition: Condition<Action<ConcreteTarget>, A>
  actions: StatusAction<ConcreteTarget>[]
}

export type Status2 = {
  maxHp: number,
  f: <R>(f: <A extends Action<ConcreteTarget>>(statusk: StatusK<A>) => R) => R,
}

export function mkStatus<A extends Action<ConcreteTarget>>(
  maxHp: number,
  statusk: StatusK<A>,
): Status2 {
  return { maxHp, f: k => k(statusk) };
}

export const demonStatus: Status2 = mkStatus(
  6,
  {
    condition: C.mkIsTag("EndTurn"),
    actions: [
      // new Damage(V.Constant(1), new T.Other())
    ],
  });

export const incrStatus: Status2 = mkStatus(
  1,
  {
    condition: C.mkIsTag("Damage"),
    actions: [
      new Increase("value", 1),
    ],
  });
