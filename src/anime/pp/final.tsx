// Final assembly: the rendered picture + the full sound mix + one/two-word captions.
// Private inputs live in public/pp (gitignored): video.mp4, mix.wav, words.json.
import React from "react";
import { AbsoluteFill, Audio, OffthreadVideo, continueRender, delayRender, staticFile } from "remotion";
import { Captions, type Word } from "../../engine/Captions";

export const FilmFinal: React.FC = () => {
  const [words, setWords] = React.useState<Word[]>([]);
  const [h] = React.useState(() => delayRender("captions"));
  React.useEffect(() => { fetch(staticFile("pp/words.json")).then((r) => r.json()).then((w) => { setWords(w); continueRender(h); }).catch((e) => { console.error(e); continueRender(h); }); }, []);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo src={staticFile("pp/video.mp4")} />
      <Captions words={words} y={0.72} />
      <Audio src={staticFile("pp/mix.wav")} />
    </AbsoluteFill>
  );
};
