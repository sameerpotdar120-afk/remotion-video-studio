"""Detailed 3D models for the Six-Day War video, built entirely from code in Blender (no downloaded assets).

    blender -b --python tools/blender/build_sixday_models.py -- <out_dir>

Writes glTF binaries (metres, Y up) that three.js loads in the Remotion edit:
- tank.glb     a 1960s-style main battle tank: sloped hull with fenders and stowage, cast turret, mantlet, gun with fume
               extractor and muzzle brake, cupola with machine gun, 5 road wheels + sprocket + idler + return rollers per
               side, rubber-padded track belts. Nodes: hull, turret (yaw pivot), gun (pitch pivot), wheels_L/R, track_L/R
               (UV v runs along the track, so scrolling it moves the links).
- jet.glb      a delta-wing fighter: lofted fuselage, side intakes, bubble canopy, cranked delta wing with thickness,
               swept fin, nozzle, afterburner glow (node "burner"), desert camouflage (generated texture).
- mig.glb      a swept-wing fighter in bare metal (parked on the Egyptian airfields).
- soldier.glb  a rigged soldier (skin-modifier body, subdivided), helmet, webbing, rifle; animations "run" and "walk".
- ship.glb     a 1960s cargo ship: flared hull with sheer, boot-top, hatches, kingposts and derricks, bridge, funnel.
- tanker.glb   an oil tanker: long deck with pipe runs, catwalk, aft superstructure and funnel.
Textures (camouflage, track links) are generated with numpy and packed into the .glb files.
"""
import math
import sys
from pathlib import Path

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Vector

OUT = Path(sys.argv[sys.argv.index("--") + 1]) if "--" in sys.argv else Path("/tmp/sd_models")
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(1967)


# ------------------------------------------------------------------ helpers
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def mat(name, rgb, rough=0.7, metal=0.2, emit=None, img=None, alpha=1.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*rgb, 1)
    b.inputs["Roughness"].default_value = rough
    b.inputs["Metallic"].default_value = metal
    if emit:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = 4.0
    if img is not None:
        t = m.node_tree.nodes.new("ShaderNodeTexImage"); t.image = img
        m.node_tree.links.new(t.outputs["Color"], b.inputs["Base Color"])
    if alpha < 1:
        b.inputs["Alpha"].default_value = alpha
        m.blend_method = "BLEND"
    return m


def image(name, arr):
    h, w = arr.shape[:2]
    im = bpy.data.images.new(name, w, h, alpha=True)
    rgba = np.ones((h, w, 4), np.float32)
    rgba[..., :3] = arr[..., :3]
    im.pixels = rgba[::-1].ravel()
    im.pack()
    return im


def noise2(h, w, scale, seed):
    """Smooth value noise (numpy only: Blender's Python has no scipy): a coarse grid, smoothstep-interpolated."""
    r = np.random.default_rng(seed)
    g = r.random((h // scale + 2, w // scale + 2))
    y, x = np.arange(h) / scale, np.arange(w) / scale
    y0, x0 = y.astype(int), x.astype(int)
    fy, fx = y - y0, x - x0
    fy, fx = fy * fy * (3 - 2 * fy), fx * fx * (3 - 2 * fx)
    a = g[y0][:, x0] * (1 - fx) + g[y0][:, x0 + 1] * fx
    b = g[y0 + 1][:, x0] * (1 - fx) + g[y0 + 1][:, x0 + 1] * fx
    return a * (1 - fy)[:, None] + b * fy[:, None]


def obj_from_bm(name, bm, m=None):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    o = bpy.data.objects.new(name, me)
    bpy.context.collection.objects.link(o)
    if m:
        o.data.materials.append(m)
    return o


def apply_mods(o):
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    for md in list(o.modifiers):
        bpy.ops.object.modifier_apply(modifier=md.name)
    o.select_set(False)


def bevel(o, w=0.04, seg=3, angle=40):
    md = o.modifiers.new("bev", "BEVEL"); md.width = w; md.segments = seg; md.limit_method = "ANGLE"; md.angle_limit = math.radians(angle)
    apply_mods(o)
    for p in o.data.polygons:
        p.use_smooth = True
    o.data.shade_auto_smooth(angle=math.radians(35)) if hasattr(o.data, "shade_auto_smooth") else None


def smooth(o, levels=2):
    md = o.modifiers.new("sub", "SUBSURF"); md.levels = levels; md.render_levels = levels
    apply_mods(o)
    for p in o.data.polygons:
        p.use_smooth = True


def prim(kind, name, m=None, **kw):
    getattr(bpy.ops.mesh, f"primitive_{kind}_add")(**kw)
    o = bpy.context.active_object; o.name = name
    if m:
        o.data.materials.clear(); o.data.materials.append(m)
    return o


def extrude_profile(name, pts, width, m=None, y0=None):
    """A closed side profile (x forward, z up) extruded across y (width)."""
    bm = bmesh.new()
    yA = -width / 2 if y0 is None else y0
    a = [bm.verts.new((x, yA, z)) for x, z in pts]
    b = [bm.verts.new((x, yA + width, z)) for x, z in pts]
    n = len(pts)
    bm.faces.new(a[::-1]); bm.faces.new(b)
    for i in range(n):
        bm.faces.new([a[i], a[(i + 1) % n], b[(i + 1) % n], b[i]])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return obj_from_bm(name, bm, m)


def loft(name, stations, m=None, ring=32, cap=True):
    """Loft through elliptical stations [(x, y_centre, z_centre, half_width, half_height, squareness)], x forward."""
    bm = bmesh.new()
    rings = []
    for x, yc, zc, a, b, sq in stations:
        r = []
        for k in range(ring):
            t = 2 * math.pi * k / ring
            c, s = math.cos(t), math.sin(t)
            e = 2 / (2 + sq * 6)  # superellipse exponent: squarer sections for sq > 0
            y = yc + a * math.copysign(abs(c) ** e, c)
            z = zc + b * math.copysign(abs(s) ** e, s)
            r.append(bm.verts.new((x, y, z)))
        rings.append(r)
    for r0, r1 in zip(rings, rings[1:]):
        for k in range(ring):
            bm.faces.new([r0[k], r0[(k + 1) % ring], r1[(k + 1) % ring], r1[k]])
    if cap:
        bm.faces.new(rings[0][::-1]); bm.faces.new(rings[-1])
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    o = obj_from_bm(name, bm, m)
    for p in o.data.polygons:
        p.use_smooth = True
    return o


def join(objs, name):
    bpy.ops.object.select_all(action="DESELECT")
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.join()
    o = bpy.context.active_object; o.name = name
    return o


def set_origin(o, p):
    """Move o's origin to world point p without moving its geometry."""
    d = Vector(p) - o.location
    o.data.transform(Matrix.Translation(-d))
    o.location = Vector(p)


def unwrap_all(skip=("track_L", "track_R")):
    for o in bpy.context.scene.objects:
        if o.type != "MESH" or o.name in skip or o.data.uv_layers:
            continue
        bpy.ops.object.select_all(action="DESELECT")
        bpy.context.view_layer.objects.active = o; o.select_set(True)
        bpy.ops.object.mode_set(mode="EDIT"); bpy.ops.mesh.select_all(action="SELECT")
        bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.01)
        bpy.ops.object.mode_set(mode="OBJECT")


def export(path, objs=None):
    unwrap_all()
    bpy.ops.object.select_all(action="DESELECT")
    for o in (objs or bpy.context.scene.objects):
        o.select_set(True)
    bpy.ops.export_scene.gltf(filepath=str(path), export_format="GLB", use_selection=True, export_apply=True, export_yup=True,
                              export_animations=True, export_image_format="JPEG", export_jpeg_quality=90)
    print("wrote", path)


# ------------------------------------------------------------------ textures
def camo(seed, cols, w=1024):
    base = np.zeros((w, w, 3), np.float32) + cols[0]
    for i, c in enumerate(cols[1:]):
        n = noise2(w, w, 96, seed + i)
        base[n > 0.62 - 0.05 * i] = c
    grime = noise2(w, w, 8, seed + 9)[..., None]
    return np.clip(base * (0.88 + 0.2 * grime), 0, 1)


def track_tex(w=256, h=1024, links=48):
    a = np.zeros((h, w, 3), np.float32) + 0.16
    for k in range(links):
        y0 = int(k * h / links)
        a[y0:y0 + 3] = 0.05                                    # gap between links
        a[y0 + 6:y0 + 10, 20:w - 20] = 0.32                    # grouser bar
        a[y0 + 12:y0 + h // links - 6, w // 2 - 18: w // 2 + 18] = 0.22  # centre guide
    a *= 0.9 + 0.2 * noise2(h, w, 6, 3)[..., None]
    return a


# ------------------------------------------------------------------ tank
def build_tank():
    reset()
    wear = np.clip(0.78 + 0.22 * noise2(1024, 1024, 48, 5)[..., None] + 0.12 * noise2(1024, 1024, 6, 6)[..., None] - 0.1, 0, 1) * np.array([1, 1, 1], np.float32)
    armour = mat("armour", (1, 1, 1), 0.78, 0.25, img=image("armour_wear", wear))
    dark = mat("dark", (0.07, 0.07, 0.065), 0.6, 0.5)
    rubber = mat("rubber", (0.05, 0.05, 0.05), 0.95, 0.0)
    trk = mat("track", (1, 1, 1), 0.85, 0.6, img=image("track_links", track_tex()))
    canvas = mat("canvas", (0.33, 0.3, 0.2), 0.95, 0.0)
    L, W = 6.6, 2.3
    # hull: side profile, sloped glacis and rear plate
    hull = extrude_profile("hull_core", [(-3.2, 0.5), (3.05, 0.5), (3.35, 0.95), (2.35, 1.45), (-3.0, 1.5), (-3.3, 1.15)], W, armour)
    bevel(hull, 0.05, 3)
    fenders = []
    for s in (-1, 1):
        f = prim("cube", f"fender_{s}", armour, size=1)
        f.scale = (L * 0.5, 0.42, 0.03); f.location = (0.05, s * (W / 2 + 0.36), 1.27); apply_scale(f); bevel(f, 0.015, 2)
        fenders.append(f)
        for k in range(3):  # stowage boxes on the fenders
            bx = prim("cube", f"stow_{s}_{k}", armour, size=1)
            bx.scale = (0.32, 0.2, 0.17); bx.location = (-2.0 + k * 0.85, s * (W / 2 + 0.38), 1.45); apply_scale(bx); bevel(bx, 0.02, 2)
            fenders.append(bx)
    deck = prim("cube", "engine_deck", armour, size=1)
    deck.scale = (0.9, 0.95, 0.05); deck.location = (-2.2, 0, 1.52); apply_scale(deck); bevel(deck, 0.02, 2)
    grill = prim("cube", "grill", dark, size=1)
    grill.scale = (0.7, 0.8, 0.02); grill.location = (-2.2, 0, 1.56); apply_scale(grill)
    lights = []
    for s in (-1, 1):
        lt = prim("cylinder", f"light_{s}", dark, radius=0.09, depth=0.12, vertices=20, rotation=(0, math.radians(90), 0), location=(3.0, s * 0.85, 1.25))
        lights.append(lt)
    hull = join([hull, deck, grill] + fenders + lights, "hull")
    # turret: a cast dome
    tur = loft("turret_shell", [(-1.65, 0, 1.55, 1.0, 0.18, 0.3), (-1.3, 0, 1.7, 1.25, 0.35, 0.25), (-0.4, 0, 1.78, 1.32, 0.48, 0.2),
                                 (0.6, 0, 1.75, 1.22, 0.45, 0.15), (1.2, 0, 1.68, 0.95, 0.34, 0.1), (1.5, 0, 1.6, 0.55, 0.22, 0.1)], armour, 40)
    smooth(tur, 1)
    ring = prim("cylinder", "turret_ring", armour, radius=1.2, depth=0.12, vertices=48, location=(-0.15, 0, 1.52))
    cup = prim("cylinder", "cupola", armour, radius=0.33, depth=0.28, vertices=32, location=(-0.5, -0.45, 2.3)); bevel(cup, 0.03, 2)
    hatch = prim("cylinder", "hatch", armour, radius=0.3, depth=0.05, vertices=32, location=(-0.5, -0.45, 2.46))
    mg = prim("cylinder", "mg", dark, radius=0.025, depth=0.9, vertices=12, rotation=(0, math.radians(90), 0), location=(-0.1, -0.45, 2.55))
    bustle = prim("cube", "bustle_rack", armour, size=1); bustle.scale = (0.3, 1.0, 0.18); bustle.location = (-1.85, 0, 1.75); apply_scale(bustle); bevel(bustle, 0.03, 2)
    tarp = prim("uv_sphere", "tarp", canvas, radius=0.3, segments=24, ring_count=12, location=(-1.9, 0.3, 1.95)); tarp.scale = (1.0, 2.0, 0.6); apply_scale(tarp)
    ant = prim("cylinder", "antenna", dark, radius=0.012, depth=2.2, vertices=8, location=(-1.2, 0.7, 2.9))
    turret = join([tur, ring, cup, hatch, mg, bustle, tarp, ant], "turret")
    set_origin(turret, (-0.15, 0, 1.5))
    # gun (pitch pivot at the trunnion)
    mant = loft("mantlet", [(1.25, 0, 1.75, 0.35, 0.28, 0.4), (1.55, 0, 1.75, 0.42, 0.32, 0.4), (1.8, 0, 1.75, 0.3, 0.25, 0.3)], armour, 32)
    barrel = loft("barrel", [(1.8, 0, 1.75, 0.11, 0.11, 0), (4.0, 0, 1.75, 0.095, 0.095, 0), (4.3, 0, 1.75, 0.13, 0.13, 0), (4.8, 0, 1.75, 0.13, 0.13, 0),
                             (5.05, 0, 1.75, 0.09, 0.09, 0), (6.3, 0, 1.75, 0.085, 0.085, 0)], armour, 24)
    brake = loft("muzzle", [(6.3, 0, 1.75, 0.12, 0.12, 0.2), (6.6, 0, 1.75, 0.12, 0.12, 0.2)], dark, 24)
    gun = join([mant, barrel, brake], "gun")
    set_origin(gun, (1.4, 0, 1.75))
    gun.parent = turret; gun.location = gun.location - turret.location
    # running gear
    def wheels(side):
        y = side * (W / 2 + 0.33)
        parts = []
        for k in range(5):
            x = -2.35 + k * 1.18
            w = prim("cylinder", "rw", rubber, radius=0.42, depth=0.5, vertices=40, rotation=(math.radians(90), 0, 0), location=(x, y, 0.45)); bevel(w, 0.03, 2)
            hub = prim("cylinder", "hub", armour, radius=0.3, depth=0.54, vertices=32, rotation=(math.radians(90), 0, 0), location=(x, y, 0.45)); bevel(hub, 0.03, 2)
            cap = prim("cylinder", "cap", dark, radius=0.1, depth=0.6, vertices=16, rotation=(math.radians(90), 0, 0), location=(x, y, 0.45))
            parts += [w, hub, cap]
        spr = prim("cylinder", "sprocket", dark, radius=0.38, depth=0.45, vertices=24, rotation=(math.radians(90), 0, 0), location=(-3.25, y, 0.85))
        idl = prim("cylinder", "idler", armour, radius=0.36, depth=0.45, vertices=32, rotation=(math.radians(90), 0, 0), location=(3.2, y, 0.8))
        parts += [spr, idl]
        for k in range(3):
            parts.append(prim("cylinder", "ret", rubber, radius=0.12, depth=0.4, vertices=20, rotation=(math.radians(90), 0, 0), location=(-1.8 + k * 1.6, y, 1.12)))
        o = join(parts, f"wheels_{'L' if side < 0 else 'R'}")
        return o
    wl, wr = wheels(-1), wheels(1)

    def track(side):
        """The belt: a loop round sprocket, return rollers, idler and under the road wheels; UV v runs along it."""
        y = side * (W / 2 + 0.33)
        path = [(-3.25, 1.23), (-1.8, 1.24), (0.0, 1.25), (1.6, 1.24), (3.2, 1.16), (3.55, 0.8), (3.1, 0.28), (2.35, 0.03), (-2.35, 0.03),
                (-3.1, 0.25), (-3.63, 0.85)]
        # densify the loop
        pts = []
        for i in range(len(path)):
            a, b = Vector((*path[i], 0)), Vector((*path[(i + 1) % len(path)], 0))
            n = max(2, int((b - a).length / 0.08))
            pts += [a.lerp(b, k / n) for k in range(n)]
        bm = bmesh.new()
        uvl = bm.loops.layers.uv.new()
        tot = sum((pts[(i + 1) % len(pts)] - pts[i]).length for i in range(len(pts)))
        acc, vs = 0.0, []
        for i, p in enumerate(pts):
            nx = pts[(i + 1) % len(pts)]
            tan = (nx - pts[i - 1]).normalized()
            nrm = Vector((tan.y, -tan.x, 0))  # outward for a clockwise loop
            for off, wy in ((0.0, -0.3), (0.0, 0.3), (0.07, 0.3), (0.07, -0.3)):
                q = p + nrm * off
                vs.append((bm.verts.new((q.x, y + wy, q.y)), acc / tot))
            acc += (nx - p).length
        N = len(pts)
        for i in range(N):
            j = (i + 1) % N
            for k in range(4):
                a, b = vs[i * 4 + k], vs[i * 4 + (k + 1) % 4]
                c, d = vs[j * 4 + (k + 1) % 4], vs[j * 4 + k]
                f = bm.faces.new([a[0], b[0], c[0], d[0]])
                v1 = d[1] if j else 1.0
                for lp, (u, v) in zip(f.loops, [(k / 4, a[1] * 4), ((k + 1) / 4, b[1] * 4), ((k + 1) / 4, v1 * 4), (k / 4, v1 * 4)]):
                    lp[uvl].uv = (u, v)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        o = obj_from_bm(f"track_{'L' if side < 0 else 'R'}", bm, trk)
        for p in o.data.polygons:
            p.use_smooth = False
        return o
    tl, tr = track(-1), track(1)
    for o in (wl, wr):
        set_origin(o, (0, o.location.y, 0))
    export(OUT / "tank.glb")


def apply_scale(o):
    bpy.context.view_layer.objects.active = o
    o.select_set(True)
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    o.select_set(False)


# ------------------------------------------------------------------ jets
def build_jet(name, swept=False):
    reset()
    if swept:
        skin = mat("skin", (0.72, 0.73, 0.74), 0.35, 0.85)
    else:
        skin = mat("skin", (1, 1, 1), 0.55, 0.3, img=image("camo", camo(11, [(0.66, 0.56, 0.38), (0.42, 0.33, 0.22), (0.47, 0.45, 0.3)])))
    glass = mat("glass", (0.08, 0.12, 0.16), 0.08, 0.9)
    dark = mat("nozzle", (0.12, 0.11, 0.1), 0.45, 0.85)
    burn = mat("burner", (1.0, 0.55, 0.2), 0.5, 0.0, emit=(1.0, 0.5, 0.15))
    Lf = 15.0
    st = [(Lf / 2, 0, 0, 0.02, 0.02, 0), (Lf / 2 - 0.9, 0, -0.02, 0.22, 0.24, 0), (Lf / 2 - 2.4, 0, 0.0, 0.42, 0.48, 0.1), (Lf / 2 - 4.0, 0, 0.05, 0.55, 0.6, 0.2),
          (0.0, 0, 0.05, 0.62, 0.66, 0.25), (-Lf / 2 + 2.5, 0, 0.05, 0.6, 0.62, 0.2), (-Lf / 2 + 0.6, 0, 0.05, 0.5, 0.5, 0.1), (-Lf / 2, 0, 0.05, 0.46, 0.46, 0.05)]
    if swept:
        st = [(Lf / 2, 0, 0, 0.5, 0.5, 0), (Lf / 2 - 0.3, 0, 0, 0.6, 0.62, 0), (Lf / 2 - 3.0, 0, 0.05, 0.68, 0.75, 0.1), (0.0, 0, 0.05, 0.7, 0.78, 0.15),
              (-Lf / 2 + 2.0, 0, 0.05, 0.55, 0.6, 0.1), (-Lf / 2, 0, 0.05, 0.45, 0.45, 0.05)]
    fus = loft("fuselage", st, skin, 40, cap=not swept)
    smooth(fus, 1)
    parts = [fus]
    if not swept:
        for s in (-1, 1):  # half-cone side intakes
            parts.append(loft(f"intake_{s}", [(2.6, s * 0.75, 0.0, 0.05, 0.3, 0.3), (2.3, s * 0.78, 0.0, 0.25, 0.38, 0.3), (-1.0, s * 0.62, 0.0, 0.22, 0.4, 0.3)], skin, 24))
    can = prim("uv_sphere", "canopy", glass, radius=1, segments=40, ring_count=20, location=(Lf / 2 - 3.4 if not swept else Lf / 2 - 3.2, 0, 0.55))
    can.scale = (1.3, 0.42, 0.42); apply_scale(can)
    parts.append(can)
    # wing with thickness: a delta (or swept) planform, thick at the root
    def wing(planform, z, thick, nm):
        bm = bmesh.new()
        top = [bm.verts.new((x, y, z + thick * (1 - abs(y) / 5.5))) for x, y in planform]
        bot = [bm.verts.new((x, y, z - thick * 0.6 * (1 - abs(y) / 5.5))) for x, y in planform]
        bm.faces.new(top); bm.faces.new(bot[::-1])
        n = len(planform)
        for i in range(n):
            bm.faces.new([top[i], bot[i], bot[(i + 1) % n], top[(i + 1) % n]])
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        o = obj_from_bm(nm, bm, skin); bevel(o, 0.03, 2, 30)
        return o
    if swept:
        for s in (-1, 1):
            parts.append(wing([(1.6, s * 0.65), (-0.4, s * 0.65), (-2.9, s * 4.8), (-2.0, s * 4.85)], -0.15, 0.13, f"wing_{s}"))
            parts.append(wing([(-5.3, s * 0.4), (-6.5, s * 0.4), (-7.3, s * 2.0), (-6.8, s * 2.05)], 0.35, 0.06, f"tail_{s}"))
        fin2 = extrude_profile("fin", [(-4.3, 0.55), (-7.3, 0.55), (-8.0, 3.1), (-7.1, 3.1)], 0.1, skin, y0=-0.05)
        bevel(fin2, 0.03, 2); parts.append(fin2)
    else:
        for s in (-1, 1):
            parts.append(wing([(2.2, s * 0.6), (-6.4, s * 0.6), (-6.6, s * 4.2), (-5.3, s * 4.25)], -0.2, 0.16, f"wing_{s}"))
        fin = extrude_profile("fin", [(-3.0, 0.55), (-7.3, 0.55), (-7.6, 3.2), (-6.4, 3.2)], 0.12, skin)
        bevel(fin, 0.03, 2); parts.append(fin)
    noz = loft("nozzle", [(-Lf / 2 + 0.05, 0, 0.05, 0.47, 0.47, 0), (-Lf / 2 - 0.5, 0, 0.05, 0.42, 0.42, 0)], dark, 32, cap=False)
    parts.append(noz)
    body = join(parts, "body")
    burner = prim("cylinder", "burner", burn, radius=0.38, depth=0.1, vertices=32, rotation=(0, math.radians(90), 0), location=(-Lf / 2 - 0.48, 0, 0.05))
    export(OUT / f"{name}.glb")


# ------------------------------------------------------------------ soldier
def build_soldier():
    reset()
    uniform = mat("uniform", (0.36, 0.36, 0.25), 0.9, 0.0)
    trousers = mat("trousers", (0.3, 0.3, 0.21), 0.9, 0.0)
    boots = mat("boots", (0.08, 0.06, 0.05), 0.7, 0.0)
    skinm = mat("skin", (0.55, 0.38, 0.27), 0.6, 0.0)
    helmet_m = mat("helmet", (0.28, 0.3, 0.2), 0.7, 0.1)
    metal = mat("metal", (0.1, 0.1, 0.1), 0.45, 0.8)
    wood = mat("wood", (0.33, 0.2, 0.1), 0.7, 0.0)
    # the body as a skin-modifier skeleton (z up, facing +x)
    V = {"pelvis": (0, 0, 1.0), "spine": (0, 0, 1.22), "chest": (0, 0, 1.42), "neck": (0, 0, 1.58), "head": (0, 0, 1.74),
         "l_sh": (0, 0.2, 1.48), "l_el": (0.18, 0.2, 1.18), "l_ha": (0.3, 0.02, 1.14), "r_sh": (0, -0.2, 1.48), "r_el": (-0.06, -0.27, 1.22), "r_ha": (0.05, -0.18, 1.1),
         "l_hip": (0, 0.1, 0.95), "l_kn": (0.02, 0.11, 0.52), "l_an": (0, 0.11, 0.1), "l_toe": (0.17, 0.11, 0.04),
         "r_hip": (0, -0.1, 0.95), "r_kn": (0.02, -0.11, 0.52), "r_an": (0, -0.11, 0.1), "r_toe": (0.17, -0.11, 0.04)}
    R = {"pelvis": 0.16, "spine": 0.15, "chest": 0.19, "neck": 0.06, "head": 0.11, "l_sh": 0.07, "l_el": 0.05, "l_ha": 0.045, "r_sh": 0.07, "r_el": 0.05, "r_ha": 0.045,
         "l_hip": 0.085, "l_kn": 0.065, "l_an": 0.05, "l_toe": 0.045, "r_hip": 0.085, "r_kn": 0.065, "r_an": 0.05, "r_toe": 0.045}
    E = [("pelvis", "spine"), ("spine", "chest"), ("chest", "neck"), ("neck", "head"), ("chest", "l_sh"), ("l_sh", "l_el"), ("l_el", "l_ha"),
         ("chest", "r_sh"), ("r_sh", "r_el"), ("r_el", "r_ha"), ("pelvis", "l_hip"), ("l_hip", "l_kn"), ("l_kn", "l_an"), ("l_an", "l_toe"),
         ("pelvis", "r_hip"), ("r_hip", "r_kn"), ("r_kn", "r_an"), ("r_an", "r_toe")]
    names = list(V)
    me = bpy.data.meshes.new("body")
    me.from_pydata([V[n] for n in names], [(names.index(a), names.index(b)) for a, b in E], [])
    body = bpy.data.objects.new("body", me); bpy.context.collection.objects.link(body)
    bpy.context.view_layer.objects.active = body; body.select_set(True)
    sk = body.modifiers.new("skin", "SKIN")
    for i, n in enumerate(names):
        body.data.skin_vertices[0].data[i].radius = (R[n], R[n] * (0.8 if n in ("chest", "pelvis", "spine") else 1))
    body.data.skin_vertices[0].data[0].use_root = True
    bpy.ops.object.skin_armature_create(modifier="skin")
    arm = [o for o in bpy.context.scene.objects if o.type == "ARMATURE"][0]
    sub = body.modifiers.new("sub", "SUBSURF"); sub.levels = 2
    # apply skin + subsurf (keep the armature modifier last)
    bpy.context.view_layer.objects.active = body
    for mname in ("skin", "sub"):
        bpy.ops.object.modifier_move_to_index(modifier=mname, index=0) if False else None
    bpy.ops.object.modifier_apply(modifier="skin")
    bpy.ops.object.modifier_apply(modifier="sub")
    for p in body.data.polygons:
        p.use_smooth = True
    # materials by region
    for m_ in (uniform, trousers, boots, skinm):
        body.data.materials.append(m_)
    for p in body.data.polygons:
        c = p.center
        p.material_index = 2 if c.z < 0.2 else 1 if c.z < 0.98 else 3 if (c.z > 1.62 or c.z < 1.02 and abs(c.y) > 0.22) else 0
        if 0.9 < c.z < 1.05 and abs(c.y) > 0.24:
            p.material_index = 3  # hands
    # helmet, webbing and rifle, parented to bones
    hel = prim("uv_sphere", "helmet", helmet_m, radius=0.135, segments=32, ring_count=16, location=(0, 0, 1.79)); hel.scale = (1.08, 1.0, 0.78); apply_scale(hel)
    bm = bmesh.new(); bm.from_mesh(hel.data)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.co.z < -0.02], context="VERTS"); bm.to_mesh(hel.data); bm.free()
    sol = hel.modifiers.new("sol", "SOLIDIFY"); sol.thickness = 0.012; apply_mods(hel)
    belt = prim("torus", "belt", boots, major_radius=0.16, minor_radius=0.025, location=(0, 0, 1.0)); belt.scale = (1, 1.15, 1); apply_scale(belt)
    pack = prim("cube", "pack", uniform, size=1); pack.scale = (0.12, 0.26, 0.3); pack.location = (-0.17, 0, 1.35); apply_scale(pack); bevel(pack, 0.03, 3)
    stock = prim("cube", "stock", wood, size=1); stock.scale = (0.3, 0.04, 0.07); stock.location = (0.0, -0.2, 1.12); apply_scale(stock); bevel(stock, 0.01, 2)
    rec = prim("cube", "receiver", metal, size=1); rec.scale = (0.28, 0.04, 0.06); rec.location = (0.28, -0.12, 1.16); apply_scale(rec)
    bar = prim("cylinder", "barrel", metal, radius=0.012, depth=0.5, vertices=12, rotation=(0, math.radians(90), 0), location=(0.66, -0.05, 1.18))
    mag = prim("cube", "mag", metal, size=1); mag.scale = (0.05, 0.03, 0.16); mag.location = (0.3, -0.12, 1.04); apply_scale(mag)
    rifle = join([stock, rec, bar, mag], "rifle")
    bones = arm.data.bones
    def bone_for(pt):
        best, bd = None, 1e9
        for b in bones:
            h, t = arm.matrix_world @ b.head_local, arm.matrix_world @ b.tail_local
            d = (Vector(pt) - (h + t) / 2).length
            if d < bd:
                best, bd = b.name, d
        return best
    for o, pt in ((hel, V["head"]), (belt, V["pelvis"]), (pack, V["chest"]), (rifle, V["r_ha"])):
        bpy.ops.object.select_all(action="DESELECT")
        o.select_set(True); arm.select_set(True); bpy.context.view_layer.objects.active = arm
        bpy.ops.object.mode_set(mode="POSE")
        arm.data.bones.active = arm.data.bones[bone_for(pt)]
        bpy.ops.object.parent_set(type="BONE", keep_transform=True)
        bpy.ops.object.mode_set(mode="OBJECT")
    # a run cycle and a walk cycle, keyed on the limb bones (24 fps, 1 s loop)
    def cycle(nm, amp_leg, amp_arm, lean, bounce):
        act = bpy.data.actions.new(nm)
        arm.animation_data_create(); arm.animation_data.action = act
        bpy.context.view_layer.objects.active = arm
        bpy.ops.object.mode_set(mode="POSE")
        pb = arm.pose.bones
        def near(pt):
            return pb[bone_for(pt)]
        legs = {"l": (near(((V["l_hip"][0] + V["l_kn"][0]) / 2, V["l_hip"][1], (V["l_hip"][2] + V["l_kn"][2]) / 2)), near(((V["l_kn"][0]), V["l_kn"][1], (V["l_kn"][2] + V["l_an"][2]) / 2))),
                "r": (near((0, V["r_hip"][1], (V["r_hip"][2] + V["r_kn"][2]) / 2)), near((0, V["r_kn"][1], (V["r_kn"][2] + V["r_an"][2]) / 2)))}
        arms = {"l": near((0, V["l_sh"][1] + 0.03, (V["l_sh"][2] + V["l_el"][2]) / 2)), "r": near((0, V["r_sh"][1] - 0.03, (V["r_sh"][2] + V["r_el"][2]) / 2))}
        spine = near((0, 0, (V["spine"][2] + V["chest"][2]) / 2))
        root = near((0, 0, (V["pelvis"][2] + V["spine"][2]) / 2))
        for f in range(0, 25, 2):
            ph = 2 * math.pi * f / 24
            for side, sg in (("l", 1), ("r", -1)):
                th, sh = legs[side]
                th.rotation_mode = sh.rotation_mode = "XYZ"
                th.rotation_euler = (0, -sg * amp_leg * math.sin(ph), 0)
                sh.rotation_euler = (0, amp_leg * 1.2 * max(0, math.sin(ph + sg * math.pi / 2 + 0.6)), 0)
                a = arms[side]; a.rotation_mode = "XYZ"
                a.rotation_euler = (0, sg * amp_arm * math.sin(ph) * (0.4 if side == "r" else 1), 0)  # the rifle arm swings less
                for b_ in (th, sh, a):
                    b_.keyframe_insert("rotation_euler", frame=f)
            spine.rotation_mode = "XYZ"; spine.rotation_euler = (0, lean, 0); spine.keyframe_insert("rotation_euler", frame=f)
            root.location = (0, bounce * abs(math.sin(ph)), 0); root.keyframe_insert("location", frame=f)
        bpy.ops.object.mode_set(mode="OBJECT")
        tr = arm.animation_data.nla_tracks.new(); tr.name = nm; tr.strips.new(nm, 0, act)
        arm.animation_data.action = None
    cycle("run", 0.75, 0.6, 0.25, 0.05)
    cycle("walk", 0.4, 0.3, 0.06, 0.02)
    # face +x -> three.js: we leave it facing +x; the edit rotates it
    export(OUT / "soldier.glb")


# ------------------------------------------------------------------ ships
def hull_stations(L, B, D, fine=1.0):
    """Ship hull sections from stern (-L/2) to bow (+L/2): (x, y, z, halfbeam, halfdepth, squareness)."""
    out = []
    for k in range(17):
        u = k / 16
        x = -L / 2 + u * L
        bow = max(0, (u - 0.72) / 0.28); stern = max(0, (0.12 - u) / 0.12)
        hb = B / 2 * (1 - bow ** (1.6 * fine)) * (1 - 0.35 * stern ** 2)
        sheer = 0.04 * L * (bow ** 2 + 0.5 * stern ** 2) / L * 8
        out.append((x, 0, D / 2 + sheer * 0.5, max(0.05, hb), D / 2 + sheer * 0.5, 0.75 - 0.6 * bow))
    return out


def build_ship(name, tanker=False):
    reset()
    hullm = mat("hull", (0.06, 0.06, 0.07), 0.55, 0.3)
    boot = mat("boottop", (0.45, 0.08, 0.06), 0.6, 0.1)
    deckm = mat("deck", (0.32, 0.27, 0.2), 0.85, 0.0)
    white = mat("super", (0.86, 0.85, 0.8), 0.6, 0.1)
    funnel = mat("funnel", (0.7, 0.45, 0.12), 0.5, 0.2)
    dark = mat("dark", (0.1, 0.1, 0.1), 0.5, 0.5)
    L, B, D = (170.0, 24.0, 13.0) if tanker else (140.0, 19.0, 11.0)
    hull = loft("hull", hull_stations(L, B, D), hullm, 36)
    smooth(hull, 1)
    for p in hull.data.polygons:  # red boot-top below the waterline (z < 4 m)
        if p.center.z < 4.2:
            p.material_index = 1
    hull.data.materials.append(boot)
    deck = loft("deck", [(x, 0, D + 0.3, max(0.05, hb - 0.4), 0.3, 0.9) for x, _, _, hb, _, _ in hull_stations(L, B, D)], deckm, 24)
    parts = [hull, deck]
    if tanker:
        sup = prim("cube", "super", white, size=1); sup.scale = (14, B * 0.8, 9); sup.location = (-L / 2 + 14, 0, D + 4.8); apply_scale(sup); bevel(sup, 0.3, 2); parts.append(sup)
        br = prim("cube", "bridge", white, size=1); br.scale = (8, B * 0.95, 3); br.location = (-L / 2 + 14, 0, D + 10.5); apply_scale(br); bevel(br, 0.2, 2); parts.append(br)
        win = prim("cube", "windows", dark, size=1); win.scale = (0.3, B * 0.9, 1.0); win.location = (-L / 2 + 18.1, 0, D + 10.6); apply_scale(win); parts.append(win)
        fn = loft("funnel", [(-L / 2 + 6, 0, D + 12, 2.6, 2.0, 0.3), (-L / 2 + 5.5, 0, D + 18, 2.4, 1.9, 0.3)], funnel, 24); parts.append(fn)
        for k in range(12):  # pipe runs and manifolds along the deck
            x = -L / 2 + 30 + k * 10
            p_ = prim("cylinder", "pipe", dark, radius=0.35, depth=10, vertices=12, rotation=(0, math.radians(90), 0), location=(x, 1.2, D + 1.0)); parts.append(p_)
            p2 = prim("cylinder", "pipe2", dark, radius=0.35, depth=10, vertices=12, rotation=(0, math.radians(90), 0), location=(x, -1.2, D + 1.0)); parts.append(p2)
        cw = prim("cube", "catwalk", deckm, size=1); cw.scale = (L - 40, 1.4, 0.3); cw.location = (5, 0, D + 2.4); apply_scale(cw); parts.append(cw)
    else:
        for k, x in enumerate((-35, -12, 12, 34, 52)):
            h_ = prim("cube", "hatch", deckm, size=1); h_.scale = (11, B * 0.55, 1.4); h_.location = (x, 0, D + 1.0); apply_scale(h_); bevel(h_, 0.15, 2); parts.append(h_)
        for x in (-24, 0, 44):  # kingposts and derricks
            for s in (-1, 1):
                kp = prim("cylinder", "kingpost", white, radius=0.45, depth=12, vertices=16, location=(x, s * 3.0, D + 6)); parts.append(kp)
                dr = prim("cylinder", "derrick", dark, radius=0.2, depth=13, vertices=10, location=(x + 5, s * 3.0, D + 4), rotation=(0, math.radians(-62), 0)); parts.append(dr)
        sup = prim("cube", "super", white, size=1); sup.scale = (18, B * 0.82, 6); sup.location = (-L / 2 + 40, 0, D + 3.4); apply_scale(sup); bevel(sup, 0.3, 2); parts.append(sup)
        br = prim("cube", "bridge", white, size=1); br.scale = (9, B * 0.9, 3.2); br.location = (-L / 2 + 44, 0, D + 7.9); apply_scale(br); bevel(br, 0.2, 2); parts.append(br)
        win = prim("cube", "windows", dark, size=1); win.scale = (0.3, B * 0.85, 1.0); win.location = (-L / 2 + 48.6, 0, D + 8.1); apply_scale(win); parts.append(win)
        fn = loft("funnel", [(-L / 2 + 34, 0, D + 6, 3.0, 2.4, 0.3), (-L / 2 + 33, 0, D + 13, 2.8, 2.2, 0.3)], funnel, 24); parts.append(fn)
        fb = prim("cylinder", "funnelband", dark, radius=3.1, depth=1.2, vertices=24, location=(-L / 2 + 33.2, 0, D + 12.5)); fb.scale = (1, 0.8, 1); apply_scale(fb); parts.append(fb)
        mast = prim("cylinder", "mast", white, radius=0.3, depth=16, vertices=10, location=(L / 2 - 14, 0, D + 8)); parts.append(mast)
    join(parts, "ship")
    export(OUT / f"{name}.glb")


if __name__ == "__main__":
    build_tank()
    build_jet("jet")
    build_jet("mig", swept=True)
    build_soldier()
    build_ship("ship")
    build_ship("tanker", tanker=True)
