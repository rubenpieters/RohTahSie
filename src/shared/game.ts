import { Template } from "./template";
import { CacheValues } from "src/app/main";
import { EnemyKey, Enemy, allEnemies } from "./enemy";

export class GenerateNode {
  public readonly tag: "GenerateNode" = "GenerateNode";
  public readonly size = 1;

  constructor(
    public readonly rune: string,
  ) {}
}

export class SummonNode {
  public readonly tag: "SummonNode" = "SummonNode";
  public readonly size = 1;

  constructor(
    public readonly enemyId: EnemyKey,
  ) {}
}

export class AttackNode {
  public readonly tag: "AttackNode" = "AttackNode";
  public readonly size = 1;

  constructor(
    public readonly damage: number,
  ) {}
}

export class Empty {
  public readonly tag: "Empty" = "Empty";
  public readonly size = 1;

  constructor(
  ) {}
}

export type GameNode
  = GenerateNode
  | SummonNode
  | AttackNode
  | Empty
  ;

export type Layout = GameNode[];

export type GameState = {
  nodeIndex: number,
  timeInNode: number,
  layout: Layout,
  runes: any,
  templates: GameNode[],
  currentEnemy: Enemy | undefined;
};

export function advanceState(
  state: GameState,
  delta: number,
) {
  let newTimeInNode = state.timeInNode + delta;
  let activationThreshold = state.layout[state.nodeIndex].size * 100;
  while (newTimeInNode > activationThreshold) {
    // activate node
    activateNode(state.layout[state.nodeIndex], state);
    // update node index
    state.nodeIndex = state.nodeIndex + state.layout[state.nodeIndex].size;
    if (state.nodeIndex >= 14) state.nodeIndex -= 14 * (Math.floor(state.nodeIndex / 14));
    // calculate new threshold and update new time in node
    activationThreshold = state.layout[state.nodeIndex].size * 100;
    newTimeInNode = newTimeInNode - activationThreshold;
  }
  state.timeInNode = newTimeInNode;
}

export function activateNode(
  node: GameNode,
  state: GameState,
): void {
  switch (node.tag) {
    case "GenerateNode": {
      if (typeof state.runes[node.rune] === "undefined") {
        state.runes[node.rune] = 1;
      } else {
        if (state.runes[node.rune] < 100) {
          state.runes[node.rune] += 1;
        }
      }
      break;
    }
    case "SummonNode": {
      state.currentEnemy = allEnemies[node.enemyId];
      break;
    }
    case "AttackNode": {
      if (state.currentEnemy !== undefined) {
        state.currentEnemy.red = Math.max(0, state.currentEnemy.red - node.damage);
        if (state.currentEnemy.red <= 0) {
          state.currentEnemy = undefined;
        }
      }
      break;
    }
    case "Empty": {
      break;
    }
  }
}

export function nodeSprite(
  node: GameNode,
): CacheValues {
  switch (node.tag) {
    case "GenerateNode": {
      switch (node.rune) {
        case "x": return "box";
        case "y": return "box2";
        case "sword": return "sword";
        case "shield": return "shield";
        case "res_red": return "res_red";
        case "res_gre": return "res_gre";
        case "res_yel": return "res_yel";
        default: return "err";
      }
    }
    case "SummonNode": {
      return "creep";
    }
    case "AttackNode": {
      return "sword";
    }
    case "Empty": {
      return "err";
    }
  }
}