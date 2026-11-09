import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ExercisePage } from '../../../components/ExercisePage';
import { exercisesByKind, getExercise, neighbors } from '../../../lib/exercises';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return exercisesByKind('tantangan').map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const ex = getExercise(slug);
  return { title: ex ? ex.title : 'Soal tidak ditemukan' };
}

export default async function TantanganDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const ex = getExercise(slug);
  if (!ex || ex.kind !== 'tantangan') notFound();
  const n = neighbors(slug);
  const pick = (s?: string) => {
    const e = s ? getExercise(s) : undefined;
    return e ? { slug: e.slug, title: e.title } : undefined;
  };
  return <ExercisePage ex={ex} prev={pick(n.prev)} next={pick(n.next)} basePath="/tantangan" />;
}
