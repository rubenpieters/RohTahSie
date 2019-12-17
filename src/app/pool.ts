type PoolElement<A> = {
  a: A,
  alive: boolean,
}

export type Pool<A> = {
  elements: PoolElement<A>[],
  name: string,
};

export function newParticle<A>(
  pool: Pool<A>,
  props: { [K in keyof A]?: A[K] },
): PoolElement<A> {
  const element = pool.elements.find(x => ! x.alive);
  if (element !== undefined) {
    element.alive = true;
    Object.assign(element.a, props);
    return element;
  } else {
    throw `Pool ${pool.name} ran out of spots.`;
  }
}

export function mkPool<A>(
  f: () => A,
  size: number,
  name: string,
): Pool<A> {
  const elements: PoolElement<A>[] = [];
  for (let i = 0; i++; i < size) {
    const element = {
      a: f(),
      alive: false,
    }
    elements.push(element);
  }
  return { elements, name };
}