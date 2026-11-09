import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CourseView } from '../../../components/CourseView';
import type { ExerciseMeta } from '../../../components/CourseView';
import { COURSES, courseExerciseSlugs, getCourse } from '../../../lib/courses';
import { getExercise } from '../../../lib/exercises';

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getCourse(slug);
  return { title: c ? c.title : 'Kursus tidak ditemukan' };
}

export default async function KursusDetail({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const meta: Record<string, ExerciseMeta> = {};
  for (const s of courseExerciseSlugs(course)) {
    const e = getExercise(s);
    if (e) meta[s] = { title: e.title, xp: e.xp, level: e.level, kind: e.kind };
  }

  return (
    <>
      <nav className="crumbs" aria-label="Jejak halaman">
        <Link href="/kursus">Kursus</Link>
        <span aria-hidden="true">/</span>
        <span>{course.title}</span>
      </nav>
      <header className="page-head">
        <p className="eyebrow">{course.level}</p>
        <h1>
          <span aria-hidden="true">{course.emoji} </span>
          {course.title}
        </h1>
        <p className="lead">{course.blurb}</p>
      </header>
      <CourseView course={course} meta={meta} />
    </>
  );
}
