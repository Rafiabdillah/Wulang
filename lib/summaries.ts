import { exercisesByKind } from './exercises';
import type { ExerciseSummary } from '../components/ExerciseList';
import type { Kind } from './types';

function firstSentence(text: string, max = 150): string {
  const m = /^.*?[.!?](\s|$)/.exec(text);
  const s = (m ? m[0] : text).trim();
  return s.length > max ? s.slice(0, max - 1).trimEnd() + '…' : s;
}

export function summariesFor(kind: Kind): ExerciseSummary[] {
  return exercisesByKind(kind).map((e) => ({
    slug: e.slug,
    title: e.title,
    category: e.category,
    emoji: e.emoji,
    level: e.level,
    xp: e.xp,
    fns: e.fns,
    teaser: firstSentence(e.story),
  }));
}
