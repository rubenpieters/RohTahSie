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

export type AnimTarget<A> = {
  obj: A,
  target: { [K in keyof A]?: A[K] },
}

export function mkAnimTarget<A, R>(
  obj: A,
  target: { [K in keyof A]?: A[K] },
): (e: (t: AnimTarget<A>) => R) => R {
  return k => k({ obj, target }); 
}

export class TweenTo {
  public readonly tag: "TweenTo" = "TweenTo";

  constructor(
    public readonly duration: number,
    public readonly k: <R>(e: <A>(t: AnimTarget<A>) => R) => R,
  ) {}
}

export type Anim
  = Par
  | Seq
  | TweenTo
  ;

function runAnimation(
  delta: number,
  anim: Anim,
): { remainingAnim: Anim, remainingDelta: "nothing" } | { remainingAnim: "nothing", remainingDelta: number } {
  switch (anim.tag) {
    case "TweenTo": {
      anim.k(x => {
        for (const key in x.target) {
          // @ts-ignore
          x.obj[key] = updateValue(delta, anim.duration, x.target[key], x.obj[key]);
        }
      });
      const newDuration = anim.duration - delta;
      if (newDuration > 0) {
        return { remainingAnim: new TweenTo(newDuration, anim.k), remainingDelta: "nothing" };
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

const obj: { a: number, b: number } = { a: 0, b: 0 };

const a1 = new TweenTo(1, mkAnimTarget(obj, { a: 10 }));
const a2 = new TweenTo(1, mkAnimTarget(obj, { b: 10 }));
const a3 = new Seq([a1, a2]);
const a4 = new Par([a1, a2]);

/*
let result = runAnimation(0.5, a3);
console.log(JSON.stringify(obj));
result = runAnimation(0.5, result.remainingAnim as any);
console.log(JSON.stringify(obj));
result = runAnimation(0.5, result.remainingAnim as any);
console.log(JSON.stringify(obj));
result = runAnimation(0.5, result.remainingAnim as any);
console.log(JSON.stringify(obj));
console.log(JSON.stringify(result));
*/

let result = runAnimation(0.5, a4);
console.log(JSON.stringify(obj));
result = runAnimation(0.5, result.remainingAnim as any);
console.log(JSON.stringify(obj));
console.log(JSON.stringify(result));
