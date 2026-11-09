'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FnDoc } from '../lib/functions';

export function EncyclopediaList({ docs, groups }: { docs: FnDoc[]; groups: string[] }) {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('Semua');
  const needle = q.trim().toLowerCase();
  const shown = docs.filter(
    (d) =>
      (group === 'Semua' || d.group === group) &&
      (needle === '' || d.name.toLowerCase().includes(needle) || d.summary.toLowerCase().includes(needle))
  );

  return (
    <>
      <div className="filters" role="search">
        <label className="field grow">
          <span>Cari fungsi</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Misalnya SUM atau pembulatan" />
        </label>
        <label className="field">
          <span>Kelompok</span>
          <select value={group} onChange={(e) => setGroup(e.target.value)}>
            {['Semua', ...groups].map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="muted count" aria-live="polite">
        {shown.length} dari {docs.length} fungsi
      </p>
      {shown.length === 0 ? (
        <p className="empty">Fungsi itu belum ada di ensiklopedia Wulang.</p>
      ) : (
        <ul className="cards fn-cards">
          {shown.map((d) => (
            <li key={d.name}>
              <Link href={`/ensiklopedia/${d.name}`} className="card fn-card">
                <h3>
                  <code>{d.name}</code>
                </h3>
                <p>{d.summary}</p>
                <span className="muted">{d.group}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
