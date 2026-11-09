import type { Metadata } from 'next';
import { EncyclopediaList } from '../../components/EncyclopediaList';
import { FUNCTION_DOCS, FUNCTION_GROUPS } from '../../lib/functions';

export const metadata: Metadata = { title: 'Ensiklopedia fungsi' };

export default function EnsiklopediaPage() {
  return (
    <>
      <header className="page-head">
        <h1>Ensiklopedia fungsi</h1>
        <p className="lead">Sintaks, contoh, dan catatan untuk fungsi yang dipakai di soal-soal Wulang.</p>
      </header>
      <EncyclopediaList docs={FUNCTION_DOCS} groups={FUNCTION_GROUPS} />
    </>
  );
}
