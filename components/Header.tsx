'use client';

import React from 'react';
import Link from 'next/link';

export default function Header() {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/40 px-6 py-3 flex items-center justify-between backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Link href="/kursus" className="flex items-center gap-2">
          <div className="grid grid-cols-2 gap-0.5 w-6 h-6 p-0.5 bg-slate-950 rounded-md border border-slate-800">
            <div className="bg-indigo-500 rounded-[1px]"></div>
            <div className="bg-slate-600 rounded-[1px]"></div>
            <div className="bg-slate-700 rounded-[1px]"></div>
            <div className="bg-amber-400 rounded-[1px]"></div>
          </div>
          <span className="font-bold text-white tracking-wider text-sm">WULANG</span>
        </Link>
      </div>
      <div className="flex items-center gap-4 text-xs font-medium text-slate-400">
        <Link href="/kursus" className="hover:text-slate-200 transition-colors">Modul</Link>
        <Link href="/latihan" className="hover:text-slate-200 transition-colors">Latihan</Link>
        <Link href="/ensiklopedia" className="hover:text-slate-200 transition-colors">Ensiklopedia</Link>
        <Link href="/leaderboard" className="hover:text-slate-200 transition-colors">Leaderboard</Link>
      </div>
    </header>
  );
}
