import { addrOf, evaluateSheet, expandRange, isErrorValue, parseAddr } from './formula';
import type { Value } from './formula';
import type { Exercise, ExerciseDef, Kind, Level, Scalar } from './types';

const DEFAULT_XP: Record<Level, number> = { Mudah: 10, Sedang: 15, Sulit: 25 };

function fromRows(rows: string[][]): Record<string, string> {
  const out: Record<string, string> = {};
  rows.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell !== '') out[addrOf(c + 1, r + 1)] = cell;
    })
  );
  return out;
}

// Ubah sel angka agar formula yang mengetik angka langsung ketahuan.
function applyVariant(sheet: Record<string, string>, vary: string[]): Record<string, string> {
  const out = { ...sheet };
  let idx = 0;
  for (const range of vary) {
    for (const a of expandRange(range)) {
      idx++;
      const raw = out[a];
      if (raw === undefined || !/^-?\d+(\.\d+)?$/.test(raw)) continue;
      const n = Number(raw);
      out[a] = Number.isInteger(n)
        ? String(Math.round(n * 1.13) + idx)
        : String(Number((n * 1.13).toFixed(2)));
    }
  }
  return out;
}

function sortAddrs(addrs: string[]): string[] {
  return [...addrs].sort((x, y) => {
    const a = parseAddr(x);
    const b = parseAddr(y);
    if (!a || !b) return 0;
    return a.row - b.row || a.col - b.col;
  });
}

function mustScalar(v: Value, where: string): Scalar {
  if (isErrorValue(v)) throw new Error(`Solusi menghasilkan ${v.code} di ${where}`);
  return v;
}

function build(def: ExerciseDef): Exercise {
  const sheet = fromRows(def.rows);
  const targets = sortAddrs(Object.keys(def.solution));
  for (const t of targets) {
    if (sheet[t] !== undefined) throw new Error(`${def.slug}: sel target ${t} harus kosong`);
    if (!def.required[t]) throw new Error(`${def.slug}: ${t} belum punya daftar fungsi wajib`);
  }
  const variantSheet = applyVariant(sheet, def.vary ?? []);
  const base = evaluateSheet({ ...sheet, ...def.solution });
  const variant = evaluateSheet({ ...variantSheet, ...def.solution });
  const expected: Record<string, Scalar> = {};
  const expectedVariant: Record<string, Scalar> = {};
  for (const t of targets) {
    expected[t] = mustScalar(base[t], `${def.slug}/${t}`);
    expectedVariant[t] = mustScalar(variant[t], `${def.slug}/${t} (variasi)`);
  }
  const fns = Array.from(new Set(targets.flatMap((t) => def.required[t])));
  return {
    slug: def.slug,
    kind: def.kind,
    title: def.title,
    category: def.category,
    emoji: def.emoji,
    level: def.level,
    xp: def.xp ?? DEFAULT_XP[def.level],
    story: def.story,
    task: def.task,
    note: def.note,
    hints: def.hints,
    explanation: def.explanation,
    sheet,
    nRows: def.rows.length,
    nCols: Math.max(...def.rows.map((r) => r.length)),
    targets,
    solution: def.solution,
    required: def.required,
    fns,
    expected,
    variantSheet,
    expectedVariant,
  };
}

// Isi satu kolom untuk baris from..to dengan formula hasil fn(baris).
function fill(col: string, from: number, to: number, fn: (r: number) => string): Record<string, string> {
  const out: Record<string, string> = {};
  for (let r = from; r <= to; r++) out[`${col}${r}`] = fn(r);
  return out;
}

// Daftar fungsi wajib yang sama untuk banyak sel.
function need(cells: string[], fns: string[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const c of cells) out[c] = fns;
  return out;
}

const DEFS: ExerciseDef[] = [
  // ---------------- LATIHAN FUNGSI ----------------
  {
    slug: 'fungsi-sum',
    kind: 'latihan',
    title: 'Fungsi SUM',
    category: 'Statistik & Agregasi',
    emoji: '📊',
    level: 'Mudah',
    story:
      'Mbak Dwi jualan es teh di depan kampus. Omzet lima hari kerja sudah dia catat, dan sekarang dia mau tahu totalnya untuk dibandingkan dengan target mingguan.',
    task: 'Isi sel B7 dengan formula yang menjumlahkan seluruh omzet di B2:B6.',
    note: 'Kalau ada hari tambahan, cukup perlebar rentangnya. Rumusnya tetap sama.',
    rows: [
      ['Hari', 'Omzet (Rp)'],
      ['Senin', '185000'],
      ['Selasa', '210000'],
      ['Rabu', '165000'],
      ['Kamis', '240000'],
      ['Jumat', '295000'],
      ['Total', ''],
    ],
    solution: { B7: '=SUM(B2:B6)' },
    required: { B7: ['SUM'] },
    vary: ['B2:B6'],
    hints: [
      'Cari fungsi yang tugasnya menjumlahkan deretan angka.',
      'SUM menerima rentang dengan bentuk awal:akhir. Datanya ada dari B2 sampai B6.',
      'Rumusnya berbentuk =SUM(B2:B6), diketik di B7.',
    ],
    explanation:
      'SUM menjumlahkan semua angka di rentang yang kamu berikan. Mengetik =B2+B3+B4+B5+B6 juga benar, tapi SUM lebih ringkas dan tidak perlu diubah saat barisnya bertambah.',
  },
  {
    slug: 'fungsi-average',
    kind: 'latihan',
    title: 'Fungsi AVERAGE',
    category: 'Statistik & Agregasi',
    emoji: '📊',
    level: 'Mudah',
    story:
      'Toko online Kak Raka membandingkan empat jasa ekspedisi. Sebelum memilih mana yang jadi default, dia ingin tahu rata-rata ongkos kirimnya.',
    task: 'Isi B6 dengan rata-rata ongkos kirim dari B2:B5.',
    rows: [
      ['Ekspedisi', 'Ongkir (Rp)'],
      ['Kilat', '18000'],
      ['Reguler', '12000'],
      ['Hemat', '9000'],
      ['Kargo', '25000'],
      ['Rata-rata', ''],
    ],
    solution: { B6: '=AVERAGE(B2:B5)' },
    required: { B6: ['AVERAGE'] },
    vary: ['B2:B5'],
    hints: [
      'Rata-rata adalah jumlah dibagi banyaknya data. Spreadsheet punya fungsi khusus untuk itu.',
      'AVERAGE bekerja dengan rentang, sama seperti SUM.',
      'Rumusnya berbentuk =AVERAGE(B2:B5).',
    ],
    explanation:
      'AVERAGE menghitung jumlah lalu membaginya dengan banyaknya angka. Sel kosong dan teks di dalam rentang diabaikan, jadi tidak ikut mengurangi rata-rata.',
  },
  {
    slug: 'fungsi-max-min',
    kind: 'latihan',
    title: 'Fungsi MAX dan MIN',
    category: 'Statistik & Agregasi',
    emoji: '📊',
    level: 'Mudah',
    story:
      'Bu Laras mengajar IPA kelas 5 dan mencatat curah hujan harian selama seminggu. Murid-muridnya akan membandingkan hari paling basah dan hari paling kering.',
    task: 'Isi B9 dengan curah hujan tertinggi dan B10 dengan yang terendah dari data B2:B8.',
    rows: [
      ['Hari', 'Curah hujan (mm)'],
      ['Senin', '12'],
      ['Selasa', '0'],
      ['Rabu', '35'],
      ['Kamis', '8'],
      ['Jumat', '22'],
      ['Sabtu', '3'],
      ['Minggu', '17'],
      ['Tertinggi', ''],
      ['Terendah', ''],
    ],
    solution: { B9: '=MAX(B2:B8)', B10: '=MIN(B2:B8)' },
    required: { B9: ['MAX'], B10: ['MIN'] },
    vary: ['B2:B8'],
    hints: [
      'Kamu butuh dua fungsi berbeda: satu untuk nilai terbesar, satu untuk terkecil.',
      'Dua-duanya memakai rentang yang sama, B2:B8.',
      'B9 memakai MAX dan B10 memakai MIN, keduanya dengan rentang B2:B8.',
    ],
    explanation:
      'MAX mengembalikan angka terbesar di rentang, MIN yang terkecil. Rentang yang sama dipakai dua kali, hanya fungsinya yang beda.',
  },
  {
    slug: 'fungsi-count',
    kind: 'latihan',
    title: 'Fungsi COUNT dan COUNTA',
    category: 'Statistik & Agregasi',
    emoji: '📊',
    level: 'Mudah',
    story:
      'Panitia pelatihan mencatat nilai kuis peserta. Ada yang izin, ada yang sakit, dan ada yang kolomnya belum diisi sama sekali.',
    task: 'Isi B8 dengan jumlah peserta yang sudah punya nilai angka, dan B9 dengan jumlah peserta yang kolomnya terisi apa pun (angka maupun keterangan).',
    rows: [
      ['Peserta', 'Nilai kuis'],
      ['Ayu', '80'],
      ['Bimo', 'Izin'],
      ['Cinta', '90'],
      ['Dewa', ''],
      ['Eko', '75'],
      ['Fira', 'Sakit'],
      ['Sudah ada nilai angka', ''],
      ['Kolom terisi (apa pun)', ''],
    ],
    solution: { B8: '=COUNT(B2:B7)', B9: '=COUNTA(B2:B7)' },
    required: { B8: ['COUNT'], B9: ['COUNTA'] },
    vary: ['B2:B7'],
    hints: [
      'Satu fungsi hanya menghitung angka, satunya lagi menghitung semua sel yang tidak kosong. Nama keduanya mirip.',
      'COUNT cuma menghitung angka. COUNTA menghitung sel yang terisi, termasuk teks.',
      'B8 memakai COUNT dan B9 memakai COUNTA, keduanya dengan rentang B2:B7.',
    ],
    explanation:
      'COUNT hanya menghitung sel berisi angka (hasilnya 3). COUNTA menghitung semua sel yang tidak kosong, termasuk teks seperti Izin dan Sakit (hasilnya 5).',
  },
  {
    slug: 'fungsi-if',
    kind: 'latihan',
    title: 'Fungsi IF',
    category: 'Logika',
    emoji: '🧠',
    level: 'Mudah',
    story:
      'Pak Hendra mengelola rumah kos empat kamar. Tiap akhir bulan dia mencocokkan tagihan dengan uang yang masuk, lalu menandai kamar mana yang sudah lunas.',
    task: 'Isi D2:D5 dengan "Lunas" jika jumlah yang dibayar sama dengan atau lebih dari tagihan, selain itu "Belum lunas".',
    rows: [
      ['Penghuni', 'Tagihan (Rp)', 'Dibayar (Rp)', 'Status'],
      ['Kamar 1', '1200000', '1200000', ''],
      ['Kamar 2', '1200000', '800000', ''],
      ['Kamar 3', '1500000', '1500000', ''],
      ['Kamar 4', '1500000', '0', ''],
    ],
    solution: fill('D', 2, 5, (r) => `=IF(C${r}>=B${r},"Lunas","Belum lunas")`),
    required: need(['D2', 'D3', 'D4', 'D5'], ['IF']),
    vary: ['B2:C5'],
    hints: [
      'Kamu butuh fungsi yang memilih satu dari dua hasil berdasarkan sebuah syarat.',
      'IF punya tiga bagian: syarat, hasil kalau benar, hasil kalau salah. Teks harus diapit tanda kutip.',
      'Rumus di D2: =IF(C2>=B2,"Lunas","Belum lunas"), lalu sesuaikan baris untuk sel di bawahnya.',
    ],
    explanation:
      'IF(syarat, jika_benar, jika_salah) mengevaluasi syarat lebih dulu. Di sini syaratnya C2>=B2: kalau uang yang masuk mencukupi, hasilnya "Lunas".',
  },
  {
    slug: 'fungsi-and',
    kind: 'latihan',
    title: 'Fungsi AND di dalam IF',
    category: 'Logika',
    emoji: '🧠',
    level: 'Sedang',
    story:
      'Toko perlengkapan hobi memberi diskon khusus. Pelanggan hanya dapat diskon kalau belanjanya mencapai 300 ribu dan dia terdaftar sebagai member.',
    task: 'Isi D2:D5 dengan "Ya" jika total belanja minimal 300000 dan Member berisi "Ya", selain itu "Tidak".',
    rows: [
      ['Pelanggan', 'Total belanja (Rp)', 'Member?', 'Dapat diskon?'],
      ['Sinta', '350000', 'Ya', ''],
      ['Teguh', '150000', 'Ya', ''],
      ['Umi', '500000', 'Tidak', ''],
      ['Vino', '420000', 'Ya', ''],
    ],
    solution: fill('D', 2, 5, (r) => `=IF(AND(B${r}>=300000,C${r}="Ya"),"Ya","Tidak")`),
    required: need(['D2', 'D3', 'D4', 'D5'], ['IF', 'AND']),
    vary: ['B2:B5'],
    hints: [
      'Ada dua syarat yang harus terpenuhi sekaligus. Satu fungsi logika bisa menggabungkannya.',
      'AND(syarat1, syarat2) bernilai benar hanya kalau semuanya benar. Taruh AND di bagian syarat IF.',
      'Bentuknya: =IF(AND(B2>=300000,C2="Ya"),"Ya","Tidak").',
    ],
    explanation:
      'AND mengembalikan TRUE hanya kalau semua syaratnya TRUE. Dengan membungkusnya di dalam IF, kamu bisa menentukan hasil berdasarkan beberapa kondisi sekaligus. OR memakai pola yang sama untuk "salah satu cukup".',
  },
  {
    slug: 'fungsi-sumif',
    kind: 'latihan',
    title: 'Fungsi SUMIF',
    category: 'Statistik & Agregasi',
    emoji: '📊',
    level: 'Sedang',
    story:
      'Kafe kecil milik Mas Bayu menjual minuman dan makanan. Dia mau tahu berapa kontribusi masing-masing kategori terhadap omzet minggu ini.',
    task: 'Isi C9 dan C10 dengan total penjualan untuk kategori di kolom A masing-masing barisnya.',
    note: 'Kriteria boleh diketik langsung sebagai teks, atau merujuk ke sel yang berisi nama kategori.',
    rows: [
      ['Produk', 'Kategori', 'Terjual (Rp)'],
      ['Kopi susu', 'Minuman', '420000'],
      ['Roti bakar', 'Makanan', '310000'],
      ['Teh tarik', 'Minuman', '280000'],
      ['Nasi goreng', 'Makanan', '560000'],
      ['Jus alpukat', 'Minuman', '350000'],
      ['Mie ayam', 'Makanan', '390000'],
      ['Rekap kategori', '', 'Total (Rp)'],
      ['Minuman', '', ''],
      ['Makanan', '', ''],
    ],
    solution: { C9: '=SUMIF($B$2:$B$7,A9,$C$2:$C$7)', C10: '=SUMIF($B$2:$B$7,A10,$C$2:$C$7)' },
    required: { C9: ['SUMIF'], C10: ['SUMIF'] },
    vary: ['C2:C7'],
    hints: [
      'Kamu perlu menjumlahkan hanya baris yang kategorinya cocok. Ada fungsi SUM yang bisa diberi syarat.',
      'SUMIF(rentang_kriteria, kriteria, rentang_jumlah). Rentang kriteria di kolom B, rentang jumlah di kolom C.',
      'Contoh untuk Minuman: =SUMIF(B2:B7,"Minuman",C2:C7).',
    ],
    explanation:
      'SUMIF memeriksa tiap sel di rentang kriteria, lalu menjumlahkan sel pasangannya di rentang jumlah hanya untuk yang cocok. Tanda $ mengunci rentang supaya tidak bergeser saat formula disalin ke bawah.',
  },
  {
    slug: 'fungsi-countif',
    kind: 'latihan',
    title: 'Fungsi COUNTIF',
    category: 'Statistik & Agregasi',
    emoji: '📊',
    level: 'Sedang',
    story:
      'Komunitas pelari ingin tahu dari mana saja anggotanya berasal supaya bisa menentukan lokasi lari bersama berikutnya.',
    task: 'Isi B8 dengan jumlah anggota dari Semarang dan B9 dengan jumlah anggota yang bukan dari Semarang.',
    rows: [
      ['Anggota', 'Kota'],
      ['Andi', 'Semarang'],
      ['Budi', 'Yogyakarta'],
      ['Citra', 'Semarang'],
      ['Dian', 'Solo'],
      ['Eka', 'Semarang'],
      ['Fajar', 'Yogyakarta'],
      ['Dari Semarang', ''],
      ['Bukan dari Semarang', ''],
    ],
    solution: { B8: '=COUNTIF(B2:B7,"Semarang")', B9: '=COUNTIF(B2:B7,"<>Semarang")' },
    required: { B8: ['COUNTIF'], B9: ['COUNTIF'] },
    hints: [
      'Kamu butuh fungsi yang menghitung sel berdasarkan satu syarat.',
      'COUNTIF(rentang, kriteria). Untuk "bukan sama dengan", awali kriteria dengan <>.',
      'B8: =COUNTIF(B2:B7,"Semarang"). B9: =COUNTIF(B2:B7,"<>Semarang").',
    ],
    explanation:
      'COUNTIF menghitung berapa sel di rentang yang memenuhi kriteria. Operator seperti <>, >, dan <= ditulis di dalam teks kriteria, tepat sebelum nilainya.',
  },
  {
    slug: 'fungsi-sumifs',
    kind: 'latihan',
    title: 'Fungsi SUMIFS',
    category: 'Statistik & Agregasi',
    emoji: '📊',
    level: 'Sulit',
    story:
      'Jaringan toko elektronik dan fashion punya dua cabang. Manajer regional ingin angka yang lebih spesifik daripada total per cabang atau total per kategori saja.',
    task: 'Isi C11 dengan total penjualan Elektronik di cabang Utara, dan C12 dengan total penjualan Fashion di cabang Selatan.',
    rows: [
      ['Cabang', 'Kategori', 'Penjualan (Rp)'],
      ['Utara', 'Elektronik', '24000000'],
      ['Utara', 'Fashion', '11000000'],
      ['Selatan', 'Elektronik', '19000000'],
      ['Utara', 'Elektronik', '15500000'],
      ['Selatan', 'Fashion', '9800000'],
      ['Selatan', 'Elektronik', '12400000'],
      ['Utara', 'Fashion', '8600000'],
      ['Selatan', 'Fashion', '7300000'],
      ['Rekap gabungan', '', 'Total (Rp)'],
      ['Utara + Elektronik', '', ''],
      ['Selatan + Fashion', '', ''],
    ],
    solution: {
      C11: '=SUMIFS(C2:C9,A2:A9,"Utara",B2:B9,"Elektronik")',
      C12: '=SUMIFS(C2:C9,A2:A9,"Selatan",B2:B9,"Fashion")',
    },
    required: { C11: ['SUMIFS'], C12: ['SUMIFS'] },
    vary: ['C2:C9'],
    hints: [
      'SUMIF hanya mengenal satu syarat. Ada saudaranya yang bisa menerima banyak syarat.',
      'SUMIFS(rentang_jumlah, rentang_kriteria1, kriteria1, rentang_kriteria2, kriteria2). Rentang jumlah ditulis lebih dulu.',
      'Contoh: =SUMIFS(C2:C9,A2:A9,"Utara",B2:B9,"Elektronik").',
    ],
    explanation:
      'SUMIFS menjumlahkan sel di rentang jumlah hanya untuk baris yang memenuhi semua pasangan rentang dan kriteria. Perhatikan urutannya terbalik dari SUMIF: rentang jumlah ada di depan.',
  },
  {
    slug: 'fungsi-round',
    kind: 'latihan',
    title: 'Fungsi ROUND',
    category: 'Matematika',
    emoji: '➗',
    level: 'Sedang',
    story:
      'Toko alat tulis menghitung PPN untuk tiap barang di struk. Hasil perkalian sering berkoma, sedangkan nominal di struk harus rupiah penuh.',
    task: 'Isi C2:C5 dengan PPN tiap barang (harga dikali tarif di B6), dibulatkan ke rupiah terdekat.',
    note: 'Tarif di sheet ini hanya contoh latihan.',
    rows: [
      ['Barang', 'Harga (Rp)', 'PPN (Rp)'],
      ['Buku tulis', '12750', ''],
      ['Pensil', '4250', ''],
      ['Tinta printer', '86500', ''],
      ['Kertas HVS', '54900', ''],
      ['Tarif PPN (contoh)', '0.11', ''],
    ],
    solution: fill('C', 2, 5, (r) => `=ROUND(B${r}*$B$6,0)`),
    required: need(['C2', 'C3', 'C4', 'C5'], ['ROUND']),
    vary: ['B2:B5'],
    hints: [
      'Perkalian harga dan tarif akan menghasilkan desimal. Kamu butuh fungsi pembulatan.',
      'ROUND(angka, jumlah_desimal). Rupiah penuh berarti nol desimal. Kunci sel tarif dengan $B$6.',
      'Di C2: =ROUND(B2*$B$6,0).',
    ],
    explanation:
      'ROUND(x, 0) membulatkan ke bilangan bulat terdekat, dan setengah dibulatkan menjauhi nol. Tanda $ pada $B$6 membuat referensi tarif tidak bergeser ketika rumus disalin ke baris lain.',
  },
  {
    slug: 'fungsi-iferror',
    kind: 'latihan',
    title: 'Fungsi IFERROR',
    category: 'Logika',
    emoji: '🧠',
    level: 'Sedang',
    story:
      'Tim marketing menghitung rasio pembeli terhadap pengunjung untuk tiap toko. Dua toko baru belum punya pengunjung, dan pembagian dengan nol membuat laporan penuh tulisan error.',
    task: 'Isi D2:D5 dengan persentase pembeli dari pengunjung (pembeli dibagi pengunjung dikali 100). Kalau terjadi error, tampilkan 0.',
    rows: [
      ['Toko', 'Pengunjung', 'Pembeli', 'Konversi (%)'],
      ['Toko A', '250', '20', ''],
      ['Toko B', '0', '0', ''],
      ['Toko C', '410', '33', ''],
      ['Toko D', '0', '0', ''],
    ],
    solution: fill('D', 2, 5, (r) => `=IFERROR(C${r}/B${r}*100,0)`),
    required: need(['D2', 'D3', 'D4', 'D5'], ['IFERROR']),
    vary: ['B2:C2', 'B4:C4'],
    hints: [
      'Pembagian dengan nol menghasilkan #DIV/0!. Cari fungsi yang bisa menggantikan error dengan nilai lain.',
      'IFERROR(ekspresi, nilai_jika_error). Ekspresi pertamanya adalah pembagian tadi dikali 100.',
      'Di D2: =IFERROR(C2/B2*100,0).',
    ],
    explanation:
      'IFERROR menjalankan ekspresi pertama. Kalau hasilnya error apa pun, dia mengembalikan nilai cadangan. Hati-hati: IFERROR juga menyembunyikan error yang sebenarnya perlu kamu perbaiki, jadi pakai hanya saat kamu tahu penyebabnya.',
  },
  {
    slug: 'fungsi-teks',
    kind: 'latihan',
    title: 'Fungsi LEFT dan UPPER',
    category: 'Teks',
    emoji: '✍️',
    level: 'Sedang',
    story:
      'Panitia orientasi membuat kode peserta dari tiga huruf pertama nama depan, huruf kapital, lalu tanda hubung dan tahun masuk.',
    task: 'Isi C2:C5 dengan kode peserta, contohnya RAN-2024 untuk Rani yang masuk tahun 2024.',
    rows: [
      ['Nama depan', 'Tahun masuk', 'Kode'],
      ['Rani', '2024', ''],
      ['Galih', '2023', ''],
      ['Wulan', '2025', ''],
      ['Yoga', '2022', ''],
    ],
    solution: fill('C', 2, 5, (r) => `=UPPER(LEFT(A${r},3))&"-"&B${r}`),
    required: need(['C2', 'C3', 'C4', 'C5'], ['UPPER', 'LEFT']),
    vary: ['B2:B5'],
    hints: [
      'Ada tiga pekerjaan: ambil tiga huruf, jadikan kapital, lalu sambung dengan teks lain.',
      'LEFT(teks, n) mengambil n huruf dari kiri. UPPER mengubah ke kapital. Operator & menyambung teks.',
      'Di C2: =UPPER(LEFT(A2,3))&"-"&B2.',
    ],
    explanation:
      'Fungsi teks bisa dibungkus bertingkat: LEFT mengambil tiga huruf, UPPER membesarkannya, lalu & menyambungkan hasilnya dengan tanda hubung dan tahun.',
  },
  {
    slug: 'fungsi-vlookup',
    kind: 'latihan',
    title: 'Fungsi VLOOKUP',
    category: 'Pencarian Data',
    emoji: '🔎',
    level: 'Sedang',
    story:
      'Toko perlengkapan sekolah punya daftar harga di sebelah kiri dan daftar pesanan di sebelah kanan. Harga satuan tiap pesanan harus diambil dari daftar harga berdasarkan kode barang.',
    task: 'Isi F2:F5 dengan harga satuan sesuai kode pesanan di kolom E.',
    rows: [
      ['Kode', 'Nama barang', 'Harga (Rp)', '', 'Kode pesanan', 'Harga satuan'],
      ['K-01', 'Spidol', '7500', '', 'K-03', ''],
      ['K-02', 'Penghapus', '3000', '', 'K-01', ''],
      ['K-03', 'Buku gambar', '18000', '', 'K-02', ''],
      ['K-04', 'Penggaris', '5500', '', 'K-04', ''],
    ],
    solution: fill('F', 2, 5, (r) => `=VLOOKUP(E${r},$A$2:$C$5,3,FALSE)`),
    required: need(['F2', 'F3', 'F4', 'F5'], ['VLOOKUP']),
    vary: ['C2:C5'],
    hints: [
      'Kamu mencari sebuah kode di kolom paling kiri sebuah tabel, lalu mengambil nilai di kolom lain pada baris yang sama.',
      'VLOOKUP(dicari, tabel, nomor_kolom, FALSE). Pakai FALSE agar pencarian harus cocok persis.',
      'Di F2: =VLOOKUP(E2,$A$2:$C$5,3,FALSE). Harga ada di kolom ketiga tabel.',
    ],
    explanation:
      'VLOOKUP mencari nilai di kolom pertama tabel, lalu mengembalikan isi kolom ke-n pada baris yang cocok. Argumen terakhir FALSE memastikan hanya kecocokan persis yang diterima.',
  },
  {
    slug: 'fungsi-index-match',
    kind: 'latihan',
    title: 'INDEX dan MATCH',
    category: 'Pencarian Data',
    emoji: '🔎',
    level: 'Sulit',
    story:
      'Bagian HR menyimpan nama karyawan di kolom pertama dan ID di kolom kedua. Sekarang mereka punya daftar ID dan butuh namanya, padahal nama ada di sebelah kiri ID.',
    task: 'Isi E2:E5 dengan nama karyawan sesuai ID di kolom D.',
    note: 'VLOOKUP tidak bisa mengambil data dari kolom di sebelah kiri kolom pencarian. Cari kombinasi dua fungsi yang bisa.',
    rows: [
      ['Karyawan', 'ID', '', 'ID dicari', 'Nama karyawan'],
      ['Ayu Lestari', 'E-102', '', 'E-104', ''],
      ['Bima Pratama', 'E-103', '', 'E-102', ''],
      ['Cahya Wibowo', 'E-104', '', 'E-105', ''],
      ['Dina Maharani', 'E-105', '', 'E-103', ''],
    ],
    solution: fill('E', 2, 5, (r) => `=INDEX($A$2:$A$5,MATCH(D${r},$B$2:$B$5,0))`),
    required: need(['E2', 'E3', 'E4', 'E5'], ['INDEX', 'MATCH']),
    hints: [
      'Pecah jadi dua langkah: cari posisi ID di kolom ID, lalu ambil nama pada posisi yang sama dari kolom nama.',
      'MATCH(dicari, rentang, 0) memberi nomor urut. INDEX(rentang, nomor) mengambil isi pada nomor itu.',
      'Di E2: =INDEX($A$2:$A$5,MATCH(D2,$B$2:$B$5,0)).',
    ],
    explanation:
      'MATCH mencari posisi sebuah nilai di satu kolom. INDEX mengambil isi kolom lain pada posisi tersebut. Karena kedua kolom bebas dipilih, kombinasi ini bisa mencari ke kiri maupun ke kanan.',
  },

  // ---------------- TANTANGAN KASUS NYATA ----------------
  {
    slug: 'kasus-pph22-pembelian',
    kind: 'tantangan',
    title: 'Hitung PPN dan PPh 22 atas Pembelian',
    category: 'Pajak',
    emoji: '🧾',
    level: 'Sedang',
    xp: 25,
    story:
      'Bagian keuangan sebuah CV membayar empat rekanan untuk pembelian barang. Untuk tiap faktur, dia harus menghitung PPN yang dipungut, PPh Pasal 22 yang dipotong, dan uang yang benar-benar ditransfer ke rekanan.',
    task:
      'Isi PPN (kolom C) = DPP × tarif PPN, PPh 22 (kolom D) = DPP × tarif PPh 22, keduanya dibulatkan ke rupiah penuh. Dibayar (kolom E) = DPP + PPN − PPh 22. Lalu isi E8 dengan total yang dibayarkan.',
    note: 'Tarif di sheet ini hanya contoh untuk latihan. Untuk pekerjaan nyata, cek tarif dan ketentuan yang berlaku.',
    rows: [
      ['Rekanan', 'DPP (Rp)', 'PPN (Rp)', 'PPh 22 (Rp)', 'Dibayar (Rp)'],
      ['PT Mitra Jaya', '25000000', '', '', ''],
      ['CV Karya Utama', '8400000', '', '', ''],
      ['UD Sumber Rejeki', '12750000', '', '', ''],
      ['PT Cahaya Baru', '40000000', '', '', ''],
      ['Tarif PPN (contoh)', '0.11', '', '', ''],
      ['Tarif PPh 22 (contoh)', '0.015', '', '', ''],
      ['Total dibayarkan', '', '', '', ''],
    ],
    solution: {
      ...fill('C', 2, 5, (r) => `=ROUND(B${r}*$B$6,0)`),
      ...fill('D', 2, 5, (r) => `=ROUND(B${r}*$B$7,0)`),
      ...fill('E', 2, 5, (r) => `=B${r}+C${r}-D${r}`),
      E8: '=SUM(E2:E5)',
    },
    required: {
      ...need(['C2', 'C3', 'C4', 'C5', 'D2', 'D3', 'D4', 'D5'], ['ROUND']),
      ...need(['E2', 'E3', 'E4', 'E5'], []),
      E8: ['SUM'],
    },
    vary: ['B2:B5'],
    hints: [
      'Kerjakan per kolom: PPN dulu, lalu PPh 22, lalu jumlah yang dibayar. Tarifnya ada di sel B6 dan B7, jangan diketik ulang di formula.',
      'Kunci sel tarif dengan tanda $ supaya formula bisa disalin ke bawah, misalnya $B$6.',
      'C2: =ROUND(B2*$B$6,0). D2: =ROUND(B2*$B$7,0). E2: =B2+C2-D2. E8: =SUM(E2:E5).',
    ],
    explanation:
      'PPN ditambahkan ke tagihan, sedangkan PPh 22 dipotong dari pembayaran sehingga rekanan menerima DPP + PPN − PPh 22. Memisahkan tarif ke sel sendiri membuat perubahan tarif cukup dilakukan di satu tempat.',
  },
  {
    slug: 'kasus-penyusutan',
    kind: 'tantangan',
    title: 'Penyusutan Aset Tetap Garis Lurus',
    category: 'Akuntansi',
    emoji: '📒',
    level: 'Sedang',
    xp: 25,
    story:
      'Akuntan sebuah usaha jasa mencatat tiga aset tetap. Untuk laporan posisi keuangan, dia perlu penyusutan per tahun, akumulasi penyusutan sampai saat ini, dan nilai buku masing-masing aset.',
    task:
      'Hitung Penyusutan per tahun (E) = (harga perolehan − nilai residu) ÷ umur manfaat. Akumulasi (F) = penyusutan per tahun × lama dipakai di B5. Nilai buku (G) = harga perolehan − akumulasi. Isi G6 dengan total nilai buku.',
    rows: [
      ['Aset', 'Harga perolehan (Rp)', 'Nilai residu (Rp)', 'Umur manfaat (tahun)', 'Penyusutan/tahun (Rp)', 'Akumulasi (Rp)', 'Nilai buku (Rp)'],
      ['Laptop kantor', '15000000', '1500000', '4', '', '', ''],
      ['Mesin jahit', '9000000', '900000', '5', '', '', ''],
      ['Motor operasional', '24000000', '4000000', '8', '', '', ''],
      ['Lama dipakai (tahun)', '2', '', '', '', '', ''],
      ['Total nilai buku', '', '', '', '', '', ''],
    ],
    solution: {
      ...fill('E', 2, 4, (r) => `=(B${r}-C${r})/D${r}`),
      ...fill('F', 2, 4, (r) => `=E${r}*$B$5`),
      ...fill('G', 2, 4, (r) => `=B${r}-F${r}`),
      G6: '=SUM(G2:G4)',
    },
    required: {
      ...need(['E2', 'E3', 'E4', 'F2', 'F3', 'F4', 'G2', 'G3', 'G4'], []),
      G6: ['SUM'],
    },
    vary: ['B2:D4'],
    hints: [
      'Yang disusutkan adalah selisih harga perolehan dan nilai residu, bukan harga perolehannya saja.',
      'Lama dipakai ada di B5. Kunci dengan $B$5 supaya formula F bisa disalin ke bawah.',
      'E2: =(B2-C2)/D2. F2: =E2*$B$5. G2: =B2-F2. G6: =SUM(G2:G4).',
    ],
    explanation:
      'Metode garis lurus membagi jumlah yang disusutkan secara merata sepanjang umur manfaat. Nilai buku adalah harga perolehan dikurangi akumulasi penyusutan sampai saat laporan dibuat.',
  },
  {
    slug: 'kasus-gaji-lembur',
    kind: 'tantangan',
    title: 'Slip Gaji dengan Upah Lembur',
    category: 'Payroll',
    emoji: '💼',
    level: 'Sedang',
    xp: 25,
    story:
      'Admin personalia sebuah pabrik kecil menyiapkan gaji bulanan. Beberapa karyawan lembur, dan upah lembur dihitung dari upah per jam dikalikan faktor lembur.',
    task:
      'Upah lembur (D) = jam lembur × (gaji pokok ÷ 173) × faktor di B6, dibulatkan ke rupiah. Total gaji (E) = gaji pokok + upah lembur. Isi E7 dengan total seluruh gaji dan E8 dengan gaji tertinggi.',
    note: 'Faktor lembur di sheet ini hanya contoh latihan.',
    rows: [
      ['Karyawan', 'Gaji pokok (Rp)', 'Jam lembur', 'Upah lembur (Rp)', 'Total gaji (Rp)'],
      ['Ayu', '4800000', '6', '', ''],
      ['Bagas', '5200000', '0', '', ''],
      ['Citra', '4500000', '10', '', ''],
      ['Dion', '6100000', '4', '', ''],
      ['Faktor lembur (contoh)', '1.5', '', '', ''],
      ['Total gaji dibayarkan', '', '', '', ''],
      ['Gaji tertinggi', '', '', '', ''],
    ],
    solution: {
      ...fill('D', 2, 5, (r) => `=ROUND(C${r}*(B${r}/173)*$B$6,0)`),
      ...fill('E', 2, 5, (r) => `=B${r}+D${r}`),
      E7: '=SUM(E2:E5)',
      E8: '=MAX(E2:E5)',
    },
    required: {
      ...need(['D2', 'D3', 'D4', 'D5'], ['ROUND']),
      ...need(['E2', 'E3', 'E4', 'E5'], []),
      E7: ['SUM'],
      E8: ['MAX'],
    },
    vary: ['B2:C5'],
    hints: [
      'Mulai dari upah per jam: gaji pokok dibagi 173. Kalikan jam lembur dan faktor, lalu bulatkan.',
      'Faktor lembur ada di B6, kunci dengan $B$6. Total gaji hanya penjumlahan dua sel di baris yang sama.',
      'D2: =ROUND(C2*(B2/173)*$B$6,0). E2: =B2+D2. E7: =SUM(E2:E5). E8: =MAX(E2:E5).',
    ],
    explanation:
      'Pembagi 173 adalah angka yang lazim dipakai untuk mengubah upah bulanan menjadi upah per jam. Faktor lembur disimpan di sel sendiri supaya aturannya bisa diubah tanpa menyentuh rumus.',
  },
  {
    slug: 'kasus-laba-rugi',
    kind: 'tantangan',
    title: 'Ringkasan Laba Rugi dari Daftar Akun',
    category: 'Akuntansi',
    emoji: '📒',
    level: 'Sulit',
    xp: 30,
    story:
      'Pemilik usaha mengirim daftar saldo akun bulan ini dan minta ringkasan laba rugi satu halaman. Akun pendapatan dan beban tercampur dalam satu tabel, jadi kamu harus memisahkannya berdasarkan kolom jenis.',
    task:
      'Isi C10 dengan total pendapatan, C11 dengan total beban, C12 dengan laba bersih (pendapatan − beban), dan C13 dengan margin laba (laba bersih ÷ pendapatan) dibulatkan 4 desimal.',
    rows: [
      ['Akun', 'Jenis', 'Saldo (Rp)'],
      ['Penjualan barang', 'Pendapatan', '85000000'],
      ['Pendapatan jasa', 'Pendapatan', '12500000'],
      ['Harga pokok penjualan', 'Beban', '52000000'],
      ['Beban gaji', 'Beban', '18000000'],
      ['Beban sewa', 'Beban', '6000000'],
      ['Beban listrik dan air', 'Beban', '2400000'],
      ['Pendapatan bunga', 'Pendapatan', '800000'],
      ['Ringkasan', '', ''],
      ['Total pendapatan', '', ''],
      ['Total beban', '', ''],
      ['Laba bersih', '', ''],
      ['Margin laba (rasio)', '', ''],
    ],
    solution: {
      C10: '=SUMIF($B$2:$B$8,"Pendapatan",$C$2:$C$8)',
      C11: '=SUMIF($B$2:$B$8,"Beban",$C$2:$C$8)',
      C12: '=C10-C11',
      C13: '=ROUND(C12/C10,4)',
    },
    required: { C10: ['SUMIF'], C11: ['SUMIF'], C12: [], C13: ['ROUND'] },
    vary: ['C2:C8'],
    hints: [
      'Total pendapatan dan total beban sama-sama jumlah bersyarat, hanya kriterianya yang beda.',
      'Laba bersih bisa merujuk ke dua sel hasil di atasnya. Margin adalah laba dibagi pendapatan.',
      'C10: =SUMIF(B2:B8,"Pendapatan",C2:C8). C11 sama dengan "Beban". C12: =C10-C11. C13: =ROUND(C12/C10,4).',
    ],
    explanation:
      'SUMIF memisahkan akun berdasarkan jenisnya tanpa harus mengurutkan data. Laba dan margin cukup merujuk sel hasil sebelumnya, jadi angkanya otomatis ikut berubah kalau saldo akun diperbarui.',
  },
  {
    slug: 'kasus-funnel-beasiswa',
    kind: 'tantangan',
    title: 'Konversi per Tahap Pendaftaran Beasiswa',
    category: 'Marketing',
    emoji: '📈',
    level: 'Sedang',
    xp: 25,
    story:
      'Panitia beasiswa ingin tahu di tahap mana calon pendaftar paling banyak berhenti: dari membuka laman, mengisi formulir, mengunggah berkas, sampai lolos seleksi.',
    task:
      'Isi C3:C5 dengan persentase yang lanjut dari tahap sebelumnya, dibulatkan 1 desimal. Isi C6 dengan konversi keseluruhan dari tahap pertama ke terakhir, dibulatkan 2 desimal.',
    note: 'Tahap pertama tidak punya tahap sebelumnya, jadi C2 dibiarkan kosong.',
    rows: [
      ['Tahap', 'Jumlah orang', 'Lanjut dari tahap sebelumnya (%)'],
      ['Membuka laman', '12000', ''],
      ['Mengisi formulir', '2400', ''],
      ['Mengunggah berkas', '1200', ''],
      ['Lolos seleksi', '300', ''],
      ['Konversi keseluruhan (%)', '', ''],
    ],
    solution: {
      ...fill('C', 3, 5, (r) => `=ROUND(B${r}/B${r - 1}*100,1)`),
      C6: '=ROUND(B5/B2*100,2)',
    },
    required: need(['C3', 'C4', 'C5', 'C6'], ['ROUND']),
    vary: ['B2:B5'],
    hints: [
      'Tiap tahap dibandingkan dengan tahap tepat di atasnya, bukan dengan tahap pertama.',
      'Konversi keseluruhan membagi jumlah tahap terakhir dengan jumlah tahap pertama.',
      'C3: =ROUND(B3/B2*100,1). C6: =ROUND(B5/B2*100,2).',
    ],
    explanation:
      'Konversi antar tahap menunjukkan di mana orang paling banyak berhenti. Konversi keseluruhan adalah hasil kali semua konversi antar tahap, sehingga angkanya selalu lebih kecil dari tiap angka tahapnya.',
  },
  {
    slug: 'kasus-diskon-bertingkat',
    kind: 'tantangan',
    title: 'Diskon Bertingkat Toko Bangunan',
    category: 'Penjualan & UMKM',
    emoji: '🛒',
    level: 'Sulit',
    xp: 30,
    story:
      'Toko bangunan memberi diskon berdasarkan besar pesanan. Kasir selama ini menghitungnya di kalkulator dan sering keliru kalau ada banyak pesanan.',
    task:
      'Isi Diskon (C): 10% dari subtotal jika subtotal minimal 5000000, 5% jika minimal 2000000, selain itu 0. Isi Total (D) = subtotal − diskon.',
    rows: [
      ['Pesanan', 'Subtotal (Rp)', 'Diskon (Rp)', 'Total (Rp)'],
      ['P-001', '1800000', '', ''],
      ['P-002', '4500000', '', ''],
      ['P-003', '9200000', '', ''],
      ['P-004', '650000', '', ''],
    ],
    solution: {
      ...fill('C', 2, 5, (r) => `=IF(B${r}>=5000000,B${r}*0.1,IF(B${r}>=2000000,B${r}*0.05,0))`),
      ...fill('D', 2, 5, (r) => `=B${r}-C${r}`),
    },
    required: {
      ...need(['C2', 'C3', 'C4', 'C5'], ['IF']),
      ...need(['D2', 'D3', 'D4', 'D5'], []),
    },
    vary: ['B2:B5'],
    hints: [
      'Ada tiga kemungkinan hasil, tapi IF hanya memilih satu dari dua. Taruh IF di dalam IF.',
      'Periksa batas yang paling tinggi lebih dulu. Kalau tidak memenuhi, baru periksa batas di bawahnya.',
      'C2: =IF(B2>=5000000,B2*0.1,IF(B2>=2000000,B2*0.05,0)). D2: =B2-C2.',
    ],
    explanation:
      'IF bertingkat memeriksa syarat berurutan dari atas. Kalau batas tertinggi diperiksa belakangan, pesanan besar akan salah masuk ke tingkat diskon yang lebih kecil.',
  },
];

export const EXERCISES: Exercise[] = DEFS.map(build);

export function getExercise(slug: string): Exercise | undefined {
  return EXERCISES.find((e) => e.slug === slug);
}

export function exercisesByKind(kind: Kind): Exercise[] {
  return EXERCISES.filter((e) => e.kind === kind);
}

export function neighbors(slug: string): { prev?: string; next?: string } {
  const ex = getExercise(slug);
  if (!ex) return {};
  const list = exercisesByKind(ex.kind);
  const i = list.findIndex((e) => e.slug === slug);
  return { prev: list[i - 1]?.slug, next: list[i + 1]?.slug };
}

export function exercisesForFunction(fn: string): Exercise[] {
  const f = fn.toUpperCase();
  return EXERCISES.filter((e) => e.fns.includes(f));
}
