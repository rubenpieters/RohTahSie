import { Layout } from "./layout";
import { GenerateNode } from "./gameNode";

const layout1: Layout = {
  nodes: [
    new GenerateNode("roh"),
    new GenerateNode("roh"),
    new GenerateNode("roh"),
    new GenerateNode("roh"),
    new GenerateNode("roh"),
    new GenerateNode("roh"),
    new GenerateNode("roh"),
    new GenerateNode("roh"),
    new GenerateNode("roh"),
    new GenerateNode("roh"),
    new GenerateNode("roh"),
    new GenerateNode("roh"),
    new GenerateNode("roh"),
    new GenerateNode("roh"),
  ],
  currentIndex: 0,
}

type Enemies = typeof allEnemies;
export type EnemyKey = keyof Enemies;
// TODO: make immutable
export const allEnemies = {
  "en1": {
    red: 10,
    green: 10,
    yellow: 10,
    layout: layout1,
  },
}