'use client';

import { levelOf, streakOf, useReady, useStore } from '../lib/store';

export function Leaderboard() {
  const ready = useReady();
  const store = useStore();

  if (!ready) return <p className="muted">Memuat peringkat…</p>;

  const rows = [...store.profiles].sort(
    (a, b) => b.xp - a.xp || Object.keys(b.solved).length - Object.keys(a.solved).length || a.name.localeCompare(b.name)
  );

  if (rows.length === 0) {
    return <p className="empty">Belum ada profil di perangkat ini. Selesaikan satu soal untuk muncul di sini.</p>;
  }

  return (
    <div className="table-scroll">
      <table className="board">
        <caption className="sr-only">Peringkat profil di perangkat ini berdasarkan XP</caption>
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Nama</th>
            <th scope="col" className="r">Level</th>
            <th scope="col" className="r">XP</th>
            <th scope="col" className="r">Soal selesai</th>
            <th scope="col" className="r">Streak</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p, i) => (
            <tr key={p.id} className={p.id === store.currentId ? 'me-row' : ''}>
              <td>{i + 1}</td>
              <th scope="row">
                {p.name}
                {p.id === store.currentId && <span className="badge"> kamu</span>}
              </th>
              <td className="r">{levelOf(p.xp).level}</td>
              <td className="r">{p.xp}</td>
              <td className="r">{Object.keys(p.solved).length}</td>
              <td className="r">{streakOf(p.days)} hari</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
