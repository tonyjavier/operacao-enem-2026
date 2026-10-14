export const TIME_ZONE = 'America/Cuiaba';
export const START_DATE = '2026-10-13';
export const END_DATE = '2026-11-15';
export const FIRST_EXAM = '2026-11-08';
export const SECOND_EXAM = '2026-11-15';

export function todayInCuiaba(date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const value = (type: string) => parts.find((part) => part.type === type)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
}

export function formatDate(date: string, options?: Intl.DateTimeFormatOptions): string {
  const [year, month, day] = date.split('-').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day, 12));
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC', ...options }).format(value);
}

export function weekdayLong(date: string): string {
  return formatDate(date, { weekday: 'long' });
}

export function addDays(date: string, count: number): string {
  const [year, month, day] = date.split('-').map(Number);
  const value = new Date(Date.UTC(year, month - 1, day + count, 12));
  return `${value.getUTCFullYear()}-${String(value.getUTCMonth() + 1).padStart(2, '0')}-${String(value.getUTCDate()).padStart(2, '0')}`;
}

export function daysBetween(from: string, to: string): number {
  const a = Date.parse(`${from}T12:00:00Z`);
  const b = Date.parse(`${to}T12:00:00Z`);
  return Math.round((b - a) / 86_400_000);
}

export function clampStudyDate(date: string): { date: string; adjusted: boolean } {
  if (date < START_DATE) return { date: START_DATE, adjusted: true };
  if (date > END_DATE) return { date: END_DATE, adjusted: true };
  return { date, adjusted: false };
}
