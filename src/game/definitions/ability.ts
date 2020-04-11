import { Action } from "./action";
import * as A from "./action";
import { PlayerTarget, EnemyTarget, AbstractTarget, Self, Other, mkSelf, mkOther } from "./target";
import { EnemyKey } from "../enemy";
import * as V from "./var";
import * as S from "./status";
import * as Tr from "./trigger";

export class FocusRoh {
  public readonly name: "FocusRoh" = "FocusRoh"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.ChangeShield("roh", mkSelf),
  ]
}

export class FocusTah {
  public readonly name: "FocusTah" = "FocusTah"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.ChangeShield("tah", mkSelf),
  ]
}

export class FocusSie {
  public readonly name: "FocusSie" = "FocusSie"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.ChangeShield("sie", mkSelf),
  ]
}

export class Rest {
  public readonly name: "Rest" = "Rest"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Regen(new V.Constant(10), "roh", mkSelf),
  ]
}

export class Meditation {
  public readonly name: "Meditation" = "Meditation"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Regen(new V.Constant(8), "tah", mkSelf),
  ]
}

export class Requiem {
  public readonly name: "Requiem" = "Requiem"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Regen(new V.Constant(6), "sie", mkSelf),
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
    new A.Damage(new V.Constant(5), "essence", new Other()),
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
    new A.Damage(new V.Div(V.mkCountAbility("Community", mkSelf), new V.Constant(2), "ceil"), "essence", mkOther),
  ];
}

export class Isolation {
  public readonly name: "Isolation" = "Isolation"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Cost(4, "tah", new Self()),
    new A.Conditional(
      V.mkEquals(V.mkCountAbility("Isolation", mkSelf), new V.Constant(1)),
      new A.Damage(new V.Constant(10), "essence", new Other()),
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

export class Network {
  public readonly name: "Network" = "Network"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Cost(4, "tah", new Self()),
    new A.AddStatus(new Tr.NetworkTrigger(), new Self()),
  ]
}

export class Prayer {
  public readonly name: "Prayer" = "Prayer"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Cost(5, "sie", new Self()),
    new A.AddStatus(new Tr.PrayerTrigger(), new Self()),
  ]
}

export class Heresy {
  public readonly name: "Heresy" = "Heresy"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Cost(3, "tah", new Self()),
    new A.StoreVar(new V.Min(new V.CountStatusType("spirit", mkSelf), 3), "X", 2),
    new A.RemoveStatus("spirit", new V.GetVar("X", 1), mkSelf),
    new A.Damage(new V.Mult(new V.GetVar("X", 1), new V.Constant(3)), "essence", mkOther),
    new A.ClearVar("X"),
  ]
}

export class Miracle {
  public readonly name: "Miracle" = "Miracle"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Cost(3, "sie", new Self()),
    new A.Conditional(
      V.mkEquals(new V.Resource(mkSelf, "sie"), new V.Constant(1)),
      new A.Damage(new V.Constant(13), "essence", mkOther),
      new A.NoAction(),
    ),
  ]
}

export class GuardianAngel {
  public readonly name: "GuardianAngel" = "GuardianAngel"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Cost(2, "sie", new Self()),
    new A.AddStatus(new S.GuardianAngelStatus(), new Self()),
  ]
}

export class Homeostasis {
  public readonly name: "Homeostasis" = "Homeostasis"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Cost(2, "roh", new Self()),
    new A.Damage(new V.Constant(4), "highest", mkSelf),
    new A.Regen(new V.Constant(15), "lowest", mkSelf),
  ]
}

export class Reflex {
  public readonly name: "Reflex" = "Reflex"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Cost(1, "roh", new Self()),
    new A.Conditional(
      V.mkBelow(new V.Resource(mkSelf, "essence"), 30),
      new A.ActionFrom("up", new Self()),
      new A.ActionFrom("down", new Self()),
    )
  ]
}

export class Hypertrophy {
  public readonly name: "Hypertrophy" = "Hypertrophy"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Cost(3, "roh", new Self()),
    new A.AddStatus(new S.HypertrophyStatus(), new Self()),
  ]
}

export class Paralysis {
  public readonly name: "Paralysis" = "Paralysis"
  public readonly actions: Action<AbstractTarget>[] = [
    new A.Cost(4, "roh", new Self()),
    new A.ChangeTo("Dormant", mkOther),
  ]
}

export type Ability
  = FocusRoh
  | FocusTah
  | FocusSie
  | Rest
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
  | Network
  | Prayer
  | Heresy
  | Miracle
  | GuardianAngel
  | Homeostasis
  | Reflex
  | Hypertrophy
  | Paralysis
  ;


  export function mkAbility(
    name: Ability["name"],
  ): Ability {
    switch (name) {
      case "FocusRoh": return new FocusRoh();
      case "FocusTah": return new FocusTah();
      case "FocusSie": return new FocusSie();
      case "Rest": return new Rest();
      case "Meditation": return new Meditation();
      case "Requiem": return new Requiem();
      case "Discussion": return new Discussion();
      case "Dormant": return new Dormant();
      case "Demon": return new Demon();
      case "Initiate": throw "mkAbility: error";
      case "Community": return new Community();
      case "Isolation": return new Isolation();
      case "Infection": return new Infection();
      case "VoodooDoll": return new VoodooDoll();
      case "Network": return new Network();
      case "Prayer": return new Prayer();
      case "Heresy": return new Heresy();
      case "Miracle": return new Miracle();
      case "GuardianAngel": return new GuardianAngel();
      case "Homeostasis": return new Homeostasis();
      case "Reflex": return new Reflex();
      case "Hypertrophy": return new Hypertrophy();
      case "Paralysis": return new Paralysis();
    }
  }