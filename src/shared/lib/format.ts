const COUNT_FORMAT = new Intl.NumberFormat("en-US");

export function formatCount(value: number): string {
  return COUNT_FORMAT.format(value);
}
