'use client';

import React from 'react';

interface SheetGridProps {
  grid: string[][];
  targetCell: string;
  userOutput?: string;
  isSuccess?: boolean;
}

export default function SheetGrid({ grid, targetCell, userOutput, isSuccess }: SheetGridProps) {
  const targetColLetter = targetCell.charAt(0);
  const targetRowIndex = parseInt(targetCell.slice(1), 10) - 1;

  const columns = grid[0] || [];
  const rows = grid.slice(1);

  return (
    <div className="bg-slate-950 border border-slate-800/90 rounded-xl overflow-hidden flex flex-col shadow-2xl">
      <div className="grid grid-cols-12 bg-slate-900 border-b border-slate-800 text-center font-mono text-xs text-slate-400 font-bold py-2 select-none">
        <div className="col-span-1 border-r border-slate-800/80 bg-slate-950/50 text-slate-600">#</div>
        {columns.map((colHeader, idx) => {
          const colLetter = String.fromCharCode(65 + idx);
          const isTargetCol = colLetter === targetColLetter;
          return (
            <div
              key={idx}
              className={`${idx === 0 ? 'col-span-5' : 'col-span-6'} border-r border-slate-800/80 ${
                isTargetCol ? 'text-emerald-400 font-extrabold bg-emerald-500/10' : ''
              }`}
            >
              {colLetter} ({colHeader})
            </div>
          );
        })}
      </div>

      <div className="divide-y divide-slate-800/60 font-mono text-sm">
        {rows.map((row, rIdx) => {
          const isTargetRow = rIdx === targetRowIndex - 1;

          return (
            <div key={rIdx} className="grid grid-cols-12 items-center min-h-[44px] hover:bg-slate-900/30 transition-colors">
              <div className="col-span-1 text-center text-xs text-slate-500 border-r border-slate-800/80 font-bold bg-slate-900/20 py-2.5">
                {rIdx + 2}
              </div>

              <div className="col-span-5 px-4 text-slate-300 border-r border-slate-800/80 truncate text-xs">
                {row[0]}
              </div>

              <div className="col-span-6 px-3 py-1">
                {isTargetRow ? (
                  <div
                    className={`w-full py-2 px-3 rounded-lg border-2 font-bold text-xs transition-all duration-300 ${
                      isSuccess
                        ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                        : 'border-emerald-500/80 bg-emerald-500/10 text-emerald-400 animate-cell-glow'
                    }`}
                  >
                    {userOutput || '...'}
                  </div>
                ) : (
                  <div className="px-3 text-slate-500 text-xs">
                    {row[1] || '-'}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
