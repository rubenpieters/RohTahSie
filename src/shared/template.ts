import { GameNode, GenerateNode } from "./game";

export type Template = () => GameNode;

export function template1() {
  return new GenerateNode("x");
}

export function template2() {
  return new GenerateNode("y");
}