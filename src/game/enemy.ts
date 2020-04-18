import { Layout } from "./layout";
import * as Ab from "./definitions/ability";
import * as DAb from "./definitions/dirAbility";
import { Entity } from "./entity";
import { EnemyTarget, PlayerTarget } from "./definitions/target";
import { Dir } from "./dir";

const layout1: Layout = {
  nodes: [
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },

    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },

    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },

    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
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
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Discussion, direction: new DAb.MoveRight() },

    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Discussion, direction: new DAb.MoveRight() },

    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Discussion, direction: new DAb.MoveRight() },

    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Discussion, direction: new DAb.MoveRight() },
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
    { ability: new Ab.Infection, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },

    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },

    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },

    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
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
    { ability: new Ab.VoodooDoll, direction: new DAb.MoveRight()  },
    { ability: new Ab.VoodooDoll, direction: new DAb.MoveRight()  },
    { ability: new Ab.VoodooDoll, direction: new DAb.MoveRight()  },
    { ability: new Ab.Discussion, direction: new DAb.MoveRight()  },

    { ability: new Ab.Rest, direction: new DAb.MoveRight()  },
    { ability: new Ab.Requiem, direction: new DAb.MoveRight()  },
    { ability: new Ab.Requiem, direction: new DAb.MoveRight()  },
    { ability: new Ab.Requiem, direction: new DAb.MoveRight()  },

    { ability: new Ab.VoodooDoll, direction: new DAb.MoveRight()  },
    { ability: new Ab.VoodooDoll, direction: new DAb.MoveRight()  },
    { ability: new Ab.VoodooDoll, direction: new DAb.MoveRight()  },
    { ability: new Ab.Discussion, direction: new DAb.MoveRight()  },

    { ability: new Ab.Rest, direction: new DAb.MoveRight()  },
    { ability: new Ab.Requiem, direction: new DAb.MoveRight()  },
    { ability: new Ab.Meditation, direction: new DAb.MoveRight()  },
    { ability: new Ab.Requiem, direction: new DAb.MoveRight()  },
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
    { ability: new Ab.Demon, direction: new DAb.MoveRight() },
    { ability: new Ab.VoodooDoll, direction: new DAb.MoveRight() },
    { ability: new Ab.VoodooDoll, direction: new DAb.MoveRight() },
    { ability: new Ab.VoodooDoll, direction: new DAb.MoveRight() },

    { ability: new Ab.VoodooDoll, direction: new DAb.MoveRight() },
    { ability: new Ab.VoodooDoll, direction: new DAb.MoveRight() },
    { ability: new Ab.Requiem, direction: new DAb.MoveRight() },
    { ability: new Ab.Requiem, direction: new DAb.MoveRight() },

    { ability: new Ab.Demon, direction: new DAb.MoveRight() },
    { ability: new Ab.VoodooDoll, direction: new DAb.MoveRight() },
    { ability: new Ab.VoodooDoll, direction: new DAb.MoveRight() },
    { ability: new Ab.VoodooDoll, direction: new DAb.MoveRight() },

    { ability: new Ab.VoodooDoll, direction: new DAb.MoveRight() },
    { ability: new Ab.VoodooDoll, direction: new DAb.MoveRight() },
    { ability: new Ab.Requiem, direction: new DAb.MoveRight() },
    { ability: new Ab.Requiem, direction: new DAb.MoveRight() },
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
    { ability: new Ab.Demon, direction: new DAb.MoveRight() },
    { ability: new Ab.Demon, direction: new DAb.MoveRight() },
    { ability: new Ab.Demon, direction: new DAb.MoveRight() },
    { ability: new Ab.Rest, direction: new DAb.MoveRight() },

    { ability: new Ab.Requiem, direction: new DAb.MoveRight() },
    { ability: new Ab.Heresy, direction: new DAb.MoveRight() },
    { ability: new Ab.Meditation, direction: new DAb.MoveRight() },
    { ability: new Ab.Reflex, direction: new DAb.MoveRight() },

    { ability: new Ab.Demon, direction: new DAb.MoveRight() },
    { ability: new Ab.Demon, direction: new DAb.MoveRight() },
    { ability: new Ab.Demon, direction: new DAb.MoveRight() },
    { ability: new Ab.Reflex, direction: new DAb.MoveRight() },

    { ability: new Ab.Requiem, direction: new DAb.MoveRight() },
    { ability: new Ab.Heresy, direction: new DAb.MoveRight() },
    { ability: new Ab.Meditation, direction: new DAb.MoveRight() },
    { ability: new Ab.Isolation, direction: new DAb.MoveRight() },
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

const dmg1Layout: Layout = {
  nodes: [
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Discussion, direction: new DAb.GoToX(0) },

    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },

    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },

    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
    { ability: new Ab.Dormant, direction: new DAb.MoveRight() },
  ],
  currentIndex: 0,
}

const dmgEn1: Entity = {
  roh: 25,
  maxRoh: 25,
  tah: 25,
  maxTah: 25,
  sie: 25,
  maxSie: 25,
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
  "dmg1": {
    entity: dmgEn1,
    layout: dmg1Layout,
    reward: 1,
  },
}