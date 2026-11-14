# Samulation path-traced courtyard plate (Cycles). 2D hero is composited on top; his silhouette casts the real shadow.
#   blender -b -P courtyard.py -- --out plate.png --w 1080 --h 1920 --samples 48 [--hero hero.png] [--grips grips.json]
import bpy, bmesh, sys, json, math, random
from mathutils import Vector, Euler
from bpy_extras.object_utils import world_to_camera_view
argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
A = {k[2:]: v for k, v in zip(argv[::2], argv[1::2])}
OUT, RW, RH, SAMP = A.get('out', '/tmp/plate.png'), int(A.get('w', 1080)), int(A.get('h', 1920)), int(A.get('samples', 48))
import os; HERE = os.path.dirname(os.path.abspath(__file__)); ASSET = A.get('assets', os.path.join(HERE, '..', 'assets')); HERO = A.get('hero'); GRIPS = A.get('grips', os.path.join(HERE, 'grips.json'))
random.seed(7)
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
def img(p, non_color=False):
    i = bpy.data.images.load(p, check_existing=True)
    if non_color: i.colorspace_settings.name = 'Non-Color'
    return i
def pbr(name, folder, scale=1.0, tint=None, rough=None, mapping='uv', sat=None, val=None):
    m = bpy.data.materials.new(name); m.use_nodes = True; nt = m.node_tree; N = nt.nodes; L = nt.links; b = N['Principled BSDF']
    tc = N.new('ShaderNodeTexCoord'); mp = N.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (scale, scale, scale)
    L.new(tc.outputs['UV' if mapping == 'uv' else 'Object'], mp.inputs['Vector'])
    d = N.new('ShaderNodeTexImage'); d.image = img(f'{folder}/Diffuse.jpg'); L.new(mp.outputs['Vector'], d.inputs['Vector'])
    if mapping == 'box': d.projection = 'BOX'; d.projection_blend = 0.3
    col = d.outputs['Color']
    if tint:
        mx = N.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.blend_type = 'MULTIPLY'; mx.inputs['Factor'].default_value = 1.0
        L.new(col, mx.inputs['A']); mx.inputs['B'].default_value = (*tint, 1); col = mx.outputs['Result']
    if sat is not None:
        hs = N.new('ShaderNodeHueSaturation'); hs.inputs['Saturation'].default_value = sat; hs.inputs['Value'].default_value = val or 1.0; L.new(col, hs.inputs['Color']); col = hs.outputs['Color']
    L.new(col, b.inputs['Base Color'])
    n = N.new('ShaderNodeTexImage'); n.image = img(f'{folder}/nor_gl.jpg', True); L.new(mp.outputs['Vector'], n.inputs['Vector'])
    if mapping == 'box': n.projection = 'BOX'; n.projection_blend = 0.3
    nm = N.new('ShaderNodeNormalMap'); L.new(n.outputs['Color'], nm.inputs['Color']); L.new(nm.outputs['Normal'], b.inputs['Normal'])
    a = N.new('ShaderNodeTexImage'); a.image = img(f'{folder}/arm.jpg', True); L.new(mp.outputs['Vector'], a.inputs['Vector'])
    if mapping == 'box': a.projection = 'BOX'; a.projection_blend = 0.3
    sp = N.new('ShaderNodeSeparateColor'); L.new(a.outputs['Color'], sp.inputs['Color'])
    if rough is None: L.new(sp.outputs['Green'], b.inputs['Roughness'])
    else: b.inputs['Roughness'].default_value = rough
    return m
def flat(name, rgb, rough=0.5, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True; b = m.node_tree.nodes['Principled BSDF']; b.inputs['Base Color'].default_value = (*rgb, 1); b.inputs['Roughness'].default_value = rough; b.inputs['Metallic'].default_value = metal; return m
def cube(name, size, loc, mat, bevel=0.0, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc, rotation=rot); o = bpy.context.object; o.name = name; o.scale = size
    bpy.ops.object.transform_apply(scale=True)
    if bevel: m = o.modifiers.new('bev', 'BEVEL'); m.width = bevel; m.segments = 3; m.limit_method = 'ANGLE'
    o.data.materials.append(mat); bpy.ops.object.shade_smooth() if bevel else None; return o

# ── world: HDRI sky + warm sun ──
w = bpy.data.worlds.new('sky'); sc.world = w; w.use_nodes = True; wn = w.node_tree.nodes; wl = w.node_tree.links
env = wn.new('ShaderNodeTexEnvironment'); env.image = img(f'{ASSET}/sky.hdr'); mp = wn.new('ShaderNodeMapping'); tc = wn.new('ShaderNodeTexCoord')
mp.inputs['Rotation'].default_value = (0, 0, math.radians(200)); wl.new(tc.outputs['Generated'], mp.inputs['Vector']); wl.new(mp.outputs['Vector'], env.inputs['Vector'])
wl.new(env.outputs['Color'], wn['Background'].inputs['Color']); wn['Background'].inputs['Strength'].default_value = 1.1
bpy.ops.object.light_add(type='SUN', rotation=(math.radians(42), 0, math.radians(float(A.get('sunz', -55))))); sun = bpy.context.object; sun.data.energy = 4.5; sun.data.angle = math.radians(2.5); sun.data.color = (1.0, 0.95, 0.88)

# ── stone wall: individual bevelled blocks (mortar = recessed dark backing), corner pilaster ──
stone = pbr('stone', f'{ASSET}/rock_surface', scale=0.6, mapping='box', sat=0.12, val=1.9)
mortar = flat('mortar', (0.18, 0.17, 0.16), 0.95)
cube('backing', (9, 0.3, 5), (0, 2.35, 2.5), mortar)
row_h = 0.44
for r in range(11):
    x = -4.6 + (r % 2) * 0.45 + random.uniform(-0.1, 0.1)
    while x < 4.4:
        bw = random.uniform(0.75, 1.1); cube('blk', (bw - 0.025, 0.5, row_h - 0.025), (x + bw / 2, 2.0 - random.uniform(0, 0.02), r * row_h + row_h / 2), stone, bevel=0.035); x += bw
for r in range(11):   # pilaster: blocks wrapping a column that projects toward the camera
    wdt = 1.05 if r % 2 else 0.9
    cube('pil', (wdt, 0.62 if r % 2 else 0.55, row_h - 0.025), (0.55 + (0.05 if r % 2 else 0), 1.45, r * row_h + row_h / 2), stone, bevel=0.04)
# ── banner: plush blue cloth with our bee emblem, gold trim, fringe ──
ban = bpy.data.materials.new('banner'); ban.use_nodes = True; bn = ban.node_tree.nodes; bt = bn.new('ShaderNodeTexImage'); bt.image = img(os.path.join(HERE, 'banner.png')); ban.node_tree.links.new(bt.outputs['Color'], bn['Principled BSDF'].inputs['Base Color'])
bn['Principled BSDF'].inputs['Roughness'].default_value = 0.9; bn['Principled BSDF'].inputs['Sheen Weight'].default_value = 0.6
bpy.ops.mesh.primitive_plane_add(size=1, location=(1.75, 1.97, 3.55), rotation=(math.radians(90), 0, 0)); bo = bpy.context.object; bo.scale = (0.62, 1.5, 1); bo.data.materials.append(ban)
bpy.ops.object.transform_apply(scale=True); bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.subdivide(number_cuts=24); bpy.ops.object.mode_set(mode='OBJECT')
for v in bo.data.vertices: v.co.z += math.sin(v.co.x * 14) * 0.012 + math.sin(v.co.y * 5 + v.co.x * 3) * 0.008
s = bo.modifiers.new('sol', 'SOLIDIFY'); s.thickness = 0.012; bpy.ops.object.shade_smooth()
# ── ground: scanned dirt + scanned grass clumps scattered by a particle system ──
dirt = pbr('dirt', f'{ASSET}/dirt', scale=3.0, tint=(1.05, 1.0, 0.95))
bpy.ops.mesh.primitive_plane_add(size=12, location=(0, -2, 0)); gnd = bpy.context.object; gnd.data.materials.append(dirt)
bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.subdivide(number_cuts=60); bpy.ops.object.mode_set(mode='OBJECT')
bpy.ops.import_scene.gltf(filepath=f'{ASSET}/grass_medium_01/grass_medium_01.gltf'); parts = [o for o in bpy.context.selected_objects if o.type == 'MESH']
alpha = img(f'{ASSET}/grass_medium_01/textures/grass_medium_01_alpha_1k.png', True)
for o in parts:
    for m in o.data.materials:
        nt = m.node_tree; b = nt.nodes['Principled BSDF']; t = nt.nodes.new('ShaderNodeTexImage'); t.image = alpha
        uv = nt.nodes.new('ShaderNodeUVMap'); nt.links.new(uv.outputs['UV'], t.inputs['Vector']); nt.links.new(t.outputs['Color'], b.inputs['Alpha'])
        b.inputs['Roughness'].default_value = 0.6
        hs = nt.nodes.new('ShaderNodeHueSaturation'); bc = b.inputs['Base Color']
        if bc.links: src = bc.links[0].from_socket; nt.links.new(src, hs.inputs['Color']); nt.links.new(hs.outputs['Color'], bc); hs.inputs['Value'].default_value = 1.0; hs.inputs['Saturation'].default_value = 1.12; hs.inputs['Hue'].default_value = 0.5
coll = bpy.data.collections.new('grass'); sc.collection.children.link(coll)
for o in parts:
    for c in o.users_collection: c.objects.unlink(o)
    coll.objects.link(o); o.location = (50, 50, 0)
# density: weight paint keeps a bare patch where the hero stands and under the board
vg = gnd.vertex_groups.new(name='dens')
for v in gnd.data.vertices:
    p = gnd.matrix_world @ v.co
    bare = (p.y > 1.4) or ((p.x - 0.0) ** 2 / 0.7 ** 2 + (p.y - 0.35) ** 2 / 0.5 ** 2 < 1)
    vg.add([v.index], 0.08 if bare else 1.0, 'REPLACE')
ps = gnd.modifiers.new('grass', 'PARTICLE_SYSTEM').particle_system; pst = ps.settings
pst.type = 'HAIR'; pst.count = int(A.get('grassn', 14000)); pst.hair_length = 1; pst.render_type = 'COLLECTION'; pst.instance_collection = coll
pst.use_rotations = True; pst.rotation_mode = 'NOR'; pst.phase_factor_random = 2.0; pst.particle_size = 2.3; pst.size_random = 0.5; pst.use_advanced_hair = True
ps.vertex_group_density = 'dens'; ps.seed = 3
# ── honeycomb board: oak slab with real drilled holes, iron straps, bolts, feet ──
oak = pbr('oak', f'{ASSET}/plywood', scale=1.2, tint=(1.35, 1.2, 1.0), rough=0.6)
iron = flat('iron', (0.035, 0.035, 0.04), 0.4, 0.85); brass = flat('brass', (0.75, 0.52, 0.2), 0.3, 1.0)
board = bpy.data.objects.new('board', None); sc.collection.objects.link(board); board.location = (1.15, -0.25, 0); board.rotation_euler = (0, 0, math.radians(float(A.get('brot', 38))))
slab = cube('slab', (0.06, 0.95, 1.0), (0, 0, 0.95), oak); slab.parent = board
hl = []
for j in range(-3, 4):
    for i in range(-3, 4):
        y, z = (i + (j % 2) * 0.5) * 0.11, 0.95 + j * 0.105
        if abs(y) < 0.42 and len(hl) < 32: hl.append((y, z))
drilled = hl[:int(A.get('done', 31))]
for (y, z) in drilled:
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.022, depth=0.2, location=(0, y, z), rotation=(0, math.radians(90), 0)); c = bpy.context.object; c.parent = board
    m = slab.modifiers.new('h', 'BOOLEAN'); m.object = c; m.operation = 'DIFFERENCE'; c.hide_render = True; c.hide_viewport = True
for z in (0.5, 1.4):
    for sy in (-0.47, 0.47):
        st = cube('strap', (0.075, 0.07, 0.14), (0, sy, z), iron, bevel=0.008); st.parent = board
        for dz in (-0.035, 0.035):
            bpy.ops.mesh.primitive_uv_sphere_add(radius=0.012, location=(-0.04, sy, z + dz)); bb = bpy.context.object; bb.data.materials.append(brass); bb.parent = board
for sy in (-0.42, 0.42):
    p = cube('post', (0.08, 0.08, 0.5), (0.0, sy, 0.25), oak, bevel=0.01); p.parent = board
    f = cube('foot', (0.42, 0.14, 0.1), (0.0, sy, 0.05), oak, bevel=0.012); f.parent = board
bpy.context.view_layer.update()
# ── brace drill: steel crank (pipe), wooden head pad + crank grip, chuck, auger bit; axis perpendicular to the board ──
steel = flat('steel', (0.06, 0.08, 0.13), 0.35, 0.9); wood = pbr('grip', f'{ASSET}/lacquered_cherry_wood', scale=3, tint=(1.2, 0.9, 0.8))
tgt_l = Vector((-0.03, hl[31][0], hl[31][1]))   # target hole on the board face (local)
TG = board.matrix_world @ tgt_l; AX = (board.matrix_world.to_3x3() @ Vector((-1, 0, 0))).normalized()   # out of the board, toward the hero
UP = Vector((0, 0, 1)); SIDE = AX.cross(UP).normalized(); CR = float(A.get('crank', 40)) * math.pi / 180
def P(d, off=Vector((0, 0, 0))): return TG + AX * d + off
crank_off = (UP * math.cos(CR) + SIDE * math.sin(CR)) * 0.17
pts = [P(0.0), P(0.2), P(0.27), P(0.33) + crank_off, P(0.5) + crank_off, P(0.56), P(0.65), P(0.78)]
cd = bpy.data.curves.new('crank', 'CURVE'); cd.dimensions = '3D'; cd.bevel_depth = 0.011; cd.bevel_resolution = 4
sp = cd.splines.new('POLY'); sp.points.add(len(pts) - 1)
for k, p in enumerate(pts): sp.points[k].co = (*p, 1)
co = bpy.data.objects.new('crank', cd); sc.collection.objects.link(co); co.data.materials.append(steel)
def cyl(r, d, a, b, mat, verts=24):
    mid = (a + b) / 2; v = (b - a); bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=v.length, location=mid)
    o = bpy.context.object; o.rotation_mode = 'QUATERNION'; o.rotation_quaternion = v.normalized().to_track_quat('Z', 'Y'); o.data.materials.append(mat); bpy.ops.object.shade_smooth(); return o
grip = cyl(0.03, 0.14, P(0.35) + crank_off, P(0.48) + crank_off, wood)
pad = cyl(0.05, 0.07, P(0.78), P(0.86), wood); cyl(0.055, 0.015, P(0.775), P(0.79), brass)
chuck = cyl(0.034, 0.1, P(0.13), P(0.22), steel); cyl(0.038, 0.02, P(0.2), P(0.22), brass)
bit = cyl(0.0035, 0.14, P(-0.03), P(0.135), flat('bitm', (0.55, 0.57, 0.62), 0.22, 1.0), 12)   # auger core
hx = bpy.data.curves.new('auger', 'CURVE'); hx.dimensions = '3D'; hx.bevel_depth = 0.0028; hx.bevel_resolution = 3; hs_ = hx.splines.new('POLY'); NH = 160; hs_.points.add(NH - 1)
for k in range(NH):
    u = k / (NH - 1); d = -0.03 + u * 0.13; a = u * 7 * 2 * math.pi; q = P(d) + (SIDE * math.cos(a) + UP * math.sin(a)) * 0.0085; hs_.points[k].co = (*q, 1)
aug = bpy.data.objects.new('auger', hx); sc.collection.objects.link(aug); aug.data.materials.append(bit.data.materials[0])
DRILL = [co, grip, pad, chuck, bit, aug] + [o for o in bpy.data.objects if o.type == 'MESH' and o.data.materials and o.data.materials[0].name == 'brass' and (o.location - TG).length < 1.2 and o.parent is None]
rig = bpy.data.objects.new('rig', None); sc.collection.objects.link(rig); rig.location = TG; rig.rotation_mode = 'QUATERNION'; rig.rotation_quaternion = AX.to_track_quat('Z', 'Y')
bpy.context.view_layer.update(); RIG0 = rig.matrix_world.copy()
for o in DRILL: mw = o.matrix_world.copy(); o.parent = rig; o.matrix_world = mw
GRIP_L = rig.matrix_world.inverted() @ (P(0.415) + crank_off); PAD_L = rig.matrix_world.inverted() @ P(0.84)
def pose(ang, adv):
    rig.rotation_quaternion = AX.to_track_quat('Z', 'Y') @ Euler((0, 0, math.radians(ang))).to_quaternion(); rig.location = TG - AX * adv; bpy.context.view_layer.update()
# ── camera ──
cam_d = bpy.data.cameras.new('cam'); cam_d.lens = float(A.get('lens', 32)); cam_d.sensor_fit = 'VERTICAL'; cam_d.sensor_height = 24 * 16 / 9 * 0.5625 * 1.0
cam = bpy.data.objects.new('cam', cam_d); sc.collection.objects.link(cam); sc.camera = cam
hp0 = P(0.84) + AX * float(A.get('reach', 0.36)); mid = (hp0 + TG) / 2; mid.z = 1.0
SHOT = A.get('shot', 'A'); toA = (mid + Vector((-0.3, -4.1, 0.3)) - TG); toA.z = 0; toA.normalize()
if SHOT == 'A': cam.location = mid + Vector((-0.3, -4.9, 0.32)); look = mid + Vector((float(A.get('lx', 0.1)), 0, -0.05)); focus = mid
elif SHOT == 'B':
    sgn = 1 if SIDE.dot(toA) > 0 else -1
    cam.location = TG + AX * 0.42 + SIDE * sgn * 0.42 + UP * 0.12; look = TG + AX * 0.09; cam_d.lens = 50; focus = TG + AX * 0.06
else:
    bc = board.matrix_world @ Vector((0, 0, 0.95)); cam.location = bc + toA * 4.3 + UP * 0.25 + (toA.cross(UP)).normalized() * 0.55; look = bc + Vector((0, 0, -0.1)) + (toA.cross(UP)).normalized() * 0.42; focus = bc
cam.rotation_euler = (look - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam_d.dof.use_dof = True; cam_d.dof.focus_distance = (focus - cam.location).length; cam_d.dof.aperture_fstop = float(A.get('fstop', 2.8 if SHOT == 'B' else 4.0))
sc.render.resolution_x, sc.render.resolution_y = RW, RH
bpy.context.view_layer.update()
# grips + feet in image pixels for the 2D hero
def px(p): v = world_to_camera_view(sc, cam, p); return [v.x * RW, (1 - v.y) * RH]
hp = P(0.84) + AX * float(A.get('reach', 0.36)) if SHOT != 'C' else (board.matrix_world @ Vector((0, 0, 0))) + toA * 0.45 + (toA.cross(UP)).normalized() * 0.95; HX, HY = hp.x, hp.y
print('HERO AT', HX, HY)
info = {'w': RW, 'h': RH, 'pad': px(P(0.84)), 'grip': px(P(0.415) + crank_off), 'feet': px(Vector((HX, HY, 0))), 'head': px(Vector((HX, HY, 1.72))), 'bit': px(TG)}
json.dump(info, open(GRIPS, 'w')); print('GRIPS', info)
# hero silhouette as a shadow-only card (invisible to camera, casts the real shadow)
if HERO:
    C = json.load(open(A['card']))
    hm = bpy.data.materials.new('herocard'); hm.use_nodes = True; hn = hm.node_tree.nodes; hl2 = hm.node_tree.links; b = hn['Principled BSDF']
    t = hn.new('ShaderNodeTexImage'); t.image = img(HERO); hl2.new(t.outputs['Alpha'], b.inputs['Alpha']); b.inputs['Base Color'].default_value = (0.3, 0.3, 0.3, 1)
    yaw = cam.rotation_euler.to_matrix() @ Vector((1, 0, 0))   # card faces the camera: its width runs along the camera's x axis
    bpy.ops.mesh.primitive_plane_add(size=1); hc = bpy.context.object; hc.scale = (C['wm'], C['hm'], 1); bpy.ops.object.transform_apply(scale=True)
    hc.rotation_euler = (math.radians(90), 0, math.atan2(yaw.y, yaw.x))
    right = Vector((yaw.x, yaw.y, 0)).normalized(); hc.location = Vector((HX, HY, 0)) + right * C['cx'] + Vector((0, 0, C['bottom'] + C['hm'] / 2))
    hc.data.materials.append(hm); hc.visible_camera = False; hc.visible_glossy = False
LAYER = A.get('layer', 'plate'); POSES = [tuple(map(float, q.split(':'))) for q in A.get('poses', '0:0').split(',')]
if LAYER == 'plate' or A.get('dry'):
    pose(*POSES[0])
    if A.get('nodrill') or SHOT == 'C':
        for o in DRILL: o.hide_render = True
if A.get('dry'):
    gp = []
    for (ang, adv) in POSES: pose(ang, adv); gp.append({'ang': ang, 'adv': adv, 'grip': px(rig.matrix_world @ GRIP_L), 'pad': px(rig.matrix_world @ PAD_L), 'bit': px(TG - AX * adv)})
    info['poses'] = gp; json.dump(info, open(GRIPS, 'w')); sys.exit(0)
sc.render.engine = 'CYCLES'; sc.cycles.device = 'CPU'; sc.cycles.samples = SAMP; sc.cycles.use_denoising = True; sc.cycles.denoiser = 'OPENIMAGEDENOISE'
sc.cycles.max_bounces = 6; sc.view_settings.view_transform = 'AgX'; sc.view_settings.look = 'AgX - Medium High Contrast'; sc.render.image_settings.file_format = 'PNG'
if LAYER == 'plate':
    sc.render.film_transparent = False; sc.render.filepath = OUT; bpy.ops.render.render(write_still=True); print('WROTE', OUT)
else:
    # drill-only passes: the board catches the drill's shadow and occludes the bit inside the wood; everything else is invisible to the camera but still lights it
    sc.render.film_transparent = True; boardparts = set(o for o in bpy.data.objects if o.parent == board)
    for o in bpy.data.objects:
        if o.type not in ('MESH', 'CURVE') or o in DRILL: continue
        if o in boardparts: o.is_shadow_catcher = True
        else: o.visible_camera = False
    gnd.modifiers['grass'].show_render = False
    for k, (ang, adv) in enumerate(POSES):
        pose(ang, adv); sc.render.filepath = OUT % k; bpy.ops.render.render(write_still=True); print('WROTE', OUT % k)
