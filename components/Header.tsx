'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { levelOf, streakOf, useProfile, useReady } from '../lib/store';

const NAV = [
  { href: '/kursus', label: 'Kursus' },
  { href: '/latihan', label: 'Latihan' },
  { href: '/tantangan', label: 'Tantangan' },
  { href: '/ensiklopedia', label: 'Ensiklopedia' },
  { href: '/leaderboard', label: 'Peringkat' },
];

export function Header() {
  const path = usePathname() ?? '/';
  const ready = useReady();
  const profile = useProfile();
  const lv = profile ? levelOf(profile.xp) : null;
  const streak = profile ? streakOf(profile.days) : 0;

  return (
    <header className="site-header">
      <a className="skip" href="#main">
        Lewati ke konten
      </a>
      <div className="bar">
        <Link href="/" className="brand" aria-label="Wulang, beranda">
          <svg className="mark" viewBox="0 0 24 24" aria-hidden="true">
            <rect x="2" y="2" width="9" height="9" rx="2" className="m1" />
            <rect x="13" y="2" width="9" height="9" rx="2" className="m2" />
            <rect x="2" y="13" width="9" height="9" rx="2" className="m2" />
            <rect x="13" y="13" width="9" height="9" rx="2" className="m3" />
          </svg>
          <span className="word">Wulang</span>
        </Link>

        <nav className="nav" aria-label="Menu utama">
          {NAV.map((n) => {
            const active = path === n.href || path.startsWith(n.href + '/');
            return (
              <Link key={n.href} href={n.href} aria-current={active ? 'page' : undefined} className={active ? 'on' : ''}>
                {n.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/masuk" className="me" aria-label="Profil dan masuk">
          {ready && profile && lv ? (
            <>
              <span className="me-name">{profile.name}</span>
              <span className="chip">Lv {lv.level}</span>
              <span className="chip xp">{profile.xp} XP</span>
              {streak > 0 && <span className="chip streak">{streak} hari</span>}
            </>
          ) : (
            <span className="me-name">Masuk</span>
          )}
        </Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <p>
          <strong>Wulang</strong> berarti ajaran dalam bahasa Jawa. Tempat berlatih rumus spreadsheet lewat soal cerita, gratis dan jalan sepenuhnya di browsermu.
        </p>
        <p className="muted">Progres tersimpan di perangkat ini. Pakai Ekspor di halaman Masuk untuk membawanya ke perangkat lain.</p>
      </div>
    </footer>
  );
}
