
export class Constant<A> {
  public readonly tag: "Constant" = "Constant";

  constructor(
    public readonly a: A,
  ) {}
}

export class CommunityVar {
  public readonly tag: "CommunityVar" = "CommunityVar";

  constructor() {}
}

export type Var<A>
  = Constant<A>
  | CommunityVar
  ;
