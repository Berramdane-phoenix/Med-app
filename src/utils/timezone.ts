import {
  format,
  parseISO,
  startOfDay,
  endOfDay,
  addMinutes,
  isBefore,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
} from 'date-fns';
import {
  toZonedTime,
  formatInTimeZone,
  getTimezoneOffset,
} from 'date-fns-tz';

/**
 * Replaces missing `zonedTimeToUtc` from date-fns-tz.
 */
function zonedTimeToUtc(date: Date, timeZone: string): Date {
  const formatted = formatInTimeZone(date, timeZone, "yyyy-MM-dd'T'HH:mm:ssXXX");
  return new Date(formatted);
}

/**
 * Get the user's current timezone
 */
export function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Convert a UTC datetime string to user's local timezone
 */
export function utcToLocal(utcDateString: string, timezone?: string): Date {
  const userTimezone = timezone || getUserTimezone();
  return toZonedTime(parseISO(utcDateString), userTimezone);
}

/**
 * Convert a local datetime to UTC for database storage
 */
export function localToUtc(localDate: Date, timezone?: string): Date {
  const userTimezone = timezone || getUserTimezone();
  return zonedTimeToUtc(localDate, userTimezone);
}

/**
 * Format a UTC datetime string in user's local timezone
 */
export function formatInUserTimezone(
  utcDateString: string,
  formatString: string = 'PPpp',
  timezone?: string
): string {
  const userTimezone = timezone || getUserTimezone();
  return formatInTimeZone(parseISO(utcDateString), userTimezone, formatString);
}

/**
 * Get the start and end of a day in UTC for a given local date
 */
export function getDayBoundsInUtc(localDateString: string, timezone?: string): {
  startUtc: Date;
  endUtc: Date;
} {
  const userTimezone = timezone || getUserTimezone();
  const localDate = parseISO(localDateString + 'T00:00:00');

  const startOfDayLocal = startOfDay(localDate);
  const endOfDayLocal = endOfDay(localDate);

  return {
    startUtc: zonedTimeToUtc(startOfDayLocal, userTimezone),
    endUtc: zonedTimeToUtc(endOfDayLocal, userTimezone),
  };
}

/**
 * Create a datetime in user's timezone from date and time components
 */
export function createLocalDateTime(
  dateString: string, // YYYY-MM-DD
  timeString: string, // HH:MM
  timezone?: string
): Date {
  const [hours, minutes] = timeString.split(':').map(Number);
  const localDate = parseISO(dateString + 'T00:00:00');
  return setMilliseconds(
    setSeconds(
      setMinutes(
        setHours(localDate, hours),
        minutes
      ),
      0
    ),
    0
  );
}

/**
 * Generate time slots for a doctor on a specific day in user's timezone
 */
export function generateTimeSlotsForDay(
  dateString: string,
  workingHours: { start: string; end: string },
  slotDurationMinutes: number,
  timezone?: string
): Date[] {
  const startTime = createLocalDateTime(dateString, workingHours.start, timezone);
  const endTime = createLocalDateTime(dateString, workingHours.end, timezone);

  const slots: Date[] = [];
  let currentSlot = startTime;

  while (
    isBefore(addMinutes(currentSlot, slotDurationMinutes), endTime) ||
    currentSlot.getTime() === endTime.getTime() - slotDurationMinutes * 60 * 1000
  ) {
    slots.push(new Date(currentSlot));
    currentSlot = addMinutes(currentSlot, slotDurationMinutes);
  }

  return slots;
}

/**
 * Check if a datetime is in the past relative to user's timezone
 */
export function isInPast(dateTime: Date, timezone?: string): boolean {
  const userTimezone = timezone || getUserTimezone();
  const nowInUserTz = toZonedTime(new Date(), userTimezone);
  const dateTimeInUserTz = toZonedTime(dateTime, userTimezone);

  return isBefore(dateTimeInUserTz, nowInUserTz);
}

/**
 * Check if a local date string represents today in user's timezone
 */
export function isToday(dateString: string, timezone?: string): boolean {
  const userTimezone = timezone || getUserTimezone();
  const today = format(toZonedTime(new Date(), userTimezone), 'yyyy-MM-dd');
  return dateString === today;
}

/**
 * Get today's date string in user's timezone
 */
export function getTodayString(timezone?: string): string {
  const userTimezone = timezone || getUserTimezone();
  return format(toZonedTime(new Date(), userTimezone), 'yyyy-MM-dd');
}

/**
 * Format time for display in user's timezone
 */
export function formatTimeForDisplay(dateTime: Date, timezone?: string): string {
  const userTimezone = timezone || getUserTimezone();
  return formatInTimeZone(dateTime, userTimezone, 'HH:mm');
}

/**
 * Format date for display in user's timezone
 */
export function formatDateForDisplay(dateTime: Date, timezone?: string): string {
  const userTimezone = timezone || getUserTimezone();
  return formatInTimeZone(dateTime, userTimezone, 'PPP');
}

/**
 * Get timezone offset information for display
 */
export function getTimezoneInfo(timezone?: string): {
  name: string;
  offset: string;
  abbreviation: string;
} {
  const userTimezone = timezone || getUserTimezone();
  const now = new Date();

  const offsetMinutes = getTimezoneOffset(userTimezone, now);
  const offsetHours = Math.abs(offsetMinutes) / 60;
  const offsetSign = offsetMinutes <= 0 ? '+' : '-';
  const offsetString = `${offsetSign}${Math.floor(offsetHours)
    .toString()
    .padStart(2, '0')}:${(Math.abs(offsetMinutes) % 60).toString().padStart(2, '0')}`;

  const abbreviation = formatInTimeZone(now, userTimezone, 'zzz');

  return {
    name: userTimezone,
    offset: offsetString,
    abbreviation,
  };
}
