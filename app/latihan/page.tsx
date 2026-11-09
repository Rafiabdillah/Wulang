import type { Metadata } from 'next';
import { ExerciseList } from '../../components/ExerciseList';
import { summariesFor } from '../../lib/summaries';

export const metadata: Metadata = { title: 'Latihan fungsi' };

export default function LatihanPage() {
  return (
    <>
      <header className="page-head">
        <h1>Latihan fungsi</h1>
        <p className="lead">Satu soal untuk satu keterampilan. Pilih yang ingin kamu kuasai, atau kerjakan berurutan.</p>
      </header>
      <ExerciseList items={summariesFor('latihan')} basePath="/latihan" />
    </>
  );
}
