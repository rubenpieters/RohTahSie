import { GameNode } from "../game/gameNode";

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
  | Eff
  | Noop
  ;

export function runAnimation(
  delta: number,
  anim: Anim,
): { remainingAnim: Anim, remainingDelta: "nothing" } | { remainingAnim: "nothing", remainingDelta: number } {
  switch (anim.tag) {
    case "TweenTo": {
      let absoluteTarget = undefined as any;
      anim.k(x => {
        const current = x.get(x.obj);
        // calculate absolute target value
        switch (anim.targetType) {
          case "absolute": {
            absoluteTarget = anim.target;
            break;
          }
          case "relativeIncrease": {
            absoluteTarget = current + anim.target;
            break;
          }
          case "relativeDecrease": {
            absoluteTarget = current - anim.target;
            break;
          }
        }
        // update target value
        x.set(x.obj, updateValue(delta, anim.duration, absoluteTarget, current));
      });
      const newDuration = anim.duration - delta;
      if (newDuration > 0) {
        return { remainingAnim: new TweenTo(newDuration, absoluteTarget, "absolute", anim.k), remainingDelta: "nothing" };
      } else {
        return { remainingAnim: "nothing", remainingDelta: -newDuration };
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

function updateValue(
  delta: number,
  duration: number,
  target: number,
  current: number,
): number {
  const speed = (target - current) * delta / duration
  const newValue = current + speed
  if (target > current) {
    return Math.min(target, newValue);
  } else {
    return Math.max(target, newValue);
  }
}

