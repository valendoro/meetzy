export function formatDurationSec(totalSec: number): string {
  const t = Math.max(0, Math.round(totalSec));
  const m = Math.floor(t / 60);
  const s = t % 60;
  if (m <= 0) return `${s}s`;
  return `${m}m ${s}s`;
}
