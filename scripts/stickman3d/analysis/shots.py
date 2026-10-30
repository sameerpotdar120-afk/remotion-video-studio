"""Cut / transition finder for a reference video. Prints every frame where the picture jumps (hard cuts), and runs of
large changes (whip pans, push-ins, dissolves, flashes). Many shorts animate on twos (30 fps held for 2 frames at 60), so
changes show up every other frame - read runs, not single frames.
    python3 -I scripts/stickman3d/analysis/shots.py <ref.mp4>
"""
import subprocess, sys, numpy as np
W, H = 90, 160
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', sys.argv[1], '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W, 3).astype(np.float32)
d = np.abs(np.diff(fr, axis=0)).mean(axis=(1, 2, 3)); luma = fr.mean(axis=(1, 2, 3))
print('frames', len(fr))
for i, v in enumerate(d):
    if v > max(12, 6 * np.median(d[max(0, i - 30):i + 30])):
        print(f'change {i + 1}: diff {v:.1f}  luma {luma[i]:.0f}->{luma[i + 1]:.0f}')
