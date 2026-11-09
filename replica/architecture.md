# Arsitektur Wulang

## Tumpukan
- Next.js 15 (App Router) + TypeScript: halaman statis, siap di-host gratis di Vercel.
- CSS biasa di `app/globals.css`: tanpa dependensi tambahan.
- Mesin formula buatan sendiri di `lib/formula.ts`: jalan di browser, tanpa server.
- Penyimpanan: `localStorage` (akun, XP, progres, draf). Tanpa database, jadi biaya nol.

Alasan tanpa database: tujuan proyek adalah dipakai gratis. Konsekuensinya progres terikat ke satu browser, dan leaderboard hanya memuat profil di perangkat itu.

## Model data (di browser)
`Profile`: id, name, createdAt, xp, solved{slug: at, xp, hints}, hints{slug: n}, drafts{slug: {sel: formula}}, quiz{id: benar}, days[].

## Halaman
`/` beranda, `/latihan` dan `/latihan/[slug]`, `/tantangan` dan `/tantangan/[slug]`, `/kursus` dan `/kursus/[slug]`, `/ensiklopedia` dan `/ensiklopedia/[fn]`, `/leaderboard`, `/masuk`.

## Pengecekan jawaban
Per sel target: kosong, harus formula, nilai sama dengan acuan, fungsi wajib dipakai, lalu nilai tetap benar saat data diganti. Detail di `lib/check.ts`.

## Bagian yang berisiko
1. Cakupan fungsi formula: baru sekitar 40 fungsi. Soal baru yang memakai fungsi lain butuh fungsi itu ditambah dulu.
2. Solusi ikut terkirim ke browser, jadi bisa diintip lewat view-source. Tidak masalah untuk pemakaian pribadi.
3. Data hanya di localStorage: hapus data situs berarti progres hilang. Ada tombol ekspor dan impor di halaman Masuk.

## Urutan bangun
1. Mesin formula, soal, pengecek (selesai, 157 uji lulus).
2. Penyimpanan, grid, halaman latihan.
3. Tantangan, kursus, ensiklopedia, leaderboard, masuk.
