export function linear(
  from: number,
  to: number,
  index: number,
) {
  return from + (to - from) * index;
}