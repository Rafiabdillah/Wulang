import Link from 'next/link';
import { COURSES, courseExerciseSlugs } from '../lib/courses';
import { EXERCISES } from '../lib/exercises';
import { FUNCTION_DOCS } from '../lib/functions';

export default function HomePage() {
  const latihan = EXERCISES.filter((e) => e.kind === 'latihan').length;
  const tantangan = EXERCISES.filter((e) => e.kind === 'tantangan').length;

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">Excel · Google Sheets · langsung praktik</p>
          <h1>Rumus itu dilatih, bukan dihafal.</h1>
          <p className="lead">
            Tiap soal berupa cerita kerja sehari-hari: warung, gaji, pajak, laporan laba rugi. Kamu menulis rumusnya di lembar kerja, dan Wulang memeriksa sel demi sel.
          </p>
          <div className="cta">
            <Link href="/kursus/spreadsheet-101" className="btn primary">
              Mulai dari kursus dasar
            </Link>
            <Link href="/latihan" className="btn ghost">
              Langsung ke latihan
            </Link>
          </div>
          <ul className="points">
            <li>Semua gratis, tanpa kartu kredit</li>
            <li>Jalan di browser, tanpa akun online</li>
            <li>Dicek per sel, termasuk saat datanya diganti</li>
          </ul>
        </div>

        <figure className="demo" aria-label="Contoh lembar kerja">
          <div className="fbar">
            <span className="fbar-addr">B7</span>
            <span className="fbar-fx" aria-hidden="true">
              fx
            </span>
            <span className="fbar-raw">=SUM(B2:B6)</span>
          </div>
          <table className="grid demo-grid">
            <thead>
              <tr>
                <th className="corner" />
                <th>A</th>
                <th>B</th>
              </tr>
            </thead>
            <tbody>
              {[
                ['Hari', 'Omzet (Rp)'],
                ['Senin', '185.000'],
                ['Selasa', '210.000'],
                ['Rabu', '165.000'],
                ['Kamis', '240.000'],
                ['Jumat', '295.000'],
              ].map((r, i) => (
                <tr key={i}>
                  <th scope="row">{i + 1}</th>
                  <td className={`cell${i === 0 ? ' head' : ''}`}>{r[0]}</td>
                  <td className={`cell${i === 0 ? ' head' : ' num'}`}>{r[1]}</td>
                </tr>
              ))}
              <tr>
                <th scope="row">7</th>
                <td className="cell">Total</td>
                <td className="cell num target ok">1.095.000</td>
              </tr>
            </tbody>
          </table>
          <figcaption className="demo-ok">Benar! Formula dan nilainya cocok. +10 XP</figcaption>
        </figure>
      </section>

      <section className="stats-band" aria-label="Isi Wulang">
        <div>
          <strong>{latihan}</strong>
          <span>latihan satu fungsi</span>
        </div>
        <div>
          <strong>{tantangan}</strong>
          <span>tantangan kasus kerja</span>
        </div>
        <div>
          <strong>{COURSES.length}</strong>
          <span>kursus berurutan</span>
        </div>
        <div>
          <strong>{FUNCTION_DOCS.length}</strong>
          <span>fungsi di ensiklopedia</span>
        </div>
      </section>

      <section className="block">
        <h2>Kenapa latihan, bukan cuma baca?</h2>
        <div className="compare">
          <div className="card">
            <h3>Belajar sendirian</h3>
            <ul>
              <li>Menonton tutorial panjang, tetap bingung saat dipakai</li>
              <li>Ratusan fungsi, tidak tahu mulai dari mana</li>
              <li>Data contoh yang tidak nyambung ke pekerjaan</li>
              <li>Jawaban salah, tapi tidak tahu salahnya di mana</li>
            </ul>
          </div>
          <div className="card good">
            <h3>Di Wulang</h3>
            <ul>
              <li>Mengerjakan soal sungguhan sejak menit pertama</li>
              <li>Fokus ke fungsi yang paling sering dipakai</li>
              <li>Skenario nyata: pajak, penyusutan, gaji, penjualan</li>
              <li>Setiap sel dicek dan alasannya dijelaskan</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="block">
        <div className="block-head">
          <h2>Jalur belajar</h2>
          <Link href="/kursus">Lihat semua kursus</Link>
        </div>
        <ol className="path">
          {COURSES.map((c, i) => (
            <li key={c.slug}>
              <Link href={`/kursus/${c.slug}`} className="card path-card">
                <span className="step-no" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <h3>{c.title}</h3>
                  <p className="muted">
                    {c.level} · {courseExerciseSlugs(c).length} soal
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="block">
        <h2>Dua cara berlatih</h2>
        <div className="compare">
          <Link href="/latihan" className="card door">
            <h3>Latihan fungsi</h3>
            <p>Satu soal fokus ke satu keterampilan, dari SUM sampai INDEX dan MATCH.</p>
            <span className="muted">{latihan} soal</span>
          </Link>
          <Link href="/tantangan" className="card door">
            <h3>Tantangan kasus kerja</h3>
            <p>Selesaikan skenario dari awal sampai akhir, seperti mendapat tugas dari atasan. Ada pajak dan akuntansi juga.</p>
            <span className="muted">{tantangan} soal</span>
          </Link>
        </div>
      </section>
    </>
  );
}
