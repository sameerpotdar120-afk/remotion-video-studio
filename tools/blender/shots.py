"""The Sikkim video's Blender shots, each timed to its VO line (30 fps). Same world as sikkim_landslide.py and
tunnel7.py: the code-built Teesta gorge with CC0 forest and textures, the real DEM backdrop.

    blender -b -P tools/blender/shots.py -- <out_dir> --shot gorge --trees <island_tree_02_1k.blend>

Shots (VO times from public/sikkim/vo_words.json):
  gorge    line 6, 30.00-35.06 s  "ज़मीन सीधी ऊपर उठती है, और बीच में गहरी घाटियाँ हैं": flying up the real Teesta gorge between
           its walls, then a crane up over the rim to look down into it
  xray     line 7, 35.06-40.40 s  "इसलिए यहाँ रेलवे पहाड़ के ऊपर से नहीं, पहाड़ के अंदर से बनाई जा रही है": the real alignment
           glows along the valley; a red line over the ridge draws and dies ("ऊपर से नहीं"); the hill turns see-through and
           the line runs inside it ("अंदर से")
  bore     line 12, 76.30-81.18 s "यानी सुरंग में इंजीनियर्स की एक छोटी सी ग़लती भी बहुत भारी पड़ सकती है": inside a tunnel being
           dug: shotcrete, steel ribs, the vent duct, string lights, a drill rig at the face in dusty air; on "भारी पड़"
           stones drop from the crown
  station  line 13, 91.60-95.38 s "रंगपो में सिक्किम का पहला रेलवे स्टेशन शुरू हो सकता है": a station on a terrace above the Teesta
           at dusk, Sikkimese tiered roofs, its lamps and windows coming on one after another (an illustration, not the
           real building's design)
  train    line 14, 95.38-101.84 s "पर हर इंच बहुत सावधानी से बनाना होगा, क्योंकि हिमालय ग़लतियाँ माफ़ नहीं करता": golden evening;
           a train's lamps grow in the Tunnel 7 portal, it rolls out along the bench, the camera pulls back over the valley
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
SHOTS = {"gorge": (30.0, 35.06), "xray": (35.06, 40.4), "train": (95.38, 101.84), "station": (91.6, 95.38), "bore": (76.3, 81.18)}
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


# ---------------------------------------------------------------- line 14: a train comes out of the tunnel
def train_mats():
    def paint(name, lower, upper, band):
        m, nt = L.node_mat(name)
        N = nt.nodes.new
        out, bs = N("ShaderNodeOutputMaterial"), N("ShaderNodeBsdfPrincipled")
        tc = N("ShaderNodeTexCoord")
        sep = N("ShaderNodeSeparateXYZ")
        nt.links.new(tc.outputs["Object"], sep.inputs[0])
        # local z runs -0.5..0.5 over the body's height: lower colour, a thin band, upper colour, dark windows
        c0 = N("ShaderNodeValToRGB")
        nt.links.new(sep.outputs[2], c0.inputs[0])
        el = c0.color_ramp.elements
        el[0].position, el[0].color = 0.0, (*lower, 1)
        el[1].position, el[1].color = 0.0, (*lower, 1)
        c0.color_ramp.interpolation = "CONSTANT"
        e = el.new(0.0)
        for pos, col in ((-0.08 + 0.5, band), (-0.03 + 0.5, upper)):
            k = el.new(pos)
            k.color = (*col, 1)
        e.position = 0.0
        e.color = (*lower, 1)
        nt.links.new(c0.outputs[0], bs.inputs["Base Color"])
        bs.inputs["Roughness"].default_value = 0.32
        bs.inputs["Coat Weight"].default_value = 0.4
        nt.links.new(bs.outputs[0], out.inputs[0])
        return m
    return {
        "loco": paint("loco_paint", (0.42, 0.05, 0.035), (0.78, 0.76, 0.72), (0.9, 0.62, 0.1)),
        "coach": paint("coach_paint", (0.30, 0.05, 0.04), (0.62, 0.6, 0.57), (0.85, 0.85, 0.82)),
        "glass": L.mat_simple("train_glass", (0.02, 0.025, 0.03), 0.05),
        "under": L.mat_simple("train_under", (0.035, 0.033, 0.03), 0.7, metal=0.6),
        "roof": L.mat_simple("train_roof", (0.32, 0.32, 0.31), 0.45, metal=0.3),
    }


def car_mesh(name, length, loco, mats):
    import bmesh
    from mathutils import Matrix
    W, H = 3.2, 3.9
    bm = bmesh.new()
    res = bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.scale(bm, vec=(length, W, H), verts=res["verts"])
    if loco:
        # a sloped cab nose at +x
        for v in res["verts"]:
            if v.co.x > 0 and v.co.z > 0:
                v.co.x -= 1.4
    bmesh.ops.bevel(bm, geom=bm.edges[:], offset=0.32, segments=3, affect="EDGES")
    for f in bm.faces:
        f.material_index = 0
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(mats["loco" if loco else "coach"])
    me.polygons.foreach_set("use_smooth", np.ones(len(me.polygons), bool))
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    # window strip, roof, bogies (separate pieces parented to the body)
    parts = [("win", (length - 2.2 if not loco else 2.2, W + 0.02, 0.85), (0 if not loco else length / 2 - 2.6, 0, 0.55), "glass"),
             ("roof", (length - 0.6, W - 0.5, 0.35), (-0.3 if loco else 0, 0, H / 2 + 0.05), "roof"),
             ("bogieA", (3.4, W - 0.6, 0.9), (length / 2 - 3.2, 0, -H / 2 - 0.35), "under"),
             ("bogieB", (3.4, W - 0.6, 0.9), (-length / 2 + 3.2, 0, -H / 2 - 0.35), "under"),
             ("skirt", (length - 1.0, W - 0.3, 0.45), (0, 0, -H / 2 + 0.05), "under")]
    for nm, dim, off, mk in parts:
        bm = bmesh.new()
        bmesh.ops.create_cube(bm, size=1, matrix=Matrix.Translation(off) @ Matrix.Diagonal((*dim, 1)))
        pm = bpy.data.meshes.new(name + nm)
        bm.to_mesh(pm)
        bm.free()
        pm.materials.append(mats[mk])
        po = bpy.data.objects.new(name + nm, pm)
        bpy.context.scene.collection.objects.link(po)
        po.parent = ob
    if loco:
        # headlights: two warm-white lamps and the light they throw
        for dy in (-0.9, 0.9):
            lm, em = glow_mat("glow_head", (1.0, 0.92, 0.75), 60.0)
            bm = bmesh.new()
            bmesh.ops.create_uvsphere(bm, u_segments=12, v_segments=8, radius=0.22,
                                      matrix=Matrix.Translation((length / 2 + 0.02, dy, -0.6)))
            hm = bpy.data.meshes.new(name + "lamp")
            bm.to_mesh(hm)
            bm.free()
            hm.materials.append(lm)
            ho = bpy.data.objects.new(name + "lamp", hm)
            bpy.context.scene.collection.objects.link(ho)
            ho.parent = ob
        sp = bpy.data.lights.new("HeadBeam", "SPOT")
        sp.energy = 60000
        sp.spot_size = math.radians(38)
        sp.spot_blend = 0.6
        sp.color = (1.0, 0.9, 0.72)
        so = bpy.data.objects.new("HeadBeam", sp)
        bpy.context.scene.collection.objects.link(so)
        so.parent = ob
        so.location = (length / 2 + 0.4, 0, -0.3)
        so.rotation_euler = (0, math.radians(95), 0)
    return ob, H


def shot_train():
    import tunnel7 as T7
    L.FRAMES = FRAMES
    L.SCAR_D0, L.SCAR_D1 = 3000.0, 3001.0  # no slide scar in the ending: the slope has healed
    L.CLEAR_BAND = (57.0, 73.0, -75.0)      # trees right down to the bench, cleared only on it
    bpy.ops.wm.read_factory_settings(use_empty=True)
    terr = L.build_terrain()
    terr.data.materials.append(L.mat_terrain())
    leaf, bark = L.mat_leaf(), L.mat_simple("bark", (0.06, 0.045, 0.03), 0.9)
    L.build_forest(terr, leaf, bark)
    L.build_structures(None)
    yc = T7.build_rail_and_portal()
    T7.build_wall(yc)
    # a longer bore so the lamps can be seen coming from deep inside
    for mn in ("portal_concrete", "wall_blocks"):
        bs = next(n for n in bpy.data.materials[mn].node_tree.nodes if n.type == "BSDF_PRINCIPLED")
        if bs.inputs["Base Color"].links:
            r = bs.inputs["Base Color"].links[0].from_node
            for e in getattr(getattr(r, "color_ramp", None), "elements", []):
                e.color = (e.color[0] * 0.62, e.color[1] * 0.6, e.color[2] * 0.58, 1)
    tube = bpy.data.objects["Tube"].data
    back = T7.PORTAL_X - 2.2
    for v in tube.vertices:
        v.co.x = back + (v.co.x - back) * 4.0
    L.build_scree(terr, L.mat_rock())
    L.build_backdrop()
    L.build_clouds()
    L.argv += ["--sundir", "0.78", "-0.5", "0.24"]
    L.build_world()
    sun = bpy.data.lights["Sun"]
    sun.energy, sun.color = 4.2, (1.0, 0.72, 0.46)  # golden hour
    L.build_camera()
    L.setup_render(1.0, 20)
    # the train: a locomotive and eight coaches, rolling east out of the portal along the bench
    mats = train_mats()
    rail_top = T7.BENCH_Z + 0.71
    cars = []
    x = 0.0
    for i in range(9):
        loco = i == 0
        ln = 20.5 if loco else 23.0
        ob, Hc = car_mesh(f"Car{i}", ln, loco, mats)
        cars.append((ob, x - ln / 2))
        x -= ln + 1.2
    head = [(F(95.38), T7.PORTAL_X - 70.0), (F(96.3), T7.PORTAL_X - 30.0), (F(101.84), T7.PORTAL_X + 120.0)]
    for ob, off in cars:
        for f, hx in head:
            ob.location = (hx + off, yc, rail_top + 1.15 + Hc / 2)
            ob.keyframe_insert("location", frame=f)
        for fc in ob.animation_data.action.fcurves:
            for k in fc.keyframe_points:
                k.interpolation = "LINEAR"
    P = T7.PORTAL_X
    keys([
        (F(95.38), (P + 34.0, yc - 13.0, T7.BENCH_Z + 4.0), (P - 4.0, yc + 1.0, T7.BENCH_Z + 4.5), 32.0),     # at the portal, lamps growing
        (F(97.7), (P + 46.0, yc - 22.0, T7.BENCH_Z + 9.0), (P + 10.0, yc, T7.BENCH_Z + 3.5), 30.0),           # it rolls past
        (F(101.84), (P + 150.0, yc - 150.0, T7.BENCH_Z + 75.0), (P + 30.0, yc + 30.0, T7.BENCH_Z + 12.0), 28.0),  # pulled back over the valley
    ])


# ---------------------------------------------------------------- line 13: Rangpo, a first station at dusk
def box(name, size, loc, mat, bevel=0.0):
    import bmesh
    from mathutils import Matrix
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1, matrix=Matrix.Translation(loc) @ Matrix.Diagonal((*size, 1)))
    if bevel:
        bmesh.ops.bevel(bm, geom=bm.edges[:], offset=bevel, segments=2, affect="EDGES")
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def tier_roof(name, cx, cy, z, w, d, h, eave, mat):
    """A hipped roof with a deep overhang: a four-sided frustum, wider at the eaves."""
    import bmesh
    bm = bmesh.new()
    a = [bm.verts.new((cx + sx * (w / 2 + eave), cy + sy * (d / 2 + eave), z)) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    t = [bm.verts.new((cx + sx * w * 0.18, cy + sy * d * 0.12, z + h)) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    for i in range(4):
        bm.faces.new((a[i], a[(i + 1) % 4], t[(i + 1) % 4], t[i]))
    bm.faces.new(t)
    bm.faces.new(list(reversed(a)))
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.materials.append(mat)
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    return ob


def warm_glow(name, strength_keys, col=(1.0, 0.72, 0.38)):
    m, em = glow_mat(name, col, 0.0)
    key_value(em.inputs["Strength"], strength_keys)
    return m


def shot_station():
    import tunnel7 as T7
    L.SCAR_D0, L.SCAR_D1 = 3000.0, 3001.0
    X0, X1, DB = 90.0, 330.0, 98.0  # the station terrace: along the bench, widened back into the hill to DB
    L.CLEAR_BAND = (44.0, DB + 6.0, -75.0)
    h_bench = L.height

    def height_st(x, y):
        z, d, dn, scar = h_bench(x, y)
        on = L.sstep(X0 - 25, X0, x) * (1 - L.sstep(X1, X1 + 25, x))
        terr = np.where((d >= T7.BENCH_D0) & (d <= DB), T7.BENCH_Z,
                        np.where(d > DB, np.minimum(z, T7.BENCH_Z + (d - DB) * 1.4), z))
        return z + (terr - z) * on, d, dn, scar

    L.height = height_st
    bpy.ops.wm.read_factory_settings(use_empty=True)
    terr = L.build_terrain()
    terr.data.materials.append(L.mat_terrain())
    leaf, bark = L.mat_leaf(), L.mat_simple("bark", (0.06, 0.045, 0.03), 0.9)
    L.build_forest(terr, leaf, bark)
    L.build_structures(None)
    yc = T7.build_rail_and_portal()
    L.build_backdrop()
    L.build_clouds()
    L.argv += ["--sundir", "0.55", "-0.8", "-0.02"]  # the sun just down behind the far ridges
    L.build_world()
    sun = bpy.data.lights["Sun"]
    sun.energy, sun.color = 0.25, (1.0, 0.55, 0.35)
    bg = next(n for n in bpy.context.scene.world.node_tree.nodes if n.type == "BACKGROUND")
    bg.inputs[1].default_value = 0.6
    L.build_camera()
    L.setup_render(1.0, 20)
    bpy.context.scene.view_settings.exposure = 1.3
    Z = T7.BENCH_Z
    yd = T7.yd
    wall = L.mat_simple("st_wall", (0.78, 0.72, 0.6), 0.7, noise_scale=1.5)
    maroon = L.mat_simple("st_maroon", (0.32, 0.06, 0.05), 0.6)
    roofm = L.mat_simple("st_roof", (0.08, 0.22, 0.16), 0.5)
    gold = L.mat_simple("st_gold", (0.8, 0.55, 0.15), 0.3, metal=1.0)
    plat = L.mat_simple("st_platform", (0.42, 0.4, 0.37), 0.8, noise_scale=3.0)
    sign = L.mat_simple("st_sign", (0.9, 0.86, 0.75), 0.6)
    # platform along the track, canopy on posts
    py = yd(72.5)
    box("Platform", (200, 9.0, 1.0), (210, py, Z + 0.5), plat)
    box("PlatformEdge", (200, 0.5, 0.12), (210, yd(68.1), Z + 1.05), L.mat_simple("st_edge", (0.85, 0.72, 0.1), 0.6))
    box("Canopy", (150, 8.0, 0.35), (215, py, Z + 6.2), roofm, bevel=0.1)
    for i in range(16):
        box(f"Post{i}", (0.3, 0.3, 5.2), (145 + i * 9.5, py + 2.8, Z + 3.6), maroon)
    # the station building: two storeys, maroon base and cream walls, tiered green roofs, a central tower
    by = yd(88.0)
    box("StationBase", (64, 13, 2.2), (215, by, Z + 1.1), maroon)
    box("StationBody", (62, 12, 7.5), (215, by, Z + 5.9), wall)
    box("StationTower", (14, 13, 6.0), (215, by, Z + 12.5), wall)
    tier_roof("RoofLow", 215, by, Z + 9.6, 62, 12, 3.4, 2.6, roofm)
    tier_roof("RoofTower", 215, by, Z + 15.5, 14, 13, 3.6, 2.4, roofm)
    tier_roof("RoofTop", 215, by, Z + 19.3, 6, 6, 2.6, 1.6, roofm)
    box("Finial", (0.6, 0.6, 2.2), (215, by, Z + 22.8), gold)
    box("Sign", (12, 0.3, 1.6), (215, by - 6.3, Z + 10.4), sign)
    # windows and lamps come on one after another (the station waking up)
    for i in range(12):
        x = 187 + i * 5.1
        f_on = F(92.5) + i * 3
        wm = warm_glow(f"glow_win{i}", [(F(91.6), 0.0), (f_on, 0.0), (f_on + 6, 7.0)])
        box(f"Win{i}", (2.4, 0.2, 2.6), (x, by - 6.05, Z + 5.4), wm)
        if i % 2 == 0:
            box(f"WinU{i}", (2.0, 0.2, 2.0), (x + 2.5, by - 6.05, Z + 12.6 if 210 < x < 222 else Z + 8.6), wm)
    for i in range(12):
        x = 150 + i * 12.5
        f_on = F(92.9) + i * 2
        lm = warm_glow(f"glow_lamp{i}", [(F(91.6), 0.0), (f_on, 0.0), (f_on + 4, 30.0)], (1.0, 0.8, 0.55))
        box(f"Lamp{i}", (1.6, 0.5, 0.25), (x, py, Z + 5.85), lm)
        pl = bpy.data.lights.new(f"PlatLamp{i}", "POINT")
        pl.color = (1.0, 0.78, 0.5)
        pl.shadow_soft_size = 0.4
        po = bpy.data.objects.new(f"PlatLamp{i}", pl)
        po.location = (x, py, Z + 5.4)
        bpy.context.scene.collection.objects.link(po)
        for f, e in ((F(91.6), 0.0), (f_on, 0.0), (f_on + 4, 1100.0)):
            pl.energy = e
            pl.keyframe_insert("energy", frame=f)
    # a slow push along the platform toward the building, a little rise
    keys([
        (F(91.6), (318.0, yd(58.0), Z + 7.0), (220.0, by, Z + 9.0), 30.0),
        (F(95.38), (290.0, yd(56.0), Z + 10.0), (214.0, by, Z + 10.0), 32.0),
    ])


# ---------------------------------------------------------------- line 12: inside the bore
def shot_bore():
    import bmesh
    from mathutils import Matrix
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    R, LEN = 4.6, 140.0  # horseshoe radius, length (the face at y = LEN)
    # the lining: a horseshoe section swept along y (arch + straight walls + floor), faces inward
    prof = [(R * math.cos(a), R * math.sin(a) + 2.2) for a in np.linspace(0, math.pi, 25)]
    prof = [(R, 0.0)] + prof + [(-R, 0.0)]
    bm = bmesh.new()
    rows = []
    for j, y in enumerate(np.linspace(0, LEN, 141)):
        rows.append([bm.verts.new((x, y, z)) for x, z in prof])
    for j in range(len(rows) - 1):
        for i in range(len(prof) - 1):
            bm.faces.new((rows[j][i], rows[j][i + 1], rows[j + 1][i + 1], rows[j + 1][i]))
    me = bpy.data.meshes.new("lining")
    bm.to_mesh(me)
    bm.free()
    lining = bpy.data.objects.new("Lining", me)
    sc.collection.objects.link(lining)
    # shotcrete: grey, rough, uneven
    m, nt = L.node_mat("shotcrete")
    N = nt.nodes.new
    out, bs = N("ShaderNodeOutputMaterial"), N("ShaderNodeBsdfPrincipled")
    tc = N("ShaderNodeTexCoord")
    sv = N("ShaderNodeVectorMath")
    sv.operation = "SCALE"
    sv.inputs["Scale"].default_value = 0.45
    nt.links.new(tc.outputs["Object"], sv.inputs[0])
    rk = L.Tex(nt, "rock_face_03", sv.outputs[0])
    hs = N("ShaderNodeHueSaturation")
    hs.inputs["Saturation"].default_value = 0.25
    hs.inputs["Value"].default_value = 0.8
    nt.links.new(rk["diff"], hs.inputs["Color"])
    nt.links.new(hs.outputs[0], bs.inputs["Base Color"])
    nt.links.new(rk["rough"], bs.inputs["Roughness"])
    nm = N("ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = 1.6
    nt.links.new(rk["nor"], nm.inputs["Color"])
    nt.links.new(nm.outputs[0], bs.inputs["Normal"])
    nt.links.new(bs.outputs[0], out.inputs[0])
    me.materials.append(m)
    # the floor: muddy, wet, puddles that mirror the lights
    floor = box("Floor", (2 * R + 0.4, LEN, 0.3), (0, LEN / 2, 0.15), L.mat_simple("mud", (0.09, 0.075, 0.06), 0.55, noise_scale=0.8))
    # steel ribs every 1.5 m (a thin horseshoe each), a yellow vent duct at the crown, a cable and string lights
    steel = L.mat_simple("rib_steel", (0.08, 0.075, 0.07), 0.5, metal=0.8)
    for j, y in enumerate(np.arange(2.0, LEN - 3.0, 1.5)):
        bm = bmesh.new()
        prev = None
        for x, z in prof[1:-1]:
            k = 0.94
            v = bm.verts.new((x * k, y, (z - 2.2) * k + 2.2 if z > 2.2 else z))
            if prev:
                bm.edges.new((prev, v))
            prev = v
        rm = bpy.data.meshes.new(f"rib{j}")
        bm.to_mesh(rm)
        bm.free()
        ro = bpy.data.objects.new(f"Rib{j}", rm)
        sc.collection.objects.link(ro)
        sk = ro.modifiers.new("skin", "SKIN")
        for sv_ in rm.skin_vertices[0].data:
            sv_.radius = (0.09, 0.09)
        rm.materials.append(steel)
    duct_m = L.mat_simple("duct", (0.85, 0.62, 0.05), 0.55)
    cu = bpy.data.curves.new("duct", "CURVE")
    cu.dimensions = "3D"
    cu.bevel_depth = 0.42
    cu.bevel_resolution = 4
    sp = cu.splines.new("POLY")
    ys = np.linspace(0, LEN - 12, 60)
    sp.points.add(len(ys) - 1)
    for p, y in zip(sp.points, ys):
        p.co = (2.3 + 0.05 * math.sin(y * 0.7), y, 2.2 + R - 1.25 - 0.08 * math.cos(y * 0.9), 1)
    do = bpy.data.objects.new("Duct", cu)
    sc.collection.objects.link(do)
    cu.materials.append(duct_m)
    bulb_m, bulb_em = glow_mat("glow_bulb", (1.0, 0.75, 0.42), 25.0)
    for i, y in enumerate(np.arange(3.0, LEN - 6.0, 7.0)):
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=10, v_segments=6, radius=0.09, matrix=Matrix.Translation((-R * 0.86, y, 4.3)))
        bmm = bpy.data.meshes.new(f"bulb{i}")
        bm.to_mesh(bmm)
        bm.free()
        bmm.materials.append(bulb_m)
        sc.collection.objects.link(bpy.data.objects.new(f"Bulb{i}", bmm))
        pl = bpy.data.lights.new(f"BulbL{i}", "POINT")
        pl.energy, pl.color, pl.shadow_soft_size = 160.0, (1.0, 0.72, 0.4), 0.1
        po = bpy.data.objects.new(f"BulbL{i}", pl)
        po.location = (-R * 0.8, y, 4.2)
        sc.collection.objects.link(po)
    # the face: dark broken rock, and the drill rig in front of it with its work lights
    face = box("Face", (2 * R + 1, 1.2, R + 3), (0, LEN - 0.4, (R + 3) / 2), L.mat_rock())
    rig = L.mat_simple("rig_paint", (0.75, 0.55, 0.06), 0.45)
    dark = L.mat_simple("rig_dark", (0.05, 0.05, 0.05), 0.5, metal=0.5)
    box("RigBody", (2.6, 7.5, 2.4), (0, LEN - 12.0, 1.5), rig, bevel=0.12)
    box("RigCab", (2.2, 2.4, 2.0), (0.4, LEN - 14.5, 3.6), dark, bevel=0.08)
    for k, (bx, bz, ang) in enumerate(((-1.4, 3.0, 8), (1.4, 3.0, -8), (0.0, 4.6, 0))):
        boom = box(f"Boom{k}", (0.35, 7.0, 0.35), (bx, LEN - 5.5, bz), rig)
        boom.rotation_euler = (math.radians(4), 0, math.radians(ang))
        box(f"Drill{k}", (0.12, 3.2, 0.12), (bx * 1.2, LEN - 2.2, bz + 0.3), dark)
    for k, x in enumerate((-1.0, 1.0)):
        wl = bpy.data.lights.new(f"WorkLight{k}", "SPOT")
        wl.energy, wl.spot_size, wl.color = 3500.0, math.radians(70), (1.0, 0.95, 0.88)
        wo = bpy.data.objects.new(f"WorkLight{k}", wl)
        wo.location = (x, LEN - 13.5, 4.8)
        wo.rotation_euler = (math.radians(-80), 0, 0)
        sc.collection.objects.link(wo)
    # flood lamps on the rig facing back down the bore: they turn it into a silhouette and draw beams in the dust
    fl_m, _ = glow_mat("glow_flood", (1.0, 0.96, 0.88), 120.0)
    for k, x in enumerate((-1.1, 1.1)):
        box(f"Flood{k}", (0.6, 0.12, 0.4), (x, LEN - 16.0, 4.1), fl_m)
        fl = bpy.data.lights.new(f"FloodL{k}", "SPOT")
        fl.energy, fl.spot_size, fl.spot_blend, fl.color = 9000.0, math.radians(40), 0.4, (1.0, 0.95, 0.86)
        fo = bpy.data.objects.new(f"FloodL{k}", fl)
        fo.location = (x, LEN - 16.2, 4.1)
        fo.rotation_euler = (math.radians(92), 0, math.radians(180))
        sc.collection.objects.link(fo)
    # dusty air lit by the lamps
    d = box("Dust", (2 * R + 1, LEN, R + 3.2), (0, LEN / 2, (R + 3.2) / 2), bpy.data.materials.new("air"))
    am = d.data.materials[0]
    am.use_nodes = True
    ant = am.node_tree
    ant.nodes.clear()
    ao = ant.nodes.new("ShaderNodeOutputMaterial")
    pv = ant.nodes.new("ShaderNodeVolumePrincipled")
    pv.inputs["Color"].default_value = (0.75, 0.68, 0.58, 1)
    pv.inputs["Density"].default_value = 0.012
    pv.inputs["Anisotropy"].default_value = 0.5
    ant.links.new(pv.outputs[0], ao.inputs["Volume"])
    # on "भारी पड़": a few stones drop from the crown near the face
    rmat = L.mat_rock()
    r = np.random.default_rng(12)
    f0 = F(79.7)
    for k in range(9):
        st = bpy.data.objects.new(f"Drop{k}", L.rock_mesh(60 + k, "drop"))
        st.data.materials.append(rmat)
        sc.collection.objects.link(st)
        s_ = r.uniform(0.15, 0.4)
        st.scale = (s_, s_, s_)
        x, y = r.uniform(-2.5, 2.5), LEN - r.uniform(6, 14)
        t0 = f0 + int(r.uniform(0, 10))
        for f in range(1, FRAMES + 2, 2):
            t = max(0.0, (f - t0) / FPS)
            st.location = (x, y, max(0.35 * s_ + 0.3, 2.2 + R - 0.6 - 4.9 * t * t))
            st.rotation_euler = (t * 7 + k, t * 5, t * 3)
            st.keyframe_insert("location", frame=f)
            st.keyframe_insert("rotation_euler", frame=f)
    # world: black; camera walks in along the left side toward the rig
    w = bpy.data.worlds.new("dark")
    sc.world = w
    w.use_nodes = True
    w.node_tree.nodes["Background"].inputs[0].default_value = (0, 0, 0, 1)
    cam = bpy.data.cameras.new("Cam")
    cam.sensor_fit, cam.sensor_height, cam.clip_start = "VERTICAL", 36, 0.1
    co = bpy.data.objects.new("Cam", cam)
    sc.collection.objects.link(co)
    sc.camera = co
    tgt = bpy.data.objects.new("CamTarget", None)
    sc.collection.objects.link(tgt)
    con = co.constraints.new("TRACK_TO")
    con.target, con.track_axis, con.up_axis = tgt, "TRACK_NEGATIVE_Z", "UP_Y"
    L.setup_render(1.0, 24)
    sc.render.film_transparent = False
    sc.cycles.volume_step_rate = 4.0
    sc.view_settings.exposure = 0.6
    keys([
        (F(76.3), (-1.3, LEN - 62.0, 2.0), (0.3, LEN - 6.0, 2.6), 26.0),
        (F(81.18), (-0.9, LEN - 44.0, 2.3), (0.2, LEN - 6.0, 2.9), 28.0),
    ])


if __name__ == "__main__":
    {"gorge": shot_gorge, "xray": shot_xray, "train": shot_train, "station": shot_station, "bore": shot_bore}[SHOT]()
    if SHOT == "bore":
        pass
    elif SHOT in ("gorge", "xray"):
        L.add_aerial_haze(depth=14000.0, amount=0.85, power=1.15)
    else:
        L.add_aerial_haze()
    out = L.OUT
    bpy.ops.wm.save_as_mainfile(filepath=str(out / f"{SHOT}.blend"))
    print("SAVED", out / f"{SHOT}.blend", "frames", FRAMES, flush=True)
