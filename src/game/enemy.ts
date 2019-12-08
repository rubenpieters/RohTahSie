import { Layout } from "./layout";
import { GenerateNode, AttackNode } from "./gameNode";

const layout1: Layout = {
  nodes: [
    new GenerateNode(10, "roh", "enemy"),
    new GenerateNode(10, "roh", "enemy"),
    new GenerateNode(10, "roh", "enemy"),
    new GenerateNode(10, "roh", "enemy"),

    new GenerateNode(10, "roh", "enemy"),
    new GenerateNode(10, "roh", "enemy"),
    new GenerateNode(10, "roh", "enemy"),
    new GenerateNode(10, "roh", "enemy"),

    new GenerateNode(10, "roh", "enemy"),
    new GenerateNode(10, "roh", "enemy"),
    new GenerateNode(10, "roh", "enemy"),
    new GenerateNode(10, "roh", "enemy"),

    new GenerateNode(10, "roh", "enemy"),
    new GenerateNode(10, "roh", "enemy"),
    new GenerateNode(10, "roh", "enemy"),
    new GenerateNode(10, "roh", "enemy"),
  ],
  currentIndex: 0,
}

type Enemies = typeof allEnemies;
export type EnemyKey = keyof Enemies;
export const allEnemies = {
  "en1": {
    entity: {
      roh: 100,
      maxRoh: 100,
      tah: 100,
      maxTah: 100,
      sie: 100,
      maxSie: 100,
    },
    layout: layout1,
  }
}