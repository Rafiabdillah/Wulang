'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const menuItems = [
    { name: 'Modul Bisnis', href: '/kursus', icon: '📁' },
    { name: 'Semua Latihan', href: '/latihan', icon: '🎓' },
    { name: 'Ensiklopedia Formula', href: '/ensiklopedia', icon: '📖' },
    { name: 'Peringkat', href: '/leaderboard', icon: '🏆' },
  ];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex font-sans antialiased">
      {/* Sidebar Kiri Ramping ala Kantorku */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-slate-900/95 border-r border-slate-800/80 p-4 flex flex-col justify-between backdrop-blur-md transition-all duration-300 z-40 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div>
          {/* Logo Brand 4-Kotak Wulang */}
          <Link href="/" className="flex items-center gap-3 px-2 py-3 mb-6 hover:opacity-90 transition-opacity">
            <div className="grid grid-cols-2 gap-1 w-9 h-9 p-1 bg-slate-950 rounded-xl border border-slate-800 shadow-inner shrink-0">
              <div className="bg-indigo-500 rounded-sm"></div>
              <div className="bg-slate-600 rounded-sm"></div>
              <div className="bg-slate-700 rounded-sm"></div>
              <div className="bg-amber-400 rounded-sm"></div>
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-wider text-white leading-none">WULANG</h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-widest uppercase mt-0.5">Spreadsheet Lab</p>
            </div>
          </Link>

          {/* Navigasi Utama Sidebar */}
          <nav className="space-y-1.5">
            <Link
              href="/"
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                pathname === '/'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-950/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <span className="text-base">🏠</span>
              <span>Beranda</span>
            </Link>

            {menuItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-lg shadow-indigo-950/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800/80 space-y-2 mt-6">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Progress Belajar</span>
            <span className="text-emerald-400 font-bold font-mono">14%</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full w-[14%]"></div>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="flex items-center text-amber-400 text-xs font-bold gap-1 bg-amber-400/10 px-2.5 py-1 rounded-lg border border-amber-400/20">
              ⭐ 1,450 XP
            </span>
            <span className="flex items-center text-orange-400 text-xs font-bold gap-1 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
              🔥 5 Hari
            </span>
          </div>
        </div>
      </aside>

      {/* Overlay Mobile */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-950/80 z-30 lg:hidden backdrop-blur-sm"
        />
      )}

      {/* Area Konten Utama */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-14 border-b border-slate-800/80 bg-slate-900/60 px-4 md:px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden text-slate-300 hover:text-white p-2 rounded-lg bg-slate-800/80 border border-slate-700 text-xs"
            >
              ☰ Menu
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span className="text-indigo-400 font-bold">WULANG</span>
              <span>/</span>
              <span className="text-slate-200 font-medium truncate">KANTORKU WORKSPACE</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold">
              Vercel Live 🟢
            </span>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
