import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { exercisesForFunction } from '../../../lib/exercises';
import { FUNCTION_DOCS, getFunctionDoc } from '../../../lib/functions';

type Params = { fn: string };

export function generateStaticParams(): Params[] {
  return FUNCTION_DOCS.map((d) => ({ fn: d.name }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { fn } = await params;
  const d = getFunctionDoc(decodeURIComponent(fn));
  return { title: d ? `Fungsi ${d.name}` : 'Fungsi tidak ditemukan' };
}

export default async function FungsiDetail({ params }: { params: Promise<Params> }) {
  const { fn } = await params;
  const doc = getFunctionDoc(decodeURIComponent(fn));
  if (!doc) notFound();
  const related = exercisesForFunction(doc.name);

  return (
    <>
      <nav className="crumbs" aria-label="Jejak halaman">
        <Link href="/ensiklopedia">Ensiklopedia</Link>
        <span aria-hidden="true">/</span>
        <span>{doc.name}</span>
      </nav>
      <header className="page-head">
        <p className="eyebrow">{doc.group}</p>
        <h1>
          <code>{doc.name}</code>
        </h1>
        <p className="lead">{doc.summary}</p>
      </header>

      <section className="card fn-detail">
        <h2>Sintaks</h2>
        <pre>
          <code>{doc.syntax}</code>
        </pre>
        <h2>Contoh</h2>
        <pre>
          <code>{doc.example}</code>
        </pre>
        <p>
          <strong>Hasil:</strong> {doc.result}
        </p>
        {doc.tips && (
          <p className="note">
            <strong>Catatan:</strong> {doc.tips}
          </p>
        )}
      </section>

      {related.length > 0 && (
        <section className="block">
          <h2>Latihan dengan fungsi ini</h2>
          <ul className="plain-list">
            {related.map((e) => (
              <li key={e.slug}>
                <Link href={`/${e.kind}/${e.slug}`}>{e.title}</Link> <span className="muted">· {e.level}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
