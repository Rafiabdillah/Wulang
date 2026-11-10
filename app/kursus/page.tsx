import type { Metadata } from 'next';
import Link from 'next/link';
import { COURSES, courseExerciseSlugs, courseQuizIds } from '../../lib/courses';

export const metadata: Metadata = { title: 'Kursus' };

export default function KursusPage() {
  return (
    <>
      <header className="page-head">
        <h1>Kursus</h1>
        <p className="lead">{COURSES.length} kursus berurutan, dari sel pertama sampai kasus nyata di keuangan, pajak, penjualan, dan SDM. Semuanya gratis.</p>
      </header>
      <ol className="path big">
        {COURSES.map((c, i) => (
          <li key={c.slug}>
            <Link href={`/kursus/${c.slug}`} className="card path-card">
              <span className="step-no" aria-hidden="true">
                {i + 1}
              </span>
              <div>
                <h2>
                  <span aria-hidden="true">{c.emoji} </span>
                  {c.title}
                </h2>
                <p>{c.blurb}</p>
                <p className="muted">
                  {c.level} · {courseExerciseSlugs(c).length} soal · {courseQuizIds(c).length} kuis · sertifikat
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </>
  );
}
