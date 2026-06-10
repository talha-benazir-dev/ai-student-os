export function formatStudyHours(minutes: number): string {
  if (minutes === 0) return "0h";
  const hours = minutes / 60;
  if (hours < 1) return `${minutes}m`;
  const formatted = hours.toFixed(1);
  return `${formatted.endsWith(".0") ? formatted.slice(0, -2) : formatted}h`;
}
