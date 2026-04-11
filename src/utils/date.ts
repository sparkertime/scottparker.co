/** Returns ordinal suffix for a day number (1st, 2nd, 3rd, 4th…) */
function ordinal(n: number): string {
  if ([11, 12, 13].includes(n % 100)) return `${n}th`;
  const suffix = { 1: 'st', 2: 'nd', 3: 'rd' }[n % 10];
  return `${n}${suffix ?? 'th'}`;
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Formats a date like Jekyll's current format: "Monday, April 4th, 2026"
 * Uses UTC values to avoid timezone-dependent date shifts.
 */
export function formatDate(date: Date): string {
  const day = DAYS[date.getUTCDay()];
  const month = MONTHS[date.getUTCMonth()];
  const dayNum = ordinal(date.getUTCDate());
  const year = date.getUTCFullYear();
  return `${day}, ${month} ${dayNum}, ${year}`;
}

/** ISO date string for machine-readable attributes (YYYY-MM-DD) */
export function isoDate(date: Date): string {
  return date.toISOString().split('T')[0];
}
