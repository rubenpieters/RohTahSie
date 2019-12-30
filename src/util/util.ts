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