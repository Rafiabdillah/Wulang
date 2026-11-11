import type { ExerciseDef } from '../types';
import { col, fill, need } from './helpers';

// Modul Pembersihan dan Persiapan Data: data kotor dari formulir, ekspor kasir, dan impor sistem lain.

export const BERSIH: ExerciseDef[] = [
  {
    slug: 'bersih-spasi-nama',
    kind: 'latihan',
    title: 'Merapikan Nama Peserta Pelatihan',
    category: 'Pembersihan Data',
    emoji: '🧼',
    level: 'Mudah',
    story:
      'Panitia pelatihan menerima daftar peserta dari formulir online. Ada yang mengetik dengan huruf kapital semua, ada yang memberi spasi ganda dan spasi di ujung. Sertifikat harus tercetak rapi, jadi nama harus dibersihkan dulu.',
    task:
      'Isi B2 sampai B7 dengan nama yang rapi: spasi berlebih dibuang dan tiap kata diawali huruf kapital. Isi C2 sampai C7 dengan inisial, yaitu huruf pertama kata pertama dan huruf pertama kata kedua dari nama rapi (contoh: Budi Santoso menjadi BS).',
    note: 'Nama pada semua baris terdiri dari dua kata, jadi kata kedua dimulai tepat setelah spasi pertama.',
    rows: [
      ['Nama dari formulir', 'Nama rapi', 'Inisial'],
      ['  budi   SANTOSO ', '', ''],
      ['siti rahayu', '', ''],
      ['AHMAD  fauzi', '', ''],
      ['dewi LESTARI  ', '', ''],
      ['  rina wulandari', '', ''],
      ['EKO   prasetyo', '', ''],
    ],
    solution: {
      ...fill('B', 2, 7, (r) => `=PROPER(TRIM(A${r}))`),
      ...fill('C', 2, 7, (r) => `=LEFT(B${r},1)&MID(B${r},FIND(" ",B${r})+1,1)`),
    },
    required: {
      ...need(col('B', 2, 7), ['PROPER', 'TRIM']),
      ...need(col('C', 2, 7), ['LEFT', 'MID', 'FIND']),
    },
    hints: [
      'TRIM membuang spasi di ujung dan menyisakan satu spasi antar kata. PROPER mengatur huruf kapital.',
      'Susun keduanya: TRIM dulu, lalu hasilnya dimasukkan ke PROPER. Untuk inisial, FIND(" ",teks) memberi posisi spasi.',
      'B2: =PROPER(TRIM(A2)). C2: =LEFT(B2,1)&MID(B2,FIND(" ",B2)+1,1).',
    ],
    explanation:
      'Spasi tersembunyi adalah penyebab paling umum data tidak cocok saat dicari atau dihitung. TRIM dan PROPER hampir selalu menjadi dua langkah pertama membersihkan teks. Inisial menunjukkan pola yang sering dipakai: FIND mencari posisi pemisah, lalu MID mengambil teks tepat sesudahnya.',
  },
  {
    slug: 'bersih-angka-teks',
    kind: 'latihan',
    title: 'Omzet yang Tersimpan Sebagai Teks',
    category: 'Pembersihan Data',
    emoji: '🔢',
    level: 'Mudah',
    story:
      'Pemilik warung menerima ekspor omzet harian dari aplikasi kasir lama. Angkanya berawalan "Rp", memakai titik ribuan, dan semuanya tersimpan sebagai teks. Saat dijumlahkan, hasil SUM selalu 0.',
    task:
      'Isi B2 sampai B7 dengan angka sungguhan dari teks di kolom A. Lalu isi B8 dengan total omzet dan B9 dengan rata-rata omzet harian.',
    note: 'Total dan rata-rata dihitung dari kolom B, bukan dari kolom A.',
    rows: [
      ['Omzet (teks dari ekspor)', 'Omzet (angka)'],
      ['Rp 1.500.000', ''],
      ['Rp2.250.000', ''],
      ['Rp 875.000', ''],
      ['3.100.000', ''],
      ['Rp 1.200.000,50', ''],
      ['Rp 640.000', ''],
      ['Total omzet', ''],
      ['Rata-rata harian', ''],
    ],
    solution: {
      ...fill('B', 2, 7, (r) => `=VALUE(A${r})`),
      B8: '=SUM(B2:B7)',
      B9: '=AVERAGE(B2:B7)',
    },
    required: {
      ...need(col('B', 2, 7), ['VALUE']),
      B8: ['SUM'],
      B9: ['AVERAGE'],
    },
    hints: [
      'Cari fungsi yang mengubah teks angka menjadi angka. Ia mengerti awalan Rp, titik ribuan, dan koma desimal.',
      'VALUE(sel) cukup untuk tiap baris. Setelah kolom B berisi angka, SUM dan AVERAGE bekerja normal.',
      'B2: =VALUE(A2) disalin ke bawah. B8: =SUM(B2:B7). B9: =AVERAGE(B2:B7).',
    ],
    explanation:
      'SUM dan AVERAGE mengabaikan teks, jadi angka yang tersimpan sebagai teks diam-diam hilang dari total. Tanda-tandanya: angka rata kiri dan hasil total terlalu kecil. VALUE mengubahnya menjadi angka, dan memisahkan langkah pembersihan dari langkah menghitung membuat kesalahan mudah dilacak.',
  },
  {
    slug: 'bersih-pisah-email',
    kind: 'latihan',
    title: 'Memecah Alamat Email Pelanggan',
    category: 'Pembersihan Data',
    emoji: '📧',
    level: 'Sedang',
    story:
      'Tim pemasaran ingin mengirim buletin dengan sapaan personal dan mengelompokkan pelanggan menurut domain email. Datanya hanya satu kolom berisi alamat lengkap.',
    task:
      'Isi B2 sampai B6 dengan nama pengguna (bagian sebelum @), C2 sampai C6 dengan domain (bagian sesudah @), dan D2 sampai D6 dengan nama sapaan: titik dan garis bawah pada nama pengguna menjadi spasi, tiap kata berhuruf kapital di awal.',
    rows: [
      ['Email', 'Nama pengguna', 'Domain', 'Nama sapaan'],
      ['budi.santoso@kampus.ac.id', '', '', ''],
      ['siti.rahayu@toko-maju.co.id', '', '', ''],
      ['andi@gmail.com', '', '', ''],
      ['dewi.lestari.putri@kantor.id', '', '', ''],
      ['rina_w@mail.com', '', '', ''],
    ],
    solution: {
      ...fill('B', 2, 6, (r) => `=TEXTBEFORE(A${r},"@")`),
      ...fill('C', 2, 6, (r) => `=TEXTAFTER(A${r},"@")`),
      ...fill('D', 2, 6, (r) => `=PROPER(SUBSTITUTE(SUBSTITUTE(B${r},"."," "),"_"," "))`),
    },
    required: {
      ...need(col('B', 2, 6), ['TEXTBEFORE']),
      ...need(col('C', 2, 6), ['TEXTAFTER']),
      ...need(col('D', 2, 6), ['PROPER', 'SUBSTITUTE']),
    },
    hints: [
      'Ada dua fungsi yang memotong teks di sekitar pemisah tertentu: satu mengambil bagian depan, satu bagian belakang.',
      'TEXTBEFORE(teks,"@") dan TEXTAFTER(teks,"@"). Untuk sapaan, ganti "." lalu "_" dengan spasi memakai SUBSTITUTE bersarang, lalu PROPER.',
      'D2: =PROPER(SUBSTITUTE(SUBSTITUTE(B2,"."," "),"_"," ")).',
    ],
    explanation:
      'Memecah satu kolom menjadi beberapa kolom bermakna adalah pekerjaan pembersihan yang sangat sering. Dengan pemisah yang konsisten, TEXTBEFORE dan TEXTAFTER lebih mudah dibaca daripada kombinasi LEFT, FIND, dan LEN. Gunakan SUBSTITUTE bersarang saat ada lebih dari satu jenis pemisah.',
  },
  {
    slug: 'bersih-kode-produk',
    kind: 'latihan',
    title: 'Membongkar Kode Produk Gudang',
    category: 'Pembersihan Data',
    emoji: '🏷️',
    level: 'Sulit',
    story:
      'Kode produk di gudang berbentuk KATEGORI-TAHUN-NOMOR, misalnya ELK-2026-0031. Panjang kode kategori berbeda-beda, jadi tidak bisa dipotong dengan posisi tetap. Admin gudang perlu memecah kode untuk rekap dan menyiapkan kode berikutnya.',
    task:
      'Isi B2 sampai B7 dengan kategori (teks sebelum tanda minus pertama), C2 sampai C7 dengan tahun sebagai angka, D2 sampai D7 dengan nomor urut sebagai angka, dan E2 sampai E7 dengan kode berikutnya: kode yang sama dengan nomor urut ditambah 1, tetap empat digit.',
    note: 'Contoh: ELK-2026-0031 menghasilkan kode berikutnya ELK-2026-0032.',
    rows: [
      ['Kode produk', 'Kategori', 'Tahun', 'No. urut', 'Kode berikutnya'],
      ['ELK-2026-0031', '', '', '', ''],
      ['FURN-2025-0108', '', '', '', ''],
      ['ATK-2026-0007', '', '', '', ''],
      ['PERABOT-2024-0452', '', '', '', ''],
      ['ELK-2025-0219', '', '', '', ''],
      ['ATK-2026-0099', '', '', '', ''],
    ],
    solution: {
      ...fill('B', 2, 7, (r) => `=LEFT(A${r},FIND("-",A${r})-1)`),
      ...fill('C', 2, 7, (r) => `=VALUE(MID(A${r},FIND("-",A${r})+1,4))`),
      ...fill('D', 2, 7, (r) => `=VALUE(RIGHT(A${r},4))`),
      ...fill('E', 2, 7, (r) => `=LEFT(A${r},LEN(A${r})-4)&TEXT(D${r}+1,"0000")`),
    },
    required: {
      ...need(col('B', 2, 7), ['LEFT', 'FIND']),
      ...need(col('C', 2, 7), ['MID', 'FIND', 'VALUE']),
      ...need(col('D', 2, 7), ['RIGHT', 'VALUE']),
      ...need(col('E', 2, 7), ['LEFT', 'LEN', 'TEXT']),
    },
    hints: [
      'Kategori berakhir tepat sebelum tanda minus pertama, yang posisinya dicari FIND. Tahun dimulai satu karakter sesudahnya dan selalu empat digit.',
      'Nomor urut selalu empat karakter terakhir. MID dan RIGHT menghasilkan teks, jadi bungkus dengan VALUE agar menjadi angka. TEXT(angka,"0000") menambah nol di depan.',
      'E2: =LEFT(A2,LEN(A2)-4)&TEXT(D2+1,"0000"). B2: =LEFT(A2,FIND("-",A2)-1). C2: =VALUE(MID(A2,FIND("-",A2)+1,4)).',
    ],
    explanation:
      'Kode dengan panjang bagian yang berubah-ubah harus dipotong dengan FIND, bukan posisi tetap. Bagian yang pasti (empat digit terakhir) boleh memakai RIGHT. TEXT dengan pola "0000" mengembalikan nol di depan yang hilang ketika angka dihitung.',
  },
  {
    slug: 'bersih-duplikat-pelanggan',
    kind: 'latihan',
    title: 'Mendeteksi Pelanggan Ganda',
    category: 'Pembersihan Data',
    emoji: '👯',
    level: 'Sedang',
    story:
      'Daftar pelanggan sebuah distributor digabung dari tiga cabang. Nama yang sama ditulis dengan huruf dan spasi berbeda, sehingga satu pelanggan terhitung dua kali di laporan. Sebelum digabung, harus ketahuan mana yang kembar.',
    task:
      'Isi B2 sampai B9 dengan kunci pencocokan: nama tanpa spasi berlebih dan berhuruf kecil. Isi C2 sampai C9 dengan "Duplikat" bila kunci itu sudah muncul di baris atas (atau baris itu sendiri bukan yang pertama), selain itu "Unik". Isi F2 dengan jumlah baris Unik dan F3 dengan jumlah baris Duplikat.',
    note: 'Rentang COUNTIF yang bertambah panjang ke bawah ($B$2:B2) membuat baris pertama suatu nama selalu dihitung unik.',
    rows: [
      ['Nama pelanggan', 'Kunci', 'Status', '', 'Ringkasan', ''],
      ['Toko Maju Jaya', '', '', '', 'Jumlah unik', ''],
      ['  toko maju jaya', '', '', '', 'Jumlah duplikat', ''],
      ['CV Sentosa ', '', '', '', '', ''],
      ['cv sentosa', '', '', '', '', ''],
      ['UD Berkah', '', '', '', '', ''],
      ['Toko Maju Jaya', '', '', '', '', ''],
      ['PT Nusantara', '', '', '', '', ''],
      ['ud  berkah', '', '', '', '', ''],
    ],
    solution: {
      ...fill('B', 2, 9, (r) => `=LOWER(TRIM(A${r}))`),
      ...fill('C', 2, 9, (r) => `=IF(COUNTIF($B$2:B${r},B${r})>1,"Duplikat","Unik")`),
      F2: '=COUNTIF(C2:C9,"Unik")',
      F3: '=COUNTIF(C2:C9,"Duplikat")',
    },
    required: {
      ...need(col('B', 2, 9), ['LOWER', 'TRIM']),
      ...need(col('C', 2, 9), ['IF', 'COUNTIF']),
      F2: ['COUNTIF'],
      F3: ['COUNTIF'],
    },
    tones: { Duplikat: 'bad', Unik: 'ok' },
    hints: [
      'Samakan dulu bentuk nama (huruf kecil, spasi rapi) di kolom B. Pencocokan dilakukan pada kolom bantu itu, bukan pada nama asli.',
      'COUNTIF($B$2:B2,B2) menghitung berapa kali kunci baris ini muncul dari baris 2 sampai baris ini. Lebih dari 1 berarti sudah pernah muncul.',
      'C2: =IF(COUNTIF($B$2:B2,B2)>1,"Duplikat","Unik") disalin ke bawah. F2: =COUNTIF(C2:C9,"Unik").',
    ],
    explanation:
      'Pendeteksi duplikat selalu bekerja pada kunci yang sudah dinormalkan. Rentang yang mulai dari sel terkunci lalu memanjang ke bawah menandai kemunculan kedua dan seterusnya, sehingga kemunculan pertama tetap dianggap data utama yang dipertahankan.',
  },
  {
    slug: 'bersih-ekspor-kasir',
    kind: 'tantangan',
    title: 'Menyulap Ekspor Kasir Menjadi Laporan',
    category: 'Pembersihan Data',
    emoji: '🧾',
    level: 'Sulit',
    xp: 45,
    story:
      'Aplikasi kasir lama hanya bisa mengekspor teks mentah: nama produk dengan huruf acak, jumlah bertuliskan "12 pcs", dan harga bertuliskan "Rp 85.000". Pemilik minimarket ingin tahu omzet per produk dari data itu, tanpa mengetik ulang apa pun.',
    task:
      'Isi D2 sampai D7 dengan nama produk rapi. Isi E2 sampai E7 dengan jumlah sebagai angka (tanpa kata pcs, apa pun huruf besar kecilnya) dan F2 sampai F7 dengan harga satuan sebagai angka. Isi G2 sampai G7 dengan subtotal (jumlah kali harga), lalu G8 dengan total omzet.',
    note: 'Kata "pcs" ada yang ditulis kapital semua.',
    rows: [
      ['Produk (mentah)', 'Terjual', 'Harga satuan', 'Produk', 'Jumlah', 'Harga', 'Subtotal'],
      ['  kopi ARABIKA bubuk', '12 pcs', 'Rp 85.000', '', '', '', ''],
      ['teh MELATI celup  ', '8 PCS', 'Rp 32.500', '', '', '', ''],
      ['GULA  pasir', '25 pcs', 'Rp 14.000', '', '', '', ''],
      ['  susu murni coklat', '30 pcs', 'Rp 6.500', '', '', '', ''],
      ['minyak GORENG', '15 PCS', 'Rp 38.000', '', '', '', ''],
      ['  tepung   TERIGU', '20 pcs', 'Rp 12.500', '', '', '', ''],
      ['Total omzet', '', '', '', '', '', ''],
    ],
    solution: {
      ...fill('D', 2, 7, (r) => `=PROPER(TRIM(A${r}))`),
      ...fill('E', 2, 7, (r) => `=VALUE(SUBSTITUTE(LOWER(B${r})," pcs",""))`),
      ...fill('F', 2, 7, (r) => `=VALUE(C${r})`),
      ...fill('G', 2, 7, (r) => `=E${r}*F${r}`),
      G8: '=SUM(G2:G7)',
    },
    required: {
      ...need(col('D', 2, 7), ['PROPER', 'TRIM']),
      ...need(col('E', 2, 7), ['VALUE', 'SUBSTITUTE']),
      ...need(col('F', 2, 7), ['VALUE']),
      ...need(col('G', 2, 7), []),
      G8: ['SUM'],
    },
    hints: [
      'Kerjakan kolom demi kolom: nama (TRIM dan PROPER), jumlah (buang kata pcs lalu VALUE), harga (VALUE), baru subtotal.',
      'Untuk jumlah, ubah ke huruf kecil dulu dengan LOWER agar "PCS" dan "pcs" diperlakukan sama, lalu SUBSTITUTE " pcs" dengan teks kosong.',
      'E2: =VALUE(SUBSTITUTE(LOWER(B2)," pcs","")). F2: =VALUE(C2). G2: =E2*F2. G8: =SUM(G2:G7).',
    ],
    explanation:
      'Pola kerja yang aman untuk data kotor: satu langkah pembersihan per kolom bantu, baru perhitungan di kolom berikutnya. Kolom bantu membuat tiap langkah bisa diperiksa sendiri, dan kalau format ekspor berubah, hanya satu kolom yang perlu diperbaiki.',
  },
];
