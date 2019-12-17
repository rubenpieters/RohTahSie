export type Interpolation = (pctComplete: number, from: number, to: number, duration: number) => number;

export function linear(pctComplete: number, from: number, to: number, duration: number): number {
  return from + (to - from) * pctComplete;
}

export function easeOutQuint(pctComplete: number, from: number, to: number, duration: number): number {
  const t = pctComplete - 1;
  return (to - from)*(t*t*t*t*t + 1) + from;
}