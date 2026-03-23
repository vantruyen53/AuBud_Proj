export default function formatNumber(value: number): string {
  if (value < 1000) return value.toString();

  const units = [
    { threshold: 1_000_000_000, suffix: "B" },
    { threshold: 1_000_000, suffix: "M" },
    { threshold: 1_000, suffix: "k" },
  ];

  for (const { threshold, suffix } of units) {
    if (value >= threshold) {
      const divided = value / threshold;
      const rounded = Math.round(divided * 10) / 10;
      // Nếu sau khi làm tròn 1 chữ số thập phân mà .0 thì bỏ đi
      const formatted = rounded % 1 === 0
        ? rounded.toFixed(0)
        : rounded.toFixed(1);
      return `${formatted}${suffix}`;
    }
  }

  return value.toString();
}