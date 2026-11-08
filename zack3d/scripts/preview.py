import bpy, sys, math, mathutils
argv = sys.argv[sys.argv.index('--') + 1:]; path, out = argv[0], argv[1]
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=path)
objs = [o for o in sc.objects if o.type == 'MESH']
mn = mathutils.Vector((1e9,)*3); mx = -mn
for o in objs:
    for c in o.bound_box:
        w = o.matrix_world @ mathutils.Vector(c); mn = mathutils.Vector(map(min, mn, w)); mx = mathutils.Vector(map(max, mx, w))
ctr = (mn + mx) / 2; size = max(mx - mn)
print('BBOX', [round(v, 3) for v in (mx - mn)], 'meshes', len(objs), 'polys', sum(len(o.data.polygons) for o in objs))
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (0.03, 0.3, 0.6, 1)
def L(loc, e, s, c):
    d = bpy.data.lights.new('l', 'AREA'); d.energy = e * size * size; d.size = s * size; d.color = c
    ob = bpy.data.objects.new('l', d); sc.collection.objects.link(ob); ob.location = ctr + mathutils.Vector(loc) * size
    ob.rotation_euler = (ctr - ob.location).to_track_quat('-Z', 'Y').to_euler()
L((-1, -1.5, 2), 120, 1.2, (1, .96, .9)); L((1.5, 1.5, 1.2), 90, 0.8, (.8, .93, 1)); L((0, -2, .2), 30, 1.5, (1, 1, 1))
cam = bpy.data.objects.new('c', bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera = cam; cam.data.lens = 50; cam.data.clip_end = size * 100; cam.data.clip_start = size * 0.001
res = []
for i, (ang, el) in enumerate([(0, 0.15), (60, 0.35), (90, 0.05), (-90, 0.05), (180, 0.15), (0, 1.2)]):
    a = math.radians(ang); d = mathutils.Vector((math.sin(a), -math.cos(a), el)).normalized() * size * 2.3
    cam.location = ctr + d; cam.rotation_euler = (ctr - cam.location).to_track_quat('-Z', 'Y').to_euler()
    sc.render.engine = 'CYCLES'; sc.cycles.samples = 16; sc.cycles.use_denoising = True
    sc.render.resolution_x = sc.render.resolution_y = int(argv[2]) if len(argv) > 2 else 420; sc.render.filepath = f'{out}_{i}.png'
    sc.view_settings.view_transform = 'Standard'
    bpy.ops.render.render(write_still=True)
