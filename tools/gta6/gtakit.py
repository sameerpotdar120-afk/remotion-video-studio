"""GTA 6 Short: the "Leonida" kit on top of the cinematic-film engine.

World items (the camera flies over them): WorldMap, SeaBoard, SunsetFill, CityGlow, Waypoint, MapLabel, GPSRoute,
CaseStack, DotCloud. Screen items (drawn in frame pixels, 2160x3840 design space): Poster, NullPanel, YearCard,
Chip. Every bit of text goes through PIL + raqm, so Devanagari is shaped correctly. Nothing here copies Rockstar's
art: the cases are blank, the map is ours, the images are the creator's original AI illustrations.
"""
import functools
import json
import math
import pathlib
import sys

import numpy as np
import skia
from PIL import Image, ImageDraw, ImageFilter, ImageFont

REPO = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(REPO / ".claude/skills/cinematic-film/scripts"))
import engine as E  # noqa: E402

FILM = REPO / "public/gta6/film"
PREP = FILM / "assets/prep"
FONT_FILES = {
    "anton": REPO / "public/sixday/fonts/Anton.ttf",
    "baloo": REPO / "public/sixday/fonts/Baloo2.ttf",
    "mont": REPO / "public/brand/Montserrat.ttf",
    "baloob": REPO / "public/sixday/fonts/Baloo2.ttf",
    "montb": REPO / "public/brand/Montserrat.ttf",
}

SEA = (8, 22, 38)
LAND = (30, 36, 54)
MAG = (255, 46, 136)
ORG = (255, 138, 61)
VIO = (123, 77, 255)
CYAN = (63, 224, 255)
YEL = (255, 210, 63)
WHITE = (250, 248, 252)
INK = (14, 10, 24)

LEONIDA = dict(board=None, bg=SEA, grade=(1.03, 0.97, 1.06), grain=0.0, glow=0.42, vignette=0.85, curve=0.32, dim=(10, 4, 22))

clamp, ramp, eio, eoc, eob = E.clamp, E.ramp, E.ease_in_out, E.ease_out_cubic, E.ease_out_back


def lerp(a, b, u):
    return a + (b - a) * u


def color(rgb, a=1.0):
    return skia.Color(int(rgb[0]), int(rgb[1]), int(rgb[2]), int(255 * clamp(a)))


def paint(rgb, a=1.0, stroke=None, blur=None):
    p = skia.Paint(AntiAlias=True, Color=color(rgb, a))
    if stroke:
        p.setStyle(skia.Paint.kStroke_Style); p.setStrokeWidth(stroke)
        p.setStrokeCap(skia.Paint.kRound_Cap); p.setStrokeJoin(skia.Paint.kRound_Join)
    if blur:
        p.setMaskFilter(skia.MaskFilter.MakeBlur(skia.kNormal_BlurStyle, blur))
    return p


SAMP = skia.SamplingOptions(skia.FilterMode.kLinear, skia.MipmapMode.kLinear)


def to_skia(im):
    arr = np.ascontiguousarray(np.asarray(im.convert("RGBA")))
    return skia.Image.fromarray(arr, colorType=skia.ColorType.kRGBA_8888_ColorType).withDefaultMipmaps()


# ------------------------------------------------------------------ text (PIL + raqm, cached)
@functools.lru_cache(maxsize=64)
def pil_font(name, size):
    f = ImageFont.truetype(str(FONT_FILES[name]), size, layout_engine=ImageFont.Layout.RAQM)
    if name == "baloob":
        f.set_variation_by_name("ExtraBold")
    elif name == "baloo":
        f.set_variation_by_name("Bold")
    elif name == "montb":
        f.set_variation_by_name("ExtraBold")
    return f


@functools.lru_cache(maxsize=512)
def text_image(runs, size, shadow=True, glow=None, track=0):
    """runs: ((text, rgb, font), ...) laid out on one line. Returns (skia image, w, h, baseline_y)."""
    pads = int(size * 0.5)
    widths, asc = [], 0
    for text, _, font in runs:
        f = pil_font(font, size)
        l, t, r, b = f.getbbox(text)
        widths.append(f.getlength(text) + track * len(text))
    gap = size * 0.22
    W = int(sum(widths) + gap * (len(runs) - 1) + 2 * pads)
    H = int(size * 1.9 + 2 * pads)
    base = pads + int(size * 1.15)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    x = pads
    for (text, rgb, font), w in zip(runs, widths):
        d.text((x, base), text, font=pil_font(font, size), fill=tuple(rgb) + (255,), anchor="ls")
        x += w + gap
    out = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    alpha = layer.split()[3]
    if glow:
        g = Image.new("RGBA", (W, H), tuple(glow) + (0,)); g.putalpha(alpha.filter(ImageFilter.GaussianBlur(size * 0.18)))
        out = Image.alpha_composite(out, g); out = Image.alpha_composite(out, g)
    if shadow:
        s = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sa = alpha.filter(ImageFilter.GaussianBlur(size * 0.06))
        s.putalpha(sa.point(lambda v: int(v * 0.85)))
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sh.paste(s, (int(size * 0.04), int(size * 0.07)))
        out = Image.alpha_composite(out, sh)
    out = Image.alpha_composite(out, layer)
    return to_skia(out), W, H, base


def draw_text_img(c, runs, size, x, y, a=1.0, anchor="center", scale=1.0, shadow=True, glow=None):
    """Draw text with its baseline at y. size is in the units of the current canvas."""
    q = 4 if size * scale < 60 else 1
    px = int(min(260, max(24, size * scale * q)))
    img, W, H, base = text_image(tuple(runs), px, shadow, tuple(glow) if glow else None)
    k = size * scale / px
    w, h = W * k, H * k
    x0 = x - w / 2 if anchor == "center" else x if anchor == "left" else x - w
    p = skia.Paint(AntiAlias=True); p.setAlphaf(clamp(a))
    c.drawImageRect(img, skia.Rect.MakeXYWH(x0, y - base * k, w, h), SAMP, p)
    return w - 2 * int(px * 0.5) * k


# ------------------------------------------------------------------ geometry
class Geo:
    def __init__(self, path=PREP / "geo.json"):
        d = json.loads(pathlib.Path(path).read_text())
        self.K = d["K"]; self.places = {k: tuple(v) for k, v in d["places"].items()}
        self.paths = {}
        for group in ("countries", "states", "in_states"):
            for name, lods in d[group].items():
                ps = []
                for rings in lods:
                    p = skia.Path(); p.setFillType(skia.PathFillType.kEvenOdd)
                    for r in rings:
                        p.moveTo(*r[0])
                        for pt in r[1:]:
                            p.lineTo(*pt)
                        p.close()
                    ps.append(p)
                self.paths[(group, name)] = ps
        self.bounds = {k: v[0].getBounds() for k, v in self.paths.items()}

    def lod(self, ss):
        for i, tol in ((2, 2500), (1, 250)):
            if tol * ss <= 1.1:
                return i
        return 0

    def path(self, key, ss):
        return self.paths[key][self.lod(ss)]

    def centre(self, key):
        b = self.bounds[key]; return b.centerX(), b.centerY()


class SeaBoard(E.Item):
    """The sea: deep teal-navy with a slow drifting shimmer, drawn in screen space (same grain at every zoom)."""
    z = -100

    def __init__(self, film):
        super().__init__(-1)
        self.film = film

    def draw(self, c, res, t):
        m = c.getTotalMatrix(); c.save(); c.resetMatrix()
        W, H = res.frame_w, res.frame_h
        g = skia.GradientShader.MakeLinear([skia.Point(0, 0), skia.Point(0, H)],
                                           [color((10, 34, 56)), color((6, 18, 34)), color((14, 10, 40))], [0, 0.6, 1])
        p = skia.Paint(); p.setShader(g); c.drawRect(skia.Rect.MakeWH(W, H), p)
        cx, cy, z, _ = self.film.camera(t)
        tex = res.image("sea_tex.png", 1024)
        tile = 1500 * W / 2160
        ox = (-cx * z * 0.0006 * W + t * 14) % tile; oy = (-cy * z * 0.0006 * W + t * 6) % tile
        tp = skia.Paint(AntiAlias=True); tp.setAlphaf(0.2); tp.setBlendMode(skia.BlendMode.kScreen)
        y = -tile + oy
        while y < H:
            x = -tile + ox
            while x < W:
                c.drawImageRect(tex, skia.Rect.MakeXYWH(x, y, tile + 1, tile + 1), SAMP, tp); x += tile
            y += tile
        c.restore(); c.setMatrix(m)


class WorldMap(E.Item):
    """Dark land, cyan coast glow, thin state lines; India's official boundary in bright white."""
    z = -50

    def __init__(self, geo):
        super().__init__(-1)
        self.g = geo

    def draw(self, c, res, t):
        ss = res.screen_scale; view = res.view
        lod = self.g.lod(ss)
        land, coast = skia.Path(), skia.Path()
        for (grp, name), ps in self.g.paths.items():
            if grp != "countries" or not skia.Rect.Intersects(self.g.bounds[(grp, name)], view):
                continue
            land.addPath(ps[lod])
        pw = res.pxw
        c.drawPath(land, paint(CYAN, 0.16, stroke=26 * pw, blur=18 * pw))
        c.drawPath(land, paint(LAND))
        rp = skia.Paint(AntiAlias=True); rp.setAlphaf(0.18); rp.setBlendMode(skia.BlendMode.kOverlay)
        c.save(); c.clipPath(land, skia.ClipOp.kIntersect, True)
        E.tile_image(c, res.image("relief.png", 1024), view, 1400 * pw, rp, clip=False)
        c.restore()
        c.drawPath(land, paint((120, 200, 230), 0.55, stroke=2.2 * pw))
        st = skia.Path()
        for (grp, name), ps in self.g.paths.items():
            if grp == "states" and skia.Rect.Intersects(self.g.bounds[(grp, name)], view):
                st.addPath(ps[lod])
        c.drawPath(st, paint((110, 130, 170), 0.45, stroke=1.4 * pw))
        ind = ("countries", "India")
        if skia.Rect.Intersects(self.g.bounds[ind], view):
            c.drawPath(self.g.paths[ind][lod], paint(WHITE, 0.85, stroke=2.6 * pw))


class SunsetFill(E.Item):
    """A region filled with the Vice City sunset (magenta -> orange), flat on the map, white outline, wiping in
    from its centre; can turn violet (visited) later."""
    z = 2

    def __init__(self, geo, keys, t_in, t_out=None, alpha=0.9, t_violet=None, wipe=0.7):
        super().__init__(t_in, t_out)
        self.g, self.keys, self.alpha, self.tv, self.wipe = geo, keys, alpha, t_violet, wipe
        b = None
        for k in keys:
            r = geo.bounds[k]
            b = r if b is None else skia.Rect.MakeLTRB(min(b.left(), r.left()), min(b.top(), r.top()), max(b.right(), r.right()), max(b.bottom(), r.bottom()))
        self.box = b

    def bounds(self, res):
        return self.box.makeOutset(4000, 4000)

    def draw(self, c, res, t):
        u = eoc(ramp(t, self.t_in, self.wipe)); a = self.fade(t) * clamp((t - self.t_in) / 0.12 + 0.01)
        if a <= 0:
            return
        ss = res.screen_scale
        p = skia.Path()
        for k in self.keys:
            p.addPath(self.g.path(k, ss))
        b = self.box
        v = eio(ramp(t, self.tv, 0.8)) if self.tv is not None else 0
        c0 = tuple(lerp(MAG[i], VIO[i], v) for i in range(3)); c1 = tuple(lerp(ORG[i], VIO[i], v) for i in range(3))
        r = math.hypot(b.width(), b.height()) * 0.55 * u + 1
        c.save()
        clip = skia.Path(); clip.addCircle(b.centerX(), b.centerY(), r)
        c.clipPath(clip, skia.ClipOp.kIntersect, True)
        pw = res.pxw
        c.drawPath(p, paint(MAG if v < 0.5 else VIO, 0.55 * a, stroke=30 * pw, blur=26 * pw))
        sh = skia.GradientShader.MakeLinear([skia.Point(b.centerX(), b.top()), skia.Point(b.centerX(), b.bottom())],
                                            [color(c0, 1), color(tuple(lerp(c0[i], c1[i], 0.5) for i in range(3)), 1), color(c1, 1)], [0, 0.45, 1])
        fp = skia.Paint(AntiAlias=True); fp.setShader(sh); fp.setAlphaf(self.alpha * a * (1 - 0.35 * v))
        c.drawPath(p, fp)
        c.drawPath(p, paint(WHITE, 0.95 * a, stroke=3.2 * pw))
        c.restore()


class CityGlow(E.Item):
    """A pulsing neon blob on a city (the fictional city sitting on the real one)."""
    z = 4

    def __init__(self, xy, t_in, t_out=None, r_px=150, rgb=MAG):
        super().__init__(t_in, t_out)
        self.x, self.y = xy; self.r, self.rgb = r_px, rgb

    def bounds(self, res):
        r = self.r * res.pxw * 2
        return skia.Rect.MakeLTRB(self.x - r, self.y - r, self.x + r, self.y + r)

    def draw(self, c, res, t):
        a = eio(ramp(t, self.t_in, 0.4)) * self.fade(t)
        if a <= 0:
            return
        ss = res.screen_scale; pul = 1 + 0.12 * math.sin(t * 5.2)
        r = self.r * res.pxw * pul * eob(ramp(t, self.t_in, 0.5))
        g = skia.GradientShader.MakeRadial(skia.Point(self.x, self.y), max(r, 1),
                                           [color(WHITE, 0.95 * a), color(self.rgb, 0.85 * a), color(self.rgb, 0)], [0, 0.25, 1])
        p = skia.Paint(AntiAlias=True); p.setShader(g); p.setBlendMode(skia.BlendMode.kScreen)
        c.drawCircle(self.x, self.y, r, p)


class Waypoint(E.Item):
    """White diamond with a magenta pulse ring (map blip)."""
    z = 30

    def __init__(self, xy, t_in, t_out=None, px=34, rgb=MAG):
        super().__init__(t_in, t_out)
        self.x, self.y = xy; self.px, self.rgb = px * 1.5, rgb

    def bounds(self, res):
        r = 300 * res.pxw
        return skia.Rect.MakeLTRB(self.x - r, self.y - r, self.x + r, self.y + r)

    def draw(self, c, res, t):
        u = ramp(t, self.t_in, 0.35); a = u * self.fade(t)
        if a <= 0:
            return
        k = self.px * res.pxw * eob(u)
        ph = ((t - self.t_in) * 0.9) % 1
        c.drawCircle(self.x, self.y, k * (1.2 + 2.6 * ph), paint(self.rgb, a * (1 - ph) * 0.9, stroke=k * 0.22))
        d = skia.Path(); d.moveTo(self.x, self.y - k); d.lineTo(self.x + k, self.y); d.lineTo(self.x, self.y + k); d.lineTo(self.x - k, self.y); d.close()
        c.drawPath(d, paint((0, 0, 0), 0.5 * a, blur=k * 0.3))
        c.drawPath(d, paint(WHITE, a)); c.drawCircle(self.x, self.y, k * 0.36, paint(self.rgb, a))


class MapLabel(E.Item):
    """Text pinned to a map point, constant size on screen. runs = ((text, rgb, font), ...)."""
    z = 34

    def __init__(self, xy, runs, t_in, t_out=None, px=92, dx=0, dy=-70, anchor="center", glow=None):
        super().__init__(t_in, t_out)
        self.x, self.y = xy; self.runs, self.px, self.dx, self.dy, self.anchor, self.glow = tuple(runs), px * 1.6, dx * 1.6, dy * 1.6, anchor, glow

    def bounds(self, res):
        r = 2600 * res.pxw
        return skia.Rect.MakeLTRB(self.x - r, self.y - r, self.x + r, self.y + r)

    def draw(self, c, res, t):
        u = ramp(t, self.t_in, 0.3); a = u * self.fade(t)
        if a <= 0:
            return
        ss = res.screen_scale
        pw = res.pxw
        draw_text_img(c, self.runs, self.px * pw, self.x + self.dx * pw, self.y + self.dy * pw - (1 - eoc(u)) * 30 * pw,
                      a, self.anchor, scale=1.0, glow=self.glow)


class GPSRoute(E.Item):
    """The GPS line: magenta, glowing, with moving dashes and a bright head; draws on over dur."""
    z = 28

    def __init__(self, a, b, t_in, dur=1.2, bend=0.2, t_out=None, px=11, rgb=MAG):
        super().__init__(t_in, t_out)
        (x0, y0), (x1, y1) = a, b
        d = math.hypot(x1 - x0, y1 - y0); nx, ny = -(y1 - y0) / max(d, 1), (x1 - x0) / max(d, 1)
        self.p = skia.Path(); self.p.moveTo(x0, y0)
        self.p.quadTo((x0 + x1) / 2 + nx * d * bend, (y0 + y1) / 2 + ny * d * bend, x1, y1)
        self.dur, self.px, self.rgb = dur, px * 1.4, rgb
        self.box = self.p.getBounds()

    def bounds(self, res):
        return self.box.makeOutset(3000, 3000)

    def cues(self):
        return [("whoosh", self.t_in, 0.45, {})]

    def draw(self, c, res, t):
        u = eio(ramp(t, self.t_in, self.dur)); a = self.fade(t)
        if u <= 0 or a <= 0:
            return
        w = self.px * res.pxw
        seg = E.partial_path(self.p, u)
        c.drawPath(seg, paint(self.rgb, 0.45 * a, stroke=w * 3.2, blur=w * 2.2))
        c.drawPath(seg, paint(self.rgb, 0.95 * a, stroke=w))
        dp = paint(WHITE, 0.85 * a, stroke=w * 0.38)
        dp.setPathEffect(skia.DashPathEffect.Make([w * 2.2, w * 3.4], -t * w * 14))
        c.drawPath(seg, dp)
        pm = skia.PathMeasure(self.p, False); pos = pm.getPosTan(pm.getLength() * u)
        if pos:
            x, y = pos[0].x(), pos[0].y()
            c.drawCircle(x, y, w * 3.2, paint(self.rgb, 0.6 * a, blur=w * 2))
            c.drawCircle(x, y, w * 1.5, paint(WHITE, a))


class CaseStack(E.Item):
    """Blank game cases (no art, no logos: a coloured spine band and the year) piling up in rows on the map,
    with a rolling counter above them. n grows with the counter."""
    z = 26

    def __init__(self, xy, t_in, t_out, v0, v1, n_max, year, label="M", cols=8, case_w=520, roll=1.6, band=MAG, num_dy=-1.15):
        super().__init__(t_in, t_out)
        self.x, self.y = xy; self.v0, self.v1, self.n, self.year, self.label = v0, v1, n_max, year, label
        self.cols, self.cw, self.roll, self.band, self.num_dy = cols, case_w, roll, band, num_dy

    def bounds(self, res):
        w = self.cw * (self.cols + 2); return skia.Rect.MakeLTRB(self.x - w, self.y - w, self.x + w, self.y + w)

    def cues(self):
        return [("tick", self.t_in + i * self.roll / 6, 0.25, {}) for i in range(6)] + [("hit", self.t_in + self.roll, 0.6, {})]

    def value(self, t):
        return lerp(self.v0, self.v1, eoc(ramp(t, self.t_in, self.roll)))

    def draw(self, c, res, t):
        a = self.fade(t) * ramp(t, self.t_in, 0.2)
        if a <= 0:
            return
        frac = (self.value(t) - self.v0) / max(1e-9, self.v1 - self.v0) if self.v1 != self.v0 else 1
        n = max(1, int(round(self.n * max(frac, 0.06))))
        cw, ch = self.cw, self.cw * 1.32
        rows = math.ceil(self.n / self.cols)
        for i in range(n):
            r, col = divmod(i, self.cols)
            # back rows higher and smaller: a stack seen from the front, slightly in perspective
            depth = r / max(1, rows - 1)
            k = 1 - 0.35 * depth
            x = self.x + (col - (self.cols - 1) / 2) * cw * 0.62 * k + (r % 2) * cw * 0.18
            y = self.y - r * ch * 0.22
            born = self.t_in + self.roll * i / max(1, self.n)
            pu = eob(ramp(t, born, 0.25))
            c.save(); c.translate(x, y - (1 - pu) * ch * 0.5); c.scale(k * pu, k * pu); c.rotate(-3 + 6 * ((i * 37) % 11) / 10)
            rr = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(-cw / 2, -ch / 2, cw, ch), cw * 0.05, cw * 0.05)
            c.drawRRect(rr.makeOffset(cw * 0.04, cw * 0.07) if hasattr(rr, "makeOffset") else rr, paint((0, 0, 0), 0.5 * a, blur=cw * 0.05))
            g = skia.GradientShader.MakeLinear([skia.Point(0, -ch / 2), skia.Point(0, ch / 2)],
                                               [color((120, 40, 110)), color((70, 24, 80)), color((150, 70, 60))], [0, 0.5, 1])
            pp = skia.Paint(AntiAlias=True); pp.setShader(g); pp.setAlphaf(a); c.drawRRect(rr, pp)
            c.drawRect(skia.Rect.MakeXYWH(-cw / 2, -ch / 2, cw, ch * 0.16), paint(self.band, a))
            c.drawRRect(rr, paint(WHITE, 0.5 * a, stroke=cw * 0.02))
            c.restore()
        v = self.value(t)
        txt = (f"{v:.1f}" if self.v1 < 100 else f"{v:.0f}") + " " + self.label
        draw_text_img(c, ((txt, YEL, "anton"),), cw * 1.05, self.x, self.y + self.num_dy * ch * 1.5 - rows * ch * 0.22,
                      a, glow=ORG)
        c.save()
        draw_text_img(c, ((f"COPIES · {self.year}", WHITE, "anton"),), cw * 0.36, self.x, self.y + ch * 0.95, a * 0.9)
        c.restore()


class DotCloud(E.Item):
    """Many small glowing dots popping up around a point (people at the studio)."""
    z = 22

    def __init__(self, xy, n, radius, t0, t1, t_out=None, rgb=CYAN, px=7, seed=3):
        super().__init__(t0, t_out)
        rng = np.random.default_rng(seed)
        ang = rng.random(n) * 2 * math.pi; rad = np.sqrt(rng.random(n)) * radius
        self.pts = np.c_[xy[0] + np.cos(ang) * rad, xy[1] + np.sin(ang) * rad * 0.8]
        self.born = t0 + (t1 - t0) * np.sort(rng.random(n))
        self.rgb, self.px, self.R, self.c = rgb, px, radius, xy

    def bounds(self, res):
        return skia.Rect.MakeLTRB(self.c[0] - self.R * 1.3, self.c[1] - self.R * 1.3, self.c[0] + self.R * 1.3, self.c[1] + self.R * 1.3)

    def draw(self, c, res, t):
        a = self.fade(t)
        if a <= 0:
            return
        r = self.px * res.pxw
        on = self.born <= t
        pts = [skia.Point(float(x), float(y)) for x, y in self.pts[on]]
        if not pts:
            return
        p = paint(self.rgb, 0.9 * a, stroke=r * 2); c.drawPoints(skia.Canvas.kPoints_PointMode, pts, p)
        p2 = paint(self.rgb, 0.35 * a, stroke=r * 5, blur=r * 2); c.drawPoints(skia.Canvas.kPoints_PointMode, pts, p2)


# ------------------------------------------------------------------ screen items (2160 x 3840 design px)
class ScreenItem:
    z = 0

    def __init__(self, t_in, t_out=None):
        self.t_in, self.t_out = t_in, t_out

    def visible(self, t):
        return t >= self.t_in - 0.01 and (self.t_out is None or t < self.t_out + 0.5)

    def fade(self, t):
        return 1.0 if self.t_out is None else 1 - eio(ramp(t, self.t_out, 0.45))


@functools.lru_cache(maxsize=24)
def load_img(name):
    return to_skia(Image.open(PREP / "photos" / name))


class Poster(ScreenItem):
    """One of the creator's illustrations as a loading-screen panel: rounded, white rim, slides in, slow push."""
    z = 10

    def __init__(self, name, t_in, t_out, box, frm="right", cutout=False, crop=None, tag=True, rot=0.0, push=0.07):
        super().__init__(t_in, t_out)
        self.name, self.box, self.frm, self.cut, self.crop, self.tag, self.rot, self.push = name, box, frm, cutout, crop, tag, rot, push

    def draw(self, c, t, U):
        u = eoc(ramp(t, self.t_in, 0.55)); a = self.fade(t) * clamp(ramp(t, self.t_in, 0.2))
        if a <= 0:
            return
        x, y, w, h = (v * U for v in self.box)
        off = (1 - u) * 1400 * U
        dx = {"right": off, "left": -off, "up": 0, "down": 0}[self.frm]; dy = {"up": -off, "down": off}.get(self.frm, 0)
        out = (1 - self.fade(t)) * 300 * U
        img = load_img(self.name)
        iw, ih = img.width(), img.height()
        cx0, cy0, cw0, ch0 = self.crop or (0, 0, 1, 1)
        src_w, src_h = iw * cw0, ih * ch0
        fit = min if self.cut else max
        k = fit(w / src_w, h / src_h) * (1 + self.push * ramp(t, self.t_in, (self.t_out or self.t_in + 6) - self.t_in + 0.5))
        sw, sh = w / k, h / k
        sx = iw * cx0 + (src_w - sw) / 2; sy = ih * cy0 + (src_h - sh) / 2
        c.save(); c.translate(x + w / 2 + dx, y + h / 2 + dy - out); c.rotate(self.rot * (1 - 0.3 * u))
        r = skia.Rect.MakeXYWH(-w / 2, -h / 2, w, h)
        if self.cut:
            sw, sh, sx, sy = src_w, src_h, iw * cx0, ih * cy0
            dw, dh = src_w * k, src_h * k
            r = skia.Rect.MakeXYWH(-dw / 2, h / 2 - dh, dw, dh)
        p = skia.Paint(AntiAlias=True); p.setAlphaf(a)
        if self.cut:
            c.drawImageRect(img, skia.Rect.MakeXYWH(sx, sy, sw, sh), r, SAMP, paint((0, 0, 0), 0.0))
            glow = skia.Paint(AntiAlias=True); glow.setAlphaf(a * 0.8)
            glow.setImageFilter(skia.ImageFilters.DropShadowOnly(0, 0, 26 * U, 26 * U, color(MAG, 0.9)))
            c.drawImageRect(img, skia.Rect.MakeXYWH(sx, sy, sw, sh), r, SAMP, glow)
            c.drawImageRect(img, skia.Rect.MakeXYWH(sx, sy, sw, sh), r, SAMP, p)
        else:
            rr = skia.RRect.MakeRectXY(r, 34 * U, 34 * U)
            c.drawRRect(rr.makeOffset(14 * U, 26 * U) if hasattr(rr, "makeOffset") else rr, paint((0, 0, 0), 0.6 * a, blur=40 * U))
            c.save(); c.clipRRect(rr, skia.ClipOp.kIntersect, True)
            c.drawImageRect(img, skia.Rect.MakeXYWH(sx, sy, sw, sh), r, SAMP, p)
            c.restore()
            c.drawRRect(rr, paint(WHITE, 0.95 * a, stroke=7 * U))
        if self.tag:
            draw_text_img(c, (("AI ILLUSTRATION", WHITE, "mont"),), 26 * U, -w / 2 + 30 * U, h / 2 - 30 * U, 0.75 * a, "left")
        c.restore()


class NullPanel(ScreenItem):
    """Null, split screen in the lower half: frames from the Omni clip, a magenta seam on top."""
    z = 20

    def __init__(self, frames_dir, t_in, t_out, src_t0, top=1920):
        super().__init__(t_in, t_out)
        self.dir, self.src_t0, self.top = pathlib.Path(frames_dir), src_t0, top
        self.files = sorted(self.dir.glob("*.jpg"))

    def draw(self, c, t, U):
        u = eoc(ramp(t, self.t_in, 0.4)); a = self.fade(t)
        if a <= 0:
            return
        n = int((t - self.t_in + self.src_t0) * 30)
        f = self.files[max(0, min(len(self.files) - 1, n))]
        img = _null_img(str(f))
        W, H = 2160 * U, (3840 - self.top) * U
        y0 = self.top * U + (1 - u) * H + (1 - a) * H
        r = skia.Rect.MakeXYWH(0, y0, W, H)
        # source 1080x1920: take the centre 1080 x 960 band (head, mic, hands)
        iw, ih = img.width(), img.height()
        sh = iw * H / W
        src = skia.Rect.MakeXYWH(0, ih * 0.30 - sh * 0.1, iw, sh)
        c.drawRect(r, paint((0, 0, 0), 1))
        c.drawImageRect(img, src, r, SAMP, skia.Paint(AntiAlias=True))
        c.drawRect(skia.Rect.MakeXYWH(0, y0 - 8 * U, W, 12 * U), paint(MAG, 1))
        c.drawRect(skia.Rect.MakeXYWH(0, y0 - 30 * U, W, 40 * U), paint(MAG, 0.4, blur=24 * U))


@functools.lru_cache(maxsize=8)
def _null_img(path):
    return to_skia(Image.open(path))


class YearCard(ScreenItem):
    """The year slams in big, then drifts and fades (the reference's beat)."""
    z = 30

    def __init__(self, text, t_in, t_out, y=900, size=420, rgb=WHITE, glow=MAG):
        super().__init__(t_in, t_out)
        self.text, self.y, self.size, self.rgb, self.glow = text, y, size, rgb, glow

    def draw(self, c, t, U):
        u = ramp(t, self.t_in, 0.28); a = clamp(u * 3) * self.fade(t)
        if a <= 0:
            return
        s = 1 + 0.6 * (1 - eoc(u)) + 0.04 * ramp(t, self.t_in, 3)
        c.save(); c.translate(1080 * U, self.y * U); c.scale(s, s)
        draw_text_img(c, ((self.text, self.rgb, "anton"),), self.size * U, 0, 0, a, glow=self.glow)
        c.restore()


class Chip(ScreenItem):
    """A small label block (reports / sources / names): dark glass, magenta edge."""
    z = 32

    def __init__(self, runs, t_in, t_out, x, y, px=58, anchor="center"):
        super().__init__(t_in, t_out)
        self.runs, self.x, self.y, self.px, self.anchor = tuple(runs), x, y, px * 1.3, anchor

    def draw(self, c, t, U):
        u = eoc(ramp(t, self.t_in, 0.35)); a = u * self.fade(t)
        if a <= 0:
            return
        img, W, H, base = text_image(self.runs, int(self.px * 2), True, None)
        k = self.px * U / (self.px * 2)
        w = (W - 2 * int(self.px)) * k; h = self.px * 1.6 * U
        x0 = self.x * U - (w / 2 if self.anchor == "center" else 0)
        y0 = self.y * U + (1 - u) * 40 * U
        rr = skia.RRect.MakeRectXY(skia.Rect.MakeXYWH(x0 - 30 * U, y0 - h * 0.72, w + 60 * U, h), 18 * U, 18 * U)
        c.drawRRect(rr, paint((12, 8, 28), 0.82 * a))
        c.drawRRect(rr, paint(MAG, 0.9 * a, stroke=4 * U))
        draw_text_img(c, self.runs, self.px * U, x0, y0, a, "left", shadow=False)
