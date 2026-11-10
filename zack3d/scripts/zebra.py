# Zebra / plain horse in the cyan world (shots 21-24). "Zebra Anatomy" by Shikaki_Naito (Sketchfab), CC BY 4.0.
# The model's -x side is the striped coat (the +x side is an anatomy cut-away): always film from -x.
# usage: blender -b --python zebra.py -- <out.png> <res%> <spp>     (tuning: ZK_Z json; "coat": "zebra"|"horse")
import sys, os, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scene import *
argv = sys.argv[sys.argv.index('--') + 1:]; OUT, RES, SPP = argv[0], int(argv[1]), int(argv[2])
Z = {'coat': 'zebra', 'height': 100.0, 'cam': [-430, 30, 40], 'tgt': [0, 0, 52], 'lens': 50, 'fstop': 11,
     'ground': [214, 190, 140], 'flies': []}
Z.update(json.loads(os.environ.get('ZK_Z', '{}')))
_A = json.loads(os.environ.get('ZK_ANIM', '{}'))
for _k in ('nflies', 'coat', 'fly_len'):
    if _k in _A: Z[_k] = _A[_k]
GLB = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'zebra.glb')
if not os.path.exists(GLB): GLB = '/root/zack/dl/new/c60aa3efb391448faa955426411d485a.glb'
sc = reset()
before = set(sc.objects); bpy.ops.import_scene.gltf(filepath=GLB); new = [o for o in sc.objects if o not in before]
meshes = [o for o in new if o.type == 'MESH']
# keep only the striped (-x) half and mirror it: a fully striped zebra (the +x half is an anatomy cut-away)
import bmesh
for o in meshes:
    bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    mw_ = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw_; bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    xs = [v.co.x for v in o.data.vertices]; cx = (min(xs) + max(xs)) / 2 - Z.get('seam_in', 0.012) * (max(xs) - min(xs))
    bm = bmesh.new(); bm.from_mesh(o.data)
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if f.calc_center_median().x > cx], context='FACES'); bm.to_mesh(o.data); bm.free()
    me = bpy.data.objects.new('MIRC', None); sc.collection.objects.link(me); me.location = (cx, 0, 0)
    md = o.modifiers.new('mir', 'MIRROR'); md.use_axis[0] = True; md.mirror_object = me; md.use_clip = True; md.merge_threshold = 0.002
    for p_ in o.data.polygons: p_.use_smooth = True
mn = V((1e9,) * 3); mx = -mn
for o in meshes:
    for c in o.bound_box: w = o.matrix_world @ V(c); mn = V(map(min, mn, w)); mx = V(map(max, mx, w))
piv = bpy.data.objects.new('ZPIV', None); sc.collection.objects.link(piv); s = Z['height'] / (mx.z - mn.z)
piv.scale = (s, s, s); piv.location = (-(mn.x + mx.x) / 2 * s, -(mn.y + mx.y) / 2 * s, -mn.z * s)
for o in new:
    if o.parent is None: o.parent = piv
if Z['coat'] == 'zebra_proc':  # crisp procedural stripes + fine hair for macro shots (texture is too soft up close)
    zm = mat('zproc', lin(236, 226, 206), 0.7, **{'Sheen Weight': 0.6, 'Sheen Roughness': 0.3, 'Specular IOR Level': 0.15})
    n, l = nodes(zm); b = n['Principled BSDF']; tc = n.new('ShaderNodeTexCoord'); wv = n.new('ShaderNodeTexWave'); wv.wave_type = 'BANDS'; wv.bands_direction = 'Y'
    wv.inputs['Scale'].default_value = Z.get('stripe_scale', 9.0); wv.inputs['Distortion'].default_value = Z.get('stripe_dist', 6.0); wv.inputs['Detail'].default_value = 3
    l.new(tc.outputs['Generated'], wv.inputs['Vector']); rp = n.new('ShaderNodeValToRGB'); e = rp.color_ramp.elements
    e[0].position = 0.46; e[0].color = lin(22, 20, 20); e[1].position = 0.54; e[1].color = lin(236, 226, 206); l.new(wv.outputs['Fac'], rp.inputs['Fac']); l.new(rp.outputs['Color'], b.inputs['Base Color'])
    mp = n.new('ShaderNodeMapping'); mp.inputs['Scale'].default_value = (1, 1, 14); l.new(tc.outputs['Object'], mp.inputs['Vector'])
    hn = n.new('ShaderNodeTexNoise'); hn.inputs['Scale'].default_value = 900; hn.inputs['Detail'].default_value = 4; l.new(mp.outputs['Vector'], hn.inputs['Vector'])
    hb = n.new('ShaderNodeBump'); hb.inputs['Strength'].default_value = 0.35; hb.inputs['Distance'].default_value = 0.002; l.new(hn.outputs['Fac'], hb.inputs['Height']); l.new(hb.outputs['Normal'], b.inputs['Normal'])
    for o in meshes: o.data.materials.clear(); o.data.materials.append(zm)
elif Z['coat'] == 'horse':  # plain horse: same body, short glossy bay coat
    hm = mat('bay', lin(96, 52, 30), 0.62, **{'Sheen Weight': 0.7, 'Sheen Roughness': 0.35, 'Specular IOR Level': 0.25})
    n, l = nodes(hm); b = n['Principled BSDF']; tc = n.new('ShaderNodeTexCoord'); sxz = n.new('ShaderNodeSeparateXYZ'); l.new(tc.outputs['Generated'], sxz.inputs[0])
    rp = n.new('ShaderNodeValToRGB'); e = rp.color_ramp.elements; e[0].position = 0.22; e[0].color = lin(30, 22, 20); e[1].position = 0.38; e[1].color = lin(104, 56, 32)
    l.new(sxz.outputs['Z'], rp.inputs['Fac']); l.new(rp.outputs['Color'], b.inputs['Base Color'])   # black lower legs (bay points)
    add_bump(hm, [('noise', 300, 0.15)], mul=0.5)
    for o in meshes: o.data.materials.clear(); o.data.materials.append(hm)
else:
    for o in meshes:
        for m in o.data.materials:
            if m and m.use_nodes and m.node_tree.nodes.get('Principled BSDF'):
                b = m.node_tree.nodes['Principled BSDF']
                if Z.get('crisp', False) and b.inputs['Base Color'].links:  # threshold the soft texture into crisp stripe edges
                    nt = m.node_tree; src = b.inputs['Base Color'].links[0].from_socket; bw = nt.nodes.new('ShaderNodeRGBToBW'); rp = nt.nodes.new('ShaderNodeValToRGB')
                    e = rp.color_ramp.elements; e[0].position = Z.get('thr', 0.42) - 0.05; e[0].color = lin(22, 20, 20); e[1].position = Z.get('thr', 0.42) + 0.05; e[1].color = lin(238, 228, 208)
                    nt.links.new(src, bw.inputs['Color']); nt.links.new(bw.outputs['Val'], rp.inputs['Fac']); nt.links.new(rp.outputs['Color'], b.inputs['Base Color'])
                if b.inputs['Base Color'].links:  # faces that sample the texture's flat grey background -> coat cream
                    nt = m.node_tree; src = b.inputs['Base Color'].links[0].from_socket; hsv = nt.nodes.new('ShaderNodeSeparateColor'); hsv.mode = 'HSV'
                    nt.links.new(src, hsv.inputs['Color'])
                    def cmp(a, op, v):
                        mm = nt.nodes.new('ShaderNodeMath'); mm.operation = op; mm.inputs[1].default_value = v; nt.links.new(a, mm.inputs[0]); return mm.outputs[0]
                    m1 = cmp(hsv.outputs['Green'], 'LESS_THAN', 0.07); m2 = cmp(hsv.outputs['Blue'], 'GREATER_THAN', 0.6); m3 = cmp(hsv.outputs['Blue'], 'LESS_THAN', 0.86)
                    a1 = nt.nodes.new('ShaderNodeMath'); a1.operation = 'MULTIPLY'; nt.links.new(m1, a1.inputs[0]); nt.links.new(m2, a1.inputs[1])
                    a2 = nt.nodes.new('ShaderNodeMath'); a2.operation = 'MULTIPLY'; nt.links.new(a1.outputs[0], a2.inputs[0]); nt.links.new(m3, a2.inputs[1])
                    mx = nt.nodes.new('ShaderNodeMix'); mx.data_type = 'RGBA'; mx.inputs['B'].default_value = lin(232, 216, 194)
                    nt.links.new(src, mx.inputs['A']); nt.links.new(a2.outputs[0], mx.inputs['Factor']); nt.links.new(mx.outputs['Result'], b.inputs['Base Color'])
                if Z.get('no_normal', True) and b.inputs['Normal'].links: m.node_tree.links.remove(b.inputs['Normal'].links[0])   # broken normal-map patch on the shoulder
                for sock in ('Metallic', 'Roughness'):   # the model's metal/roughness map makes a polished-metal patch on the shoulder
                    for lk in list(b.inputs[sock].links): m.node_tree.links.remove(lk)
                b.inputs['Metallic'].default_value = 0.0
                b.inputs['Roughness'].default_value = 0.72; b.inputs['Specular IOR Level'].default_value = 0.15; b.inputs['Sheen Weight'].default_value = 0.5
                for nd in m.node_tree.nodes:
                    if nd.type == 'TEX_IMAGE' and nd.outputs[0].links and nd.outputs[0].links[0].to_socket.name in ('Roughness', 'Metallic'): m.node_tree.links.remove(nd.outputs[0].links[0])
# ground: soft warm dry-grass plane that falls into DOF, cyan sky behind
gm = mat('ground', lin(*Z['ground']), 0.9); mottle(gm, lin(190, 164, 112), lin(226, 204, 156), 0.02, 0.35, 0.7)
n, l = nodes(gm); b = n['Principled BSDF']; cd = n.new('ShaderNodeCameraData'); mr = n.new('ShaderNodeMapRange')
mr.inputs['From Min'].default_value = Z.get('mist0', 600); mr.inputs['From Max'].default_value = Z.get('mist1', 1600); l.new(cd.outputs['View Z Depth'], mr.inputs['Value'])
src = b.inputs['Base Color'].links[0].from_socket; mxg = n.new('ShaderNodeMix'); mxg.data_type = 'RGBA'; mxg.inputs['B'].default_value = lin(150, 200, 220)
l.new(src, mxg.inputs['A']); l.new(mr.outputs['Result'], mxg.inputs['Factor']); l.new(mxg.outputs['Result'], b.inputs['Base Color'])
em = n.new('ShaderNodeEmission'); em.inputs['Color'].default_value = lin(*Z.get('mist_col', [104, 198, 228])); em.inputs['Strength'].default_value = 1.0
ms = n.new('ShaderNodeMixShader'); out = n['Material Output']; l.new(mr.outputs['Result'], ms.inputs['Fac']); l.new(b.outputs['BSDF'], ms.inputs[1]); l.new(em.outputs['Emission'], ms.inputs[2]); l.new(ms.outputs['Shader'], out.inputs['Surface'])
bpy.ops.mesh.primitive_plane_add(size=60000); gp = bpy.context.object; gp.data.materials.append(gm)
# flies: one fly model in a hidden collection, instanced N times (cheap); animated via keys 'f<i>': [x, y, z, yaw, pitch]
import anim
A = anim.load()
NF = Z.get('nflies', len(Z['flies']))
FL = []
if NF:
    before = set(sc.objects); fly, parts, M = load_fly(sc, length=Z.get('fly_len', 3.4)); new = [o for o in sc.objects if o not in before]
    fc = bpy.data.collections.new('FLYC')
    for o in new:
        for c in o.users_collection: c.objects.unlink(o)
        fc.objects.link(o)
    for i in range(NF):
        e = bpy.data.objects.new(f'FI{i}', None); e.instance_type = 'COLLECTION'; e.instance_collection = fc; sc.collection.objects.link(e); FL.append(e)
        if i < len(Z['flies']):
            fx, fy, fz, fyaw, fpitch, flen = Z['flies'][i]; e.location = (fx, fy, fz); e.rotation_euler = (math.radians(fpitch), 0, math.radians(fyaw)); e.scale = (flen / 3.4,) * 3
area(sc, 'key', V((-120, -150, 260)), V((0, 0, 60)), 1300 * 900, 120, (1, .96, .9)); area(sc, 'rim', V((150, 200, 210)), V((0, 0, 60)), 1100 * 700, 80, (.8, .93, 1))
area(sc, 'fill', V((-200, 60, 90)), V((0, 0, 60)), 260 * 900, 150, (1, 1, 1))
def apply(p, f=None):
    cl, tg = V(p.get('cam', Z['cam'])), V(p.get('tgt', Z['tgt']))
    camera(sc, cl, tg, lens=p.get('lens', Z['lens']), fstop=p.get('fstop', Z['fstop']), focus=(V(p.get('focus', [0, 0, 55])) - cl).length)
    for i, e in enumerate(FL):
        v = p.get(f'f{i}')
        if v: e.location = v[:3]; e.rotation_euler = (math.radians(v[4]), 0, math.radians(v[3]))
    if f is not None:
        cam = sc.camera; cam.keyframe_insert('location', frame=f); cam.keyframe_insert('rotation_euler', frame=f); cam.data.keyframe_insert('lens', frame=f)
        for e in FL: e.keyframe_insert('location', frame=f); e.keyframe_insert('rotation_euler', frame=f)
apply(anim.at(A, A['f0']) if A else {})
sky(sc, sc.camera.location, V(Z['tgt']), light_frac=0.5)
if A:
    out = A['out']; os.makedirs(out, exist_ok=True)
    for f in range(A['f0'] - 1, A['f1'] + 2): apply(anim.at(A, f), f)
    sc.render.use_motion_blur = True; sc.render.motion_blur_shutter = (A or {}).get('shutter', 0.5) if 'A' in dir() else 0.5
    sc.render.resolution_x, sc.render.resolution_y = 1440 * RES // 100, 2560 * RES // 100; sc.cycles.samples = SPP
    dp = [n for n in sc.world.node_tree.nodes if n.type == 'VECT_MATH'][0]
    for f in range(A['f0'], A['f1'] + 1, A.get('step', 1)):
        sc.frame_set(f); pp = anim.at(A, f); dp.inputs[1].default_value = (V(pp.get('tgt', Z['tgt'])) - sc.camera.location).normalized()
        sc.render.filepath = os.path.join(out, f'f_{f:04d}.png'); bpy.ops.render.render(write_still=True); print('FRAME', f, flush=True)
else:
    render(sc, OUT, 1440 * RES // 100, 2560 * RES // 100, SPP)
