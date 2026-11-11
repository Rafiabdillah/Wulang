'use client';

import { useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import type { CSSProperties } from 'react';
import type { CellResult } from '../lib/check';
import { addrOf, displayValue, evaluateSheet, isErrorValue, numToCol } from '../lib/formula';
import type { Exercise } from '../lib/types';

interface Props {
  ex: Exercise;
  inputs: Record<string, string>;
  results: Record<string, CellResult> | null;
  selected: string | null;
  onSelect: (addr: string) => void;
  onChange: (addr: string, value: string) => void;
  onEnter: (addr: string) => void;
  registerRef: (addr: string, el: HTMLInputElement | null) => void;
}

const NUMERIC = /^-?\d+([.,]\d+)?$/;

export function SheetGrid({ ex, inputs, results, selected, onSelect, onChange, onEnter, registerRef }: Props) {
  const [editing, setEditing] = useState<string | null>(null);

  const raw = useMemo(() => {
    const filled: Record<string, string> = {};
    for (const t of ex.targets) {
      const v = inputs[t];
      if (v !== undefined && v.trim() !== '') filled[t] = v;
    }
    return { ...ex.sheet, ...filled };
  }, [ex, inputs]);
  const values = useMemo(() => evaluateSheet(raw), [raw]);

  const toneOf = (shown: string): string => {
    const tone = ex.tones?.[shown];
    return tone ? `tone-${tone}` : '';
  };

  const hasHeader = useMemo(() => {
    const row1 = Array.from({ length: ex.nCols }, (_, c) => ex.sheet[addrOf(c + 1, 1)]).filter(
      (v): v is string => v !== undefined && v !== ''
    );
    return row1.length > 0 && row1.every((v) => !NUMERIC.test(v) && !v.startsWith('='));
  }, [ex]);

  const cols = Array.from({ length: ex.nCols }, (_, i) => i + 1);
  const rows = Array.from({ length: ex.nRows }, (_, i) => i + 1);
  const barRaw = selected ? (inputs[selected] ?? ex.sheet[selected] ?? '') : '';

  return (
    <div className="sheet">
      <div className="fbar">
        <span className="fbar-addr" aria-label="Sel terpilih">
          {selected ?? '—'}
        </span>
        <span className="fbar-fx" aria-hidden="true">
          fx
        </span>
        <span className="fbar-raw">{barRaw}</span>
      </div>
      <div className="sheet-scroll">
        <table
          className="grid"
          aria-label={`Lembar kerja ${ex.title}`}
          style={ex.nCols > 5 ? ({ '--cw': ex.tones ? '7.25rem' : '5.25rem' } as CSSProperties) : ex.tones ? ({ '--cw': '9rem' } as CSSProperties) : undefined}
        >
          <thead>
            <tr>
              <th className="corner" />
              {cols.map((c) => (
                <th key={c} scope="col">
                  {numToCol(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r}>
                <th scope="row">{r}</th>
                {cols.map((c) => {
                  const addr = addrOf(c, r);
                  const isTarget = ex.targets.includes(addr);
                  const res = results?.[addr];
                  if (isTarget) {
                    const input = inputs[addr] ?? '';
                    const v = values[addr];
                    const shown = input.trim().startsWith('=') ? displayValue(addr, v, raw, ex.fmt?.[addr]) : input;
                    const cls = [
                      'cell',
                      'target',
                      selected === addr ? 'sel' : '',
                      res ? (res.ok ? 'ok' : 'bad') : '',
                      typeof v === 'number' ? 'num' : '',
                      isErrorValue(v) && input.trim() !== '' ? 'err' : '',
                      input.trim().startsWith('=') ? toneOf(shown) : '',
                    ]
                      .filter(Boolean)
                      .join(' ');
                    return (
                      <td key={c} className={cls}>
                        <input
                          ref={(el) => registerRef(addr, el)}
                          value={editing === addr ? input : shown}
                          placeholder="isi di sini"
                          spellCheck={false}
                          autoComplete="off"
                          autoCapitalize="off"
                          aria-label={`Sel ${addr}`}
                          onFocus={(e) => {
                            // Ganti tampilan ke isi mentah lebih dulu, baru pilih semua teksnya.
                            // Tanpa ini ketikan baru menempel di ujung formula lama.
                            flushSync(() => setEditing(addr));
                            e.currentTarget.select();
                            onSelect(addr);
                          }}
                          onBlur={() => setEditing((e) => (e === addr ? null : e))}
                          onChange={(e) => onChange(addr, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.ctrlKey && !e.metaKey) {
                              e.preventDefault();
                              onEnter(addr);
                            }
                            if (e.key === 'Escape') (e.target as HTMLInputElement).blur();
                          }}
                        />
                      </td>
                    );
                  }
                  const v = values[addr];
                  const empty = ex.sheet[addr] === undefined;
                  const shownStatic = empty ? '' : displayValue(addr, v, raw, ex.fmt?.[addr]);
                  const cls = [
                    'cell',
                    r === 1 && hasHeader ? 'head' : '',
                    typeof v === 'number' ? 'num' : '',
                    isErrorValue(v) ? 'err' : '',
                    selected === addr ? 'sel' : '',
                    toneOf(shownStatic),
                  ]
                    .filter(Boolean)
                    .join(' ');
                  return (
                    <td key={c} className={cls} onClick={() => onSelect(addr)}>
                      {shownStatic}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {ex.nCols > 5 && <p className="scroll-hint">Tabel lebar: geser ke kanan untuk melihat kolom lainnya.</p>}
    </div>
  );
}
