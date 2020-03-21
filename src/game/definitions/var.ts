import { Ability } from "./ability";
import { AbstractResourceType } from "../types";

export class Constant<A> {
  public readonly tag: "Constant" = "Constant";

  constructor(
    public readonly a: A,
  ) {}
}

export class CountAbility<T> {
  public readonly tag: "CountAbility" = "CountAbility";

  constructor(
    public readonly ability: Ability["name"],
    public readonly target: T,
  ) {}
}

export function mkCountAbility<T>(ability: Ability["name"], target: T): Var<number, T> {
  return new CountAbility(ability, target);
}

export class Div<T> {
  public readonly tag: "Div" = "Div";

  constructor(
    public readonly x1: Var<number, T>,
    public readonly x2: Var<number, T>,
    public readonly rounding: "floor" | "ceil",
  ) {}
}

export function mkDiv<T>(x1: Var<number, T>, x2: Var<number, T>, rounding: "floor" | "ceil"): Var<number, T> {
  return new Div(x1, x2, rounding);
}

export class Add<T> {
  public readonly tag: "Add" = "Add";

  constructor(
    public readonly x1: Var<number, T>,
    public readonly x2: Var<number, T>,
  ) {}
}

export function mkAdd<T>(x1: Var<number, T>, x2: Var<number, T>): Var<number, T> {
  return new Add(x1, x2);
}

export class Equals<T> {
  public readonly tag: "Equals" = "Equals";

  constructor(
    public readonly f: <R>(f: <A>(equalsk: EqualsK<A, T>) => R) => R,
  ) {}
}

type EqualsK<X, T> = {
  x1: Var<X, T>,
  x2: Var<X, T>,
}

export function mkEquals<A, T>(x1: Var<A, T>, x2: Var<A, T>): Var<boolean, T> {
  return new Equals(k => k({ x1, x2 }));
}

export class LT<T> {
  public readonly tag: "LT" = "LT";

  constructor(
    public readonly x1: Var<number, T>,
    public readonly x2: Var<number, T>,
  ) {}
}

export function mkLT<T>(x1: Var<number, T>, x2: Var<number, T>): Var<boolean, T> {
  return new LT(x1, x2);
}

export class Below<T> {
  public readonly tag: "Below" = "Below";

  constructor(
    public readonly x1: Var<number, T>,
    public readonly v: number,
  ) {}
}

export function mkBelow<T>(x1: Var<number, T>, v: number): Var<boolean, T> {
  return new Below(x1, v);
}

export class Resource<T> {
  public readonly tag: "Resource" = "Resource";

  constructor(
    public readonly target: T,
    public readonly res: AbstractResourceType,
  ) {}
}

export function mkResource<T>(target: T, res: AbstractResourceType): Var<number, T> {
  return new Resource(target, res);
}

export class GetVar {
  public readonly tag: "GetVar" = "GetVar";

  constructor(
    public readonly name: string,
    public readonly count: number,
  ) {}
}

export type Var<A, T>
  = Constant<A>
  | CountAbility<T>
  | Div<T>
  | Equals<T>
  | Add<T>
  | LT<T>
  | Below<T>
  | Resource<T>
  | GetVar
  ;
