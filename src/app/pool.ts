type PoolElement<A> = {
  a: A,
  alive: boolean,
}

export type Pool<A> = {
  elements: PoolElement<A>[],
  name: string,
};

export function newParticle<A extends PIXI.DisplayObject>(
  pool: Pool<A>,
  props: { [K in keyof A]?: A[K] },
): PoolElement<A> {
  const element = pool.elements.find(x => ! x.alive);
  if (element !== undefined) {
    element.alive = true;
    element.a.visible = true;
    Object.assign(element.a, props);
    return element;
  } else {
    throw `Pool ${pool.name} ran out of spots.`;
  }
}

export function killParticle<A extends PIXI.DisplayObject>(
  particle: PoolElement<A>
): void {
  particle.alive = false;
  particle.a.visible = false;
}

export function mkPool<A extends PIXI.DisplayObject>(
  f: () => A,
  size: number,
  name: string,
  container: PIXI.Container,
): Pool<A> {
  const elements: PoolElement<A>[] = [];
  for (let i = 0; i < size; i++) {
    const element = {
      a: f(),
      alive: false,
    }
    element.a.visible = false;
    container.addChild(element.a)
    elements.push(element);
  }
  return { elements, name };
}

export type Pools = {
  textParticlePool: Pool<PIXI.BitmapText>,
  spriteParticlePool: Pool<PIXI.Sprite>
}

export function initializePools(
  parentContainer: PIXI.Container,
): Pools {
  const container = new PIXI.Container();

  // initialize text particle pool
  const textParticlePool = mkPool(() => {
    return new PIXI.BitmapText("", {
      font: {
        name: "Bahnschrift",
        size: 28,
      },
      align: "center",
      tint: 0x000000,
    });
  }, 10, "textParticlePool", container);

  // initialize sprite particle pool
  const spriteParticlePool = mkPool(() => {
    return new PIXI.Sprite();
  }, 3, "spriteParticlePool", container);

  parentContainer.addChild(container);

  return { textParticlePool, spriteParticlePool };
}