#!/bin/bash
# Scaffold a new Stickman3D episode: src/<slug>/Episode.tsx (a starter shot using the core kit), an empty caption
# track, public/<slug>/ for the audio, and the composition <Name>-4K registered in src/Root.tsx (2160x3840, 60 fps).
# usage: scripts/stickman3d/new_episode.sh <slug> <ComponentName> <frames>
#   e.g. scripts/stickman3d/new_episode.sh monkey Monkey 3600
set -euo pipefail
SLUG=$1; NAME=$2; FRAMES=$3
cd "$(dirname "$0")/../.."
[ -e "src/$SLUG" ] && { echo "src/$SLUG already exists"; exit 1; }
mkdir -p "src/$SLUG" "public/$SLUG" "docs/$SLUG-ref"
echo '[]' > "src/$SLUG/captions.json"
cat > "src/$SLUG/Episode.tsx" <<TSX
import React from 'react';
import { AbsoluteFill, Audio, staticFile, useCurrentFrame } from 'remotion';
import { DAY, Figure, Stage, StreetSet, Seg, WordCaptions, camAt, idle, type CamKey, type CapWord } from '../styles/stickman3d';
import CAPS from './captions.json';

export const ${NAME^^}_TOTAL = $FRAMES;

/* Shot 1 - replace with the shot list from docs/$SLUG-ref/ANALYSIS.md (global frames, acting keyed to caption words). */
const CAM1: CamKey[] = [[0, [2.0, 1.45, 10.8], [2.4, 1.75, -8], 47], [300, [2.1, 1.45, 10.4], [2.4, 1.75, -8], 47]];
const S1: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Stage cam={camAt(CAM1, f)} light={DAY}>
      <StreetSet />
      <Figure look="oldman" pose={{ ...idle(f), eyes: 'sleepy', mouth: 'line' }} x={3.15} z={3.85} res={14} />
    </Stage>
  );
};

export const ${NAME}: React.FC<{ noAudio?: boolean }> = ({ noAudio }) => (
  <AbsoluteFill style={{ background: '#000' }}>
    <Seg a={0} b={${NAME^^}_TOTAL}><S1 /></Seg>
    <WordCaptions words={CAPS as CapWord[]} />
    {!noAudio && <Audio src={staticFile('$SLUG/audio.wav')} />}
  </AbsoluteFill>
);
TSX
python3 - "$SLUG" "$NAME" <<'PY'
import sys
slug, name = sys.argv[1], sys.argv[2]
p = 'src/Root.tsx'; s = open(p).read()
imp = f"import {{ {name}, {name.upper()}_TOTAL }} from './{slug}/Episode';"
s = s.replace("import { Horse, HORSE_TOTAL } from './horse/Horse';", "import { Horse, HORSE_TOTAL } from './horse/Horse';\n" + imp, 1)
comp = f'      <Composition id="{name}-4K" component={{{name}}} durationInFrames={{{name.upper()}_TOTAL}} fps={{60}} width={{2160}} height={{3840}} />\n'
s = s.replace('      <Composition id="Horse-4K"', comp + '      <Composition id="Horse-4K"', 1)
open(p, 'w').write(s)
PY
echo "scaffolded src/$SLUG (composition $NAME-4K). Put the reference audio at public/$SLUG/audio.wav."
