export function indexInDir(
  index: number,
  dir: "up" | "down" | "left" | "right",
): number | undefined {
  switch (dir) {
    case "up": {
      if (Math.floor(index / 4) !== 0) {
        return index - 4;
      }
      return undefined;
    }
    case "down": {
      if (Math.floor(index / 4) !== 3) {
        return index + 4;
      }
      return undefined;
    }
    case "left": {
      if (index % 4 !== 0) {
        return index - 1;
      }
      return undefined;
    }
    case "right": {
      if (index % 4 !== 3) {
        return index + 1;
      }
      return undefined;
    }
  }
}