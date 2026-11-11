// Tanggal, jam, dan format teks untuk mesin formula. Nomor seri mengikuti Excel (1 Januari 1900 = 1).
// Tanggal sebelum 1 Maret 1900 tidak didukung karena Excel menghitung 29 Februari 1900 yang tidak ada.

export type CellFormat = 'date' | 'time' | 'datetime';

const DAY_MS = 86400000;
const SERIAL_OF_UNIX_EPOCH = 25569;

export const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const DAY_NAMES = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

const MIN_SERIAL = 61;

export function serialFromYmd(y: number, m: number, d: number): number | null {
  const year = y >= 0 && y <= 99 ? y + 1900 : y;
  if (year < 1900 || year > 9999) return null;
  const ms = Date.UTC(year, m - 1, d);
  if (Number.isNaN(ms)) return null;
  const serial = Math.floor(ms / DAY_MS) + SERIAL_OF_UNIX_EPOCH;
  return serial < MIN_SERIAL ? null : serial;
}

export function ymdFromSerial(serial: number): { y: number; m: number; d: number } {
  const dt = new Date((Math.floor(serial) - SERIAL_OF_UNIX_EPOCH) * DAY_MS);
  return { y: dt.getUTCFullYear(), m: dt.getUTCMonth() + 1, d: dt.getUTCDate() };
}

// 0 = Minggu sampai 6 = Sabtu.
export function weekdayOf(serial: number): number {
  return new Date((Math.floor(serial) - SERIAL_OF_UNIX_EPOCH) * DAY_MS).getUTCDay();
}

export function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

// Menggeser bulan seperti EDATE: tanggal 31 jatuh ke akhir bulan yang lebih pendek.
export function addMonths(serial: number, n: number): number | null {
  const { y, m, d } = ymdFromSerial(serial);
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = total - ny * 12 + 1;
  return serialFromYmd(ny, nm, Math.min(d, daysInMonth(ny, nm)));
}

export function endOfMonth(serial: number, n: number): number | null {
  const { y, m } = ymdFromSerial(serial);
  const total = y * 12 + (m - 1) + n;
  const ny = Math.floor(total / 12);
  const nm = total - ny * 12 + 1;
  return serialFromYmd(ny, nm, daysInMonth(ny, nm));
}

export function timeFraction(h: number, mi: number, s: number): number {
  return (h * 3600 + mi * 60 + s) / 86400;
}

export interface Temporal {
  serial: number;
  format: CellFormat;
}

const ISO = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
const DMY = /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?: (\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
const CLOCK = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

function clock(h?: string, mi?: string, s?: string): number | null {
  const hh = Number(h);
  const mm = Number(mi);
  const ss = s === undefined ? 0 : Number(s);
  if (hh > 23 || mm > 59 || ss > 59) return null;
  return timeFraction(hh, mm, ss);
}

// Mengenali "2026-01-15", "15/01/2026", "08:30", dan gabungan tanggal dengan jam.
export function parseTemporal(raw: string): Temporal | null {
  const t = raw.trim();
  const dateMatch = ISO.exec(t);
  const dmyMatch = DMY.exec(t);
  const hit = dateMatch ? { y: dateMatch[1], m: dateMatch[2], d: dateMatch[3], t: dateMatch.slice(4) } : dmyMatch ? { y: dmyMatch[3], m: dmyMatch[2], d: dmyMatch[1], t: dmyMatch.slice(4) } : null;
  if (hit) {
    const [y, m, d] = [Number(hit.y), Number(hit.m), Number(hit.d)];
    const serial = serialFromYmd(y, m, d);
    if (serial === null) return null;
    const back = ymdFromSerial(serial);
    if (back.y !== y || back.m !== m || back.d !== d) return null;
    if (hit.t[0] === undefined) return { serial, format: 'date' };
    const frac = clock(hit.t[0], hit.t[1], hit.t[2]);
    return frac === null ? null : { serial: serial + frac, format: 'datetime' };
  }
  const c = CLOCK.exec(t);
  if (c) {
    const frac = clock(c[1], c[2], c[3]);
    return frac === null ? null : { serial: frac, format: 'time' };
  }
  return null;
}

const pad = (n: number, w = 2): string => String(n).padStart(w, '0');

function clockParts(serial: number): { h: number; mi: number; s: number } {
  const secs = Math.round((serial - Math.floor(serial)) * 86400) % 86400;
  return { h: Math.floor(secs / 3600), mi: Math.floor((secs % 3600) / 60), s: secs % 60 };
}

export function hourOf(serial: number): number {
  return clockParts(serial).h;
}
export function minuteOf(serial: number): number {
  return clockParts(serial).mi;
}
export function secondOf(serial: number): number {
  return clockParts(serial).s;
}

export function formatTemporal(serial: number, format: CellFormat): string {
  const { h, mi, s } = clockParts(serial);
  const time = `${pad(h)}:${pad(mi)}${s !== 0 ? ':' + pad(s) : ''}`;
  if (format === 'time') return time;
  const { y, m, d } = ymdFromSerial(serial);
  const date = `${pad(d)}/${pad(m)}/${y}`;
  return format === 'date' ? date : `${date} ${time}`;
}

// ---------- TEXT(angka, pola) ----------

const DATE_TOKEN = /yyyy|yy|mmmm|mmm|mm|m|dddd|ddd|dd|d|hh|h|ss|s/gi;

function formatClockDate(serial: number, pattern: string): string {
  const { y, m, d } = ymdFromSerial(serial);
  const { h, mi, s } = clockParts(serial);
  const parts: { text: string; token: boolean }[] = [];
  let last = 0;
  for (const match of pattern.matchAll(DATE_TOKEN)) {
    const at = match.index ?? 0;
    if (at > last) parts.push({ text: pattern.slice(last, at), token: false });
    parts.push({ text: match[0], token: true });
    last = at + match[0].length;
  }
  if (last < pattern.length) parts.push({ text: pattern.slice(last), token: false });

  const tokens = parts.filter((p) => p.token);
  const isMinute = (p: { text: string }): boolean => {
    const i = tokens.indexOf(p as (typeof tokens)[number]);
    const key = (x?: { text: string }) => (x ? x.text.toLowerCase()[0] : '');
    return /^m{1,2}$/i.test(p.text) && (key(tokens[i - 1]) === 'h' || key(tokens[i + 1]) === 's');
  };

  return parts
    .map((p) => {
      if (!p.token) return p.text.replace(/"/g, '');
      const t = p.text.toLowerCase();
      switch (t) {
        case 'yyyy':
          return String(y);
        case 'yy':
          return pad(y % 100);
        case 'mmmm':
          return MONTH_NAMES[m - 1];
        case 'mmm':
          return MONTH_NAMES[m - 1].slice(0, 3);
        case 'mm':
          return isMinute(p) ? pad(mi) : pad(m);
        case 'm':
          return isMinute(p) ? String(mi) : String(m);
        case 'dddd':
          return DAY_NAMES[weekdayOf(serial)];
        case 'ddd':
          return DAY_NAMES[weekdayOf(serial)].slice(0, 3);
        case 'dd':
          return pad(d);
        case 'd':
          return String(d);
        case 'hh':
          return pad(h);
        case 'h':
          return String(h);
        case 'ss':
          return pad(s);
        default:
          return String(s);
      }
    })
    .join('');
}

const NUMBER_PATTERN = /^(#[.,]##)?(0+)(?:[.,]([0#]+))?(%)?$/;

function roundHalfAway(x: number, digits: number): number {
  const f = Math.pow(10, digits);
  return (Math.sign(x) * Math.round(Number((Math.abs(x) * f).toPrecision(15)))) / f;
}

function formatNumberPattern(n: number, pattern: string): string | null {
  const m = NUMBER_PATTERN.exec(pattern);
  if (!m) return null;
  const thousands = Boolean(m[1]);
  const minInt = m[2].length;
  const decimals = m[3] ?? '';
  const required = decimals.replace(/#/g, '').length;
  const value = roundHalfAway(m[4] ? n * 100 : n, decimals.length);
  const [intRaw, fracRaw = ''] = Math.abs(value).toFixed(decimals.length).split('.');
  let intPart = intRaw.padStart(minInt, '0');
  if (thousands) intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  let frac = fracRaw;
  while (frac.length > required && frac.endsWith('0')) frac = frac.slice(0, -1);
  const sign = value < 0 ? '-' : '';
  return sign + intPart + (frac ? ',' + frac : '') + (m[4] ? '%' : '');
}

// Mengembalikan null kalau pola tidak dikenali.
export function formatWithPattern(n: number, pattern: string): string | null {
  const numeric = formatNumberPattern(n, pattern);
  if (numeric !== null) return numeric;
  if (!/[dmyhs]/i.test(pattern)) return null;
  return formatClockDate(n, pattern);
}

// Mengubah teks angka gaya Indonesia atau biasa menjadi angka. Null kalau bukan angka.
export function parseNumberText(raw: string): number | null {
  const s = raw.trim().replace(/^Rp\s*/i, '');
  if (s === '') return null;
  if (/^[-+]?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) return Number(s.replace(/\./g, '').replace(',', '.'));
  if (/^[-+]?\d*,\d+$/.test(s)) return Number(s.replace(',', '.'));
  if (/^[-+]?\d+(\.\d+)?%$/.test(s)) return Number(s.slice(0, -1)) / 100;
  return /^[-+]?(\d+\.?\d*|\.\d+)$/.test(s) ? Number(s) : null;
}
