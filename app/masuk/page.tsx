import type { Metadata } from 'next';
import { SignIn } from '../../components/SignIn';

export const metadata: Metadata = { title: 'Masuk dan profil' };

export default function MasukPage() {
  return (
    <>
      <header className="page-head">
        <h1>Masuk dan profil</h1>
        <p className="lead">Profil menyimpan XP, streak, dan soal yang sudah selesai. Semuanya ada di browser ini.</p>
      </header>
      <SignIn />
    </>
  );
}
