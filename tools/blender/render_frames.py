"""Render a frame range of the landslide shot to PNG (persistent data, so the scene is synced once).

    blender -b <dir>/landslide.blend -P tools/blender/render_frames.py -- <prefix> <first> <last> [samples] [percent]
"""
import sys

import bpy

a = sys.argv[sys.argv.index("--") + 1:]
sc = bpy.context.scene
sc.frame_start, sc.frame_end = int(a[1]), int(a[2])
sc.cycles.samples = int(a[3]) if len(a) > 3 else 12
sc.render.resolution_percentage = int(a[4]) if len(a) > 4 else 100
sc.render.use_persistent_data = True
sc.render.image_settings.file_format = "PNG"
sc.render.image_settings.color_mode = "RGB"
sc.render.filepath = a[0]
bpy.ops.render.render(animation=True)
