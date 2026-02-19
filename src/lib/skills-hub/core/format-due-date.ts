const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Formats a due date into a human-readable string.
 *
 * - "Yesterday", "Today", "Tomorrow" for those days
 * - Day name (e.g. "Wed") if within the next 5 days
 * - Otherwise M/D (e.g. "3/25")
 */
export function formatDueDate(dateInput: string | Date): string {
  const date = new Date(dateInput);
  const now = new Date();

  // Normalize to start of day in local timezone
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === -1) return "Yesterday";
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays >= 2 && diffDays <= 5) return DAY_NAMES[target.getDay()];

  return `${target.getMonth() + 1}/${target.getDate()}`;
}
