import { evaluateSheet, formatValue, isErrorValue, usesFunction, valuesEqual } from './formula';
import type { Exercise, Scalar } from './types';

export interface CellResult {
  ok: boolean;
  reason?: string;
  got?: string;
  want?: string;
}

export interface CheckResult {
  ok: boolean;
  cells: Record<string, CellResult>;
}

function show(v: Scalar): string {
  return formatValue(v);
}

// Tiap sel target diperiksa sendiri-sendiri. Sel target lain diisi formula acuan,
// jadi satu sel yang salah tidak membuat sel lain ikut dinilai salah.
export function checkAnswer(ex: Exercise, inputs: Record<string, string>): CheckResult {
  const cells: Record<string, CellResult> = {};

  for (const t of ex.targets) {
    const input = (inputs[t] ?? '').trim();
    if (input === '') {
      cells[t] = { ok: false, reason: 'Sel ini masih kosong.' };
      continue;
    }
    if (!input.startsWith('=')) {
      cells[t] = { ok: false, reason: 'Isi dengan formula yang diawali tanda =, bukan angka yang diketik langsung.' };
      continue;
    }

    const baseVal = evaluateSheet({ ...ex.sheet, ...ex.solution, [t]: input })[t];
    if (isErrorValue(baseVal)) {
      cells[t] = { ok: false, reason: `Formula menghasilkan error ${baseVal.code}.` };
      continue;
    }
    if (!valuesEqual(baseVal, ex.expected[t])) {
      cells[t] = {
        ok: false,
        reason: 'Nilainya belum sesuai.',
        got: show(baseVal),
        want: show(ex.expected[t]),
      };
      continue;
    }

    const missing = ex.required[t].filter((fn) => !usesFunction(input, fn));
    if (missing.length > 0) {
      cells[t] = { ok: false, reason: `Nilainya benar, tapi soal ini mewajibkan fungsi ${missing.join(', ')}.` };
      continue;
    }

    const varVal = evaluateSheet({ ...ex.variantSheet, ...ex.solution, [t]: input })[t];
    if (isErrorValue(varVal) || !valuesEqual(varVal, ex.expectedVariant[t])) {
      cells[t] = {
        ok: false,
        reason:
          'Nilainya cocok untuk data sekarang, tapi salah saat data diganti. Biasanya ada angka yang diketik langsung di dalam formula, atau rentang yang kurang tepat.',
      };
      continue;
    }

    cells[t] = { ok: true };
  }

  return { ok: ex.targets.every((t) => cells[t].ok), cells };
}
