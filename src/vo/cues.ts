import cuesJson from './cues.json';

/**
 * Typed access to the VO cue sheet (src/vo/cues.json, built by scripts/vo/build_cues.py from the
 * aligned ElevenLabs VO). Scenes NEVER hard-code timings: they ask for the frame of a phrase.
 *
 *   const c = scene('S11_massacre');
 *   <Sequence from={c.from} durationInFrames={c.duration}> … start={c.at('गोली चल गई')} …
 */
export type CueEvent = { phrase: string; action: string; frame: number; sec: number; wordIndex: number };
export type SceneCues = { id: string; title: string; style: string; from: number; to: number; events: CueEvent[] };

const data = cuesJson as { fps: number; totalFrames: number; scenes: SceneCues[] };
export const TOTAL_FRAMES = data.totalFrames;
export const SCENES = data.scenes;

export const scene = (id: string) => {
  const s = SCENES.find((x) => x.id === id);
  if (!s) throw new Error(`Unknown scene ${id}`);
  return {
    ...s,
    duration: s.to - s.from,
    /** LOCAL frame (inside the scene's <Sequence>) of the cue whose phrase matches. */
    at: (phrase: string) => {
      const e = s.events.find((x) => x.phrase === phrase);
      if (!e) throw new Error(`Cue "${phrase}" not in ${id}`);
      return e.frame - s.from;
    },
  };
};
