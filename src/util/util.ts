import { cloneDeep } from "lodash";

export function filterUndefined<A>(
  l: (A | undefined)[]
): A[] {
  // @ts-ignore
  return l.filter(x => x !== undefined);
}

export function fillUndefinedUpTo<A>(
  l: A[],
  padding: A,
  size: number,
): A[] {
  for (let i = 0; i < size; i++) {
    if (l[i] === undefined) {
      l[i] = cloneDeep(padding);
    }
  }
  return l;
}

export function mapRecord<A, K extends keyof A, B>(
  k: K,
  a: A,
  f: (ak: A[K]) => B,
): Omit<A, K> & { [k in K]: B } {
  const copy = cloneDeep(a);
  // @ts-ignore
  copy[k] = f(a[k]);
  // @ts-ignore
  return copy;
}
