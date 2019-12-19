import * as lo from "lodash";
import { EnemyKey, allEnemies } from "../enemy";
import { GameState } from "../state";
import { Anim, Noop, mkEff, Par } from "../../app/animation";
import { Display } from "../display";
import { updateResourceAnim, newEntityAnim, changeShieldAnim } from "../entity";
import { barLocation, newLayoutAnim } from "../layout";
import { Cache } from "../../app/main";
import { TargetType, ResourceType } from "../types";

export class Regen {
  public readonly tag: "Regen" = "Regen";
  public readonly size = 1;

  constructor(
    public readonly value: number,
    public readonly resource: ResourceType,
    public readonly target: TargetType,
  ) {}
}

export class Summon {
  public readonly tag: "Summon" = "Summon";

  constructor(
    public readonly enemyId: EnemyKey,
  ) {}
}

export class Damage {
  public readonly tag: "Damage" = "Damage";

  constructor(
    public readonly value: number,
    public readonly target: TargetType,
  ) {}
}

export class ChangeShield {
  public readonly tag: "ChangeShield" = "ChangeShield";

  constructor(
    public readonly resource: ResourceType,
    public readonly target: TargetType,
  ) {}
}

export class Death {
  public readonly tag: "Death" = "Death";

  constructor(
    public readonly target: TargetType,
  ) {}
}

export class NoAction {
  public readonly tag: "NoAction" = "NoAction";

  constructor() {}
}

export type Action
  = Regen
  | Summon
  | Damage
  | ChangeShield
  | Death
  | NoAction
  ;