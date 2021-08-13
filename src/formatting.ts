export function shortHandDollars(
  value: number,
  fractionDigits: number = 0
): string {
  if (value >= 1000000) {
    return `${formatDollars(value / 1000000.0, fractionDigits)}m`;
  }
  if (value >= 1000) {
    return `${formatDollars(value / 1000.0, fractionDigits)}k`;
  }
  return `${formatDollars(value, fractionDigits)}`;
}

export function formatDollars(value: number, fractionDigits: number): string {
  return `$${value.toFixed(fractionDigits)}`;
}

export function parseAndShortHandDollars(
  value: string,
  fractionDigits: number = 0
): string {
  return shortHandDollars(parseFloat(value) || 0, fractionDigits);
}
