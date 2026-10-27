import V from './video.json';

/**
 * Russia video timeline (scripts/russia/build_timeline.py): VO words → video frames @60, with a silent
 * 2.8 s gap before each chapter for the scroll card.
 */
export const TOTAL = V.total;
export const AUDIO = V.audio;
export const CHAPTERS = V.chapters;
export const SPEECH = V.speech as [number, number][];
export const PARAS = V.paragraphs;

const norm = (w: string) => w.replace(/[।,.?!"“”:;]/g, '').toLowerCase();

/** Frames of paragraph p (0-based, = line of scripts/russia-elevenlabs.txt). */
export const para = (p: number) => ({ f: PARAS[p].f, fEnd: PARAS[p].fEnd });

/**
 * First frame of `phrase` inside paragraph p (word-level, punctuation-insensitive).
 * Throws at build time if the phrase is not in that paragraph — cues can never silently drift.
 */
export const at = (p: number, phrase: string, nth = 0): number => {
  const ws = V.words.filter((w) => w.p === p);
  const q = phrase.split(/\s+/).map(norm);
  let seen = 0;
  for (let i = 0; i + q.length <= ws.length; i++) {
    if (q.every((x, k) => norm(ws[i + k].w) === x)) {
      if (seen === nth) return ws[i].f;
      seen++;
    }
  }
  throw new Error(`phrase not found in paragraph ${p}: "${phrase}"`);
};
/** Last frame of `phrase` in paragraph p. */
export const end = (p: number, phrase: string, nth = 0): number => {
  const ws = V.words.filter((w) => w.p === p);
  const q = phrase.split(/\s+/).map(norm);
  let seen = 0;
  for (let i = 0; i + q.length <= ws.length; i++) {
    if (q.every((x, k) => norm(ws[i + k].w) === x)) {
      if (seen === nth) return ws[i + q.length - 1].fEnd;
      seen++;
    }
  }
  throw new Error(`phrase not found in paragraph ${p}: "${phrase}"`);
};

/** Speech ranges overlapping [from, to] — the narrator host's lip-flap. */
export const talkIn = (from: number, to: number): [number, number][] =>
  SPEECH.filter(([a, b]) => b >= from && a <= to);

/** 0..1 "VO is speaking" envelope with soft attack/release (music ducking). */
export const speakingAt = (f: number) => {
  let v = 0;
  for (const [a, b] of SPEECH) {
    if (f < a - 10 || f > b + 30) continue;
    const up = Math.min(1, Math.max(0, (f - (a - 10)) / 10));
    const down = Math.min(1, Math.max(0, (b + 30 - f) / 30));
    v = Math.max(v, Math.min(up, down));
  }
  return v;
};
