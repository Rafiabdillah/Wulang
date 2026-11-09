'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useProfile, useReady } from '../lib/store';

export interface ExerciseSummary {
  slug: string;
  title: string;
  category: string;
  emoji: string;
  level: 'Mudah' | 'Sedang' | 'Sulit';
  xp: number;
  fns: string[];
  teaser: string;
}

interface Props {
  items: ExerciseSummary[];
  basePath: '/latihan' | '/tantangan';
}

const LEVELS = ['Semua', 'Mudah', 'Sedang', 'Sulit'] as const;

export function ExerciseList({ items, basePath }: Props) {
  const ready = useReady();
  const profile = useProfile();
  const [q, setQ] = useState('');
  const [level, setLevel] = useState<(typeof LEVELS)[number]>('Semua');
  const [cat, setCat] = useState('Semua');
  const [hideDone, setHideDone] = useState(false);

  const cats = useMemo(() => ['Semua', ...Array.from(new Set(items.map((i) => i.category)))], [items]);
  const solvedCount = ready && profile ? items.filter((i) => profile.solved[i.slug]).length : 0;

  const shown = items.filter((i) => {
    if (level !== 'Semua' && i.level !== level) return false;
    if (cat !== 'Semua' && i.category !== cat) return false;
    if (hideDone && profile?.solved[i.slug]) return false;
    const needle = q.trim().toLowerCase();
    if (needle === '') return true;
    return (
      i.title.toLowerCase().includes(needle) ||
      i.category.toLowerCase().includes(needle) ||
      i.fns.some((f) => f.toLowerCase().includes(needle))
    );
  });

  return (
    <>
      <div className="filters" role="search">
        <label className="field grow">
          <span>Cari</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Judul, kategori, atau fungsi" />
        </label>
        <label className="field">
          <span>Tingkat</span>
          <select value={level} onChange={(e) => setLevel(e.target.value as (typeof LEVELS)[number])}>
            {LEVELS.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Kategori</span>
          <select value={cat} onChange={(e) => setCat(e.target.value)}>
            {cats.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="check">
          <input type="checkbox" checked={hideDone} onChange={(e) => setHideDone(e.target.checked)} />
          <span>Sembunyikan yang selesai</span>
        </label>
      </div>

      <p className="muted count" aria-live="polite">
        {shown.length} dari {items.length} soal
        {ready && profile ? `, ${solvedCount} sudah selesai` : ''}
      </p>

      {shown.length === 0 ? (
        <p className="empty">Tidak ada soal yang cocok. Coba longgarkan filternya.</p>
      ) : (
        <ul className="cards">
          {shown.map((i) => {
            const done = ready && profile?.solved[i.slug];
            return (
              <li key={i.slug}>
                <Link href={`${basePath}/${i.slug}`} className={`card ex-card${done ? ' is-done' : ''}`}>
                  <div className="meta">
                    <span className={`badge lv-${i.level.toLowerCase()}`}>{i.level}</span>
                    <span className="badge xp">+{i.xp} XP</span>
                    {done && <span className="badge done">Selesai</span>}
                  </div>
                  <h3>
                    <span aria-hidden="true">{i.emoji} </span>
                    {i.title}
                  </h3>
                  <p className="teaser">{i.teaser}</p>
                  <div className="fn-row">
                    {i.fns.map((f) => (
                      <code key={f}>{f}</code>
                    ))}
                    <span className="muted cat">{i.category}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
