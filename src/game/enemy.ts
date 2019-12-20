import { Layout } from "./layout";
import { GenerateNode, AttackNode, Empty, ShieldNode } from "./definitions/ability";
import { Entity } from "./entity";
import { EnemyTarget, PlayerTarget } from "./definitions/target";

const layout1: Layout = {
  nodes: [
    new ShieldNode("tah", new EnemyTarget()),
    new AttackNode(10, new PlayerTarget()),
    new AttackNode(10, new PlayerTarget()),
    new AttackNode(10, new PlayerTarget()),

    new AttackNode(10, new PlayerTarget()),
    new AttackNode(10, new PlayerTarget()),
    new AttackNode(10, new PlayerTarget()),
    new AttackNode(10, new PlayerTarget()),

    new Empty,
    new Empty,
    new Empty,
    new Empty,

    new Empty,
    new Empty,
    new Empty,
    new AttackNode(10, new PlayerTarget()),
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
  dirty: false,
  statuses: [],
};

type Enemies = typeof allEnemies;
export type EnemyKey = keyof Enemies;
export const allEnemies = {
  "en1": {
    entity: enemy1,
    layout: layout1,
  }
}