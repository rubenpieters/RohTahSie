import { Action } from "./action";
import * as A from "./action";
import * as S from "./status";
import { PlayerTarget, EnemyTarget } from "./target";
import { EnemyKey } from "../enemy";

export class Rest {
  public readonly name: "Rest" = "Rest"
  public readonly actions: Action[] = [
    new A.Regen(10, "roh", new PlayerTarget()),
  ]
}

export class Meditation {
  public readonly name: "Meditation" = "Meditation"
  public readonly actions: Action[] = [
    new A.Regen(8, "tah", new PlayerTarget()),
  ]
}

export class Requiem {
  public readonly name: "Requiem" = "Requiem"
  public readonly actions: Action[] = [
    new A.Regen(6, "sie", new PlayerTarget()),
  ]
}

export class Dormant {
  public readonly name: "Dormant" = "Dormant"
  public readonly actions: Action[] = [
  ]
}

export class Discussion {
  public readonly name: "Discussion" = "Discussion"
  public readonly actions: Action[] = [
    new A.Cost(3, "tah", new PlayerTarget()),
    new A.Damage(5, new EnemyTarget()),
  ]
}

export class Demon {
  public readonly name: "Demon" = "Demon"
  public readonly actions: Action[] = [
    new A.Cost(6, "sie", new PlayerTarget()),
    new A.AddStatus(new S.Dmg1(1, 1, 8), new PlayerTarget()),
  ]
}

export class Initiate {
  public readonly name: "Initiate" = "Initiate"
  public readonly actions: Action[]

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

export type Ability
  = Rest
  | Meditation
  | Requiem
  | Discussion
  | Dormant
  | Demon
  | Initiate
  ;
