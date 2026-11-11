'use client';

import React from 'react';
import Link from 'next/link';

export interface ExerciseMeta {
  id: string;
  slug: string;
  title: string;
  category: string;
  difficulty: string;
  desc?: string;
}

export function CourseView() {
  const modules = [
    {
      id: 1,
      slug: 'data-cleaning',
      title: 'Modul 1: Pembersihan & Persiapan Data',
      category: 'DATA CLEANING',
      desc: 'Kuasai TRIM, PROPER, LEFT, MID, RIGHT, CONCAT, dan SUBSTITUTE untuk merapikan data transaksi berantakan.',
      count: '7 Latihan',
      difficulty: 'Basic',
      color: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30',
      badgeColor: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30'
    },
    {
      id: 2,
      slug: 'lookup-reference',
      title: 'Modul 2: Pencarian & Relasi Data',
      category: 'LOOKUP & REF',
      desc: 'Hubungkan tabel transaksi dengan tabel master harga menggunakan VLOOKUP, XLOOKUP, dan INDEX-MATCH.',
      count: '6 Latihan',
      difficulty: 'Intermediate',
      color: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
      badgeColor: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
    },
    {
      id: 3,
      slug: 'agregasi-laporan',
      title: 'Modul 3: Agregasi & Pembuatan Laporan',
      category: 'AGGREGATION',
      desc: 'Buat rekapitulasi omzet dan analisis performa tim sales menggunakan SUMIFS, COUNTIFS, dan AVERAGEIFS.',
      count: '5 Latihan',
      difficulty: 'Intermediate',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
      badgeColor: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    },
    {
      id: 4,
      slug: 'waktu-tagihan',
      title: 'Modul 4: Manajemen Waktu & Tagihan',
      category: 'DATE & TIME',
      desc: 'Kalkulasi jatuh tempo invoice, tanggal kerja proyek, dan masa bakti HRD menggunakan WORKDAY dan DATEDIF.',
      count: '5 Latihan',
      difficulty: 'Advanced',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
      badgeColor: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    },
    {
      id: 5,
      slug: 'validasi-visual',
      title: 'Modul 5: Validasi & Otomatisasi Visual',
      category: 'DATA INTEGRITY',
      desc: 'Cegah kesalahan input admin dengan Data Validation dropdown list dan alarm stok Conditional Formatting.',
      count: '4 Latihan',
      difficulty: 'Advanced',
      color: 'from-rose-500/20 to-pink-500/10 border-rose-500/30',
      badgeColor: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white">5 Pilar Modul Bisnis Wulang</h2>
          <p className="text-slate-400 text-xs mt-0.5">Materi terstruktur dari tingkat dasar hingga mahir.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((mod) => (
          <Link
            key={mod.id}
            href={`/latihan`}
            className={`bg-gradient-to-br ${mod.color} border rounded-2xl p-5 hover:scale-[1.02] transition-all duration-200 flex flex-col justify-between space-y-4 group backdrop-blur-md shadow-lg`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className={`px-2.5 py-1 border text-[10px] font-extrabold rounded-lg tracking-wider ${mod.badgeColor}`}>
                  {mod.category}
                </span>
                <span className="text-xs text-slate-400 font-mono">{mod.count}</span>
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors mb-2">
                {mod.title}
              </h3>
              <p className="text-slate-300 text-xs leading-relaxed">
                {mod.desc}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Tingkat: <strong className="text-slate-200">{mod.difficulty}</strong></span>
              <span className="text-indigo-400 group-hover:translate-x-1 transition-transform">Mulai Latihan →</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default CourseView;
