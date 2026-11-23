"""Nauru Short: the reference-style kit on top of the cinematic-film engine and the GTA 6 kit.

World (Web Mercator metres, y down): SatPlate (EOX Sentinel-2 plates, full resolution), Outline (coastline / border
rings: fill + white stroke + glow, wiping in from the centre), Jets (plane icons drawn in code), IslandHalo (the dark
ring of ocean around the island, as in the reference). Screen (2160x3840 design px): Stamp (red rubber stamp),
IncomeBars (Nauru vs USA). Posters, NullPanel, Chip, YearCard and all text come from gtakit (PIL + raqm).
"""
import functools
import json
import math
import pathlib
import sys

import numpy as np
import skia
from PIL import Image

sys.path.append(str(pathlib.Path(__file__).resolve().parents[1] / "gta6"))
import gtakit as G  # noqa: E402

E = G.E
REPO = G.REPO
FILM = REPO / "public/nauru/film"
G.PREP = FILM / "assets/prep"          # gtakit's Poster loads from PREP/photos
G.FILM = FILM
PREP = G.PREP
WHITE, YEL, INK = (250, 250, 250), (255, 214, 64), (10, 12, 20)
RED = (222, 34, 44)
GOLD = (255, 196, 60)
SEA = (8, 24, 44)
LOOK = dict(board=None, bg=SEA, grade=(1.0, 1.0, 1.02), grain=0.0, glow=0.18, vignette=0.9, curve=0.22, dim=(4, 8, 16))
ramp, eio, eoc, eob, clamp = G.ramp, G.eio, G.eoc, G.eob, G.clamp


def load_geo():
    return json.loads((PREP / "geo.json").read_text())


@functools.lru_cache(maxsize=12)
def plate_img(name):
    f = PREP / "maps" / (name + (".png" if name == "nauru_island" else ".jpg"))
    return G.to_skia(Image.open(f))


class Sea(E.Item):
    """Deep ocean everywhere under the plates (screen space, a soft vertical gradient)."""
    z = -100

    def __init__(self):
        super().__init__(-1)

    def draw(self, c, res, t):
        m = c.getTotalMatrix(); c.save(); c.resetMatrix()
        W, H = res.frame_w, res.frame_h
        g = skia.GradientShader.MakeLinear([skia.Point(0, 0), skia.Point(0, H)], [G.color((10, 34, 62)), G.color((6, 18, 36))], [0, 1])
        p = skia.Paint(); p.setShader(g); c.drawRect(skia.Rect.MakeWH(W, H), p)
        c.restore(); c.setMatrix(m)


class SatPlate(E.Item):
    z = -60

    def __init__(self, geo, name, z=None, t_in=-1, t_out=None, alpha=1.0):
        super().__init__(t_in, t_out, z)
        self.name, self.alpha = name, alpha
        self.rect = skia.Rect.MakeLTRB(*geo["plates"][name]["rect"])

    def bounds(self, res):
        return self.rect

    def draw(self, c, res, t):
        a = self.alpha * self.fade(t) * clamp((t - self.t_in) / 0.4 + 0.001) if self.t_in > 0 else self.alpha * self.fade(t)
        if a <= 0:
            return
        p = skia.Paint(AntiAlias=True); p.setAlphaf(a)
        c.drawImageRect(plate_img(self.name), self.rect, G.SAMP, p)


class IslandHalo(E.Item):
    """The dark vignette ring around the island (reference look): darker ocean close to the island, fading out."""
    z = -55

    def __init__(self, xy, r):
        super().__init__(-1)
        self.x, self.y, self.r = xy[0], xy[1], r

    def bounds(self, res):
        return skia.Rect.MakeLTRB(self.x - self.r * 3, self.y - self.r * 3, self.x + self.r * 3, self.y + self.r * 3)

    def draw(self, c, res, t):
        g = skia.GradientShader.MakeRadial(skia.Point(self.x, self.y), self.r * 3,
                                           [G.color((4, 14, 28), 0.85), G.color((4, 14, 28), 0.55), G.color((4, 14, 28), 0)], [0, 0.45, 1])
        p = skia.Paint(AntiAlias=True); p.setShader(g)
        c.drawCircle(self.x, self.y, self.r * 3, p)


def rings_path(rings):
    p = skia.Path()
    for r in rings:
        p.moveTo(*r[0])
        for q in r[1:]:
            p.lineTo(*q)
        p.close()
    return p


class Outline(E.Item):
    """A coastline or border: optional fill (wipes in from the centre), white stroke and soft glow, sizes in design px."""
    z = 5

    def __init__(self, rings, t_in, t_out=None, fill=None, fill_a=0.45, stroke=WHITE, px=5, glow=None, wipe=0.6,
                 scale=1.0, to_fill=None, t_change=None, z=None):
        super().__init__(t_in, t_out, z)
        self.path = rings_path(rings)
        b = self.path.getBounds(); self.cx, self.cy = b.centerX(), b.centerY()
        if scale != 1.0:
            m = skia.Matrix(); m.setScale(scale, scale, self.cx, self.cy); self.path.transform(m)
        self.box = self.path.getBounds()
        self.fill, self.fa, self.stroke, self.px, self.glow, self.wipe = fill, fill_a, stroke, px, glow, wipe
        self.to_fill, self.tc = to_fill, t_change

    def bounds(self, res):
        return self.box.makeOutset(self.box.width(), self.box.height())

    def draw(self, c, res, t):
        a = self.fade(t) * clamp((t - self.t_in) / 0.15 + 0.001)
        if a <= 0:
            return
        u = eoc(ramp(t, self.t_in, self.wipe)) if self.wipe > 0 else 1
        pw = res.pxw
        c.save()
        clip = skia.Path(); clip.addCircle(self.cx, self.cy, math.hypot(self.box.width(), self.box.height()) * 0.6 * u + 1)
        c.clipPath(clip, skia.ClipOp.kIntersect, True)
        if self.fill:
            f = self.fill
            if self.to_fill and self.tc is not None:
                v = eio(ramp(t, self.tc, 0.9)); f = tuple(f[i] + (self.to_fill[i] - f[i]) * v for i in range(3))
            c.drawPath(self.path, G.paint(f, self.fa * a))
        if self.glow:
            c.drawPath(self.path, G.paint(self.glow, 0.55 * a, stroke=self.px * 5 * pw, blur=self.px * 4 * pw))
        if self.stroke:
            c.drawPath(self.path, G.paint(self.stroke, 0.95 * a, stroke=self.px * pw))
        c.restore()


def plane_path():
    """A top-view airliner silhouette, nose up, unit size (about 1 wide, 1 long)."""
    p = skia.Path()
    pts = [(0, -0.5), (0.05, -0.42), (0.06, -0.1), (0.5, 0.08), (0.5, 0.15), (0.06, 0.06), (0.05, 0.32), (0.18, 0.42),
           (0.18, 0.48), (0, 0.44), (-0.18, 0.48), (-0.18, 0.42), (-0.05, 0.32), (-0.06, 0.06), (-0.5, 0.15), (-0.5, 0.08),
           (-0.06, -0.1), (-0.05, -0.42)]
    p.moveTo(*pts[0])
    for q in pts[1:]:
        p.lineTo(*q)
    p.close()
    return p


PLANE = plane_path()


class Jets(E.Item):
    """n white plane icons flying in to line up in a row across a point (design-px size, staggered)."""
    z = 30

    def __init__(self, xy, n, t_in, t_out=None, px=210, gap=1.15, angle=-35, row_px=None):
        super().__init__(t_in, t_out)
        self.x, self.y, self.n, self.px, self.gap, self.ang = xy[0], xy[1], n, px, gap, angle

    def bounds(self, res):
        r = self.px * self.n * 1.5 * res.pxw
        return skia.Rect.MakeLTRB(self.x - r, self.y - r, self.x + r, self.y + r)

    def cues(self):
        return [("whoosh", self.t_in + i * 0.09, 0.3, {}) for i in range(0, self.n, 2)]

    def draw(self, c, res, t):
        a = self.fade(t)
        if a <= 0:
            return
        pw = res.pxw; s = self.px * pw
        for i in range(self.n):
            u = eoc(ramp(t, self.t_in + i * 0.09, 0.55))
            if u <= 0:
                continue
            tx = self.x + (i - (self.n - 1) / 2) * s * self.gap
            ty = self.y
            fx = tx - math.cos(math.radians(self.ang)) * s * 9 * (1 - u)
            fy = ty - math.sin(math.radians(self.ang)) * s * 9 * (1 - u)
            c.save(); c.translate(fx, fy); c.rotate(0 if u > 0.98 else 60 * (1 - u)); c.scale(s, s)
            c.save(); c.translate(0.04, 0.08); c.drawPath(PLANE, G.paint((0, 0, 0), 0.45 * a * u, blur=0.05)); c.restore()
            c.drawPath(PLANE, G.paint(WHITE, a * u))
            c.restore()


class Stamp(G.ScreenItem):
    """A red rubber stamp that slams onto the screen (own design), rotated, slightly worn."""
    z = 40

    def __init__(self, runs, t_in, t_out, x=1080, y=1500, px=170, rot=-8, rgb=RED):
        super().__init__(t_in, t_out)
        self.runs, self.x, self.y, self.px, self.rot, self.rgb = tuple(runs), x, y, px, rot, rgb

    def draw(self, c, t, U):
        u = ramp(t, self.t_in, 0.22); a = clamp(u * 4) * self.fade(t)
        if a <= 0:
            return
        s = 1 + 0.9 * (1 - eoc(u))
        img, W, H, base = G.text_image(self.runs, int(min(260, self.px * U * 1.2)), False, None)
        k = self.px * U / min(260, self.px * U * 1.2)
        w = (W - 2 * int(min(260, self.px * U * 1.2) * 0.5)) * k; h = self.px * U * 1.35
        c.save(); c.translate(self.x * U, self.y * U); c.rotate(self.rot); c.scale(s, s)
        rr = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-w / 2 - 50 * U, -h / 2, w + 100 * U, h), 26 * U, 26 * U)
        c.drawRRect(rr, G.paint(self.rgb, 0.95 * a, stroke=16 * U))
        c.drawRRect(rr.makeOffset(0, 0) if False else rr, G.paint(self.rgb, 0.10 * a))
        p = skia.Paint(AntiAlias=True); p.setAlphaf(a)
        tint = skia.ColorFilters.Blend(G.color(self.rgb), skia.BlendMode.kSrcIn); p.setColorFilter(tint)
        c.drawImageRect(img, skia.Rect.MakeXYWH(-W * k / 2, -base * k + h * 0.36, W * k, H * k), G.SAMP, p)
        c.restore()


class IncomeBars(G.ScreenItem):
    """Per-person income, 1975 (estimates): Nauru vs USA, two bars growing (Nauru ≈ $50,000; USA ≈ $7,800)."""
    z = 26

    def __init__(self, t_in, t_out, x=1080, base_y=2500, h=1300):
        super().__init__(t_in, t_out)
        self.x, self.by, self.h = x, base_y, h

    def draw(self, c, t, U):
        a = clamp(ramp(t, self.t_in, 0.3)) * self.fade(t)
        if a <= 0:
            return
        bars = (("NAURU", 50000, YEL, -300, 0.25), ("USA", 7800, WHITE, 300, 0.55))
        panel = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH((self.x - 720) * U, (self.by - self.h - 330) * U, 1440 * U, (self.h + 560) * U), 40 * U, 40 * U)
        c.drawRRect(panel, G.paint((6, 12, 24), 0.72 * a))
        G.draw_text_img(c, (("कमाई प्रति व्यक्ति, 1975 (अनुमान)", WHITE, "baloob"),), 64 * U, self.x * U, (self.by - self.h - 200) * U, a)
        for name, v, rgb, dx, d in bars:
            u = eoc(ramp(t, self.t_in + d, 1.1))
            bh = self.h * v / 50000 * u
            r = skia.Rect.MakeXYWH((self.x + dx - 170) * U, (self.by - bh) * U, 340 * U, bh * U)
            c.drawRect(r, G.paint(rgb, 0.95 * a))
            G.draw_text_img(c, ((name, WHITE, "montb"),), 80 * U, (self.x + dx) * U, (self.by + 120) * U, a)
            G.draw_text_img(c, ((f"${v * u:,.0f}", rgb, "montb"),), 74 * U, (self.x + dx) * U, (self.by - bh - 40) * U, a * clamp(u * 3))


class Pictos(E.Item):
    """White people pictograms popping up in a grid around a point (design px)."""
    z = 28

    def __init__(self, xy, n, t_in, t_out=None, px=70, cols=6):
        super().__init__(t_in, t_out)
        self.x, self.y, self.n, self.px, self.cols = xy[0], xy[1], n, px, cols

    def bounds(self, res):
        r = self.px * 8 * res.pxw
        return skia.Rect.MakeLTRB(self.x - r, self.y - r, self.x + r, self.y + r)

    def draw(self, c, res, t):
        a = self.fade(t)
        if a <= 0:
            return
        s = self.px * res.pxw
        rows = math.ceil(self.n / self.cols)
        for i in range(self.n):
            u = eob(ramp(t, self.t_in + i * 0.05, 0.3))
            if u <= 0:
                continue
            r, col = divmod(i, self.cols)
            x = self.x + (col - (self.cols - 1) / 2) * s * 0.9; y = self.y + (r - (rows - 1) / 2) * s * 1.6
            c.save(); c.translate(x, y); c.scale(u, u)
            c.drawCircle(0, -s * 0.45, s * 0.2, G.paint(WHITE, a))
            body = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-s * 0.26, -s * 0.2, s * 0.52, s * 0.75), s * 0.18, s * 0.18)
            c.drawRRect(body, G.paint(WHITE, a))
            c.restore()
