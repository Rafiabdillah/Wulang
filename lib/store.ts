// Penyimpanan progres Wulang. Semua di localStorage, tanpa server.
// Akun bersifat lokal: nama saja, tanpa kata sandi.

import { useSyncExternalStore } from 'react';

export interface SolvedInfo {
  at: number;
  xp: number;
  hints: number;
}

export interface Profile {
  id: string;
  name: string;
  createdAt: number;
  xp: number;
  solved: Record<string, SolvedInfo>;
  hints: Record<string, number>;
  drafts: Record<string, Record<string, string>>;
  quiz: Record<string, boolean>;
  days: string[];
}

export interface Store {
  profiles: Profile[];
  currentId: string | null;
}

const KEY = 'wulang:v1';
const EMPTY: Store = { profiles: [], currentId: null };
const XP_PER_LEVEL = 100;
export const QUIZ_XP = 5;

let cache: Store | null = null;
const listeners = new Set<() => void>();

function newId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function isStore(x: unknown): x is Store {
  if (typeof x !== 'object' || x === null) return false;
  const s = x as Store;
  return Array.isArray(s.profiles) && (s.currentId === null || typeof s.currentId === 'string');
}

function normalize(p: Partial<Profile>): Profile {
  return {
    id: p.id ?? newId(),
    name: p.name ?? 'Tamu',
    createdAt: p.createdAt ?? Date.now(),
    xp: p.xp ?? 0,
    solved: p.solved ?? {},
    hints: p.hints ?? {},
    drafts: p.drafts ?? {},
    quiz: p.quiz ?? {},
    days: p.days ?? [],
  };
}

function load(): Store {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (isStore(parsed)) {
        return { profiles: parsed.profiles.map(normalize), currentId: parsed.currentId };
      }
    }
  } catch {
    // Penyimpanan diblokir atau isinya rusak: mulai dari kosong.
  }
  return { profiles: [], currentId: null };
}

export function getSnapshot(): Store {
  if (cache === null) cache = load();
  return cache;
}

function getServerSnapshot(): Store {
  return EMPTY;
}

function commit(next: Store): void {
  cache = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // Tetap jalan di memori kalau penyimpanan penuh atau diblokir.
  }
  listeners.forEach((l) => l());
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      cache = null;
      cb();
    }
  };
  window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener('storage', onStorage);
  };
}

const noopSubscribe = () => () => {};

// True setelah halaman terpasang di browser. Sebelum itu, data lokal belum boleh dipakai
// supaya HTML dari server dan hasil render pertama di browser sama.
export function useReady(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function useStore(): Store {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useProfile(): Profile | null {
  const s = useStore();
  return s.profiles.find((p) => p.id === s.currentId) ?? null;
}

// ---------- Tindakan ----------

function update(id: string, fn: (p: Profile) => Profile): void {
  const s = getSnapshot();
  commit({ ...s, profiles: s.profiles.map((p) => (p.id === id ? fn(p) : p)) });
}

// Pastikan ada profil aktif. Kalau belum ada, buat profil "Tamu" supaya progres tetap tersimpan.
export function ensureProfile(): Profile {
  const s = getSnapshot();
  const cur = s.profiles.find((p) => p.id === s.currentId);
  if (cur) return cur;
  const guest = s.profiles.find((p) => p.name === 'Tamu');
  if (guest) {
    commit({ ...s, currentId: guest.id });
    return guest;
  }
  const p = normalize({ name: 'Tamu' });
  commit({ profiles: [...s.profiles, p], currentId: p.id });
  return p;
}

export function signIn(rawName: string): Profile | null {
  const name = rawName.trim().replace(/\s+/g, ' ').slice(0, 30);
  if (name === '') return null;
  const s = getSnapshot();
  const found = s.profiles.find((p) => p.name.toLowerCase() === name.toLowerCase());
  if (found) {
    commit({ ...s, currentId: found.id });
    return found;
  }
  const p = normalize({ name });
  commit({ profiles: [...s.profiles, p], currentId: p.id });
  return p;
}

export function signOut(): void {
  const s = getSnapshot();
  commit({ ...s, currentId: null });
}

export function deleteProfile(id: string): void {
  const s = getSnapshot();
  commit({
    profiles: s.profiles.filter((p) => p.id !== id),
    currentId: s.currentId === id ? null : s.currentId,
  });
}

export function saveDraft(slug: string, inputs: Record<string, string>): void {
  const p = ensureProfile();
  update(p.id, (x) => ({ ...x, drafts: { ...x.drafts, [slug]: inputs } }));
}

export function openHint(slug: string, level: number): void {
  const p = ensureProfile();
  update(p.id, (x) => ({
    ...x,
    hints: { ...x.hints, [slug]: Math.max(x.hints[slug] ?? 0, level) },
  }));
}

export function todayKey(d: Date = new Date()): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

function withDay(days: string[], key: string): string[] {
  return days.includes(key) ? days : [...days, key];
}

// Catat soal selesai. XP hanya diberikan sekali per soal. Mengembalikan XP yang baru didapat.
export function markSolved(slug: string, xp: number): number {
  const p = ensureProfile();
  if (p.solved[slug]) return 0;
  update(p.id, (x) => ({
    ...x,
    xp: x.xp + xp,
    solved: { ...x.solved, [slug]: { at: Date.now(), xp, hints: x.hints[slug] ?? 0 } },
    days: withDay(x.days, todayKey()),
  }));
  return xp;
}

// Catat jawaban kuis. XP hanya untuk jawaban benar pertama.
export function answerQuiz(id: string, correct: boolean): number {
  const p = ensureProfile();
  if (p.quiz[id]) return 0;
  if (!correct) return 0;
  update(p.id, (x) => ({
    ...x,
    xp: x.xp + QUIZ_XP,
    quiz: { ...x.quiz, [id]: true },
    days: withDay(x.days, todayKey()),
  }));
  return QUIZ_XP;
}

// ---------- Turunan ----------

export function levelOf(xp: number): { level: number; into: number; need: number } {
  return { level: Math.floor(xp / XP_PER_LEVEL) + 1, into: xp % XP_PER_LEVEL, need: XP_PER_LEVEL };
}

function dayNumber(key: string): number {
  const [y, m, d] = key.split('-').map(Number);
  return Math.round(Date.UTC(y, m - 1, d) / 86400000);
}

// Streak = jumlah hari berturut-turut yang ada soal selesai, dihitung sampai hari ini atau kemarin.
export function streakOf(days: string[], now: Date = new Date()): number {
  if (days.length === 0) return 0;
  const set = new Set(days.map(dayNumber));
  const today = dayNumber(todayKey(now));
  let cursor = set.has(today) ? today : today - 1;
  let n = 0;
  while (set.has(cursor)) {
    n++;
    cursor--;
  }
  return n;
}

// ---------- Ekspor dan impor ----------

export function exportJson(): string {
  return JSON.stringify(getSnapshot(), null, 2);
}

// Gabungkan profil dari berkas ekspor. Profil bernama sama ditimpa oleh yang diimpor.
export function importJson(text: string): { ok: boolean; message: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { ok: false, message: 'Berkas bukan JSON yang valid.' };
  }
  if (!isStore(parsed)) return { ok: false, message: 'Isi berkas bukan data Wulang.' };
  const s = getSnapshot();
  const byName = new Map(s.profiles.map((p) => [p.name.toLowerCase(), p]));
  for (const raw of parsed.profiles) {
    const p = normalize(raw);
    const old = byName.get(p.name.toLowerCase());
    byName.set(p.name.toLowerCase(), old ? { ...p, id: old.id } : p);
  }
  const profiles = Array.from(byName.values());
  const currentId = s.currentId && profiles.some((p) => p.id === s.currentId) ? s.currentId : null;
  commit({ profiles, currentId });
  return { ok: true, message: `${parsed.profiles.length} profil digabungkan.` };
}
