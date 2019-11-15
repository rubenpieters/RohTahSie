export type Enemy = {
  red: number,
  green: number,
  yellow: number,
}

type Enemies = typeof allEnemies;
export type EnemyKey = keyof Enemies;
// TODO: make immutable
export const allEnemies = {
  "en1": {
    red: 10,
    green: 10,
    yellow: 10,
  }
}