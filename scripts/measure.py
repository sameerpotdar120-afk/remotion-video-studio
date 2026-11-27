"""Measure a channel's style from its videos, frame by frame (don't guess, measure).

Usage:  python scripts/measure.py ref/<channel>      (a folder of .mp4 files, from yt-dlp)
Needs:  ffmpeg on PATH, Python 3 with numpy + Pillow.
Writes: ref/<channel>/measure/
  sheet_<video>_<n>.jpg   30 fps contact sheets (60 frames = 2 seconds per sheet) of the first 8 seconds + 2 s from the middle
  every_half_second_<video>.jpg   one frame every 0.5 s across the whole video (for cuts and the look)
  numbers.json            the measured numbers (shot length, cuts per minute, camera motion, colours, words per second)
Then Claude looks at the sheets + numbers and writes styles/<channel>.md (the style guide made of real numbers).
"""
import json, os, subprocess, sys, glob, colorsys
import numpy as np, shutil
from PIL import Image, ImageDraw

# Use ffmpeg/ffprobe if installed, otherwise the copy that comes with Remotion (npx remotion ffmpeg), so nothing extra to install.
def tool(name):
    return [name] if shutil.which(name) else ["npx", "remotion", name]

def frames(video, fps, start=None, dur=None, w=216):
    """Decode frames with ffmpeg into a temp folder (works with any ffmpeg build), return RGB arrays."""
    import tempfile, shutil
    tmp = tempfile.mkdtemp()
    cmd = tool("ffmpeg") + ["-v", "error"]
    if start is not None: cmd += ["-ss", str(start)]
    cmd += ["-i", video]
    if dur is not None: cmd += ["-t", str(dur)]
    cmd += ["-vf", f"scale={w}:-2", "-r", str(fps), os.path.join(tmp, "f%05d.png")]
    subprocess.run(cmd, check=True, shell=os.name == "nt")
    fs = sorted(glob.glob(os.path.join(tmp, "*.png")))
    arr = np.stack([np.asarray(Image.open(f).convert("RGB")) for f in fs])
    W0, H0 = Image.open(fs[0]).size
    shutil.rmtree(tmp)
    return arr, (W0, H0)

def duration(video):
    return float(subprocess.run(tool("ffprobe") + ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video], capture_output=True, text=True, shell=os.name == "nt").stdout.strip())

def sheet(fr, cols, path, label0=0.0, step=1 / 30):
    n = len(fr); rows = (n + cols - 1) // cols; h, w = fr.shape[1:3]
    im = Image.new("RGB", (cols * w, rows * h)); d = ImageDraw.Draw(im)
    for i, f in enumerate(fr):
        x, y = (i % cols) * w, (i // cols) * h
        im.paste(Image.fromarray(f), (x, y)); d.text((x + 3, y + 3), f"{label0 + i * step:.2f}s", fill=(255, 255, 0))
    im.save(path, quality=88)

def hist(f):
    q = (f[int(f.shape[0] * 0.04): int(f.shape[0] * 0.6)] // 32).astype(int)  # skip the caption area
    idx = q[..., 0] * 64 + q[..., 1] * 8 + q[..., 2]
    h = np.bincount(idx.ravel(), minlength=512).astype(float); return h / h.sum()

def main(folder):
    out = os.path.join(folder, "measure"); os.makedirs(out, exist_ok=True)
    vids = sorted(glob.glob(os.path.join(folder, "*.mp4")))
    per = []
    for v in vids:
        name = os.path.splitext(os.path.basename(v))[0]; D = duration(v)
        # 1. 30 fps contact sheets: first 8 s + 2 s from the middle
        f30, size = frames(v, 30, 0, 8)
        for k in range(0, len(f30), 60): sheet(f30[k:k + 60], 10, os.path.join(out, f"sheet_{name}_{k // 60 + 1}.jpg"), k / 30)
        fm, _ = frames(v, 30, D / 2, 2); sheet(fm, 10, os.path.join(out, f"sheet_{name}_mid.jpg"), D / 2)
        # 2. cuts: big jumps in the colour histogram between frames (10 fps)
        f10, _ = frames(v, 10, w=144)
        H = [hist(f) for f in f10]
        d = np.array([0.5 * np.abs(H[i] - H[i - 1]).sum() for i in range(1, len(H))])
        cuts = [i / 10 for i in range(1, len(H)) if d[i - 1] > 0.42 and (i < 2 or d[i - 2] <= 0.42)]
        shots = np.diff([0] + cuts + [D])
        # 3. camera motion: average change between frames that are not cuts (higher = the camera keeps moving)
        moving = float(np.mean(d[d <= 0.42])) if len(d) else 0
        # 4. the look: shadow colour, highlight colour, saturation, pure black
        px = np.concatenate([f[int(f.shape[0] * 0.04): int(f.shape[0] * 0.6)].reshape(-1, 3) for f in f10[::5]]).astype(float) / 255
        lum = px @ np.array([0.299, 0.587, 0.114])
        dark = px[lum < np.quantile(lum, 0.12)].mean(0); bright = px[lum > np.quantile(lum, 0.9)].mean(0)
        hue = lambda c: round(colorsys.rgb_to_hls(*c)[0] * 360)
        sat = float(np.mean([colorsys.rgb_to_hsv(*p)[1] for p in px[::40]]))
        every, _ = frames(v, 2, w=180); sheet(every, 16, os.path.join(out, f"every_half_second_{name}.jpg"), 0, 0.5)
        # 5. words per second, if yt-dlp saved subtitles next to the video (<name>.en.json3 or .vtt)
        wps = None
        for sub in glob.glob(os.path.join(folder, name + "*.json3")):
            j = json.load(open(sub, encoding="utf-8")); words = sum(len(s.get("utf8", "").split()) for e in j.get("events", []) for s in e.get("segs", []) or [])
            wps = round(words / D, 2)
        per.append({"video": name, "seconds": round(D, 1), "size": size, "shots": len(shots), "avg_shot_s": round(float(np.mean(shots)), 2),
                    "cuts_per_min": round(len(cuts) / D * 60, 1), "camera_motion": round(moving, 3),
                    "shadow_rgb": [round(x * 255) for x in dark], "shadow_hue": hue(dark), "highlight_rgb": [round(x * 255) for x in bright], "highlight_hue": hue(bright),
                    "saturation": round(sat, 2), "pure_black_pct": round(float((lum < 0.04).mean() * 100), 2), "words_per_s": wps})
        print(per[-1])
    avg = lambda k: round(float(np.mean([p[k] for p in per if p[k] is not None])), 2) if any(p[k] is not None for p in per) else None
    summary = {k: avg(k) for k in ["seconds", "avg_shot_s", "cuts_per_min", "camera_motion", "saturation", "pure_black_pct", "words_per_s", "shadow_hue", "highlight_hue"]}
    json.dump({"videos": per, "average": summary}, open(os.path.join(out, "numbers.json"), "w"), indent=1)
    print("AVERAGE", summary)

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "ref")
