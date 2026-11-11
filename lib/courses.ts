// Kursus Wulang: urutan bacaan, latihan, dan kuis. Semua teks ditulis sendiri.

import { MODUL_COURSES } from './courses-modul';

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
  {
    slug: 'bisnis-keuangan',
    title: 'Keuangan dan Akuntansi Usaha',
    level: 'Menengah',
    emoji: '💹',
    blurb: 'Titik impas, arus kas, cicilan kredit, rasio keuangan, dan kelayakan investasi dari kasus usaha nyata.',
    steps: [
      {
        type: 'bacaan',
        title: 'Dari angka ke keputusan',
        body: [
          'Pemilik usaha jarang bertanya "berapa hasil rumusnya". Yang ditanyakan adalah keputusan: berapa yang harus terjual supaya tidak rugi, apakah kasnya cukup bulan depan, dan layakkah membeli mesin baru.',
          'Setiap soal di kursus ini berangkat dari pertanyaan seperti itu. Rumusnya hanya alat. Ukuran keberhasilannya adalah kamu bisa menjelaskan arti angkanya.',
        ],
      },
      { type: 'latihan', slug: 'bisnis-titik-impas' },
      {
        type: 'kuis',
        id: 'kbk-1',
        question: 'Margin of safety usaha adalah 40%. Artinya...',
        options: [
          'Penjualan boleh turun sekitar 40% sebelum usaha mulai rugi',
          'Laba usaha sebesar 40% dari penjualan',
          'Biaya tetap sebesar 40% dari penjualan',
          'Usaha harus menaikkan harga 40%',
        ],
        answer: 0,
        explain: 'Margin of safety adalah jarak antara penjualan sekarang dan titik impas, dalam persen dari penjualan.',
      },
      { type: 'latihan', slug: 'bisnis-anggaran-realisasi' },
      { type: 'latihan', slug: 'bisnis-arus-kas' },
      {
        type: 'bacaan',
        title: 'Pinjaman dan tanda minus',
        body: [
          'Fungsi keuangan seperti PMT, FV, dan PV memakai konvensi arus kas: uang yang keluar bertanda minus, uang yang masuk bertanda plus. Pinjaman 50 juta yang kamu terima adalah uang masuk, tetapi cicilannya uang keluar. Karena itu PMT menerima pinjaman bertanda minus supaya cicilan keluar sebagai angka positif yang enak dibaca.',
          'Satuan bunga dan jumlah periode harus sama. Cicilan bulanan berarti bunga tahunan dibagi 12 dan jangka waktu dalam bulan.',
        ],
      },
      { type: 'latihan', slug: 'bisnis-cicilan-kur' },
      { type: 'latihan', slug: 'bisnis-jadwal-angsuran' },
      {
        type: 'kuis',
        id: 'kbk-2',
        question: 'Pada cicilan tetap (anuitas), dari bulan ke bulan bagian pokok dalam cicilan akan...',
        options: ['Tetap sama', 'Makin besar, karena bunga dihitung dari saldo yang makin kecil', 'Makin kecil', 'Hilang di bulan terakhir'],
        answer: 1,
        explain: 'Cicilan tetap, bunga mengecil seiring saldo turun, sehingga sisanya yang menjadi pokok makin besar.',
      },
      { type: 'latihan', slug: 'bisnis-rasio-keuangan' },
      { type: 'latihan', slug: 'bisnis-umur-piutang' },
      { type: 'latihan', slug: 'bisnis-kelayakan-investasi' },
      {
        type: 'kuis',
        id: 'kbk-3',
        question: 'NPV sebuah proyek positif pada tingkat diskon 10%. Kesimpulan yang tepat?',
        options: [
          'Proyek menghasilkan lebih dari 10% per periode, jadi layak dari sisi nilai',
          'Proyek pasti untung tiap bulan',
          'Proyek harus ditolak',
          'IRR proyek lebih kecil dari 10%',
        ],
        answer: 0,
        explain: 'NPV positif berarti imbal hasil proyek melebihi tingkat diskon, dan itu sama dengan IRR yang lebih besar dari 10%.',
      },
      {
        type: 'bacaan',
        title: 'Metode penyusutan dan pembukuan dasar',
        body: [
          'Aset seperti mesin tidak dibebankan sekaligus. Biayanya dibagi ke tahun-tahun pemakaian lewat penyusutan. Garis lurus membagi rata, sedangkan saldo menurun ganda dan jumlah angka tahun membebankan lebih besar di awal.',
          'Di sisi pembukuan, setiap transaksi dicatat dua sisi: debit dan kredit yang sama besar. Neraca saldo adalah ringkasan total debit dan kredit tiap akun, dan alat cek pertama sebelum laporan keuangan disusun.',
        ],
      },
      { type: 'latihan', slug: 'bisnis-penyusutan-metode' },
      {
        type: 'kuis',
        id: 'kbk-4',
        question: 'Mesin disusutkan dengan metode garis lurus, saldo menurun ganda, dan jumlah angka tahun selama seluruh umur ekonomisnya. Bagaimana total beban ketiga metode itu?',
        options: [
          'Sama, yaitu harga perolehan dikurangi nilai sisa',
          'Saldo menurun ganda paling besar',
          'Garis lurus paling kecil',
          'Berbeda tergantung metodenya',
        ],
        answer: 0,
        explain: 'Metode hanya mengatur kapan beban diakui. Jumlah yang disusutkan selama umur ekonomis tetap harga perolehan dikurangi nilai sisa.',
      },
      { type: 'latihan', slug: 'bisnis-neraca-saldo' },
      {
        type: 'kuis',
        id: 'kbk-5',
        question: 'Total debit dan total kredit di neraca saldo tidak sama. Kesimpulan yang tepat?',
        options: [
          'Ada kesalahan pencatatan yang harus dicari',
          'Usaha sedang rugi',
          'Kas perusahaan habis',
          'Laporan boleh tetap disusun',
        ],
        answer: 0,
        explain: 'Setiap transaksi memiliki debit dan kredit yang sama besar. Selisih berarti ada transaksi yang salah catat atau tidak lengkap. Rugi atau untung tidak terlihat dari sini.',
      },
      { type: 'latihan', slug: 'bisnis-lama-pelunasan' },
    ],
  },
  {
    slug: 'bisnis-pajak',
    title: 'Pajak Usaha dan Karyawan',
    level: 'Lanjut',
    emoji: '🧮',
    blurb: 'PPN, PPh 21, PPh 23, PPh final UMKM, PPh badan, rekap bukti potong, dan sanksi keterlambatan.',
    steps: [
      {
        type: 'bacaan',
        title: 'Aturan pajak yang berubah, caranya tidak',
        body: [
          'Tarif, batas, dan fasilitas pajak berubah dari waktu ke waktu. Karena itu semua tarif di kursus ini ditaruh di sel tersendiri dan ditandai sebagai contoh. Yang kamu latih adalah cara menyusun hitungannya, supaya saat aturan berubah kamu cukup mengganti satu sel.',
          'Untuk pekerjaan nyata, selalu cek ketentuan terbaru dari sumber resmi sebelum memakai angkanya.',
        ],
      },
      { type: 'latihan', slug: 'bisnis-ppn-keluaran-masukan' },
      {
        type: 'kuis',
        id: 'kbp-1',
        question: 'PPN masukan bulan ini lebih besar dari PPN keluaran. Hasilnya...',
        options: ['Kurang bayar', 'Lebih bayar', 'Nihil', 'Harus dibayar dua kali'],
        answer: 1,
        explain: 'Selisih keluaran dikurangi masukan bernilai negatif, artinya lebih bayar yang bisa dikompensasikan ke masa berikutnya.',
      },
      {
        type: 'bacaan',
        title: 'Tabel lapisan',
        body: [
          'Banyak aturan pajak berbentuk lapisan: tarif bergantung pada rentang nilai. Ada dua cara menyusunnya di spreadsheet. Kalau tarif berlaku untuk seluruh nilai, pakai VLOOKUP pencocokan perkiraan. Kalau tarif hanya berlaku untuk bagian nilai di tiap lapisan (tarif progresif), hitung bagian di tiap lapisan dengan MAX dan MIN.',
          'VLOOKUP dengan TRUE hanya benar bila kolom pertama tabel diurutkan naik.',
        ],
      },
      { type: 'latihan', slug: 'bisnis-pph21-ter' },
      {
        type: 'kuis',
        id: 'kbp-2',
        question: 'Syarat agar VLOOKUP dengan argumen terakhir TRUE memberi hasil yang benar?',
        options: ['Kolom pertama tabel terurut naik', 'Semua nilai di tabel berupa teks', 'Tabel tidak boleh lebih dari 5 baris', 'Nilai yang dicari harus ada persis di tabel'],
        answer: 0,
        explain: 'Pencocokan perkiraan mencari batas terbesar yang tidak melebihi nilai. Kalau tabel tidak terurut, hasilnya bisa salah tanpa pesan error.',
      },
      { type: 'latihan', slug: 'bisnis-pph21-pasal17' },
      {
        type: 'kuis',
        id: 'kbp-3',
        question: 'Rumus =MAX(0,MIN(PKP,batas_atas)-batas_bawah) menghasilkan 0 bila...',
        options: ['PKP belum mencapai batas bawah lapisan', 'PKP melewati batas atas lapisan', 'Tarif lapisan 0%', 'Batas atas sama dengan batas bawah'],
        answer: 0,
        explain: 'Kalau PKP lebih kecil dari batas bawah, selisihnya negatif, dan MAX(0, ...) mengubahnya jadi 0: lapisan itu tidak dipakai.',
      },
      { type: 'latihan', slug: 'bisnis-pph23-jasa' },
      { type: 'latihan', slug: 'bisnis-pph-final-umkm' },
      { type: 'latihan', slug: 'bisnis-rekap-bukti-potong' },
      { type: 'latihan', slug: 'bisnis-pph-badan' },
      { type: 'latihan', slug: 'bisnis-sanksi-terlambat' },
    ],
  },
  {
    slug: 'bisnis-penjualan-stok',
    title: 'Penjualan, Pemasaran, dan Stok',
    level: 'Menengah',
    emoji: '🛒',
    blurb: 'Omzet, margin, harga jual, komisi, capaian target, titik pesan ulang, HPP, dan efektivitas iklan.',
    steps: [
      {
        type: 'bacaan',
        title: 'Markup dan margin itu berbeda',
        body: [
          'Markup dihitung dari harga pokok: harga jual = HPP × (1 + markup). Margin dihitung dari harga jual: margin = (harga jual − HPP) ÷ harga jual. Barang berHPP 100.000 dengan markup 25% dijual 125.000, tetapi marginnya 20%, bukan 25%.',
          'Keduanya sama-sama benar. Yang penting kamu tahu persentase mana yang sedang dibicarakan, terutama saat membandingkan dengan target dari atasan atau pemasok.',
        ],
      },
      { type: 'latihan', slug: 'bisnis-omzet-sumproduct' },
      { type: 'latihan', slug: 'bisnis-harga-jual-markup' },
      {
        type: 'kuis',
        id: 'kps-1',
        question: 'Barang HPP Rp100.000 dijual dengan markup 25%. Berapa margin dari harga jualnya?',
        options: ['25%', '20%', '30%', '15%'],
        answer: 1,
        explain: 'Harga jual 125.000, margin 25.000. 25.000 dibagi 125.000 sama dengan 20%.',
      },
      { type: 'latihan', slug: 'bisnis-margin-produk' },
      { type: 'latihan', slug: 'bisnis-komisi-sales' },
      { type: 'latihan', slug: 'bisnis-target-cabang' },
      {
        type: 'bacaan',
        title: 'Stok: terlalu sedikit dan terlalu banyak',
        body: [
          'Stok yang habis membuat penjualan hilang. Stok yang menumpuk menahan modal dan berisiko rusak atau kedaluwarsa. Titik pesan ulang dan stok pengaman adalah cara menjaga keseimbangannya.',
        ],
      },
      { type: 'latihan', slug: 'bisnis-titik-pesan-ulang' },
      {
        type: 'kuis',
        id: 'kps-2',
        question: 'Untuk apa stok pengaman?',
        options: ['Menutup risiko permintaan naik atau kiriman terlambat', 'Menurunkan harga pokok', 'Mengurangi pajak', 'Menambah margin'],
        answer: 0,
        explain: 'Stok pengaman adalah cadangan di atas kebutuhan selama lead time, supaya barang tidak habis saat ada lonjakan atau keterlambatan.',
      },
      { type: 'latihan', slug: 'bisnis-hpp-rata-rata' },
      { type: 'latihan', slug: 'bisnis-roas-iklan' },
      {
        type: 'kuis',
        id: 'kps-3',
        question: 'ROAS sebuah kanal iklan adalah 4. Artinya...',
        options: [
          'Tiap Rp1 biaya iklan menghasilkan Rp4 omzet',
          'Tiap Rp1 biaya iklan menghasilkan Rp4 laba',
          'Iklan dilihat 4 kali per orang',
          'Empat dari seratus penonton membeli',
        ],
        answer: 0,
        explain: 'ROAS adalah omzet dibagi biaya iklan. Ia belum memperhitungkan HPP, jadi belum sama dengan laba.',
      },
      { type: 'latihan', slug: 'bisnis-harga-psikologis' },
      { type: 'latihan', slug: 'bisnis-peringkat-sales' },
      {
        type: 'kuis',
        id: 'kps-4',
        question: 'Dua sales sama-sama punya penjualan terbesar kedua dan mendapat RANK 2. Sales berikutnya mendapat peringkat berapa?',
        options: ['3', '4', '2', 'Error'],
        answer: 1,
        explain: 'RANK memberi peringkat sama pada angka sama, lalu melompati nomor berikutnya. Peringkat 3 dilewati, jadi yang berikutnya peringkat 4.',
      },
      { type: 'latihan', slug: 'bisnis-terlaris-per-kategori' },
    ],
  },
  {
    slug: 'bisnis-sdm-operasional',
    title: 'SDM dan Operasional',
    level: 'Menengah',
    emoji: '👥',
    blurb: 'Gaji dan iuran, absensi, cuti, turnover, THR, jadwal proyek, evaluasi pemasok, dan efektivitas mesin.',
    steps: [
      {
        type: 'bacaan',
        title: 'Batas atas dan lapisan di mana-mana',
        body: [
          'Perhitungan SDM penuh dengan batas: iuran dibatasi plafon, cuti dibatasi jatah, sanksi dibatasi bulan maksimum. Pola yang berulang adalah MIN(nilai, batas) untuk membatasi dari atas, dan MAX(0, nilai) untuk mencegah hasil negatif.',
          'Menaruh batas di sel sendiri membuat perhitungan mudah diperbarui saat kebijakan berubah.',
        ],
      },
      { type: 'latihan', slug: 'bisnis-slip-gaji-bpjs' },
      {
        type: 'kuis',
        id: 'ksd-1',
        question: 'Gaji pokok + tunjangan tetap Rp12.000.000, batas dasar iuran Rp10.000.000. Hasil =MIN(12000000,10000000) adalah...',
        options: ['12.000.000', '10.000.000', '2.000.000', '22.000.000'],
        answer: 1,
        explain: 'MIN memilih yang lebih kecil, jadi dasar iuran terpotong di plafon 10.000.000.',
      },
      { type: 'latihan', slug: 'bisnis-rekap-absensi' },
      { type: 'latihan', slug: 'bisnis-sisa-cuti' },
      { type: 'latihan', slug: 'bisnis-turnover-karyawan' },
      { type: 'latihan', slug: 'bisnis-thr-karyawan' },
      { type: 'latihan', slug: 'bisnis-jadwal-proyek' },
      { type: 'latihan', slug: 'bisnis-evaluasi-supplier' },
      {
        type: 'kuis',
        id: 'ksd-2',
        question: 'Mengapa jumlah bobot kriteria di penilaian supplier sebaiknya 1 (atau 100%)?',
        options: ['Supaya skor akhir tetap pada skala nilai yang sama', 'Supaya SUMPRODUCT tidak error', 'Supaya harga selalu menang', 'Tidak ada alasan khusus'],
        answer: 0,
        explain: 'Kalau jumlah bobot 1, skor akhir berada pada skala yang sama dengan nilai tiap kriteria, sehingga mudah dibaca dan dibandingkan.',
      },
      { type: 'latihan', slug: 'bisnis-oee-mesin' },
      {
        type: 'kuis',
        id: 'ksd-3',
        question: 'Mesin sering berhenti mendadak karena rusak. Komponen OEE mana yang paling terpengaruh?',
        options: ['Availability', 'Performance', 'Quality', 'Ketiganya sama'],
        answer: 0,
        explain: 'Availability membandingkan waktu mesin benar-benar jalan dengan waktu terjadwal. Berhenti mendadak memotong waktu jalan.',
      },
      { type: 'latihan', slug: 'bisnis-tunjangan-golongan' },
      { type: 'latihan', slug: 'bisnis-bersihkan-nomor-telepon' },
      { type: 'latihan', slug: 'bisnis-kelengkapan-data-karyawan' },
      {
        type: 'kuis',
        id: 'ksd-4',
        question: 'Beberapa gaji tersimpan sebagai teks, bukan angka. Apa akibatnya pada SUM kolom gaji?',
        options: [
          'Gaji bertipe teks diabaikan, jadi total lebih kecil dari seharusnya',
          'SUM menghasilkan error',
          'Teks otomatis dihitung sebagai nol dan total tetap benar',
          'Seluruh kolom dihitung dua kali',
        ],
        answer: 0,
        explain: 'SUM di dalam rentang hanya menjumlahkan angka. Karena itu data perlu diperiksa dengan ISNUMBER sebelum dijumlahkan.',
      },
    ],
  },
  ...MODUL_COURSES,
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
