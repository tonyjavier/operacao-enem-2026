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

export function isValidIsoDate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const timestamp = Date.parse(`${date}T12:00:00.000Z`);
  return Number.isFinite(timestamp) && new Date(timestamp).toISOString().slice(0, 10) === date;
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

function clampToPlan(date: string): string {
  if (date < START_DATE) return START_DATE;
  if (date > END_DATE) return END_DATE;
  return date;
}

export function clampStudyDate(date: string): { date: string; adjusted: boolean } {
  const valid = isValidIsoDate(date);
  const candidate = valid ? date : todayInCuiaba();
  const bounded = clampToPlan(candidate);
  return { date: bounded, adjusted: !valid || bounded !== date };
}
