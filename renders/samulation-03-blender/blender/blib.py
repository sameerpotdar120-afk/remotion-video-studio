# shared Blender helpers (materials from CC0 scans, bevelled cubes, cylinders between points)
import bpy, math, os
from mathutils import Vector
ASSET = None
def setup(asset): global ASSET; ASSET = asset
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


def cyl(r, a, b, mat, verts=24, smooth=True):
    mid = (a + b) / 2; v = (b - a); bpy.ops.mesh.primitive_cylinder_add(vertices=verts, radius=r, depth=v.length, location=mid)
    o = bpy.context.object; o.rotation_mode = 'QUATERNION'; o.rotation_quaternion = v.normalized().to_track_quat('Z', 'Y'); o.data.materials.append(mat)
    if smooth: bpy.ops.object.shade_smooth()
    return o
def curve(name, pts, r, mat, res=4):
    cd = bpy.data.curves.new(name, 'CURVE'); cd.dimensions = '3D'; cd.bevel_depth = r; cd.bevel_resolution = res; sp = cd.splines.new('POLY'); sp.points.add(len(pts) - 1)
    for k, p in enumerate(pts): sp.points[k].co = (*p, 1)
    o = bpy.data.objects.new(name, cd); bpy.context.scene.collection.objects.link(o); o.data.materials.append(mat); return o
