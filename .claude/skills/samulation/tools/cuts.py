"""Frame-difference curve of a video: tells hard cuts (one-frame spikes) from camera moves/whips (multi-frame humps)
and shows whether the camera ever stops.
usage: python3 cuts.py video.mp4 [--fps 30] > cuts.tsv
columns: frame, time, mean abs diff (0-255) vs the previous frame, label. Summary lines start with '#'."""
import sys, subprocess, argparse
import numpy as np
ap = argparse.ArgumentParser(); ap.add_argument('video'); ap.add_argument('--fps', type=float, default=None); a = ap.parse_args()
fps = a.fps or eval(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=r_frame_rate',
                                    '-of', 'csv=p=0', a.video], capture_output=True, text=True).stdout.strip())
w, h = 90, 160
raw = subprocess.run(['ffmpeg', '-nostdin', '-v', 'error', '-i', a.video, '-vf', f'scale={w}:{h},format=gray', '-f', 'rawvideo', '-'],
                     capture_output=True, check=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, h, w).astype(np.int16)
d = np.r_[0, np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2))]
med = np.median(d[1:]) if len(d) > 1 else 0
labels = []
for i in range(len(d)):
    prev, nxt = d[i - 1] if i > 0 else 0, d[i + 1] if i + 1 < len(d) else 0
    if d[i] > max(25, 4 * med) and prev < d[i] / 3 and nxt < d[i] / 3: labels.append('HARD_CUT')
    elif d[i] > max(12, 2.5 * med): labels.append('move')
    elif d[i] < 0.6: labels.append('static')
    else: labels.append('')
print('frame\ttime\tdiff\tlabel')
for i, (v, l) in enumerate(zip(d, labels)): print(f'{i + 1}\t{i / fps:.3f}\t{v:.1f}\t{l}')
cuts = [i + 1 for i, l in enumerate(labels) if l == 'HARD_CUT']
moves, run = [], 0
for i, l in enumerate(labels + ['']):
    if l == 'move': run += 1
    else:
        if run >= 3: moves.append((i - run + 1, i))
        run = 0
static = sum(1 for l in labels if l == 'static') / max(len(labels), 1)
print(f'# fps {fps:.3f}, frames {len(d)}, median diff {med:.1f}')
print(f'# hard cuts: {len(cuts)} at frames {cuts[:40]}')
print(f'# camera-move humps (>=3 frames): {len(moves)} e.g. {moves[:15]}')
print(f'# static frames: {static * 100:.1f}% (near 0% = the camera never stops)')
