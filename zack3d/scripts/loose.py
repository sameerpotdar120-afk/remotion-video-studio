import bpy, sys, mathutils
argv = sys.argv[sys.argv.index('--') + 1:]
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=argv[0])
for name in ['Object_2', 'Object_5', 'Object_3']:
    o = sc.objects[name]; bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.separate(type='LOOSE'); bpy.ops.object.mode_set(mode='OBJECT')
for o in sorted([o for o in sc.objects if o.type == 'MESH'], key=lambda o: -len(o.data.polygons)):
    mn = mathutils.Vector((1e9,)*3); mx = -mn
    for v in o.data.vertices:
        w = o.matrix_world @ v.co; mn = mathutils.Vector(map(min, mn, w)); mx = mathutils.Vector(map(max, mx, w))
    if len(o.data.polygons) > 150: print('LOOSE', o.name, len(o.data.polygons), [round(v, 2) for v in mn], [round(v, 2) for v in mx])
