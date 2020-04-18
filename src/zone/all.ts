import { EnemyKey } from "src/game/enemy";

export type Zones = {
  enemyIds: EnemyKey[],
  selected: boolean,
}[];


export function allZones(): Zones {
  return [
    {
      enemyIds: ["en1", "en2", "en3"],
      selected: true,
    },
    {
      enemyIds: ["en4", "en5", "en6"],
      selected: false,
    },
    {
      enemyIds: ["dmg1"],
      selected: false,
    },
    {
      enemyIds: ["dmgH1"],
      selected: false,
    },
  ];
}