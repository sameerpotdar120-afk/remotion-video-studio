import bpy, sys, mathutils
argv = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=argv[0])
for o in bpy.context.scene.objects:
    if o.type == 'MESH':
        mn = mathutils.Vector((1e9,)*3); mx = -mn
        for c in o.bound_box:
            w = o.matrix_world @ mathutils.Vector(c); mn = mathutils.Vector(map(min, mn, w)); mx = mathutils.Vector(map(max, mx, w))
        print('OBJ', o.name, len(o.data.polygons), [m.name for m in o.data.materials], [round(v, 2) for v in mn], [round(v, 2) for v in mx])
