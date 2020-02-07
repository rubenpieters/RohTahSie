import { Ability } from "./ability";

export class Constant<A> {
  public readonly tag: "Constant" = "Constant";

  constructor(
    public readonly a: A,
  ) {}
}

// TODO: add abstract target for counting
export class CountAbility {
  public readonly tag: "CountAbility" = "CountAbility";

  constructor(
    public readonly ability: Ability["name"],
  ) {}
}

export function mkCountAbility(ability: Ability["name"]): Var<number> {
  return new CountAbility(ability);
}

export class Div {
  public readonly tag: "Div" = "Div";

  constructor(
    public readonly x1: Var<number>,
    public readonly x2: Var<number>,
    public readonly rounding: "floor" | "ceil",
  ) {}
}

export function mkDiv(x1: Var<number>, x2: Var<number>, rounding: "floor" | "ceil",): Var<number> {
  return new Div(x1, x2, rounding);
}

export type Var<A>
  = Constant<A>
  | CountAbility
  | Div
  ;
