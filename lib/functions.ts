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
];

export const FUNCTION_GROUPS: string[] = Array.from(new Set(FUNCTION_DOCS.map((f) => f.group)));

export function getFunctionDoc(name: string): FnDoc | undefined {
  return FUNCTION_DOCS.find((f) => f.name === name.toUpperCase());
}
