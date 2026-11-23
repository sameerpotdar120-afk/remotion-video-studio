#!/usr/bin/env python3
"""Nauru Short: render with the cinematic-film engine plus the Leonida kit.

  python3 tools/gta6/render_gta.py --probe 0,3,6.5 --size 1080x1920          # stills -> out/probe/
  python3 tools/gta6/render_gta.py --size 2160x3840 --workers 3 --out out/gta6_4k.mp4   # pieces + previews

Pieces of 150 frames go to out/pieces/ (finished ones are skipped on a rerun); every 60th frame is saved small to
out/preview/ while rendering.
"""
import argparse
import math
import multiprocessing as mp
import pathlib
import subprocess
import sys
import time
import types

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import numpy as np  # noqa: E402
import skia  # noqa: E402
from PIL import Image  # noqa: E402

import nrkit as NK  # noqa: E402
from nrkit import G  # noqa: E402
import scene  # noqa: E402  (tools/nauru/scene.py)

E = G.E
OUT = NK.FILM / "out"
FPS = 30
N = int(round(scene.DUR * FPS))
LOOP = 15


def build():
    film = E.Film(scene.DUR, fps=FPS, look=dict(NK.LOOK))
    film.items = []
    film.fade_in = film.fade_out = 0
    screen = scene.build(film)
    return film, sorted(screen, key=lambda s: s.z)


class GRenderer(E.Renderer):
    def __init__(self, film, w, h, screen):
        doc = types.SimpleNamespace(prep=NK.PREP, dir=NK.FILM)
        super().__init__(film, w, h, doc)
        self.screen = screen
        self.U = w / 2160.0
        self.res.frame_w, self.res.frame_h = w, h

    def draw_world(self, t):
        f = self.film
        cx, cy, z, rot = f.camera(t)
        k = z * self.s
        self.res.screen_scale = k
        self.res.pxw = self.U / k
        hw, hh = self.W / 2 / k * 1.25, self.H / 2 / k * 1.25
        self.res.view = view = skia.Rect.MakeLTRB(cx - hw, cy - hh, cx + hw, cy + hh)
        with self.surface as c:
            c.clear(G.color(f.look["bg"]))
            c.save()
            c.translate(self.W / 2, self.H / 2); c.scale(k, k); c.rotate(rot); c.translate(-cx, -cy)
            for it in self.items:
                if it.visible(t):
                    b = it.bounds(self.res)
                    if b is None or skia.Rect.Intersects(b, view):
                        it.draw(c, self.res, t)
            c.restore()
            for s in self.screen:
                if s.visible(t):
                    s.draw(c, t, self.U)
            self.captions(c, t)
        return self.surface.makeImageSnapshot().toarray(colorType=skia.ColorType.kRGBA_8888_ColorType)[..., :3]

    def captions(self, c, t):
        cap = None
        for i, (t0, text) in enumerate(scene.CAPTIONS):
            t1 = scene.CAPTIONS[i + 1][0] if i + 1 < len(scene.CAPTIONS) else scene.DUR
            if t0 <= t < min(t1, t0 + 3.2):
                cap = (t0, text)
        if not cap:
            return
        U = self.U
        null_on = any(isinstance(s, G.NullPanel) and s.visible(t) and t < (s.t_out or 1e9) for s in self.screen)
        y = (1690 if null_on else 3000) * U
        u = G.eoc(G.ramp(t, cap[0], 0.18))
        size = 150 * U
        img, Wd, Hd, base = G.text_image(((cap[1], G.WHITE, "baloob"),), int(min(260, size * 1.0)), True, None)
        kk = size / min(260, size * 1.0)
        w = Wd * kk
        if w > 2040 * U:
            kk *= 2040 * U / w
        s = 0.92 + 0.08 * u
        c.save(); c.translate(1080 * U, y); c.scale(s, s)
        p = skia.Paint(AntiAlias=True); p.setAlphaf(G.clamp(u * 1.6))
        bg = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-Wd * kk / 2 + 30 * U, -base * kk - 10 * U, Wd * kk - 60 * U, Hd * kk * 0.62), 22 * U, 22 * U)
        c.drawRRect(bg, G.paint((10, 6, 22), 0.55 * G.clamp(u * 1.6)))
        c.drawImageRect(img, skia.Rect.MakeXYWH(-Wd * kk / 2, -base * kk + Hd * kk * 0.08, Wd * kk, Hd * kk), G.SAMP, p)
        c.restore()

    def frame(self, n):
        f = self.film; t = n / f.fps
        sp = f.screen_speed(t) * self.s
        k = int(G.clamp(math.ceil(sp / (10 * max(self.s, 0.5))), 1, 3))
        if k == 1:
            img = self.draw_world(t).astype(np.float32)
        else:
            acc = np.zeros((self.H, self.W, 3), np.float32)
            for i in range(k):
                acc += self.draw_world(t + (i / k - 0.5) * 0.5 / f.fps)
            img = acc / k
        return self.post(img, n)


_R = {}


def renderer(size):
    if size not in _R:
        w, h = map(int, size.split("x"))
        film, screen = build()
        _R[size] = GRenderer(film, w, h, screen)
    return _R[size]


def frame_loop(r, n):
    """The last LOOP frames dissolve into frame 0, so the Short loops seamlessly."""
    img = r.frame(n)
    if n >= N - LOOP:
        u = G.eio((n - (N - LOOP) + 1) / LOOP)
        if not hasattr(r, "_f0"):
            r._f0 = r.frame(0).astype(np.float32)
        img = (img.astype(np.float32) * (1 - u) + r._f0 * u).astype(np.uint8)
    return img


def piece(args):
    size, f0, f1, out, crf = args
    r = renderer(size)
    tmp = out.with_suffix(".part.mp4")
    ff = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{r.W}x{r.H}", "-r", str(FPS),
                           "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", str(crf), "-rc-lookahead", "10", "-threads", "2",
                           "-pix_fmt", "yuv420p", str(tmp)], stdin=subprocess.PIPE)
    t0 = time.time()
    for n in range(f0, f1):
        img = frame_loop(r, n)
        ff.stdin.write(img.tobytes())
        if n % 60 == 0:
            Image.fromarray(img).resize((540, 960), Image.LANCZOS).save(OUT / "preview" / f"p{n:05d}.jpg", quality=85)
    ff.stdin.close()
    if ff.wait() != 0:
        raise RuntimeError(f"ffmpeg failed: {out}")
    tmp.rename(out)
    return f0, f1, time.time() - t0


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--size", default="1080x1920")
    ap.add_argument("--probe", default="")
    ap.add_argument("--out", default="")
    ap.add_argument("--workers", type=int, default=3)
    ap.add_argument("--crf", type=int, default=17)
    ap.add_argument("--piece", type=int, default=150)
    ap.add_argument("--f0", type=int, default=0)
    ap.add_argument("--f1", type=int, default=N)
    a = ap.parse_args()
    (OUT / "probe").mkdir(parents=True, exist_ok=True); (OUT / "preview").mkdir(parents=True, exist_ok=True)
    if a.probe:
        r = renderer(a.size)
        for tt in a.probe.split(","):
            t0 = time.time(); n = int(round(float(tt) * FPS))
            p = OUT / "probe" / f"t{float(tt):07.2f}.jpg"
            Image.fromarray(frame_loop(r, n)).save(p, quality=90)
            print(f"{p} {time.time() - t0:.2f}s", flush=True)
        return
    pd = OUT / f"pieces_{a.size}"; pd.mkdir(parents=True, exist_ok=True)
    jobs = []
    for f0 in range(a.f0, a.f1, a.piece):
        f1 = min(f0 + a.piece, a.f1)
        out = pd / f"piece_{f0:05d}.mp4"
        if not out.exists():
            jobs.append((a.size, f0, f1, out, a.crf))
    print(f"{len(jobs)} pieces to render, {N} frames total", flush=True)
    t0 = time.time()
    with mp.get_context("spawn").Pool(a.workers) as pool:
        for f0, f1, dt in pool.imap_unordered(piece, jobs):
            print(f"piece {f0}-{f1} done in {dt:.0f}s ({(f1 - f0) / dt:.2f} fps) at {time.time() - t0:.0f}s", flush=True)
    if a.out:
        lst = pd / "list.txt"
        lst.write_text("".join(f"file '{p}'\n" for p in sorted(pd.glob("piece_*.mp4")) if ".part" not in p.name))
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", a.out], check=True)
        print("wrote", a.out)
    print("RENDERDONE", flush=True)


if __name__ == "__main__":
    main()
