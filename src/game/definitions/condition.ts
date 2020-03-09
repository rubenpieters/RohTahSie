import { Action, Summon } from "./action";
import { ConcreteTarget, PlayerTarget, AbstractTarget } from "./target";
import * as V from "./var";

export class IsTag<Before extends Action<ConcreteTarget>, After> {
  public readonly tag: "IsTag" = "IsTag";
  private readonly _After?: After;

  constructor(
    public readonly actionTag: Before["tag"],
  ) {}
}

export function mkIsTag<Tag extends Action<any>["tag"], Before extends Action<ConcreteTarget>>(
  actionTag: Tag,
): Condition<Before, Extract<Action<ConcreteTarget>, { tag: Tag }>> {
  return new IsTag(actionTag);
}

export class OnSelf {
  public readonly tag: "OnSelf" = "OnSelf";

  constructor() {}
}

export class And<Before extends Action<ConcreteTarget>, After extends Action<ConcreteTarget>> {
  public readonly tag: "And" = "And";

  constructor(
    public readonly cond1: Condition<Before, After>,
    public readonly cond2: Condition<After, After>,
  ) {}
}

export class HasTarget {
  public readonly tag: "HasTarget" = "HasTarget";

  constructor(
    public readonly target: AbstractTarget,
  ) {}
}

export type Condition<Before extends Action<ConcreteTarget>, After extends Action<ConcreteTarget>>
  = IsTag<Before, After>
  | OnSelf
  | And<Before, After>
  | HasTarget
  ;
