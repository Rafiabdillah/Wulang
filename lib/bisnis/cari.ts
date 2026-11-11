import type { ExerciseDef } from '../types';
import { col, fill, need } from './helpers';

// Modul Pencarian dan Relasi Data: menarik data dari tabel acuan dan mencocokkan dua daftar.

export const CARI: ExerciseDef[] = [
  {
    slug: 'cari-faktur-toko',
    kind: 'latihan',
    title: 'Faktur Toko Bangunan dari Daftar Harga',
    category: 'Pencarian & Relasi',
    emoji: '🧱',
    level: 'Sedang',
    story:
      'Kasir toko bangunan hanya mengetik kode barang dan jumlah. Nama dan harga harus terisi sendiri dari daftar harga. Kadang kode salah ketik, dan faktur tidak boleh error karena itu.',
    task:
      'Isi C2 sampai C6 dengan nama barang dan D2 sampai D6 dengan harga dari daftar di kolom G sampai I. Kode yang tidak ada di daftar menampilkan "Kode tidak terdaftar" pada nama dan 0 pada harga. Isi E2 sampai E6 dengan subtotal dan E7 dengan total tagihan.',
    note: 'Pakai pencarian kecocokan persis. Kunci rentang daftar harga dengan tanda $.',
    rows: [
      ['Kode', 'Jumlah', 'Nama barang', 'Harga', 'Subtotal', '', 'Kode', 'Nama', 'Harga'],
      ['B-102', '4', '', '', '', '', 'B-101', 'Semen 50 kg', '68000'],
      ['B-105', '10', '', '', '', '', 'B-102', 'Cat tembok 5 kg', '145000'],
      ['B-101', '20', '', '', '', '', 'B-103', 'Paku 1 kg', '24000'],
      ['B-109', '2', '', '', '', '', 'B-104', 'Pipa PVC 3 m', '38000'],
      ['B-103', '6', '', '', '', '', 'B-105', 'Kuas 3 inci', '12500'],
      ['Total tagihan', '', '', '', '', '', '', '', ''],
    ],
    solution: {
      ...fill('C', 2, 6, (r) => `=IFNA(VLOOKUP(A${r},$G$2:$I$6,2,FALSE),"Kode tidak terdaftar")`),
      ...fill('D', 2, 6, (r) => `=IFNA(VLOOKUP(A${r},$G$2:$I$6,3,FALSE),0)`),
      ...fill('E', 2, 6, (r) => `=B${r}*D${r}`),
      E7: '=SUM(E2:E6)',
    },
    required: {
      ...need(col('C', 2, 6), ['VLOOKUP', 'IFNA']),
      ...need(col('D', 2, 6), ['VLOOKUP', 'IFNA']),
      ...need(col('E', 2, 6), []),
      E7: ['SUM'],
    },
    vary: ['B2:B6', 'I2:I6'],
    hints: [
      'VLOOKUP dengan argumen terakhir FALSE mencari kode yang persis sama. Kolom nama adalah kolom ke-2 tabel, harga kolom ke-3.',
      'Kode yang tidak ketemu menghasilkan #N/A. IFNA(rumus, nilai_pengganti) menggantinya, dan hanya #N/A yang diganti.',
      'C2: =IFNA(VLOOKUP(A2,$G$2:$I$6,2,FALSE),"Kode tidak terdaftar"). D2: =IFNA(VLOOKUP(A2,$G$2:$I$6,3,FALSE),0).',
    ],
    explanation:
      'Daftar harga dipisah dari transaksi supaya perubahan harga cukup dilakukan di satu tempat. IFNA lebih aman daripada IFERROR di sini: kalau rentang tabel salah ketik sehingga muncul #REF!, kesalahannya tetap kelihatan dan tidak tersamarkan.',
  },
  {
    slug: 'cari-ongkir-dua-arah',
    kind: 'latihan',
    title: 'Tarif Ongkir Berdasarkan Berat dan Zona',
    category: 'Pencarian & Relasi',
    emoji: '🚚',
    level: 'Sulit',
    story:
      'Sebuah toko online memakai tarif kurir berupa tabel dua arah: baris menurut rentang berat, kolom menurut zona tujuan. Tiap resi harus mencari titik temu baris dan kolom yang tepat.',
    task:
      'Isi D2 sampai D7 dengan ongkir tiap resi dari tabel tarif di F sampai I, lalu D8 dengan total ongkir. Baris ditentukan oleh berat (kolom F berisi batas bawah tiap rentang), kolom ditentukan oleh nama zona.',
    note: 'Berat 5 kg tepat termasuk rentang yang mulai dari 5, bukan rentang sebelumnya.',
    rows: [
      ['Resi', 'Berat (kg)', 'Zona', 'Ongkir', '', 'Berat mulai (kg)', 'Zona 1', 'Zona 2', 'Zona 3'],
      ['R-01', '0.8', 'Zona 1', '', '', '0', '9000', '12000', '16000'],
      ['R-02', '3', 'Zona 3', '', '', '1', '15000', '20000', '27000'],
      ['R-03', '7.5', 'Zona 2', '', '', '5', '32000', '41000', '55000'],
      ['R-04', '12', 'Zona 1', '', '', '10', '60000', '78000', '99000'],
      ['R-05', '1', 'Zona 2', '', '', '', '', '', ''],
      ['R-06', '5', 'Zona 3', '', '', '', '', '', ''],
      ['Total ongkir', '', '', '', '', '', '', '', ''],
    ],
    solution: {
      ...fill('D', 2, 7, (r) => `=INDEX($G$2:$I$5,MATCH(B${r},$F$2:$F$5,1),MATCH(C${r},$G$1:$I$1,0))`),
      D8: '=SUM(D2:D7)',
    },
    required: {
      ...need(col('D', 2, 7), ['INDEX', 'MATCH']),
      D8: ['SUM'],
    },
    vary: ['B2:B7', 'G2:I5'],
    hints: [
      'Cari nomor baris dengan MATCH pada kolom batas berat, dan nomor kolom dengan MATCH pada judul zona. INDEX lalu mengambil sel di titik temunya.',
      'MATCH tipe 1 pada daftar yang terurut menaik menemukan batas bawah terbesar yang tidak melebihi berat. MATCH tipe 0 dipakai untuk nama zona.',
      'D2: =INDEX($G$2:$I$5,MATCH(B2,$F$2:$F$5,1),MATCH(C2,$G$1:$I$1,0)).',
    ],
    explanation:
      'INDEX dengan dua MATCH adalah cara standar membaca tabel dua arah. Tipe 1 pada MATCH dipakai untuk rentang (tarif bertingkat), tipe 0 untuk nama persis. Kombinasi ini tidak peduli urutan kolom, jadi aman kalau zona baru ditambahkan.',
  },
  {
    slug: 'cari-anggaran-mendatar',
    kind: 'latihan',
    title: 'Anggaran Bulanan yang Tersusun Mendatar',
    category: 'Pencarian & Relasi',
    emoji: '🗓️',
    level: 'Sedang',
    story:
      'Bagian keuangan menyimpan anggaran dan realisasi per bulan dalam tabel mendatar: bulan di baris judul, jenis angka di baris-baris bawahnya. Pimpinan sering menanyakan satu bulan tertentu.',
    task:
      'Untuk tiap bulan yang ditanyakan di A6 sampai A9, isi B (anggaran) dan C (realisasi) dari tabel di atas. Isi D dengan selisih (anggaran dikurangi realisasi), dan E dengan "Melebihi" bila selisih negatif, selain itu "Aman".',
    rows: [
      ['Pos', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'],
      ['Anggaran', '12000000', '12000000', '15000000', '13000000', '14000000', '16000000'],
      ['Realisasi', '11200000', '12800000', '14500000', '13900000', '12900000', '16400000'],
      ['', '', '', '', '', '', ''],
      ['Bulan ditanya', 'Anggaran', 'Realisasi', 'Selisih', 'Status', '', ''],
      ['Mar', '', '', '', '', '', ''],
      ['Feb', '', '', '', '', '', ''],
      ['Mei', '', '', '', '', '', ''],
      ['Jun', '', '', '', '', '', ''],
    ],
    solution: {
      ...fill('B', 6, 9, (r) => `=HLOOKUP($A${r},$B$1:$G$3,2,FALSE)`),
      ...fill('C', 6, 9, (r) => `=HLOOKUP($A${r},$B$1:$G$3,3,FALSE)`),
      ...fill('D', 6, 9, (r) => `=B${r}-C${r}`),
      ...fill('E', 6, 9, (r) => `=IF(D${r}<0,"Melebihi","Aman")`),
    },
    required: {
      ...need(col('B', 6, 9), ['HLOOKUP']),
      ...need(col('C', 6, 9), ['HLOOKUP']),
      ...need(col('D', 6, 9), []),
      ...need(col('E', 6, 9), ['IF']),
    },
    tones: { Melebihi: 'bad', Aman: 'ok' },
    vary: ['B2:G3'],
    hints: [
      'Tabel ini mendatar, jadi pakai versi mendatar dari VLOOKUP: ia mencari di baris judul teratas.',
      'HLOOKUP(dicari, tabel, nomor_baris, FALSE). Anggaran ada di baris ke-2 tabel dan realisasi di baris ke-3.',
      'B6: =HLOOKUP($A6,$B$1:$G$3,2,FALSE). C6: sama dengan nomor baris 3. E6: =IF(D6<0,"Melebihi","Aman").',
    ],
    explanation:
      'HLOOKUP dan VLOOKUP bersaudara: yang satu mencari di baris judul, yang lain di kolom kunci. Memilih yang sesuai arah tabel menghindari kebutuhan memutar data. Tanda $ pada kolom A ($A6) menjaga kolom tetap saat rumus disalin ke bawah.',
  },
  {
    slug: 'cari-kunci-di-kanan',
    kind: 'latihan',
    title: 'Mencari Nama dari NIK yang Ada di Kanan',
    category: 'Pencarian & Relasi',
    emoji: '🪪',
    level: 'Sedang',
    story:
      'Daftar karyawan menaruh NIK di kolom paling kanan, sedangkan absensi hanya mencatat NIK. VLOOKUP tidak bisa mengambil kolom di sebelah kiri kunci, jadi perlu cara lain. Ada NIK yang belum masuk daftar karyawan.',
    task:
      'Isi F2 sampai F6 dengan nama karyawan memakai XLOOKUP, dengan teks "Tidak terdaftar" bila NIK tidak ada. Isi G2 sampai G6 dengan divisi memakai kombinasi INDEX dan MATCH, dengan tanda "-" bila NIK tidak ada.',
    rows: [
      ['Nama', 'Divisi', 'NIK', '', 'NIK absen', 'Nama', 'Divisi'],
      ['Ratna Dewi', 'Keuangan', 'K-201', '', 'K-204', '', ''],
      ['Hendra Wijaya', 'Gudang', 'K-202', '', 'K-201', '', ''],
      ['Lina Marlina', 'Pemasaran', 'K-203', '', 'K-299', '', ''],
      ['Agus Salim', 'Gudang', 'K-204', '', 'K-203', '', ''],
      ['Maya Sari', 'Keuangan', 'K-205', '', 'K-202', '', ''],
      ['Tono Hartono', 'Pemasaran', 'K-206', '', '', '', ''],
    ],
    solution: {
      ...fill('F', 2, 6, (r) => `=XLOOKUP(E${r},$C$2:$C$7,$A$2:$A$7,"Tidak terdaftar")`),
      ...fill('G', 2, 6, (r) => `=IFNA(INDEX($B$2:$B$7,MATCH(E${r},$C$2:$C$7,0)),"-")`),
    },
    required: {
      ...need(col('F', 2, 6), ['XLOOKUP']),
      ...need(col('G', 2, 6), ['INDEX', 'MATCH', 'IFNA']),
    },
    hints: [
      'XLOOKUP boleh mengambil dari kolom mana pun, termasuk kiri kunci. Argumen keempatnya adalah nilai bila tidak ketemu.',
      'Untuk divisi, MATCH(NIK, kolom_NIK, 0) memberi nomor baris, INDEX(kolom_divisi, nomor) mengambil isinya. Bungkus dengan IFNA.',
      'F2: =XLOOKUP(E2,$C$2:$C$7,$A$2:$A$7,"Tidak terdaftar"). G2: =IFNA(INDEX($B$2:$B$7,MATCH(E2,$C$2:$C$7,0)),"-").',
    ],
    explanation:
      'INDEX dengan MATCH adalah pengganti VLOOKUP yang berfungsi pada versi spreadsheet mana pun dan bebas dari batas "kunci harus di kiri". XLOOKUP lebih ringkas, tetapi tahu keduanya membuatmu bisa bekerja di file lama rekan kerja.',
  },
  {
    slug: 'cari-gabung-pesanan',
    kind: 'tantangan',
    title: 'Menggabungkan Pesanan dengan Data Pelanggan dan Produk',
    category: 'Pencarian & Relasi',
    emoji: '🔗',
    level: 'Sulit',
    xp: 45,
    story:
      'Distributor sembako mencatat pesanan hanya dengan kode pelanggan, kode produk, dan jumlah. Untuk surat jalan, tiap pesanan perlu nama pelanggan, kota tujuan, nama produk, harga, dan nilai pesanan. Data pelanggan dan produk ada di dua tabel acuan di bawah.',
    task:
      'Isi D sampai H untuk baris 2 sampai 7. D: nama pelanggan (VLOOKUP). E: kota (VLOOKUP). F: nama produk (XLOOKUP). G: harga satuan (INDEX dan MATCH). H: nilai pesanan (jumlah kali harga). Isi H8 dengan total semua pesanan.',
    rows: [
      ['Pelanggan', 'Produk', 'Jumlah', 'Nama pelanggan', 'Kota', 'Nama produk', 'Harga', 'Nilai'],
      ['P-01', 'K-1', '10', '', '', '', '', ''],
      ['P-02', 'K-3', '5', '', '', '', '', ''],
      ['P-01', 'K-2', '20', '', '', '', '', ''],
      ['P-03', 'K-1', '8', '', '', '', '', ''],
      ['P-03', 'K-4', '2', '', '', '', '', ''],
      ['P-02', 'K-4', '6', '', '', '', '', ''],
      ['Total pesanan', '', '', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['Kode pelanggan', 'Nama', 'Kota', '', '', '', '', ''],
      ['P-01', 'Toko Sinar', 'Malang', '', '', '', '', ''],
      ['P-02', 'CV Bahari', 'Surabaya', '', '', '', '', ''],
      ['P-03', 'UD Lestari', 'Kediri', '', '', '', '', ''],
      ['', '', '', '', '', '', '', ''],
      ['Kode produk', 'Nama', 'Harga', '', '', '', '', ''],
      ['K-1', 'Beras 5 kg', '68000', '', '', '', '', ''],
      ['K-2', 'Minyak goreng 2 L', '36000', '', '', '', '', ''],
      ['K-3', 'Gula pasir 1 kg', '16000', '', '', '', '', ''],
      ['K-4', 'Telur 1 kg', '30000', '', '', '', '', ''],
    ],
    solution: {
      ...fill('D', 2, 7, (r) => `=VLOOKUP(A${r},$A$11:$C$13,2,FALSE)`),
      ...fill('E', 2, 7, (r) => `=VLOOKUP(A${r},$A$11:$C$13,3,FALSE)`),
      ...fill('F', 2, 7, (r) => `=XLOOKUP(B${r},$A$16:$A$19,$B$16:$B$19)`),
      ...fill('G', 2, 7, (r) => `=INDEX($C$16:$C$19,MATCH(B${r},$A$16:$A$19,0))`),
      ...fill('H', 2, 7, (r) => `=C${r}*G${r}`),
      H8: '=SUM(H2:H7)',
    },
    required: {
      ...need(col('D', 2, 7), ['VLOOKUP']),
      ...need(col('E', 2, 7), ['VLOOKUP']),
      ...need(col('F', 2, 7), ['XLOOKUP']),
      ...need(col('G', 2, 7), ['INDEX', 'MATCH']),
      ...need(col('H', 2, 7), []),
      H8: ['SUM'],
    },
    vary: ['C2:C7', 'C16:C19'],
    hints: [
      'Satu pesanan butuh empat pencarian ke dua tabel berbeda. Kerjakan satu kolom sampai benar, lalu salin polanya.',
      'Tabel pelanggan ada di A11:C13 dan tabel produk di A16:C19. Kunci keduanya dengan $. Kolom ke-2 tabel pelanggan adalah nama, kolom ke-3 adalah kota.',
      'F2: =XLOOKUP(B2,$A$16:$A$19,$B$16:$B$19). G2: =INDEX($C$16:$C$19,MATCH(B2,$A$16:$A$19,0)). H2: =C2*G2.',
    ],
    explanation:
      'Inilah pola dasar basis data relasional di spreadsheet: tabel transaksi hanya menyimpan kode, dan tabel acuan menyimpan detail. Mengubah nama pelanggan atau harga cukup di satu tempat, dan semua pesanan ikut berubah.',
  },
  {
    slug: 'cari-rekonsiliasi-bank',
    kind: 'tantangan',
    title: 'Rekonsiliasi Tagihan dengan Mutasi Bank',
    category: 'Pencarian & Relasi',
    emoji: '🏦',
    level: 'Sulit',
    xp: 50,
    story:
      'Staf piutang mencocokkan lima faktur penjualan dengan mutasi rekening koran. Satu faktur dibayar dua kali cicil, satu belum dibayar sama sekali, dan ada transfer masuk yang referensinya tidak dikenal.',
    task:
      'Isi C2 sampai C6 dengan total yang sudah dibayar tiap faktur (jumlahkan semua mutasi dengan referensi sama). Isi D2 sampai D6 dengan status: "Belum bayar" bila 0, "Kurang bayar" bila kurang dari tagihan, "Lunas" bila sama, "Lebih bayar" bila lebih. Isi H2 sampai H8 dengan "Cocok" bila referensi mutasi ada di daftar faktur, selain itu "Tidak dikenal". Isi B8 total ditagih, B9 total diterima, dan B10 dana yang tidak dikenal.',
    rows: [
      ['No. faktur', 'Tagihan', 'Dibayar', 'Status', '', 'Referensi', 'Jumlah', 'Cek'],
      ['INV-101', '5000000', '', '', '', 'INV-101', '5000000', ''],
      ['INV-102', '3200000', '', '', '', 'INV-102', '1600000', ''],
      ['INV-103', '7500000', '', '', '', 'INV-103', '7500000', ''],
      ['INV-104', '1800000', '', '', '', 'INV-102', '1000000', ''],
      ['INV-105', '4200000', '', '', '', 'INV-105', '4200000', ''],
      ['', '', '', '', '', 'INV-999', '900000', ''],
      ['Total ditagih', '', '', '', '', 'INV-998', '350000', ''],
      ['Total diterima', '', '', '', '', '', '', ''],
      ['Dana tidak dikenal', '', '', '', '', '', '', ''],
    ],
    solution: {
      ...fill('C', 2, 6, (r) => `=SUMIF($F$2:$F$8,A${r},$G$2:$G$8)`),
      ...fill('D', 2, 6, (r) => `=IF(C${r}=0,"Belum bayar",IF(C${r}<B${r},"Kurang bayar",IF(C${r}=B${r},"Lunas","Lebih bayar")))`),
      ...fill('H', 2, 8, (r) => `=IF(COUNTIF($A$2:$A$6,F${r})>0,"Cocok","Tidak dikenal")`),
      B8: '=SUM(B2:B6)',
      B9: '=SUM(G2:G8)',
      B10: '=SUMIF(H2:H8,"Tidak dikenal",G2:G8)',
    },
    required: {
      ...need(col('C', 2, 6), ['SUMIF']),
      ...need(col('D', 2, 6), ['IF']),
      ...need(col('H', 2, 8), ['IF', 'COUNTIF']),
      B8: ['SUM'],
      B9: ['SUM'],
      B10: ['SUMIF'],
    },
    tones: {
      Lunas: 'ok',
      Cocok: 'ok',
      'Kurang bayar': 'warn',
      'Lebih bayar': 'warn',
      'Belum bayar': 'bad',
      'Tidak dikenal': 'bad',
    },
    vary: ['B2:B6', 'G2:G8'],
    hints: [
      'Satu faktur bisa muncul beberapa kali di mutasi, jadi jangan pakai VLOOKUP yang hanya mengambil kemunculan pertama. Jumlahkan dengan SUMIF.',
      'Status memakai IF bersarang: periksa 0 dulu, lalu kurang, lalu sama. Untuk arah sebaliknya (mutasi yang tidak punya faktur), COUNTIF terhadap daftar faktur menghasilkan 0.',
      'C2: =SUMIF($F$2:$F$8,A2,$G$2:$G$8). H2: =IF(COUNTIF($A$2:$A$6,F2)>0,"Cocok","Tidak dikenal"). B10: =SUMIF(H2:H8,"Tidak dikenal",G2:G8).',
    ],
    explanation:
      'Rekonsiliasi selalu dua arah: tiap tagihan dicari pembayarannya, dan tiap pembayaran dicari tagihannya. Pembayaran cicil menuntut SUMIF, bukan VLOOKUP. Daftar yang tidak cocok ke salah satu arah adalah bahan kerja berikutnya: telepon pelanggan, atau telusuri transfer misterius.',
  },
];
