const DAY_MS = 24 * 60 * 60 * 1000;

export function toISODate(date) {
  const d = new Date(date);
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function todayISO() {
  return toISODate(new Date());
}

export function addDays(dateStr, amount) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + amount);
  return toISODate(d);
}

export function startOfWeek(dateStr, weekStartsOn = 1) {
  const d = new Date(`${dateStr}T00:00:00`);
  const day = d.getDay();
  const diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  d.setDate(d.getDate() - diff);
  return toISODate(d);
}

export function getWeekDates(dateStr, weekStartsOn = 1) {
  const start = startOfWeek(dateStr, weekStartsOn);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getMonthMatrix(dateStr, weekStartsOn = 1) {
  const d = new Date(`${dateStr}T00:00:00`);
  const year = d.getFullYear();
  const month = d.getMonth();
  const firstOfMonth = toISODate(new Date(year, month, 1));
  const gridStart = startOfWeek(firstOfMonth, weekStartsOn);
  const weeks = [];
  let cursor = gridStart;
  for (let w = 0; w < 6; w++) {
    const week = Array.from({ length: 7 }, (_, i) => addDays(cursor, i));
    weeks.push(week);
    cursor = addDays(cursor, 7);
  }
  return { weeks, month, year };
}

export function formatDay(dateStr, options = {}) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'short', ...options });
}

export function formatDayLong(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'long' });
}

export function formatMonthShort(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'short' });
}

export function formatMonthYear(dateStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function getDayNumber(dateStr) {
  return new Date(`${dateStr}T00:00:00`).getDate();
}

export function isSameDay(a, b) {
  return a === b;
}

export function isToday(dateStr) {
  return dateStr === todayISO();
}

export function isPast(dateStr) {
  return dateStr < todayISO();
}

export function isSameMonth(dateStr, referenceStr) {
  const d = new Date(`${dateStr}T00:00:00`);
  const r = new Date(`${referenceStr}T00:00:00`);
  return d.getMonth() === r.getMonth() && d.getFullYear() === r.getFullYear();
}

export function formatRange(startStr, endStr) {
  const start = new Date(`${startStr}T00:00:00`);
  const end = new Date(`${endStr}T00:00:00`);
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startFmt = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  // Intl.DateTimeFormat can produce odd output (literal field labels) when
  // `month` is omitted but `year`/`day` are present, so build the
  // same-month case manually instead of relying on toLocaleDateString options.
  const endFmt = sameMonth
    ? `${end.getDate()}, ${end.getFullYear()}`
    : end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startFmt} – ${endFmt}`;
}

export { DAY_MS };
