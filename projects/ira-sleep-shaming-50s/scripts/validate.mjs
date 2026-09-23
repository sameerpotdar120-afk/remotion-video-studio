import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const blueprint = JSON.parse(fs.readFileSync(path.join(root, 'src', 'shot_blueprint.json'), 'utf8'));

if (blueprint.shots.length !== 21) {
  throw new Error(`Expected 21 shots, got ${blueprint.shots.length}`);
}

let cursor = 0;
for (const shot of blueprint.shots) {
  if (shot.start_frame !== cursor) {
    throw new Error(`${shot.shot_id} starts at ${shot.start_frame}, expected ${cursor}`);
  }
  if (shot.end_frame_exclusive <= shot.start_frame) {
    throw new Error(`${shot.shot_id} has invalid duration`);
  }
  const asset = path.join(root, 'public', shot.source_asset);
  if (!fs.existsSync(asset)) {
    throw new Error(`${shot.shot_id} is missing ${shot.source_asset}`);
  }
  cursor = shot.end_frame_exclusive;
}

if (cursor !== 1200) {
  throw new Error(`Timeline ends at ${cursor}, expected 1200`);
}

for (const segment of blueprint.audioSegments) {
  const asset = path.join(root, 'public', segment.audio);
  if (!fs.existsSync(asset)) {
    throw new Error(`Missing narration ${segment.audio}`);
  }
  if (segment.duration_frames !== 240) {
    throw new Error(`${segment.segment_id} is ${segment.duration_frames} frames, expected 240`);
  }
}

console.log('PASS: 21 contiguous shots cover [0,1200), all visual assets exist, and five narration windows are 240 frames each.');
