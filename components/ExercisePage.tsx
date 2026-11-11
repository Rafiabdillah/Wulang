'use client';

import React, { useState } from 'react';
import SheetGrid from './SheetGrid';

interface ExerciseData {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  instructions: string;
  initialGrid: string[][];
  targetCell: string;
  expectedFormula: string[];
  expectedOutput: string;
  hint: string;
  explanation: string;
}

export default function ExercisePage({ exercise }: { exercise: ExerciseData }) {
  const [formulaInput, setFormulaInput] = useState('');
  const [userOutput, setUserOutput] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showHint, setShowHint] = useState(false);

  const handleRun = () => {
    if (!formulaInput.trim()) return;

    const normalizedInput = formulaInput.replace(/\s/g, '').toUpperCase();
    const isFormulaValid = exercise.expectedFormula.some(
      (f) => f.replace(/\s/g, '').toUpperCase() === normalizedInput
    );

    if (isFormulaValid) {
      setStatus('success');
      setUserOutput(exercise.expectedOutput);
    } else {
      setStatus('error');
      setUserOutput('ERROR!');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Panel Kiri: Informasi Kasus Bisnis */}
      <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between backdrop-blur-md shadow-xl space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 text-[11px] font-bold rounded-lg tracking-wider">
              {exercise.category.toUpperCase()}
            </span>
            <span className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold rounded-lg tracking-wider">
              {exercise.difficulty.toUpperCase()}
            </span>
          </div>

          <h2 className="text-xl font-bold text-white mb-2 leading-snug">{exercise.title}</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">
            {exercise.instructions}
          </p>

          {/* Hint Card Toggle */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5 space-y-2">
            <button
              onClick={() => setShowHint(!showHint)}
              className="flex items-center justify-between w-full text-amber-400 text-xs font-bold hover:underline"
            >
              <span>💡 {showHint ? 'Sembunyikan Petunjuk' : 'Tampilkan Petunjuk Rumus'}</span>
              <span>{showHint ? '▲' : '▼'}</span>
            </button>
            {showHint && (
              <p className="text-xs text-slate-400 pt-1 border-t border-slate-800/60 leading-normal">
                {exercise.hint}
              </p>
            )}
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {status === 'success' && (
          <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-xl p-4 text-emerald-400 flex items-start gap-3 shadow-lg">
            <span className="text-lg">✅</span>
            <div>
              <div className="font-bold text-sm">Jawaban Tepat! +50 XP ⭐</div>
              <div className="text-xs opacity-90 mt-0.5">{exercise.explanation}</div>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-xl p-4 text-red-400 flex items-start gap-3 shadow-lg">
            <span className="text-lg">❌</span>
            <div>
              <div className="font-bold text-sm">Rumus Belum Sesuai</div>
              <div className="text-xs opacity-90 mt-0.5">Periksa kembali penulisan nama fungsi dan sel acuan.</div>
            </div>
          </div>
        )}
      </div>

      {/* Panel Kanan: Formula Bar + Interactive Grid Canvas */}
      <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between backdrop-blur-md shadow-xl space-y-4">
        
        {/* Modern Command Formula Bar ala Kantorku */}
        <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2 shadow-inner">
          <div className="font-mono text-xs font-bold text-indigo-400 px-3 border-r border-slate-800 flex items-center gap-1">
            <span className="text-amber-400 font-extrabold">fx</span>
          </div>
          <input
            type="text"
            value={formulaInput}
            onChange={(e) => setFormulaInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRun()}
            placeholder={`Ketik rumus di sini (misal: ${exercise.expectedFormula[0]})`}
            className="flex-1 bg-transparent text-sm font-mono text-emerald-400 focus:outline-none placeholder:text-slate-600 px-2"
          />
          <button
            onClick={handleRun}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-all shadow-lg shadow-emerald-950/40 active:scale-95 shrink-0"
          >
            ▶ JALANKAN
          </button>
        </div>

        {/* Spreadsheet Canvas */}
        <SheetGrid
          grid={exercise.initialGrid}
          targetCell={exercise.targetCell}
          userOutput={userOutput}
          isSuccess={status === 'success'}
        />

        {/* Action Controls & Target Status */}
        <div className="flex justify-between items-center text-xs text-slate-400 px-1">
          <button
            onClick={() => {
              setFormulaInput('');
              setUserOutput('');
              setStatus('idle');
            }}
            className="hover:text-slate-200 transition-colors"
          >
            🔄 Reset Sel
          </button>
          <span className="font-mono bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-emerald-400">
            Target Sel: {exercise.targetCell}
          </span>
        </div>
      </div>
    </div>
  );
}
