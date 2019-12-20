export class Armor {
  public readonly tag: "Armor" = "Armor";

  constructor(
    public readonly value: number,
  ) {}
}

export type Status
  = Armor
  ;
  
