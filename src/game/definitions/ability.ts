import { Action } from "./action";
import * as A from "./action";
import { PlayerTarget, EnemyTarget, AbstractTarget, Self, Other, mkSelf, mkOther } from "./target";
import { EnemyKey } from "../enemy";
import * as V from "./var";
import * as S from "./status";

export class Rest {
  public readonly name: "Rest" = "Rest"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Regen(10, "roh", new Self()),
  ]
}

export class Meditation {
  public readonly name: "Meditation" = "Meditation"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Regen(8, "tah", new Self()),
  ]
}

export class Requiem {
  public readonly name: "Requiem" = "Requiem"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Regen(6, "sie", new Self()),
  ]
}

export class Dormant {
  public readonly name: "Dormant" = "Dormant"
  public readonly actions: Action<AbstractTarget>[] = [
  ]
}

export class Discussion {
  public readonly name: "Discussion" = "Discussion"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Cost(3, "tah", new Self()),
    new A.Damage(new V.Constant(5), new Other()),
  ]
}

export class Demon {
  public readonly name: "Demon" = "Demon"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Cost(6, "sie", new Self()),
    new A.AddStatus(new S.DemonStatus(), new Self()),
  ]
}

export class Initiate {
  public readonly name: "Initiate" = "Initiate"
  public readonly actions: Action<AbstractTarget>[]

  constructor(
    enemyId: EnemyKey,
  ) {
    // TODO: set name based on enemyId? split into tag and name?
    // this.name = `Initiate ${enemyId}`;
    this.actions = [
      new A.Summon(enemyId),
    ];
  }
}

export class Community {
  public readonly name: "Community" = "Community"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Cost(3, "tah", new Self()),
    new A.Damage(new V.Div(V.mkCountAbility("Community", mkSelf), new V.Constant(2), "ceil"), mkOther),
  ];
}

export class Isolation {
  public readonly name: "Isolation" = "Isolation"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Cost(4, "tah", new Self()),
    new A.Conditional(
      V.mkEquals(V.mkCountAbility("Isolation", mkSelf), new V.Constant(1)),
      new A.Damage(new V.Constant(10), new Other()),
      new A.NoAction()
    ),
  ];
}

export class Infection {
  public readonly name: "Infection" = "Infection"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Cost(6, "roh", new Self()),
    new A.AddStatus(new S.InfectionStatus(), new Other()),
  ]
}

export class VoodooDoll {
  public readonly name: "VoodooDoll" = "VoodooDoll"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Cost(5, "sie", new Self()),
    new A.AddStatus(new S.VoodooDollStatus(), new Self()),
  ]
}

export type Ability
  = Rest
  | Meditation
  | Requiem
  | Discussion
  | Dormant
  | Demon
  | Initiate
  | Community
  | Isolation
  | Infection
  | VoodooDoll
  ;
