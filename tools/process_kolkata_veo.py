"""Kolkata: prepare the creator's Veo clips (public/kolkata/veo/*.mp4) for the edit, into public/kolkata/veo/proc/.

- Full-screen shots (16:9 from Veo): a 9:16 window (405×720, panning with the subject), motion-interpolated to 60 fps,
  upscaled to 1080×1920 with Lanczos and a light unsharp.
- Props on chroma green: interpolated to 60 fps, keyed by how far green exceeds red and blue (handles Veo's uneven,
  bokeh-lit green), green spill clamped, cropped to the alpha's union box, encoded as VP9 WebM with alpha.
- The ship on Veo's painted checkerboard: keyed by low saturation + high brightness (border-connected only).
- Effects on black (smoke, mist, dust): used as they are, with a screen blend in Remotion.

Re-running skips outputs that exist. Usage: uv run python tools/process_kolkata_veo.py
"""
from __future__ import annotations

import json
import shutil
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
VEO = ROOT / "public/kolkata/veo"
OUT = VEO / "proc"
TMP = Path("/tmp/claude-0/-home-user/c240dbdc-3166-5dbc-aaff-9659ff70d045/scratchpad/veo_work")

INTERP = "minterpolate=fps=60:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1"

# name: (source, start s, duration s, crop x expression in source pixels; t is seconds from start[, crop top, crop height])
# (the market clip came letterboxed: picture rows 71–647 only)
FULL = {
    "v01_city_today": ("v01_city_today.mp4", 0.0, 3.3, "560+57*t"),
    "v02_sutanuti_market": ("v02_sutanuti_market.mp4", 0.0, 2.6, "390+150*t", 72, 574),
    "v07_gobindapur_leaving": ("v07_gobindapur_leaving.mp4", 0.4, 2.8, "380+12*t"),
    "v10_city_of_palaces": ("v10_city_of_palaces.mp4", 1.4, 2.6, "450+90*t"),
}
GREEN = ["v03_temple_bell", "v06_seal_stamp", "v11_old_book", "v12_gavel"]
CHECKER = ["v00_ship_raw"]


def run(cmd: list[str]) -> None:
    subprocess.run(cmd, check=True)


def full_screen(name: str, src: str, ss: float, dur: float, x: str, top: int = 0, h: int = 720) -> None:
    out = OUT / f"{name}.mp4"
    if out.exists():
        return
    w = round(h * 9 / 16 / 2) * 2
    vf = f"crop={w}:{h}:'min(1280-{w},max(0,{x}))':{top},{INTERP},scale=1080:1920:flags=lanczos,unsharp=5:5:0.7:5:5:0"
    run(["ffmpeg", "-v", "error", "-y", "-ss", str(ss), "-t", str(dur), "-i", str(VEO / src), "-vf", vf, "-an",
         "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p", str(out)])


def frames(name: str, width: int | None = None) -> Path:
    d = TMP / name
    if d.exists():
        shutil.rmtree(d)
    d.mkdir(parents=True)
    vf = INTERP + (f",scale={width}:-2:flags=lanczos" if width else "")
    run(["ffmpeg", "-v", "error", "-y", "-i", str(VEO / f"{name}.mp4"), "-vf", vf, str(d / "%04d.png")])
    return d


def key_green(rgb: np.ndarray) -> np.ndarray:
    f = rgb.astype(np.float32) / 255
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    gx = g - np.maximum(r, b)
    a = 1 - np.clip((gx - 0.05) / 0.12, 0, 1)
    # keep only the biggest solid body (drops bokeh and stray specks)
    solid = a > 0.5
    lab, n = ndimage.label(solid)
    if n > 1:
        sizes = ndimage.sum(solid, lab, range(1, n + 1))
        big = sizes.max()
        keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > big * 0.04])
        keep = ndimage.binary_dilation(keep, iterations=6)
        a = a * keep
    g2 = np.where(gx > 0, np.maximum(r, b), g)
    out = np.dstack([r, g2, b, a])
    return (out * 255).astype(np.uint8)


def key_checker(rgb: np.ndarray) -> np.ndarray:
    f = rgb.astype(np.float32)
    sat = f.max(2) - f.min(2)
    bg = (sat < 16) & (f.min(2) > 196)
    lab, n = ndimage.label(bg)
    sizes = ndimage.sum(bg, lab, range(1, n + 1))
    keep = np.isin(lab, [i + 1 for i, s in enumerate(sizes) if s > 60])
    a = (~keep).astype(np.float32)
    a = ndimage.binary_erosion(a > 0.5, iterations=1).astype(np.float32)
    a = ndimage.gaussian_filter(a, 0.8)
    return np.dstack([rgb, (a * 255).astype(np.uint8)])


def keyed(name: str, fn, width: int | None = None) -> dict:
    out = OUT / f"{name}.webm"
    meta_p = OUT / f"{name}.json"
    if out.exists() and meta_p.exists():
        return json.loads(meta_p.read_text())
    d = frames(name, width)
    files = sorted(d.glob("*.png"))
    k = TMP / f"{name}_k"
    if k.exists():
        shutil.rmtree(k)
    k.mkdir()
    box = [10**9, 10**9, 0, 0]
    motion = []
    prev = None
    for i, p in enumerate(files):
        im = np.asarray(Image.open(p).convert("RGB"))
        rgba = fn(im)
        al = rgba[..., 3] > 24
        ys, xs = np.nonzero(al)
        if len(xs):
            box = [min(box[0], xs.min()), min(box[1], ys.min()), max(box[2], xs.max()), max(box[3], ys.max())]
        small = rgba[::8, ::8].astype(np.float32)
        motion.append(float(np.abs(small - prev).mean()) if prev is not None else 0.0)
        prev = small
        Image.fromarray(rgba, "RGBA").save(k / f"{i + 1:04d}.png")
    h, w = im.shape[:2]
    pad = 12
    x0, y0 = max(0, box[0] - pad), max(0, box[1] - pad)
    x1, y1 = min(w, box[2] + pad), min(h, box[3] + pad)
    cw, ch = (x1 - x0) // 2 * 2, (y1 - y0) // 2 * 2
    run(["ffmpeg", "-v", "error", "-y", "-framerate", "60", "-i", str(k / "%04d.png"), "-vf", f"crop={cw}:{ch}:{x0}:{y0}",
         "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "22", "-auto-alt-ref", "0", "-row-mt", "1", str(out)])
    # last frame as a still, for holds after the clip ends
    Image.open(k / files[-1].name).crop((x0, y0, x0 + cw, y0 + ch)).save(OUT / f"{name}_last.png")
    meta = {"w": int(cw), "h": int(ch), "src_w": int(w), "src_h": int(h), "x0": int(x0), "y0": int(y0), "frames": len(files), "fps": 60,
            "motion": [round(m, 2) for m in motion]}
    meta_p.write_text(json.dumps(meta))
    shutil.rmtree(d)
    shutil.rmtree(k)
    return meta


def main() -> None:
    import sys
    only = set(sys.argv[1:])
    OUT.mkdir(parents=True, exist_ok=True)
    TMP.mkdir(parents=True, exist_ok=True)
    for name, spec in FULL.items():
        if only and name not in only:
            continue
        full_screen(name, *spec)
        print("full", name)
    for name in GREEN:
        if only and name not in only:
            continue
        m = keyed(name, key_green)
        print("green", name, m["w"], m["h"])
    for name in CHECKER:
        if only and name not in only:
            continue
        m = keyed(name, key_checker, width=1280)
        print("checker", name, m["w"], m["h"])


if __name__ == "__main__":
    main()
