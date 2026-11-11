'use client';

import React from 'react';
import Link from 'next/link';
import CourseView from '../components/CourseView';

export default function HomePage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner Utama Hero ala Kantorku */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-semibold">
            ✨ KANTORKU WORKSPACE DESIGN SYSTEM
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Rumus itu dilatih, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-emerald-400 to-amber-300">
              bukan sekadar dihafal.
            </span>
          </h1>
          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            Platform interaktif berskala industri untuk menguasai pengolahan data spreadsheet. 
            Setiap latihan disusun dari kasus nyata dunia bisnis: kasir, penggajian, analisis pajak, dan laporan keuangan.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              href="/latihan"
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/50 flex items-center gap-2"
            >
              🚀 Mulai Latihan Sekarang
            </Link>
            <Link
              href="/ensiklopedia"
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm rounded-xl transition-all"
            >
              📖 Lihat Ensiklopedia Formula
            </Link>
          </div>
        </div>

        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px]"></div>
      </div>

      {/* Stats Counter Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <div className="text-xs text-slate-400 font-mono">MODUL BISNIS</div>
          <div className="text-2xl md:text-3xl font-extrabold text-indigo-400 mt-1">5 Pilar</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Cleaning hingga Validation</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <div className="text-xs text-slate-400 font-mono">TOTAL LATIHAN</div>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-400 mt-1">38+ Soal</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Kasus nyata dunia kerja</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <div className="text-xs text-slate-400 font-mono">FORMULA DATABASE</div>
          <div className="text-2xl md:text-3xl font-extrabold text-amber-400 mt-1">99 Fungsi</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Dokumentasi rumus praktis</div>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <div className="text-xs text-slate-400 font-mono">VALIDASI AUTOMATIS</div>
          <div className="text-2xl md:text-3xl font-extrabold text-teal-400 mt-1">Real-time</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Uji rumus sel demi sel</div>
        </div>
      </div>

      {/* Section 5 Pilar Modul Bisnis */}
      <CourseView />
    </div>
  );
}
