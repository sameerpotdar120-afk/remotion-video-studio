import bpy, sys, math, mathutils
argv = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=argv[0])
cols = [(1,0,0,1),(0,1,0,1),(0,0,1,1),(1,1,0,1),(1,0,1,1),(0,1,1,1)]
objs = [o for o in sc.objects if o.type == 'MESH']
for i, o in enumerate(objs):
    m = bpy.data.materials.new(o.name); m.diffuse_color = cols[i % 6]; m.use_nodes = True
    m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value = cols[i % 6]
    o.data.materials.clear(); o.data.materials.append(m); print('PART', o.name, cols[i % 6])
mn = mathutils.Vector((1e9,)*3); mx = -mn
for o in objs:
    for c in o.bound_box:
        w = o.matrix_world @ mathutils.Vector(c); mn = mathutils.Vector(map(min, mn, w)); mx = mathutils.Vector(map(max, mx, w))
ctr = (mn + mx) / 2; size = max(mx - mn)
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True; w.node_tree.nodes['Background'].inputs[0].default_value = (0.6, 0.6, 0.6, 1)
cam = bpy.data.objects.new('c', bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera = cam
sc.render.engine = 'CYCLES'; sc.cycles.samples = 8; sc.cycles.use_denoising = True; sc.render.resolution_x = sc.render.resolution_y = 500
for i, d in enumerate([(0, -1, 0.2), (1, 0, 0.2), (0, 0, 1), (0, 1, 0.2), (-1, 0, 0.2), (0.7, -0.7, -0.3)]):
    cam.location = ctr + mathutils.Vector(d).normalized() * size * 1.8; cam.rotation_euler = (ctr - cam.location).to_track_quat('-Z', 'Y').to_euler()
    sc.render.filepath = f'{argv[1]}_{i}.png'; bpy.ops.render.render(write_still=True)
