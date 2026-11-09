'use client';

import { useRef, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import {
  deleteProfile,
  exportJson,
  importJson,
  levelOf,
  signIn,
  signOut,
  streakOf,
  useProfile,
  useReady,
  useStore,
} from '../lib/store';

export function SignIn() {
  const ready = useReady();
  const store = useStore();
  const profile = useProfile();
  const [name, setName] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  if (!ready) return <p className="muted">Memuat…</p>;

  function submit(e: FormEvent) {
    e.preventDefault();
    const p = signIn(name);
    if (p) {
      setMsg({ ok: true, text: `Masuk sebagai ${p.name}.` });
      setName('');
    } else {
      setMsg({ ok: false, text: 'Isi nama dulu.' });
    }
  }

  function download() {
    const blob = new Blob([exportJson()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wulang-progres.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  async function upload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const res = importJson(await file.text());
    setMsg({ ok: res.ok, text: res.message });
    e.target.value = '';
  }

  const lv = profile ? levelOf(profile.xp) : null;

  return (
    <div className="signin">
      {profile && lv ? (
        <section className="card me-card" aria-label="Profil aktif">
          <h2>{profile.name}</h2>
          <dl className="stats">
            <div>
              <dt>Level</dt>
              <dd>{lv.level}</dd>
            </div>
            <div>
              <dt>XP</dt>
              <dd>{profile.xp}</dd>
            </div>
            <div>
              <dt>Soal selesai</dt>
              <dd>{Object.keys(profile.solved).length}</dd>
            </div>
            <div>
              <dt>Streak</dt>
              <dd>{streakOf(profile.days)} hari</dd>
            </div>
          </dl>
          <div className="progress" role="progressbar" aria-valuemin={0} aria-valuemax={lv.need} aria-valuenow={lv.into} aria-label="Menuju level berikutnya">
            <span style={{ width: `${(lv.into / lv.need) * 100}%` }} />
          </div>
          <p className="muted">
            {lv.need - lv.into} XP lagi menuju level {lv.level + 1}.
          </p>
          <button type="button" className="btn ghost" onClick={signOut}>
            Keluar
          </button>
        </section>
      ) : (
        <p className="muted">
          Belum masuk. Kamu tetap bisa berlatih. Progres otomatis disimpan ke profil Tamu, atau buat profil bernama di bawah.
        </p>
      )}

      <form className="card" onSubmit={submit}>
        <h2>{profile ? 'Ganti atau tambah profil' : 'Masuk atau buat profil'}</h2>
        <label className="field">
          <span>Nama</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={30} placeholder="Misalnya Dewi" autoComplete="nickname" />
        </label>
        <p className="muted">Nama yang sudah ada akan dibuka. Nama baru membuat profil baru. Tanpa kata sandi dan tanpa akun online.</p>
        <button type="submit" className="btn primary">
          Lanjut
        </button>
      </form>

      {store.profiles.length > 0 && (
        <section className="card" aria-label="Semua profil">
          <h2>Profil di perangkat ini</h2>
          <ul className="plist">
            {store.profiles.map((p) => (
              <li key={p.id}>
                <span>
                  {p.name} <span className="muted">({p.xp} XP)</span>
                  {p.id === store.currentId && <span className="badge"> aktif</span>}
                </span>
                <span className="row-actions">
                  {p.id !== store.currentId && (
                    <button type="button" className="btn ghost sm" onClick={() => signIn(p.name)}>
                      Pakai
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn ghost sm danger"
                    onClick={() => {
                      if (window.confirm(`Hapus profil ${p.name} beserta seluruh progresnya?`)) deleteProfile(p.id);
                    }}
                  >
                    Hapus
                  </button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="card" aria-label="Cadangan">
        <h2>Cadangan progres</h2>
        <p className="muted">Data hanya ada di browser ini. Ekspor untuk menyimpannya, atau impor untuk memulihkan di perangkat lain.</p>
        <div className="actions">
          <button type="button" className="btn ghost" onClick={download}>
            Ekspor
          </button>
          <button type="button" className="btn ghost" onClick={() => fileRef.current?.click()}>
            Impor
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={upload} />
        </div>
      </section>

      {msg && (
        <p className={`fb-inline ${msg.ok ? 'ok' : 'bad'}`} role="status">
          {msg.text}
        </p>
      )}
    </div>
  );
}
