export class Armor1 {
  public readonly tag: "Armor1" = "Armor1";

  constructor(
    public readonly value: number,
    public readonly maxHp: number,
  ) {}
}

export class Armor2 {
  public readonly tag: "Armor2" = "Armor2";

  constructor(
    public readonly value: number,
    public readonly loseValue: number,
    public readonly maxHp: number,
  ) {}
}

export class Dmg1 {
  public readonly tag: "Dmg1" = "Dmg1";

  constructor(
    public readonly value: number,
    public readonly loseValue: number,
    public readonly maxHp: number,
  ) {}
}

export type Status
  = Armor1
  | Armor2
  | Dmg1
  ;
  
