import { evaluateSheet, formatValue, isErrorValue } from '../lib/formula';
import { EXERCISES } from '../lib/exercises';
import { checkAnswer } from '../lib/check';
import { COURSES, courseExerciseSlugs, courseQuizIds } from '../lib/courses';
import { FUNCTION_DOCS, getFunctionDoc } from '../lib/functions';
import { SUPPORTED_FUNCTIONS } from '../lib/formula';

let pass = 0;
let fail = 0;

function t(name: string, cond: boolean, detail = ''): void {
  if (cond) pass++;
  else {
    fail++;
    console.log('GAGAL:', name, detail);
  }
}

function calc(formula: string, sheet: Record<string, string> = {}): string {
  const r = evaluateSheet({ ...sheet, Z99: formula });
  return formatValue(r.Z99);
}

const num = (formula: string, sheet: Record<string, string> = {}): number | string | boolean | null => {
  const r = evaluateSheet({ ...sheet, Z99: formula }).Z99;
  return isErrorValue(r) ? r.code : r;
};

// ---- Aritmatika dan operator ----
t('tambah kali', num('=2+3*4') === 14);
t('kurung', num('=(2+3)*4') === 20);
t('pangkat', num('=2^3') === 8);
t('unari minus', num('=-2+5') === 3);
t('persen', num('=50%') === 0.5);
t('bagi nol', num('=1/0') === '#DIV/0!');
t('concat', num('="a"&"b"') === 'ab');
t('banding', num('=3>=3') === true);
t('banding teks', num('="abc"="ABC"') === true);
t('pemisah titik koma', num('=SUM(1;2;3)') === 6);

// ---- Fungsi dasar ----
const s1 = { A1: '10', A2: '20', A3: '30', A4: 'x', A5: '' };
t('SUM range', num('=SUM(A1:A5)', s1) === 60);
t('SUM abaikan teks di range', num('=SUM(A1:A4)', s1) === 60);
t('AVERAGE', num('=AVERAGE(A1:A4)', s1) === 20);
t('MAX', num('=MAX(A1:A4)', s1) === 30);
t('MIN', num('=MIN(A1:A4)', s1) === 10);
t('COUNT', num('=COUNT(A1:A5)', s1) === 3);
t('COUNTA', num('=COUNTA(A1:A5)', s1) === 4);
t('MEDIAN', num('=MEDIAN(A1:A3)', s1) === 20);
t('ROUND', num('=ROUND(2.345,2)') === 2.35);
t('ROUND 0', num('=ROUND(12750*0.11,0)') === 1403);
t('ROUND negatif', num('=ROUND(-2.5,0)') === -3);
t('ROUNDUP', num('=ROUNDUP(2.11,1)') === 2.2);
t('ROUNDDOWN', num('=ROUNDDOWN(2.19,1)') === 2.1);
t('MOD', num('=MOD(-3,2)') === 1);
t('IF benar', num('=IF(1<2,"a","b")') === 'a');
t('IF salah', num('=IF(1>2,"a","b")') === 'b');
t('IFERROR', num('=IFERROR(1/0,7)') === 7);
t('AND', num('=AND(TRUE,1>0)') === true);
t('OR', num('=OR(FALSE,1>2)') === false);
t('LEFT', num('=LEFT("Wulang",3)') === 'Wul');
t('RIGHT', num('=RIGHT("Wulang",2)') === 'ng');
t('MID', num('=MID("Wulang",2,3)') === 'ula');
t('LEN', num('=LEN("Wulang")') === 6);
t('UPPER', num('=UPPER("abc")') === 'ABC');
t('TRIM', num('=TRIM("  a   b ")') === 'a b');
t('fungsi tak dikenal', num('=FOO(1)') === '#NAME?');
t('formula rusak', num('=SUM(') === '#ERROR!');
t('referensi bundar', evaluateSheet({ A1: '=B1', B1: '=A1' }).A1 instanceof Object);

// ---- Fungsi bersyarat ----
const s2 = {
  A1: 'Minuman', A2: 'Makanan', A3: 'Minuman', A4: 'Makanan',
  B1: '10', B2: '20', B3: '30', B4: '40',
  C1: 'Utara', C2: 'Utara', C3: 'Selatan', C4: 'Utara',
};
t('SUMIF teks', num('=SUMIF(A1:A4,"Minuman",B1:B4)', s2) === 40);
t('SUMIF ref', num('=SUMIF(A1:A4,A2,B1:B4)', s2) === 60);
t('SUMIF angka', num('=SUMIF(B1:B4,">15")', s2) === 90);
t('SUMIF wildcard', num('=SUMIF(A1:A4,"Min*",B1:B4)', s2) === 40);
t('COUNTIF', num('=COUNTIF(A1:A4,"Makanan")', s2) === 2);
t('COUNTIF <>', num('=COUNTIF(A1:A4,"<>Makanan")', s2) === 2);
t('AVERAGEIF', num('=AVERAGEIF(A1:A4,"Minuman",B1:B4)', s2) === 20);
t('SUMIFS', num('=SUMIFS(B1:B4,A1:A4,"Makanan",C1:C4,"Utara")', s2) === 60);
t('COUNTIFS', num('=COUNTIFS(A1:A4,"Minuman",C1:C4,"Utara")', s2) === 1);

// ---- Pencarian ----
const s3 = {
  A1: 'K-01', B1: 'Spidol', C1: '7500',
  A2: 'K-02', B2: 'Penghapus', C2: '3000',
  A3: 'K-03', B3: 'Buku', C3: '18000',
};
t('VLOOKUP persis', num('=VLOOKUP("K-02",A1:C3,3,FALSE)', s3) === 3000);
t('VLOOKUP tak ada', num('=VLOOKUP("K-09",A1:C3,3,FALSE)', s3) === '#N/A');
t('MATCH 0', num('=MATCH("K-03",A1:A3,0)', s3) === 3);
t('INDEX MATCH', num('=INDEX(B1:B3,MATCH("K-02",A1:A3,0))', s3) === 'Penghapus');
t('XLOOKUP', num('=XLOOKUP("K-01",A1:A3,C1:C3)', s3) === 7500);
t('VLOOKUP approx', num('=VLOOKUP(5,A1:B3,2,TRUE)', { A1: '1', B1: 'a', A2: '4', B2: 'b', A3: '9', B3: 'c' }) === 'b');

// ---- Setiap soal: solusi acuan harus lulus, dan jawaban salah harus gagal ----
for (const ex of EXERCISES) {
  const good = checkAnswer(ex, ex.solution);
  t(`${ex.slug}: solusi acuan lulus`, good.ok, JSON.stringify(good.cells));

  const empty = checkAnswer(ex, {});
  t(`${ex.slug}: kosong ditolak`, !empty.ok);

  // Angka diketik langsung harus ditolak.
  const hardcoded: Record<string, string> = {};
  for (const tg of ex.targets) hardcoded[tg] = String(ex.expected[tg]);
  t(`${ex.slug}: angka mentah ditolak`, !checkAnswer(ex, hardcoded).ok);

  // Formula berisi hasil konstan juga harus gagal uji variasi (jika ada variasi).
  if (Object.keys(ex.variantSheet).some((k) => ex.variantSheet[k] !== ex.sheet[k])) {
    const constant: Record<string, string> = {};
    for (const tg of ex.targets) {
      const v = ex.expected[tg];
      constant[tg] = typeof v === 'number' ? `=${v}` : `="${String(v)}"`;
    }
    t(`${ex.slug}: konstanta dalam formula gagal uji variasi`, !checkAnswer(ex, constant).ok);
  }

  // Fungsi wajib diperiksa.
  if (ex.fns.length > 0) {
    const wrong = { ...ex.solution };
    const tg = ex.targets.find((x) => ex.required[x].length > 0);
    if (tg) {
      // Ganti formula dengan jalur tanpa fungsi wajib tapi tetap bernilai sama.
      const v = ex.expected[tg];
      wrong[tg] = typeof v === 'number' ? `=${v}+0*A1` : `="${String(v)}"`;
      t(`${ex.slug}: tanpa fungsi wajib ditolak`, !checkAnswer(ex, wrong).cells[tg].ok);
    }
  }
}

// Satu sel salah tidak boleh membuat sel lain ikut salah.
const multi = EXERCISES.find((e) => e.slug === 'fungsi-max-min');
if (multi) {
  const r = checkAnswer(multi, { B9: '=MAX(B2:B8)', B10: '=MAX(B2:B8)' });
  t('max-min: B9 benar, B10 salah', r.cells.B9.ok && !r.cells.B10.ok);
}

// Jawaban lain yang sah harus diterima.
const sum = EXERCISES.find((e) => e.slug === 'fungsi-sum');
if (sum) {
  t('sum: huruf kecil dan spasi', checkAnswer(sum, { B7: '= sum( b2:b6 )' }).ok);
  t('sum: $ pada rentang', checkAnswer(sum, { B7: '=SUM($B$2:$B$6)' }).ok);
  t('sum: rentang kurang ditolak', !checkAnswer(sum, { B7: '=SUM(B2:B5)' }).ok);
}
const ifx = EXERCISES.find((e) => e.slug === 'fungsi-if');
if (ifx) {
  t('if: > bukan >= ditolak atau lulus sesuai data', checkAnswer(ifx, {
    D2: '=IF(C2>=B2,"Lunas","Belum lunas")',
    D3: '=IF(C3>=B3,"Lunas","Belum lunas")',
    D4: '=IF(C4>=B4,"Lunas","Belum lunas")',
    D5: '=IF(C5>=B5,"Lunas","Belum lunas")',
  }).ok);
}
const sumif = EXERCISES.find((e) => e.slug === 'fungsi-sumif');
if (sumif) {
  t('sumif: kriteria diketik langsung diterima', checkAnswer(sumif, {
    C9: '=SUMIF(B2:B7,"Minuman",C2:C7)',
    C10: '=SUMIF(B2:B7,"Makanan",C2:C7)',
  }).ok);
}

// ---- Fungsi keuangan dan SUMPRODUCT ----
const near = (v: unknown, want: number, tol = 0.01) => typeof v === 'number' && Math.abs(v - want) <= tol;
t('PMT cicilan 10 juta 1% 12 bulan', near(num('=PMT(1%,12,-10000000)'), 888487.89, 0.02));
t('PMT bunga 0', near(num('=PMT(0,10,-1000)'), 100));
t('PMT dengan nilai akhir', near(num('=PMT(0.01,12,0,10000000)'), -788487.89 + 0.0, 100000));
t('FV menabung 24 bulan', near(num('=FV(0.5%,24,-1000000)'), 25431955.2, 1));
t('PV 12 cicilan', near(num('=PV(1%,12,-1000000)'), 11255077.47, 1));
t('NPV dua arus', near(num('=NPV(10%,100,200)'), 256.198, 0.001));
t('NPV dari rentang', near(num('=NPV(0.1,A1:A2)', { A1: '100', A2: '200' }), 256.198, 0.001));
t('IRR sederhana', near(num('=IRR(A1:A2)', { A1: '-100', A2: '110' }), 0.1, 1e-6));
t('IRR beberapa periode', near(num('=IRR(A1:A4)', { A1: '-1000', A2: '300', A3: '400', A4: '500' }), 0.0889, 0.0005));
t('IRR tanpa tanda berganti = #NUM!', num('=IRR(A1:A2)', { A1: '100', A2: '110' }) === '#NUM!');
t('SUMPRODUCT dua rentang', near(num('=SUMPRODUCT(A1:A3,B1:B3)', { A1: '2', A2: '3', A3: '4', B1: '10', B2: '20', B3: '30' }), 200));
t('SUMPRODUCT ukuran beda = #VALUE!', num('=SUMPRODUCT(A1:A3,B1:B2)', { A1: '1', A2: '1', A3: '1', B1: '1', B2: '1' }) === '#VALUE!');
t('SUMPRODUCT dengan syarat', near(num('=SUMPRODUCT((A1:A3="x")*B1:B3)', { A1: 'x', A2: 'y', A3: 'x', B1: '5', B2: '6', B3: '7' }), 12));
t('IFS cabang tengah', num('=IFS(A1>=90,"A",A1>=75,"B",TRUE,"C")', { A1: '80' }) === 'B');
t('IFS tanpa cocok = #N/A', num('=IFS(A1>100,"x")', { A1: '5' }) === '#N/A');

// ---- Fungsi bisnis tambahan ----
const dekat = (x: unknown, y: number, eps = 1e-6) => typeof x === "number" && Math.abs(x - y) < eps;
t('SLN', num('=SLN(120000000,12000000,5)') === 21600000);
t('SLN umur nol', num('=SLN(100,10,0)') === '#DIV/0!');
t('SYD tahun 1', num('=SYD(120000000,12000000,5,1)') === 36000000);
t('SYD tahun 5', num('=SYD(120000000,12000000,5,5)') === 7200000);
t('SYD periode di luar umur', num('=SYD(100,10,5,6)') === '#NUM!');
t('DDB tahun 1', dekat(num('=DDB(120000000,12000000,5,1)'), 48000000));
t('DDB tahun 2', dekat(num('=DDB(120000000,12000000,5,2)'), 28800000));
t('DDB tahun 5 dibatasi nilai sisa', dekat(num('=DDB(120000000,12000000,5,5)'), 3552000, 1e-3));
t('NPER bunga 1%', dekat(num('=NPER(0.01,-3500000,40000000)'), 12.2, 0.1));
t('NPER tanpa bunga', num('=NPER(0,-100,1000)') === 10);
t('NPER cicilan tak menutup bunga', num('=NPER(0.01,-100,40000)') === '#NUM!');
t('CEILING', num('=CEILING(31590,500)') === 32000);
t('CEILING sudah kelipatan', num('=CEILING(32000,500)') === 32000);
t('CEILING kelipatan nol', num('=CEILING(10,0)') === 0);
t('FLOOR', num('=FLOOR(28845,1000)') === 28000);
t('FLOOR kelipatan nol', num('=FLOOR(5,0)') === '#DIV/0!');
const nilai = { A1: '5', A2: '9', A3: '9', A4: '1' };
t('RANK terbesar', num('=RANK(9,A1:A4)', nilai) === 1);
t('RANK kembar sama peringkat', num('=RANK(5,A1:A4)', nilai) === 3);
t('RANK menaik', num('=RANK(1,A1:A4,1)', nilai) === 1);
t('RANK angka tak ada', num('=RANK(7,A1:A4)', nilai) === '#N/A');
t('LARGE ke-2 (kembar dihitung)', num('=LARGE(A1:A4,2)', nilai) === 9);
t('LARGE ke-3', num('=LARGE(A1:A4,3)', nilai) === 5);
t('SMALL ke-1', num('=SMALL(A1:A4,1)', nilai) === 1);
t('LARGE k di luar rentang', num('=LARGE(A1:A4,5)', nilai) === '#NUM!');
const kat = { A1: 'X', A2: 'Y', A3: 'X', A4: 'Y', B1: '10', B2: '4', B3: '30', B4: '8' };
t('MAXIFS', num('=MAXIFS(B1:B4,A1:A4,"X")', kat) === 30);
t('MINIFS', num('=MINIFS(B1:B4,A1:A4,"Y")', kat) === 4);
t('MAXIFS dua syarat', num('=MAXIFS(B1:B4,A1:A4,"X",B1:B4,"<20")', kat) === 10);
t('MAXIFS tak ada yang cocok', num('=MAXIFS(B1:B4,A1:A4,"Z")', kat) === 0);
t('AVERAGEIFS', num('=AVERAGEIFS(B1:B4,A1:A4,"X")', kat) === 20);
t('AVERAGEIFS tak ada yang cocok', num('=AVERAGEIFS(B1:B4,A1:A4,"Z")', kat) === '#DIV/0!');
t('SUMIFS tetap jalan', num('=SUMIFS(B1:B4,A1:A4,"Y")', kat) === 12);
t('COUNTIFS tetap jalan', num('=COUNTIFS(A1:A4,"X",B1:B4,">5")', kat) === 2);
t('SUBSTITUTE semua', num('=SUBSTITUTE("0812-3456-7890","-","")') === '081234567890');
t('SUBSTITUTE ke-2', num('=SUBSTITUTE("a-b-c","-","+",2)') === 'a-b+c');
t('SUBSTITUTE bedakan huruf besar', num('=SUBSTITUTE("Aa","a","x")') === 'Ax');
t('CHOOSE', num('=CHOOSE(2,"A","B","C")') === 'B');
t('CHOOSE di luar daftar', num('=CHOOSE(4,"A","B","C")') === '#VALUE!');
t('ISNUMBER angka', num('=ISNUMBER(A1)', { A1: '5' }) === true);
t('ISNUMBER teks', num('=ISNUMBER(A1)', { A1: 'lima' }) === false);
t('ISBLANK kosong', num('=ISBLANK(A1)', {}) === true);
t('ISBLANK nol bukan kosong', num('=ISBLANK(A1)', { A1: '0' }) === false);

// ---- Konten: kursus, kuis, ensiklopedia, solusi acuan ----
const slugs = new Set(EXERCISES.map((e) => e.slug));
t('slug soal unik', slugs.size === EXERCISES.length);
const quizIds = COURSES.flatMap((c) => courseQuizIds(c));
t('id kuis unik', new Set(quizIds).size === quizIds.length);
t('slug kursus unik', new Set(COURSES.map((c) => c.slug)).size === COURSES.length);
for (const c of COURSES) {
  for (const s of courseExerciseSlugs(c)) t(`kursus ${c.slug}: soal ${s} ada`, slugs.has(s));
  for (const st of c.steps) {
    if (st.type === 'kuis') {
      t(`kuis ${st.id}: kunci jawaban dalam rentang`, st.answer >= 0 && st.answer < st.options.length);
      t(`kuis ${st.id}: pilihan unik`, new Set(st.options).size === st.options.length);
    }
  }
}
for (const e of EXERCISES) {
  for (const f of e.fns) t(`ensiklopedia memuat ${f} (soal ${e.slug})`, getFunctionDoc(f) !== undefined);
  // Solusi acuan harus lulus pengecekan sendiri.
  t(`solusi acuan ${e.slug} lulus`, checkAnswer(e, e.solution).ok);
}
for (const d of FUNCTION_DOCS) t(`fungsi ${d.name} didukung mesin`, SUPPORTED_FUNCTIONS.includes(d.name));

console.log(`\n${pass} lulus, ${fail} gagal, ${EXERCISES.length} soal`);
if (fail > 0) process.exit(1);
