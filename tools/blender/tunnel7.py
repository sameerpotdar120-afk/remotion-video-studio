"""Sikkim, line 10: "यहाँ बहुत ज़्यादा बारिश होती है, पहाड़ खिसकते रहते हैं, और पिछले साल ही टनल नंबर 7 के पास की सुरक्षा
दीवार landslide से गिर गई थी।" (VO 60.78-70.30 s). A reconstruction, built from code: monsoon rain over the Teesta
gorge, the railway's tunnel portal cut into the far bank with a concrete protection wall beside it; the slope above
starts to slide on "पहाड़ खिसकते" (63.1 s) and the debris knocks the wall down on "गिर गई" (69.6 s).

Same world as sikkim_landslide.py (terrain, CC0 forest and textures, real DEM backdrop), plus a rail bench cut into
the slope, the portal, the wall as stacked concrete blocks (rigid bodies that sleep until struck), a wet overcast
grade and a camera that pushes from the valley in to the portal. Rain is composited on top in Remotion.

    blender -b -P tools/blender/tunnel7.py -- <out_dir> --trees <island_tree_02_1k.blend> [--bake --export f.json] [--anim f.json]
"""
import math
import sys
from pathlib import Path

import bmesh
import bpy
import numpy as np
from mathutils import Matrix, Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
import sikkim_landslide as L  # noqa: E402

FPS = 30
T0 = 60.78                     # shot start in the VO (s)
SLIDE_AT = 63.1 - T0           # "पहाड़ खिसकते"
FALL_AT = 69.62 - T0           # "गिर गई"
FRAMES = int(round((70.6 - T0) * FPS))  # to the end of "थी" plus a beat
L.FRAMES, L.PRE, L.FPS = FRAMES, 0, FPS

# the rail bench: a shelf cut into the far slope above the road, running along the valley, ending in the portal
BENCH_Z, BENCH_D0, BENCH_D1 = 54.0, 60.0, 71.5
WALL_D, WALL_H = 70.8, 6.25  # the wall's back face and height: it retains the slope above the bench
PORTAL_X = -40.0
L.SCAR_D0 = 74.0
L.ROCK_D_MIN = float(L.arg("--dmin", 1, 115))
_height0 = L.height


def height_t7(x, y):
    z, d, dn, scar = _height0(x, y)
    on = L.sstep(PORTAL_X - 1.5, PORTAL_X + 1.5, x)
    # front lip, flat shelf, a wall-high step (the protection wall holds it) and a 50-degree slope above
    above = BENCH_Z + WALL_H + np.maximum(d - WALL_D, 0) * 1.2
    shelf = np.where(d < BENCH_D0, BENCH_Z - (BENCH_D0 - d) * 1.9, np.where(d <= WALL_D, BENCH_Z, above))
    band = (d > BENCH_D0 - 14) & (d < BENCH_D1 + 40)
    # the shelf itself is cut or filled level; the lip below it and the slope above it are only ever cut
    lo = np.where((d >= BENCH_D0) & (d <= WALL_D), shelf, np.minimum(z, shelf))
    cut = np.where(band, lo, z)
    z = z + (cut - z) * on
    # a little spur over the tunnel so the portal has cover
    z = z + (1 - on) * 7.0 * L.sstep(BENCH_D0 - 10, BENCH_D0, d) * (1 - L.sstep(BENCH_D1 + 20, BENCH_D1 + 60, d)) * L.sstep(PORTAL_X + 1, PORTAL_X - 25, x)
    return z, d, dn, scar


L.height = height_t7
YR = float(L.river_y(np.array([0.0]))[0])


def yd(d):
    return YR + L.RIVER_HW + d


def concrete_mat(name, col, rough=0.75):
    m = L.mat_simple(name, col, rough, noise_scale=1.4)
    return m


def build_rail_and_portal():
    sc = bpy.context.scene
    conc = concrete_mat("portal_concrete", (0.32, 0.31, 0.29))
    steel = L.mat_simple("rail_steel", (0.32, 0.3, 0.28), 0.35, metal=1.0)
    sleeper_m = L.mat_simple("sleeper", (0.25, 0.24, 0.23), 0.85)
    ballast = L.mat_simple("ballast", (0.16, 0.15, 0.14), 0.95, noise_scale=6.0)
    dark = L.mat_simple("tunnel_dark", (0.015, 0.015, 0.015), 0.9)
    yc = yd(65.0)
    # ballast bed and the track, from the portal down the valley
    x0, x1 = PORTAL_X - 30, 420.0
    bpy.ops.mesh.primitive_cube_add(size=1)
    b = bpy.context.active_object
    b.name = "Ballast"
    b.scale = (x1 - x0, 4.6, 0.5)
    b.location = ((x0 + x1) / 2, yc, BENCH_Z + 0.2)
    b.data.materials.append(ballast)
    for side in (-0.84, 0.84):
        bpy.ops.mesh.primitive_cube_add(size=1)
        r = bpy.context.active_object
        r.name = "Rail"
        r.scale = (x1 - x0, 0.08, 0.17)
        r.location = ((x0 + x1) / 2, yc + side, BENCH_Z + 0.62)
        r.data.materials.append(steel)
    sl = bpy.data.meshes.new("sleepers")
    bm = bmesh.new()
    for i in range(int((x1 - x0) / 0.65)):
        bmesh.ops.create_cube(bm, size=1, matrix=Matrix.Translation((x0 + i * 0.65, yc, BENCH_Z + 0.5)) @ Matrix.Diagonal((0.26, 2.75, 0.2, 1)))
    bm.to_mesh(sl)
    bm.free()
    so = bpy.data.objects.new("Sleepers", sl)
    sc.collection.objects.link(so)
    sl.materials.append(sleeper_m)
    # the portal: a concrete face with a horseshoe opening, wing walls, and a dark lined tube behind it
    W, H, T = 14.0, 12.5, 2.2
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1, matrix=Matrix.Translation((PORTAL_X - T / 2, yc, BENCH_Z + H / 2)) @ Matrix.Diagonal((T, W, H, 1)))
    face = bpy.data.meshes.new("portal_face")
    bm.to_mesh(face)
    bm.free()
    pf = bpy.data.objects.new("Portal", face)
    sc.collection.objects.link(pf)
    pf.data.materials.append(conc)
    # opening: half-cylinder arch on a box
    bm = bmesh.new()
    ow, oh = 7.2, 4.2
    bmesh.ops.create_cube(bm, size=1, matrix=Matrix.Translation((PORTAL_X - T / 2, yc, BENCH_Z + oh / 2)) @ Matrix.Diagonal((T * 3, ow, oh, 1)))
    bmesh.ops.create_cone(bm, cap_ends=True, segments=40, radius1=ow / 2, radius2=ow / 2, depth=T * 3,
                          matrix=Matrix.Translation((PORTAL_X - T / 2, yc, BENCH_Z + oh)) @ Matrix.Rotation(math.pi / 2, 4, "Y"))
    cut = bpy.data.meshes.new("portal_cut")
    bm.to_mesh(cut)
    bm.free()
    co = bpy.data.objects.new("PortalCut", cut)
    sc.collection.objects.link(co)
    mod = pf.modifiers.new("open", "BOOLEAN")
    mod.operation = "DIFFERENCE"
    mod.object = co
    mod.solver = "EXACT"
    bpy.context.view_layer.objects.active = pf
    with bpy.context.temp_override(object=pf, active_object=pf):
        bpy.ops.object.modifier_apply(modifier="open")
    bpy.data.objects.remove(co)
    # a coping band and a parapet on top, the portal's number plate left blank (labels come in Remotion)
    for z, h, d in ((BENCH_Z + H, 0.8, 0.6), (BENCH_Z + H + 0.8, 1.1, 0.3)):
        bpy.ops.mesh.primitive_cube_add(size=1)
        c = bpy.context.active_object
        c.name = "PortalCoping"
        c.scale = (T + d, W + 1.2, h)
        c.location = (PORTAL_X - T / 2 + d / 2, yc, z + h / 2)
        c.data.materials.append(conc)
    # the tube behind (dark, so the opening reads as a tunnel)
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=True, segments=40, radius1=ow / 2 - 0.1, radius2=ow / 2 - 0.1, depth=40,
                          matrix=Matrix.Translation((PORTAL_X - T - 20, yc, BENCH_Z + oh)) @ Matrix.Rotation(math.pi / 2, 4, "Y"))
    bmesh.ops.create_cube(bm, size=1, matrix=Matrix.Translation((PORTAL_X - T - 20, yc, BENCH_Z + oh / 2)) @ Matrix.Diagonal((40, ow - 0.2, oh, 1)))
    tube = bpy.data.meshes.new("tube")
    bm.to_mesh(tube)
    bm.free()
    for p in tube.polygons:
        p.flip()
    to = bpy.data.objects.new("Tube", tube)
    sc.collection.objects.link(to)
    to.data.materials.append(dark)
    # a sodium lamp just inside, the only warm light in the shot
    lamp = bpy.data.lights.new("TunnelLamp", "POINT")
    lamp.energy = 2500
    lamp.color = (1.0, 0.62, 0.3)
    lamp.shadow_soft_size = 0.3
    lo = bpy.data.objects.new("TunnelLamp", lamp)
    lo.location = (PORTAL_X - T - 6, yc, BENCH_Z + oh + 2.6)
    sc.collection.objects.link(lo)
    return yc


def build_wall(yc):
    """The protection wall along the cut face beside the portal: precast blocks in a running bond, four courses."""
    sc = bpy.context.scene
    m = concrete_mat("wall_blocks", (0.36, 0.35, 0.33), 0.8)
    col = bpy.data.collections.new("WallBlocks")
    sc.collection.children.link(col)
    bw, bd, bh = 2.4, 1.1, 1.25
    yw = yd(68.5)  # a metre and a half clear of the step it retains
    blocks = []
    me = bpy.data.meshes.new("block")
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1)
    bmesh.ops.bevel(bm, geom=bm.edges[:], offset=0.04, segments=1, affect="EDGES")
    bm.to_mesh(me)
    bm.free()
    me.materials.append(m)
    for row in range(5):
        off = (bw / 2) * (row % 2)
        x = PORTAL_X + 3.0 + off
        while x + bw <= 70:
            ob = bpy.data.objects.new(f"Block{len(blocks):03d}", me)
            col.objects.link(ob)
            ob.location = (x + bw / 2, yw, BENCH_Z + 0.02 + bh * (row + 0.5))
            ob.scale = (bw - 0.03, bd, bh - 0.02)
            blocks.append(ob)
            x += bw
    return blocks


def overcast():
    """Monsoon light: a low, soft sun behind thick cloud, a grey sky, wet surfaces."""
    sun = bpy.data.lights["Sun"]
    sun.energy = 1.4
    sun.angle = math.radians(18)
    sun.color = (0.92, 0.95, 1.0)
    w = bpy.context.scene.world.node_tree
    sky = next(n for n in w.nodes if n.type == "TEX_SKY")
    sky.dust_density = 6.0
    sky.air_density = 2.0
    bg = next(n for n in w.nodes if n.type == "BACKGROUND")
    bg.inputs[1].default_value = 0.42
    # heavier, lower cloud; mist hanging on the ridges
    for nm, z in (("Clouds", 1100.0), ("CloudsHigh", 2600.0)):
        ob = bpy.data.objects[nm]
        ob.location.z = z
        r = next(n for n in ob.active_material.node_tree.nodes if n.type == "VALTORGB")
        r.color_ramp.elements[0].position = 0.3
    for k, (y, z, sx) in enumerate(((420, 240, 1400), (900, 330, 2600), (1700, 420, 5200))):
        L.cloud_card(f"RidgeMist{k}", (sx, sx * 0.35), (-200, y + sx * 0.15, z), 1 / 260.0, 0.45, 0.7, (0.86, 0.88, 0.9), 11.0 + k, shadow=False)
    # wet: darker and glossier ground, rock and concrete
    for mn, rough, dark in (("terrain", 0.55, 0.78), ("rock", 0.45, 0.75), ("portal_concrete", 0.4, 0.7), ("wall_blocks", 0.45, 0.72),
                            ("concrete", 0.4, 0.7), ("ballast", 0.5, 0.8)):
        mt = bpy.data.materials.get(mn)
        if not mt:
            continue
        bs = next((n for n in mt.node_tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
        if bs is None:
            continue
        nt = mt.node_tree
        if bs.inputs["Roughness"].links:
            mul = nt.nodes.new("ShaderNodeMath")
            mul.operation = "MULTIPLY"
            mul.inputs[1].default_value = rough
            nt.links.new(bs.inputs["Roughness"].links[0].from_socket, mul.inputs[0])
            nt.links.new(mul.outputs[0], bs.inputs["Roughness"])
        else:
            bs.inputs["Roughness"].default_value = rough
        if bs.inputs["Base Color"].links:
            mx = nt.nodes.new("ShaderNodeMix")
            mx.data_type = "RGBA"
            mx.blend_type = "MULTIPLY"
            mx.inputs["Factor"].default_value = 1.0
            nt.links.new(bs.inputs["Base Color"].links[0].from_socket, mx.inputs[6])
            mx.inputs[7].default_value = (dark, dark, dark, 1)
            nt.links.new(mx.outputs[2], bs.inputs["Base Color"])
        else:
            c = bs.inputs["Base Color"].default_value
            bs.inputs["Base Color"].default_value = (c[0] * dark, c[1] * dark, c[2] * dark, 1)
    # the monsoon Teesta runs high and brown
    wm = bpy.data.materials["water"]
    bs = next(n for n in wm.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bs.inputs["Base Color"].default_value = (0.11, 0.08, 0.05, 1)
    bpy.data.objects["River"].location.z = 0.3


def camera(yc):
    """From the valley in the rain to the portal: wide on "बारिश", in on "टनल नंबर 7", holding through the fall."""
    sc = bpy.context.scene
    co, tgt = sc.camera, bpy.data.objects["CamTarget"]
    co.animation_data_clear()
    tgt.animation_data_clear()
    for mdf in list(co.constraints):
        if mdf.type == "TRACK_TO":
            mdf.target = tgt
    keys = [
        (1, (120.0, -150.0, 118.0), (-10.0, 140.0, 108.0), 26.0),                          # the valley in the rain
        (int((65.9 - T0) * FPS), (36.0, 6.0, 62.0), (-16.0, yc + 2, 66.0), 40.0),          # over the river, at the portal
        (FRAMES, (31.0, 14.0, 61.0), (-15.0, yc + 2, 68.0), 42.0),                         # holding through the fall
    ]
    for f, p, l, lens in keys:
        co.location = p
        co.keyframe_insert("location", frame=f)
        co.data.lens = lens
        co.data.keyframe_insert("lens", frame=f)
        tgt.location = l
        tgt.keyframe_insert("location", frame=f)
    for ob in (co, tgt, co.data):
        for fc in ob.animation_data.action.fcurves:
            for k in fc.keyframe_points:
                k.interpolation = "BEZIER"
                k.easing = "EASE_IN_OUT"
    for i in range(3):
        fc = co.animation_data.action.fcurves.find("location", index=i)
        m = fc.modifiers.new("NOISE")
        m.scale = 30
        m.strength = 0.45
        m.offset = 41.0 * (i + 1)


def retime_release(rocks):
    """The slope lets go on "पहाड़ खिसकते", bottom of the scar first, over about a second and a half."""
    r = np.random.default_rng(L.SEED + 3)
    f0 = int(SLIDE_AT * FPS)
    for ob in rocks:
        rb = ob.rigid_body
        if ob.animation_data:
            ob.animation_data_clear()
        dd = ob.location.y - YR - L.RIVER_HW
        # a trickle of small stones first (the hill on the move), then the main mass, timed to hit the wall on
        # "गिर गई"; it takes the front ~3.2 s to come down from the scar
        small = ob.scale[0] < 0.8
        wave = 0 if small else int(arg_f("--main", 92))
        rel = f0 + wave + int((dd - L.ROCK_D_MIN) * 0.3 + r.uniform(-4, 4))
        rb.kinematic = True
        rb.keyframe_insert("kinematic", frame=1)
        rb.keyframe_insert("kinematic", frame=max(2, rel - 1))
        rb.kinematic = False
        rb.keyframe_insert("kinematic", frame=max(3, rel))


def arg_f(name, default):
    v = L.arg(name, 1, None)
    return float(v) if v is not None else default


def add_blocks_to_sim(blocks, yc):
    rw = bpy.context.scene.rigidbody_world
    sc = bpy.context.scene
    # invisible catchers: a plug in the tunnel mouth, and a floor under everything
    extra = []
    for name, loc, dim in (("TunnelPlug", (PORTAL_X - 12, yc, BENCH_Z + 4), (20, 7, 8)), ("CatchFloor", (0, 120, -4), (900, 900, 2))):
        bpy.ops.mesh.primitive_cube_add(size=1)
        o = bpy.context.active_object
        o.name = name
        o.location, o.scale = loc, dim
        o.hide_render = True
        o.display_type = "WIRE"
        extra.append(o)
    for ob in blocks + [bpy.data.objects["Portal"]] + extra:
        rw.collection.objects.link(ob)
        bpy.context.view_layer.objects.active = ob
        ob.select_set(True)
        if ob.name in ("Portal", "TunnelPlug", "CatchFloor"):
            bpy.ops.rigidbody.object_add(type="PASSIVE")
            ob.rigid_body.collision_shape = "MESH" if ob.name == "Portal" else "BOX"
        else:
            bpy.ops.rigidbody.object_add(type="ACTIVE")
            rb = ob.rigid_body
            rb.collision_shape = "BOX"
            rb.mass = 2400 * ob.scale[0] * ob.scale[1] * ob.scale[2]
            rb.friction = 0.7
            rb.restitution = 0.05
            rb.collision_margin = 0.01
            # held in place (animated) until the debris piled behind it is about to push it over on "गिर गई"
            give = int(FALL_AT * FPS) - int(arg_f("--lead", 8))
            rb.kinematic = True
            rb.keyframe_insert("kinematic", frame=1)
            rb.keyframe_insert("kinematic", frame=give - 1)
            rb.kinematic = False
            rb.keyframe_insert("kinematic", frame=give)
        ob.select_set(False)


def build():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    terr = L.build_terrain()
    terr.data.materials.append(L.mat_terrain())
    leaf, bark = L.mat_leaf(), L.mat_simple("bark", (0.06, 0.045, 0.03), 0.9)
    L.build_forest(terr, leaf, bark)
    L.build_structures(None)
    yc = build_rail_and_portal()
    blocks = build_wall(yc)
    rmat = L.mat_rock()
    L.build_scree(terr, rmat)
    rocks = L.build_rockfall(rmat)
    add_blocks_to_sim(blocks, yc)
    retime_release(rocks)
    L.build_backdrop()
    L.build_clouds()
    L.build_world()
    L.build_camera()
    L.setup_render(1.0, 16)
    overcast()
    camera(yc)
    L.add_aerial_haze()
    return rocks + blocks


if __name__ == "__main__":
    import time
    movers = build()
    sc = bpy.context.scene
    out = L.OUT
    if L.arg("--bake", 0):
        t = time.time()
        with bpy.context.temp_override(scene=sc, point_cache=sc.rigidbody_world.point_cache):
            bpy.ops.ptcache.bake(bake=True)
        print("RB_BAKE_S", round(time.time() - t, 1), flush=True)
        if L.arg("--export", 1):
            L.export_anim(movers, L.arg("--export", 1))
    if L.arg("--anim", 1):
        d = L.apply_anim(movers, L.arg("--anim", 1))
        d["rocks"] = {k: v for k, v in d["rocks"].items() if k.startswith("Rock")}
        L.build_puffs(d)
    bpy.ops.wm.save_as_mainfile(filepath=str(out / "tunnel7.blend"))
    print("SAVED", out / "tunnel7.blend", flush=True)
