import { Layout } from "./game";
import { GenerateNode } from "./gameNode";

// TODO: make this a class
export type Enemy = {
  red: number,
  green: number,
  yellow: number,
  layout: Layout,
}

const layout1: Layout = [
  new GenerateNode("res_red"),
  new GenerateNode("res_red"),
  new GenerateNode("res_red"),
  new GenerateNode("res_red"),
  new GenerateNode("res_red"),
  new GenerateNode("res_red"),
  new GenerateNode("res_red"),
  new GenerateNode("res_gre"),
  new GenerateNode("res_gre"),
  new GenerateNode("res_gre"),
  new GenerateNode("res_gre"),
  new GenerateNode("res_yel"),
  new GenerateNode("res_yel"),
  new GenerateNode("res_yel"),
];

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