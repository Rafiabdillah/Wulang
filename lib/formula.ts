// Mesin formula Wulang: tokenizer, parser, dan evaluator bergaya spreadsheet.
// Tanpa dependensi. Dipakai di browser untuk menghitung sel dan memeriksa jawaban.

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
      const l = scalar(ev(n.l, c));
      const r = scalar(ev(n.r, c));
      if (isErr(l)) return l;
      if (isErr(r)) return r;
      switch (n.op) {
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
      switch (n.op) {
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

function ifsFamily(args: Node[], c: Ctx, mode: 'sum' | 'count'): Value {
  const first = mode === 'sum' ? 1 : 0;
  if (args.length < first + 2 || (args.length - first) % 2 !== 0) return E('#ERROR!');
  let sumVals: Value[] = [];
  if (mode === 'sum') {
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
  if (mode === 'sum' && sumVals.length !== size) return E('#VALUE!');
  let total = 0;
  let count = 0;
  for (let i = 0; i < size; i++) {
    if (!pairs.every((p) => p.test(p.cells[i]))) continue;
    count++;
    if (mode === 'sum') {
      const v = sumVals[i];
      if (isErr(v)) return v;
      if (typeof v === 'number') total += v;
    }
  }
  return mode === 'sum' ? total : count;
}

function oneDim(r: RangeVal): Value[] | null {
  if (r.rows.length === 1 || (r.rows.length > 0 && r.rows[0].length === 1)) return flat(r);
  return null;
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
};

export const SUPPORTED_FUNCTIONS: string[] = Object.keys(FUNCS);

// ---------- API publik ----------

function parseLiteral(raw: string): Value {
  const t = raw.trim();
  if (t === '') return null;
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
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
