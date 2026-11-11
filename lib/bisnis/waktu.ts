import type { ExerciseDef } from '../types';
import { col, fill, need } from './helpers';

// Modul Manajemen Waktu dan Tagihan: jatuh tempo, cicilan, masa kerja, hari kerja, jam lembur, kalender.

const tanggal = (cells: string[]): Record<string, 'date'> =>
  Object.fromEntries(cells.map((c) => [c, 'date' as const]));

export const WAKTU: ExerciseDef[] = [
  {
    slug: 'waktu-jatuh-tempo',
    kind: 'latihan',
    title: 'Memantau Jatuh Tempo Piutang',
    category: 'Tanggal & Waktu',
    emoji: '⏰',
    level: 'Sedang',
    story:
      'Bagian penagihan sebuah distributor memegang lima faktur dengan masa tempo berbeda. Tiap pagi ia mencocokkan tanggal hari ini dengan jatuh tempo untuk memutuskan siapa yang ditelepon lebih dulu.',
    task:
      'Isi D2 sampai D6 dengan tanggal jatuh tempo (tanggal faktur ditambah masa tempo). Isi E2 sampai E6 dengan jumlah hari keterlambatan terhadap tanggal cek di B8 (0 bila belum lewat). Isi F2 sampai F6 dengan "Terlambat" bila E lebih dari 0, "Segera jatuh tempo" bila jatuh tempo tinggal 7 hari atau kurang, selain itu "Berjalan".',
    note: 'Tanggal disimpan sebagai angka, jadi menambah dan mengurangkan tanggal bisa memakai + dan -.',
    rows: [
      ['Faktur', 'Tanggal faktur', 'Tempo (hari)', 'Jatuh tempo', 'Terlambat (hari)', 'Status'],
      ['INV-1', '2026-10-05', '30', '', '', ''],
      ['INV-2', '2026-10-20', '30', '', '', ''],
      ['INV-3', '2026-10-28', '14', '', '', ''],
      ['INV-4', '2026-09-15', '45', '', '', ''],
      ['INV-5', '2026-11-03', '7', '', '', ''],
      ['', '', '', '', '', ''],
      ['Tanggal cek', '2026-11-11', '', '', '', ''],
    ],
    solution: {
      ...fill('D', 2, 6, (r) => `=B${r}+C${r}`),
      ...fill('E', 2, 6, (r) => `=MAX(0,$B$8-D${r})`),
      ...fill('F', 2, 6, (r) => `=IF(E${r}>0,"Terlambat",IF(D${r}-$B$8<=7,"Segera jatuh tempo","Berjalan"))`),
    },
    required: {
      ...need(col('D', 2, 6), []),
      ...need(col('E', 2, 6), ['MAX']),
      ...need(col('F', 2, 6), ['IF']),
    },
    fmt: tanggal(col('D', 2, 6)),
    tones: { Terlambat: 'bad', 'Segera jatuh tempo': 'warn', Berjalan: 'ok' },
    vary: ['B2:B6', 'C2:C6'],
    hints: [
      'Jatuh tempo adalah tanggal faktur ditambah tempo. Keterlambatan adalah tanggal cek dikurangi jatuh tempo, tetapi tidak boleh negatif.',
      'MAX(0, selisih) mencegah angka negatif. Untuk status, periksa terlambat dulu, baru dekat jatuh tempo, baru sisanya.',
      'D2: =B2+C2. E2: =MAX(0,$B$8-D2). F2: =IF(E2>0,"Terlambat",IF(D2-$B$8<=7,"Segera jatuh tempo","Berjalan")).',
    ],
    explanation:
      'Spreadsheet menyimpan tanggal sebagai nomor seri harian, jadi tanggal dapat dijumlah dan dikurangkan seperti angka biasa. Tanggal cek ditaruh di satu sel acuan sehingga seluruh laporan berubah dengan mengganti satu angka, dan tetap bisa diuji pada tanggal mana pun.',
  },
  {
    slug: 'waktu-jadwal-cicilan',
    kind: 'latihan',
    title: 'Jadwal Cicilan dengan Tanggal Akhir Bulan',
    category: 'Tanggal & Waktu',
    emoji: '💳',
    level: 'Sedang',
    story:
      'Usaha kecil mengambil pinjaman modal kerja dengan cicilan setiap bulan pada tanggal yang sama dengan cicilan pertama, yaitu tanggal 31. Bulan yang pendek tidak punya tanggal 31, sehingga jadwalnya tidak boleh sekadar ditambah 30 hari.',
    task:
      'Isi B6 sampai B11 dengan tanggal jatuh tempo tiap cicilan, dihitung dari tanggal cicilan pertama di B3 dan nomor cicilan di kolom A. Isi C6 sampai C11 dengan nama bulan dan tahunnya (misalnya Januari 2026). Isi D6 sampai D11 dengan cicilan tetap dari B2, E6 sampai E11 dengan sisa pinjaman setelah cicilan itu, dan D12 dengan total cicilan.',
    note: 'EDATE menggeser tanggal sekian bulan dan otomatis jatuh ke akhir bulan bila tanggal tujuannya tidak ada.',
    rows: [
      ['Pinjaman (Rp)', '12000000', '', '', ''],
      ['Cicilan per bulan (Rp)', '2000000', '', '', ''],
      ['Cicilan pertama', '2026-01-31', '', '', ''],
      ['', '', '', '', ''],
      ['No', 'Jatuh tempo', 'Bulan', 'Cicilan', 'Sisa pinjaman'],
      ['1', '', '', '', ''],
      ['2', '', '', '', ''],
      ['3', '', '', '', ''],
      ['4', '', '', '', ''],
      ['5', '', '', '', ''],
      ['6', '', '', '', ''],
      ['Total', '', '', '', ''],
    ],
    solution: {
      ...fill('B', 6, 11, (r) => `=EDATE($B$3,A${r}-1)`),
      ...fill('C', 6, 11, (r) => `=TEXT(B${r},"mmmm yyyy")`),
      ...fill('D', 6, 11, () => '=$B$2'),
      ...fill('E', 6, 11, (r) => `=$B$1-SUM($D$6:D${r})`),
      D12: '=SUM(D6:D11)',
    },
    required: {
      ...need(col('B', 6, 11), ['EDATE']),
      ...need(col('C', 6, 11), ['TEXT']),
      ...need(col('D', 6, 11), []),
      ...need(col('E', 6, 11), ['SUM']),
      D12: ['SUM'],
    },
    fmt: tanggal(col('B', 6, 11)),
    vary: ['B1:B2', 'B3'],
    hints: [
      'Geser dari tanggal pertama (B3) sebanyak nomor cicilan dikurangi 1 bulan. Jangan menggeser dari tanggal baris di atasnya, karena kesalahan akhir bulan akan menumpuk.',
      'EDATE(tanggal, jumlah_bulan) melakukan itu. TEXT(tanggal,"mmmm yyyy") memberi nama bulan. Sisa pinjaman: pinjaman dikurangi SUM cicilan dari baris pertama sampai baris ini.',
      'B6: =EDATE($B$3,A6-1). C6: =TEXT(B6,"mmmm yyyy"). E6: =$B$1-SUM($D$6:D6).',
    ],
    explanation:
      'Menambah 30 hari tiap bulan membuat tanggal melenceng. EDATE tahu panjang tiap bulan: 31 Januari + 1 bulan menjadi 28 Februari, lalu 31 Maret. Selalu menghitung dari tanggal awal, bukan dari tanggal sebelumnya, mencegah cicilan Maret terkunci di tanggal 28.',
  },
  {
    slug: 'waktu-masa-kerja',
    kind: 'latihan',
    title: 'Masa Kerja dan Hak Cuti Besar',
    category: 'Tanggal & Waktu',
    emoji: '🎂',
    level: 'Sedang',
    story:
      'Bagian SDM menghitung masa kerja karyawan dalam tahun dan bulan penuh. Karyawan dengan masa kerja lima tahun penuh berhak atas cuti besar, dan setiap tahun penuh memberi tunjangan masa kerja Rp150.000.',
    task:
      'Isi C2 sampai C6 dengan masa kerja dalam bentuk teks seperti "6 tahun 8 bulan" terhadap tanggal acuan di B8. Isi D2 sampai D6 dengan "Berhak" bila masa kerja sudah 5 tahun penuh atau lebih, selain itu "Belum". Isi E2 sampai E6 dengan tunjangan masa kerja.',
    note: 'Masa kerja sehari kurang dari lima tahun belum dihitung lima tahun.',
    rows: [
      ['Karyawan', 'Tanggal masuk', 'Masa kerja', 'Cuti besar', 'Tunjangan'],
      ['Ratna Dewi', '2019-03-15', '', '', ''],
      ['Hendra Wijaya', '2021-11-11', '', '', ''],
      ['Lina Marlina', '2023-07-20', '', '', ''],
      ['Agus Salim', '2016-12-01', '', '', ''],
      ['Maya Sari', '2024-02-29', '', '', ''],
      ['', '', '', '', ''],
      ['Tanggal acuan', '2026-11-11', '', '', ''],
    ],
    solution: {
      ...fill('C', 2, 6, (r) => `=DATEDIF(B${r},$B$8,"Y")&" tahun "&DATEDIF(B${r},$B$8,"YM")&" bulan"`),
      ...fill('D', 2, 6, (r) => `=IF(DATEDIF(B${r},$B$8,"Y")>=5,"Berhak","Belum")`),
      ...fill('E', 2, 6, (r) => `=DATEDIF(B${r},$B$8,"Y")*150000`),
    },
    required: {
      ...need(col('C', 2, 6), ['DATEDIF']),
      ...need(col('D', 2, 6), ['DATEDIF', 'IF']),
      ...need(col('E', 2, 6), ['DATEDIF']),
    },
    tones: { Berhak: 'ok', Belum: 'warn' },
    vary: ['B2:B6'],
    hints: [
      'DATEDIF(awal, akhir, satuan) menghitung selisih utuh. Satuan "Y" untuk tahun penuh dan "YM" untuk sisa bulan sesudah tahun penuh.',
      'Sambung dua DATEDIF dan kata penghubungnya dengan &. Untuk hak cuti dan tunjangan, cukup tahun penuh ("Y").',
      'C2: =DATEDIF(B2,$B$8,"Y")&" tahun "&DATEDIF(B2,$B$8,"YM")&" bulan". D2: =IF(DATEDIF(B2,$B$8,"Y")>=5,"Berhak","Belum").',
    ],
    explanation:
      'Selisih tanggal dibagi 365 hampir benar tetapi salah pada tahun kabisat dan di sekitar ulang tahun kerja. DATEDIF menghitung tahun dan bulan penuh menurut kalender, sehingga seseorang yang kurang sehari dari lima tahun benar-benar dianggap belum lima tahun.',
  },
  {
    slug: 'waktu-sla-hari-kerja',
    kind: 'tantangan',
    title: 'Batas SLA Layanan dalam Hari Kerja',
    category: 'Tanggal & Waktu',
    emoji: '🛎️',
    level: 'Sulit',
    xp: 50,
    story:
      'Tim dukungan pelanggan berjanji menyelesaikan tiap tiket dalam 3 hari kerja. Sabtu, Minggu, dan hari libur perusahaan tidak dihitung. Atasan ingin tahu batas waktu tiap tiket, berapa hari kerja yang dipakai, dan apakah janjinya terpenuhi.',
    task:
      'Isi C2 sampai C6 dengan batas SLA: tanggal setelah jumlah hari kerja di B8 sejak tiket dibuka, dengan melewati hari libur di H2 sampai H4. Isi E2 sampai E6 dengan hari kerja yang terpakai sampai tiket selesai (hari dibukanya tidak dihitung, hari libur dilewati). Isi F2 sampai F6 dengan "Tepat waktu" bila tanggal selesai tidak melewati batas SLA, selain itu "Terlambat".',
    rows: [
      ['Tiket', 'Dibuka', 'Batas SLA', 'Selesai', 'Hari kerja terpakai', 'Status', '', 'Libur'],
      ['T-01', '2026-10-22', '', '2026-10-27', '', '', '', '2026-10-26'],
      ['T-02', '2026-10-30', '', '2026-11-05', '', '', '', '2026-11-02'],
      ['T-03', '2026-11-03', '', '2026-11-09', '', '', '', '2026-11-20'],
      ['T-04', '2026-11-09', '', '2026-11-12', '', '', '', ''],
      ['T-05', '2026-11-13', '', '2026-11-19', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['SLA (hari kerja)', '3', '', '', '', '', '', ''],
    ],
    solution: {
      ...fill('C', 2, 6, (r) => `=WORKDAY(B${r},$B$8,$H$2:$H$4)`),
      ...fill('E', 2, 6, (r) => `=NETWORKDAYS(B${r},D${r},$H$2:$H$4)-1`),
      ...fill('F', 2, 6, (r) => `=IF(D${r}<=C${r},"Tepat waktu","Terlambat")`),
    },
    required: {
      ...need(col('C', 2, 6), ['WORKDAY']),
      ...need(col('E', 2, 6), ['NETWORKDAYS']),
      ...need(col('F', 2, 6), ['IF']),
    },
    fmt: tanggal(col('C', 2, 6)),
    tones: { 'Tepat waktu': 'ok', Terlambat: 'bad' },
    vary: ['B2:B6', 'D2:D6', 'B8'],
    hints: [
      'Dua fungsi hari kerja saling berlawanan arah: satu menghasilkan tanggal setelah sekian hari kerja, satu menghitung berapa hari kerja di antara dua tanggal.',
      'Keduanya menerima daftar libur sebagai argumen terakhir. NETWORKDAYS menghitung hari awal juga, jadi kurangi 1 untuk hari kerja yang terpakai.',
      'C2: =WORKDAY(B2,$B$8,$H$2:$H$4). E2: =NETWORKDAYS(B2,D2,$H$2:$H$4)-1. F2: =IF(D2<=C2,"Tepat waktu","Terlambat").',
    ],
    explanation:
      'Janji layanan dalam hari kerja tidak bisa dihitung dengan penjumlahan biasa karena akhir pekan dan libur ikut memanjangkan kalender. Daftar libur disimpan di satu rentang yang dirujuk semua rumus, sehingga menambah libur baru cukup mengetik satu tanggal.',
  },
  {
    slug: 'waktu-lembur-jam',
    kind: 'latihan',
    title: 'Jam Kerja dan Upah Lembur',
    category: 'Tanggal & Waktu',
    emoji: '🕗',
    level: 'Sedang',
    story:
      'Pabrik kecil mencatat jam masuk dan jam pulang karyawan. Jam kerja normal 8 jam per hari dan istirahat 1 jam tidak dihitung kerja. Selebihnya adalah lembur, dibayar per jam sesuai tarif.',
    task:
      'Isi E2 sampai E6 dengan jam kerja bersih dalam jam desimal (dua desimal). Isi F2 sampai F6 dengan jam lembur (0 bila tidak lebih dari 8 jam) dan G2 sampai G6 dengan upah lembur yang dibulatkan ke rupiah. Isi H2 sampai H6 dengan lama berada di pabrik berformat jam:menit (misalnya 09:30). Isi F7 dan G7 dengan total.',
    note: 'Jam disimpan sebagai pecahan hari, jadi selisih dua jam dikalikan 24 menjadi jam.',
    rows: [
      ['Karyawan', 'Masuk', 'Pulang', 'Istirahat (jam)', 'Jam kerja', 'Lembur (jam)', 'Upah lembur', 'Lama di pabrik'],
      ['Rina', '08:00', '17:30', '1', '', '', '', ''],
      ['Doni', '07:30', '18:00', '1', '', '', '', ''],
      ['Sari', '09:00', '17:00', '1', '', '', '', ''],
      ['Eko', '08:00', '20:15', '1', '', '', '', ''],
      ['Tika', '08:30', '17:30', '1', '', '', '', ''],
      ['Total', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['Tarif lembur per jam', '25000', '', '', '', '', '', ''],
    ],
    solution: {
      ...fill('E', 2, 6, (r) => `=ROUND((C${r}-B${r})*24-D${r},2)`),
      ...fill('F', 2, 6, (r) => `=MAX(0,E${r}-8)`),
      ...fill('G', 2, 6, (r) => `=ROUND(F${r}*$B$9,0)`),
      ...fill('H', 2, 6, (r) => `=TEXT(C${r}-B${r},"hh:mm")`),
      F7: '=SUM(F2:F6)',
      G7: '=SUM(G2:G6)',
    },
    required: {
      ...need(col('E', 2, 6), ['ROUND']),
      ...need(col('F', 2, 6), ['MAX']),
      ...need(col('G', 2, 6), ['ROUND']),
      ...need(col('H', 2, 6), ['TEXT']),
      F7: ['SUM'],
      G7: ['SUM'],
    },
    vary: ['B9'],
    hints: [
      'Selisih dua jam (pulang dikurangi masuk) adalah pecahan hari. Kalikan 24 untuk mendapat jam, lalu kurangi istirahat.',
      'Bulatkan dengan ROUND agar sisa pecahan komputer tidak muncul. Lembur adalah jam kerja dikurangi 8, tetapi tidak boleh negatif: MAX(0, ...).',
      'E2: =ROUND((C2-B2)*24-D2,2). F2: =MAX(0,E2-8). G2: =ROUND(F2*$B$9,0). H2: =TEXT(C2-B2,"hh:mm").',
    ],
    explanation:
      'Jam dalam spreadsheet adalah pecahan dari satu hari: 12:00 bernilai 0,5. Itu sebabnya selisih jam perlu dikali 24 untuk menjadi jam desimal, dan TEXT dengan pola "hh:mm" untuk menampilkannya kembali sebagai jam dan menit.',
  },
  {
    slug: 'waktu-kalender-produksi',
    kind: 'latihan',
    title: 'Kalender Produksi: Hari, Status, dan Kuartal',
    category: 'Tanggal & Waktu',
    emoji: '🏭',
    level: 'Sedang',
    story:
      'Perencana produksi menerima daftar tanggal rencana kerja. Ia perlu tahu nama hari tiap tanggal, mana yang akhir pekan, jatuh di kuartal berapa, dan berapa hari kerja yang tersedia.',
    task:
      'Isi B2 sampai B9 dengan nama hari (misalnya Selasa) dan C2 sampai C9 dengan "Libur" bila Sabtu atau Minggu, selain itu "Kerja". Isi D2 sampai D9 dengan kuartal berformat Q1 sampai Q4. Isi G2 dengan jumlah hari kerja, dan G3 dengan tanggal akhir bulan dari tanggal pertama di A2.',
    note: 'WEEKDAY dengan tipe 2 memberi Senin = 1 sampai Minggu = 7, jadi hari akhir pekan bernilai lebih dari 5.',
    rows: [
      ['Tanggal', 'Hari', 'Status', 'Kuartal', '', 'Ringkasan', ''],
      ['2026-09-29', '', '', '', '', 'Hari kerja', ''],
      ['2026-09-30', '', '', '', '', 'Akhir bulan pertama', ''],
      ['2026-10-01', '', '', '', '', '', ''],
      ['2026-10-02', '', '', '', '', '', ''],
      ['2026-10-03', '', '', '', '', '', ''],
      ['2026-10-04', '', '', '', '', '', ''],
      ['2026-10-05', '', '', '', '', '', ''],
      ['2026-10-06', '', '', '', '', '', ''],
    ],
    solution: {
      ...fill('B', 2, 9, (r) => `=TEXT(A${r},"dddd")`),
      ...fill('C', 2, 9, (r) => `=IF(WEEKDAY(A${r},2)>5,"Libur","Kerja")`),
      ...fill('D', 2, 9, (r) => `="Q"&ROUNDUP(MONTH(A${r})/3,0)`),
      G2: '=COUNTIF(C2:C9,"Kerja")',
      G3: '=EOMONTH(A2,0)',
    },
    required: {
      ...need(col('B', 2, 9), ['TEXT']),
      ...need(col('C', 2, 9), ['IF', 'WEEKDAY']),
      ...need(col('D', 2, 9), ['ROUNDUP', 'MONTH']),
      G2: ['COUNTIF'],
      G3: ['EOMONTH'],
    },
    fmt: { G3: 'date' },
    tones: { Libur: 'warn', Kerja: 'ok' },
    vary: ['A2:A9'],
    hints: [
      'TEXT dengan pola "dddd" memberi nama hari penuh. WEEKDAY dengan tipe 2 menomori hari mulai Senin.',
      'Kuartal = bulan dibagi 3 dibulatkan ke atas, diberi awalan "Q" lewat &. Hari kerja dihitung dengan COUNTIF pada kolom status.',
      'C2: =IF(WEEKDAY(A2,2)>5,"Libur","Kerja"). D2: ="Q"&ROUNDUP(MONTH(A2)/3,0). G3: =EOMONTH(A2,0).',
    ],
    explanation:
      'Satu kolom tanggal bisa dipecah menjadi banyak sudut pandang: hari, status, kuartal, akhir bulan. Rumus-rumus ini kecil tetapi dipakai berulang pada hampir semua laporan berbasis waktu.',
  },
];
