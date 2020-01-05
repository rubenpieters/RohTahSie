import { Layout } from "./layout";
import { GenerateNode, AttackNode, Empty, ShieldNode } from "./definitions/ability";
import { Entity } from "./entity";
import { EnemyTarget, PlayerTarget } from "./definitions/target";

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
  roh: 10,
  maxRoh: 10,
  tah: 10,
  maxTah: 10,
  sie: 10,
  maxSie: 10,
  shield: "roh",
  dirty: false,
  statuses: [],
};

const layout2: Layout = {
  nodes: [
    new Empty,
    new Empty,
    new Empty,
    new AttackNode(10, new PlayerTarget()),

    new Empty,
    new Empty,
    new Empty,
    new AttackNode(10, new PlayerTarget()),

    new Empty,
    new Empty,
    new Empty,
    new AttackNode(10, new PlayerTarget()),

    new Empty,
    new Empty,
    new Empty,
    new AttackNode(10, new PlayerTarget()),
  ],
  currentIndex: 0,
}

const enemy2: Entity = {
  roh: 50,
  maxRoh: 50,
  tah: 50,
  maxTah: 50,
  sie: 50,
  maxSie: 50,
  shield: "roh",
  dirty: false,
  statuses: [],
};

const layout3: Layout = {
  nodes: [
    new Empty(),
    new AttackNode(5, new PlayerTarget()),
    new AttackNode(5, new PlayerTarget()),
    new GenerateNode(10, "roh", new EnemyTarget()),

    new Empty(),
    new AttackNode(5, new PlayerTarget()),
    new AttackNode(5, new PlayerTarget()),
    new GenerateNode(10, "roh", new EnemyTarget()),

    new GenerateNode(10, "roh", new EnemyTarget()),
    new GenerateNode(10, "roh", new EnemyTarget()),
    new GenerateNode(10, "tah", new EnemyTarget()),
    new GenerateNode(10, "tah", new EnemyTarget()),

    new Empty(),
    new AttackNode(5, new PlayerTarget()),
    new AttackNode(5, new PlayerTarget()),
    new GenerateNode(10, "roh", new EnemyTarget()),
  ],
  currentIndex: 0,
}

const enemy3: Entity = {
  roh: 40,
  maxRoh: 40,
  tah: 40,
  maxTah: 40,
  sie: 40,
  maxSie: 40,
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
    reward: 1,
  },
  "en2": {
    entity: enemy2,
    layout: layout2,
    reward: 2,
  },
  "en3": {
    entity: enemy3,
    layout: layout3,
    reward: 3,
  },
}