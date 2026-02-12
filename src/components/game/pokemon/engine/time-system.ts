// ============================================================================
// Pokemon RPG Engine — Time-of-Day System (Gen 2+)
// ============================================================================

export type TimeOfDay = 'morning' | 'day' | 'night';

/** Get the current time of day based on real clock. */
export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours();
  if (hour >= 4 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 18) return 'day';
  return 'night';
}

/** Check if it's daytime (morning or day). Used for Espeon evolution. */
export function isDaytime(): boolean {
  const tod = getTimeOfDay();
  return tod === 'morning' || tod === 'day';
}

/** Check if it's nighttime. Used for Umbreon evolution. */
export function isNighttime(): boolean {
  return getTimeOfDay() === 'night';
}
