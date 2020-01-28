import { Layout } from "./layout";
import * as Ab from "./definitions/ability";
import { Entity } from "./entity";
import { EnemyTarget, PlayerTarget } from "./definitions/target";

const layout1: Layout = {
  nodes: [
    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,

    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,

    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,

    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
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
    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Discussion,

    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,

    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,

    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
    /*new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
    new AttackNode(10, new PlayerTarget()),

    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
    new AttackNode(10, new PlayerTarget()),

    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
    new AttackNode(10, new PlayerTarget()),

    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
    new AttackNode(10, new PlayerTarget()),*/
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
    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,

    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,

    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,

    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,

    /*new Ab.Dormant(),
    new AttackNode(5, new PlayerTarget()),
    new AttackNode(5, new PlayerTarget()),
    new GenerateNode(10, "roh", new EnemyTarget()),

    new Ab.Dormant(),
    new AttackNode(5, new PlayerTarget()),
    new AttackNode(5, new PlayerTarget()),
    new GenerateNode(10, "roh", new EnemyTarget()),

    new GenerateNode(10, "roh", new EnemyTarget()),
    new GenerateNode(10, "roh", new EnemyTarget()),
    new GenerateNode(10, "tah", new EnemyTarget()),
    new GenerateNode(10, "tah", new EnemyTarget()),

    new Ab.Dormant(),
    new AttackNode(5, new PlayerTarget()),
    new AttackNode(5, new PlayerTarget()),
    new GenerateNode(10, "roh", new EnemyTarget()),*/
  ],
  currentIndex: 0,
}

const enemy3: Entity = {
  roh: 45,
  maxRoh: 45,
  tah: 45,
  maxTah: 45,
  sie: 45,
  maxSie: 45,
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