import type { Metadata } from 'next';
import { Leaderboard } from '../../components/Leaderboard';

export const metadata: Metadata = { title: 'Peringkat' };

export default function LeaderboardPage() {
  return (
    <>
      <header className="page-head">
        <h1>Peringkat</h1>
        <p className="lead">
          Urutan profil berdasarkan XP. Karena Wulang tanpa server, peringkat ini hanya memuat profil yang ada di perangkat ini, misalnya satu laptop yang dipakai bergantian.
        </p>
      </header>
      <Leaderboard />
    </>
  );
}
