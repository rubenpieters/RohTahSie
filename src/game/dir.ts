export type Dir = "up" | "down" | "left" | "right"

export const allDirs: ["up", "down", "left", "right"] = ["up", "down", "left", "right"];

export function dirToDeg(
  dir: Dir,
): number {
  switch (dir) {
    case "up": return -90;
    case "down": return 90;
    case "left": return 180;
    case "right": return 0;
  }
}

export function indexInDir(
  index: number,
  dir: Dir,
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