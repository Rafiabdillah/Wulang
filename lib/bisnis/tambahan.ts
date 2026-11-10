import type { ExerciseDef } from '../types';
import { col, fill, need } from './helpers';

// Soal tambahan yang memakai fungsi bisnis baru: RANK, LARGE, MAXIFS, AVERAGEIFS,
// CEILING, FLOOR, SUBSTITUTE, CHOOSE, ISBLANK, SLN, DDB, SYD, dan NPER.

export const TAMBAHAN: ExerciseDef[] = [
  {
    slug: 'bisnis-penyusutan-metode',
    kind: 'tantangan',
    title: 'Tiga Metode Penyusutan Mesin',
    category: 'Keuangan',
    emoji: '🏭',
    level: 'Sulit',
    xp: 40,
    story:
      'Sebuah CV percetakan membeli mesin potong dan perlu memilih metode penyusutan untuk laporan keuangannya. Akuntan ingin melihat ketiga metode berdampingan: garis lurus, saldo menurun ganda, dan jumlah angka tahun.',
    task:
      'Isi B5 sampai D9 dengan beban penyusutan tiap tahun: kolom B memakai SLN, kolom C memakai DDB, kolom D memakai SYD. Isi baris Total (B10 sampai D10) dengan SUM.',
    note: 'Kunci rujukan ke sel harga, nilai sisa, dan umur dengan tanda $ supaya formula bisa disalin ke bawah.',
    rows: [
      ['Harga perolehan (Rp)', '120000000', '', ''],
      ['Nilai sisa (Rp)', '12000000', '', ''],
      ['Umur ekonomis (tahun)', '5', '', ''],
      ['Tahun', 'Garis lurus', 'Saldo menurun ganda', 'Jumlah angka tahun'],
      ['1', '', '', ''],
      ['2', '', '', ''],
      ['3', '', '', ''],
      ['4', '', '', ''],
      ['5', '', '', ''],
      ['Total', '', '', ''],
    ],
    solution: {
      ...fill('B', 5, 9, () => '=SLN($B$1,$B$2,$B$3)'),
      ...fill('C', 5, 9, (r) => `=DDB($B$1,$B$2,$B$3,A${r})`),
      ...fill('D', 5, 9, (r) => `=SYD($B$1,$B$2,$B$3,A${r})`),
      B10: '=SUM(B5:B9)',
      C10: '=SUM(C5:C9)',
      D10: '=SUM(D5:D9)',
    },
    required: {
      ...need(col('B', 5, 9), ['SLN']),
      ...need(col('C', 5, 9), ['DDB']),
      ...need(col('D', 5, 9), ['SYD']),
      ...need(['B10', 'C10', 'D10'], ['SUM']),
    },
    vary: ['B1:B2'],
    hints: [
      'Ketiga fungsi menerima harga perolehan, nilai sisa, dan umur. SYD dan DDB juga butuh nomor tahun yang dihitung.',
      'SLN(harga, sisa, umur) sama untuk semua tahun. DDB(harga, sisa, umur, tahun) dan SYD(harga, sisa, umur, tahun) memakai nomor tahun di kolom A.',
      'B5: =SLN($B$1,$B$2,$B$3). C5: =DDB($B$1,$B$2,$B$3,A5). D5: =SYD($B$1,$B$2,$B$3,A5). Salin ke bawah, lalu SUM di baris Total.',
    ],
    explanation:
      'Garis lurus membagi rata beban tiap tahun. Saldo menurun ganda dan jumlah angka tahun membebankan lebih besar di tahun awal, saat mesin paling produktif. Total ketiganya sama: harga perolehan dikurangi nilai sisa. Yang berbeda hanyalah kapan bebannya diakui, dan itu memengaruhi laba serta pajak tiap tahun.',
  },
  {
    slug: 'bisnis-neraca-saldo',
    kind: 'tantangan',
    title: 'Neraca Saldo dari Jurnal Umum',
    category: 'Keuangan',
    emoji: '📒',
    level: 'Sedang',
    xp: 35,
    story:
      'Toko kelontong milik Pak Anto mencatat lima transaksi bulan ini di jurnal umum. Menjelang akhir bulan, ia perlu neraca saldo untuk memastikan total debit dan total kredit sama sebelum menyusun laporan.',
    task:
      'Isi F2 sampai G6 dengan total debit dan total kredit tiap akun memakai SUMIF dari jurnal di kolom A sampai C. Isi F8 dan G8 dengan total masing-masing kolom, lalu F9 dengan "Seimbang" bila total debit sama dengan total kredit, selain itu "Tidak seimbang".',
    rows: [
      ['Akun', 'Debit (Rp)', 'Kredit (Rp)', '', 'Akun', 'Total debit', 'Total kredit'],
      ['Persediaan', '5000000', '', '', 'Kas', '', ''],
      ['Kas', '', '5000000', '', 'Persediaan', '', ''],
      ['Persediaan', '3000000', '', '', 'Utang usaha', '', ''],
      ['Utang usaha', '', '3000000', '', 'Penjualan', '', ''],
      ['Kas', '9000000', '', '', 'Beban gaji', '', ''],
      ['Penjualan', '', '9000000', '', '', '', ''],
      ['Beban gaji', '2500000', '', '', 'Jumlah', '', ''],
      ['Kas', '', '2500000', '', 'Status', '', ''],
      ['Utang usaha', '1000000', '', '', '', '', ''],
      ['Kas', '', '1000000', '', '', '', ''],
    ],
    solution: {
      ...fill('F', 2, 6, (r) => `=SUMIF($A$2:$A$11,E${r},$B$2:$B$11)`),
      ...fill('G', 2, 6, (r) => `=SUMIF($A$2:$A$11,E${r},$C$2:$C$11)`),
      F8: '=SUM(F2:F6)',
      G8: '=SUM(G2:G6)',
      F9: '=IF(F8=G8,"Seimbang","Tidak seimbang")',
    },
    required: {
      ...need([...col('F', 2, 6), ...col('G', 2, 6)], ['SUMIF']),
      F8: ['SUM'],
      G8: ['SUM'],
      F9: ['IF'],
    },
    vary: ['B2:C11'],
    hints: [
      'Satu akun muncul di banyak baris jurnal. SUMIF menjumlahkan hanya baris yang namanya cocok dengan akun di kolom E.',
      'Rentang kriteria adalah nama akun di A2:A11. Rentang jumlahnya B2:B11 untuk debit dan C2:C11 untuk kredit. Kunci rentangnya dengan $.',
      'F2: =SUMIF($A$2:$A$11,E2,$B$2:$B$11). G2: =SUMIF($A$2:$A$11,E2,$C$2:$C$11). F9: =IF(F8=G8,"Seimbang","Tidak seimbang").',
    ],
    explanation:
      'Setiap transaksi mencatat debit dan kredit yang sama besar, jadi total semua debit pasti sama dengan total semua kredit. Kalau neraca saldo tidak seimbang, ada transaksi yang salah catat atau terlewat. Pengecekan ini dilakukan sebelum laporan keuangan disusun.',
  },
  {
    slug: 'bisnis-lama-pelunasan',
    kind: 'tantangan',
    title: 'Berapa Bulan Utang Lunas?',
    category: 'Keuangan',
    emoji: '⏳',
    level: 'Sulit',
    xp: 35,
    story:
      'Pemilik bengkel mengambil pinjaman modal dan hanya sanggup mencicil tetap tiap bulan. Ia ingin tahu berapa bulan sampai lunas dan berapa bunga yang akhirnya dibayar.',
    task:
      'Isi B5 dengan lama pelunasan dalam bulan memakai NPER, dibulatkan ke atas ke bulan penuh (ROUNDUP, 0 desimal). Isi B6 dengan total yang dibayar = bulan × cicilan, dan B7 dengan total bunga = total dibayar − pinjaman.',
    note: 'Bunga tahunan harus dijadikan bunga per bulan. Cicilan adalah uang keluar, jadi masukkan sebagai angka negatif ke NPER.',
    rows: [
      ['Pinjaman (Rp)', '40000000'],
      ['Bunga per tahun', '0.12'],
      ['Cicilan per bulan (Rp)', '3500000'],
      ['', ''],
      ['Lama pelunasan (bulan)', ''],
      ['Total dibayar (Rp)', ''],
      ['Total bunga (Rp)', ''],
    ],
    solution: {
      B5: '=ROUNDUP(NPER(B2/12,-B3,B1),0)',
      B6: '=B5*B3',
      B7: '=B6-B1',
    },
    required: { B5: ['NPER', 'ROUNDUP'], B6: [], B7: [] },
    vary: ['B1'],
    hints: [
      'NPER(bunga_per_periode, cicilan, pinjaman) mengembalikan jumlah periode. Satuan bunga harus sama dengan satuan periode.',
      'Bunga per bulan = B2/12. Cicilan dimasukkan negatif: -B3. Hasilnya berkoma, jadi bulatkan ke atas dengan ROUNDUP.',
      'B5: =ROUNDUP(NPER(B2/12,-B3,B1),0). B6: =B5*B3. B7: =B6-B1.',
    ],
    explanation:
      'Cicilan yang lebih kecil memperpanjang masa pelunasan, dan bunga yang dibayar ikut naik. Dengan NPER kamu bisa mencoba beberapa besar cicilan sebelum menandatangani kontrak. Hasil pembulatan ke atas dipakai karena bulan terakhir tetap harus dibayar walau cicilannya lebih kecil.',
  },
  {
    slug: 'bisnis-peringkat-sales',
    kind: 'tantangan',
    title: 'Peringkat Tim Sales',
    category: 'Penjualan dan Stok',
    emoji: '🏆',
    level: 'Sedang',
    xp: 30,
    story:
      'Manajer penjualan ingin memberi penghargaan bulanan. Ia butuh peringkat tiap sales, siapa juaranya, dan seberapa jauh jarak juara dari peringkat ketiga.',
    task:
      'Isi C2 sampai C7 dengan peringkat tiap sales memakai RANK (terbesar = peringkat 1). Isi B9 dengan nama juara memakai INDEX, MATCH, dan LARGE. Isi B10 dengan penjualan peringkat ketiga memakai LARGE, dan B11 dengan selisih penjualan juara terhadap peringkat ketiga.',
    rows: [
      ['Sales', 'Penjualan (Rp)', 'Peringkat'],
      ['Rina', '84500000', ''],
      ['Budi', '112300000', ''],
      ['Sari', '97800000', ''],
      ['Doni', '61200000', ''],
      ['Maya', '105600000', ''],
      ['Eko', '73900000', ''],
      ['', '', ''],
      ['Juara bulan ini', '', ''],
      ['Penjualan peringkat 3 (Rp)', '', ''],
      ['Selisih juara dan peringkat 3 (Rp)', '', ''],
    ],
    solution: {
      ...fill('C', 2, 7, (r) => `=RANK(B${r},$B$2:$B$7)`),
      B9: '=INDEX(A2:A7,MATCH(LARGE(B2:B7,1),B2:B7,0))',
      B10: '=LARGE(B2:B7,3)',
      B11: '=LARGE(B2:B7,1)-LARGE(B2:B7,3)',
    },
    required: {
      ...need(col('C', 2, 7), ['RANK']),
      B9: ['INDEX', 'MATCH', 'LARGE'],
      B10: ['LARGE'],
      B11: ['LARGE'],
    },
    vary: ['B2:B7'],
    hints: [
      'RANK menerima angka yang dicari dan rentang pembandingnya. Tanpa argumen ketiga, angka terbesar mendapat peringkat 1.',
      'Kunci rentang pembanding dengan $ supaya tetap B2:B7 saat disalin. LARGE(rentang, 1) adalah yang terbesar, LARGE(rentang, 3) yang ketiga.',
      'C2: =RANK(B2,$B$2:$B$7). B9: =INDEX(A2:A7,MATCH(LARGE(B2:B7,1),B2:B7,0)). B10: =LARGE(B2:B7,3).',
    ],
    explanation:
      'RANK cocok untuk menampilkan urutan di samping data tanpa mengurutkan ulang tabel. LARGE mengambil nilai pada urutan tertentu, dan dipasangkan dengan INDEX dan MATCH ia bisa menemukan nama pemiliknya.',
  },
  {
    slug: 'bisnis-terlaris-per-kategori',
    kind: 'tantangan',
    title: 'Terlaris dan Terendah per Kategori',
    category: 'Penjualan dan Stok',
    emoji: '🍱',
    level: 'Sedang',
    xp: 30,
    story:
      'Kantin kampus menjual makanan dan minuman. Pengelola ingin tahu penjualan tertinggi, terendah, dan rata-rata di tiap kategori untuk menentukan menu yang dipertahankan.',
    task:
      'Isi F2 sampai F3 dengan penjualan tertinggi per kategori (MAXIFS), G2 sampai G3 dengan yang terendah (MINIFS), dan H2 sampai H3 dengan rata-rata (AVERAGEIFS) dibulatkan 1 desimal.',
    rows: [
      ['Menu', 'Kategori', 'Terjual', '', 'Kategori', 'Tertinggi', 'Terendah', 'Rata-rata'],
      ['Nasi ayam', 'Makanan', '310', '', 'Makanan', '', '', ''],
      ['Mi goreng', 'Makanan', '275', '', 'Minuman', '', '', ''],
      ['Soto', 'Makanan', '190', '', '', '', '', ''],
      ['Gado-gado', 'Makanan', '120', '', '', '', '', ''],
      ['Es teh', 'Minuman', '420', '', '', '', '', ''],
      ['Kopi susu', 'Minuman', '260', '', '', '', '', ''],
      ['Jus jeruk', 'Minuman', '155', '', '', '', '', ''],
    ],
    solution: {
      ...fill('F', 2, 3, (r) => `=MAXIFS($C$2:$C$8,$B$2:$B$8,E${r})`),
      ...fill('G', 2, 3, (r) => `=MINIFS($C$2:$C$8,$B$2:$B$8,E${r})`),
      ...fill('H', 2, 3, (r) => `=ROUND(AVERAGEIFS($C$2:$C$8,$B$2:$B$8,E${r}),1)`),
    },
    required: {
      ...need(['F2', 'F3'], ['MAXIFS']),
      ...need(['G2', 'G3'], ['MINIFS']),
      ...need(['H2', 'H3'], ['AVERAGEIFS', 'ROUND']),
    },
    vary: ['C2:C8'],
    hints: [
      'MAXIFS, MINIFS, dan AVERAGEIFS punya pola yang sama dengan SUMIFS: rentang hasil dulu, lalu pasangan rentang kriteria dan kriteria.',
      'Rentang hasil adalah Terjual ($C$2:$C$8), rentang kriteria adalah Kategori ($B$2:$B$8), dan kriterianya sel di kolom E.',
      'F2: =MAXIFS($C$2:$C$8,$B$2:$B$8,E2). G2: =MINIFS(...). H2: =ROUND(AVERAGEIFS($C$2:$C$8,$B$2:$B$8,E2),1).',
    ],
    explanation:
      'Fungsi bersyarat memungkinkan satu tabel menjawab banyak pertanyaan tanpa memecah data. Selisih tertinggi dan terendah dalam satu kategori juga menunjukkan seberapa timpang penjualan antar menu.',
  },
  {
    slug: 'bisnis-harga-psikologis',
    kind: 'tantangan',
    title: 'Harga Jual dan Harga Promo yang Rapi',
    category: 'Penjualan dan Stok',
    emoji: '🏷️',
    level: 'Mudah',
    xp: 20,
    story:
      'Toko perlengkapan rumah menetapkan harga jual dari HPP ditambah markup, tapi kasir kerepotan dengan harga berekor aneh. Pemilik ingin harga jual dibulatkan ke atas ke kelipatan 500, dan harga promo dibulatkan ke bawah ke kelipatan 1000.',
    task:
      'Isi C3 sampai C6 dengan harga hitungan = HPP × (1 + markup). Isi D3 sampai D6 dengan harga jual memakai CEILING kelipatan 500. Isi E3 sampai E6 dengan harga promo = 90% dari harga jual, dibulatkan ke bawah kelipatan 1000 dengan FLOOR.',
    rows: [
      ['Markup', '0.35', '', '', ''],
      ['Produk', 'HPP (Rp)', 'Harga hitungan', 'Harga jual', 'Harga promo'],
      ['Panci', '23400', '', '', ''],
      ['Wajan', '41750', '', '', ''],
      ['Rice cooker', '268000', '', '', ''],
      ['Teko listrik', '115900', '', '', ''],
    ],
    solution: {
      ...fill('C', 3, 6, (r) => `=B${r}*(1+$B$1)`),
      ...fill('D', 3, 6, (r) => `=CEILING(C${r},500)`),
      ...fill('E', 3, 6, (r) => `=FLOOR(D${r}*0.9,1000)`),
    },
    required: {
      ...need(col('C', 3, 6), []),
      ...need(col('D', 3, 6), ['CEILING']),
      ...need(col('E', 3, 6), ['FLOOR']),
    },
    vary: ['B3:B6'],
    hints: [
      'CEILING membulatkan ke atas ke kelipatan terdekat, FLOOR ke bawah. Keduanya menerima angka dan kelipatannya.',
      'Harga hitungan memakai markup di B1 yang dikunci dengan $. Harga jual membulatkan harga hitungan, harga promo membulatkan 90% dari harga jual.',
      'C3: =B3*(1+$B$1). D3: =CEILING(C3,500). E3: =FLOOR(D3*0.9,1000).',
    ],
    explanation:
      'Pembulatan ke atas untuk harga jual menjaga margin tidak berkurang, sedangkan pembulatan ke bawah untuk promo membuat diskon terlihat menarik dan nominalnya mudah dihitung kasir. ROUND biasa tidak bisa memilih arah pembulatan seperti ini.',
  },
  {
    slug: 'bisnis-bersihkan-nomor-telepon',
    kind: 'tantangan',
    title: 'Merapikan Nomor Telepon Pelanggan',
    category: 'SDM dan Operasional',
    emoji: '📱',
    level: 'Sedang',
    xp: 25,
    story:
      'Data pelanggan toko online dikumpulkan dari banyak sumber, jadi nomor teleponnya tertulis dengan format campur: ada yang memakai tanda hubung, ada yang memakai spasi. Sebelum dikirim ke layanan pesan massal, nomornya harus dibersihkan dan dicek panjangnya.',
    task:
      'Isi B2 sampai B6 dengan nomor tanpa tanda hubung dan tanpa spasi memakai SUBSTITUTE. Isi C2 sampai C6 dengan "Valid" bila panjang nomor bersih 10 sampai 13 karakter, selain itu "Periksa".',
    rows: [
      ['Nomor asli', 'Nomor bersih', 'Status'],
      ['0812-3456-7890', '', ''],
      ['0813 4567 8901', '', ''],
      ['0857-123', '', ''],
      ['0821-9876-54321-0', '', ''],
      ['0878 1234 5678', '', ''],
    ],
    solution: {
      ...fill('B', 2, 6, (r) => `=SUBSTITUTE(SUBSTITUTE(A${r},"-","")," ","")`),
      ...fill('C', 2, 6, (r) => `=IF(AND(LEN(B${r})>=10,LEN(B${r})<=13),"Valid","Periksa")`),
    },
    required: {
      ...need(col('B', 2, 6), ['SUBSTITUTE']),
      ...need(col('C', 2, 6), ['IF', 'LEN']),
    },
    hints: [
      'SUBSTITUTE(teks, yang_diganti, penggantinya) mengganti semua kemunculan sebuah karakter. Mengganti dengan "" berarti menghapusnya.',
      'Dua karakter harus dihapus, jadi SUBSTITUTE dipasang di dalam SUBSTITUTE. Panjang diperiksa dengan LEN pada nomor yang sudah bersih.',
      'B2: =SUBSTITUTE(SUBSTITUTE(A2,"-","")," ",""). C2: =IF(AND(LEN(B2)>=10,LEN(B2)<=13),"Valid","Periksa").',
    ],
    explanation:
      'Membersihkan data lebih dulu mencegah pesan gagal terkirim ke nomor yang cacat. Pemeriksaan panjang adalah penyaring sederhana. Nomor yang ditandai Periksa tetap perlu dilihat manusia, karena panjang yang benar belum menjamin nomornya aktif.',
  },
  {
    slug: 'bisnis-tunjangan-golongan',
    kind: 'tantangan',
    title: 'Tunjangan Berdasarkan Golongan',
    category: 'SDM dan Operasional',
    emoji: '🧑‍💼',
    level: 'Mudah',
    xp: 20,
    story:
      'Perusahaan distribusi memberi tunjangan tetap sesuai golongan karyawan, dari golongan 1 sampai 4. Bagian SDM ingin tunjangan terisi otomatis dari nomor golongan supaya tidak salah ketik.',
    task:
      'Isi D2 sampai D6 dengan tunjangan memakai CHOOSE: golongan 1 Rp250.000, golongan 2 Rp500.000, golongan 3 Rp900.000, golongan 4 Rp1.500.000. Isi E2 sampai E6 dengan total = gaji pokok + tunjangan, dan E7 dengan jumlah seluruh total.',
    rows: [
      ['Nama', 'Golongan', 'Gaji pokok (Rp)', 'Tunjangan (Rp)', 'Total (Rp)'],
      ['Ardi', '2', '4200000', '', ''],
      ['Bunga', '1', '3600000', '', ''],
      ['Candra', '4', '7800000', '', ''],
      ['Dian', '3', '5500000', '', ''],
      ['Erwin', '2', '4400000', '', ''],
      ['Jumlah', '', '', '', ''],
    ],
    solution: {
      ...fill('D', 2, 6, (r) => `=CHOOSE(B${r},250000,500000,900000,1500000)`),
      ...fill('E', 2, 6, (r) => `=C${r}+D${r}`),
      E7: '=SUM(E2:E6)',
    },
    required: {
      ...need(col('D', 2, 6), ['CHOOSE']),
      ...need(col('E', 2, 6), []),
      E7: ['SUM'],
    },
    vary: ['C2:C6'],
    hints: [
      'CHOOSE memilih nilai ke-n dari daftar. Angka n adalah argumen pertamanya, lalu disusul daftar pilihannya berurutan.',
      'Pilihan harus diurutkan sesuai nomor golongan: golongan 1 pertama, golongan 2 kedua, dan seterusnya. Nomor golongan ada di kolom B.',
      'D2: =CHOOSE(B2,250000,500000,900000,1500000). E2: =C2+D2. E7: =SUM(E2:E6).',
    ],
    explanation:
      'CHOOSE cocok untuk pilihan yang pendek dan nomornya berurutan. Kalau tabel tunjangan lebih panjang atau sering berubah, sebaiknya dipindah ke tabel tersendiri dan dicari dengan VLOOKUP, supaya perubahan tidak perlu mengubah banyak formula.',
  },
  {
    slug: 'bisnis-kelengkapan-data-karyawan',
    kind: 'tantangan',
    title: 'Cek Kelengkapan Data Karyawan',
    category: 'SDM dan Operasional',
    emoji: '🗂️',
    level: 'Mudah',
    xp: 20,
    story:
      'Menjelang pelaporan pajak tahunan, bagian SDM harus memastikan setiap karyawan punya NPWP dan gaji yang tercatat dengan benar. Beberapa baris masih ada yang kosong atau salah isi.',
    task:
      'Isi E2 sampai E6 dengan "Lengkap" jika NPWP tidak kosong (ISBLANK) dan gaji berupa angka (ISNUMBER), selain itu "Lengkapi". Isi B8 dengan jumlah karyawan yang masih perlu dilengkapi (COUNTIF), dan B9 dengan persentase lengkap sebagai desimal 2 angka (ROUND).',
    rows: [
      ['Nama', 'Kode', 'NPWP', 'Gaji (Rp)', 'Status'],
      ['Ardi', 'K-001', '09.123.456.7-411.000', '4200000', ''],
      ['Bunga', 'K-002', '', '3600000', ''],
      ['Candra', 'K-003', '09.765.432.1-411.000', 'belum diisi', ''],
      ['Dian', 'K-004', '09.555.111.2-411.000', '5500000', ''],
      ['Erwin', 'K-005', '', '4400000', ''],
      ['', '', '', '', ''],
      ['Perlu dilengkapi', '', '', '', ''],
      ['Proporsi lengkap', '', '', '', ''],
    ],
    solution: {
      ...fill('E', 2, 6, (r) => `=IF(AND(NOT(ISBLANK(C${r})),ISNUMBER(D${r})),"Lengkap","Lengkapi")`),
      B8: '=COUNTIF(E2:E6,"Lengkapi")',
      B9: '=ROUND(COUNTIF(E2:E6,"Lengkap")/COUNTA(A2:A6),2)',
    },
    required: {
      ...need(col('E', 2, 6), ['IF', 'ISBLANK', 'ISNUMBER']),
      B8: ['COUNTIF'],
      B9: ['ROUND', 'COUNTIF'],
    },
    hints: [
      'ISBLANK bernilai TRUE untuk sel kosong, ISNUMBER bernilai TRUE untuk sel berisi angka. Keduanya bisa digabung dengan AND.',
      'Kita butuh NPWP tidak kosong, jadi balikkan ISBLANK dengan NOT. Status dihitung per baris, lalu COUNTIF menghitung hasilnya.',
      'E2: =IF(AND(NOT(ISBLANK(C2)),ISNUMBER(D2)),"Lengkap","Lengkapi"). B8: =COUNTIF(E2:E6,"Lengkapi").',
    ],
    explanation:
      'Pemeriksaan otomatis menemukan data bolong dalam hitungan detik, dan hasilnya langsung bisa dihitung dengan COUNTIF. ISNUMBER juga menangkap angka yang tidak sengaja diketik sebagai teks, yang sering menyebabkan SUM menghasilkan angka lebih kecil dari seharusnya.',
  },
];
