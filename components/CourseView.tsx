'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Course, Step } from '../lib/courses';
import { courseExerciseSlugs, courseQuizIds } from '../lib/courses';
import { QUIZ_XP, answerQuiz, useProfile, useReady } from '../lib/store';

export interface ExerciseMeta {
  title: string;
  xp: number;
  level: string;
  kind: 'latihan' | 'tantangan';
}

interface Props {
  course: Course;
  meta: Record<string, ExerciseMeta>;
}

type QuizStep = Extract<Step, { type: 'kuis' }>;

function Quiz({ step }: { step: QuizStep }) {
  const profile = useProfile();
  const [picked, setPicked] = useState<number | null>(null);
  const done = Boolean(profile?.quiz[step.id]);
  const answered = picked !== null || done;
  const correct = done || picked === step.answer;

  return (
    <div className="step quiz card">
      <div className="meta">
        <span className="badge">Kuis</span>
        <span className="badge xp">+{QUIZ_XP} XP</span>
        {done && <span className="badge done">Selesai</span>}
      </div>
      <p className="q">{step.question}</p>
      <div className="opts" role="radiogroup" aria-label={step.question}>
        {step.options.map((o, i) => {
          const isPicked = picked === i;
          const showRight = answered && correct && i === step.answer;
          const cls = ['opt', isPicked ? (i === step.answer ? 'right' : 'wrong') : '', showRight ? 'right' : '']
            .filter(Boolean)
            .join(' ');
          return (
            <button
              key={i}
              type="button"
              role="radio"
              aria-checked={isPicked}
              className={cls}
              disabled={done}
              onClick={() => {
                setPicked(i);
                answerQuiz(step.id, i === step.answer);
              }}
            >
              {o}
            </button>
          );
        })}
      </div>
      {answered && (
        <p className={`fb-inline ${correct ? 'ok' : 'bad'}`} aria-live="polite">
          <strong>{correct ? 'Benar. ' : 'Belum tepat. '}</strong>
          {correct ? step.explain : 'Baca lagi bagian di atas, lalu coba pilihan lain.'}
        </p>
      )}
    </div>
  );
}

export function CourseView({ course, meta }: Props) {
  const ready = useReady();
  const profile = useProfile();
  const slugs = courseExerciseSlugs(course);
  const quizIds = courseQuizIds(course);
  const doneEx = ready && profile ? slugs.filter((s) => profile.solved[s]).length : 0;
  const doneQuiz = ready && profile ? quizIds.filter((q) => profile.quiz[q]).length : 0;
  const total = slugs.length + quizIds.length;
  const done = doneEx + doneQuiz;
  const pct = total === 0 ? 0 : Math.round((done / total) * 100);
  const complete = total > 0 && done === total;

  return (
    <>
      <div className="progress-wrap" aria-label="Progres kursus">
        <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <span style={{ width: `${pct}%` }} />
        </div>
        <p className="muted">
          {done} dari {total} langkah selesai ({pct}%)
        </p>
      </div>

      <ol className="steps">
        {course.steps.map((s, i) => (
          <li key={i}>
            {s.type === 'bacaan' && (
              <div className="step read card">
                <div className="meta">
                  <span className="badge">Bacaan</span>
                </div>
                <h3>{s.title}</h3>
                {s.body.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            )}
            {s.type === 'latihan' && (
              <Link
                href={`/${meta[s.slug]?.kind === 'tantangan' ? 'tantangan' : 'latihan'}/${s.slug}`}
                className={`step card ex-step${ready && profile?.solved[s.slug] ? ' is-done' : ''}`}
              >
                <div className="meta">
                  <span className="badge">{meta[s.slug]?.kind === 'tantangan' ? 'Tantangan' : 'Latihan'}</span>
                  <span className="badge xp">+{meta[s.slug]?.xp ?? 0} XP</span>
                  {ready && profile?.solved[s.slug] && <span className="badge done">Selesai</span>}
                </div>
                <h3>{meta[s.slug]?.title ?? s.slug}</h3>
                <span className="muted">{meta[s.slug]?.level}</span>
              </Link>
            )}
            {s.type === 'kuis' && <Quiz step={s} />}
          </li>
        ))}
      </ol>

      {complete && profile && (
        <section className="certificate" aria-label="Sertifikat">
          <div className="cert-inner">
            <p className="cert-top">Sertifikat penyelesaian</p>
            <p className="cert-name">{profile.name}</p>
            <p>telah menyelesaikan kursus</p>
            <p className="cert-course">{course.title}</p>
            <p className="muted">
              di Wulang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <button type="button" className="btn primary no-print" onClick={() => window.print()}>
            Cetak atau simpan PDF
          </button>
        </section>
      )}
    </>
  );
}
