# Samulation #3 "Nest of Bees" - path-traced world for every shot (Cycles). 2D cast + FX are composited on top.
#   blender -b -P nest.py -- --shot P1 --w 2160 --h 3840 --samples 48 --out plate.png [--layer plate|cart|arrow] [--poses ...] [--dry 1]
# Outside the fort is -Y (down the hill). Walkway top at Z=6. Exports, per shot, the camera projection + world anchors (JSON).
import bpy, sys, os, json, math, random
from mathutils import Vector, Euler, Matrix
HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import blib; from blib import img, pbr, flat, cube, cyl, curve
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []; A = {k[2:]: v for k, v in zip(argv[::2], argv[1::2])}
ASSET = A.get('assets', os.path.join(HERE, '..', 'assets')); blib.setup(ASSET)
SHOT, RW, RH, SAMP, OUT = A.get('shot', 'P1'), int(A.get('w', 1080)), int(A.get('h', 1920)), int(A.get('samples', 32)), A.get('out', '/tmp/p.png')
LAYER = A.get('layer', 'plate'); random.seed(5)
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
FLOOR = 6.0
def hT(x, y):
    if y > -3.3: return 0.0
    d = -3.3 - y; return -min(d, 90) * 0.2 - max(0, d - 90) * 0.05 + math.sin(x * 0.11 + y * 0.07) * 0.6 * min(1, d / 15) + math.sin(x * 0.031 - y * 0.05) * 1.2 * min(1, d / 30)
# ── sky + sun ──
w = bpy.data.worlds.new('sky'); sc.world = w; w.use_nodes = True; wn = w.node_tree.nodes; wl = w.node_tree.links
env = wn.new('ShaderNodeTexEnvironment'); env.image = img(f'{ASSET}/sky.hdr'); mp = wn.new('ShaderNodeMapping'); tc = wn.new('ShaderNodeTexCoord')
mp.inputs['Rotation'].default_value = (0, 0, math.radians(200)); wl.new(tc.outputs['Generated'], mp.inputs['Vector']); wl.new(mp.outputs['Vector'], env.inputs['Vector'])
wl.new(env.outputs['Color'], wn['Background'].inputs['Color']); wn['Background'].inputs['Strength'].default_value = 1.1
bpy.ops.object.light_add(type='SUN', rotation=(math.radians(42), 0, math.radians(-35))); sun = bpy.context.object; sun.data.energy = 4.5; sun.data.angle = math.radians(2.5); sun.data.color = (1.0, 0.95, 0.88)
# ── materials ──
stone = pbr('stone', f'{ASSET}/rock_surface', scale=0.6, mapping='box', sat=0.12, val=1.9); mortar = flat('mortar', (0.16, 0.15, 0.14), 0.95)
oak = pbr('oak', f'{ASSET}/plywood', scale=1.2, tint=(1.35, 1.2, 1.0), rough=0.6); cherry = pbr('cherry', f'{ASSET}/lacquered_cherry_wood', scale=2, tint=(1.15, 0.85, 0.8))
iron = flat('iron', (0.035, 0.035, 0.04), 0.4, 0.85); brass = flat('brass', (0.75, 0.52, 0.2), 0.3, 1.0); turf = pbr('turf', f'{ASSET}/leafy_grass', scale=0.35, mapping='box', tint=(0.62, 0.95, 0.45))
# ── block masonry: three linked block meshes, laid in running bond on a wall face ──
BL = {}
def blockmesh(w):
    if w in BL: return BL[w]
    o = cube('b%.2f' % w, (w - 0.03, 0.5, 0.44 - 0.03), (0, 0, 0), stone, bevel=0.035); m = o.modifiers['bev']
    bpy.context.view_layer.objects.active = o; bpy.ops.object.modifier_apply(modifier=m.name); BL[w] = o.data; bpy.data.objects.remove(o); return BL[w]
def face(x0, x1, z0, z1, y, rotz=0.0, jitter=0.02, ox=0.0):
    r = 0; z = z0
    while z < z1 - 0.05:
        x = x0 - (r % 2) * 0.45 - random.uniform(0, 0.2)
        while x < x1:
            wdt = random.choice([0.8, 0.95, 1.1]); cx = x + wdt / 2
            if cx > x0 - 0.2 and cx < x1 + 0.2:
                o = bpy.data.objects.new('blk', blockmesh(wdt)); sc.collection.objects.link(o)
                lp = Vector((cx, y + random.uniform(-jitter, jitter), z + 0.22)); o.location = Matrix.Rotation(rotz, 4, 'Z') @ lp if rotz else lp
                if ox: o.location.x += ox
                o.rotation_euler.z = rotz
            x += wdt
        z += 0.44; r += 1
# curtain wall body (mortar core) + masonry faces
cube('core', (34, 5.9, FLOOR), (0, 0, FLOOR / 2), mortar)
face(-17, 17, -1.5, FLOOR, -3.0); face(-17, 17, 0, FLOOR, 3.0)
cube('base_out', (34, 1.0, 1.6), (0, -3.3, -0.8), stone, bevel=0.05)
# walkway slabs
slab = cube('slab0', (0.98, 0.78, 0.12), (0, 0, 0), stone, bevel=0.02); bpy.context.view_layer.objects.active = slab; bpy.ops.object.modifier_apply(modifier='bev'); sd = slab.data; bpy.data.objects.remove(slab)
for i in range(-16, 17):
    for j in range(-3, 4):
        o = bpy.data.objects.new('slab', sd); sc.collection.objects.link(o); o.location = (i + (j % 2) * 0.5, j * 0.8, FLOOR + 0.06 + random.uniform(-0.01, 0.01)); o.rotation_euler.z = random.uniform(-0.01, 0.01)
# parapet (outer) with merlons, low inner wall
cube('par_core', (34, 0.4, 1.2), (0, -2.85, FLOOR + 0.6), mortar)
face(-17, 17, FLOOR, FLOOR + 0.88, -2.6); face(-17, 17, FLOOR, FLOOR + 0.88, -3.1)
for i in range(-10, 11):
    x = i * 1.65; m = cube('merlon', (0.95, 0.6, 0.85), (x, -2.85, FLOOR + 0.88 + 0.43), stone, bevel=0.04)
cube('inner', (34, 0.45, 0.55), (0, 2.75, FLOOR + 0.275), stone, bevel=0.04)
# tower on the walkway with the banner
cube('tower_core', (4.6, 6.4, 7.5), (-9, 0, FLOOR + 3.75), mortar)
face(-11.3, -6.7, FLOOR, FLOOR + 7.4, -3.25); face(-11.3, -6.7, FLOOR, FLOOR + 7.4, 3.25)
face(-3.2, 3.2, FLOOR, FLOOR + 7.4, 6.7, rotz=math.pi / 2)   # +x face (toward the action)
for i in range(3):
    for yy in (-2.9, 2.9): cube('tm', (0.9, 0.6, 0.8), (-10.6 + i * 1.6, yy, FLOOR + 7.85), stone, bevel=0.04)
ban = bpy.data.materials.new('banner'); ban.use_nodes = True; bt = ban.node_tree.nodes.new('ShaderNodeTexImage'); bt.image = img(os.path.join(HERE, 'banner.png'))
ban.node_tree.links.new(bt.outputs['Color'], ban.node_tree.nodes['Principled BSDF'].inputs['Base Color']); ban.node_tree.nodes['Principled BSDF'].inputs['Sheen Weight'].default_value = 0.6
bpy.ops.mesh.primitive_plane_add(size=1, location=(-6.4, 0.0, FLOOR + 4.3), rotation=(math.radians(90), 0, math.radians(90))); bo = bpy.context.object; bo.scale = (1.1, 2.8, 1); bpy.ops.object.transform_apply(scale=True)
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.subdivide(number_cuts=20); bpy.ops.object.mode_set(mode='OBJECT')
for v in bo.data.vertices: v.co.z += math.sin(v.co.x * 9) * 0.02
bo.data.materials.append(ban); bo.modifiers.new('s', 'SOLIDIFY').thickness = 0.012
# braziers + spear rack clutter
for x in (-4.5, 7.5): cyl(0.28, Vector((x, -2.0, FLOOR + 0.72)), Vector((x, -2.0, FLOOR + 1.0)), iron); cyl(0.04, Vector((x, -2.0, FLOOR)), Vector((x, -2.0, FLOOR + 0.75)), iron)
# ── terrain: the hill outside, the courtyard inside ──
bpy.ops.mesh.primitive_grid_add(x_subdivisions=220, y_subdivisions=220, size=1); tg = bpy.context.object; tg.scale = (240, 240, 1); bpy.ops.object.transform_apply(scale=True)
tg.location = (0, -120 - 3.3, 0)
for v in tg.data.vertices: wx, wy = v.co.x, v.co.y - 120 - 3.3; v.co.z = hT(wx, wy)
tg.data.materials.append(turf)
bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 32, 0)); tg2 = bpy.context.object; tg2.data.materials.append(turf)
for i in range(14):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=60 + random.random() * 50, location=(-260 + i * 40, -330 - random.random() * 60, -60)); h = bpy.context.object; h.scale.z = 0.3; h.data.materials.append(flat('hill', (0.27, 0.36, 0.17), 0.95))
# grass clumps: scanned clumps scattered by density near the wall foot and on the enemy's slope
bpy.ops.import_scene.gltf(filepath=f'{ASSET}/grass_medium_01/grass_medium_01.gltf'); parts = [o for o in bpy.context.selected_objects if o.type == 'MESH']
alpha = img(f'{ASSET}/grass_medium_01/textures/grass_medium_01_alpha_1k.png', True)
for o in parts:
    for m in o.data.materials:
        nt = m.node_tree; b = nt.nodes['Principled BSDF']; t = nt.nodes.new('ShaderNodeTexImage'); t.image = alpha; uv = nt.nodes.new('ShaderNodeUVMap'); nt.links.new(uv.outputs['UV'], t.inputs['Vector']); nt.links.new(t.outputs['Color'], b.inputs['Alpha'])
gcol = bpy.data.collections.new('grass'); sc.collection.children.link(gcol)
for o in parts:
    for c in o.users_collection: c.objects.unlink(o)
    gcol.objects.link(o); o.location = (500, 500, 0)
vg = tg.vertex_groups.new(name='dens')
for v in tg.data.vertices:
    x = v.co.x; wy = v.co.y + tg.location.y; dn = 0.0
    if -60 < wy < -3.6 and abs(x) < 26: dn = 1.0 if wy > -40 else 0.4
    vg.add([v.index], dn, 'REPLACE')
ps = tg.modifiers.new('grass', 'PARTICLE_SYSTEM').particle_system; pst = ps.settings
pst.type = 'HAIR'; pst.count = int(A.get('grassn', 160000)); pst.hair_length = 1; pst.render_type = 'COLLECTION'; pst.instance_collection = gcol
pst.use_rotations = True; pst.rotation_mode = 'NOR'; pst.phase_factor_random = 2.0; pst.particle_size = 2.4; pst.size_random = 0.5; pst.use_advanced_hair = True; ps.vertex_group_density = 'dens'
# ── the launcher: cart + hexagonal box + 32 rocket arrows + fuses joined into one rope ──
LX, LY = float(A.get('lx', 1.6)), float(A.get('ly', -1.1))
cart = bpy.data.objects.new('cart', None); sc.collection.objects.link(cart); cart.location = (LX, LY, FLOOR)
def P_(o, parent=cart): o.parent = parent; return o
WHEELS = []
for sx in (-0.62, 0.62):
    wg = bpy.data.objects.new('wheel', None); sc.collection.objects.link(wg); wg.parent = cart; wg.location = (sx, 0.05, 0.42); wg.rotation_mode = 'ZYX'; wg.rotation_euler = (0, math.radians(90), 0); WHEELS.append(wg)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.4, minor_radius=0.035, major_segments=48, minor_segments=10); t = bpy.context.object; t.data.materials.append(cherry); t.parent = wg
    bpy.ops.mesh.primitive_torus_add(major_radius=0.41, minor_radius=0.012, major_segments=48, minor_segments=6); t2 = bpy.context.object; t2.data.materials.append(iron); t2.parent = wg
    hub = cyl(0.07, Vector((0, 0, -0.07)), Vector((0, 0, 0.07)), brass); hub.parent = wg
    for k in range(10):
        a = k / 10 * math.tau; sp = cyl(0.016, Vector((0, 0, 0)), Vector((math.cos(a) * 0.38, math.sin(a) * 0.38, 0)), cherry, 8); sp.parent = wg
P_(cyl(0.035, Vector((-0.7, 0.05, 0.42)), Vector((0.7, 0.05, 0.42)), iron))
P_(cube('bed', (1.0, 1.25, 0.06), (0, 0.05, 0.66), oak, bevel=0.01))
for sx in (-0.42, 0.42): P_(cube('rail', (0.06, 1.9, 0.06), (sx, 0.6, 0.62), cherry, bevel=0.01)); P_(cube('leg', (0.05, 0.05, 0.36), (sx, 1.38, 0.42), cherry))
HANDLES = [Vector((sx, 1.5, 0.62)) for sx in (-0.42, 0.42)]
for h in HANDLES: P_(cyl(0.03, h + Vector((0, -0.05, 0)), h + Vector((0, 0.1, 0)), cherry))
box = bpy.data.objects.new('box', None); sc.collection.objects.link(box); box.parent = cart; box.location = (0, -0.05, 1.04); box.rotation_euler = (math.radians(-15), 0, 0)
R, L = 0.34, 1.0   # box axis = local -Y (out over the parapet)
bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=R, depth=L, rotation=(math.radians(90), 0, 0)); hexb = bpy.context.object; hexb.data.materials.append(oak); hexb.parent = box; hexb.rotation_euler = (math.radians(90), math.radians(30), 0)
sol = hexb.modifiers.new('in', 'SOLIDIFY'); sol.thickness = 0.03
# remove end caps so the box is a hollow tube, then add front + back plates
import bmesh
bm = bmesh.new(); bm.from_mesh(hexb.data); bmesh.ops.delete(bm, geom=[f for f in bm.faces if len(f.verts) == 6], context='FACES_ONLY'); bm.to_mesh(hexb.data); bm.free()
for yy in (-L / 2, L / 2):
    bpy.ops.mesh.primitive_torus_add(major_radius=R, minor_radius=0.028, major_segments=6, minor_segments=8, location=(0, yy, 0), rotation=(math.radians(90), math.radians(30), 0)); rg = bpy.context.object; rg.data.materials.append(brass); rg.parent = box
for k in range(6):
    a = math.radians(30) + k * math.pi / 3; e = cube('edge', (0.035, L, 0.035), (math.cos(a) * R, 0, math.sin(a) * R), cherry); e.parent = box
def hole_layout(Rh=0.3):
    out = []; s = Rh / 3.6
    for j in range(-4, 5):
        for i in range(-5, 6):
            x, y = (i + (j % 2) * 0.5) * s * 1.05, j * s * 0.91
            if math.hypot(x, y) < Rh * 0.86: out.append((x, y))
    out.sort(key=lambda p: math.hypot(*p)); return out[:32]
HOLES = hole_layout()
def plate(yy, name, holes=True):
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=R * 0.98, depth=0.04, location=(0, yy, 0), rotation=(math.radians(90), math.radians(30), 0)); p = bpy.context.object; p.name = name; p.data.materials.append(oak); p.parent = box
    if holes:
        for (hx, hz) in HOLES:
            bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.019, depth=0.2, location=(hx, yy, hz), rotation=(math.radians(90), 0, 0)); c = bpy.context.object; c.parent = box
            m = p.modifiers.new('h', 'BOOLEAN'); m.object = c; m.operation = 'DIFFERENCE'; c.hide_render = True; c.hide_viewport = True
    return p
front = plate(-L / 2 - 0.02, 'front'); back = plate(L / 2 + 0.02, 'back')
paper = flat('paper', (0.62, 0.08, 0.05), 0.75); gold = flat('band', (0.85, 0.65, 0.2), 0.5, 0.3); bamboo = flat('bamboo', (0.66, 0.52, 0.3), 0.6); feather = flat('feather', (0.92, 0.9, 0.85), 0.9)
def arrow(parent, loc, scale=1.0):
    g = bpy.data.objects.new('arrow', None); sc.collection.objects.link(g); g.parent = parent; g.location = loc; g.scale = (scale,) * 3
    tip = cyl(0.002, Vector((0, -0.075, 0)), Vector((0, 0, 0)), iron, 8); bpy.ops.mesh.primitive_cone_add(vertices=10, radius1=0.014, depth=0.07, location=(0, -0.035, 0), rotation=(math.radians(90), 0, 0)); cn = bpy.context.object; cn.data.materials.append(iron); cn.parent = g; tip.parent = g
    tb = cyl(0.021, Vector((0, 0.01, 0)), Vector((0, 0.17, 0)), paper, 16); tb.parent = g; bd = cyl(0.0215, Vector((0, 0.06, 0)), Vector((0, 0.075, 0)), gold, 16); bd.parent = g
    sh = cyl(0.006, Vector((0, 0.0, 0)), Vector((0, 0.9, 0)), bamboo, 8); sh.parent = g
    for k in range(3):
        bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0.83, 0)); f = bpy.context.object; f.scale = (0.025, 0.09, 1); f.rotation_euler = (0, k * 2.094, 0); f.data.materials.append(feather); f.parent = g
    return g
ARROWS = [arrow(box, Vector((hx, -L / 2 + 0.06, hz))) for (hx, hz) in HOLES]
fuseM = flat('fuse', (0.2, 0.14, 0.09), 0.9); ropeM = flat('rope', (0.36, 0.26, 0.15), 0.85)
KNOT_L = Vector((0, L / 2 + 0.16, -0.12))
for (hx, hz) in HOLES:
    c = curve('fuse', [Vector((hx, -L / 2 + 0.25, hz)), Vector((hx * 0.95, L / 2 + 0.01, hz * 0.95)), Vector((hx * 0.35, L / 2 + 0.09, hz * 0.35 - 0.06)), KNOT_L], 0.004, fuseM, 2); c.parent = box
bpy.context.view_layer.update()
KNOT = box.matrix_world @ KNOT_L
ROPE_END = Vector(map(float, A.get('rope', f'{LX + 0.45},{LY + 1.85},{FLOOR + 1.0}').split(',')))
ropeO = curve('rope', [KNOT, KNOT + Vector((0, 0.15, -0.1)), (KNOT + ROPE_END) / 2 + Vector((0, 0, -0.3)), ROPE_END], 0.011, ropeM, 4)
for o in ARROWS: pass
if A.get('nofront'): front.hide_render = True
if A.get('norope'): ropeO.hide_render = True
# ── the army: 2D cards on the hill (image planes that face the camera) ──
CARDS = json.load(open(os.path.join(HERE, 'cards', 'cards.json'))); CM = {}
def cardmat(k):
    if k in CM: return CM[k]
    m = bpy.data.materials.new(k); m.use_nodes = True; nt = m.node_tree; b = nt.nodes['Principled BSDF']; t = nt.nodes.new('ShaderNodeTexImage'); t.image = img(os.path.join(HERE, 'cards', k + '.png'))
    nt.links.new(t.outputs['Color'], b.inputs['Base Color']); nt.links.new(t.outputs['Alpha'], b.inputs['Alpha']); b.inputs['Roughness'].default_value = 0.9
    em = b.inputs.get('Emission Color'); nt.links.new(t.outputs['Color'], em); b.inputs['Emission Strength'].default_value = 0.25; CM[k] = m; return m
ARMY = []
def army(front, pack, state, rows=20, cols=19, laughrows=0):
    for r in range(rows):
        for c in range(-(cols // 2), cols // 2 + 1):
            k = r * 31 + c + 9; v = k % 6; x = c * 1.7 * pack + random.uniform(-0.3, 0.3); y = front - r * 1.5 * pack + random.uniform(-0.25, 0.25)
            st = 'laugh' if (r < laughrows and random.random() > 0.35) else state; key = f'foe_{st}_{v}'; meta = CARDS[key]
            me = bpy.data.meshes.new('card'); hw, hh = meta['wm'] / 2, meta['hm']; me.from_pydata([(-hw, 0, 0), (hw, 0, 0), (hw, 0, hh), (-hw, 0, hh)], [], [(0, 1, 2, 3)])
            uvl = me.uv_layers.new(); [setattr(uvl.data[i], 'uv', uvv) for i, uvv in enumerate([(0, 0), (1, 0), (1, 1), (0, 1)])]
            p = bpy.data.objects.new('foe', me); sc.collection.objects.link(p); p.location = (x, y, hT(x, y) - 0.02); me.materials.append(cardmat(key)); ARMY.append(p)
# ── shots: camera + army state + visibility ──
cam_d = bpy.data.cameras.new('cam'); cam_d.sensor_fit = 'VERTICAL'; cam_d.sensor_height = 24.0; cam = bpy.data.objects.new('cam', cam_d); sc.collection.objects.link(cam); sc.camera = cam
HERO = {}
def shoot(loc, look, lens=35, fstop=5.6, focus=None):
    cam.location = Vector(loc); cam.rotation_euler = (Vector(look) - cam.location).to_track_quat('-Z', 'Y').to_euler(); cam_d.lens = lens
    cam_d.dof.use_dof = fstop < 50; cam_d.dof.aperture_fstop = fstop; cam_d.dof.focus_distance = ((Vector(focus) if focus else Vector(look)) - cam.location).length
BX = Vector((LX, LY, FLOOR))
if SHOT in ('P1',):     shoot((LX + 3.7, LY + 4.3, FLOOR + 1.5), (LX + 0.55, LY + 0.05, FLOOR + 0.95), 32, 5.6, (LX + 0.95, LY + 0.45, FLOOR + 1.0)); army(-24, 0.62, 'march')
elif SHOT == 'P2':      shoot((LX + 1.2, LY + 4.6, FLOOR + 3.3), (LX - 0.6, -28, -3.0), 30, 11); army(-24, 0.62, 'march')
elif SHOT == 'P3':      shoot((LX + 1.5, LY + 2.2, FLOOR + 1.3), (LX + 0.9, LY + 0.5, FLOOR + 1.15), 55, 2.8, (LX + 0.9, LY + 0.5, FLOOR + 1.15)); army(-24, 0.62, 'march')
elif SHOT == 'P4':      shoot((26, -46, 30), (-1, -14, 2), 34, 22); army(-62, 1.0, 'march')
elif SHOT == 'P5':      shoot((LX + 6.2, LY + 1.25, FLOOR + 1.45), (LX, LY + 1.25, FLOOR + 0.85), 32, 5.6, (LX, LY + 1.0, FLOOR + 0.8)); army(-24, 0.62, 'march')
elif SHOT == 'P6':      fp = box.matrix_world @ Vector((0, -L / 2, 0)); ax = (box.matrix_world.to_3x3() @ Vector((0, -1, 0))).normalized(); sd_ = ax.cross(Vector((0, 0, 1))).normalized(); shoot(fp + ax * 0.62 + sd_ * 0.18 + Vector((0, 0, 0.06)), fp, 45, 4.0, fp); front.hide_render = True
elif SHOT == 'P7':      shoot((LX + 1.7, LY + 3.8, FLOOR + 1.45), (LX + 0.15, LY + 0.9, FLOOR + 1.0), 35, 4.5, (LX + 0.3, LY + 1.4, FLOOR + 1.0)); army(-24, 0.62, 'march')
elif SHOT == 'P8':      zc = -18.0; shoot((0.8, zc, hT(0.8, zc) + 1.35), (0.1, -26, hT(0, -26) + 0.9), 35, 5.6, (0.2, -24.5, hT(0, -24.5) + 1.0)); army(-24, 0.62, 'march', laughrows=4)
elif SHOT == 'P9':      ro = arrow(None, Vector((0, -20, 30)), 1.6); ro.rotation_euler = (math.radians(8), 0, 0); shoot((1.15, -20.3, 29.85), (0, -20.0, 30.0), 40, 2.8, (0, -20.05, 30.0))
elif SHOT == 'P10':     shoot((LX + 9, LY + 3, FLOOR + 10), (-2, -30, -4), 30, 22); army(-24, 0.62, 'march')
elif SHOT == 'P11':     shoot((3, -14, hT(0, -14) + 22), (0, -33, hT(0, -33)), 40, 22); army(-24, 0.62, 'shock')
elif SHOT == 'P12':     fp = box.matrix_world @ Vector((0, -L / 2, 0)); ax = (box.matrix_world.to_3x3() @ Vector((0, -1, 0))).normalized(); sd_ = ax.cross(Vector((0, 0, 1))).normalized(); shoot(fp + sd_ * 1.35 - ax * 0.15 + Vector((0, 0, 0.22)), fp + ax * 0.12 + Vector((0, 0, 0.02)), 40, 4.0, fp); army(-24, 0.62, 'shock')
for p in ARMY:
    con = p.constraints.new('LOCKED_TRACK'); con.target = cam; con.track_axis = 'TRACK_NEGATIVE_Y'; con.lock_axis = 'LOCK_Z'
sc.render.resolution_x, sc.render.resolution_y = RW, RH; bpy.context.view_layer.update()
# ── export: projection matrix + world anchors for the compositor ──
dg = bpy.context.evaluated_depsgraph_get(); PM = cam.calc_matrix_camera(dg, x=RW, y=RH) @ cam.matrix_world.inverted()
anc = {'cart': list(cart.matrix_world.translation), 'knot': list(KNOT), 'ropeEnd': list(ROPE_END), 'handles': [list(cart.matrix_world @ h) for h in HANDLES],
       'mouth': list(box.matrix_world @ Vector((0, -L / 2, 0))), 'rear': list(box.matrix_world @ Vector((0, L / 2, 0))),
       'holes': [list(box.matrix_world @ Vector((hx, -L / 2 - 0.03, hz))) for (hx, hz) in HOLES], 'axis': list((box.matrix_world.to_3x3() @ Vector((0, -1, 0))).normalized()),
       'boxTop': list(box.matrix_world @ Vector((0, 0, R))), 'rope': [list(p) for p in [KNOT, KNOT + Vector((0, 0.15, -0.1)), (KNOT + ROPE_END) / 2 + Vector((0, 0, -0.3)), ROPE_END]]}
json.dump({'w': RW, 'h': RH, 'P': [list(r) for r in PM], 'cam': list(cam.location), 'anchors': anc}, open(A.get('meta', OUT.replace('%02d', 'xx').rsplit('.', 1)[0] + '.json'), 'w'))
if A.get('dry'): print('DRY OK', SHOT); sys.exit(0)
# ── render ──
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMP; sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
sc.cycles.max_bounces = 6; sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'; sc.render.image_settings.file_format = 'PNG'
if LAYER == 'plate':
    if A.get('nocart'):
        for o in [cart] + list(cart.children_recursive) + [ropeO]: o.hide_render = True
    sc.render.film_transparent = False; sc.render.filepath = OUT; bpy.ops.render.render(write_still=True); print('WROTE', OUT)
else:
    # moving-prop layers: only the prop is visible; walkway/box catch its shadow and occlude it; everything else still lights it
    keep = set([cart] + list(cart.children_recursive)) if LAYER == 'cart' else set()
    sc.render.film_transparent = True; tg.modifiers['grass'].show_render = False
    if LAYER == 'arrow':
        mover = ARROWS[0]; keep = set([mover] + list(mover.children_recursive))
    for o in bpy.data.objects:
        if o.type not in ('MESH', 'CURVE') or o in keep: continue
        if LAYER == 'arrow' and (o.parent == box or o.name.startswith('front') or o.name.startswith('hex')): o.is_shadow_catcher = True
        elif LAYER == 'cart' and o.name.startswith('slab'): o.is_shadow_catcher = True
        else: o.visible_camera = False
    poses = [float(q) for q in A.get('poses', '0').split(',')]
    for k, q in enumerate(poses):
        if LAYER == 'cart':
            for wg in WHEELS: wg.rotation_euler = (0, math.radians(90), math.radians(q))
        else: ARROWS[0].location = Vector((HOLES[0][0], -L / 2 + 0.06 - q, HOLES[0][1]))
        bpy.context.view_layer.update(); sc.render.filepath = OUT % k; bpy.ops.render.render(write_still=True); print('WROTE', OUT % k)
