import type { ExerciseDef } from '../types';
import { col, fill, need } from './helpers';

// Modul Validasi dan Otomatisasi Visual: rumus yang memeriksa data dan menandai status dengan warna.

export const VALID: ExerciseDef[] = [
  {
    slug: 'valid-input-pendaftaran',
    kind: 'latihan',
    title: 'Memeriksa Data Pendaftaran Peserta',
    category: 'Validasi Data',
    emoji: '✅',
    level: 'Mudah',
    story:
      'Panitia lomba menerima pendaftaran lewat formulir. Peserta harus berusia 17 sampai 60 tahun dengan umur berupa angka, dan emailnya harus memuat tanda @. Data yang tidak lolos harus ditandai sebelum dikirim ke juri.',
    task:
      'Isi D2 sampai D8 dengan "OK" bila umur berupa angka antara 17 dan 60 (termasuk) dan email memuat @, selain itu "Periksa". Isi G2 dengan jumlah baris OK, G3 dengan jumlah baris Periksa, dan G4 dengan persentase baris OK dari seluruh peserta (bilangan bulat).',
    rows: [
      ['Nama', 'Umur', 'Email', 'Status', '', 'Ringkasan', ''],
      ['Andi', '22', 'andi@mail.com', '', '', 'Data OK', ''],
      ['Bela', 'tujuh belas', 'bela@mail.com', '', '', 'Perlu diperiksa', ''],
      ['Citra', '15', 'citra@mail.com', '', '', 'Persen OK', ''],
      ['Dodi', '34', 'dodi.mail.com', '', '', '', ''],
      ['Eka', '61', 'eka@kantor.id', '', '', '', ''],
      ['Fani', '45', 'fani@kantor.id', '', '', '', ''],
      ['Gilang', '', 'gilang@mail.com', '', '', '', ''],
    ],
    solution: {
      ...fill('D', 2, 8, (r) => `=IF(AND(ISNUMBER(B${r}),B${r}>=17,B${r}<=60,ISNUMBER(SEARCH("@",C${r}))),"OK","Periksa")`),
      G2: '=COUNTIF(D2:D8,"OK")',
      G3: '=COUNTIF(D2:D8,"Periksa")',
      G4: '=ROUND(G2/COUNTA(A2:A8)*100,0)',
    },
    required: {
      ...need(col('D', 2, 8), ['IF', 'AND', 'ISNUMBER']),
      G2: ['COUNTIF'],
      G3: ['COUNTIF'],
      G4: ['ROUND', 'COUNTA'],
    },
    tones: { OK: 'ok', Periksa: 'bad' },
    hints: [
      'Gabungkan semua syarat dalam satu AND. Syarat pertama: umurnya angka. Tanpa itu, teks seperti "tujuh belas" bisa lolos perbandingan.',
      'Untuk email, SEARCH("@",sel) memberi posisi atau error. Bungkus dengan ISNUMBER supaya hasilnya TRUE atau FALSE.',
      'D2: =IF(AND(ISNUMBER(B2),B2>=17,B2<=60,ISNUMBER(SEARCH("@",C2))),"OK","Periksa"). G4: =ROUND(G2/COUNTA(A2:A8)*100,0).',
    ],
    explanation:
      'Validasi dengan rumus bisa jauh lebih fleksibel daripada aturan input bawaan. Urutan syarat penting: periksa tipe data (ISNUMBER) sebelum rentang nilainya. Kolom status yang berwarna membuat baris bermasalah langsung terlihat tanpa harus membaca satu per satu.',
  },
  {
    slug: 'valid-nomor-pegawai',
    kind: 'latihan',
    title: 'Memeriksa Nomor Pegawai Sebelum Impor',
    category: 'Validasi Data',
    emoji: '🪪',
    level: 'Sedang',
    story:
      'Admin sistem penggajian akan mengimpor daftar nomor pegawai dari beberapa unit. Nomor yang sah berbentuk PGW- diikuti empat angka (delapan karakter), huruf awalannya harus kapital, dan tidak boleh ada nomor kembar. Impor hanya boleh jalan bila semuanya bersih.',
    task:
      'Isi B2 sampai B9 dengan hasil pemeriksaan berurutan: "Panjang salah" bila bukan 8 karakter, "Awalan salah" bila empat karakter pertama bukan PGW- (huruf besar kecil dibedakan), "Duplikat" bila nomor muncul lebih dari sekali di daftar, selain itu "OK". Isi E2 dengan jumlah baris OK, E3 dengan jumlah baris bermasalah, dan E4 dengan "Ya" bila tidak ada yang bermasalah, selain itu "Belum".',
    note: 'Operator = dan COUNTIF tidak membedakan huruf besar dan kecil. EXACT membedakannya.',
    rows: [
      ['Nomor pegawai', 'Hasil', '', 'Ringkasan', ''],
      ['PGW-0412', '', '', 'Baris OK', ''],
      ['PGW-0413', '', '', 'Baris bermasalah', ''],
      ['pgw-0414', '', '', 'Siap diimpor', ''],
      ['PGW-0413', '', '', '', ''],
      ['PGW-041', '', '', '', ''],
      ['PGW-0420', '', '', '', ''],
      ['KRY-0421', '', '', '', ''],
      ['PGW-0430', '', '', '', ''],
    ],
    solution: {
      ...fill(
        'B',
        2,
        9,
        (r) =>
          `=IF(LEN(A${r})<>8,"Panjang salah",IF(NOT(EXACT(LEFT(A${r},4),"PGW-")),"Awalan salah",IF(COUNTIF($A$2:$A$9,A${r})>1,"Duplikat","OK")))`
      ),
      E2: '=COUNTIF(B2:B9,"OK")',
      E3: '=COUNTA(A2:A9)-E2',
      E4: '=IF(E3=0,"Ya","Belum")',
    },
    required: {
      ...need(col('B', 2, 9), ['IF', 'LEN', 'EXACT', 'LEFT', 'COUNTIF']),
      E2: ['COUNTIF'],
      E3: ['COUNTA'],
      E4: ['IF'],
    },
    tones: {
      OK: 'ok',
      Ya: 'ok',
      Duplikat: 'bad',
      'Awalan salah': 'bad',
      'Panjang salah': 'bad',
      Belum: 'bad',
    },
    hints: [
      'Susun IF bersarang dari pemeriksaan paling murah ke paling mahal: panjang dulu, lalu awalan, lalu duplikat.',
      'Awalan: EXACT(LEFT(sel,4),"PGW-") menghasilkan TRUE hanya bila persis sama termasuk huruf besar. Duplikat: COUNTIF terhadap seluruh daftar lebih dari 1.',
      'B2: =IF(LEN(A2)<>8,"Panjang salah",IF(NOT(EXACT(LEFT(A2,4),"PGW-")),"Awalan salah",IF(COUNTIF($A$2:$A$9,A2)>1,"Duplikat","OK"))).',
    ],
    explanation:
      'Pemeriksaan berlapis dengan pesan khusus lebih berguna daripada sekadar "salah": admin langsung tahu apa yang harus diperbaiki. Kedua nomor PGW-0413 sama-sama ditandai duplikat karena COUNTIF melihat seluruh daftar, bukan hanya baris di atasnya.',
  },
  {
    slug: 'valid-stok-minimum',
    kind: 'latihan',
    title: 'Peringatan Stok dan Rencana Pemesanan',
    category: 'Validasi Data',
    emoji: '📦',
    level: 'Sedang',
    story:
      'Gudang kedai kopi ingin lembar stok yang memberi peringatan sendiri. Barang yang habis harus dipesan segera, barang di bawah batas minimum dipesan terjadwal, dan jumlah pesanan dihitung agar stok kembali ke dua kali batas minimum.',
    task:
      'Isi D2 sampai D8 dengan status: "Habis" bila stok 0 atau kurang, "Menipis" bila stok di bawah minimum, selain itu "Aman". Isi E2 sampai E8 dengan jumlah yang perlu dipesan: 0 bila Aman, selain itu dua kali minimum dikurangi stok. Isi G2 dengan jumlah barang Habis, G3 dengan jumlah barang Menipis, dan G4 dengan total unit yang dipesan.',
    rows: [
      ['Barang', 'Stok', 'Minimum', 'Status', 'Pesan (unit)', 'Ringkasan', ''],
      ['Biji kopi', '120', '100', '', '', 'Habis', ''],
      ['Susu UHT', '40', '60', '', '', 'Menipis', ''],
      ['Sirup karamel', '0', '50', '', '', 'Total dipesan', ''],
      ['Gula cair', '85', '80', '', '', '', ''],
      ['Gelas 12 oz', '15', '30', '', '', '', ''],
      ['Sedotan', '0', '20', '', '', '', ''],
      ['Tutup gelas', '55', '40', '', '', '', ''],
    ],
    solution: {
      ...fill('D', 2, 8, (r) => `=IFS(B${r}<=0,"Habis",B${r}<C${r},"Menipis",TRUE,"Aman")`),
      ...fill('E', 2, 8, (r) => `=IF(D${r}="Aman",0,C${r}*2-B${r})`),
      G2: '=COUNTIF(D2:D8,"Habis")',
      G3: '=COUNTIF(D2:D8,"Menipis")',
      G4: '=SUM(E2:E8)',
    },
    required: {
      ...need(col('D', 2, 8), ['IFS']),
      ...need(col('E', 2, 8), ['IF']),
      G2: ['COUNTIF'],
      G3: ['COUNTIF'],
      G4: ['SUM'],
    },
    tones: { Habis: 'bad', Menipis: 'warn', Aman: 'ok' },
    vary: ['B2:B8', 'C2:C8'],
    hints: [
      'Urutan syarat IFS penting: periksa Habis dulu. Kalau Menipis diperiksa lebih dulu, stok 0 ikut tertangkap sebagai Menipis.',
      'Jumlah pesanan hanya berlaku untuk status selain Aman. Rujuk kolom status itu di dalam IF.',
      'D2: =IFS(B2<=0,"Habis",B2<C2,"Menipis",TRUE,"Aman"). E2: =IF(D2="Aman",0,C2*2-B2).',
    ],
    explanation:
      'Status dihitung sekali di satu kolom, lalu dipakai ulang oleh kolom lain dan ringkasan. Cara ini menghindari aturan yang sama ditulis berulang di banyak rumus, dan kalau definisi "menipis" berubah, cukup satu kolom yang diperbaiki.',
  },
  {
    slug: 'valid-selisih-kas',
    kind: 'latihan',
    title: 'Rekonsiliasi Kas Harian dengan Toleransi',
    category: 'Validasi Data',
    emoji: '💵',
    level: 'Sedang',
    story:
      'Pemilik toko menutup kas tiap malam dengan membandingkan saldo menurut sistem dan uang fisik di laci. Selisih kecil karena uang kembalian masih wajar, tetapi selisih besar harus diselidiki. Batas toleransinya Rp5.000.',
    task:
      'Isi D2 sampai D7 dengan selisih (uang fisik dikurangi saldo sistem) dan E2 sampai E7 dengan status: "Pas" bila selisih 0, "Dalam toleransi" bila selisih (tanpa memandang tanda) tidak melebihi batas di B9, selain itu "Selisih". Isi B8 dan C8 dengan total, D8 dengan selisih total, dan B10 dengan jumlah hari berstatus Selisih.',
    note: 'Selisih bisa negatif (uang kurang) atau positif (uang lebih). ABS menghilangkan tandanya untuk perbandingan dengan toleransi.',
    rows: [
      ['Hari', 'Saldo sistem', 'Uang fisik', 'Selisih', 'Status'],
      ['Senin', '4250000', '4250000', '', ''],
      ['Selasa', '3980000', '3977500', '', ''],
      ['Rabu', '5120000', '5100000', '', ''],
      ['Kamis', '4410000', '4416000', '', ''],
      ['Jumat', '6020000', '6020000', '', ''],
      ['Sabtu', '7300000', '7298000', '', ''],
      ['Total', '', '', '', ''],
      ['Toleransi (Rp)', '5000', '', '', ''],
      ['Hari berselisih', '', '', '', ''],
    ],
    solution: {
      ...fill('D', 2, 7, (r) => `=C${r}-B${r}`),
      ...fill('E', 2, 7, (r) => `=IF(D${r}=0,"Pas",IF(ABS(D${r})<=$B$9,"Dalam toleransi","Selisih"))`),
      B8: '=SUM(B2:B7)',
      C8: '=SUM(C2:C7)',
      D8: '=C8-B8',
      B10: '=COUNTIF(E2:E7,"Selisih")',
    },
    required: {
      ...need(col('D', 2, 7), []),
      ...need(col('E', 2, 7), ['IF', 'ABS']),
      B8: ['SUM'],
      C8: ['SUM'],
      D8: [],
      B10: ['COUNTIF'],
    },
    tones: { Pas: 'ok', 'Dalam toleransi': 'warn', Selisih: 'bad' },
    vary: ['B2:C7', 'B9'],
    hints: [
      'Selisih per hari sederhana: fisik dikurangi sistem. Statusnya tiga tingkat, jadi butuh IF di dalam IF.',
      'ABS(selisih) <= toleransi menangani selisih kurang dan lebih sekaligus. Kunci sel toleransi dengan $B$9.',
      'E2: =IF(D2=0,"Pas",IF(ABS(D2)<=$B$9,"Dalam toleransi","Selisih")). B10: =COUNTIF(E2:E7,"Selisih").',
    ],
    explanation:
      'Toleransi di sel sendiri membuat aturan bisnis terlihat dan mudah diubah. Total selisih bisa mendekati nol karena selisih lebih dan kurang saling menutupi, itu sebabnya yang dihitung adalah jumlah hari bermasalah, bukan hanya angka total.',
  },
  {
    slug: 'valid-lembar-pesanan',
    kind: 'tantangan',
    title: 'Pemeriksa Lembar Pesanan Grosir',
    category: 'Validasi Data',
    emoji: '🛡️',
    level: 'Sulit',
    xp: 50,
    story:
      'Pelanggan grosir mengisi lembar pesanan sendiri, dan data yang salah sering lolos ke gudang. Admin ingin tiap baris diperiksa otomatis dengan pesan yang jelas: kode kosong, kode tidak dikenal, jumlah bukan angka, jumlah nol atau negatif, atau jumlah berkoma. Pesanan baru diproses bila semua baris valid.',
    task:
      'Isi C2 sampai C9 dengan hasil pemeriksaan berurutan: "Kode kosong", "Kode tidak dikenal" (tidak ada di daftar kode E2 sampai E5), "Jumlah bukan angka", "Jumlah harus positif", "Jumlah harus bulat", lalu "Valid" bila lolos semua. Isi H2 dengan jumlah baris Valid, H3 dengan jumlah baris bermasalah, dan H4 dengan "Siap diproses" bila H3 sama dengan 0, selain itu "Perbaiki dulu".',
    note: 'Periksa dari yang paling dasar. Jumlah baru boleh dibandingkan dengan 0 setelah dipastikan berupa angka.',
    rows: [
      ['Kode barang', 'Jumlah', 'Pemeriksaan', '', 'Kode sah', '', 'Ringkasan', ''],
      ['BRG-01', '10', '', '', 'BRG-01', '', 'Baris valid', ''],
      ['BRG-02', 'abc', '', '', 'BRG-02', '', 'Baris bermasalah', ''],
      ['BRG-09', '5', '', '', 'BRG-03', '', 'Keputusan', ''],
      ['', '3', '', '', 'BRG-04', '', '', ''],
      ['BRG-03', '-2', '', '', '', '', '', ''],
      ['BRG-01', '2.5', '', '', '', '', '', ''],
      ['BRG-04', '8', '', '', '', '', '', ''],
      ['BRG-02', '0', '', '', '', '', '', ''],
    ],
    solution: {
      ...fill(
        'C',
        2,
        9,
        (r) =>
          `=IF(A${r}="","Kode kosong",IF(COUNTIF($E$2:$E$5,A${r})=0,"Kode tidak dikenal",IF(NOT(ISNUMBER(B${r})),"Jumlah bukan angka",IF(B${r}<=0,"Jumlah harus positif",IF(B${r}<>INT(B${r}),"Jumlah harus bulat","Valid")))))`
      ),
      H2: '=COUNTIF(C2:C9,"Valid")',
      H3: '=COUNTA(C2:C9)-H2',
      H4: '=IF(H3=0,"Siap diproses","Perbaiki dulu")',
    },
    required: {
      ...need(col('C', 2, 9), ['IF', 'COUNTIF', 'ISNUMBER', 'INT']),
      H2: ['COUNTIF'],
      H3: ['COUNTA'],
      H4: ['IF'],
    },
    tones: {
      Valid: 'ok',
      'Siap diproses': 'ok',
      'Kode kosong': 'bad',
      'Kode tidak dikenal': 'bad',
      'Jumlah bukan angka': 'bad',
      'Jumlah harus positif': 'bad',
      'Jumlah harus bulat': 'bad',
      'Perbaiki dulu': 'bad',
    },
    vary: ['B2:B9'],
    hints: [
      'Rumuskan urutan pemeriksaan di atas kertas dulu, lalu tulis sebagai IF bersarang. Setiap IF menangkap satu jenis kesalahan dan meneruskan sisanya ke IF berikutnya.',
      'Kode tidak dikenal: COUNTIF terhadap daftar kode sama dengan 0. Jumlah berkoma: jumlah tidak sama dengan INT(jumlah). Periksa ISNUMBER sebelum membandingkan dengan 0.',
      'C2: =IF(A2="","Kode kosong",IF(COUNTIF($E$2:$E$5,A2)=0,"Kode tidak dikenal",IF(NOT(ISNUMBER(B2)),"Jumlah bukan angka",IF(B2<=0,"Jumlah harus positif",IF(B2<>INT(B2),"Jumlah harus bulat","Valid"))))).',
    ],
    explanation:
      'Pemeriksa berlapis seperti ini adalah penjaga gerbang data. Urutannya menentukan pesan yang muncul: kode yang kosong tidak perlu dicek ada atau tidaknya di daftar, dan jumlah teks tidak boleh dibandingkan dengan angka. Satu keputusan di bawah tabel (siap diproses atau tidak) mengubah puluhan pemeriksaan menjadi satu sinyal yang jelas.',
  },
  {
    slug: 'valid-kontrol-anggaran',
    kind: 'latihan',
    title: 'Kontrol Pemakaian Anggaran Divisi',
    category: 'Validasi Data',
    emoji: '🚦',
    level: 'Sedang',
    story:
      'Kepala keuangan memantau pemakaian anggaran enam pos pengeluaran. Pos yang sudah terpakai 90% atau lebih diberi peringatan dini, dan yang melewati 100% ditandai merah agar pengeluaran berikutnya ditahan.',
    task:
      'Isi D2 sampai D7 dengan persentase terpakai (satu desimal), E2 sampai E7 dengan sisa anggaran, F2 sampai F7 dengan status ("Melebihi" bila di atas 100%, "Hampir habis" bila 90% sampai 100%, selain itu "Aman"), dan G2 sampai G7 dengan persentase berbentuk teks tanpa desimal (misalnya 87%). Isi B8 dan C8 dengan total, D8 dengan persentase total, dan F8 dengan status total memakai aturan yang sama.',
    rows: [
      ['Pos', 'Anggaran', 'Terpakai', 'Persen', 'Sisa', 'Status', 'Tampilan'],
      ['Alat tulis', '5000000', '4350000', '', '', '', ''],
      ['Transportasi', '8000000', '8400000', '', '', '', ''],
      ['Konsumsi', '6000000', '5700000', '', '', '', ''],
      ['Listrik dan air', '3500000', '3500000', '', '', '', ''],
      ['Pelatihan', '10000000', '2500000', '', '', '', ''],
      ['Pemeliharaan', '7500000', '7800000', '', '', '', ''],
      ['Total', '', '', '', '', '', ''],
    ],
    solution: {
      ...fill('D', 2, 7, (r) => `=ROUND(C${r}/B${r}*100,1)`),
      ...fill('E', 2, 7, (r) => `=B${r}-C${r}`),
      ...fill('F', 2, 7, (r) => `=IF(D${r}>100,"Melebihi",IF(D${r}>=90,"Hampir habis","Aman"))`),
      ...fill('G', 2, 7, (r) => `=TEXT(C${r}/B${r},"0%")`),
      B8: '=SUM(B2:B7)',
      C8: '=SUM(C2:C7)',
      D8: '=ROUND(C8/B8*100,1)',
      F8: '=IF(D8>100,"Melebihi",IF(D8>=90,"Hampir habis","Aman"))',
    },
    required: {
      ...need(col('D', 2, 7), ['ROUND']),
      ...need(col('E', 2, 7), []),
      ...need(col('F', 2, 7), ['IF']),
      ...need(col('G', 2, 7), ['TEXT']),
      B8: ['SUM'],
      C8: ['SUM'],
      D8: ['ROUND'],
      F8: ['IF'],
    },
    tones: { Melebihi: 'bad', 'Hampir habis': 'warn', Aman: 'ok' },
    vary: ['B2:C7'],
    hints: [
      'Persentase terpakai = terpakai dibagi anggaran dikali 100. Status memakai dua batas, 100 dan 90, jadi cukup dua IF bersarang.',
      'Periksa batas yang lebih tinggi lebih dulu (di atas 100), baru batas 90. TEXT(nilai,"0%") mengubah pecahan 0,87 menjadi teks 87%.',
      'F2: =IF(D2>100,"Melebihi",IF(D2>=90,"Hampir habis","Aman")). G2: =TEXT(C2/B2,"0%"). D8: =ROUND(C8/B8*100,1).',
    ],
    explanation:
      'Lampu lalu lintas hijau, kuning, dan merah adalah bentuk visualisasi paling cepat dibaca. Aturan status yang sama dipakai untuk total, jadi pimpinan melihat kondisi keseluruhan dan per pos dengan logika yang konsisten. Persentase berbentuk teks cocok untuk label, sedangkan yang berbentuk angka cocok untuk perhitungan lanjutan.',
  },
];
