'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { checkAnswer } from '../lib/check';
import type { CheckResult } from '../lib/check';
import { markSolved, getSnapshot, openHint, saveDraft, useProfile, useReady } from '../lib/store';
import type { Exercise } from '../lib/types';
import { Rich } from './Rich';
import { SheetGrid } from './SheetGrid';

interface Props {
  ex: Exercise;
  prev?: { slug: string; title: string };
  next?: { slug: string; title: string };
  basePath: '/latihan' | '/tantangan';
}

const HINT_LABELS = ['Petunjuk umum', 'Pendekatan', 'Hampir solusi'];

export function ExercisePage({ ex, prev, next, basePath }: Props) {
  const ready = useReady();
  const profile = useProfile();
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [results, setResults] = useState<CheckResult | null>(null);
  const [gained, setGained] = useState<number | null>(null);
  const [selected, setSelected] = useState<string | null>(ex.targets[0] ?? null);
  const [showSolution, setShowSolution] = useState(false);
  const refs = useRef<Record<string, HTMLInputElement | null>>({});

  // Muat draf yang tersimpan setelah halaman terpasang di browser.
  useEffect(() => {
    if (!ready) return;
    const s = getSnapshot();
    const p = s.profiles.find((x) => x.id === s.currentId);
    setInputs(p?.drafts[ex.slug] ?? {});
    setResults(null);
    setGained(null);
    setShowSolution(false);
  }, [ready, ex.slug]);

  const solved = profile?.solved[ex.slug];
  const openedHints = profile?.hints[ex.slug] ?? 0;
  const label = basePath === '/latihan' ? 'Latihan' : 'Tantangan';

  function change(addr: string, value: string) {
    const nextInputs = { ...inputs, [addr]: value };
    setInputs(nextInputs);
    setSelected(addr);
    // Mengedit sel membatalkan hasil cek sebelumnya, supaya warna dan pesan tidak basi.
    if (results) {
      setResults(null);
      setGained(null);
    }
    saveDraft(ex.slug, nextInputs);
  }

  function enter(addr: string) {
    const i = ex.targets.indexOf(addr);
    const nextAddr = ex.targets[i + 1];
    if (nextAddr) refs.current[nextAddr]?.focus();
    else refs.current[addr]?.blur();
  }

  function check() {
    const res = checkAnswer(ex, inputs);
    setResults(res);
    if (res.ok) setGained(markSolved(ex.slug, ex.xp));
    else setGained(null);
  }

  function reset() {
    setInputs({});
    setResults(null);
    setGained(null);
    saveDraft(ex.slug, {});
  }

  const failed = results ? ex.targets.filter((t) => results.cells[t] && !results.cells[t].ok) : [];

  return (
    <div
      className="ex"
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
          e.preventDefault();
          check();
        }
      }}
    >
      <nav className="crumbs" aria-label="Jejak halaman">
        <Link href={basePath}>{label}</Link>
        <span aria-hidden="true">/</span>
        <span>{ex.title}</span>
      </nav>

      <div className="ex-layout">
        <section className="card ex-info" aria-labelledby="ex-title">
          <div className="meta">
            <span className={`badge lv-${ex.level.toLowerCase()}`}>{ex.level}</span>
            <span className="badge xp">+{ex.xp} XP</span>
            <span className="muted">{ex.category}</span>
            {solved && <span className="badge done">Selesai</span>}
          </div>
          <h1 id="ex-title">
            <span aria-hidden="true">{ex.emoji} </span>
            {ex.title}
          </h1>
          <p className="story">
            <Rich text={ex.story} />
          </p>
          <p className="task">
            <Rich text={ex.task} />
          </p>
          {ex.note && (
            <p className="note">
              <Rich text={ex.note} />
            </p>
          )}
          <dl className="facts">
            <dt>Sel yang diisi</dt>
            <dd>
              {ex.targets.length <= 6 ? ex.targets.map((t) => <code key={t}>{t}</code>) : <code>{ex.targets[0]} sampai {ex.targets[ex.targets.length - 1]}</code>}
            </dd>
            <dt>Fungsi wajib</dt>
            <dd>
              {ex.fns.map((f) => (
                <Link key={f} href={`/ensiklopedia/${f}`} className="code-link">
                  <code>{f}</code>
                </Link>
              ))}
            </dd>
          </dl>

          <div className="hints">
            <h2>Bantuan</h2>
            {HINT_LABELS.map((name, i) =>
              i < openedHints ? (
                <div className="hint open" key={name}>
                  <strong>{name}</strong>
                  <p>
                    <Rich text={ex.hints[i]} />
                  </p>
                </div>
              ) : null
            )}
            {openedHints < 3 ? (
              <button type="button" className="btn ghost" onClick={() => openHint(ex.slug, openedHints + 1)}>
                Buka {HINT_LABELS[openedHints].toLowerCase()} ({openedHints + 1} dari 3)
              </button>
            ) : (
              <p className="muted">Semua petunjuk sudah dibuka.</p>
            )}
          </div>
        </section>

        <section className="ex-work" aria-label="Lembar kerja">
          <SheetGrid
            ex={ex}
            inputs={inputs}
            results={results ? results.cells : null}
            selected={selected}
            onSelect={setSelected}
            onChange={change}
            onEnter={enter}
            registerRef={(addr, el) => {
              refs.current[addr] = el;
            }}
          />

          <div className="actions">
            <button type="button" className="btn primary" onClick={check}>
              Cek jawaban
            </button>
            <button type="button" className="btn ghost" onClick={reset}>
              Ulangi
            </button>
            <button type="button" className="btn ghost" onClick={() => setShowSolution((v) => !v)} aria-expanded={showSolution}>
              {showSolution ? 'Sembunyikan solusi' : 'Lihat solusi'}
            </button>
            <span className="muted keyhint">Ctrl+Enter untuk cek</span>
          </div>

          <div className="feedback" aria-live="polite">
            {results && results.ok && (
              <div className="fb ok">
                <strong>Benar! Formula dan nilainya cocok.</strong>
                {gained ? <span className="badge xp">+{gained} XP</span> : <span className="muted">XP soal ini sudah pernah kamu ambil.</span>}
              </div>
            )}
            {results && !results.ok && (
              <div className="fb bad">
                <strong>Belum tepat.</strong>
                <ul>
                  {failed.map((t) => {
                    const r = results.cells[t];
                    return (
                      <li key={t}>
                        <code>{t}</code> {r.reason}
                        {r.got !== undefined && r.want !== undefined && (
                          <span className="muted">
                            {' '}
                            Hasilmu {r.got}, yang diharapkan {r.want}.
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          {(showSolution || (results && results.ok) || solved) && (
            <div className="card solution">
              <h2>Solusi dan pembahasan</h2>
              {showSolution && (
                <ul className="sol-list">
                  {ex.targets.map((t) => (
                    <li key={t}>
                      <code>{t}</code> <code>{ex.solution[t]}</code>
                    </li>
                  ))}
                </ul>
              )}
              <p>
                <Rich text={ex.explanation} />
              </p>
              {!showSolution && <p className="muted">Mau lihat rumus acuannya? Tekan Lihat solusi.</p>}
            </div>
          )}

          <nav className="pager" aria-label="Soal lain">
            {prev ? (
              <Link href={`${basePath}/${prev.slug}`} className="pg prev">
                <span className="muted">Sebelumnya</span>
                {prev.title}
              </Link>
            ) : (
              <span />
            )}
            {next ? (
              <Link href={`${basePath}/${next.slug}`} className="pg next">
                <span className="muted">Selanjutnya</span>
                {next.title}
              </Link>
            ) : (
              <span />
            )}
          </nav>
        </section>
      </div>
    </div>
  );
}
