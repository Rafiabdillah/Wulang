# Wulang

Platform latihan spreadsheet lewat soal cerita. Rumus ditulis di lembar kerja, lalu dicek sel demi sel. Semua fitur gratis dan jalan sepenuhnya di browser, tanpa server atau database.

Fitur mengikuti ide NgulikSheet (latihan per fungsi, tantangan kasus kerja, kursus, kuis, XP, ensiklopedia, peringkat). Soal, teks, nama, dan tampilan semuanya buatan sendiri.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # uji mesin formula, soal, dan kursus
npm run build      # build produksi
```

Butuh Node 18.18 atau lebih baru.

## Isi

| Bagian | Lokasi |
| --- | --- |
| Mesin formula (63 fungsi) | `lib/formula.ts` |
| Pengecek jawaban per sel | `lib/check.ts` |
| Soal latihan dan tantangan | `lib/exercises.ts` |
| Kursus dan kuis | `lib/courses.ts` |
| Ensiklopedia fungsi | `lib/functions.ts` |
| XP, level, streak, profil lokal | `lib/store.ts` |
| Halaman | `app/` |
| Komponen (grid sheet, soal, kursus, dll) | `components/` |
| Rancangan dan peta fitur | `replica/` |

## Cara pengecekan jawaban

Untuk tiap sel target, urutannya:

1. Sel tidak boleh kosong dan harus berupa formula (diawali `=`).
2. Nilainya harus sama dengan nilai dari formula acuan.
3. Fungsi yang diwajibkan soal harus dipakai.
4. Formula dijalankan lagi pada data yang diganti. Angka yang diketik langsung di dalam formula ketahuan di langkah ini.

## Menambah soal

Tambahkan objek baru di `DEFS` dalam `lib/exercises.ts`: isi `rows` (sel target dikosongkan), `solution`, `required`, `vary`, tiga `hints`, dan `explanation`. Jalankan `npm test`. Uji otomatis memastikan solusi acuan lulus pengecekan sendiri dan semua fungsi ada di ensiklopedia. Untuk memasukkannya ke kursus, tambahkan langkah `latihan` di `lib/courses.ts`.

Fungsi baru ditambahkan di `FUNCS` pada `lib/formula.ts`, lalu didokumentasikan di `lib/functions.ts`.

## Yang perlu kamu tahu

- Progres tersimpan di `localStorage` browser. Hapus data situs berarti progres hilang. Pakai Ekspor dan Impor di halaman Masuk untuk cadangan atau pindah perangkat.
- Akun hanya nama, tanpa kata sandi. Peringkat hanya memuat profil di perangkat yang sama.
- Solusi acuan ikut terkirim ke browser, jadi bisa diintip lewat view-source. Tidak masalah untuk pemakaian pribadi. Kalau mau dipublikasikan luas, pindahkan pengecekan ke server.
- Semua halaman statis, jadi bisa di-host gratis, misalnya di Vercel.
- Tarif pajak di soal hanya contoh latihan. Untuk pekerjaan nyata, cek ketentuan yang berlaku.

## Status verifikasi

Sudah diuji: 820 uji otomatis (mesin formula, semua soal, kursus, ensiklopedia) dan uji di Chromium untuk alur soal, XP, draf, kuis, profil, peringkat, ensiklopedia, serta tampilan 390 px. `npm install` dan `next build` belum bisa dijalankan saat proyek ditulis, jadi build pertama di komputermu adalah uji terakhir.
