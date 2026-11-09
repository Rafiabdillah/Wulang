// Kursus Wulang: urutan bacaan, latihan, dan kuis. Semua teks ditulis sendiri.

export type Step =
  | { type: 'bacaan'; title: string; body: string[] }
  | { type: 'latihan'; slug: string }
  | { type: 'kuis'; id: string; question: string; options: string[]; answer: number; explain: string };

export interface Course {
  slug: string;
  title: string;
  level: 'Pemula' | 'Menengah' | 'Lanjut';
  emoji: string;
  blurb: string;
  steps: Step[];
}

export const COURSES: Course[] = [
  {
    slug: 'spreadsheet-101',
    title: 'Spreadsheet 101: Dari Sel Pertama',
    level: 'Pemula',
    emoji: '🌱',
    blurb: 'Sel, formula, dan lima fungsi dasar yang dipakai hampir setiap hari.',
    steps: [
      {
        type: 'bacaan',
        title: 'Sel dan formula',
        body: [
          'Spreadsheet adalah tabel besar. Tiap kotak disebut sel dan punya alamat: huruf kolom lalu nomor baris, misalnya B3.',
          'Sel bisa berisi angka, teks, atau formula. Formula selalu diawali tanda =. Dengan formula, hasilnya ikut berubah saat data yang dirujuk berubah. Itu bedanya dengan mengetik angka hasil hitungan sendiri.',
          'Rentang ditulis dengan titik dua: B2:B6 berarti semua sel dari B2 sampai B6.',
        ],
      },
      {
        type: 'kuis',
        id: 'k101-1',
        question: 'Apa yang membuat isi sel dibaca sebagai formula?',
        options: ['Diawali tanda =', 'Ditulis dengan huruf kapital', 'Berisi angka', 'Diakhiri titik koma'],
        answer: 0,
        explain: 'Tanda = di awal memberi tahu spreadsheet bahwa isi sel harus dihitung.',
      },
      { type: 'latihan', slug: 'fungsi-sum' },
      { type: 'latihan', slug: 'fungsi-average' },
      { type: 'latihan', slug: 'fungsi-max-min' },
      {
        type: 'bacaan',
        title: 'Angka atau sekadar terisi?',
        body: [
          'COUNT hanya menghitung sel yang berisi angka. COUNTA menghitung semua sel yang tidak kosong, termasuk teks. Pilih sesuai pertanyaannya: berapa nilai yang terkumpul, atau berapa sel yang sudah diisi.',
        ],
      },
      { type: 'latihan', slug: 'fungsi-count' },
      {
        type: 'kuis',
        id: 'k101-2',
        question: 'Kolom berisi 3 angka, 2 teks, dan 1 sel kosong. Berapa hasil COUNTA untuk keenam sel itu?',
        options: ['3', '5', '6', '2'],
        answer: 1,
        explain: 'COUNTA menghitung sel yang tidak kosong: 3 angka ditambah 2 teks sama dengan 5.',
      },
      { type: 'latihan', slug: 'fungsi-round' },
    ],
  },
  {
    slug: 'logika-if',
    title: 'Logika IF dan Kondisi',
    level: 'Pemula',
    emoji: '🔀',
    blurb: 'Membuat spreadsheet mengambil keputusan: IF, AND, IFERROR, dan IF bertingkat.',
    steps: [
      {
        type: 'bacaan',
        title: 'Satu syarat, dua hasil',
        body: [
          'IF memeriksa sebuah syarat. Kalau benar, ia mengembalikan hasil pertama. Kalau salah, hasil kedua. Bentuknya IF(syarat, jika_benar, jika_salah).',
          'Syarat ditulis dengan pembanding seperti >, <, >=, <=, =, dan <>. Teks di dalam formula diapit tanda kutip.',
        ],
      },
      { type: 'latihan', slug: 'fungsi-if' },
      {
        type: 'kuis',
        id: 'kif-1',
        question: 'Fungsi AND mengembalikan TRUE kalau...',
        options: ['Minimal satu syarat benar', 'Semua syarat benar', 'Semua syarat salah', 'Syarat pertama benar'],
        answer: 1,
        explain: 'AND baru TRUE kalau tidak ada satu pun syarat yang salah. Kalau cukup satu yang benar, pakai OR.',
      },
      { type: 'latihan', slug: 'fungsi-and' },
      { type: 'latihan', slug: 'fungsi-iferror' },
      {
        type: 'bacaan',
        title: 'IF bertingkat',
        body: [
          'Untuk lebih dari dua kemungkinan, IF diletakkan di dalam IF. Spreadsheet memeriksa dari yang paling luar. Begitu ada syarat yang cocok, pemeriksaan berhenti.',
          'Karena itu urutan penting. Periksa batas yang paling tinggi lebih dulu, lalu turun ke batas di bawahnya.',
        ],
      },
      {
        type: 'kuis',
        id: 'kif-2',
        question: 'Diskon 10% untuk belanja minimal 5 juta, 5% untuk minimal 2 juta. Mana yang diperiksa lebih dulu di IF bertingkat?',
        options: ['Minimal 2 juta', 'Minimal 5 juta', 'Bebas, hasilnya sama', 'Belanja di bawah 2 juta'],
        answer: 1,
        explain: 'Kalau 2 juta diperiksa dulu, belanja 6 juta ikut lolos di situ dan hanya dapat 5%.',
      },
      { type: 'latihan', slug: 'kasus-diskon-bertingkat' },
    ],
  },
  {
    slug: 'rekap-bersyarat',
    title: 'Rekap Bersyarat: SUMIF dan COUNTIF',
    level: 'Menengah',
    emoji: '📊',
    blurb: 'Menjumlahkan dan menghitung hanya baris yang memenuhi syarat.',
    steps: [
      {
        type: 'bacaan',
        title: 'Jumlah dengan syarat',
        body: [
          'SUMIF(rentang_kriteria, kriteria, rentang_jumlah) menjumlahkan sel di rentang_jumlah hanya untuk baris yang kriterianya cocok. COUNTIF mirip, tetapi menghitung banyaknya baris, bukan menjumlahkan.',
          'Kriteria bisa berupa teks ("Minuman"), angka, atau pembanding yang ditulis sebagai teks (">100").',
        ],
      },
      { type: 'latihan', slug: 'fungsi-sumif' },
      { type: 'latihan', slug: 'fungsi-countif' },
      {
        type: 'kuis',
        id: 'krb-1',
        question: 'Apa yang dihitung =COUNTIF(B2:B9,">100")?',
        options: [
          'Jumlah seluruh angka di atas 100',
          'Banyaknya sel yang nilainya lebih dari 100',
          'Rata-rata angka di atas 100',
          'Banyaknya sel yang berisi teks ">100"',
        ],
        answer: 1,
        explain: 'COUNTIF menghitung banyaknya sel yang memenuhi kriteria. Pembandingnya ditulis di dalam tanda kutip.',
      },
      {
        type: 'bacaan',
        title: 'Lebih dari satu syarat',
        body: [
          'SUMIFS dan COUNTIFS menerima banyak pasangan rentang dan kriteria. Semua syarat harus terpenuhi sekaligus.',
          'Hati-hati urutannya. Di SUMIFS, rentang jumlah ditulis paling awal. Di SUMIF, rentang jumlah ada di belakang.',
        ],
      },
      { type: 'latihan', slug: 'fungsi-sumifs' },
      {
        type: 'kuis',
        id: 'krb-2',
        question: 'Di SUMIFS, argumen mana yang ditulis paling pertama?',
        options: ['Kriteria pertama', 'Rentang yang dijumlahkan', 'Rentang kriteria pertama', 'Jumlah syarat'],
        answer: 1,
        explain: 'Pola SUMIFS adalah SUMIFS(rentang_jumlah, rentang_kriteria1, kriteria1, ...).',
      },
    ],
  },
  {
    slug: 'cari-data',
    title: 'Mencari Data dan Mengolah Teks',
    level: 'Menengah',
    emoji: '🔎',
    blurb: 'VLOOKUP, INDEX dengan MATCH, dan merapikan teks.',
    steps: [
      {
        type: 'bacaan',
        title: 'Mencari di tabel',
        body: [
          'VLOOKUP mencari sebuah nilai di kolom paling kiri tabel, lalu mengambil isi kolom ke-n pada baris yang sama. Argumen terakhir FALSE berarti harus cocok persis.',
          'Kunci pencarian sebaiknya unik, misalnya kode barang, bukan nama yang bisa kembar.',
        ],
      },
      { type: 'latihan', slug: 'fungsi-vlookup' },
      {
        type: 'kuis',
        id: 'kcd-1',
        question: 'Apa arti FALSE di argumen terakhir VLOOKUP?',
        options: ['Hasilnya boleh kosong', 'Harus cocok persis', 'Cari nilai terdekat', 'Abaikan huruf besar'],
        answer: 1,
        explain: 'FALSE meminta kecocokan persis. Kalau tidak ketemu, hasilnya #N/A.',
      },
      {
        type: 'bacaan',
        title: 'INDEX dan MATCH',
        body: [
          'MATCH mencari posisi sebuah nilai dalam satu baris atau kolom. INDEX mengambil isi sel pada posisi tertentu. Dipasangkan, keduanya bisa mengambil data dari kolom mana pun, termasuk yang ada di kiri kunci pencarian. Hal itu tidak bisa dilakukan VLOOKUP.',
        ],
      },
      { type: 'latihan', slug: 'fungsi-index-match' },
      { type: 'latihan', slug: 'fungsi-teks' },
    ],
  },
  {
    slug: 'akuntansi-pajak',
    title: 'Spreadsheet untuk Akuntansi dan Pajak',
    level: 'Lanjut',
    emoji: '🧾',
    blurb: 'Kasus kerja: pemotongan PPh 22, penyusutan, gaji lembur, laba rugi, dan lainnya.',
    steps: [
      {
        type: 'bacaan',
        title: 'Tarif di sel sendiri',
        body: [
          'Dalam kasus nyata, tarif, batas, dan angka tetap lainnya ditaruh di sel tersendiri, lalu dirujuk dari formula. Kalau tarif berubah, cukup ubah satu sel.',
          'Saat formula disalin ke baris lain, rujukan ke sel tarif harus dikunci dengan tanda $, misalnya $B$2. Tanpa itu, rujukannya ikut bergeser dan hasilnya salah.',
        ],
      },
      {
        type: 'kuis',
        id: 'kap-1',
        question: 'Apa fungsi tanda $ pada $B$2?',
        options: ['Mengubah format jadi rupiah', 'Mengunci rujukan agar tidak bergeser saat disalin', 'Membulatkan angka', 'Menyembunyikan sel'],
        answer: 1,
        explain: 'Rujukan absolut tetap menunjuk sel yang sama ke mana pun formulanya disalin.',
      },
      { type: 'latihan', slug: 'kasus-pph22-pembelian' },
      { type: 'latihan', slug: 'kasus-penyusutan' },
      { type: 'latihan', slug: 'kasus-gaji-lembur' },
      {
        type: 'kuis',
        id: 'kap-2',
        question: 'Hasil =ROUND(1250.5,0) adalah...',
        options: ['1250', '1251', '1200', '1260'],
        answer: 1,
        explain: 'ROUND membulatkan ke bilangan terdekat. Angka .5 dibulatkan ke atas.',
      },
      { type: 'latihan', slug: 'kasus-laba-rugi' },
      { type: 'latihan', slug: 'kasus-funnel-beasiswa' },
    ],
  },
];

export function getCourse(slug: string): Course | undefined {
  return COURSES.find((c) => c.slug === slug);
}

export function courseExerciseSlugs(c: Course): string[] {
  return c.steps.flatMap((s) => (s.type === 'latihan' ? [s.slug] : []));
}

export function courseQuizIds(c: Course): string[] {
  return c.steps.flatMap((s) => (s.type === 'kuis' ? [s.id] : []));
}
