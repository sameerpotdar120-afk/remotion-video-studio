"""
Scan the delivery pieces for the Chromium raster glitch seen once in C09: a full-width black band across an otherwise
normal frame. Decodes only the keyframes (every 2 s) at 480x270 and flags frames where a run of >= 6 rows is near-black
across >= 97 % of the width while the rest of the frame is clearly not dark. Letterbox-free design, so legitimate
full-width black rows only occur in fully dark shots (space, night), which the brightness test skips.

    python3 scripts/russia/scan_bands.py <dir with seg_NNNNN.mp4> [out.jpg]
"""
import glob, os, subprocess, sys
import numpy as np

D = sys.argv[1]
W, H = 480, 270
hits = []
for f in sorted(glob.glob(os.path.join(D, 'seg_*.mp4'))):
    a = int(os.path.basename(f)[4:9])
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-skip_frame', 'nokey', '-i', f, '-vf', f'scale={W}:{H}', '-vsync', '0',
                          '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], capture_output=True).stdout
    fr = np.frombuffer(raw, np.uint8).reshape(-1, H, W)
    for i, g in enumerate(fr):
        dark = (g < 14).mean(1) >= 0.97
        run = best = 0
        for d in dark:
            run = run + 1 if d else 0
            best = max(best, run)
        rest = g[~dark]
        if best >= 6 and rest.size and rest.mean() > 60:
            hits.append((a + i * 120, best))
print('frames checked in', D)
for h in hits: print(f'BAND at frame ~{h[0]} ({h[0] / 60:.1f}s), {h[1]} rows')
print('BANDS', len(hits))
