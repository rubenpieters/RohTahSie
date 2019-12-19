import { Layout } from "./layout";
import { GenerateNode, AttackNode, Empty } from "./gameNode";
import { Entity } from "./entity";

const layout1: Layout = {
  nodes: [
    new Empty,
    new Empty,
    new Empty,
    new Empty,

    new Empty,
    new Empty,
    new Empty,
    new Empty,

    new Empty,
    new Empty,
    new Empty,
    new Empty,

    new Empty,
    new Empty,
    new Empty,
    new Empty,
  ],
  currentIndex: 0,
}

const enemy1: Entity = {
  roh: 100,
  maxRoh: 100,
  tah: 100,
  maxTah: 100,
  sie: 100,
  maxSie: 100,
  shield: "roh",
};

type Enemies = typeof allEnemies;
export type EnemyKey = keyof Enemies;
export const allEnemies = {
  "en1": {
    entity: enemy1,
    layout: layout1,
  }
}