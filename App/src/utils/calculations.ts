export function round(value: number, decimals = 0): number {
  const factor = 10 ** decimals
  return Math.round(value * factor) / factor
}

export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}
