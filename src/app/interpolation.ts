export type Interpolation = (t: number, from: number, to: number, duration: number) => number;

export function linear(t: number, from: number, to: number, duration: number): number {
  return from + (to - from) * t;
}

export function testInterpolation(t: number, from: number, to: number, duration: number): number {
  return t*t*t*t*t;
}