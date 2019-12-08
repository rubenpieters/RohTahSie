import { GameNode } from "../game/gameNode";
import { linear } from "./interpolation";

export class Par {
  public readonly tag: "Par" = "Par";

  constructor(
    public readonly list: Anim[],
  ) {}
}

export class Seq {
  public readonly tag: "Seq" = "Seq";

  constructor(
    public readonly list: Anim[],
  ) {}
}

export type TargetType
  = "absolute"
  | "relativeIncrease"
  | "relativeDecrease"
  ;

export type AnimTarget<A, Prop> = {
  obj: A,
  set: (a: A, prop: Prop) => void,
  get: (a: A) => Prop,
}

export function mkAccessTarget<A, K extends keyof A, R>(
  obj: A,
  key: K,
): (e: (t: AnimTarget<A, A[K]>) => R) => R {
  const get = (a: A) => { return a[key]; };
  const set = (a: A, prop: A[K]) => { a[key] = prop; };
  return mkAnimTarget(obj, set, get);
}

export function mkAnimTarget<A, Prop, R>(
  obj: A,
  set: (a: A, prop: Prop) => void,
  get: (a: A) => Prop,
): (e: (t: AnimTarget<A, Prop>) => R) => R {
  return k => k({ obj, get, set }); 
}

export class TweenTo {
  public readonly tag: "TweenTo" = "TweenTo";

  constructor(
    public readonly duration: number,
    public readonly target: number,
    public readonly targetType: TargetType,
    public readonly k: <R>(e: <A>(t: AnimTarget<A, number>) => R) => R,
  ) {}
}
type EffK<A> = {
  eff: () => A,
  k: (a: A) => Anim,
}

export type FromToType
  = "setOnFrom"
  | "onlyTo"
  ;

export class TweenFromTo {
  public readonly tag: "TweenFromTo" = "TweenFromTo";

  constructor(
    public readonly duration: number,
    public readonly from: number,
    public readonly to: number,
    public readonly fromToType: FromToType,
    public readonly k: <R>(e: <A>(t: AnimTarget<A, number>) => R) => R,
  ) {}
}

export class Eff {
  public readonly tag: "Eff" = "Eff";

  constructor(
    public readonly f: <R>(f: <A>(effk: EffK<A>) => R) => R
  ) {}
}

export class Noop {
  public readonly tag: "Noop" = "Noop";

  constructor() {}
}

export function mkEff<A>(
  effk: EffK<A>,
): Eff {
  return new Eff(k => k(effk));
}

export type Anim
  = Par
  | Seq
  | TweenTo
  | TweenFromTo
  | Eff
  | Noop
  ;

export function runAnimation(
  delta: number,
  anim: Anim,
): { remainingAnim: Anim, remainingDelta: "nothing" } | { remainingAnim: "nothing", remainingDelta: number } {
  switch (anim.tag) {
    case "TweenTo": {
      const { from, to } = anim.k(x => {
        const from = x.get(x.obj);
        let to = undefined as any;
        switch (anim.targetType) {
          case "absolute": { to = anim.target; break; };
          case "relativeDecrease": { to = from - anim.target; break; };
          case "relativeIncrease": { to = from + anim.target; break; };
        }
        return { from, to };
      });
      const newAnim = new TweenFromTo(anim.duration, from, to, "onlyTo", anim.k);
      return runAnimation(delta, newAnim);
    }
    case "TweenFromTo": {
      const finished = anim.k(x => {
        if (anim.fromToType === "setOnFrom") {
          x.set(x.obj, anim.from);
        }
        const current = x.get(x.obj);
        // update target value
        const currentIndex = (current - anim.from) / (anim.to - anim.from);
        const newIndex = Math.min(1, currentIndex + (delta / anim.duration));
        x.set(x.obj, linear(anim.from, anim.to, newIndex));
        return newIndex >= 1;
      });
      const remainingDelta = Math.max(delta - anim.duration - delta);
      if (finished) {
        return { remainingAnim: "nothing", remainingDelta };
      } else {
        const newAnim: TweenFromTo = { ...anim, fromToType: "onlyTo" };
        return { remainingAnim: newAnim, remainingDelta: "nothing" };
      }
    }
    case "Seq": {
      let newSeqList: Anim[] = [];
      let remainingDelta: number = delta;
      let i = 0;
      for (const sAnim of anim.list) {
        const result = runAnimation(remainingDelta, sAnim);
        if (result.remainingDelta === "nothing") {
          // @ts-ignore
          newSeqList = [result.remainingAnim].concat(anim.list.slice(i + 1));
          return { remainingAnim: new Seq(newSeqList), remainingDelta: "nothing" };
        } else {
          remainingDelta = result.remainingDelta;
        }
        i++;
      }
      return { remainingAnim: "nothing", remainingDelta };
    }
    case "Par": {
      let newParList: Anim[] = [];
      let newI = 0;
      let lowestRemainingDelta = Infinity;
      for (const sAnim of anim.list) {
        const result = runAnimation(delta, sAnim);
        if (result.remainingDelta === "nothing") {
          // @ts-ignore
          newParList[newI] = result.remainingAnim;
          newI++;
        } else if (result.remainingDelta < lowestRemainingDelta) {
          lowestRemainingDelta = result.remainingDelta;
        }
      }
      if (newParList.length === 0) {
        return { remainingAnim: "nothing", remainingDelta: lowestRemainingDelta };
      } else {
        return { remainingAnim: new Par(newParList), remainingDelta: "nothing" };
      }
    }
    case "Eff": {
      let nextAnim: Anim = undefined as any;
      anim.f(effk => {
        const value = effk.eff();
        nextAnim = effk.k(value);
      });
      return { remainingAnim: nextAnim, remainingDelta: "nothing" };
    }
    case "Noop": {
      return { remainingAnim: "nothing", remainingDelta: delta };
    }
  }
}
