import { ConcreteTarget, PlayerTarget, EnemyTarget } from "./definitions/target";
import { Action, Summon, Damage, NoAction } from "./definitions/action";
import { Condition, OnSelf, mkIsTag, And } from "./definitions/condition";
import { eqTarget, concretizeTarget, targetExpl } from "./target";

export function checkCondition<Before extends Action<ConcreteTarget>, After extends Action<ConcreteTarget>>(
  condition: Condition<Before, After>,
  action: Before,
  origin: ConcreteTarget,
  owner: "player" | "enemy",
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
      const ownerTarget = owner === "player" ? new PlayerTarget() : new EnemyTarget();
      if ((action as any).target !== undefined && eqTarget((action as any).target, ownerTarget)) {
        return action as any;
      } else {
        return "conditionFalse";
      }
    }
    case "And": {
      const checkCond1 = checkCondition(condition.cond1, action, origin, owner);
      if (checkCond1 === "conditionFalse") {
        return "conditionFalse";
      } else {
        return checkCondition(condition.cond2, action as any, origin, owner);
      }
    }
    case "HasTarget": {
      // concretize condition target with respect to status owner
      const conditionTarget = concretizeTarget(condition.target, owner);
      if ((action as any).target !== undefined && eqTarget((action as any).target, conditionTarget)) {
        return action as any;
      } else {
        return "conditionFalse";
      }
    }
    case "HasSource": {
      const conditionTarget = concretizeTarget(condition.source, owner);
      if (
        conditionTarget.tag === origin.tag
      ) {
        return action as any;
      } else {
        return "conditionFalse";
      }
    }
  }
}

/*
checkCondition(mkIsTag("Summon"), new NoAction(), undefined as any);

checkCondition(new OnSelf(), new Damage(undefined as any, new PlayerTarget()), undefined as any);
checkCondition(new OnSelf(), new NoAction(), undefined as any);

checkCondition(new And(mkIsTag("Summon"), new OnSelf()), new NoAction(), undefined as any);*/

export function conditionExpl<Before extends Action<ConcreteTarget>, After extends Action<ConcreteTarget>>(
  condition: Condition<Before, After>,
): string {
  switch (condition.tag) {
    case "IsTag": return `when ${condition.actionTag}`;
    case "OnSelf": return "on self";
    case "HasTarget": return `(${targetExpl(condition.target)})`;
    case "HasSource": return `(${targetExpl(condition.source)})`;
    case "And": return `${conditionExpl(condition.cond1)} and ${conditionExpl(condition.cond2)}`;
  }
}