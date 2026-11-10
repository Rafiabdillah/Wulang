// Pembantu kecil untuk menulis soal bisnis.

// Isi satu kolom untuk baris from..to dengan formula hasil fn(baris).
export function fill(col: string, from: number, to: number, fn: (r: number) => string): Record<string, string> {
  const out: Record<string, string> = {};
  for (let r = from; r <= to; r++) out[`${col}${r}`] = fn(r);
  return out;
}

// Daftar fungsi wajib yang sama untuk banyak sel.
export function need(cells: string[], fns: string[]): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const c of cells) out[c] = fns;
  return out;
}

// Daftar alamat satu kolom dari baris from sampai to.
export function col(c: string, from: number, to: number): string[] {
  const out: string[] = [];
  for (let r = from; r <= to; r++) out.push(`${c}${r}`);
  return out;
}

// Baris kosong dengan n sel, dipakai untuk menjaga lebar tabel.
export function blank(n: number): string[] {
  return Array.from({ length: n }, () => '');
}
