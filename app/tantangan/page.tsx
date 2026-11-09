import type { Metadata } from 'next';
import { ExerciseList } from '../../components/ExerciseList';
import { summariesFor } from '../../lib/summaries';

export const metadata: Metadata = { title: 'Tantangan kasus kerja' };

export default function TantanganPage() {
  return (
    <>
      <header className="page-head">
        <h1>Tantangan kasus kerja</h1>
        <p className="lead">Skenario utuh dari pekerjaan: pajak, penyusutan, gaji, laporan laba rugi, dan lainnya.</p>
      </header>
      <ExerciseList items={summariesFor('tantangan')} basePath="/tantangan" />
    </>
  );
}
