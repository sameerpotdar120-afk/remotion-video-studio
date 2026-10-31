"""The real Teesta gorge in Blender, for the Sikkim shots that need true scale (lines 6 and 7).

Heights: AWS Terrain Tiles / SRTM (open data), image: EOX Sentinel-2 cloudless 2024 (CC BY 4.0), cut by
prep_teesta.py into tools/blender/data/. Local metres: x east, y north, z up, the crop's centre at the origin.
The crop's own surface carries fine noise and CC0 Poly Haven trees near the camera; the whole DEM sits underneath it
(lowered a little) out to the horizon, in its true place.
"""
import json
import math
from pathlib import Path

import bpy
import numpy as np

import sikkim_landslide as L

DATA = Path(__file__).resolve().parent / "data"
META = json.loads((DATA / "teesta.json").read_text())
H = np.load(DATA / "teesta_h.npy").astype(np.float64)
NY, NX = H.shape
MX, MY = META["mpp"]
W_M, H_M = META["size_m"]


def h_at(x, y):
    """Bilinear height (m) at local x, y."""
    c = np.clip((np.asarray(x) + W_M / 2) / MX, 0, NX - 1.001)
    r = np.clip((H_M / 2 - np.asarray(y)) / MY, 0, NY - 1.001)
    c0, r0 = np.floor(c).astype(int), np.floor(r).astype(int)
    fc, fr = c - c0, r - r0
    return (H[r0, c0] * (1 - fc) * (1 - fr) + H[r0, c0 + 1] * fc * (1 - fr) + H[r0 + 1, c0] * (1 - fc) * fr
            + H[r0 + 1, c0 + 1] * fc * fr)


def river_path():
    """The Teesta's bed: each Natural Earth route point snapped to the lowest ground within 450 m, then smoothed."""
    pts = []
    for x, y in META["route"]:
        if abs(x) > W_M / 2 - 500 or abs(y) > H_M / 2 - 500:
            continue
        gx, gy = np.meshgrid(np.linspace(x - 450, x + 450, 31), np.linspace(y - 450, y + 450, 31))
        z = h_at(gx, gy)
        i = np.unravel_index(np.argmin(z), z.shape)
        pts.append((gx[i], gy[i], z[i]))
    p = np.array(pts)
    k = np.ones(5) / 5
    sm = np.stack([np.convolve(np.pad(p[:, j], 2, mode="edge"), k, "valid") for j in range(3)], 1)
    return sm


def build_dem(forest_box):
    """The crop as a mesh (8.4 m grid) with fine noise, a UV for the satellite image and per-vertex masks."""
    xs = np.linspace(-W_M / 2, W_M / 2, NX)
    ys = np.linspace(H_M / 2, -H_M / 2, NY)
    gx, gy = np.meshgrid(xs, ys)
    z = H.copy()
    # slope (for rock and for where trees can stand)
    dzdx = np.gradient(z, MX, axis=1)
    dzdy = np.gradient(z, MY, axis=0)
    slope = np.hypot(dzdx, dzdy)
    det = L.fbm(gx / 60.0, gy / 60.0, 4, 31) * 6 + L.fbm(gx / 14.0, gy / 14.0, 3, 32) * 1.6
    z = z + det * np.clip(slope, 0.2, 1.2)
    me = bpy.data.meshes.new("teesta")
    v = np.stack([gx.ravel(), gy.ravel(), z.ravel()], 1)
    me.vertices.add(len(v))
    me.vertices.foreach_set("co", v.astype(np.float32).ravel())
    i = np.arange(NX * NY).reshape(NY, NX)
    q = np.stack([i[:-1, :-1], i[1:, :-1], i[1:, 1:], i[:-1, 1:]], -1).reshape(-1, 4)
    me.loops.add(q.size)
    me.loops.foreach_set("vertex_index", q.ravel().astype(np.int32))
    me.polygons.add(len(q))
    me.polygons.foreach_set("loop_start", (np.arange(len(q)) * 4).astype(np.int32))
    me.polygons.foreach_set("loop_total", np.full(len(q), 4, np.int32))
    me.update()
    uu, vv = np.meshgrid(np.linspace(0, 1, NX), np.linspace(1, 0, NY))
    uv = me.uv_layers.new(name="UVMap")
    uv.data.foreach_set("uv", np.stack([uu.ravel(), vv.ravel()], 1)[q.ravel()].astype(np.float32).ravel())
    me.polygons.foreach_set("use_smooth", np.ones(len(me.polygons), bool))
    # forest where the satellite image is green and the ground not cliff-steep, only near the camera
    tex = bpy.data.images.load(str(DATA / "teesta_tex.jpg"))
    tw, th = tex.size
    px = np.array(tex.pixels[:], dtype=np.float32).reshape(th, tw, 4)[::-1]
    ci = np.clip((uu * (tw - 1)).astype(int), 0, tw - 1)
    ri = np.clip(((1 - vv) * (th - 1)).astype(int), 0, th - 1)
    rgb = px[ri, ci, :3]
    green = np.clip((rgb[..., 1] - np.maximum(rgb[..., 0], rgb[..., 2]) * 0.92) * 9, 0, 1)
    x0, x1, y0, y1 = forest_box
    box = L.sstep(x0, x0 + 150, gx) * (1 - L.sstep(x1 - 150, x1, gx)) * L.sstep(y0, y0 + 150, gy) * (1 - L.sstep(y1 - 150, y1, gy))
    forest = np.clip(green * 1.4 + 0.25, 0, 1) * (1 - L.sstep(1.7, 2.3, slope)) * box
    a = me.attributes.new("forest", "FLOAT", "POINT")
    a.data.foreach_set("value", forest.ravel().astype(np.float32))
    a = me.attributes.new("slope", "FLOAT", "POINT")
    a.data.foreach_set("value", np.clip(slope, 0, 3).ravel().astype(np.float32))
    ob = bpy.data.objects.new("Terrain", me)
    bpy.context.scene.collection.objects.link(ob)
    ob.data.materials.append(mat_dem(tex))
    return ob


def mat_dem(tex):
    """Satellite colour for the big picture, CC0 textures and noise up close, wet sand and water in the river bed."""
    m, nt = L.node_mat("terrain")
    N = nt.nodes.new
    lk = nt.links.new
    out, bs = N("ShaderNodeOutputMaterial"), N("ShaderNodeBsdfPrincipled")
    uvn = N("ShaderNodeUVMap")
    ti = N("ShaderNodeTexImage")
    ti.image = tex
    ti.interpolation = "Cubic"
    lk(uvn.outputs[0], ti.inputs[0])
    hs = N("ShaderNodeHueSaturation")
    hs.inputs["Saturation"].default_value = 1.1
    hs.inputs["Value"].default_value = 0.62
    lk(ti.outputs[0], hs.inputs["Color"])
    tc = N("ShaderNodeTexCoord")
    sc = N("ShaderNodeVectorMath")
    sc.operation = "SCALE"
    sc.inputs["Scale"].default_value = 1 / 5.0
    lk(tc.outputs["Object"], sc.inputs[0])
    fl = L.Tex(nt, "rocky_terrain_02", sc.outputs[0])
    rk = L.Tex(nt, "rock_face_03", sc.outputs[0])
    # close-range detail: the CC0 ground texture multiplied over the satellite colour, softly
    det = N("ShaderNodeMix")
    det.data_type = "RGBA"
    det.blend_type = "OVERLAY"
    det.inputs["Factor"].default_value = 0.35
    lk(hs.outputs[0], det.inputs[6])
    lk(fl["diff"], det.inputs[7])
    sl = N("ShaderNodeAttribute")
    sl.attribute_name = "slope"
    sr = N("ShaderNodeMapRange")
    sr.inputs["From Min"].default_value = 1.9
    sr.inputs["From Max"].default_value = 2.6
    lk(sl.outputs["Fac"], sr.inputs["Value"])
    rkc = N("ShaderNodeMix")
    rkc.data_type = "RGBA"
    lk(sr.outputs[0], rkc.inputs["Factor"])
    lk(det.outputs[2], rkc.inputs[6])
    dark = N("ShaderNodeMix")
    dark.data_type = "RGBA"
    dark.blend_type = "MULTIPLY"
    dark.inputs["Factor"].default_value = 1.0
    lk(rk["diff"], dark.inputs[6])
    dark.inputs[7].default_value = (0.3, 0.3, 0.28, 1)
    lk(dark.outputs[2], rkc.inputs[7])
    lk(rkc.outputs[2], bs.inputs["Base Color"])
    bs.inputs["Roughness"].default_value = 0.88
    nm = N("ShaderNodeNormalMap")
    nm.inputs["Strength"].default_value = 0.8
    lk(fl["nor"], nm.inputs["Color"])
    lk(nm.outputs[0], bs.inputs["Normal"])
    lk(bs.outputs[0], out.inputs[0])
    return m


def build_water(path):
    """A ribbon of water along the bed, following its fall."""
    import bmesh
    bm = bmesh.new()
    prev = None
    for k in range(len(path)):
        a = path[max(0, k - 1)]
        b = path[min(len(path) - 1, k + 1)]
        tx, ty = b[0] - a[0], b[1] - a[1]
        n = math.hypot(tx, ty) or 1
        nx, ny = -ty / n, tx / n
        x, y, z = path[k]
        w = 55.0
        l = bm.verts.new((x + nx * w, y + ny * w, z + 4.0))
        r = bm.verts.new((x - nx * w, y - ny * w, z + 4.0))
        if prev:
            bm.faces.new((prev[0], prev[1], r, l))
        prev = (l, r)
    me = bpy.data.meshes.new("teesta_water")
    bm.to_mesh(me)
    bm.free()
    ob = bpy.data.objects.new("River", me)
    bpy.context.scene.collection.objects.link(ob)
    w = L.mat_water()
    bs = next(n for n in w.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bs.inputs["Base Color"].default_value = (0.07, 0.085, 0.07, 1)  # the Teesta's jade-grey in the dry season
    ob.data.materials.append(w)
    return ob


def build_surroundings():
    """The full DEM in its true place under and around the crop, a little lower so the detailed crop wins."""
    ob = L.build_backdrop()
    t = json.loads((Path(__file__).resolve().parents[2] / "src" / "sikkim" / "geo.json").read_text())["terrain"]
    lo0, la0, lo1, la1 = t["ll"]
    clon, clat = META["centre_ll"]
    mx = t["w_m"] / (lo1 - lo0)
    my = t["h_m"] / (la1 - la0)
    ob.rotation_euler = (0, 0, 0)
    # build_backdrop's heights start at 0 for hmin: lift them back to true heights, less 20 m
    ob.location = (((lo0 + lo1) / 2 - clon) * mx, ((la0 + la1) / 2 - clat) * my, t["hmin"] - 20.0)
    # sink it well below the detailed crop (its 50 m grid sits above the bed in narrow gorges)
    me = ob.data
    co = np.empty(len(me.vertices) * 3, np.float32)
    me.vertices.foreach_get("co", co)
    co = co.reshape(-1, 3)
    wx, wy = co[:, 0] + ob.location.x, co[:, 1] + ob.location.y
    inside = (np.abs(wx) < W_M / 2 - 60) & (np.abs(wy) < H_M / 2 - 60)
    co[inside, 2] -= 600.0
    me.vertices.foreach_set("co", co.ravel())
    me.update()
    return ob


def build(forest_box):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    terr = build_dem(forest_box)
    leaf, bark = L.mat_leaf(), L.mat_simple("bark", (0.06, 0.045, 0.03), 0.9)
    L.build_forest(terr, leaf, bark)
    path = river_path()
    build_water(path)
    build_surroundings()
    L.build_clouds()
    for nm, z in (("Clouds", 3600.0), ("CloudsHigh", 6200.0)):
        bpy.data.objects[nm].location.z = z
    for ob in [o for o in bpy.data.objects if o.name.startswith("Mist")]:
        bpy.data.objects.remove(ob)  # the low mist cards belong to the small world; here they'd slice the hills
    L.build_world()
    L.build_camera()
    L.setup_render(1.0, 20)
    bpy.context.scene.world.mist_settings.depth = 30000
    return terr, path
