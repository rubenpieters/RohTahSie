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
    new Ab.Discussion,

    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Discussion,

    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Dormant,
    new Ab.Discussion,
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
    new Ab.Infection,
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

const layout4: Layout = {
  nodes: [
    new Ab.VoodooDoll,
    new Ab.VoodooDoll,
    new Ab.VoodooDoll,
    new Ab.Discussion,

    new Ab.Rest,
    new Ab.Requiem,
    new Ab.Requiem,
    new Ab.Requiem,

    new Ab.VoodooDoll,
    new Ab.VoodooDoll,
    new Ab.VoodooDoll,
    new Ab.Discussion,

    new Ab.Rest,
    new Ab.Requiem,
    new Ab.Meditation,
    new Ab.Requiem,
  ],
  currentIndex: 0,
}

const enemy4: Entity = {
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

const layout5: Layout = {
  nodes: [
    new Ab.Demon,
    new Ab.VoodooDoll,
    new Ab.VoodooDoll,
    new Ab.VoodooDoll,

    new Ab.VoodooDoll,
    new Ab.VoodooDoll,
    new Ab.Requiem,
    new Ab.Requiem,

    new Ab.Demon,
    new Ab.VoodooDoll,
    new Ab.VoodooDoll,
    new Ab.VoodooDoll,

    new Ab.VoodooDoll,
    new Ab.VoodooDoll,
    new Ab.Requiem,
    new Ab.Requiem,
  ],
  currentIndex: 0,
}

const enemy5: Entity = {
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

const layout6: Layout = {
  nodes: [
    new Ab.Demon,
    new Ab.Demon,
    new Ab.Demon,
    new Ab.Rest,

    new Ab.Requiem,
    new Ab.Heresy,
    new Ab.Meditation,
    new Ab.Reflex,

    new Ab.Demon,
    new Ab.Demon,
    new Ab.Demon,
    new Ab.Reflex,

    new Ab.Requiem,
    new Ab.Heresy,
    new Ab.Meditation,
    new Ab.Isolation,
  ],
  currentIndex: 0,
}

const enemy6: Entity = {
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
  "en4": {
    entity: enemy4,
    layout: layout4,
    reward: 10,
  },
  "en5": {
    entity: enemy5,
    layout: layout5,
    reward: 10,
  },
  "en6": {
    entity: enemy6,
    layout: layout6,
    reward: 10,
  },
}