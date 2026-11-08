# Zack-style horsefly scene: Domestic Fly (CC-BY, aramabdulrahim) with reference-matched shading,
# cyan studio sky with a glow behind the subject, procedural skin ground with pores and hairs.
import bpy, math, mathutils, random, os
from mathutils import Vector
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
V = Vector

def lin(r, g, b):  # sRGB 0-255 -> linear
    f = lambda c: (c / 255) / 12.92 if c / 255 <= 0.04045 else ((c / 255 + 0.055) / 1.055) ** 2.4
    return (f(r), f(g), f(b), 1)

def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'
    sc.cycles.use_adaptive_sampling = True; sc.cycles.adaptive_threshold = 0.02
    sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
    sc.cycles.max_bounces = 6; sc.cycles.transparent_max_bounces = 16
    sc.render.use_persistent_data = True
    sc.view_settings.view_transform = 'Standard'; sc.view_settings.look = 'Medium High Contrast'
    sc.render.film_transparent = False
    return sc

def mat(name, base, rough=0.5, **kw):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = base; b.inputs['Roughness'].default_value = rough
    for k, v in kw.items(): b.inputs[k].default_value = v
    return m

def nodes(m): return m.node_tree.nodes, m.node_tree.links

def add_bump(m, layers, co='Object', mul=1.0):
    n, l = nodes(m); b = n['Principled BSDF']; tc = n.new('ShaderNodeTexCoord'); prev = None
    for kind, scale, strength in layers:
        if kind == 'noise': t = n.new('ShaderNodeTexNoise'); t.inputs['Scale'].default_value = scale; t.inputs['Detail'].default_value = 8; out = t.outputs['Fac']
        elif kind == 'cells': t = n.new('ShaderNodeTexVoronoi'); t.inputs['Scale'].default_value = scale; out = t.outputs['Distance']
        else: t = n.new('ShaderNodeTexVoronoi'); t.feature = 'DISTANCE_TO_EDGE'; t.inputs['Scale'].default_value = scale; out = t.outputs['Distance']
        l.new(tc.outputs[co], t.inputs['Vector'])
        bp = n.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = strength * mul; bp.inputs['Distance'].default_value = 0.02
        l.new(out, bp.inputs['Height'])
        if prev: l.new(prev.outputs['Normal'], bp.inputs['Normal'])
        prev = bp
    l.new(prev.outputs['Normal'], b.inputs['Normal'])

def mottle(m, dark, light, scale, lo, hi, co='Object'):
    n, l = nodes(m); b = n['Principled BSDF']; tc = n.new('ShaderNodeTexCoord'); t = n.new('ShaderNodeTexNoise')
    t.inputs['Scale'].default_value = scale; t.inputs['Detail'].default_value = 6; l.new(tc.outputs[co], t.inputs['Vector'])
    r = n.new('ShaderNodeValToRGB'); r.color_ramp.elements[0].position = lo; r.color_ramp.elements[0].color = dark
    r.color_ramp.elements[1].position = hi; r.color_ramp.elements[1].color = light
    l.new(t.outputs['Fac'], r.inputs['Fac']); l.new(r.outputs['Color'], b.inputs['Base Color'])

# ── sky: colour ramp on the direction from camera toward the subject → glow right behind the subject ──
def sky(sc, cam_loc, target, light_frac=1.0):
    w = bpy.data.worlds.new('sky'); sc.world = w; w.use_nodes = True; n, l = w.node_tree.nodes, w.node_tree.links
    bg = n['Background']; tc = n.new('ShaderNodeTexCoord'); dp = n.new('ShaderNodeVectorMath'); dp.operation = 'DOT_PRODUCT'
    D = (V(target) - V(cam_loc)).normalized(); dp.inputs[1].default_value = D
    l.new(tc.outputs['Generated'], dp.inputs[0])
    r = n.new('ShaderNodeValToRGB'); e = r.color_ramp.elements
    e[0].position = 0.86; e[0].color = lin(26, 140, 196); e[1].position = 1.0; e[1].color = lin(176, 224, 240)
    m = e.new(0.955); m.color = lin(38, 160, 212); m2 = e.new(0.988); m2.color = lin(110, 200, 232)
    l.new(dp.outputs['Value'], r.inputs['Fac']); l.new(r.outputs['Color'], bg.inputs['Color'])
    if light_frac < 1:  # light the scene with part of the sky but show all of it to the camera
        lp = n.new('ShaderNodeLightPath'); mx = n.new('ShaderNodeMath'); mx.operation = 'MULTIPLY_ADD'
        mx.inputs[1].default_value = 1 - light_frac; mx.inputs[2].default_value = light_frac
        l.new(lp.outputs['Is Camera Ray'], mx.inputs[0]); l.new(mx.outputs['Value'], bg.inputs['Strength'])
    else: bg.inputs['Strength'].default_value = 1.0

def area(sc, name, loc, target, power, size, color):
    d = bpy.data.lights.new(name, 'AREA'); d.energy = power; d.size = size; d.color = color
    o = bpy.data.objects.new(name, d); sc.collection.objects.link(o); o.location = loc
    o.rotation_euler = (V(target) - V(loc)).to_track_quat('-Z', 'Y').to_euler(); return o

def lights(sc, target, k=1.0):
    t = V(target)
    area(sc, 'key', t + V((-4, -6, 7)), t, 1300 * k, 5, (1, .96, .9))
    area(sc, 'rim', t + V((5, 5, 5)), t, 1100 * k, 3, (.8, .93, 1))
    area(sc, 'fill', t + V((0, -6, 0.8)), t, 260 * k, 6, (1, 1, 1))

# ── skin ground: a big grid bent into a cylinder so the horizon falls away like a shoulder ──
def skin_material():
    m = mat('skin', lin(222, 132, 84), 0.5, **{'Subsurface Weight': 0.15, 'Subsurface Radius': (1, .4, .25)})
    mottle(m, lin(212, 118, 72), lin(230, 146, 96), 0.6, 0.3, 0.75)
    add_bump(m, [('noise', 3, 0.35), ('noise', 14, 0.2), ('voronoi', 9, 0.3), ('cells', 140, 0.16)])
    return m

def skin(sc, R=7.0, size=24, hairs=90, seed=3):
    bpy.ops.mesh.primitive_grid_add(x_subdivisions=220, y_subdivisions=220, size=size); g = bpy.context.object; g.name = 'skin'
    for v in g.data.vertices:
        y = v.co.y; t = y / R; v.co.y = R * math.sin(t) - 1; v.co.z = R * math.cos(t) - R
    tex = bpy.data.textures.new('sk', 'CLOUDS'); tex.noise_scale = 0.6
    d = g.modifiers.new('d', 'DISPLACE'); d.texture = tex; d.strength = 0.08; d.mid_level = 0.5
    g.data.materials.append(skin_material())
    for p in g.data.polygons: p.use_smooth = True
    rng = random.Random(seed); hm = mat('hair', lin(30, 20, 16), 0.35)
    for i in range(hairs):
        x = rng.uniform(-size / 2.5, size / 2.5); yy = rng.uniform(-6, 6); t = (yy + 1) / R
        base = V((x, R * math.sin(t) - 1, R * math.cos(t) - R)); L = rng.uniform(0.25, 0.6)
        dirn = V((rng.uniform(-0.4, 0.4), rng.uniform(0.2, 0.7), 1)).normalized()
        cu = bpy.data.curves.new(f'h{i}', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.007; cu.bevel_resolution = 2
        sp = cu.splines.new('POLY'); sp.points.add(3)
        for k in range(4):
            u = k / 3; p = base + dirn * L * u + V((0, 0.15 * u * u, -0.05 * u * u)); sp.points[k].co = (*p, 1); sp.points[k].radius = 1 - 0.9 * u
        ob = bpy.data.objects.new(f'h{i}', cu); sc.collection.objects.link(ob); cu.materials.append(hm)
    return g

def skin_z(x, y, R=7.0):  # height of the bent skin surface at (x, y)
    return R * math.cos(math.asin(max(-1, min(1, (y + 1) / R)))) - R

# ── the fly ──
FLY_GLB = os.path.join(ROOT, 'assets', 'domestic.glb')
EYES = {'Object_2.003', 'Object_2.004'}; ANT = {'Object_5.002', 'Object_5.003'}; MOUTH = {'Object_2'}; WINGS = {'Object_2.009', 'Object_2.010'}
HEADPARTS = {'Object_2.001', 'Object_2.006'}  # face plate + head capsule (replaced)
HC = (4.785, -0.20, 2.32)  # head centre in model units
def fly_materials():
    eye = mat('eye', lin(120, 44, 34), 0.5, **{'Coat Weight': 0.35, 'Coat Roughness': 0.22})
    n, l = nodes(eye); b = n['Principled BSDF']; tc = n.new('ShaderNodeTexCoord'); vr = n.new('ShaderNodeTexVoronoi'); vr.feature = 'DISTANCE_TO_EDGE'
    vr.inputs['Scale'].default_value = 220; l.new(tc.outputs['Object'], vr.inputs['Vector'])
    cr = n.new('ShaderNodeValToRGB'); cr.color_ramp.elements[0].position = 0.0; cr.color_ramp.elements[0].color = lin(30, 10, 8)
    cr.color_ramp.elements[1].position = 0.16; cr.color_ramp.elements[1].color = lin(132, 48, 36); l.new(vr.outputs['Distance'], cr.inputs['Fac'])
    # darker towards the rim (fresnel-ish)
    lw = n.new('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.35; mx = n.new('ShaderNodeMix'); mx.data_type = 'RGBA'
    mx.inputs['B'].default_value = lin(34, 12, 10); l.new(lw.outputs['Facing'], mx.inputs['Factor']); l.new(cr.outputs['Color'], mx.inputs['A']); l.new(mx.outputs['Result'], b.inputs['Base Color'])
    bp = n.new('ShaderNodeBump'); bp.inputs['Strength'].default_value = 1.0; bp.inputs['Distance'].default_value = 0.02; l.new(vr.outputs['Distance'], bp.inputs['Height']); l.new(bp.outputs['Normal'], b.inputs['Normal'])
    body = mat('body', lin(24, 24, 26), 0.45, **{'Coat Weight': 0.28, 'Coat Roughness': 0.2})
    mottle(body, lin(46, 46, 48), lin(110, 110, 108), 9, 0.45, 0.7); add_bump(body, [('noise', 30, 0.25), ('cells', 120, 0.15)], mul=0.4)
    # housefly-style grey/black longitudinal stripes across the thorax (model x is lateral, centre 4.78)
    n, l = nodes(body); b = n['Principled BSDF']; tc = n.new('ShaderNodeTexCoord'); sx = n.new('ShaderNodeSeparateXYZ'); l.new(tc.outputs['Object'], sx.inputs[0])
    m1 = n.new('ShaderNodeMath'); m1.operation = 'SUBTRACT'; m1.inputs[1].default_value = 4.78; l.new(sx.outputs['X'], m1.inputs[0])
    m2 = n.new('ShaderNodeMath'); m2.operation = 'MULTIPLY'; m2.inputs[1].default_value = 2 * math.pi / 0.30; l.new(m1.outputs[0], m2.inputs[0])
    m3 = n.new('ShaderNodeMath'); m3.operation = 'COSINE'; l.new(m2.outputs[0], m3.inputs[0])
    rp = n.new('ShaderNodeValToRGB'); rp.color_ramp.elements[0].position = 0.35; rp.color_ramp.elements[0].color = lin(20, 20, 22); rp.color_ramp.elements[1].position = 0.75; rp.color_ramp.elements[1].color = lin(118, 118, 114)
    m4 = n.new('ShaderNodeMath'); m4.operation = 'MULTIPLY_ADD'; m4.inputs[1].default_value = 0.5; m4.inputs[2].default_value = 0.5; l.new(m3.outputs[0], m4.inputs[0]); l.new(m4.outputs[0], rp.inputs['Fac'])
    mixc = n.new('ShaderNodeMix'); mixc.data_type = 'RGBA'; mixc.blend_type = 'MULTIPLY'; mixc.inputs['Factor'].default_value = 1.0
    old = [lk for lk in b.inputs['Base Color'].links][0].from_socket; l.new(old, mixc.inputs['A']); l.new(rp.outputs['Color'], mixc.inputs['B'])
    br = n.new('ShaderNodeMath'); br.operation = 'MULTIPLY'; br.inputs[1].default_value = 3.2; bri = n.new('ShaderNodeMixRGB'); bri.blend_type = 'MULTIPLY'; bri.inputs['Fac'].default_value = 1; bri.inputs['Color2'].default_value = (2.2, 2.2, 2.2, 1)
    l.new(mixc.outputs['Result'], bri.inputs['Color1']); l.new(bri.outputs['Color'], b.inputs['Base Color'])
    abd = mat('abd', lin(26, 24, 24), 0.42, **{'Coat Weight': 0.3, 'Coat Roughness': 0.18})
    mottle(abd, lin(18, 17, 17), lin(70, 68, 66), 7, 0.56, 0.74); add_bump(abd, [('noise', 26, 0.25), ('cells', 110, 0.15)], mul=0.4)
    leg = mat('leg', lin(20, 18, 18), 0.45, **{'Coat Weight': 0.25, 'Coat Roughness': 0.25}); add_bump(leg, [('noise', 60, 0.4), ('cells', 160, 0.35), ('noise', 9, 0.3)], mul=0.6)
    bristle = mat('bristle', lin(10, 9, 9), 0.32)
    wing = mat('wing', lin(170, 180, 190), 0.15, **{'Alpha': 0.05, 'Transmission Weight': 0.0, 'Coat Weight': 0.15})
    mouth = mat('mouth', lin(206, 110, 34), 0.3, **{'Subsurface Weight': 0.3, 'Subsurface Radius': (1, .5, .2), 'Coat Weight': 0.5})
    ant = mat('ant', lin(22, 18, 16), 0.4)
    return dict(eye=eye, body=body, abd=abd, leg=leg, bristle=bristle, wing=wing, mouth=mouth, ant=ant)

def load_fly(sc, length=3.4):
    before = set(sc.objects); bpy.ops.import_scene.gltf(filepath=FLY_GLB)
    for name in ['Object_2', 'Object_5']:
        o = sc.objects[name]; bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
        bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.separate(type='LOOSE'); bpy.ops.object.mode_set(mode='OBJECT')
    M = fly_materials(); parts = [o for o in sc.objects if o not in before and o.type == 'MESH']
    for o in parts:
        n = o.name
        if n in EYES: m = M['eye']
        elif n in WINGS: m = M['wing']
        elif n in MOUTH: m = M['mouth']
        elif n in ANT: m = M['ant']
        elif n.startswith('Object_4'): m = M['bristle']
        elif n.startswith('Object_3'): m = M['leg']
        elif n == 'Object_5.009': m = M['abd']
        else: m = M['body']
        o.data.materials.clear(); o.data.materials.append(m)
        for p in o.data.polygons: p.use_smooth = True
        if n.startswith('Object_3'):
            d = o.modifiers.new('thick', 'DISPLACE'); d.strength = 0.014; d.mid_level = 0
    # pivot: centre between the feet, fly faces -Y, scale to `length`
    mn = V((1e9,) * 3); mx = -mn
    for o in parts:
        for c in o.bound_box: w = o.matrix_world @ V(c); mn = V(map(min, mn, w)); mx = V(map(max, mx, w))
    piv = bpy.data.objects.new('PIV', None); sc.collection.objects.link(piv)
    s = length / (mx.y - mn.y); piv.scale = (s, s, s); piv.location = (-(mn.x + mx.x) / 2 * s, -(mn.y + mx.y) / 2 * s, -mn.z * s)
    roots = [o for o in sc.objects if o not in before and o.parent is None and o != piv]
    for o in roots: o.parent = piv
    fly = bpy.data.objects.new('FLY', None); sc.collection.objects.link(fly); piv.parent = fly
    for o in parts:
        if o.name in EYES | ANT | HEADPARTS: o.hide_render = True; o.hide_viewport = True
    build_head(sc, piv, M)
    for e in [o for o in sc.objects if o not in before and o.type == 'EMPTY' and o.name not in ('PIV', 'FLY')]: pass
    return fly, parts, M

def head_point(sc):  # world position of the head centre
    return sc.objects['HEADCAP'].matrix_world.translation.copy()

def camera(sc, loc, target, lens=50, fstop=None, focus=None, roll=0):
    cam = sc.camera
    if cam is None: cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
    cam.location = loc; q = (V(target) - V(loc)).to_track_quat('-Z', 'Y'); cam.rotation_euler = q.to_euler(); cam.rotation_euler.rotate_axis('Z', math.radians(roll))
    cam.data.lens = lens; cam.data.clip_start = 0.005; cam.data.clip_end = 2000; cam.data.sensor_width = 36
    if fstop: cam.data.dof.use_dof = True; cam.data.dof.aperture_fstop = fstop; cam.data.dof.focus_distance = focus or (V(target) - V(loc)).length
    return cam

def render(sc, path, w=720, h=1280, spp=32):
    sc.render.resolution_x, sc.render.resolution_y = w, h; sc.cycles.samples = spp; sc.render.filepath = path
    bpy.ops.render.render(write_still=True)

# ── fur: tapered hair strands grown on a part's evaluated surface (call after the fly is placed) ──
import numpy as np
def fur(sc, objs, n, length, radius, material, sweep=(0, 0.6, 0.2), jitter=0.35, seed=1, parent=None, up_only=False):
    dg = bpy.context.evaluated_depsgraph_get(); P, N, A = [], [], []
    for o in objs:
        ev = o.evaluated_get(dg); me = ev.to_mesh(); me.calc_loop_triangles(); mw = o.matrix_world; nm = mw.to_3x3().inverted().transposed()
        nt = len(me.loop_triangles)
        if nt == 0: ev.to_mesh_clear(); continue
        co = np.empty(len(me.vertices) * 3, dtype=np.float32); me.vertices.foreach_get('co', co); co = co.reshape(-1, 3)
        tri = np.empty(nt * 3, dtype=np.int32); me.loop_triangles.foreach_get('vertices', tri); tri = tri.reshape(-1, 3)
        M = np.array(mw); W = co @ M[:3, :3].T + M[:3, 3]
        a, b, c = W[tri[:, 0]], W[tri[:, 1]], W[tri[:, 2]]; cr = np.cross(b - a, c - a); ar = np.linalg.norm(cr, axis=1) / 2
        P.append((a, b, c)); N.append(cr / np.maximum(ar[:, None] * 2, 1e-12)); A.append(ar); ev.to_mesh_clear()
    if not A: return None
    a = np.concatenate([p[0] for p in P]); b = np.concatenate([p[1] for p in P]); c = np.concatenate([p[2] for p in P]); nn = np.concatenate(N); ar = np.concatenate(A)
    rng = np.random.default_rng(seed); idx = rng.choice(len(ar), size=n, p=ar / ar.sum()); u = rng.random(n); v = rng.random(n); f = u + v > 1; u[f] = 1 - u[f]; v[f] = 1 - v[f]
    pts = a[idx] + (b[idx] - a[idx]) * u[:, None] + (c[idx] - a[idx]) * v[:, None]; nor = nn[idx]
    cu = bpy.data.curves.new('fur', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = radius; cu.bevel_resolution = 1; cu.use_fill_caps = False
    sw = np.array(sweep)
    for i in range(n):
        d = nor[i] + sw + rng.normal(0, jitter, 3); d /= np.linalg.norm(d) + 1e-9; L = length * (0.5 + rng.random())
        sp = cu.splines.new('POLY'); sp.points.add(2)
        for k in range(3):
            t = k / 2; q = pts[i] + d * L * t + np.array((0, 0, -0.25 * L * t * t)); sp.points[k].co = (*q, 1); sp.points[k].radius = 1 - 0.85 * t
    ob = bpy.data.objects.new('fur', cu); sc.collection.objects.link(ob); cu.materials.append(material)
    if parent: ob.parent = parent; ob.matrix_parent_inverse = parent.matrix_world.inverted()
    return ob

def fly_fur(sc, fly, M, k=1.0):
    bpy.context.view_layer.update()
    body = [o for o in sc.objects if o.type == 'MESH' and o.data.materials and o.data.materials[0].name in ('body', 'abd')]
    legs = [o for o in sc.objects if o.type == 'MESH' and o.data.materials and o.data.materials[0].name == 'leg']
    hm = mat('furmat', lin(22, 21, 21), 0.4); hm2 = mat('furlight', lin(170, 166, 160), 0.35)
    fur(sc, body, int(3200 * k), 0.065, 0.0024, hm, sweep=(0, 0.8, 0.1), seed=1, parent=fly)
    fur(sc, body, int(3000 * k), 0.045, 0.002, hm2, sweep=(0, 0.9, 0.0), seed=2, parent=fly)
    fur(sc, legs, int(3500 * k), 0.045, 0.0018, hm, sweep=(0, 0.2, -0.6), jitter=0.5, seed=3, parent=fly)

def ellipsoid(sc, name, loc, scale, mat_, parent, rot=(0, 0, 0), seg=96, rings=64):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=seg, ring_count=rings, radius=1)
    o = bpy.context.object; o.name = name; o.scale = scale; o.location = loc; o.rotation_euler = rot
    for p in o.data.polygons: p.use_smooth = True
    o.data.materials.append(mat_); o.parent = parent; return o

def build_head(sc, piv, M):
    """Smooth horsefly head in model units: big faceted eyes, narrow frons stripe, glossy face, antennae."""
    hx, hy, hz = HC
    eye = M['eye']; n, l = nodes(eye); vr = [x for x in n if x.type == 'TEX_VORONOI'][0]; vr.inputs['Scale'].default_value = 70
    for sg in (-1, 1):
        ellipsoid(sc, f'EYE{sg}', (hx + sg * 0.34, hy - 0.08, hz + 0.08), (0.37, 0.34, 0.50), eye, piv, rot=(math.radians(8), 0, math.radians(sg * 16)))
    cap = ellipsoid(sc, 'HEADCAP', (hx, hy + 0.08, hz + 0.02), (0.66, 0.40, 0.60), M['body'], piv)
    face = ellipsoid(sc, 'FACE', (hx, hy - 0.30, hz - 0.18), (0.20, 0.16, 0.36), M['leg'], piv, rot=(math.radians(-14), 0, 0))
    stripe = ellipsoid(sc, 'FRONS', (hx, hy - 0.26, hz + 0.30), (0.08, 0.10, 0.30), M['leg'], piv, rot=(math.radians(-10), 0, 0))
    am = mat('antenna', lin(40, 34, 28), 0.45, **{'Coat Weight': 0.3})
    for sg in (-1, 1):  # antennae: scape + pedicel + flattened flagellum + fine arista
        ellipsoid(sc, f'ANT1{sg}', (hx + sg * 0.07, hy - 0.42, hz + 0.02), (0.035, 0.035, 0.06), am, piv, seg=24, rings=16)
        ellipsoid(sc, f'ANT2{sg}', (hx + sg * 0.08, hy - 0.46, hz - 0.12), (0.045, 0.04, 0.13), am, piv, rot=(math.radians(-12), 0, 0), seg=24, rings=16)
        cu = bpy.data.curves.new('ar', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.006; sp = cu.splines.new('POLY'); sp.points.add(1)
        sp.points[0].co = (hx + sg * 0.09, hy - 0.47, hz - 0.05, 1); sp.points[1].co = (hx + sg * 0.32, hy - 0.62, hz + 0.02, 1)
        ob = bpy.data.objects.new('arista', cu); sc.collection.objects.link(ob); cu.materials.append(am); ob.parent = piv
