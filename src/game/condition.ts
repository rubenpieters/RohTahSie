import { ConcreteTarget, PlayerTarget } from "./definitions/target";
import { Action, Summon, Damage, NoAction } from "./definitions/action";
import { Condition, OnSelf, mkIsTag, And } from "./definitions/condition";
import { eqTarget } from "./target";

export function checkCondition<Before extends Action<ConcreteTarget>, After extends Action<ConcreteTarget>>(
  condition: Condition<Before, After>,
  action: Before,
  owner: ConcreteTarget,
): After | "conditionFalse" {
  switch (condition.tag) {
    case "IsTag": {
      if (action.tag === condition.actionTag) {
        return action as any;
      } else {
        return "conditionFalse";
      }
    }
    case "OnSelf": {
      if ((action as any).target !== undefined && eqTarget((action as any).target, owner)) {
        return action as any;
      } else {
        return "conditionFalse";
      }
    }
    case "And": {
      const checkCond1 = checkCondition(condition.cond1, action, owner);
      if (checkCond1 === "conditionFalse") {
        return "conditionFalse";
      } else {
        return checkCondition(condition.cond2, action as any, owner);
      }
    }
  }
}

checkCondition(mkIsTag("Summon"), new NoAction(), undefined as any);

checkCondition(new OnSelf(), new Damage(undefined as any, new PlayerTarget()), undefined as any);
checkCondition(new OnSelf(), new NoAction(), undefined as any);

checkCondition(new And(mkIsTag("Summon"), new OnSelf()), new NoAction(), undefined as any);