// Ensiklopedia fungsi Wulang. Penjelasan ditulis sendiri untuk fungsi yang mesin formula kita dukung.

export interface FnDoc {
  name: string;
  group: string;
  syntax: string;
  summary: string;
  example: string;
  result: string;
  tips?: string;
}

export const FUNCTION_DOCS: FnDoc[] = [
  { name: 'SUM', group: 'Statistik & Agregasi', syntax: 'SUM(angka1, [angka2], ...)', summary: 'Menjumlahkan semua angka di argumen atau rentang.', example: '=SUM(B2:B6)', result: 'Jumlah seluruh angka di B2 sampai B6', tips: 'Teks dan sel kosong di dalam rentang diabaikan.' },
  { name: 'AVERAGE', group: 'Statistik & Agregasi', syntax: 'AVERAGE(angka1, [angka2], ...)', summary: 'Menghitung rata-rata hitung dari angka-angka.', example: '=AVERAGE(B2:B5)', result: 'Jumlah dibagi banyaknya angka', tips: 'Rentang tanpa angka menghasilkan #DIV/0!.' },
  { name: 'MAX', group: 'Statistik & Agregasi', syntax: 'MAX(angka1, [angka2], ...)', summary: 'Mengambil angka terbesar.', example: '=MAX(B2:B8)', result: 'Nilai tertinggi di rentang' },
  { name: 'MIN', group: 'Statistik & Agregasi', syntax: 'MIN(angka1, [angka2], ...)', summary: 'Mengambil angka terkecil.', example: '=MIN(B2:B8)', result: 'Nilai terendah di rentang' },
  { name: 'MEDIAN', group: 'Statistik & Agregasi', syntax: 'MEDIAN(angka1, [angka2], ...)', summary: 'Mengambil nilai tengah setelah data diurutkan.', example: '=MEDIAN(B2:B8)', result: 'Nilai di tengah data', tips: 'Kalau jumlah data genap, hasilnya rata-rata dua nilai tengah.' },
  { name: 'PRODUCT', group: 'Matematika', syntax: 'PRODUCT(angka1, [angka2], ...)', summary: 'Mengalikan semua angka.', example: '=PRODUCT(B2:B4)', result: 'Hasil kali seluruh angka' },
  { name: 'COUNT', group: 'Statistik & Agregasi', syntax: 'COUNT(nilai1, [nilai2], ...)', summary: 'Menghitung banyaknya sel berisi angka.', example: '=COUNT(B2:B7)', result: 'Jumlah sel yang berisi angka' },
  { name: 'COUNTA', group: 'Statistik & Agregasi', syntax: 'COUNTA(nilai1, [nilai2], ...)', summary: 'Menghitung sel yang tidak kosong, apa pun isinya.', example: '=COUNTA(B2:B7)', result: 'Jumlah sel terisi' },
  { name: 'COUNTBLANK', group: 'Statistik & Agregasi', syntax: 'COUNTBLANK(rentang)', summary: 'Menghitung sel kosong di rentang.', example: '=COUNTBLANK(B2:B7)', result: 'Jumlah sel kosong' },
  { name: 'SUMIF', group: 'Statistik & Agregasi', syntax: 'SUMIF(rentang_kriteria, kriteria, [rentang_jumlah])', summary: 'Menjumlahkan sel yang memenuhi satu syarat.', example: '=SUMIF(B2:B7,"Minuman",C2:C7)', result: 'Total kolom C untuk baris bernama Minuman', tips: 'Kriteria mendukung operator seperti ">100" dan wildcard * dan ?.' },
  { name: 'SUMIFS', group: 'Statistik & Agregasi', syntax: 'SUMIFS(rentang_jumlah, rentang_kriteria1, kriteria1, ...)', summary: 'Menjumlahkan sel yang memenuhi beberapa syarat sekaligus.', example: '=SUMIFS(C2:C9,A2:A9,"Utara",B2:B9,"Fashion")', result: 'Total untuk baris yang cocok di semua syarat', tips: 'Rentang jumlah ditulis lebih dulu, berbeda dari SUMIF.' },
  { name: 'COUNTIF', group: 'Statistik & Agregasi', syntax: 'COUNTIF(rentang, kriteria)', summary: 'Menghitung sel yang memenuhi satu syarat.', example: '=COUNTIF(B2:B7,"Semarang")', result: 'Jumlah sel bernilai Semarang' },
  { name: 'COUNTIFS', group: 'Statistik & Agregasi', syntax: 'COUNTIFS(rentang1, kriteria1, ...)', summary: 'Menghitung baris yang memenuhi beberapa syarat.', example: '=COUNTIFS(A2:A9,"Utara",B2:B9,"Fashion")', result: 'Jumlah baris yang cocok di semua syarat' },
  { name: 'AVERAGEIF', group: 'Statistik & Agregasi', syntax: 'AVERAGEIF(rentang_kriteria, kriteria, [rentang_rata])', summary: 'Rata-rata sel yang memenuhi satu syarat.', example: '=AVERAGEIF(A2:A9,"Minuman",B2:B9)', result: 'Rata-rata baris bernama Minuman' },
  { name: 'IF', group: 'Logika', syntax: 'IF(syarat, jika_benar, [jika_salah])', summary: 'Memilih satu dari dua hasil berdasarkan syarat.', example: '=IF(C2>=B2,"Lunas","Belum lunas")', result: 'Lunas atau Belum lunas', tips: 'IF bisa ditumpuk untuk lebih dari dua kemungkinan.' },
  { name: 'IFERROR', group: 'Logika', syntax: 'IFERROR(ekspresi, nilai_jika_error)', summary: 'Mengganti hasil error dengan nilai lain.', example: '=IFERROR(C2/B2,0)', result: 'Hasil bagi, atau 0 jika error' },
  { name: 'AND', group: 'Logika', syntax: 'AND(syarat1, [syarat2], ...)', summary: 'Benar hanya jika semua syarat benar.', example: '=AND(B2>=300000,C2="Ya")', result: 'TRUE atau FALSE' },
  { name: 'OR', group: 'Logika', syntax: 'OR(syarat1, [syarat2], ...)', summary: 'Benar jika minimal satu syarat benar.', example: '=OR(B2>100,C2="Ya")', result: 'TRUE atau FALSE' },
  { name: 'NOT', group: 'Logika', syntax: 'NOT(syarat)', summary: 'Membalik TRUE menjadi FALSE dan sebaliknya.', example: '=NOT(B2>100)', result: 'TRUE atau FALSE' },
  { name: 'ROUND', group: 'Matematika', syntax: 'ROUND(angka, desimal)', summary: 'Membulatkan ke jumlah desimal tertentu.', example: '=ROUND(B2*$B$6,0)', result: 'Bilangan bulat terdekat', tips: 'Desimal negatif membulatkan ke puluhan, ratusan, dan seterusnya.' },
  { name: 'ROUNDUP', group: 'Matematika', syntax: 'ROUNDUP(angka, desimal)', summary: 'Membulatkan menjauhi nol.', example: '=ROUNDUP(2.11,1)', result: '2,2' },
  { name: 'ROUNDDOWN', group: 'Matematika', syntax: 'ROUNDDOWN(angka, desimal)', summary: 'Membulatkan mendekati nol.', example: '=ROUNDDOWN(2.19,1)', result: '2,1' },
  { name: 'ABS', group: 'Matematika', syntax: 'ABS(angka)', summary: 'Nilai mutlak tanpa tanda plus atau minus.', example: '=ABS(-15)', result: '15' },
  { name: 'INT', group: 'Matematika', syntax: 'INT(angka)', summary: 'Membulatkan ke bilangan bulat di bawahnya.', example: '=INT(8.9)', result: '8' },
  { name: 'MOD', group: 'Matematika', syntax: 'MOD(angka, pembagi)', summary: 'Sisa hasil bagi.', example: '=MOD(10,3)', result: '1' },
  { name: 'POWER', group: 'Matematika', syntax: 'POWER(angka, pangkat)', summary: 'Memangkatkan angka.', example: '=POWER(2,3)', result: '8' },
  { name: 'SQRT', group: 'Matematika', syntax: 'SQRT(angka)', summary: 'Akar kuadrat.', example: '=SQRT(81)', result: '9' },
  { name: 'LEFT', group: 'Teks', syntax: 'LEFT(teks, [n])', summary: 'Mengambil n karakter dari kiri.', example: '=LEFT("Wulang",3)', result: 'Wul' },
  { name: 'RIGHT', group: 'Teks', syntax: 'RIGHT(teks, [n])', summary: 'Mengambil n karakter dari kanan.', example: '=RIGHT("Wulang",2)', result: 'ng' },
  { name: 'MID', group: 'Teks', syntax: 'MID(teks, mulai, panjang)', summary: 'Mengambil potongan teks dari posisi tertentu.', example: '=MID("Wulang",2,3)', result: 'ula' },
  { name: 'LEN', group: 'Teks', syntax: 'LEN(teks)', summary: 'Jumlah karakter.', example: '=LEN("Wulang")', result: '6' },
  { name: 'UPPER', group: 'Teks', syntax: 'UPPER(teks)', summary: 'Mengubah ke huruf kapital.', example: '=UPPER("abc")', result: 'ABC' },
  { name: 'LOWER', group: 'Teks', syntax: 'LOWER(teks)', summary: 'Mengubah ke huruf kecil.', example: '=LOWER("ABC")', result: 'abc' },
  { name: 'TRIM', group: 'Teks', syntax: 'TRIM(teks)', summary: 'Merapikan spasi berlebih.', example: '=TRIM("  a   b ")', result: 'a b' },
  { name: 'CONCATENATE', group: 'Teks', syntax: 'CONCATENATE(teks1, [teks2], ...)', summary: 'Menyambung beberapa teks. Operator & melakukan hal yang sama.', example: '=CONCATENATE("RAN","-","2024")', result: 'RAN-2024' },
  { name: 'CONCAT', group: 'Teks', syntax: 'CONCAT(teks1, [teks2], ...)', summary: 'Menyambung teks, termasuk dari rentang.', example: '=CONCAT(A2:C2)', result: 'Gabungan isi A2 sampai C2' },
  { name: 'VLOOKUP', group: 'Pencarian Data', syntax: 'VLOOKUP(dicari, tabel, nomor_kolom, [cocok_persis])', summary: 'Mencari di kolom pertama tabel, lalu mengambil kolom ke-n pada baris yang sama.', example: '=VLOOKUP(E2,$A$2:$C$5,3,FALSE)', result: 'Harga untuk kode di E2', tips: 'Selalu pakai FALSE kecuali datamu terurut dan kamu sengaja mencari kecocokan terdekat.' },
  { name: 'MATCH', group: 'Pencarian Data', syntax: 'MATCH(dicari, rentang, [tipe])', summary: 'Mengembalikan posisi sebuah nilai di satu baris atau kolom.', example: '=MATCH("K-03",A2:A5,0)', result: 'Nomor urut K-03 di rentang', tips: 'Tipe 0 berarti kecocokan persis.' },
  { name: 'INDEX', group: 'Pencarian Data', syntax: 'INDEX(rentang, baris, [kolom])', summary: 'Mengambil isi sel pada posisi tertentu di rentang.', example: '=INDEX(A2:A5,3)', result: 'Isi sel ketiga di A2:A5', tips: 'Sering dipasangkan dengan MATCH.' },
  { name: 'XLOOKUP', group: 'Pencarian Data', syntax: 'XLOOKUP(dicari, rentang_cari, rentang_hasil, [jika_tak_ada])', summary: 'Pencarian modern yang bisa mengambil dari kolom mana pun.', example: '=XLOOKUP("K-01",A2:A5,C2:C5)', result: 'Harga K-01' },
  { name: 'SUMPRODUCT', group: 'Statistik & Agregasi', syntax: 'SUMPRODUCT(rentang1, [rentang2], ...)', summary: 'Mengalikan sel yang sejajar lalu menjumlahkan hasilnya.', example: '=SUMPRODUCT(B2:B5,C2:C5)', result: 'Jumlah dari B2*C2 + B3*C3 + B4*C4 + B5*C5', tips: 'Semua rentang harus sama ukurannya. Cocok untuk total penjualan: jumlah dikali harga tanpa kolom bantu.' },
  { name: 'IFS', group: 'Logika', syntax: 'IFS(syarat1, hasil1, [syarat2, hasil2], ...)', summary: 'Memeriksa beberapa syarat berurutan dan mengambil hasil syarat pertama yang benar.', example: '=IFS(B2>=90,"A",B2>=75,"B",TRUE,"C")', result: 'Huruf mutu sesuai nilai di B2', tips: 'Kalau tidak ada syarat yang benar hasilnya #N/A. Tutup dengan TRUE sebagai pilihan terakhir.' },
  { name: 'PMT', group: 'Keuangan', syntax: 'PMT(bunga_per_periode, jumlah_periode, nilai_sekarang, [nilai_akhir], [tipe])', summary: 'Menghitung cicilan tetap per periode untuk pinjaman.', example: '=PMT(1%,12,-10000000)', result: 'Cicilan per bulan untuk pinjaman 10 juta, bunga 1% per bulan, 12 bulan', tips: 'Beri tanda minus pada pinjaman, atau hasilnya negatif. Bunga dan jumlah periode harus satuannya sama, misalnya bunga tahunan dibagi 12 untuk cicilan bulanan.' },
  { name: 'FV', group: 'Keuangan', syntax: 'FV(bunga_per_periode, jumlah_periode, setoran, [nilai_sekarang], [tipe])', summary: 'Menghitung nilai masa depan dari setoran rutin atau modal awal.', example: '=FV(0.5%,24,-1000000)', result: 'Saldo setelah menabung 1 juta tiap bulan selama 24 bulan', tips: 'Setoran dan modal awal ditulis negatif karena uang keluar.' },
  { name: 'PV', group: 'Keuangan', syntax: 'PV(bunga_per_periode, jumlah_periode, pembayaran, [nilai_akhir], [tipe])', summary: 'Menghitung nilai sekarang dari rangkaian pembayaran.', example: '=PV(1%,12,-1000000)', result: 'Pinjaman yang bisa diambil bila sanggup mencicil 1 juta per bulan' },
  { name: 'NPV', group: 'Keuangan', syntax: 'NPV(tingkat_diskon, arus1, [arus2], ...)', summary: 'Menghitung nilai sekarang bersih dari arus kas masa depan.', example: '=NPV(10%,B3:B6)+B2', result: 'Nilai proyek setelah investasi awal di B2 dikurangkan', tips: 'NPV menganggap arus pertama terjadi di akhir periode pertama. Investasi awal (periode 0) ditambahkan di luar fungsi.' },
  { name: 'IRR', group: 'Keuangan', syntax: 'IRR(arus_kas, [tebakan])', summary: 'Menghitung tingkat pengembalian internal dari serangkaian arus kas.', example: '=IRR(B2:B6)', result: 'Persentase imbal hasil proyek per periode', tips: 'Harus ada arus negatif dan positif, dan arus pertama biasanya investasi awal bertanda minus.' },
  { name: 'AVERAGEIFS', group: 'Statistik & Agregasi', syntax: 'AVERAGEIFS(rentang_rata, rentang_kriteria1, kriteria1, ...)', summary: 'Rata-rata sel yang memenuhi semua syarat sekaligus.', example: '=AVERAGEIFS(C2:C8,B2:B8,"Makanan")', result: 'Rata-rata kolom C untuk baris berkategori Makanan.', tips: 'Rentang yang dirata-rata ditulis paling awal, seperti SUMIFS. Kalau tidak ada baris yang cocok, hasilnya #DIV/0!.' },
  { name: 'MAXIFS', group: 'Statistik & Agregasi', syntax: 'MAXIFS(rentang_nilai, rentang_kriteria1, kriteria1, ...)', summary: 'Nilai terbesar dari baris yang memenuhi syarat.', example: '=MAXIFS(C2:C8,B2:B8,"Minuman")', result: 'Angka terbesar di kolom C untuk kategori Minuman.', tips: 'Kalau tidak ada baris yang cocok, hasilnya 0.' },
  { name: 'MINIFS', group: 'Statistik & Agregasi', syntax: 'MINIFS(rentang_nilai, rentang_kriteria1, kriteria1, ...)', summary: 'Nilai terkecil dari baris yang memenuhi syarat.', example: '=MINIFS(C2:C8,B2:B8,"Minuman")', result: 'Angka terkecil di kolom C untuk kategori Minuman.', tips: 'Kalau tidak ada baris yang cocok, hasilnya 0.' },
  { name: 'LARGE', group: 'Statistik & Agregasi', syntax: 'LARGE(rentang, k)', summary: 'Mengambil angka terbesar ke-k.', example: '=LARGE(B2:B7,2)', result: 'Angka terbesar kedua di B2:B7.', tips: 'k harus antara 1 dan banyaknya angka di rentang, kalau tidak hasilnya #NUM!.' },
  { name: 'SMALL', group: 'Statistik & Agregasi', syntax: 'SMALL(rentang, k)', summary: 'Mengambil angka terkecil ke-k.', example: '=SMALL(B2:B7,1)', result: 'Angka terkecil di B2:B7.' },
  { name: 'RANK', group: 'Statistik & Agregasi', syntax: 'RANK(angka, rentang, [urutan])', summary: 'Peringkat sebuah angka di antara angka lain.', example: '=RANK(B2,$B$2:$B$7)', result: 'Peringkat B2, dengan angka terbesar di peringkat 1.', tips: 'Urutan 0 atau dikosongkan berarti dari terbesar. Isi 1 untuk dari terkecil. Angka yang sama mendapat peringkat yang sama.' },
  { name: 'CEILING', group: 'Matematika', syntax: 'CEILING(angka, kelipatan)', summary: 'Membulatkan ke atas ke kelipatan terdekat.', example: '=CEILING(31590,500)', result: '32000', tips: 'Berguna untuk harga jual agar margin tidak berkurang oleh pembulatan.' },
  { name: 'FLOOR', group: 'Matematika', syntax: 'FLOOR(angka, kelipatan)', summary: 'Membulatkan ke bawah ke kelipatan terdekat.', example: '=FLOOR(28845,1000)', result: '28000', tips: 'Kelipatan 0 menghasilkan #DIV/0!.' },
  { name: 'SUBSTITUTE', group: 'Teks', syntax: 'SUBSTITUTE(teks, yang_diganti, pengganti, [urutan_ke])', summary: 'Mengganti potongan teks dengan teks lain.', example: '=SUBSTITUTE("0812-3456","-","")', result: '08123456', tips: 'Tanpa argumen keempat, semua kemunculan diganti. Isi nomor kemunculan untuk mengganti hanya yang ke-n. Huruf besar dan kecil dibedakan.' },
  { name: 'CHOOSE', group: 'Pencarian Data', syntax: 'CHOOSE(nomor, pilihan1, [pilihan2], ...)', summary: 'Memilih pilihan ke-n dari sebuah daftar.', example: '=CHOOSE(2,"A","B","C")', result: 'B', tips: 'Nomor di luar daftar menghasilkan #VALUE!.' },
  { name: 'ISNUMBER', group: 'Logika', syntax: 'ISNUMBER(nilai)', summary: 'Benar jika nilainya angka.', example: '=ISNUMBER(D2)', result: 'TRUE bila D2 berisi angka, FALSE bila teks atau kosong.', tips: 'Angka yang tersimpan sebagai teks dianggap bukan angka. Itu penyebab umum SUM menghasilkan angka lebih kecil dari seharusnya.' },
  { name: 'ISBLANK', group: 'Logika', syntax: 'ISBLANK(sel)', summary: 'Benar jika selnya kosong.', example: '=ISBLANK(C2)', result: 'TRUE bila C2 benar-benar kosong.', tips: 'Sel berisi spasi atau teks kosong dari formula tidak dianggap kosong.' },
  { name: 'SLN', group: 'Keuangan', syntax: 'SLN(harga, nilai_sisa, umur)', summary: 'Penyusutan garis lurus per periode.', example: '=SLN(120000000,12000000,5)', result: '21.600.000', tips: 'Beban sama besar tiap tahun: (harga dikurangi nilai sisa) dibagi umur.' },
  { name: 'SYD', group: 'Keuangan', syntax: 'SYD(harga, nilai_sisa, umur, periode)', summary: 'Penyusutan metode jumlah angka tahun untuk satu periode.', example: '=SYD(120000000,12000000,5,1)', result: '36.000.000', tips: 'Beban terbesar di tahun pertama dan menurun tiap tahun.' },
  { name: 'DDB', group: 'Keuangan', syntax: 'DDB(harga, nilai_sisa, umur, periode, [faktor])', summary: 'Penyusutan saldo menurun untuk satu periode. Faktor bawaan 2 (menurun ganda).', example: '=DDB(120000000,12000000,5,1)', result: '48.000.000', tips: 'Penyusutan dihentikan saat nilai buku mencapai nilai sisa.' },
  { name: 'NPER', group: 'Keuangan', syntax: 'NPER(bunga_per_periode, cicilan, nilai_sekarang, [nilai_akhir], [tipe])', summary: 'Menghitung berapa periode sampai pinjaman lunas atau tabungan mencapai target.', example: '=NPER(0.01,-3500000,40000000)', result: 'Sekitar 12,2 bulan', tips: 'Cicilan dimasukkan negatif. Bulatkan ke atas dengan ROUNDUP bila hasilnya dipakai sebagai jumlah bulan.' },
];

export const FUNCTION_GROUPS: string[] = Array.from(new Set(FUNCTION_DOCS.map((f) => f.group)));

export function getFunctionDoc(name: string): FnDoc | undefined {
  return FUNCTION_DOCS.find((f) => f.name === name.toUpperCase());
}
