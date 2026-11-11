// Mesin formula Wulang: tokenizer, parser, dan evaluator bergaya spreadsheet.
// Tanpa dependensi. Dipakai di browser untuk menghitung sel dan memeriksa jawaban.

import {
  addMonths,
  daysInMonth,
  endOfMonth,
  formatTemporal,
  formatWithPattern,
  hourOf,
  minuteOf,
  parseNumberText,
  parseTemporal,
  secondOf,
  serialFromYmd,
  weekdayOf,
  ymdFromSerial,
} from './datefmt';
import type { CellFormat } from './datefmt';

export class XlError {
  readonly code: string;
  constructor(code: string) {
    this.code = code;
  }
  toString(): string {
    return this.code;
  }
}

export type Scalar = number | string | boolean | null;
export type Value = Scalar | XlError;

interface RangeVal {
  kind: 'range';
  rows: Value[][];
}
type Arg = Value | RangeVal;

const isErr = (v: unknown): v is XlError => v instanceof XlError;
const isRange = (v: Arg): v is RangeVal =>
  typeof v === 'object' && v !== null && !(v instanceof XlError);
const E = (code: string): XlError => new XlError(code);

export function isErrorValue(v: unknown): v is XlError {
  return isErr(v);
}

// ---------- Alamat sel ----------

export function colToNum(col: string): number {
  let n = 0;
  for (const ch of col.toUpperCase()) n = n * 26 + (ch.charCodeAt(0) - 64);
  return n;
}

export function numToCol(n: number): string {
  let s = '';
  let x = n;
  while (x > 0) {
    const m = (x - 1) % 26;
    s = String.fromCharCode(65 + m) + s;
    x = Math.floor((x - 1) / 26);
  }
  return s;
}

export function parseAddr(a: string): { col: number; row: number } | null {
  const m = /^\$?([A-Za-z]{1,3})\$?(\d+)$/.exec(a);
  if (!m) return null;
  return { col: colToNum(m[1]), row: parseInt(m[2], 10) };
}

export function addrOf(col: number, row: number): string {
  return numToCol(col) + row;
}

// Urutan baris demi baris, kiri ke kanan.
export function expandRange(r: string): string[] {
  const [a, b] = r.split(':');
  const pa = parseAddr(a);
  const pb = parseAddr(b ?? a);
  if (!pa || !pb) return [];
  const out: string[] = [];
  const r1 = Math.min(pa.row, pb.row);
  const r2 = Math.max(pa.row, pb.row);
  const c1 = Math.min(pa.col, pb.col);
  const c2 = Math.max(pa.col, pb.col);
  for (let row = r1; row <= r2; row++) {
    for (let col = c1; col <= c2; col++) out.push(addrOf(col, row));
  }
  return out;
}

// ---------- Tokenizer ----------

interface Tok {
  t: 'num' | 'str' | 'bool' | 'ref' | 'name' | 'op' | 'lp' | 'rp' | 'comma';
  v: string | number | boolean;
  b?: string;
}

function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (/\s/.test(c)) {
      i++;
      continue;
    }
    if (c === '"') {
      let j = i + 1;
      let s = '';
      for (;;) {
        if (j >= src.length) throw E('#ERROR!');
        if (src[j] === '"') {
          if (src[j + 1] === '"') {
            s += '"';
            j += 2;
            continue;
          }
          break;
        }
        s += src[j];
        j++;
      }
      out.push({ t: 'str', v: s });
      i = j + 1;
      continue;
    }
    const rest = src.slice(i);
    let m: RegExpExecArray | null;
    if ((m = /^(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?/.exec(rest))) {
      out.push({ t: 'num', v: parseFloat(m[0]) });
      i += m[0].length;
      continue;
    }
    if (
      (m = /^\$?[A-Za-z]{1,3}\$?\d+(?::\$?[A-Za-z]{1,3}\$?\d+)?/.exec(rest)) &&
      !/^[A-Za-z0-9_(.]/.test(rest.slice(m[0].length))
    ) {
      const parts = m[0].replace(/\$/g, '').toUpperCase().split(':');
      out.push({ t: 'ref', v: parts[0], b: parts[1] });
      i += m[0].length;
      continue;
    }
    if ((m = /^[A-Za-z_][A-Za-z0-9_.]*/.exec(rest))) {
      const name = m[0].toUpperCase();
      if (name === 'TRUE' || name === 'FALSE') out.push({ t: 'bool', v: name === 'TRUE' });
      else out.push({ t: 'name', v: name });
      i += m[0].length;
      continue;
    }
    const two = rest.slice(0, 2);
    if (two === '<=' || two === '>=' || two === '<>') {
      out.push({ t: 'op', v: two });
      i += 2;
      continue;
    }
    if ('+-*/^&=<>%'.includes(c)) {
      out.push({ t: 'op', v: c });
      i++;
      continue;
    }
    if (c === '(') {
      out.push({ t: 'lp', v: c });
      i++;
      continue;
    }
    if (c === ')') {
      out.push({ t: 'rp', v: c });
      i++;
      continue;
    }
    // Excel berbahasa Indonesia memakai titik koma sebagai pemisah argumen.
    if (c === ',' || c === ';') {
      out.push({ t: 'comma', v: c });
      i++;
      continue;
    }
    throw E('#ERROR!');
  }
  return out;
}

// ---------- Parser ----------

type Node =
  | { k: 'num'; v: number }
  | { k: 'str'; v: string }
  | { k: 'bool'; v: boolean }
  | { k: 'ref'; a: string }
  | { k: 'range'; a: string; b: string }
  | { k: 'name'; v: string }
  | { k: 'bin'; op: string; l: Node; r: Node }
  | { k: 'un'; op: string; e: Node }
  | { k: 'pct'; e: Node }
  | { k: 'call'; name: string; args: Node[] };

class Parser {
  private pos = 0;
  constructor(private readonly toks: Tok[]) {}

  parse(): Node {
    const n = this.cmp();
    if (this.pos < this.toks.length) throw E('#ERROR!');
    return n;
  }

  private isOp(...ops: string[]): boolean {
    const t = this.toks[this.pos];
    return !!t && t.t === 'op' && ops.includes(t.v as string);
  }

  private cmp(): Node {
    let l = this.concat();
    while (this.isOp('=', '<>', '<', '>', '<=', '>=')) {
      const op = this.toks[this.pos++].v as string;
      l = { k: 'bin', op, l, r: this.concat() };
    }
    return l;
  }

  private concat(): Node {
    let l = this.add();
    while (this.isOp('&')) {
      this.pos++;
      l = { k: 'bin', op: '&', l, r: this.add() };
    }
    return l;
  }

  private add(): Node {
    let l = this.mul();
    while (this.isOp('+', '-')) {
      const op = this.toks[this.pos++].v as string;
      l = { k: 'bin', op, l, r: this.mul() };
    }
    return l;
  }

  private mul(): Node {
    let l = this.pow();
    while (this.isOp('*', '/')) {
      const op = this.toks[this.pos++].v as string;
      l = { k: 'bin', op, l, r: this.pow() };
    }
    return l;
  }

  // Seperti Excel: pangkat berasosiasi ke kiri, dan minus unari lebih kuat dari pangkat.
  private pow(): Node {
    let l = this.unary();
    while (this.isOp('^')) {
      this.pos++;
      l = { k: 'bin', op: '^', l, r: this.unary() };
    }
    return l;
  }

  private unary(): Node {
    if (this.isOp('-', '+')) {
      const op = this.toks[this.pos++].v as string;
      return { k: 'un', op, e: this.unary() };
    }
    return this.postfix();
  }

  private postfix(): Node {
    let e = this.primary();
    while (this.isOp('%')) {
      this.pos++;
      e = { k: 'pct', e };
    }
    return e;
  }

  private primary(): Node {
    const t = this.toks[this.pos++];
    if (!t) throw E('#ERROR!');
    switch (t.t) {
      case 'num':
        return { k: 'num', v: t.v as number };
      case 'str':
        return { k: 'str', v: t.v as string };
      case 'bool':
        return { k: 'bool', v: t.v as boolean };
      case 'ref':
        return t.b
          ? { k: 'range', a: t.v as string, b: t.b }
          : { k: 'ref', a: t.v as string };
      case 'name': {
        const nxt = this.toks[this.pos];
        if (nxt && nxt.t === 'lp') {
          this.pos++;
          const args: Node[] = [];
          if (this.toks[this.pos]?.t === 'rp') {
            this.pos++;
            return { k: 'call', name: t.v as string, args };
          }
          for (;;) {
            args.push(this.cmp());
            const s = this.toks[this.pos++];
            if (!s) throw E('#ERROR!');
            if (s.t === 'comma') continue;
            if (s.t === 'rp') break;
            throw E('#ERROR!');
          }
          return { k: 'call', name: t.v as string, args };
        }
        return { k: 'name', v: t.v as string };
      }
      case 'lp': {
        const e = this.cmp();
        const r = this.toks[this.pos++];
        if (!r || r.t !== 'rp') throw E('#ERROR!');
        return e;
      }
      default:
        throw E('#ERROR!');
    }
  }
}

// ---------- Konversi dan perbandingan ----------

function num(v: Value): number | XlError {
  if (isErr(v)) return v;
  if (v === null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'boolean') return v ? 1 : 0;
  const s = v.trim();
  if (s === '' || Number.isNaN(Number(s))) return E('#VALUE!');
  return Number(s);
}

function str(v: Scalar): string {
  if (v === null) return '';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return String(Number(v.toPrecision(15)));
  return v;
}

function toBool(v: Value): boolean | XlError {
  if (isErr(v)) return v;
  if (v === null) return false;
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  const u = v.trim().toUpperCase();
  if (u === 'TRUE') return true;
  if (u === 'FALSE') return false;
  return E('#VALUE!');
}

function rank(v: Scalar): number {
  return typeof v === 'number' ? 0 : typeof v === 'string' ? 1 : 2;
}

function cmp(a: Scalar, b: Scalar): number {
  let x: Scalar = a;
  let y: Scalar = b;
  if (x === null) x = typeof y === 'string' ? '' : typeof y === 'boolean' ? false : 0;
  if (y === null) y = typeof x === 'string' ? '' : typeof x === 'boolean' ? false : 0;
  const rx = rank(x);
  const ry = rank(y);
  if (rx !== ry) return rx < ry ? -1 : 1;
  if (typeof x === 'number' && typeof y === 'number') return x < y ? -1 : x > y ? 1 : 0;
  if (typeof x === 'string' && typeof y === 'string') {
    const p = x.toLowerCase();
    const q = y.toLowerCase();
    return p < q ? -1 : p > q ? 1 : 0;
  }
  return (x ? 1 : 0) - (y ? 1 : 0);
}

function scalar(a: Arg): Value {
  if (isRange(a)) {
    if (a.rows.length === 1 && a.rows[0].length === 1) return a.rows[0][0];
    return E('#VALUE!');
  }
  return a;
}

// ---------- Evaluator ----------

function binScalar(op: string, l: Value, r: Value): Value {
  if (isErr(l)) return l;
  if (isErr(r)) return r;
  switch (op) {
    case '&':
      return str(l) + str(r);
    case '=':
      return cmp(l, r) === 0;
    case '<>':
      return cmp(l, r) !== 0;
    case '<':
      return cmp(l, r) < 0;
    case '>':
      return cmp(l, r) > 0;
    case '<=':
      return cmp(l, r) <= 0;
    case '>=':
      return cmp(l, r) >= 0;
  }
  const a = num(l);
  const b = num(r);
  if (isErr(a)) return a;
  if (isErr(b)) return b;
  switch (op) {
    case '+':
      return a + b;
    case '-':
      return a - b;
    case '*':
      return a * b;
    case '/':
      return b === 0 ? E('#DIV/0!') : a / b;
    case '^': {
      const p = Math.pow(a, b);
      return Number.isFinite(p) ? p : E('#NUM!');
    }
  }
  return E('#ERROR!');
}


interface Ctx {
  get(addr: string): Value;
}

function ev(n: Node, c: Ctx): Arg {
  switch (n.k) {
    case 'num':
    case 'str':
    case 'bool':
      return n.v;
    case 'ref':
      return c.get(n.a);
    case 'name':
      return E('#NAME?');
    case 'range': {
      const pa = parseAddr(n.a);
      const pb = parseAddr(n.b);
      if (!pa || !pb) return E('#REF!');
      const r1 = Math.min(pa.row, pb.row);
      const r2 = Math.max(pa.row, pb.row);
      const c1 = Math.min(pa.col, pb.col);
      const c2 = Math.max(pa.col, pb.col);
      if ((r2 - r1 + 1) * (c2 - c1 + 1) > 20000) return E('#REF!');
      const rows: Value[][] = [];
      for (let r = r1; r <= r2; r++) {
        const row: Value[] = [];
        for (let col = c1; col <= c2; col++) row.push(c.get(addrOf(col, r)));
        rows.push(row);
      }
      return { kind: 'range', rows };
    }
    case 'un': {
      const v = scalar(ev(n.e, c));
      if (isErr(v)) return v;
      if (n.op === '+') return v;
      const x = num(v);
      return isErr(x) ? x : -x;
    }
    case 'pct': {
      const x = num(scalar(ev(n.e, c)));
      return isErr(x) ? x : x / 100;
    }
    case 'bin': {
      const la = ev(n.l, c);
      const ra = ev(n.r, c);
      if (isErr(la)) return la;
      if (isErr(ra)) return ra;
      const lArr = isRange(la) && (la.rows.length > 1 || la.rows[0].length > 1);
      const rArr = isRange(ra) && (ra.rows.length > 1 || ra.rows[0].length > 1);
      if (!lArr && !rArr) return binScalar(n.op, scalar(la), scalar(ra));
      // Operasi pada rentang berlaku per sel. Dipakai terutama di dalam SUMPRODUCT.
      const shape = (lArr ? la : ra) as RangeVal;
      const nr = shape.rows.length;
      const nc = shape.rows[0].length;
      if (lArr && rArr) {
        const rr = ra as RangeVal;
        if (rr.rows.length !== nr || rr.rows[0].length !== nc) return E('#VALUE!');
      }
      const at = (a: Arg, arr: boolean, i: number, j: number): Value => (arr ? (a as RangeVal).rows[i][j] : scalar(a));
      const rows: Value[][] = [];
      for (let i = 0; i < nr; i++) {
        const row: Value[] = [];
        for (let j = 0; j < nc; j++) row.push(binScalar(n.op, at(la, lArr, i, j), at(ra, rArr, i, j)));
        rows.push(row);
      }
      return { kind: 'range', rows };
    }
    case 'call': {
      const fn = FUNCS[n.name.toUpperCase()];
      if (!fn) return E('#NAME?');
      return fn(n.args, c);
    }
  }
}

const sc = (n: Node, c: Ctx): Value => scalar(ev(n, c));

function rangeOf(n: Node, c: Ctx): RangeVal | XlError {
  const a = ev(n, c);
  if (isErr(a)) return a;
  if (isRange(a)) return a;
  return { kind: 'range', rows: [[a]] };
}

function flat(r: RangeVal): Value[] {
  const out: Value[] = [];
  for (const row of r.rows) for (const v of row) out.push(v);
  return out;
}

// Kumpulkan angka dari argumen. Di dalam rentang, teks dan boolean diabaikan.
function collectNums(args: Node[], c: Ctx): number[] | XlError {
  const out: number[] = [];
  for (const n of args) {
    const a = ev(n, c);
    if (isRange(a)) {
      for (const v of flat(a)) {
        if (isErr(v)) return v;
        if (typeof v === 'number') out.push(v);
      }
    } else {
      if (isErr(a)) return a;
      const x = num(a);
      if (isErr(x)) return x;
      out.push(x);
    }
  }
  return out;
}

function roundTo(x: number, d: number, mode: 'half' | 'up' | 'down'): number {
  const f = Math.pow(10, d);
  const y = Number((Math.abs(x) * f).toPrecision(15));
  const r = mode === 'half' ? Math.round(y) : mode === 'up' ? Math.ceil(y) : Math.floor(y);
  return (Math.sign(x) * r) / f;
}

// Kriteria untuk SUMIF, COUNTIF, dan sejenisnya.
function makeCrit(crit: Value): (v: Value) => boolean {
  if (typeof crit === 'number' || typeof crit === 'boolean') {
    return (v) => !isErr(v) && v !== null && cmp(v, crit) === 0;
  }
  const s = crit === null ? '' : (crit as string);
  const m = /^(<=|>=|<>|=|<|>)([\s\S]*)$/.exec(s);
  const op = m ? m[1] : '=';
  const rhs = m ? m[2] : s;
  const n = rhs.trim() !== '' && !Number.isNaN(Number(rhs)) ? Number(rhs) : null;
  if (n !== null) {
    return (v) => {
      if (typeof v !== 'number') return op === '<>' && !isErr(v);
      const d = cmp(v, n);
      return op === '=' ? d === 0 : op === '<>' ? d !== 0 : op === '<' ? d < 0 : op === '>' ? d > 0 : op === '<=' ? d <= 0 : d >= 0;
    };
  }
  if (op === '=' || op === '<>') {
    const re = new RegExp(
      '^' +
        rhs
          .toLowerCase()
          .replace(/[.+^${}()|[\]\\]/g, '\\$&')
          .replace(/\*/g, '.*')
          .replace(/\?/g, '.') +
        '$'
    );
    return (v) => {
      if (isErr(v)) return false;
      const t = v === null ? '' : str(v).toLowerCase();
      const hit = re.test(t);
      return op === '=' ? hit : !hit;
    };
  }
  return (v) => {
    if (typeof v !== 'string') return false;
    const d = cmp(v, rhs);
    return op === '<' ? d < 0 : op === '>' ? d > 0 : op === '<=' ? d <= 0 : d >= 0;
  };
}

type Fn = (args: Node[], c: Ctx) => Value;

function needArgs(args: Node[], min: number, max = min): XlError | null {
  return args.length < min || args.length > max ? E('#ERROR!') : null;
}

function numAt(args: Node[], i: number, c: Ctx, def?: number): number | XlError {
  if (i >= args.length) return def === undefined ? E('#VALUE!') : def;
  return num(sc(args[i], c));
}

function ifFamily(
  args: Node[],
  c: Ctx,
  mode: 'sum' | 'count' | 'avg'
): Value {
  // SUMIF/AVERAGEIF(range, crit, [value_range]); COUNTIF(range, crit)
  const bad = needArgs(args, 2, mode === 'count' ? 2 : 3);
  if (bad) return bad;
  const r = rangeOf(args[0], c);
  if (isErr(r)) return r;
  const crit = sc(args[1], c);
  if (isErr(crit)) return crit;
  const vals = args[2] && mode !== 'count' ? rangeOf(args[2], c) : r;
  if (isErr(vals)) return vals;
  const a = flat(r);
  const b = flat(vals);
  const test = makeCrit(crit);
  let total = 0;
  let count = 0;
  for (let i = 0; i < a.length; i++) {
    if (!test(a[i])) continue;
    if (mode === 'count') {
      count++;
      continue;
    }
    const v = b[i];
    if (isErr(v)) return v;
    if (typeof v === 'number') {
      total += v;
      count++;
    }
  }
  if (mode === 'count') return count;
  if (mode === 'sum') return total;
  return count === 0 ? E('#DIV/0!') : total / count;
}

function ifsFamily(args: Node[], c: Ctx, mode: 'sum' | 'count' | 'avg' | 'max' | 'min'): Value {
  const first = mode === 'count' ? 0 : 1;
  if (args.length < first + 2 || (args.length - first) % 2 !== 0) return E('#ERROR!');
  let sumVals: Value[] = [];
  if (mode !== 'count') {
    const sr = rangeOf(args[0], c);
    if (isErr(sr)) return sr;
    sumVals = flat(sr);
  }
  const pairs: { cells: Value[]; test: (v: Value) => boolean }[] = [];
  for (let i = first; i < args.length; i += 2) {
    const r = rangeOf(args[i], c);
    if (isErr(r)) return r;
    const crit = sc(args[i + 1], c);
    if (isErr(crit)) return crit;
    pairs.push({ cells: flat(r), test: makeCrit(crit) });
  }
  const size = pairs[0].cells.length;
  if (pairs.some((p) => p.cells.length !== size)) return E('#VALUE!');
  if (mode !== 'count' && sumVals.length !== size) return E('#VALUE!');
  let total = 0;
  let count = 0;
  let best: number | null = null;
  for (let i = 0; i < size; i++) {
    if (!pairs.every((p) => p.test(p.cells[i]))) continue;
    if (mode === 'count') {
      count++;
      continue;
    }
    const v = sumVals[i];
    if (isErr(v)) return v;
    if (typeof v !== 'number') continue;
    count++;
    total += v;
    if (best === null || (mode === 'max' && v > best) || (mode === 'min' && v < best)) best = v;
  }
  if (mode === 'count') return count;
  if (mode === 'sum') return total;
  if (mode === 'avg') return count === 0 ? E('#DIV/0!') : total / count;
  return best === null ? 0 : best;
}

function oneDim(r: RangeVal): Value[] | null {
  if (r.rows.length === 1 || (r.rows.length > 0 && r.rows[0].length === 1)) return flat(r);
  return null;
}

// Pembantu fungsi tanggal dan teks.

function datePart(args: Node[], c: Ctx, pick: (serial: number) => number): Value {
  const bad = needArgs(args, 1);
  if (bad) return bad;
  const s = numAt(args, 0, c);
  if (isErr(s)) return s;
  return s < 0 ? E('#NUM!') : pick(s);
}

function shiftMonths(args: Node[], c: Ctx, move: (serial: number, n: number) => number | null): Value {
  const bad = needArgs(args, 2);
  if (bad) return bad;
  const [s, n] = [numAt(args, 0, c), numAt(args, 1, c)];
  if (isErr(s)) return s;
  if (isErr(n)) return n;
  return move(Math.floor(s), Math.trunc(n)) ?? E('#NUM!');
}

function holidaySet(node: Node | undefined, c: Ctx): Set<number> | XlError {
  const out = new Set<number>();
  if (!node) return out;
  const r = rangeOf(node, c);
  if (isErr(r)) return r;
  for (const v of flat(r)) {
    if (isErr(v)) return v;
    if (typeof v === 'number') out.add(Math.floor(v));
  }
  return out;
}

function isWorkday(serial: number, off: Set<number>): boolean {
  const w = weekdayOf(serial);
  return w !== 0 && w !== 6 && !off.has(serial);
}

function findText(args: Node[], c: Ctx, caseSensitive: boolean): Value {
  const bad = needArgs(args, 2, 3);
  if (bad) return bad;
  const [what, where] = [sc(args[0], c), sc(args[1], c)];
  if (isErr(what)) return what;
  if (isErr(where)) return where;
  const from = args[2] ? numAt(args, 2, c) : 1;
  if (isErr(from)) return from;
  if (from < 1) return E('#VALUE!');
  const hay = caseSensitive ? str(where) : str(where).toLowerCase();
  const needle = caseSensitive ? str(what) : str(what).toLowerCase();
  const i = hay.indexOf(needle, Math.trunc(from) - 1);
  return i < 0 ? E('#VALUE!') : i + 1;
}

function splitAt(args: Node[], c: Ctx, before: boolean): Value {
  const bad = needArgs(args, 2, 3);
  if (bad) return bad;
  const [t, d] = [sc(args[0], c), sc(args[1], c)];
  if (isErr(t)) return t;
  if (isErr(d)) return d;
  const nth = args[2] ? numAt(args, 2, c) : 1;
  if (isErr(nth)) return nth;
  const text = str(t);
  const delim = str(d);
  if (delim === '' || nth < 1) return E('#VALUE!');
  let at = -1;
  for (let k = 0; k < Math.trunc(nth); k++) {
    at = text.indexOf(delim, at + 1);
    if (at < 0) return E('#N/A');
  }
  return before ? text.slice(0, at) : text.slice(at + delim.length);
}

function parity(args: Node[], c: Ctx, want: number): Value {
  const bad = needArgs(args, 1);
  if (bad) return bad;
  const n = numAt(args, 0, c);
  return isErr(n) ? n : Math.abs(Math.trunc(n)) % 2 === want;
}

const FUNCS: Record<string, Fn> = {
  SUM: (a, c) => {
    const x = collectNums(a, c);
    return isErr(x) ? x : x.reduce((p, q) => p + q, 0);
  },
  PRODUCT: (a, c) => {
    const x = collectNums(a, c);
    return isErr(x) ? x : x.reduce((p, q) => p * q, 1);
  },
  AVERAGE: (a, c) => {
    const x = collectNums(a, c);
    if (isErr(x)) return x;
    return x.length === 0 ? E('#DIV/0!') : x.reduce((p, q) => p + q, 0) / x.length;
  },
  MAX: (a, c) => {
    const x = collectNums(a, c);
    return isErr(x) ? x : x.length === 0 ? 0 : Math.max(...x);
  },
  MIN: (a, c) => {
    const x = collectNums(a, c);
    return isErr(x) ? x : x.length === 0 ? 0 : Math.min(...x);
  },
  MEDIAN: (a, c) => {
    const x = collectNums(a, c);
    if (isErr(x)) return x;
    if (x.length === 0) return E('#NUM!');
    const s = [...x].sort((p, q) => p - q);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
  },
  COUNT: (a, c) => {
    let n = 0;
    for (const node of a) {
      const v = ev(node, c);
      if (isRange(v)) n += flat(v).filter((x) => typeof x === 'number').length;
      else if (!isErr(v) && !isErr(num(v)) && v !== null) n++;
    }
    return n;
  },
  COUNTA: (a, c) => {
    let n = 0;
    for (const node of a) {
      const v = ev(node, c);
      if (isRange(v)) n += flat(v).filter((x) => x !== null && x !== '').length;
      else if (v !== null) n++;
    }
    return n;
  },
  COUNTBLANK: (a, c) => {
    const bad = needArgs(a, 1);
    if (bad) return bad;
    const r = rangeOf(a[0], c);
    if (isErr(r)) return r;
    return flat(r).filter((x) => x === null || x === '').length;
  },

  IF: (a, c) => {
    const bad = needArgs(a, 2, 3);
    if (bad) return bad;
    const t = toBool(sc(a[0], c));
    if (isErr(t)) return t;
    if (t) return sc(a[1], c);
    return a[2] ? sc(a[2], c) : false;
  },
  IFERROR: (a, c) => {
    const bad = needArgs(a, 2);
    if (bad) return bad;
    const v = sc(a[0], c);
    return isErr(v) ? sc(a[1], c) : v;
  },
  AND: (a, c) => {
    let any = false;
    for (const node of a) {
      const v = ev(node, c);
      const items = isRange(v) ? flat(v).filter((x) => typeof x === 'boolean' || typeof x === 'number') : [v];
      for (const it of items) {
        const b = toBool(it);
        if (isErr(b)) return b;
        any = true;
        if (!b) return false;
      }
    }
    return any ? true : E('#VALUE!');
  },
  OR: (a, c) => {
    let any = false;
    let res = false;
    for (const node of a) {
      const v = ev(node, c);
      const items = isRange(v) ? flat(v).filter((x) => typeof x === 'boolean' || typeof x === 'number') : [v];
      for (const it of items) {
        const b = toBool(it);
        if (isErr(b)) return b;
        any = true;
        if (b) res = true;
      }
    }
    return any ? res : E('#VALUE!');
  },
  NOT: (a, c) => {
    const bad = needArgs(a, 1);
    if (bad) return bad;
    const b = toBool(sc(a[0], c));
    return isErr(b) ? b : !b;
  },

  SUMIF: (a, c) => ifFamily(a, c, 'sum'),
  COUNTIF: (a, c) => ifFamily(a, c, 'count'),
  AVERAGEIF: (a, c) => ifFamily(a, c, 'avg'),
  SUMIFS: (a, c) => ifsFamily(a, c, 'sum'),
  COUNTIFS: (a, c) => ifsFamily(a, c, 'count'),

  ROUND: (a, c) => {
    const bad = needArgs(a, 2);
    if (bad) return bad;
    const x = numAt(a, 0, c);
    const d = numAt(a, 1, c);
    if (isErr(x)) return x;
    if (isErr(d)) return d;
    return roundTo(x, Math.trunc(d), 'half');
  },
  ROUNDUP: (a, c) => {
    const bad = needArgs(a, 2);
    if (bad) return bad;
    const x = numAt(a, 0, c);
    const d = numAt(a, 1, c);
    if (isErr(x)) return x;
    if (isErr(d)) return d;
    return roundTo(x, Math.trunc(d), 'up');
  },
  ROUNDDOWN: (a, c) => {
    const bad = needArgs(a, 2);
    if (bad) return bad;
    const x = numAt(a, 0, c);
    const d = numAt(a, 1, c);
    if (isErr(x)) return x;
    if (isErr(d)) return d;
    return roundTo(x, Math.trunc(d), 'down');
  },
  ABS: (a, c) => {
    const bad = needArgs(a, 1);
    if (bad) return bad;
    const x = numAt(a, 0, c);
    return isErr(x) ? x : Math.abs(x);
  },
  INT: (a, c) => {
    const bad = needArgs(a, 1);
    if (bad) return bad;
    const x = numAt(a, 0, c);
    return isErr(x) ? x : Math.floor(x);
  },
  MOD: (a, c) => {
    const bad = needArgs(a, 2);
    if (bad) return bad;
    const x = numAt(a, 0, c);
    const d = numAt(a, 1, c);
    if (isErr(x)) return x;
    if (isErr(d)) return d;
    if (d === 0) return E('#DIV/0!');
    return x - d * Math.floor(x / d);
  },
  POWER: (a, c) => {
    const bad = needArgs(a, 2);
    if (bad) return bad;
    const x = numAt(a, 0, c);
    const y = numAt(a, 1, c);
    if (isErr(x)) return x;
    if (isErr(y)) return y;
    const p = Math.pow(x, y);
    return Number.isFinite(p) ? p : E('#NUM!');
  },
  SQRT: (a, c) => {
    const bad = needArgs(a, 1);
    if (bad) return bad;
    const x = numAt(a, 0, c);
    if (isErr(x)) return x;
    return x < 0 ? E('#NUM!') : Math.sqrt(x);
  },

  LEFT: (a, c) => {
    const bad = needArgs(a, 1, 2);
    if (bad) return bad;
    const t = sc(a[0], c);
    const n = numAt(a, 1, c, 1);
    if (isErr(t)) return t;
    if (isErr(n)) return n;
    return n < 0 ? E('#VALUE!') : str(t).slice(0, Math.trunc(n));
  },
  RIGHT: (a, c) => {
    const bad = needArgs(a, 1, 2);
    if (bad) return bad;
    const t = sc(a[0], c);
    const n = numAt(a, 1, c, 1);
    if (isErr(t)) return t;
    if (isErr(n)) return n;
    if (n < 0) return E('#VALUE!');
    const s = str(t);
    return n === 0 ? '' : s.slice(-Math.trunc(n));
  },
  MID: (a, c) => {
    const bad = needArgs(a, 3);
    if (bad) return bad;
    const t = sc(a[0], c);
    const start = numAt(a, 1, c);
    const len = numAt(a, 2, c);
    if (isErr(t)) return t;
    if (isErr(start)) return start;
    if (isErr(len)) return len;
    if (start < 1 || len < 0) return E('#VALUE!');
    return str(t).substr(Math.trunc(start) - 1, Math.trunc(len));
  },
  LEN: (a, c) => {
    const bad = needArgs(a, 1);
    if (bad) return bad;
    const t = sc(a[0], c);
    return isErr(t) ? t : str(t).length;
  },
  UPPER: (a, c) => {
    const bad = needArgs(a, 1);
    if (bad) return bad;
    const t = sc(a[0], c);
    return isErr(t) ? t : str(t).toUpperCase();
  },
  LOWER: (a, c) => {
    const bad = needArgs(a, 1);
    if (bad) return bad;
    const t = sc(a[0], c);
    return isErr(t) ? t : str(t).toLowerCase();
  },
  TRIM: (a, c) => {
    const bad = needArgs(a, 1);
    if (bad) return bad;
    const t = sc(a[0], c);
    return isErr(t) ? t : str(t).trim().replace(/\s+/g, ' ');
  },
  CONCATENATE: (a, c) => {
    let s = '';
    for (const node of a) {
      const v = sc(node, c);
      if (isErr(v)) return v;
      s += str(v);
    }
    return s;
  },
  CONCAT: (a, c) => {
    let s = '';
    for (const node of a) {
      const v = ev(node, c);
      const items = isRange(v) ? flat(v) : [v];
      for (const it of items) {
        if (isErr(it)) return it;
        s += str(it);
      }
    }
    return s;
  },

  VLOOKUP: (a, c) => {
    const bad = needArgs(a, 3, 4);
    if (bad) return bad;
    const lv = sc(a[0], c);
    if (isErr(lv)) return lv;
    const t = rangeOf(a[1], c);
    if (isErr(t)) return t;
    const ci = numAt(a, 2, c);
    if (isErr(ci)) return ci;
    const idx = Math.trunc(ci);
    if (idx < 1) return E('#VALUE!');
    if (t.rows.length === 0 || idx > t.rows[0].length) return E('#REF!');
    let approx = true;
    if (a[3]) {
      const b = toBool(sc(a[3], c));
      if (isErr(b)) return b;
      approx = b;
    }
    const pick = (row: Value[]): Value => (row[idx - 1] === null ? 0 : row[idx - 1]);
    if (!approx) {
      for (const row of t.rows) {
        const key = row[0];
        if (!isErr(key) && key !== null && lv !== null && cmp(key, lv) === 0) return pick(row);
      }
      return E('#N/A');
    }
    let best = -1;
    for (let i = 0; i < t.rows.length; i++) {
      const key = t.rows[i][0];
      if (isErr(key) || key === null) continue;
      if (rank(key) !== rank(lv ?? 0)) continue;
      if (cmp(key, lv) <= 0) best = i;
      else break;
    }
    return best < 0 ? E('#N/A') : pick(t.rows[best]);
  },
  MATCH: (a, c) => {
    const bad = needArgs(a, 2, 3);
    if (bad) return bad;
    const lv = sc(a[0], c);
    if (isErr(lv)) return lv;
    const r = rangeOf(a[1], c);
    if (isErr(r)) return r;
    const cells = oneDim(r);
    if (!cells) return E('#N/A');
    const typ = numAt(a, 2, c, 1);
    if (isErr(typ)) return typ;
    if (typ === 0) {
      const i = cells.findIndex((x) => !isErr(x) && x !== null && lv !== null && cmp(x, lv) === 0);
      return i < 0 ? E('#N/A') : i + 1;
    }
    let best = -1;
    for (let i = 0; i < cells.length; i++) {
      const x = cells[i];
      if (isErr(x) || x === null || lv === null || rank(x) !== rank(lv)) continue;
      const d = cmp(x, lv);
      if (typ > 0 ? d <= 0 : d >= 0) best = i;
      else break;
    }
    return best < 0 ? E('#N/A') : best + 1;
  },
  INDEX: (a, c) => {
    const bad = needArgs(a, 2, 3);
    if (bad) return bad;
    const r = rangeOf(a[0], c);
    if (isErr(r)) return r;
    const ri = numAt(a, 1, c);
    const ci = numAt(a, 2, c, 1);
    if (isErr(ri)) return ri;
    if (isErr(ci)) return ci;
    let row = Math.trunc(ri);
    let col = Math.trunc(ci);
    if (a.length === 2 && r.rows.length === 1) {
      col = row;
      row = 1;
    }
    if (row < 1 || col < 1 || row > r.rows.length || col > r.rows[0].length) return E('#REF!');
    const v = r.rows[row - 1][col - 1];
    return v === null ? 0 : v;
  },
  XLOOKUP: (a, c) => {
    const bad = needArgs(a, 3, 4);
    if (bad) return bad;
    const lv = sc(a[0], c);
    if (isErr(lv)) return lv;
    const look = rangeOf(a[1], c);
    const ret = rangeOf(a[2], c);
    if (isErr(look)) return look;
    if (isErr(ret)) return ret;
    const keys = oneDim(look);
    const outs = oneDim(ret);
    if (!keys || !outs || keys.length !== outs.length) return E('#VALUE!');
    const i = keys.findIndex((x) => !isErr(x) && x !== null && lv !== null && cmp(x, lv) === 0);
    if (i >= 0) return outs[i] === null ? 0 : outs[i];
    return a[3] ? sc(a[3], c) : E('#N/A');
  },
  SUMPRODUCT: (a, c) => {
    if (a.length < 1) return E('#ERROR!');
    const arrays: number[][] = [];
    for (const n of a) {
      const r = rangeOf(n, c);
      if (isErr(r)) return r;
      // Sel teks atau kosong dihitung 0, seperti di Excel.
      arrays.push(flat(r).map((v) => (typeof v === 'number' ? v : 0)));
    }
    const len = arrays[0].length;
    if (arrays.some((x) => x.length !== len)) return E('#VALUE!');
    let total = 0;
    for (let i = 0; i < len; i++) total += arrays.reduce((p, x) => p * x[i], 1);
    return total;
  },
  IFS: (a, c) => {
    if (a.length < 2 || a.length % 2 !== 0) return E('#ERROR!');
    for (let i = 0; i < a.length; i += 2) {
      const t = toBool(sc(a[i], c));
      if (isErr(t)) return t;
      if (t) return sc(a[i + 1], c);
    }
    return E('#N/A');
  },
  PMT: (a, c) => {
    const bad = needArgs(a, 3, 5);
    if (bad) return bad;
    const rate = numAt(a, 0, c);
    const n = numAt(a, 1, c);
    const pv = numAt(a, 2, c);
    const fv = numAt(a, 3, c, 0);
    const type = numAt(a, 4, c, 0);
    for (const x of [rate, n, pv, fv, type]) if (isErr(x)) return x;
    const [r, np, p0, f0, t] = [rate, n, pv, fv, type] as number[];
    if (np === 0) return E('#NUM!');
    if (r === 0) return -(p0 + f0) / np;
    const g = Math.pow(1 + r, np);
    return -(r * (p0 * g + f0)) / ((1 + r * (t ? 1 : 0)) * (g - 1));
  },
  FV: (a, c) => {
    const bad = needArgs(a, 3, 5);
    if (bad) return bad;
    const x = [numAt(a, 0, c), numAt(a, 1, c), numAt(a, 2, c), numAt(a, 3, c, 0), numAt(a, 4, c, 0)];
    for (const v of x) if (isErr(v)) return v;
    const [r, np, pm, p0, t] = x as number[];
    if (r === 0) return -(p0 + pm * np);
    const g = Math.pow(1 + r, np);
    return -(p0 * g + (pm * (1 + r * (t ? 1 : 0)) * (g - 1)) / r);
  },
  PV: (a, c) => {
    const bad = needArgs(a, 3, 5);
    if (bad) return bad;
    const x = [numAt(a, 0, c), numAt(a, 1, c), numAt(a, 2, c), numAt(a, 3, c, 0), numAt(a, 4, c, 0)];
    for (const v of x) if (isErr(v)) return v;
    const [r, np, pm, f0, t] = x as number[];
    if (r === 0) return -(f0 + pm * np);
    const g = Math.pow(1 + r, np);
    return -(f0 + (pm * (1 + r * (t ? 1 : 0)) * (g - 1)) / r) / g;
  },
  NPV: (a, c) => {
    if (a.length < 2) return E('#ERROR!');
    const rate = numAt(a, 0, c);
    if (isErr(rate)) return rate;
    const flows = collectNums(a.slice(1), c);
    if (isErr(flows)) return flows;
    if (rate === -1) return E('#DIV/0!');
    return flows.reduce((p, v, i) => p + v / Math.pow(1 + rate, i + 1), 0);
  },
  IRR: (a, c) => {
    const bad = needArgs(a, 1, 2);
    if (bad) return bad;
    const flows = collectNums([a[0]], c);
    if (isErr(flows)) return flows;
    const guess = numAt(a, 1, c, 0.1);
    if (isErr(guess)) return guess;
    if (!flows.some((v) => v > 0) || !flows.some((v) => v < 0)) return E('#NUM!');
    const f = (r: number) => flows.reduce((p, v, i) => p + v / Math.pow(1 + r, i), 0);
    // Newton dulu. Kalau tidak konvergen, jatuh ke bisection di rentang yang berganti tanda.
    let r = guess;
    for (let i = 0; i < 100; i++) {
      const y = f(r);
      const d = (f(r + 1e-6) - y) / 1e-6;
      if (!isFinite(d) || d === 0) break;
      const next = r - y / d;
      if (!isFinite(next) || next <= -0.999999) break;
      if (Math.abs(next - r) < 1e-10) return next;
      r = next;
    }
    let lo = -0.99;
    let hi = 10;
    if (f(lo) * f(hi) > 0) return E('#NUM!');
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      if (f(lo) * f(mid) <= 0) hi = mid;
      else lo = mid;
    }
    return (lo + hi) / 2;
  },

  AVERAGEIFS: (a, c) => ifsFamily(a, c, 'avg'),
  MAXIFS: (a, c) => ifsFamily(a, c, 'max'),
  MINIFS: (a, c) => ifsFamily(a, c, 'min'),

  LARGE: (a, c) => {
    const bad = needArgs(a, 2);
    if (bad) return bad;
    const xs = collectNums([a[0]], c);
    if (isErr(xs)) return xs;
    const k = numAt(a, 1, c);
    if (isErr(k)) return k;
    const kk = Math.trunc(k);
    if (kk < 1 || kk > xs.length) return E('#NUM!');
    return [...xs].sort((p, q) => q - p)[kk - 1];
  },
  SMALL: (a, c) => {
    const bad = needArgs(a, 2);
    if (bad) return bad;
    const xs = collectNums([a[0]], c);
    if (isErr(xs)) return xs;
    const k = numAt(a, 1, c);
    if (isErr(k)) return k;
    const kk = Math.trunc(k);
    if (kk < 1 || kk > xs.length) return E('#NUM!');
    return [...xs].sort((p, q) => p - q)[kk - 1];
  },
  RANK: (a, c) => {
    const bad = needArgs(a, 2, 3);
    if (bad) return bad;
    const x = numAt(a, 0, c);
    if (isErr(x)) return x;
    const r = rangeOf(a[1], c);
    if (isErr(r)) return r;
    const order = numAt(a, 2, c, 0);
    if (isErr(order)) return order;
    const xs = flat(r).filter((v): v is number => typeof v === 'number');
    if (!xs.includes(x)) return E('#N/A');
    return 1 + xs.filter((v) => (order === 0 ? v > x : v < x)).length;
  },
  CEILING: (a, c) => {
    const bad = needArgs(a, 2);
    if (bad) return bad;
    const x = numAt(a, 0, c);
    const m = numAt(a, 1, c);
    if (isErr(x)) return x;
    if (isErr(m)) return m;
    if (m === 0) return 0;
    if (x > 0 && m < 0) return E('#NUM!');
    return Math.ceil(Number((x / m).toPrecision(15))) * m;
  },
  FLOOR: (a, c) => {
    const bad = needArgs(a, 2);
    if (bad) return bad;
    const x = numAt(a, 0, c);
    const m = numAt(a, 1, c);
    if (isErr(x)) return x;
    if (isErr(m)) return m;
    if (m === 0) return E('#DIV/0!');
    if (x > 0 && m < 0) return E('#NUM!');
    return Math.floor(Number((x / m).toPrecision(15))) * m;
  },
  SUBSTITUTE: (a, c) => {
    const bad = needArgs(a, 3, 4);
    if (bad) return bad;
    const t = sc(a[0], c);
    const from = sc(a[1], c);
    const to = sc(a[2], c);
    for (const v of [t, from, to]) if (isErr(v)) return v;
    const text = str(t as Scalar);
    const old = str(from as Scalar);
    const rep = str(to as Scalar);
    if (old === '') return text;
    if (a.length === 3) return text.split(old).join(rep);
    const nth = numAt(a, 3, c);
    if (isErr(nth)) return nth;
    if (nth < 1) return E('#VALUE!');
    let idx = -1;
    for (let i = 0; i < Math.trunc(nth); i++) {
      idx = text.indexOf(old, idx + 1);
      if (idx === -1) return text;
    }
    return text.slice(0, idx) + rep + text.slice(idx + old.length);
  },
  CHOOSE: (a, c) => {
    if (a.length < 2) return E('#ERROR!');
    const i = numAt(a, 0, c);
    if (isErr(i)) return i;
    const k = Math.trunc(i);
    if (k < 1 || k >= a.length) return E('#VALUE!');
    return sc(a[k], c);
  },
  ISNUMBER: (a, c) => {
    const bad = needArgs(a, 1);
    if (bad) return bad;
    return typeof sc(a[0], c) === 'number';
  },
  ISBLANK: (a, c) => {
    const bad = needArgs(a, 1);
    if (bad) return bad;
    return sc(a[0], c) === null;
  },
  SLN: (a, c) => {
    const bad = needArgs(a, 3);
    if (bad) return bad;
    const x = [numAt(a, 0, c), numAt(a, 1, c), numAt(a, 2, c)];
    for (const v of x) if (isErr(v)) return v;
    const [cost, salvage, life] = x as number[];
    return life === 0 ? E('#DIV/0!') : (cost - salvage) / life;
  },
  SYD: (a, c) => {
    const bad = needArgs(a, 4);
    if (bad) return bad;
    const x = [numAt(a, 0, c), numAt(a, 1, c), numAt(a, 2, c), numAt(a, 3, c)];
    for (const v of x) if (isErr(v)) return v;
    const [cost, salvage, life, per] = x as number[];
    if (life <= 0 || per < 1 || per > life) return E('#NUM!');
    return ((cost - salvage) * (life - per + 1) * 2) / (life * (life + 1));
  },
  DDB: (a, c) => {
    const bad = needArgs(a, 4, 5);
    if (bad) return bad;
    const x = [numAt(a, 0, c), numAt(a, 1, c), numAt(a, 2, c), numAt(a, 3, c), numAt(a, 4, c, 2)];
    for (const v of x) if (isErr(v)) return v;
    const [cost, salvage, life, per, factor] = x as number[];
    if (life <= 0 || per < 1 || per > life || cost < 0 || salvage < 0 || factor <= 0) return E('#NUM!');
    let book = cost;
    let dep = 0;
    for (let i = 1; i <= Math.trunc(per); i++) {
      dep = Math.min(book * (factor / life), Math.max(book - salvage, 0));
      book -= dep;
    }
    return dep;
  },
  NPER: (a, c) => {
    const bad = needArgs(a, 3, 5);
    if (bad) return bad;
    const x = [numAt(a, 0, c), numAt(a, 1, c), numAt(a, 2, c), numAt(a, 3, c, 0), numAt(a, 4, c, 0)];
    for (const v of x) if (isErr(v)) return v;
    const [rate, pmt, pv, fv, type] = x as number[];
    if (rate === 0) return pmt === 0 ? E('#NUM!') : -(pv + fv) / pmt;
    const adj = pmt * (1 + rate * (type ? 1 : 0));
    const top = adj - fv * rate;
    const bottom = adj + pv * rate;
    if (top / bottom <= 0) return E('#NUM!');
    return Math.log(top / bottom) / Math.log(1 + rate);
  },
  // Tanggal dan jam.
  DATE: (a, c) => {
    const bad = needArgs(a, 3);
    if (bad) return bad;
    const [y, m, d] = [numAt(a, 0, c), numAt(a, 1, c), numAt(a, 2, c)];
    for (const v of [y, m, d]) if (isErr(v)) return v;
    const first = serialFromYmd(Math.trunc(y as number), Math.trunc(m as number), 1);
    return first === null ? E('#NUM!') : first + Math.trunc(d as number) - 1;
  },
  YEAR: (a, c) => datePart(a, c, (s) => ymdFromSerial(s).y),
  MONTH: (a, c) => datePart(a, c, (s) => ymdFromSerial(s).m),
  DAY: (a, c) => datePart(a, c, (s) => ymdFromSerial(s).d),
  HOUR: (a, c) => datePart(a, c, hourOf),
  MINUTE: (a, c) => datePart(a, c, minuteOf),
  SECOND: (a, c) => datePart(a, c, secondOf),
  TIME: (a, c) => {
    const bad = needArgs(a, 3);
    if (bad) return bad;
    const [h, m, s] = [numAt(a, 0, c), numAt(a, 1, c), numAt(a, 2, c)];
    for (const v of [h, m, s]) if (isErr(v)) return v;
    const frac = ((h as number) * 3600 + (m as number) * 60 + (s as number)) / 86400;
    return frac - Math.floor(frac);
  },
  EDATE: (a, c) => shiftMonths(a, c, addMonths),
  EOMONTH: (a, c) => shiftMonths(a, c, endOfMonth),
  WEEKDAY: (a, c) => {
    const bad = needArgs(a, 1, 2);
    if (bad) return bad;
    const s = numAt(a, 0, c);
    if (isErr(s)) return s;
    const type = a[1] ? numAt(a, 1, c) : 1;
    if (isErr(type)) return type;
    const w = weekdayOf(s);
    if (type === 1) return w + 1;
    if (type === 2) return w === 0 ? 7 : w;
    if (type === 3) return (w + 6) % 7;
    return E('#NUM!');
  },
  DAYS: (a, c) => {
    const bad = needArgs(a, 2);
    if (bad) return bad;
    const [end, start] = [numAt(a, 0, c), numAt(a, 1, c)];
    if (isErr(end)) return end;
    if (isErr(start)) return start;
    return Math.floor(end) - Math.floor(start);
  },
  DATEDIF: (a, c) => {
    const bad = needArgs(a, 3);
    if (bad) return bad;
    const [from, to] = [numAt(a, 0, c), numAt(a, 1, c)];
    if (isErr(from)) return from;
    if (isErr(to)) return to;
    const unit = sc(a[2], c);
    if (isErr(unit)) return unit;
    if (Math.floor(from) > Math.floor(to)) return E('#NUM!');
    const p = ymdFromSerial(from);
    const q = ymdFromSerial(to);
    let months = (q.y - p.y) * 12 + (q.m - p.m);
    if (q.d < p.d) months -= 1;
    switch (str(unit as Scalar).toUpperCase()) {
      case 'D':
        return Math.floor(to) - Math.floor(from);
      case 'M':
        return months;
      case 'Y':
        return Math.floor(months / 12);
      case 'YM':
        return months % 12;
      case 'MD': {
        if (q.d >= p.d) return q.d - p.d;
        const prev = q.m === 1 ? daysInMonth(q.y - 1, 12) : daysInMonth(q.y, q.m - 1);
        return prev - p.d + q.d;
      }
      default:
        return E('#NUM!');
    }
  },
  NETWORKDAYS: (a, c) => {
    const bad = needArgs(a, 2, 3);
    if (bad) return bad;
    const [from, to] = [numAt(a, 0, c), numAt(a, 1, c)];
    if (isErr(from)) return from;
    if (isErr(to)) return to;
    const off = holidaySet(a[2], c);
    if (isErr(off)) return off;
    const lo = Math.floor(Math.min(from, to));
    const hi = Math.floor(Math.max(from, to));
    let n = 0;
    for (let d = lo; d <= hi; d++) if (isWorkday(d, off)) n++;
    return from <= to ? n : -n;
  },
  WORKDAY: (a, c) => {
    const bad = needArgs(a, 2, 3);
    if (bad) return bad;
    const [from, step] = [numAt(a, 0, c), numAt(a, 1, c)];
    if (isErr(from)) return from;
    if (isErr(step)) return step;
    const off = holidaySet(a[2], c);
    if (isErr(off)) return off;
    const dir = step < 0 ? -1 : 1;
    let left = Math.abs(Math.trunc(step));
    let d = Math.floor(from);
    while (left > 0) {
      d += dir;
      if (isWorkday(d, off)) left--;
    }
    return d;
  },
  DATEVALUE: (a, c) => {
    const bad = needArgs(a, 1);
    if (bad) return bad;
    const t = sc(a[0], c);
    if (isErr(t)) return t;
    const p = typeof t === 'string' ? parseTemporal(t) : null;
    return p ? Math.floor(p.serial) : E('#VALUE!');
  },
  TIMEVALUE: (a, c) => {
    const bad = needArgs(a, 1);
    if (bad) return bad;
    const t = sc(a[0], c);
    if (isErr(t)) return t;
    const p = typeof t === 'string' ? parseTemporal(t) : null;
    return p ? p.serial - Math.floor(p.serial) : E('#VALUE!');
  },
  TEXT: (a, c) => {
    const bad = needArgs(a, 2);
    if (bad) return bad;
    const v = sc(a[0], c);
    const p = sc(a[1], c);
    if (isErr(v)) return v;
    if (isErr(p)) return p;
    const n = num(v);
    if (isErr(n)) return typeof v === 'string' ? v : n;
    return formatWithPattern(n, str(p as Scalar)) ?? E('#VALUE!');
  },
  // Teks pembersih.
  PROPER: (a, c) => {
    const bad = needArgs(a, 1);
    if (bad) return bad;
    const t = sc(a[0], c);
    if (isErr(t)) return t;
    return str(t).toLowerCase().replace(/(^|[^\p{L}])(\p{L})/gu, (_, p, ch: string) => p + ch.toUpperCase());
  },
  CLEAN: (a, c) => {
    const bad = needArgs(a, 1);
    if (bad) return bad;
    const t = sc(a[0], c);
    // eslint-disable-next-line no-control-regex
    return isErr(t) ? t : str(t).replace(/[\u0000-\u001f]/g, '');
  },
  FIND: (a, c) => findText(a, c, true),
  SEARCH: (a, c) => findText(a, c, false),
  REPLACE: (a, c) => {
    const bad = needArgs(a, 4);
    if (bad) return bad;
    const t = sc(a[0], c);
    const start = numAt(a, 1, c);
    const len = numAt(a, 2, c);
    const rep = sc(a[3], c);
    if (isErr(t)) return t;
    if (isErr(start)) return start;
    if (isErr(len)) return len;
    if (isErr(rep)) return rep;
    if (start < 1 || len < 0) return E('#VALUE!');
    const s = str(t);
    return s.slice(0, Math.trunc(start) - 1) + str(rep) + s.slice(Math.trunc(start) - 1 + Math.trunc(len));
  },
  REPT: (a, c) => {
    const bad = needArgs(a, 2);
    if (bad) return bad;
    const t = sc(a[0], c);
    const n = numAt(a, 1, c);
    if (isErr(t)) return t;
    if (isErr(n)) return n;
    return n < 0 ? E('#VALUE!') : str(t).repeat(Math.trunc(n));
  },
  EXACT: (a, c) => {
    const bad = needArgs(a, 2);
    if (bad) return bad;
    const [x, y] = [sc(a[0], c), sc(a[1], c)];
    if (isErr(x)) return x;
    if (isErr(y)) return y;
    return str(x) === str(y);
  },
  VALUE: (a, c) => {
    const bad = needArgs(a, 1);
    if (bad) return bad;
    const t = sc(a[0], c);
    if (isErr(t)) return t;
    if (typeof t === 'number') return t;
    if (t === null) return 0;
    const s = str(t);
    const n = parseNumberText(s);
    if (n !== null) return n;
    const p = parseTemporal(s);
    return p ? p.serial : E('#VALUE!');
  },
  TEXTBEFORE: (a, c) => splitAt(a, c, true),
  TEXTAFTER: (a, c) => splitAt(a, c, false),
  TEXTJOIN: (a, c) => {
    if (a.length < 3) return E('#ERROR!');
    const sep = sc(a[0], c);
    const skip = toBool(sc(a[1], c));
    if (isErr(sep)) return sep;
    if (isErr(skip)) return skip;
    const parts: string[] = [];
    for (const n of a.slice(2)) {
      const r = rangeOf(n, c);
      if (isErr(r)) return r;
      for (const v of flat(r)) {
        if (isErr(v)) return v;
        if (skip && (v === null || v === '')) continue;
        parts.push(str(v));
      }
    }
    return parts.join(str(sep));
  },
  // Pemeriksaan nilai.
  ISERROR: (a, c) => {
    const bad = needArgs(a, 1);
    return bad ?? isErr(sc(a[0], c));
  },
  ISTEXT: (a, c) => {
    const bad = needArgs(a, 1);
    return bad ?? typeof sc(a[0], c) === 'string';
  },
  ISEVEN: (a, c) => parity(a, c, 0),
  ISODD: (a, c) => parity(a, c, 1),
  IFNA: (a, c) => {
    const bad = needArgs(a, 2);
    if (bad) return bad;
    const v = sc(a[0], c);
    return isErr(v) && v.code === '#N/A' ? sc(a[1], c) : v;
  },
  TRUNC: (a, c) => {
    const bad = needArgs(a, 1, 2);
    if (bad) return bad;
    const n = numAt(a, 0, c);
    if (isErr(n)) return n;
    const d = a[1] ? numAt(a, 1, c) : 0;
    if (isErr(d)) return d;
    const f = Math.pow(10, Math.trunc(d));
    return Math.trunc(Number((n * f).toPrecision(15))) / f;
  },
  HLOOKUP: (a, c) => {
    const bad = needArgs(a, 3, 4);
    if (bad) return bad;
    const lv = sc(a[0], c);
    if (isErr(lv)) return lv;
    const t = rangeOf(a[1], c);
    if (isErr(t)) return t;
    const ri = numAt(a, 2, c);
    if (isErr(ri)) return ri;
    const idx = Math.trunc(ri);
    if (idx < 1) return E('#VALUE!');
    if (idx > t.rows.length) return E('#REF!');
    let approx = true;
    if (a[3]) {
      const b = toBool(sc(a[3], c));
      if (isErr(b)) return b;
      approx = b;
    }
    const keys = t.rows[0];
    const pick = (i: number): Value => (t.rows[idx - 1][i] === null ? 0 : t.rows[idx - 1][i]);
    if (!approx) {
      const i = keys.findIndex((k) => !isErr(k) && k !== null && lv !== null && cmp(k, lv) === 0);
      return i < 0 ? E('#N/A') : pick(i);
    }
    let best = -1;
    for (let i = 0; i < keys.length; i++) {
      const k = keys[i];
      if (isErr(k) || k === null || rank(k) !== rank(lv ?? 0)) continue;
      if (cmp(k, lv) <= 0) best = i;
      else break;
    }
    return best < 0 ? E('#N/A') : pick(best);
  },
};

export const SUPPORTED_FUNCTIONS: string[] = Object.keys(FUNCS);

// ---------- API publik ----------

function parseLiteral(raw: string): Value {
  const t = raw.trim();
  if (t === '') return null;
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  const when = parseTemporal(t);
  if (when) return when.serial;
  const u = t.toUpperCase();
  if (u === 'TRUE') return true;
  if (u === 'FALSE') return false;
  return raw;
}

function evalFormula(src: string, c: Ctx): Value {
  try {
    const node = new Parser(tokenize(src)).parse();
    return scalar(ev(node, c));
  } catch (e) {
    if (e instanceof XlError) return e;
    return E('#ERROR!');
  }
}

// Hitung seluruh sel pada peta {alamat: isi mentah}. Isi berawalan "=" adalah formula.
export function evaluateSheet(raw: Record<string, string>): Record<string, Value> {
  const cache = new Map<string, Value>();
  const stack = new Set<string>();
  const ctx: Ctx = { get };

  function get(addr: string): Value {
    const a = addr.toUpperCase();
    const hit = cache.get(a);
    if (hit !== undefined) return hit;
    const r = raw[a];
    if (r === undefined || r === '') return null;
    if (!r.trim().startsWith('=')) {
      const v = parseLiteral(r);
      cache.set(a, v);
      return v;
    }
    if (stack.has(a)) return E('#CIRC!');
    stack.add(a);
    let v: Value;
    try {
      v = evalFormula(r.trim().slice(1), ctx);
    } finally {
      stack.delete(a);
    }
    cache.set(a, v);
    return v;
  }

  const out: Record<string, Value> = {};
  for (const k of Object.keys(raw)) out[k] = get(k);
  return out;
}

export function formatNumberId(n: number): string {
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 10 }).format(n);
}

export function formatValue(v: Value): string {
  if (v === null) return '';
  if (isErr(v)) return v.code;
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return formatNumberId(v);
  return v;
}

const DATE_RESULT = new Set(['DATE', 'EDATE', 'EOMONTH', 'WORKDAY', 'DATEVALUE']);

// Tampilan tanggal ikut isi mentah: literal tanggal, fungsi bertipe tanggal, atau acuan sel tanggal digeser angka.
function formatOfRaw(raw: string | undefined, sheet: Record<string, string>, depth: number): CellFormat | undefined {
  if (raw === undefined || depth > 4) return undefined;
  const t = raw.trim();
  if (!t.startsWith('=')) return parseTemporal(t)?.format;
  const body = t.slice(1).trim();
  const fn = /^([A-Za-z]+)\s*\(/.exec(body)?.[1].toUpperCase();
  if (fn && DATE_RESULT.has(fn)) return 'date';
  if (fn === 'TIME' || fn === 'TIMEVALUE') return 'time';
  const shifted = /^\$?([A-Za-z]{1,3})\$?(\d+)\s*[+-]\s*[\d.]+$/.exec(body);
  if (shifted) return formatOfRaw(sheet[(shifted[1] + shifted[2]).toUpperCase()], sheet, depth + 1);
  return undefined;
}

// Teks yang tampil di sel. `forced` (dari soal) menang atas tebakan dari isi mentah.
export function displayValue(addr: string, v: Value, sheet: Record<string, string>, forced?: CellFormat): string {
  const f = typeof v === 'number' ? (forced ?? formatOfRaw(sheet[addr], sheet, 0)) : undefined;
  return f ? formatTemporal(v as number, f) : formatValue(v);
}

export function valuesEqual(a: Value, b: Value): boolean {
  if (isErr(a) || isErr(b)) return isErr(a) && isErr(b) && a.code === b.code;
  const x = a === null ? '' : a;
  const y = b === null ? '' : b;
  if (typeof x === 'number' && typeof y === 'number') {
    return Math.abs(x - y) <= 1e-9 * Math.max(1, Math.abs(x), Math.abs(y));
  }
  return x === y;
}

export function usesFunction(formula: string, fn: string): boolean {
  return new RegExp('\\b' + fn + '\\s*\\(', 'i').test(formula);
}
