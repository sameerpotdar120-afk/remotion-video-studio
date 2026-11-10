# Shot 04 key frame: male (eyes meet) and female (eyes apart, the gap glows) side by side on the skin, facing camera.
# usage: blender -b --python eyes.py -- <out.png> <res%> <spp> [glow 0..1]
import sys, os, math, json
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import scene
from scene import *
argv = sys.argv[sys.argv.index('--') + 1:]; OUT, RES, SPP = argv[0], int(argv[1]), int(argv[2]); GLOW = float(argv[3]) if len(argv) > 3 else 1.0
E = {'lens': 50, 'male_gap': 0.17, 'female_gap': 0.30}
E.update(json.loads(os.environ.get('ZK_E', '{}')))
scene.MOUTH_LEN = 0.6
sc = reset(); skin(sc); sz = skin_z(0, 0)
flies = []
WHO = E.get('who', 'female')
for name, gap, x, yaw in [t for t in (('male', E['male_gap'], 0, 0), ('female', E['female_gap'], 0, 0)) if t[0] == WHO]:
    scene.LOOK['eye_gap'] = gap
    before = set(sc.objects); fly, parts, M = load_fly(sc); new = [o for o in sc.objects if o not in before]
    fly.location = (x, 0, sz); fly.rotation_euler = (0, 0, math.radians(yaw)); bpy.context.view_layer.update()
    # fur only this fly: temporarily give its materials the names fly_fur looks for
    for m in bpy.data.materials:
        if m.name in ('body', 'abd', 'leg'): m.name = m.name + '_done'
    for o in new:
        if o.type == 'MESH' and o.data.materials and o.data.materials[0]:
            base = o.data.materials[0].name.split('.')[0]
            if base in ('body', 'abd', 'leg'): o.data.materials[0].name = base
    fly_fur(sc, fly, M)
    for o in new: o.name = name[0].upper() + '_' + o.name
    flies.append((name, new))
# female: the ridge between her eyes glows yellow (emission pulse driven by GLOW)
for o in (flies[0][1] if WHO == 'female' else []):
    if o.name.startswith('F_FRONS'):
        g = mat('gapglow', lin(255, 214, 40), 0.3, **{'Emission Color': lin(255, 214, 40), 'Emission Strength': 2.5 * GLOW})
        o.data.materials.clear(); o.data.materials.append(g)
hp = [o for o in sc.objects if 'HEADCAP' in o.name][0].matrix_world.translation
cl = hp + V(E.get('cam_off', [0.25, -3.0, -0.35])); tgt = hp + V(E.get('tgt_off', [0, 0, -0.25]))
camera(sc, cl, tgt, lens=E['lens'], fstop=6, focus=(tgt - cl).length)
sky(sc, cl, tgt, light_frac=0.5); lights(sc, tgt, 1.25)
render(sc, OUT, 1440 * RES // 100, 2560 * RES // 100, SPP)
