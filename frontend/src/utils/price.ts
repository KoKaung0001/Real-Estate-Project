export function formatPropertyPrice(value: number): string {
  if (value > 999_999) {
    const lakhs = value / 100_000;
    return `${lakhs.toLocaleString('en-US', { maximumFractionDigits: 2 })} Lakhs`;
  }

  return `MMK ${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}
