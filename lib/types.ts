import type { CellFormat } from './datefmt';

export type Scalar = number | string | boolean | null;
export type Level = 'Mudah' | 'Sedang' | 'Sulit';
export type Kind = 'latihan' | 'tantangan';
export type Tone = 'ok' | 'warn' | 'bad';

// Definisi yang ditulis tangan di lib/exercises.ts.
export interface ExerciseDef {
  slug: string;
  kind: Kind;
  title: string;
  category: string;
  emoji: string;
  level: Level;
  xp?: number;
  story: string;
  task: string;
  note?: string;
  // Isi sheet per baris. Sel target dikosongkan ('').
  rows: string[][];
  // Formula acuan per sel target.
  solution: Record<string, string>;
  // Fungsi yang wajib dipakai, per sel target.
  required: Record<string, string[]>;
  // Rentang sel angka yang diubah untuk uji ketahanan formula.
  vary?: string[];
  hints: [string, string, string];
  explanation: string;
  // Cara menampilkan hasil bertipe tanggal atau jam di sel tertentu.
  fmt?: Record<string, CellFormat>;
  // Warna sel menurut teks status yang tampil, mis. { Lunas: 'ok' }.
  tones?: Record<string, Tone>;
}

// Bentuk yang dikirim ke browser.
export interface Exercise {
  slug: string;
  kind: Kind;
  title: string;
  category: string;
  emoji: string;
  level: Level;
  xp: number;
  story: string;
  task: string;
  note?: string;
  hints: [string, string, string];
  explanation: string;
  fmt?: Record<string, CellFormat>;
  tones?: Record<string, Tone>;
  sheet: Record<string, string>;
  nRows: number;
  nCols: number;
  targets: string[];
  solution: Record<string, string>;
  required: Record<string, string[]>;
  fns: string[];
  expected: Record<string, Scalar>;
  variantSheet: Record<string, string>;
  expectedVariant: Record<string, Scalar>;
}
