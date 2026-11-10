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
    xs = [v.co.x for v in o.data.vertices]; cx = (min(xs) + max(xs)) / 2
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
if Z['coat'] == 'horse':  # plain horse: same body, short glossy bay coat
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
                b = m.node_tree.nodes['Principled BSDF']; b.inputs['Roughness'].default_value = 0.72; b.inputs['Specular IOR Level'].default_value = 0.15; b.inputs['Sheen Weight'].default_value = 0.5
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
# optional flies (no fur, for distance shots): list of [x, y, z, yaw, pitch, length]
if Z['flies']:
    for i, (fx, fy, fz, fyaw, fpitch, flen) in enumerate(Z['flies']):
        fly, parts, M = load_fly(sc, length=flen); fly.location = (fx, fy, fz); fly.rotation_euler = (math.radians(fpitch), 0, math.radians(fyaw))
cl, tgt = V(Z['cam']), V(Z['tgt'])
camera(sc, cl, tgt, lens=Z['lens'], fstop=Z['fstop'], focus=(V((0, 0, 55)) - cl).length * Z.get('focus_k', 1.0))
sky(sc, cl, tgt, light_frac=0.5)
area(sc, 'key', tgt + V((-120, -150, 200)), tgt, 1300 * 900, 120, (1, .96, .9)); area(sc, 'rim', tgt + V((150, 200, 150)), tgt, 1100 * 700, 80, (.8, .93, 1))
area(sc, 'fill', tgt + V((-200, 60, 30)), tgt, 260 * 900, 150, (1, 1, 1))
render(sc, OUT, 1440 * RES // 100, 2560 * RES // 100, SPP)
