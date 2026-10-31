"""Sikkim landslide test shot, built entirely in Blender from code (no outside images or footage).

    blender -b -P tools/blender/sikkim_landslide.py -- <out_dir> [--still F] [--bake] [--frames A B] [--res 0.5]

A steep road-cut slope above the Teesta: a forested hillside with a fresh scar, a road on a bench with a concrete
retaining wall, the river below. About 300 boulders fall with Bullet rigid bodies and a Mantaflow smoke sim carries
the dust. Rendered with Cycles at 1080x1920, 30 fps, 150 frames.
"""
import math
import sys
from pathlib import Path

import bmesh
import bpy
import numpy as np
from mathutils import Vector

argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = Path(argv[0] if argv else "/tmp/sk_ls")
OUT.mkdir(parents=True, exist_ok=True)


def arg(name, n=1, default=None):
    if name not in argv:
        return default
    i = argv.index(name)
    v = argv[i + 1:i + 1 + n]
    return v if n > 1 else (v[0] if n else True)


FPS, FRAMES = 30, 150
PRE = int(arg("--pre", 1, 40))  # simulated frames before the shot starts, so it opens mid-collapse
SEED = 7
rng = np.random.default_rng(SEED)


# ---------------------------------------------------------------- noise
def _lattice(seed, n=512):
    r = np.random.default_rng(seed)
    return r.uniform(-1, 1, (n, n)).astype(np.float64)


_LAT = {}


def vnoise(x, y, seed=0):
    """Smooth value noise in [-1, 1] (deterministic)."""
    if seed not in _LAT:
        _LAT[seed] = _lattice(seed + 1000)
    g = _LAT[seed]
    n = g.shape[0]
    xi, yi = np.floor(x).astype(np.int64), np.floor(y).astype(np.int64)
    fx, fy = x - xi, y - yi
    ux, uy = fx * fx * (3 - 2 * fx), fy * fy * (3 - 2 * fy)
    a = g[xi % n, yi % n]
    b = g[(xi + 1) % n, yi % n]
    c = g[xi % n, (yi + 1) % n]
    d = g[(xi + 1) % n, (yi + 1) % n]
    return (a * (1 - ux) + b * ux) * (1 - uy) + (c * (1 - ux) + d * ux) * uy


def fbm(x, y, oct=5, seed=0):
    s, a, f, norm = 0.0, 1.0, 1.0, 0.0
    for o in range(oct):
        s = s + a * vnoise(x * f, y * f, seed + o * 17)
        norm += a
        a *= 0.5
        f *= 2.03
    return s / norm


def sstep(a, b, x):
    t = np.clip((x - a) / (b - a), 0, 1)
    return t * t * (3 - 2 * t)


# ---------------------------------------------------------------- terrain
# x runs along the river, y across it. The far bank (y > 0) is the hero slope.
ROAD_Z, ROAD_D0, ROAD_D1 = 30.0, 34.0, 46.0
SCAR_D0, SCAR_D1 = 47.0, 190.0


RIVER_HW = 34.0


def river_y(x):
    return 14 * np.sin(x / 300.0) + 7 * np.sin(x / 110.0 + 1.3)


def scar_half(d):
    t = np.clip((d - SCAR_D0) / (SCAR_D1 - SCAR_D0), 0, 1)
    return 20 + 24 * np.sin(np.pi * np.clip(t * 0.85 + 0.12, 0, 1)) ** 0.8


def scar_cx(d):
    return -6 + 0.10 * (d - SCAR_D0) + 4 * np.sin(d / 23.0)


def height(x, y):
    yr = river_y(x)
    d = y - yr - RIVER_HW          # distance up the far bank
    dn = (yr - RIVER_HW) - y       # distance up the near bank
    # far bank: a rock bank up to the road bench, the bench, then a steep forested slope that eases off,
    # and a higher ridge behind it
    bank = ROAD_Z * sstep(0, ROAD_D0, d) ** 1.15
    up = np.maximum(d - ROAD_D1, 0)
    slope = 215 * (1 - np.exp(-up / 80.0)) + 0.05 * up - 60 * sstep(450, 1100, d)
    far = np.where(d < ROAD_D1, bank, ROAD_Z + slope)
    big = fbm(x / 260.0, y / 260.0, 4, 1) * 34 + fbm(x / 70.0, y / 70.0, 4, 2) * 9 + fbm(x / 18.0, y / 18.0, 3, 3) * 2.2
    gul = (1 - np.abs(fbm(x / 55.0, y / 300.0, 3, 4))) * 10  # gullies running down the fall line
    rough = np.where(d < ROAD_D1, sstep(ROAD_D1, ROAD_D1 + 25, d), 1.0) * sstep(ROAD_D0 + 2, ROAD_D1 + 18, d)
    far = far + (big + gul - 5) * np.maximum(rough, 0) * sstep(0, 1, np.maximum(d - ROAD_D1, 0) / 30.0)
    far = far + fbm(x / 400.0, y / 400.0, 3, 13) * 40 * sstep(500, 900, d)
    far = far + np.where(d < ROAD_D0, fbm(x / 7.0, y / 7.0, 3, 5) * 1.8 * sstep(2, 10, d), 0)
    # the scar: a carved channel from just above the road up to a head scarp, with rills down the fall line
    cx, hw = scar_cx(d), scar_half(d)
    u = (x - cx) / hw
    edge = 1 + 0.22 * fbm(x / 8.0, y / 8.0, 3, 6)
    inside = np.clip(1 - (np.abs(u) / edge) ** 2, 0, 1)
    along = sstep(SCAR_D0 - 2, SCAR_D0 + 10, d) * (1 - sstep(SCAR_D1 - 6, SCAR_D1 + 2, d))
    head = sstep(SCAR_D1 - 9, SCAR_D1 - 3, d) * (1 - sstep(SCAR_D1 - 3, SCAR_D1 + 1, d))
    rills = np.abs(fbm(x / 2.2, y / 16.0, 3, 14)) * 1.1 + fbm(x / 1.1, y / 1.1, 2, 15) * 0.25
    carve = inside * along * (5.5 + 9 * head) + inside * along * (fbm(x / 6.0, y / 6.0, 3, 8) * 1.4 + rills)
    far = far - carve
    near = 210 * (1 - np.exp(-np.maximum(dn, 0) / 230.0)) + fbm(x / 120.0, y / 120.0, 4, 9) * 16 * sstep(0, 40, dn)
    near = near + fbm(x / 20.0, y / 20.0, 3, 10) * 2.0 * sstep(0, 20, dn) + 300 * sstep(500, 1200, dn)
    z = np.where(d > 0, far, np.where(dn > 0, near, -3.0))
    # the river bed, with boulders in it
    bed = -3.5 + 2.6 * sstep(-RIVER_HW, 0, np.maximum(d, dn)) + np.maximum(fbm(x / 5.0, y / 5.0, 3, 11), 0) * 3.0
    z = np.where((d <= 0) & (dn <= 0), bed, z)
    scar = inside * along
    return z, d, dn, scar


def axis(a, b, fa, fb, fine, coarse):
    """Grid lines: `fine` spacing inside [fa, fb], `coarse` outside."""
    left = np.arange(a, fa, coarse)
    mid = np.arange(fa, fb, fine)
    right = np.arange(fb, b + coarse, coarse)
    return np.concatenate([left, mid, right])


def build_terrain():
    gx = axis(-1800.0, 1800.0, -160.0, 200.0, 0.8, 6.0)
    gy = axis(-900.0, 2600.0, -60.0, 260.0, 0.8, 6.0)
    nx, ny = len(gx), len(gy)
    xs, ys = np.meshgrid(gx, gy)
    z, d, dn, scar = height(xs, ys)
    verts = np.stack([xs.ravel(), ys.ravel(), z.ravel()], 1)
    me = bpy.data.meshes.new("terrain")
    me.vertices.add(len(verts))
    me.vertices.foreach_set("co", verts.astype(np.float32).ravel())
    i = np.arange(nx * ny).reshape(ny, nx)
    quads = np.stack([i[:-1, :-1], i[:-1, 1:], i[1:, 1:], i[1:, :-1]], -1).reshape(-1, 4)
    me.loops.add(quads.size)
    me.loops.foreach_set("vertex_index", quads.ravel().astype(np.int32))
    me.polygons.add(len(quads))
    me.polygons.foreach_set("loop_start", (np.arange(len(quads)) * 4).astype(np.int32))
    me.polygons.foreach_set("loop_total", np.full(len(quads), 4, np.int32))
    me.update()
    me.validate()
    print("terrain verts", len(verts), flush=True)
    # attributes for the shader and the scatter: scar, road, river, forest
    a = me.attributes.new("scar", "FLOAT", "POINT")
    a.data.foreach_set("value", scar.ravel().astype(np.float32))
    road = ((d > ROAD_D0 + 1) & (d < ROAD_D1 - 1)).astype(np.float32)
    a = me.attributes.new("road", "FLOAT", "POINT")
    a.data.foreach_set("value", road.ravel())
    a = me.attributes.new("riverbank", "FLOAT", "POINT")
    a.data.foreach_set("value", (1 - sstep(1, 8, np.maximum(d, dn))).ravel().astype(np.float32))
    # forest density: everywhere on the slopes except the scar, the road and the rock bank below it
    dens = (1 - sstep(0.03, 0.3, scar)) * (1 - road) * np.maximum(sstep(ROAD_D1 + 0.5, ROAD_D1 + 4, d), 0.7 * sstep(3, 9, d) * (1 - sstep(ROAD_D0 - 6, ROAD_D0 - 1, d)))
    dens = np.where(dn > 6, sstep(6, 14, dn), dens)
    dens = dens * np.clip(0.75 + 0.9 * fbm(xs / 30.0, ys / 30.0, 3, 12), 0.35, 1)
    # trees only where the camera can see them (beyond ~1.1 km a tree is a few pixels; the ground shader carries it)
    fx0, fx1, fy0, fy1 = FOREST_BOX
    dens = dens * sstep(fx0 - 50, fx0 + 50, xs) * (1 - sstep(fx1 - 50, fx1 + 50, xs)) * sstep(fy0 - 20, fy0 + 20, ys) * (1 - sstep(fy1 - 75, fy1 + 75, ys))
    if CLEAR_BAND:  # a cleared strip (a rail cut and its lip) where no trees grow
        d0, d1, x0 = CLEAR_BAND
        dens = dens * (1 - ((d > d0) & (d < d1) & (xs > x0)).astype(np.float32))
    a = me.attributes.new("forest", "FLOAT", "POINT")
    a.data.foreach_set("value", np.clip(dens, 0, 1).ravel().astype(np.float32))
    ob = bpy.data.objects.new("Terrain", me)
    bpy.context.scene.collection.objects.link(ob)
    me.polygons.foreach_set("use_smooth", np.ones(len(me.polygons), bool))
    return ob


# ---------------------------------------------------------------- materials
def node_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    nt.nodes.clear()
    return m, nt


def link(nt, a, b):
    nt.links.new(a, b)


PHX = Path(arg("--tex", 1, "/opt/phx"))  # CC0 Poly Haven textures (tools/blender/fetch_textures.sh)


class Tex:
    """Box-projected image texture set (colour, normal, roughness) on a shared coordinate."""

    def __init__(self, nt, name, vec, blend=0.3):
        self.nt = nt
        self.maps = {}
        for k, cs in (("diff", "sRGB"), ("nor", "Non-Color"), ("rough", "Non-Color")):
            n = nt.nodes.new("ShaderNodeTexImage")
            img = bpy.data.images.get(f"{name}_{k}") or bpy.data.images.load(str(PHX / f"{name}_{k}.jpg"))
            img.name = f"{name}_{k}"
            img.colorspace_settings.name = cs
            n.image = img
            n.projection = "BOX"
            n.projection_blend = blend
            nt.links.new(vec, n.inputs["Vector"])
            self.maps[k] = n.outputs["Color"]

    def __getitem__(self, k):
        return self.maps[k]


def mat_terrain():
    m, nt = node_mat("terrain")
    N = nt.nodes.new
    out = N("ShaderNodeOutputMaterial")
    bs = N("ShaderNodeBsdfPrincipled")
    geo = N("ShaderNodeNewGeometry")
    tc = N("ShaderNodeTexCoord")
    att = {k: N("ShaderNodeAttribute") for k in ("scar", "road", "riverbank")}
    for k, n in att.items():
        n.attribute_name = k
    sep = N("ShaderNodeSeparateXYZ")
    link(nt, geo.outputs["Normal"], sep.inputs[0])
    slope = N("ShaderNodeMath")
    slope.operation = "SUBTRACT"
    slope.inputs[0].default_value = 1.0
    link(nt, sep.outputs[2], slope.inputs[1])

    def scaled(k):
        mp = N("ShaderNodeVectorMath")
        mp.operation = "SCALE"
        mp.inputs["Scale"].default_value = k
        link(nt, tc.outputs["Object"], mp.inputs[0])
        return mp.outputs[0]

    def noise(scale, detail=6.0, vec=None):
        n = N("ShaderNodeTexNoise")
        n.inputs["Scale"].default_value = scale
        n.inputs["Detail"].default_value = detail
        link(nt, vec or tc.outputs["Object"], n.inputs["Vector"])
        return n.outputs["Fac"]

    def ramp(fac, stops):
        r = N("ShaderNodeValToRGB")
        link(nt, fac, r.inputs[0])
        el = r.color_ramp.elements
        while len(el) < len(stops):
            el.new(0.5)
        for e, (p, c) in zip(el, stops):
            e.position = p
            e.color = (*c, 1)
        return r.outputs[0]

    def mix(fac, a, b, blend="MIX"):
        mx = N("ShaderNodeMix")
        mx.data_type = "RGBA"
        mx.blend_type = blend
        if isinstance(fac, float):
            mx.inputs["Factor"].default_value = fac
        else:
            link(nt, fac, mx.inputs["Factor"])
        for sock, v in ((6, a), (7, b)):
            if isinstance(v, tuple):
                mx.inputs[sock].default_value = (*v, 1)
            else:
                link(nt, v, mx.inputs[sock])
        return mx.outputs[2]

    mud = Tex(nt, "brown_mud_rocks_01", scaled(1 / 3.2))
    lat = Tex(nt, "red_laterite_soil_stones", scaled(1 / 4.5))
    rk = Tex(nt, "rock_face_03", scaled(1 / 9.0))
    fl = Tex(nt, "rocky_terrain_02", scaled(1 / 5.0))
    big = noise(0.015, 4)
    patch = ramp(noise(0.06, 5), [(0.42, (0, 0, 0)), (0.62, (1, 1, 1))])
    # the scar: grey-brown rubble with patches of red earth, wet streaks running down the fall line
    soil = mix(patch, mud["diff"], lat["diff"])
    streak_v = N("ShaderNodeMapping")
    link(nt, tc.outputs["Object"], streak_v.inputs["Vector"])
    streak_v.inputs["Scale"].default_value = (0.35, 0.035, 0.035)
    wet = ramp(noise(1.0, 4, streak_v.outputs[0]), [(0.5, (0, 0, 0)), (0.7, (1, 1, 1))])
    soil = mix(wet, soil, mix(1.0, soil, (0.55, 0.5, 0.48), "MULTIPLY"))
    rock = mix(1.0, rk["diff"], (0.62, 0.6, 0.58), "MULTIPLY")
    ground = mix(1.0, fl["diff"], (0.2, 0.26, 0.12), "MULTIPLY")
    asphalt = ramp(noise(3.0, 10), [(0.4, (0.035, 0.035, 0.038)), (0.6, (0.075, 0.075, 0.075))])
    rockfac = ramp(slope.outputs[0], [(0.72, (0, 0, 0)), (0.85, (1, 1, 1))])
    sc = ramp(att["scar"].outputs["Fac"], [(0.02, (0, 0, 0)), (0.25, (1, 1, 1))])
    c = mix(rockfac, ground, rock)
    c = mix(sc, c, mix(rockfac, soil, rock))
    c = mix(att["riverbank"].outputs["Fac"], c, mix(patch, rock, mud["diff"]))
    c = mix(att["road"].outputs["Fac"], c, asphalt)
    # break the tiling up at a distance
    c = mix(1.0, c, ramp(big, [(0.3, (0.8, 0.8, 0.8)), (0.7, (1.15, 1.12, 1.08))]), "MULTIPLY")
    link(nt, c, bs.inputs["Base Color"])
    rough = mix(sc, fl["rough"], mix(wet, mud["rough"], (0.35, 0.35, 0.35)))
    rough = mix(rockfac, rough, rk["rough"])
    link(nt, rough, bs.inputs["Roughness"])
    nrm = mix(sc, fl["nor"], mix(patch, mud["nor"], lat["nor"]))
    nrm = mix(rockfac, nrm, rk["nor"])
    nm = N("ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = 1.4
    link(nt, nrm, nm.inputs["Color"])
    link(nt, nm.outputs[0], bs.inputs["Normal"])
    link(nt, bs.outputs[0], out.inputs[0])
    return m


def mat_leaf():
    m, nt = node_mat("leaf")
    N = nt.nodes.new
    out, bs = N("ShaderNodeOutputMaterial"), N("ShaderNodeBsdfPrincipled")
    oi = N("ShaderNodeObjectInfo")
    tc = N("ShaderNodeTexCoord")
    nz = N("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 1.4
    nz.inputs["Detail"].default_value = 6
    link(nt, tc.outputs["Object"], nz.inputs["Vector"])
    r = N("ShaderNodeValToRGB")
    link(nt, oi.outputs["Random"], r.inputs[0])
    el = r.color_ramp.elements
    el.new(0.5)
    el.new(0.8)
    cols = [(0.0, (0.014, 0.035, 0.010)), (0.45, (0.030, 0.068, 0.016)), (0.8, (0.065, 0.10, 0.022)), (1.0, (0.13, 0.13, 0.035))]
    for e, (p, c) in zip(el, cols):
        e.position, e.color = p, (*c, 1)
    mx = N("ShaderNodeMix")
    mx.data_type = "RGBA"
    mx.blend_type = "MULTIPLY"
    mx.inputs["Factor"].default_value = 0.55
    link(nt, r.outputs[0], mx.inputs[6])
    sh = N("ShaderNodeValToRGB")
    link(nt, nz.outputs["Fac"], sh.inputs[0])
    sh.color_ramp.elements[0].position = 0.3
    sh.color_ramp.elements[0].color = (0.45, 0.45, 0.45, 1)
    sh.color_ramp.elements[1].position = 0.7
    link(nt, sh.outputs[0], mx.inputs[7])
    sp = N("ShaderNodeTexVoronoi")
    sp.inputs["Scale"].default_value = 9.0
    link(nt, tc.outputs["Object"], sp.inputs["Vector"])
    spr = N("ShaderNodeValToRGB")
    link(nt, sp.outputs["Distance"], spr.inputs[0])
    spr.color_ramp.elements[0].position = 0.0
    spr.color_ramp.elements[0].color = (1.25, 1.3, 1.1, 1)
    spr.color_ramp.elements[1].position = 0.7
    spr.color_ramp.elements[1].color = (0.45, 0.45, 0.4, 1)
    mx2 = N("ShaderNodeMix")
    mx2.data_type = "RGBA"
    mx2.blend_type = "MULTIPLY"
    mx2.inputs["Factor"].default_value = 1.0
    link(nt, mx.outputs[2], mx2.inputs[6])
    link(nt, spr.outputs[0], mx2.inputs[7])
    link(nt, mx2.outputs[2], bs.inputs["Base Color"])
    bs.inputs["Roughness"].default_value = 0.62
    bs.inputs["Subsurface Weight"].default_value = 0.0
    bs.inputs["Sheen Weight"].default_value = 0.35
    bs.inputs["Sheen Tint"].default_value = (0.6, 0.8, 0.4, 1)
    bump = N("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 1.0
    bump.inputs["Distance"].default_value = 0.25
    nz2 = N("ShaderNodeTexVoronoi")
    nz2.inputs["Scale"].default_value = 9.0
    link(nt, tc.outputs["Object"], nz2.inputs["Vector"])
    link(nt, nz2.outputs["Distance"], bump.inputs["Height"])
    link(nt, bump.outputs[0], bs.inputs["Normal"])
    link(nt, bs.outputs[0], out.inputs[0])
    return m


def mat_rock():
    m, nt = node_mat("rock")
    N = nt.nodes.new
    out, bs = N("ShaderNodeOutputMaterial"), N("ShaderNodeBsdfPrincipled")
    tc, oi = N("ShaderNodeTexCoord"), N("ShaderNodeObjectInfo")
    vec = N("ShaderNodeVectorMath")
    vec.operation = "ADD"
    link(nt, tc.outputs["Object"], vec.inputs[0])
    link(nt, oi.outputs["Random"], vec.inputs[1])  # each rock samples a different part of the texture
    rk = Tex(nt, "rock_face_03", vec.outputs[0], 0.4)
    mud = Tex(nt, "brown_mud_rocks_01", vec.outputs[0], 0.4)
    # soil caked on one side and in the cracks, a per-rock tint
    nz = N("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 2.5
    nz.inputs["Detail"].default_value = 8
    link(nt, tc.outputs["Object"], nz.inputs["Vector"])
    r = N("ShaderNodeValToRGB")
    link(nt, nz.outputs["Fac"], r.inputs[0])
    r.color_ramp.elements[0].position = 0.5
    r.color_ramp.elements[1].position = 0.68
    mx = N("ShaderNodeMix")
    mx.data_type = "RGBA"
    link(nt, r.outputs[0], mx.inputs["Factor"])
    link(nt, rk["diff"], mx.inputs[6])
    link(nt, mud["diff"], mx.inputs[7])
    tint = N("ShaderNodeMix")
    tint.data_type = "RGBA"
    tint.blend_type = "MULTIPLY"
    link(nt, oi.outputs["Random"], tint.inputs["Factor"])
    link(nt, mx.outputs[2], tint.inputs[6])
    tint.inputs[7].default_value = (0.7, 0.68, 0.66, 1)
    dk = N("ShaderNodeMix")
    dk.data_type = "RGBA"
    dk.blend_type = "MULTIPLY"
    dk.inputs["Factor"].default_value = 1.0
    link(nt, tint.outputs[2], dk.inputs[6])
    dk.inputs[7].default_value = (0.62, 0.62, 0.64, 1)
    link(nt, dk.outputs[2], bs.inputs["Base Color"])
    link(nt, rk["rough"], bs.inputs["Roughness"])
    nm = N("ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = 1.5
    link(nt, rk["nor"], nm.inputs["Color"])
    link(nt, nm.outputs[0], bs.inputs["Normal"])
    link(nt, bs.outputs[0], out.inputs[0])
    return m


def mat_simple(name, col, rough, metal=0.0, noise_scale=0.0):
    m, nt = node_mat(name)
    N = nt.nodes.new
    out, bs = N("ShaderNodeOutputMaterial"), N("ShaderNodeBsdfPrincipled")
    bs.inputs["Base Color"].default_value = (*col, 1)
    bs.inputs["Roughness"].default_value = rough
    bs.inputs["Metallic"].default_value = metal
    if noise_scale:
        tc = N("ShaderNodeTexCoord")
        nz = N("ShaderNodeTexNoise")
        nz.inputs["Scale"].default_value = noise_scale
        nz.inputs["Detail"].default_value = 10
        link(nt, tc.outputs["Object"], nz.inputs["Vector"])
        r = N("ShaderNodeValToRGB")
        link(nt, nz.outputs["Fac"], r.inputs[0])
        r.color_ramp.elements[0].color = (col[0] * 0.6, col[1] * 0.6, col[2] * 0.6, 1)
        r.color_ramp.elements[1].color = (min(1, col[0] * 1.3), min(1, col[1] * 1.3), min(1, col[2] * 1.3), 1)
        link(nt, r.outputs[0], bs.inputs["Base Color"])
        bump = N("ShaderNodeBump")
        bump.inputs["Strength"].default_value = 0.3
        link(nt, nz.outputs["Fac"], bump.inputs["Height"])
        link(nt, bump.outputs[0], bs.inputs["Normal"])
    link(nt, bs.outputs[0], out.inputs[0])
    return m


def mat_water():
    m, nt = node_mat("water")
    N = nt.nodes.new
    out, bs = N("ShaderNodeOutputMaterial"), N("ShaderNodeBsdfPrincipled")
    bs.inputs["Base Color"].default_value = (0.055, 0.06, 0.045, 1)  # monsoon Teesta: silty grey-green
    bs.inputs["Roughness"].default_value = 0.08
    tc = N("ShaderNodeTexCoord")
    mp = N("ShaderNodeMapping")
    link(nt, tc.outputs["Object"], mp.inputs["Vector"])
    mp.inputs["Scale"].default_value = (1, 3.5, 1)
    nz = N("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 0.35
    nz.inputs["Detail"].default_value = 10
    link(nt, mp.outputs[0], nz.inputs["Vector"])
    # the river flows along x: drive the noise's W by frame for moving ripples
    nz.noise_dimensions = "4D"
    drv = nz.inputs["W"].driver_add("default_value").driver
    drv.expression = "frame/45"
    bump = N("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.25
    link(nt, nz.outputs["Fac"], bump.inputs["Height"])
    link(nt, bump.outputs[0], bs.inputs["Normal"])
    link(nt, bs.outputs[0], out.inputs[0])
    return m


# ---------------------------------------------------------------- trees (subtropical broadleaf canopy)
def make_tree(i, leaf, bark):
    """A broadleaf crown: a trunk and 10-18 lumpy leaf clumps, so the canopy reads as cauliflower, not a ball."""
    from mathutils import Matrix
    r = np.random.default_rng(100 + i)
    bm = bmesh.new()
    h = r.uniform(8, 16)
    bmesh.ops.create_cone(bm, cap_ends=True, segments=6, radius1=0.4, radius2=0.2, depth=h * 0.75,
                          matrix=Matrix.Translation((0, 0, h * 0.37)))
    for f in bm.faces:
        f.material_index = 1
    crown = r.uniform(2.6, 4.6)
    n = int(r.integers(18, 30))
    for k in range(n):
        rad = r.uniform(0.8, 1.9) * crown / 3.6
        ang = r.uniform(0, 2 * math.pi)
        off = r.uniform(0, 1) ** 0.6 * crown
        zc = h * 0.72 + (1 - off / crown) * crown * 0.7 + r.uniform(-1, 1)
        m = Matrix.Translation((math.cos(ang) * off, math.sin(ang) * off, zc)) @ Matrix.Diagonal((1, 1, r.uniform(0.65, 0.9), 1))
        res = bmesh.ops.create_icosphere(bm, subdivisions=2, radius=rad, matrix=m)
        bm.normal_update()
        for v in res["verts"]:
            p = v.co
            k2 = (math.sin(p.x * 2.3 + i) * math.cos(p.y * 2.1) + math.sin(p.z * 2.7 + i * 2)) * 0.22 * rad
            k2 += (math.sin(p.x * 6.3 + p.z * 5.1 + i) * math.cos(p.y * 5.7)) * 0.12 * rad
            v.co = p + v.normal * k2
    me = bpy.data.meshes.new(f"tree{i}")
    bm.to_mesh(me)
    bm.free()
    me.polygons.foreach_set("use_smooth", np.array([p.material_index == 0 for p in me.polygons]))
    me.materials.append(leaf)
    me.materials.append(bark)
    return bpy.data.objects.new(f"Tree{i}", me)


def build_forest(terrain, leaf, bark):
    col = bpy.data.collections.new("Trees")
    bpy.context.scene.collection.children.link(col)
    tree_src = arg("--trees", 1, "proc")
    if tree_src == "proc":
        for i in range(12):
            col.objects.link(make_tree(i, leaf, bark))
    else:
        # a CC0 Poly Haven broadleaf (island_tree_02, LOD1), scaled up to a canopy tree, in a few rotations and tints
        with bpy.data.libraries.load(tree_src) as (src, dst):
            dst.objects = ["island_tree_02_LOD1"]
        base = dst.objects[0]
        for i in range(12):
            ob = base.copy()
            ob.name = f"Tree{i}"
            k = (2.6 + 0.12 * i) * TREE_SCALE
            ob.scale = (k, k, k * (0.9 + 0.03 * (i % 5)))
            ob.location = (0, 0, 0)
            col.objects.link(ob)
        for m in bpy.data.materials:
            if not m.name.startswith("island_tree_02_leaves") or not m.node_tree:
                continue
            nt = m.node_tree
            bsdf = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
            if bsdf is None:
                for g in (n for n in nt.nodes if n.type == "GROUP"):
                    bsdf = next((n for n in g.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
                    if bsdf:
                        nt = g.node_tree
                        break
            if bsdf and bsdf.inputs["Base Color"].links:
                src = bsdf.inputs["Base Color"].links[0].from_socket
                hs = nt.nodes.new("ShaderNodeHueSaturation")
                hs.inputs["Hue"].default_value = 0.53
                hs.inputs["Saturation"].default_value = 1.15
                hs.inputs["Value"].default_value = 0.72
                nt.links.new(src, hs.inputs["Color"])
                nt.links.new(hs.outputs[0], bsdf.inputs["Base Color"])
                print("leaf tint on", m.name, flush=True)
    col.hide_render = False
    lc = bpy.context.view_layer.layer_collection.children[col.name]
    lc.exclude = True
    # geometry nodes scatter on the terrain
    mod = terrain.modifiers.new("Forest", "NODES")
    ng = bpy.data.node_groups.new("forest", "GeometryNodeTree")
    ng.interface.new_socket("Geometry", in_out="INPUT", socket_type="NodeSocketGeometry")
    ng.interface.new_socket("Geometry", in_out="OUTPUT", socket_type="NodeSocketGeometry")
    # a sphere that clears trees (keyed per shot: the x-ray reveal)
    ng.interface.new_socket("Clear Centre", in_out="INPUT", socket_type="NodeSocketVector")
    ng.interface.new_socket("Clear Radius", in_out="INPUT", socket_type="NodeSocketFloat")
    N = ng.nodes.new
    gi, go = N("NodeGroupInput"), N("NodeGroupOutput")
    dist = N("GeometryNodeDistributePointsOnFaces")
    dist.distribute_method = "POISSON"
    dist.inputs["Distance Min"].default_value = 3.6 if arg("--trees", 1, "proc") == "proc" else TREE_GAP
    dist.inputs["Density Max"].default_value = 0.09
    dist.inputs["Seed"].default_value = 3
    na = N("GeometryNodeInputNamedAttribute")
    na.data_type = "FLOAT"
    na.inputs["Name"].default_value = "forest"
    ng.links.new(na.outputs["Attribute"], dist.inputs["Density Factor"])
    ng.links.new(gi.outputs[0], dist.inputs["Mesh"])
    ci = N("GeometryNodeCollectionInfo")
    ci.inputs["Collection"].default_value = col
    ci.inputs["Separate Children"].default_value = True
    ci.inputs["Reset Children"].default_value = False
    ci.transform_space = "ORIGINAL"
    inst = N("GeometryNodeInstanceOnPoints")
    inst.inputs["Pick Instance"].default_value = True
    ng.links.new(dist.outputs["Points"], inst.inputs["Points"])
    ng.links.new(ci.outputs[0], inst.inputs["Instance"])
    rv = N("FunctionNodeRandomValue")
    rv.data_type = "INT"
    rv.inputs["Min"].default_value = 0
    rv.inputs["Max"].default_value = 11
    ng.links.new(rv.outputs[2], inst.inputs["Instance Index"])
    rr = N("FunctionNodeRandomValue")
    rr.data_type = "FLOAT_VECTOR"
    rr.inputs[0].default_value = (0, 0, 0)
    rr.inputs[1].default_value = (0.08, 0.08, 6.283)
    rr.inputs["Seed"].default_value = 5
    ng.links.new(rr.outputs[0], inst.inputs["Rotation"])
    rs = N("FunctionNodeRandomValue")
    rs.data_type = "FLOAT"
    rs.inputs[2].default_value = 0.6
    rs.inputs[3].default_value = 1.4
    rs.inputs["Seed"].default_value = 9
    ng.links.new(rs.outputs[1], inst.inputs["Scale"])
    # sink each tree a little so the trunks never float on steep ground
    tr = N("GeometryNodeTranslateInstances")
    tr.inputs["Translation"].default_value = (0, 0, -1.2)
    ng.links.new(inst.outputs[0], tr.inputs["Instances"])
    j = N("GeometryNodeJoinGeometry")
    pos = N("GeometryNodeInputPosition")
    dd = N("ShaderNodeVectorMath")
    dd.operation = "DISTANCE"
    ng.links.new(pos.outputs[0], dd.inputs[0])
    ng.links.new(gi.outputs["Clear Centre"], dd.inputs[1])
    lt = N("FunctionNodeCompare")
    lt.data_type = "FLOAT"
    lt.operation = "LESS_THAN"
    ng.links.new(dd.outputs["Value"], lt.inputs[0])
    ng.links.new(gi.outputs["Clear Radius"], lt.inputs[1])
    dl = N("GeometryNodeDeleteGeometry")
    dl.domain = "INSTANCE"
    ng.links.new(tr.outputs[0], dl.inputs["Geometry"])
    ng.links.new(lt.outputs[0], dl.inputs["Selection"])
    ng.links.new(dl.outputs[0], j.inputs[0])
    # undergrowth: the same crowns shrunk to bushes, filling the gaps between trunks
    ud = N("GeometryNodeDistributePointsOnFaces")
    ud.distribute_method = "RANDOM"
    ud.inputs["Seed"].default_value = 21
    um = N("ShaderNodeMath")
    um.operation = "MULTIPLY"
    um.inputs[1].default_value = UNDERGROWTH
    ng.links.new(na.outputs["Attribute"], um.inputs[0])
    ng.links.new(um.outputs[0], ud.inputs["Density"])
    ng.links.new(gi.outputs[0], ud.inputs["Mesh"])
    ui = N("GeometryNodeInstanceOnPoints")
    ui.inputs["Pick Instance"].default_value = True
    ng.links.new(ud.outputs["Points"], ui.inputs["Points"])
    ng.links.new(ci.outputs[0], ui.inputs["Instance"])
    ng.links.new(rv.outputs[2], ui.inputs["Instance Index"])
    ng.links.new(rr.outputs[0], ui.inputs["Rotation"])
    us = N("FunctionNodeRandomValue")
    us.data_type = "FLOAT"
    us.inputs[2].default_value = 0.16
    us.inputs[3].default_value = 0.34
    us.inputs["Seed"].default_value = 23
    ng.links.new(us.outputs[1], ui.inputs["Scale"])
    ut = N("GeometryNodeTranslateInstances")
    ut.inputs["Translation"].default_value = (0, 0, -1.6)
    ng.links.new(ui.outputs[0], ut.inputs["Instances"])
    ng.links.new(ut.outputs[0], j.inputs[0])
    ng.links.new(gi.outputs[0], j.inputs[0])
    ng.links.new(j.outputs[0], go.inputs[0])
    mod.node_group = ng
    return col


# ---------------------------------------------------------------- the road, the wall, the river
def build_structures(terrain_mat):
    concrete = mat_simple("concrete", (0.2, 0.195, 0.18), 0.9, noise_scale=0.6)
    xs = np.linspace(-1800, 1800, 1801)
    # retaining wall on the uphill side of the road, following the bench
    bm = bmesh.new()
    prev = None
    for x in xs:
        yr = river_y(x)
        y = yr + RIVER_HW + ROAD_D1 - 0.5
        z0 = ROAD_Z - 0.2
        a = bm.verts.new((x, y, z0))
        b = bm.verts.new((x, y, z0 + 4.2))
        c = bm.verts.new((x, y + 0.6, z0 + 4.2))
        if prev:
            bm.faces.new((prev[0], a, b, prev[1]))
            bm.faces.new((prev[1], b, c, prev[2]))
        prev = (a, b, c)
    me = bpy.data.meshes.new("wall")
    bm.to_mesh(me)
    bm.free()
    w = bpy.data.objects.new("Wall", me)
    w.data.materials.append(concrete)
    bpy.context.scene.collection.objects.link(w)
    # crash barrier posts and a white edge line are too small to read at this distance; a kerb is enough
    bm = bmesh.new()
    prev = None
    for x in xs:
        y = river_y(x) + RIVER_HW + ROAD_D0 + 0.8
        a = bm.verts.new((x, y, ROAD_Z - 0.3))
        b = bm.verts.new((x, y, ROAD_Z + 0.9))
        if prev:
            bm.faces.new((prev[0], a, b, prev[1]))
        prev = (a, b)
    me = bpy.data.meshes.new("kerb")
    bm.to_mesh(me)
    bm.free()
    k = bpy.data.objects.new("Kerb", me)
    k.data.materials.append(concrete)
    bpy.context.scene.collection.objects.link(k)
    # river surface
    bpy.ops.mesh.primitive_plane_add(size=1)
    rv = bpy.context.active_object
    rv.name = "River"
    rv.scale = (1100, 900, 1)
    rv.location = (0, 0, -1.2)
    rv.data.materials.append(mat_water())


# ---------------------------------------------------------------- rocks: shapes, the scree on the scar, the rockfall
def rock_mesh(i, name="rock"):
    """An angular boulder: the convex hull of points on a squashed ellipsoid, then chipped with noise."""
    r = np.random.default_rng(500 + i)
    bm = bmesh.new()
    ax = r.uniform(0.6, 1.0, 3)
    ax = ax / ax.max()
    pts = r.normal(size=(int(r.integers(18, 34)), 3))
    pts = pts / np.linalg.norm(pts, axis=1)[:, None] * ax * 0.5
    for p in pts:
        bm.verts.new(p)
    bmesh.ops.convex_hull(bm, input=bm.verts)
    bmesh.ops.subdivide_edges(bm, edges=bm.edges, cuts=2, use_grid_fill=True)
    bm.normal_update()
    for v in bm.verts:
        p = v.co
        k = math.sin(p.x * 13 + i) * math.cos(p.y * 11 + i * 0.7) * math.sin(p.z * 12) * 0.022
        v.co = p + v.normal * k
    me = bpy.data.meshes.new(f"{name}{i}")
    bm.to_mesh(me)
    bm.free()
    return me


def build_scree(terrain, rmat):
    """Static stones and boulders lying in the scar and on the bank below the road."""
    col = bpy.data.collections.new("Scree")
    bpy.context.scene.collection.children.link(col)
    for i in range(10):
        me = rock_mesh(i, "scree")
        me.materials.append(rmat)
        col.objects.link(bpy.data.objects.new(f"Scree{i}", me))
    bpy.context.view_layer.layer_collection.children[col.name].exclude = True
    mod = terrain.modifiers.new("Scree", "NODES")
    ng = bpy.data.node_groups.new("scree", "GeometryNodeTree")
    ng.interface.new_socket("Geometry", in_out="INPUT", socket_type="NodeSocketGeometry")
    ng.interface.new_socket("Geometry", in_out="OUTPUT", socket_type="NodeSocketGeometry")
    N = ng.nodes.new
    gi, go = N("NodeGroupInput"), N("NodeGroupOutput")
    j = N("GeometryNodeJoinGeometry")
    for k, (attr, dens, smin, smax, seed) in enumerate((("scar", 0.9, 0.25, 0.9, 1), ("scar", 0.035, 0.9, 2.6, 2), ("riverbank", 0.25, 0.4, 2.2, 3))):
        dist = N("GeometryNodeDistributePointsOnFaces")
        dist.distribute_method = "RANDOM"
        dist.inputs["Seed"].default_value = seed
        na = N("GeometryNodeInputNamedAttribute")
        na.data_type = "FLOAT"
        na.inputs["Name"].default_value = attr
        mm = N("ShaderNodeMath")
        mm.operation = "MULTIPLY"
        mm.inputs[1].default_value = dens
        ng.links.new(na.outputs["Attribute"], mm.inputs[0])
        ng.links.new(mm.outputs[0], dist.inputs["Density"])
        ng.links.new(gi.outputs[0], dist.inputs["Mesh"])
        ci = N("GeometryNodeCollectionInfo")
        ci.inputs["Collection"].default_value = col
        ci.inputs["Separate Children"].default_value = True
        ci.inputs["Reset Children"].default_value = True
        inst = N("GeometryNodeInstanceOnPoints")
        inst.inputs["Pick Instance"].default_value = True
        ng.links.new(dist.outputs["Points"], inst.inputs["Points"])
        ng.links.new(ci.outputs[0], inst.inputs["Instance"])
        rv = N("FunctionNodeRandomValue")
        rv.data_type = "INT"
        rv.inputs["Min"].default_value = 0
        rv.inputs["Max"].default_value = 9
        rv.inputs["Seed"].default_value = seed
        ng.links.new(rv.outputs[2], inst.inputs["Instance Index"])
        rr = N("FunctionNodeRandomValue")
        rr.data_type = "FLOAT_VECTOR"
        rr.inputs[1].default_value = (6.283, 6.283, 6.283)
        rr.inputs["Seed"].default_value = seed + 10
        ng.links.new(rr.outputs[0], inst.inputs["Rotation"])
        rs = N("FunctionNodeRandomValue")
        rs.data_type = "FLOAT"
        rs.inputs[2].default_value = smin
        rs.inputs[3].default_value = smax
        rs.inputs["Seed"].default_value = seed + 20
        ng.links.new(rs.outputs[1], inst.inputs["Scale"])
        tr = N("GeometryNodeTranslateInstances")
        tr.inputs["Translation"].default_value = (0, 0, -0.12 * smax)
        ng.links.new(inst.outputs[0], tr.inputs["Instances"])
        ng.links.new(tr.outputs[0], j.inputs[0])
    ng.links.new(gi.outputs[0], j.inputs[0])
    ng.links.new(j.outputs[0], go.inputs[0])
    mod.node_group = ng


def grid_mesh(name, gx, gy, zf):
    xs, ys = np.meshgrid(gx, gy)
    z = zf(xs, ys)
    nx, ny = len(gx), len(gy)
    me = bpy.data.meshes.new(name)
    v = np.stack([xs.ravel(), ys.ravel(), z.ravel()], 1)
    me.vertices.add(len(v))
    me.vertices.foreach_set("co", v.astype(np.float32).ravel())
    i = np.arange(nx * ny).reshape(ny, nx)
    q = np.stack([i[:-1, :-1], i[:-1, 1:], i[1:, 1:], i[1:, :-1]], -1).reshape(-1, 4)
    me.loops.add(q.size)
    me.loops.foreach_set("vertex_index", q.ravel().astype(np.int32))
    me.polygons.add(len(q))
    me.polygons.foreach_set("loop_start", (np.arange(len(q)) * 4).astype(np.int32))
    me.polygons.foreach_set("loop_total", np.full(len(q), 4, np.int32))
    me.update()
    return me


TREE_GAP, TREE_SCALE = 5.5, 1.0  # Poisson spacing (m) and size of the CC0 trees
UNDERGROWTH = 0.035  # bush density (per m2, scaled by the forest attribute)
FOREST_BOX = (-470.0, 570.0, -70.0, 1075.0)  # trees only where the camera looks (x0, x1, y0, y1)
CLEAR_BAND = None  # (d0, d1, x0): no trees for d0 < d < d1 and x > x0
ROCK_D_MIN = 75.0  # lowest start of the falling rocks up the scar
SLIDE_BOX = (-110.0, 130.0, -40.0, 290.0)  # x0, x1, y0, y1 of the region the rocks can reach


def build_rockfall(rmat, n=int(arg("--rocks", 1, 340))):
    sc = bpy.context.scene
    bpy.ops.rigidbody.world_add()
    rw = sc.rigidbody_world
    rw.substeps_per_frame = 12
    rw.solver_iterations = 20
    rw.time_scale = float(arg("--tscale", 1, 1.5))
    rw.point_cache.frame_start, rw.point_cache.frame_end = 1, FRAMES + PRE
    col = bpy.data.collections.new("Rockfall")
    sc.collection.children.link(col)
    rw.collection = bpy.data.collections.new("RBWorld")
    # the collision ground: the terrain over the slide region, hidden from render
    x0, x1, y0, y1 = SLIDE_BOX
    me = grid_mesh("ground_proxy", np.arange(x0, x1, 0.8), np.arange(y0, y1, 0.8), lambda a, b: height(a, b)[0])
    gp = bpy.data.objects.new("GroundProxy", me)
    sc.collection.objects.link(gp)
    gp.hide_render = True
    gp.display_type = "WIRE"
    pas = [gp, bpy.data.objects["Wall"], bpy.data.objects["Kerb"]]
    for ob in pas:
        rw.collection.objects.link(ob)
        bpy.context.view_layer.objects.active = ob
        ob.select_set(True)
        bpy.ops.rigidbody.object_add(type="PASSIVE")
        ob.rigid_body.collision_shape = "MESH"
        ob.rigid_body.friction = 0.65
        ob.rigid_body.restitution = 0.25
        ob.rigid_body.collision_margin = 0.04
        ob.select_set(False)
    shapes = [rock_mesh(20 + i, "fall") for i in range(14)]
    for m in shapes:
        m.materials.append(rmat)
    r = np.random.default_rng(SEED + 1)
    rocks = []
    placed = []
    yr = river_y(0.0)
    for i in range(n * 4):
        if len(rocks) >= n:
            break
        size = float(np.clip(r.lognormal(np.log(1.25), 0.5), 0.45, 3.8))
        if i < 6:
            size = r.uniform(3.2, 4.5)  # big blocks off the head scarp
        d = SCAR_D1 - 5 - (SCAR_D1 - ROCK_D_MIN) * r.uniform(0, 1) ** 1.6 if len(rocks) >= 6 else r.uniform(SCAR_D1 - 14, SCAR_D1 - 4)
        hw = float(scar_half(np.array([d]))[0]) * 0.75
        x = float(scar_cx(np.array([d]))[0]) + r.uniform(-hw, hw)
        y = yr + RIVER_HW + d
        z = ground_z(x, y) + size * 0.55 + r.uniform(0.2, 1.5)
        if any((x - a) ** 2 + (y - b) ** 2 + (z - c) ** 2 < ((size + sz) * 0.62) ** 2 for a, b, c, sz in placed):
            continue
        placed.append((x, y, z, size))
        ob = bpy.data.objects.new(f"Rock{len(rocks):03d}", shapes[i % len(shapes)])
        col.objects.link(ob)
        ob.location = (x, y, z)
        ob.rotation_euler = tuple(r.uniform(0, 6.283, 3))
        ob.scale = (size, size, size)
        rocks.append(ob)
    for ob in rocks:
        rw.collection.objects.link(ob)
        bpy.context.view_layer.objects.active = ob
        ob.select_set(True)
        bpy.ops.rigidbody.object_add(type="ACTIVE")
        rb = ob.rigid_body
        rb.collision_shape = "CONVEX_HULL"
        rb.mass = 2600 * ob.scale[0] ** 3 * 0.35
        rb.friction = 0.38
        rb.restitution = 0.3
        rb.linear_damping = 0.04
        rb.angular_damping = 0.1
        rb.collision_margin = 0.02
        ob.select_set(False)
        # the slope lets go from the bottom up, over about a second
        dd = ob.location.y - yr - RIVER_HW
        rel = int(3 + (dd - 70) * 0.3 + r.uniform(-3, 3))
        rb.kinematic = True
        rb.keyframe_insert("kinematic", frame=1)
        rb.keyframe_insert("kinematic", frame=max(2, rel - 1))
        rb.kinematic = False
        rb.keyframe_insert("kinematic", frame=max(3, rel))
    return rocks


# ---------------------------------------------------------------- dust: Mantaflow smoke shed by the moving rocks
def build_dust(rocks):
    sc = bpy.context.scene
    x0, x1, y0, y1, z0, z1 = -95.0, 135.0, -15.0, 265.0, -5.0, 330.0
    bpy.ops.mesh.primitive_cube_add(size=1)
    dom = bpy.context.active_object
    dom.name = "DustDomain"
    dom.location = ((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2)
    dom.scale = (x1 - x0, y1 - y0, z1 - z0)
    mod = dom.modifiers.new("Fluid", "FLUID")
    mod.fluid_type = "DOMAIN"
    ds = mod.domain_settings
    ds.domain_type = "GAS"
    ds.resolution_max = int(arg("--dres", 1, 80))
    ds.use_adaptive_domain = True
    ds.adapt_threshold = 0.004
    ds.adapt_margin = 6
    ds.alpha = 0.0
    ds.beta = 1.0             # but the turbulence still lifts it in billows
    ds.vorticity = 0.5
    ds.use_dissolve_smoke = True
    ds.dissolve_speed = int(arg("--dissolve", 1, 70))
    ds.use_dissolve_smoke_log = True
    ds.use_noise = bool(int(arg("--dnoise", 1, 1)))
    ds.noise_scale = 2
    ds.noise_strength = 1.7
    ds.cache_directory = str(OUT / "dustcache")
    ds.cache_type = "ALL"
    ds.cache_frame_start, ds.cache_frame_end = 1, FRAMES + PRE
    ds.cache_data_format = "OPENVDB"
    ds.openvdb_data_depth = "16"
    ds.timesteps_max = 4
    ds.timesteps_min = 1
    # volume shader: tan dust, forward scattering so it glows a little against the light
    m, nt = node_mat("dust")
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    pv = nt.nodes.new("ShaderNodeVolumePrincipled")
    pv.inputs["Color"].default_value = (0.24, 0.17, 0.105, 1)
    pv.inputs["Density"].default_value = 0.0
    pv.inputs["Anisotropy"].default_value = 0.35
    at = nt.nodes.new("ShaderNodeAttribute")
    at.attribute_name = "density"
    mul = nt.nodes.new("ShaderNodeMath")
    mul.operation = "MULTIPLY"
    mul.inputs[1].default_value = float(arg("--ddens", 1, 0.3))
    link(nt, at.outputs["Fac"], mul.inputs[0])
    link(nt, mul.outputs[0], pv.inputs["Density"])
    link(nt, pv.outputs[0], out.inputs["Volume"])
    dom.data.materials.append(m)
    # a light breeze down the valley
    bpy.ops.object.effector_add(type="WIND", location=(0, 120, 120), rotation=(0, math.radians(90), 0))
    w = bpy.context.active_object
    w.field.strength = float(arg("--wind", 1, 1.6))
    w.field.flow = 1.0
    # emitters: every rock, shedding dust in proportion to how fast it moves
    for ob in rocks:
        fm = ob.modifiers.new("Fluid", "FLUID")
        fm.fluid_type = "FLOW"
        fs = fm.flow_settings
        fs.flow_type = "SMOKE"
        fs.flow_behavior = "INFLOW"
        fs.flow_source = "MESH"
        fs.surface_distance = 1.1
        fs.smoke_color = (0.5, 0.42, 0.32)
        fs.temperature = 1.6
        fs.use_initial_velocity = True
        fs.velocity_factor = 0.08
        fs.density = 0.0
    prev = {ob.name: None for ob in rocks}
    for f in range(1, FRAMES + PRE + 1, 2):
        sc.frame_set(f)
        for ob in rocks:
            p = ob.matrix_world.translation.copy()
            q = prev[ob.name]
            v = 0.0 if q is None else (p - q).length / 2 * FPS
            prev[ob.name] = p
            fs = ob.modifiers["Fluid"].flow_settings
            fs.density = float(min(1.0, max(0.0, (v - 2.0) / 12.0))) * min(1.0, ob.scale[0] / 1.5) * float(arg("--demit", 1, 0.35))
            fs.keyframe_insert("density", frame=f)
    return dom


# ---------------------------------------------------------------- the rock animation as data, and dust as volume puffs
def export_anim(rocks, path):
    """Rock world matrices for every frame (so render workers replay the exact same fall without simulating)."""
    import json
    sc = bpy.context.scene
    out = {"frames": FRAMES + PRE, "rocks": {}}
    for ob in rocks:
        out["rocks"][ob.name] = []
    for f in range(1, FRAMES + PRE + 1):
        sc.frame_set(f)
        for ob in rocks:
            m = ob.matrix_world
            out["rocks"][ob.name].append([round(v, 4) for row in m for v in row][:12])
    Path(path).write_text(json.dumps(out, separators=(",", ":")))


def apply_anim(rocks, path):
    """Replace the rigid-body sim with keyframes from export_anim's file."""
    import json
    from mathutils import Matrix
    d = json.loads(Path(path).read_text())
    sc = bpy.context.scene
    if sc.rigidbody_world:
        for ob in rocks:
            if ob.rigid_body:
                bpy.context.view_layer.objects.active = ob
                with bpy.context.temp_override(object=ob, active_object=ob, selected_objects=[ob]):
                    bpy.ops.rigidbody.object_remove()
        bpy.ops.rigidbody.world_remove()
    for ob in rocks:
        seq = d["rocks"][ob.name]
        for f, m in enumerate(seq, start=1):
            M = Matrix((m[0:4], m[4:8], m[8:12], (0, 0, 0, 1)))
            ob.matrix_world = M
            ob.keyframe_insert("location", frame=f)
            ob.keyframe_insert("rotation_euler", frame=f)
            ob.keyframe_insert("scale", frame=f)
    return d


def build_puffs(d):
    """Dust as soft volume puffs shed by fast rocks: each grows, rises, drifts down-valley and thins out.
    Deterministic from the animation data, so every render worker builds the same dust."""
    import json
    from mathutils import Matrix
    sc = bpy.context.scene
    r = np.random.default_rng(SEED + 7)
    m, nt = node_mat("puff")
    N = nt.nodes.new
    out = N("ShaderNodeOutputMaterial")
    pv = N("ShaderNodeVolumePrincipled")
    pv.inputs["Color"].default_value = tuple(float(v) for v in arg("--pcol", 3, (0.72, 0.6, 0.45))) + (1,)
    pv.inputs["Anisotropy"].default_value = 0.3
    pv.inputs["Density Attribute"].default_value = ""
    tc, oi = N("ShaderNodeTexCoord"), N("ShaderNodeObjectInfo")
    at = N("ShaderNodeAttribute")
    at.attribute_type = "OBJECT"
    at.attribute_name = '["dens"]'
    ln = N("ShaderNodeVectorMath")
    ln.operation = "LENGTH"
    link(nt, tc.outputs["Object"], ln.inputs[0])
    fall = N("ShaderNodeMapRange")
    fall.inputs["From Min"].default_value = 1.0
    fall.inputs["From Max"].default_value = 0.2
    link(nt, ln.outputs["Value"], fall.inputs["Value"])
    nz = N("ShaderNodeTexNoise")
    nz.noise_dimensions = "4D"
    nz.inputs["Scale"].default_value = 1.6
    nz.inputs["Detail"].default_value = 6
    nz.inputs["Roughness"].default_value = 0.6
    link(nt, tc.outputs["Object"], nz.inputs["Vector"])
    wv = N("ShaderNodeMath")
    wv.operation = "MULTIPLY"
    wv.inputs[1].default_value = 37.0
    link(nt, oi.outputs["Random"], wv.inputs[0])
    link(nt, wv.outputs[0], nz.inputs["W"])
    nr = N("ShaderNodeMapRange")
    nr.inputs["From Min"].default_value = 0.47
    nr.inputs["From Max"].default_value = 0.7
    link(nt, nz.outputs["Fac"], nr.inputs["Value"])
    m1 = N("ShaderNodeMath")
    m1.operation = "MULTIPLY"
    link(nt, fall.outputs[0], m1.inputs[0])
    link(nt, nr.outputs[0], m1.inputs[1])
    m2 = N("ShaderNodeMath")
    m2.operation = "MULTIPLY"
    link(nt, m1.outputs[0], m2.inputs[0])
    link(nt, at.outputs["Fac"], m2.inputs[1])
    link(nt, m2.outputs[0], pv.inputs["Density"])
    link(nt, pv.outputs[0], out.inputs["Volume"])
    me = bpy.data.meshes.new("puff")
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=2, radius=1.0)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(m)
    col = bpy.data.collections.new("Dust")
    sc.collection.children.link(col)
    # where and when: every 4 frames, each moving rock may shed a puff; keep the fastest
    names = sorted(d["rocks"])
    cand = []
    for nm in names:
        seq = d["rocks"][nm]
        size = math.sqrt(seq[0][0] ** 2 + seq[0][4] ** 2 + seq[0][8] ** 2)
        for f in range(5, len(seq) - 1, 4):
            a, b = seq[f - 4], seq[f]
            v = math.dist((a[3], a[7], a[11]), (b[3], b[7], b[11])) / 4 * FPS
            if v > 3.0:
                cand.append((v * size, f, b[3], b[7], b[11], size, v))
    cand.sort(reverse=True)
    keep = cand[: int(arg("--puffs", 1, 300))]
    LIFE = 75
    for k, (_, f0, x, y, z, size, v) in enumerate(keep):
        ob = bpy.data.objects.new(f"Puff{k:03d}", me)
        col.objects.link(ob)
        ob.visible_shadow = False  # sunlit through, and no shadow rays marching every puff
        r0 = 1.6 + size * 1.1 + r.uniform(0, 1.5)
        wind = r.uniform(1.0, 2.2)
        rise = r.uniform(1.2, 2.6)
        rot0 = r.uniform(0, 6.28, 3)
        for af in range(0, LIFE + 1, 5):
            fr = f0 + af
            t = af / FPS
            g = 1 - math.exp(-af / 18.0)
            ob.location = (x + wind * t + r.uniform(-0.3, 0.3), y - 0.8 * t, z + 0.6 * size + rise * t * (1 - 0.25 * t))
            sc_ = r0 * (0.55 + float(arg("--pgrow", 1, 2.4)) * g)
            ob.scale = (sc_ * 1.15, sc_, sc_ * 0.85)
            ob.rotation_euler = tuple(rot0 + np.array([0.05, 0.08, 0.03]) * af)
            dens = min(1.0, af / 6.0) * max(0.0, 1 - af / LIFE) ** 1.3 * float(arg("--pdens", 1, 0.07)) * min(1.6, v / 8.0)
            ob["dens"] = dens
            for p in ("location", "scale", "rotation_euler", '["dens"]'):
                ob.keyframe_insert(p, frame=fr)
        # hidden outside its life so idle puffs cost nothing
        ob.hide_render = True
        ob.keyframe_insert("hide_render", frame=1)
        ob.hide_render = False
        ob.keyframe_insert("hide_render", frame=f0)
        ob.hide_render = True
        ob.keyframe_insert("hide_render", frame=f0 + LIFE + 1)
    print("puffs", len(keep), flush=True)


# ---------------------------------------------------------------- the real Teesta valley behind (AWS terrain + EOX Sentinel-2)
def build_backdrop():
    import json
    root = Path(__file__).resolve().parents[2]
    t = json.loads((root / "src" / "sikkim" / "geo.json").read_text())["terrain"]
    img = bpy.data.images.load(str(root / "public" / "sikkim" / "maps" / "valley_hrg.png"))
    img.colorspace_settings.name = "Non-Color"
    w, h = img.size
    px = np.array(img.pixels[:], dtype=np.float32).reshape(h, w, 4)
    hm = (np.round(px[..., 0] * 255) * 256 + np.round(px[..., 1] * 255)) / 65535.0 * (t["hmax"] - t["hmin"])
    st = 2
    hm = hm[::st, ::st]
    hh, ww = hm.shape
    W, H = t["w_m"], t["h_m"]
    xs, ys = np.meshgrid(np.linspace(-W / 2, W / 2, ww), np.linspace(-H / 2, H / 2, hh))
    us, vs = np.meshgrid(np.linspace(0, 1, ww), np.linspace(0, 1, hh))
    verts = np.stack([xs.ravel(), ys.ravel(), hm.ravel()], 1)
    me = bpy.data.meshes.new("backdrop")
    me.vertices.add(len(verts))
    me.vertices.foreach_set("co", verts.astype(np.float32).ravel())
    i = np.arange(ww * hh).reshape(hh, ww)
    quads = np.stack([i[:-1, :-1], i[:-1, 1:], i[1:, 1:], i[1:, :-1]], -1).reshape(-1, 4)
    me.loops.add(quads.size)
    me.loops.foreach_set("vertex_index", quads.ravel().astype(np.int32))
    me.polygons.add(len(quads))
    me.polygons.foreach_set("loop_start", (np.arange(len(quads)) * 4).astype(np.int32))
    me.polygons.foreach_set("loop_total", np.full(len(quads), 4, np.int32))
    me.update()
    uv = me.uv_layers.new(name="UVMap")
    uvv = np.stack([us.ravel(), vs.ravel()], 1)[quads.ravel()]
    uv.data.foreach_set("uv", uvv.astype(np.float32).ravel())
    me.polygons.foreach_set("use_smooth", np.ones(len(me.polygons), bool))
    ob = bpy.data.objects.new("Backdrop", me)
    bpy.context.scene.collection.objects.link(ob)
    m, nt = node_mat("backdrop")
    out, bs = nt.nodes.new("ShaderNodeOutputMaterial"), nt.nodes.new("ShaderNodeBsdfPrincipled")
    tx = nt.nodes.new("ShaderNodeTexImage")
    tx.image = bpy.data.images.load(str(root / "public" / "sikkim" / "maps" / "valley_tex.jpg"))
    hsv = nt.nodes.new("ShaderNodeHueSaturation")
    hsv.inputs["Saturation"].default_value = 0.85
    hsv.inputs["Value"].default_value = 0.8
    link(nt, tx.outputs[0], hsv.inputs["Color"])
    link(nt, hsv.outputs[0], bs.inputs["Base Color"])
    bs.inputs["Roughness"].default_value = 0.95
    link(nt, bs.outputs[0], out.inputs[0])
    me.materials.append(m)
    # rotated so the high ground around Gangtok rises beyond our ridge; the valley floor sits a little below ours
    ob.rotation_euler = (0, 0, math.radians(float(arg("--bd_rot", 1, 180))))
    ob.location = (float(arg("--bd_x", 1, -2500)), float(arg("--bd_y", 1, 26500)), -60)
    return ob


# ---------------------------------------------------------------- clouds and valley mist (cards, cheap in Cycles)
def cloud_card(name, size, loc, scale, thresh, alpha, col=(1, 1, 1), seed=0.0, shadow=True):
    bpy.ops.mesh.primitive_plane_add(size=1)
    ob = bpy.context.active_object
    ob.name = name
    ob.scale = (*size, 1)
    ob.location = loc
    m, nt = node_mat(name)
    N = nt.nodes.new
    out = N("ShaderNodeOutputMaterial")
    tc = N("ShaderNodeTexCoord")
    mp = N("ShaderNodeMapping")
    link(nt, tc.outputs["Object"], mp.inputs["Vector"])
    mp.inputs["Scale"].default_value = (scale * size[0], scale * size[1], 1)
    mp.inputs["Location"].default_value = (seed, seed * 0.7, 0)
    # slow drift
    drv = mp.inputs["Location"].driver_add("default_value", 0).driver
    drv.expression = f"{seed} + frame*0.0009"
    nz = N("ShaderNodeTexNoise")
    nz.inputs["Scale"].default_value = 1.0
    nz.inputs["Detail"].default_value = 12
    nz.inputs["Roughness"].default_value = 0.62
    link(nt, mp.outputs[0], nz.inputs["Vector"])
    r = N("ShaderNodeValToRGB")
    r.color_ramp.elements[0].position = thresh
    r.color_ramp.elements[0].color = (0, 0, 0, 1)
    r.color_ramp.elements[1].position = min(1, thresh + 0.22)
    r.color_ramp.elements[1].color = (alpha, alpha, alpha, 1)
    link(nt, nz.outputs["Fac"], r.inputs[0])
    tr, bs = N("ShaderNodeBsdfTransparent"), N("ShaderNodeBsdfPrincipled")
    bs.inputs["Base Color"].default_value = (*col, 1)
    bs.inputs["Roughness"].default_value = 1.0
    bs.inputs["Subsurface Weight"].default_value = 0.0
    bs.inputs["Emission Color"].default_value = (*col, 1)
    bs.inputs["Emission Strength"].default_value = 0.25
    mx = N("ShaderNodeMixShader")
    link(nt, r.outputs[0], mx.inputs[0])
    link(nt, tr.outputs[0], mx.inputs[1])
    link(nt, bs.outputs[0], mx.inputs[2])
    link(nt, mx.outputs[0], out.inputs[0])
    m.blend_method = "BLEND" if hasattr(m, "blend_method") else None
    ob.data.materials.append(m)
    ob.visible_shadow = shadow
    return ob


def build_clouds():
    # a broken cumulus deck that casts moving shadows, and low mist lying in the valleys beyond the ridge
    cloud_card("Clouds", (90000, 90000), (0, 0, 2900), 1 / 9000.0, 0.48, 1.0, (1, 1, 1), 3.1)
    cloud_card("CloudsHigh", (120000, 120000), (0, 0, 5200), 1 / 16000.0, 0.52, 0.8, (1, 1, 1), 8.4, shadow=False)
    for k, (y, z, sx) in enumerate(((1700, 520, 5000), (3600, 380, 9000), (7000, 700, 16000))):
        cloud_card(f"Mist{k}", (sx, sx * 0.4), (-400, y + sx * 0.2, z), 1 / 1100.0, 0.42, 0.75, (0.92, 0.95, 1.0), 2.0 + k, shadow=False)


# ---------------------------------------------------------------- sky, light, camera
def build_world(sun_el=26.0, sun_az=258.0):
    sc = bpy.context.scene
    w = bpy.data.worlds.new("sky")
    sc.world = w
    w.use_nodes = True
    nt = w.node_tree
    nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputWorld")
    bg = nt.nodes.new("ShaderNodeBackground")
    sky = nt.nodes.new("ShaderNodeTexSky")
    sky.sky_type = "NISHITA"
    sky.sun_elevation = math.radians(sun_el)
    sky.sun_rotation = math.radians(sun_az)
    sky.altitude = 600
    sky.air_density = 1.0
    sky.dust_density = 1.6
    sky.sun_disc = False
    nt.links.new(sky.outputs[0], bg.inputs[0])
    bg.inputs[1].default_value = float(arg("--sky", 1, 0.35))
    nt.links.new(bg.outputs[0], out.inputs[0])
    sun = bpy.data.lights.new("Sun", "SUN")
    sun.energy = float(arg("--sun", 1, 5.0))
    sun.angle = math.radians(1.2)
    sun.color = (1.0, 0.9, 0.78)
    so = bpy.data.objects.new("Sun", sun)
    sc.collection.objects.link(so)
    # Blender's sky rotation: 0 = sun towards -Y; light points the opposite way
    # key light from camera-left and a little in front, so the slope's relief and the trees' shadows read
    d = Vector(tuple(float(v) for v in arg("--sundir", 3, (-0.8, -0.45, 0.42)))).normalized()
    sky.sun_elevation = math.asin(d.z)
    sky.sun_rotation = math.atan2(d.x, d.y)
    so.rotation_euler = d.to_track_quat("Z", "Y").to_euler()


def ground_z(x, y):
    z, *_ = height(np.array([x]), np.array([y]))
    return float(z[0])


CAM_P0 = Vector((210.0, -300.0, 240.0))   # a drone across the river and downstream, level with the slide's head
CAM_LOOK = Vector((0.0, 230.0, 150.0))


def set_camera_keys(co, tgt):
    """A slow push toward the slide over the shot, settling a little lower, with a whisper of handheld drift."""
    co.data.lens = float(arg("--lens", 1, 40))
    if co.animation_data:
        co.animation_data_clear()
    if tgt.animation_data:
        tgt.animation_data_clear()
    p1 = CAM_P0.lerp(CAM_LOOK, 0.1) + Vector((0, 0, -8))
    for f, p, l in ((PRE + 1, CAM_P0, CAM_LOOK), (PRE + FRAMES, p1, CAM_LOOK + Vector((-4, 0, -8)))):
        co.location = p
        co.keyframe_insert("location", frame=f)
        tgt.location = l
        tgt.keyframe_insert("location", frame=f)
    for ob in (co, tgt):
        for fc in ob.animation_data.action.fcurves:
            for k in fc.keyframe_points:
                k.interpolation = "BEZIER"
                k.easing = "EASE_IN_OUT"
    for i in range(3):
        fc = co.animation_data.action.fcurves.find("location", index=i)
        m = fc.modifiers.new("NOISE")
        m.scale = 40
        m.strength = 0.35
        m.offset = 37.0 * (i + 1)


def build_camera():
    sc = bpy.context.scene
    cam = bpy.data.cameras.new("Cam")
    cam.lens = float(arg("--lens", 1, 50))
    cam.sensor_fit = "VERTICAL"
    cam.sensor_height = 36
    cam.clip_start = 1
    cam.clip_end = 90000
    co = bpy.data.objects.new("Cam", cam)
    sc.collection.objects.link(co)
    sc.camera = co
    tgt = bpy.data.objects.new("CamTarget", None)
    sc.collection.objects.link(tgt)
    con = co.constraints.new("TRACK_TO")
    con.target = tgt
    con.track_axis = "TRACK_NEGATIVE_Z"
    con.up_axis = "UP_Y"
    set_camera_keys(co, tgt)
    return co


def setup_render(res=1.0, samples=64):
    sc = bpy.context.scene
    sc.render.engine = "CYCLES"
    sc.cycles.device = "CPU"
    sc.cycles.samples = samples
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.adaptive_threshold = 0.03
    sc.cycles.use_denoising = True
    sc.cycles.denoiser = "OPENIMAGEDENOISE"
    sc.cycles.max_bounces = 6
    sc.cycles.diffuse_bounces = 2
    sc.cycles.glossy_bounces = 2
    sc.cycles.volume_bounces = 1
    sc.cycles.transparent_max_bounces = 4
    sc.cycles.volume_step_rate = 2.0
    sc.cycles.volume_max_steps = 256
    sc.render.use_persistent_data = True
    sc.render.resolution_x, sc.render.resolution_y = 1080, 1920
    sc.render.resolution_percentage = int(res * 100)
    sc.render.fps = FPS
    sc.frame_start, sc.frame_end = PRE + 1, PRE + FRAMES
    sc.render.image_settings.file_format = "PNG"
    sc.render.image_settings.color_depth = "8"
    sc.view_settings.view_transform = "AgX"
    sc.view_settings.look = "AgX - Medium High Contrast"
    sc.view_settings.exposure = 0.15
    sc.render.film_transparent = True
    sc.render.use_motion_blur = True
    sc.render.motion_blur_shutter = 0.5
    # aerial perspective: everything solid fades toward a haze colour with distance (mist pass); the sky comes
    # from the environment pass, so it isn't hazed twice
    vl = sc.view_layers[0]
    vl.use_pass_mist = True
    vl.use_pass_environment = True
    sc.world.mist_settings.start = 120
    sc.world.mist_settings.depth = float(arg("--mist", 1, 16000))
    sc.world.mist_settings.falloff = "QUADRATIC"
    sc.use_nodes = True
    nt = sc.node_tree
    nt.nodes.clear()
    rl = nt.nodes.new("CompositorNodeRLayers")
    mix = nt.nodes.new("CompositorNodeMixRGB")
    mix.blend_type = "MIX"
    nt.links.new(rl.outputs["Image"], mix.inputs[1])
    mix.inputs[2].default_value = (0.50, 0.60, 0.74, 1)
    # haze from the depth pass (the mist pass counts the dust volume as far away and whitens it)
    vl.use_pass_z = True
    mr = nt.nodes.new("CompositorNodeMapRange")
    mr.inputs["From Min"].default_value = 120
    mr.inputs["From Max"].default_value = sc.world.mist_settings.depth
    mr.use_clamp = True
    nt.links.new(rl.outputs["Depth"], mr.inputs["Value"])
    sq = nt.nodes.new("CompositorNodeMath")
    sq.operation = "POWER"
    sq.inputs[1].default_value = 2.0
    nt.links.new(mr.outputs[0], sq.inputs[0])
    mul = nt.nodes.new("CompositorNodeMath")
    mul.operation = "MULTIPLY"
    mul.inputs[1].default_value = 0.0  # haze is in the materials now (add_aerial_haze)
    nt.links.new(sq.outputs[0], mul.inputs[0])
    nt.links.new(mul.outputs[0], mix.inputs[0])
    sa = nt.nodes.new("CompositorNodeSetAlpha")
    sa.mode = "REPLACE_ALPHA"
    nt.links.new(mix.outputs[0], sa.inputs[0])
    nt.links.new(rl.outputs["Alpha"], sa.inputs[1])
    ao = nt.nodes.new("CompositorNodeAlphaOver")
    nt.links.new(rl.outputs["Env"], ao.inputs[1])
    nt.links.new(sa.outputs[0], ao.inputs[2])
    mix = ao
    glare = nt.nodes.new("CompositorNodeGlare")
    glare.glare_type = "BLOOM" if hasattr(bpy.types, "CompositorNodeGlare") else "FOG_GLOW"
    try:
        glare.glare_type = "BLOOM"
    except TypeError:
        glare.glare_type = "FOG_GLOW"
    glare.threshold = 0.85
    glare.mix = -0.85
    nt.links.new(mix.outputs[0], glare.inputs[0])
    out = nt.nodes.new("CompositorNodeComposite")
    nt.links.new(glare.outputs[0], out.inputs[0])


# ---------------------------------------------------------------- build
HAZE = (0.5, 0.6, 0.74)


def add_aerial_haze(depth=16000.0, amount=float(arg("--haze", 1, 0.8)), power=2.0):
    """Aerial perspective on every surface seen by the camera: blend toward the haze colour with view distance
    (quadratic from 120 m). Done in the shaders, not the compositor, so the dust volume isn't hazed as if far away."""
    for m in bpy.data.materials:
        # only opaque surfaces far enough to show it: hazing the leaf and cloud cards makes their cut-outs opaque
        if m.name not in ("terrain", "backdrop", "water") or not m.use_nodes or m.get("hazed"):
            continue
        nt = m.node_tree
        out = next((n for n in nt.nodes if n.type == "OUTPUT_MATERIAL" and n.is_active_output), None)
        if out is None or not out.inputs["Surface"].links:
            continue
        src = out.inputs["Surface"].links[0].from_socket
        cd = nt.nodes.new("ShaderNodeCameraData")
        mr = nt.nodes.new("ShaderNodeMapRange")
        mr.inputs["From Min"].default_value = 120
        mr.inputs["From Max"].default_value = depth
        mr.clamp = True
        nt.links.new(cd.outputs["View Distance"], mr.inputs["Value"])
        sq = nt.nodes.new("ShaderNodeMath")
        sq.operation = "POWER"
        sq.inputs[1].default_value = power
        nt.links.new(mr.outputs[0], sq.inputs[0])
        lp = nt.nodes.new("ShaderNodeLightPath")
        k = nt.nodes.new("ShaderNodeMath")
        k.operation = "MULTIPLY"
        nt.links.new(sq.outputs[0], k.inputs[0])
        nt.links.new(lp.outputs["Is Camera Ray"], k.inputs[1])
        k2 = nt.nodes.new("ShaderNodeMath")
        k2.operation = "MULTIPLY"
        k2.inputs[1].default_value = amount
        nt.links.new(k.outputs[0], k2.inputs[0])
        em = nt.nodes.new("ShaderNodeEmission")
        em.inputs["Color"].default_value = (*HAZE, 1)
        mx = nt.nodes.new("ShaderNodeMixShader")
        nt.links.new(k2.outputs[0], mx.inputs[0])
        nt.links.new(src, mx.inputs[1])
        nt.links.new(em.outputs[0], mx.inputs[2])
        nt.links.new(mx.outputs[0], out.inputs["Surface"])
        m.cycles.emission_sampling = "NONE"  # the haze glow must not turn the terrain into a light source
        m["hazed"] = 1


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    terr = build_terrain()
    terr.data.materials.append(mat_terrain())
    leaf, bark = mat_leaf(), mat_simple("bark", (0.06, 0.045, 0.03), 0.9)
    build_forest(terr, leaf, bark)
    build_structures(None)
    rmat = mat_rock()
    build_scree(terr, rmat)
    rocks = build_rockfall(rmat)
    build_backdrop()
    build_clouds()
    build_world()
    build_camera()
    setup_render(float(arg("--res", 1, 1.0)), int(arg("--samples", 1, 64)))
    add_aerial_haze()
    return terr, rocks


if __name__ == "__main__":
    terr, rocks = build()
    if arg("--anim", 1):
        build_puffs(apply_anim(rocks, arg("--anim", 1)))
    if arg("--bake", 0):
        import time
        t = time.time()
        sc = bpy.context.scene
        with bpy.context.temp_override(scene=sc, point_cache=sc.rigidbody_world.point_cache):
            bpy.ops.ptcache.bake(bake=True)
        print("RB_BAKE_S", round(time.time() - t, 1), flush=True)
        if arg("--export", 1):
            export_anim(rocks, arg("--export", 1))
        if arg("--dust", 0):
            dom = build_dust(rocks)
            t = time.time()
            bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "landslide.blend"))
            with bpy.context.temp_override(active_object=dom, object=dom, selected_objects=[dom]):
                bpy.ops.fluid.bake_all()
            print("DUST_BAKE_S", round(time.time() - t, 1), flush=True)
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "landslide.blend"))
    st = arg("--still", 1)
    if st:
        sc = bpy.context.scene
        sc.frame_set(int(st))
        sc.render.filepath = str(OUT / f"still_{int(st):04d}.png")
        import time
        t = time.time()
        bpy.ops.render.render(write_still=True)
        print("RENDER_S", round(time.time() - t, 1))
