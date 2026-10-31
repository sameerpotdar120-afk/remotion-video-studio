"""The Sikkim video's Blender shots, each timed to its VO line (30 fps). Same world as sikkim_landslide.py and
tunnel7.py: the code-built Teesta gorge with CC0 forest and textures, the real DEM backdrop.

    blender -b -P tools/blender/shots.py -- <out_dir> --shot gorge --trees <island_tree_02_1k.blend>

Shots (VO times from public/sikkim/vo_words.json):
  gorge    line 6, 30.00-35.06 s  "ज़मीन सीधी ऊपर उठती है, और बीच में गहरी घाटियाँ हैं": flying up the real Teesta gorge between
           its walls, then a crane up over the rim to look down into it
  xray     line 7, 35.06-40.40 s  "इसलिए यहाँ रेलवे पहाड़ के ऊपर से नहीं, पहाड़ के अंदर से बनाई जा रही है": the real alignment
           glows along the valley; a red line over the ridge draws and dies ("ऊपर से नहीं"); the hill turns see-through and
           the line runs inside it ("अंदर से")
"""
import math
import sys
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
import sikkim_landslide as L  # noqa: E402

FPS = 30
SHOT = L.arg("--shot", 1, "gorge")
SHOTS = {"gorge": (30.0, 35.06), "xray": (35.06, 40.4)}
T0, T1 = SHOTS[SHOT]
FRAMES = int(round((T1 - T0) * FPS))
L.FRAMES, L.PRE, L.FPS = FRAMES, 0, FPS


def F(t):
    """VO time (s) to a frame of this shot."""
    return max(1, int(round((t - T0) * FPS)) + 1)


def world(rocks=False):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    terr = L.build_terrain()
    terr.data.materials.append(L.mat_terrain())
    leaf, bark = L.mat_leaf(), L.mat_simple("bark", (0.06, 0.045, 0.03), 0.9)
    L.build_forest(terr, leaf, bark)
    L.build_structures(None)
    rmat = L.mat_rock()
    L.build_scree(terr, rmat)
    L.build_backdrop()
    L.build_clouds()
    L.build_world()
    L.build_camera()
    L.setup_render(1.0, 20)
    return terr


def keys(points):
    """Camera keys: (frame, position, look-at, lens), eased."""
    sc = bpy.context.scene
    co, tgt = sc.camera, bpy.data.objects["CamTarget"]
    co.animation_data_clear()
    tgt.animation_data_clear()
    co.data.animation_data_clear()
    for f, p, l, lens in points:
        co.location = p
        co.keyframe_insert("location", frame=f)
        tgt.location = l
        tgt.keyframe_insert("location", frame=f)
        co.data.lens = lens
        co.data.keyframe_insert("lens", frame=f)
    for ob in (co, tgt, co.data):
        for fc in ob.animation_data.action.fcurves:
            for k in fc.keyframe_points:
                k.interpolation = "BEZIER"
                k.easing = "AUTO"
    for i in range(3):
        fc = co.animation_data.action.fcurves.find("location", index=i)
        m = fc.modifiers.new("NOISE")
        m.scale = 34
        m.strength = 0.3
        m.offset = 23.0 * (i + 1)


# ---------------------------------------------------------------- line 6: the gorge (the real Teesta, below Teesta Bazar)
def shot_gorge():
    import teesta_world as TW
    L.UNDERGROWTH, L.TREE_GAP, L.TREE_SCALE = 0.0, 4.6, 1.35
    _, path = TW.build((-3700.0, -500.0, -1900.0, 2600.0))

    def on_river(y, up):
        """A point over the river at northing y, `up` metres above it: the lowest ground across the valley there."""
        k = np.argmin(np.abs(path[:, 1] - y))
        xs = np.linspace(path[k, 0] - 1500, path[k, 0] + 1500, 601)
        z = TW.h_at(xs, np.full_like(xs, y))
        i = int(np.argmin(z))
        return (float(xs[i]), float(y), float(z[i]) + up)

    # just above Teesta Bazar the gorge is 500-600 m deep within 1.2 km on both sides
    a, ah = on_river(-650.0, 140.0), on_river(1300.0, 380.0)
    b, bh = on_river(-480.0, 260.0), on_river(1300.0, 780.0)
    c, cl = on_river(-250.0, 0.0), on_river(650.0, 0.0)
    c = (c[0] + 160.0, c[1], 1080.0)
    keys([
        (F(30.0), a, ah, 20.0),        # low in the gorge, flying up the Teesta, walls on both sides
        (F(32.4), b, bh, 20.0),        # "सीधी ऊपर उठती है": tilting up the wall ahead
        (F(35.06), c, cl, 22.0),       # "गहरी घाटियाँ": craned up over the rim, looking down into it
    ])


# ---------------------------------------------------------------- line 7: over the hill, no; through it
CYAN, RED = (0.22, 0.95, 0.92), (1.0, 0.22, 0.12)


def glow_mat(name, col, strength):
    m, nt = L.node_mat(name)
    out, em = nt.nodes.new("ShaderNodeOutputMaterial"), nt.nodes.new("ShaderNodeEmission")
    em.inputs["Color"].default_value = (*col, 1)
    em.inputs["Strength"].default_value = strength
    nt.links.new(em.outputs[0], out.inputs[0])
    return m, em


def tube(name, pts, radius, mat):
    cu = bpy.data.curves.new(name, "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = radius
    cu.bevel_resolution = 3
    cu.use_fill_caps = True
    sp = cu.splines.new("POLY")
    sp.points.add(len(pts) - 1)
    for p, q in zip(sp.points, pts):
        p.co = (*q, 1)
    ob = bpy.data.objects.new(name, cu)
    bpy.context.scene.collection.objects.link(ob)
    cu.materials.append(mat)
    ob.visible_shadow = False
    return ob


def key_value(sock, frames_values):
    for f, v in frames_values:
        sock.default_value = v
        sock.keyframe_insert("default_value", frame=f)


def xray_materials(centre, radius, xr_keys):
    """Every surface within `radius` of `centre` fades to a see-through cyan shell (terrain) or to nothing (trees),
    by a factor keyed over the shot."""
    for m in bpy.data.materials:
        if m.name != "terrain" or not m.use_nodes:
            continue
        nt = m.node_tree
        out = next((n for n in nt.nodes if n.type == "OUTPUT_MATERIAL" and n.is_active_output), None)
        if out is None or not out.inputs["Surface"].links:
            continue
        src = out.inputs["Surface"].links[0].from_socket
        N = nt.nodes.new
        geo = N("ShaderNodeNewGeometry")
        d = N("ShaderNodeVectorMath")
        d.operation = "DISTANCE"
        d.inputs[1].default_value = centre
        nt.links.new(geo.outputs["Position"], d.inputs[0])
        mr = N("ShaderNodeMapRange")
        mr.inputs["From Min"].default_value = radius
        mr.inputs["From Max"].default_value = radius * 0.72
        nt.links.new(d.outputs["Value"], mr.inputs["Value"])
        xv = N("ShaderNodeValue")
        xv.label = "xray"
        key_value(xv.outputs[0], xr_keys)
        mul = N("ShaderNodeMath")
        mul.operation = "MULTIPLY"
        nt.links.new(mr.outputs[0], mul.inputs[0])
        nt.links.new(xv.outputs[0], mul.inputs[1])
        tr = N("ShaderNodeBsdfTransparent")
        if m.name == "terrain":
            # a faint shell: transparent, with a cyan rim where the surface turns away
            lw = N("ShaderNodeLayerWeight")
            lw.inputs["Blend"].default_value = 0.5
            gn = N("ShaderNodeNewGeometry")
            nt.links.new(gn.outputs["True Normal"], lw.inputs["Normal"])
            pw = N("ShaderNodeMath")
            pw.operation = "POWER"
            pw.inputs[1].default_value = 2.0
            nt.links.new(lw.outputs["Facing"], pw.inputs[0])
            ad = N("ShaderNodeMath")
            ad.operation = "MULTIPLY_ADD"
            ad.inputs[1].default_value = 0.55
            ad.inputs[2].default_value = 0.18
            nt.links.new(pw.outputs[0], ad.inputs[0])
            em = N("ShaderNodeEmission")
            em.inputs["Color"].default_value = (*CYAN, 1)
            em.inputs["Strength"].default_value = 0.9
            sh = N("ShaderNodeMixShader")
            nt.links.new(ad.outputs[0], sh.inputs[0])
            nt.links.new(tr.outputs[0], sh.inputs[1])
            nt.links.new(em.outputs[0], sh.inputs[2])
            ghost = sh.outputs[0]
        else:
            ghost = tr.outputs[0]
        mx = N("ShaderNodeMixShader")
        nt.links.new(mul.outputs[0], mx.inputs[0])
        nt.links.new(src, mx.inputs[1])
        nt.links.new(ghost, mx.inputs[2])
        nt.links.new(mx.outputs[0], out.inputs["Surface"])


def shot_xray():
    import teesta_world as TW
    L.UNDERGROWTH, L.TREE_GAP, L.TREE_SCALE = 0.0, 4.6, 1.35
    _, path = TW.build((-3700.0, -500.0, -1900.0, 2600.0))
    # the river through the deep stretch, and the line 350 m inside the west wall, 70 m above the water
    ys = np.linspace(-1600.0, 2400.0, 161)
    riv = []
    for y in ys:
        k = np.argmin(np.abs(path[:, 1] - y))
        xs = np.linspace(path[k, 0] - 1500, path[k, 0] + 1500, 601)
        z = TW.h_at(xs, np.full_like(xs, y))
        i = int(np.argmin(z))
        riv.append((xs[i], y, z[i]))
    riv = np.array(riv)
    k = np.ones(9) / 9
    for j in (0, 2):
        riv[:, j] = np.convolve(np.pad(riv[:, j], 4, mode="edge"), k, "valid")
    inside = np.stack([riv[:, 0] - 350.0, riv[:, 1], riv[:, 2] + 70.0], 1)
    # where the line runs open along the bank first, then into the hill
    gm, gem = glow_mat("glow_cyan", CYAN, 18.0)
    line = tube("RailLine", [tuple(p) for p in inside], 10.0, gm)
    key_value_prop(line.data, "bevel_factor_end", [(F(35.06), 0.0), (F(36.3), 0.0), (F(39.6), 1.0)])
    # over the ridge: straight across the spur along the line's direction, hugging the ground 15 m up
    a, b = inside[40], inside[100]
    over = []
    for t in np.linspace(0, 1, 90):
        x, y = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
        over.append((x, y, float(TW.h_at(x, y)) + 18.0))
    rm, rem = glow_mat("glow_red", RED, 22.0)
    ov = tube("OverRidge", over, 6.0, rm)
    key_value_prop(ov.data, "bevel_factor_end", [(F(36.44), 0.0), (F(37.5), 1.0)])
    key_value(rem.inputs["Strength"], [(F(37.5), 22.0), (F(37.75), 40.0), (F(38.1), 0.0)])
    key_value_prop(ov, "hide_render", [(F(35.06), False), (F(38.1), True)])
    centre = tuple(float(v) for v in inside[70])
    xray_materials(centre, 900.0, [(F(35.06), 0.0), (F(38.18), 0.0), (F(39.0), 0.9)])
    # high on the east side, looking across at the west wall; drifting round and in
    # trees inside the hill vanish in a growing sphere as it turns to glass
    mod = bpy.data.objects["Terrain"].modifiers["Forest"]
    ids = {it.name: it.identifier for it in mod.node_group.interface.items_tree if getattr(it, "in_out", "") == "INPUT"}
    mod[ids["Clear Centre"]] = centre
    for f, r in ((F(35.06), 0.0), (F(38.18), 0.0), (F(39.0), 900.0)):
        mod[ids["Clear Radius"]] = r
        mod.keyframe_insert(f'["{ids["Clear Radius"]}"]', frame=f)
    c0 = (centre[0] + 1150.0, centre[1] - 1500.0, 1650.0)
    c1 = (centre[0] + 900.0, centre[1] - 1050.0, 1350.0)
    look = (centre[0] - 50.0, centre[1] + 250.0, centre[2] + 60.0)
    keys([(F(35.06), c0, look, 26.0), (F(40.4), c1, (look[0], look[1], look[2] - 40.0), 28.0)])


def key_value_prop(idb, prop, frames_values):
    for f, v in frames_values:
        setattr(idb, prop, v)
        idb.keyframe_insert(prop, frame=f)


if __name__ == "__main__":
    {"gorge": shot_gorge, "xray": shot_xray}[SHOT]()
    if SHOT in ("gorge", "xray"):
        L.add_aerial_haze(depth=14000.0, amount=0.85, power=1.15)
    else:
        L.add_aerial_haze()
    out = L.OUT
    bpy.ops.wm.save_as_mainfile(filepath=str(out / f"{SHOT}.blend"))
    print("SAVED", out / f"{SHOT}.blend", "frames", FRAMES, flush=True)
