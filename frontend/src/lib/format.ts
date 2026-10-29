export function formatHours(hours: number | null | undefined): string {
  if (hours == null || !Number.isFinite(hours)) return "Duration unknown";
  const totalMin = Math.round(hours * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} min`;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export function formatMinutes(minutes: number | null | undefined): string {
  if (minutes == null || !Number.isFinite(minutes)) return "Unknown";
  return formatHours(minutes / 60);
}

/** Unknown fees are shown as unknown, never as zero. */
export function formatFee(fee: number | null | undefined): string {
  if (fee == null || !Number.isFinite(fee)) return "Entry fee unknown";
  if (fee === 0) return "Free entry";
  return `₹${fee.toLocaleString("en-IN")}`;
}

export function formatRupees(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

export function titleCase(text: string): string {
  return text
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function parseTags(tags: string | null | undefined): string[] {
  if (!tags) return [];
  return tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}
