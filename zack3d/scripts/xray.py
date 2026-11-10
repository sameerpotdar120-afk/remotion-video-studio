# Shot 05 key frame: x-ray through the female's abdomen: red blood cells stream in, eggs form and glow.
# usage: blender -b --python xray.py -- <out.png> <res%> <spp> [eggs 0..1]
import sys, os, math, json, random
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scene
from scene import *
argv = sys.argv[sys.argv.index('--') + 1:]; OUT, RES, SPP = argv[0], int(argv[1]), int(argv[2]); EGG = float(argv[3]) if len(argv) > 3 else 1.0
R = {'cam_off': [3.0, 1.4, 2.2], 'tgt_off': [0, 0.8, 0.9], 'lens': 55}
R.update(json.loads(os.environ.get('ZK_R', '{}')))
scene.MOUTH_LEN = 0.6
sc = reset(); skin(sc); sz = skin_z(0, 0)
fly, parts, M = load_fly(sc); fly.location = (0, 0, sz); bpy.context.view_layer.update()
abd = [o for o in parts if o.data.materials and o.data.materials[0].name == 'abd'][0]
# x-ray shell: glassy translucent with a pale blue fresnel rim
xr = mat('xray', lin(200, 225, 240), 0.1, **{'Transmission Weight': 1.0, 'IOR': 1.05, 'Alpha': 0.35})
n, l = nodes(xr); b = n['Principled BSDF']; lw = n.new('ShaderNodeLayerWeight'); lw.inputs['Blend'].default_value = 0.25
em = n.new('ShaderNodeEmission'); em.inputs['Color'].default_value = lin(150, 210, 255); em.inputs['Strength'].default_value = 1.6
ad = n.new('ShaderNodeAddShader'); mm = n.new('ShaderNodeMath'); mm.operation = 'MULTIPLY'; l.new(lw.outputs['Facing'], mm.inputs[0]); mm.inputs[1].default_value = 1.0
ems = n.new('ShaderNodeMixShader'); l.new(mm.outputs[0], ems.inputs['Fac']); l.new(b.outputs['BSDF'], ems.inputs[1]); l.new(em.outputs['Emission'], ems.inputs[2])
l.new(ems.outputs['Shader'], n['Material Output'].inputs['Surface'])
abd.data.materials.clear(); abd.data.materials.append(xr)
# contents in world space inside the abdomen box (x +-0.36, y 0.15..1.33, z 0.54..1.25 relative to the fly at the origin)
rng = random.Random(5); mw = fly.matrix_world
egg = mat('egg', lin(250, 236, 196), 0.35, **{'Subsurface Weight': 0.6, 'Subsurface Radius': (1, .9, .6), 'Emission Color': lin(255, 214, 90), 'Emission Strength': 0.6 * EGG})
for i in range(int(26 * max(EGG, 0.05))):
    p = V((rng.uniform(-0.2, 0.2), rng.uniform(0.45, 1.15), rng.uniform(0.68, 1.08)))
    ellipsoid(sc, f'EGG{i}', mw @ p, (0.032, 0.075, 0.032), egg, None, rot=(rng.uniform(-.4, .4), 0, rng.uniform(-.6, .6)), seg=24, rings=16)
rbc = mat('rbc', lin(200, 20, 28), 0.3, **{'Coat Weight': 0.6, 'Subsurface Weight': 0.4, 'Subsurface Radius': (1, .2, .2)})
for i in range(40):  # red blood cells streaming in from the thorax side
    u = i / 40; p = V((0.12 * math.sin(i * 1.3), 0.15 + 0.9 * u, 0.9 + 0.12 * math.sin(i * 0.9)))
    bpy.ops.mesh.primitive_torus_add(major_radius=0.035, minor_radius=0.018, major_segments=24, minor_segments=12)
    t = bpy.context.object; t.location = mw @ p; t.rotation_euler = (rng.uniform(0, 3), rng.uniform(0, 3), 0); t.data.materials.append(rbc)
hp = abd.matrix_world.translation
cl = V((0, 0, sz)) + V(R['cam_off']); tgt = V((0, 0, sz)) + V(R['tgt_off'])
camera(sc, cl, tgt, lens=R['lens'], fstop=8, focus=(tgt - cl).length)
sky(sc, cl, tgt, light_frac=0.5); lights(sc, tgt, 1.25)
render(sc, OUT, 1440 * RES // 100, 2560 * RES // 100, SPP)
