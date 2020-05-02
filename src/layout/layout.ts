export function wrappedLayout<A extends PIXI.DisplayObject, B>(
  parentContainer: PIXI.Container,
  f: (i: number) => A,
  embed: (a: A, i: number) => B,
  count: number,
  options: {
    orientation: "horizontal" | "vertical",
    spacing: { x: number, y: number },
    start: { x: number, y: number },
    wrappingLimit?: number,
  },
): B[] {
  const objs: B[] = [];
  for (let i = 0; i < count; i++) {
    const col = calcCol(options.orientation, i, options.wrappingLimit);
    const row = calcRow(options.orientation, i, options.wrappingLimit);
    const obj = f(i);
    obj.x = options.start.x + options.spacing.x * col;
    obj.y = options.start.y + options.spacing.y * row;
    parentContainer.addChild(obj);
    const embedded = embed(obj, i);
    objs.push(embedded);
  }
  return objs;
}

function calcCol(
  orientation: "horizontal" | "vertical",
  i: number,
  wrappingLimit?: number,
) {
  if (orientation === "horizontal") {
    return wrappingLimit === undefined ?
      i : i % wrappingLimit;
  } else {
    return wrappingLimit === undefined ?
      0 : Math.floor(i / wrappingLimit);
  }
}

function calcRow(
  orientation: "horizontal" | "vertical",
  i: number,
  wrappingLimit?: number,
) {
  if (orientation === "horizontal") {
    return wrappingLimit === undefined ?
      0 : Math.floor(i / wrappingLimit);
  } else {
    return wrappingLimit === undefined ?
      i : i % wrappingLimit;
  }
}
