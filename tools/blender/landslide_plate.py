"""Export the 2.5D test's inputs from the Blender landslide scene: the clean plate (the scar empty, no falling rocks,
no dust), a depth map (white = near) and the slide's centre line projected into the frame.

    blender -b <out>/landslide.blend -P tools/blender/landslide_plate.py -- <public_dir> [--samples 64]
"""
import json
import sys
from pathlib import Path

import bpy
import numpy as np
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Vector

sys.path.insert(0, str(Path(__file__).resolve().parent))
argv = sys.argv[sys.argv.index("--") + 1:]
OUTDIR = Path(argv[0])
sys.argv = [sys.argv[0], "--", str(OUTDIR)] + argv[1:]
import sikkim_landslide as L  # noqa: E402  (the scene's height field and scar shape)

OUTDIR.mkdir(parents=True, exist_ok=True)
sc = bpy.context.scene
cam = sc.camera
L.set_camera_keys(cam, bpy.data.objects["CamTarget"])
sc.frame_set(L.PRE + 1)
for ob in bpy.data.objects:
    if ob.name.startswith("Rock") or ob.name == "DustDomain":
        ob.hide_render = True
sc.render.resolution_percentage = 100
sc.cycles.samples = int(L.arg("--samples", 1, 64))
sc.render.use_motion_blur = False
# depth: 120 m (near) .. 3 km (far) mapped to white .. black
sc.view_layers[0].use_pass_z = True
nt = sc.node_tree
rl = next(n for n in nt.nodes if n.type == "R_LAYERS")
mr = nt.nodes.new("CompositorNodeMapRange")
mr.inputs["From Min"].default_value = 120
mr.inputs["From Max"].default_value = 3000
mr.inputs["To Min"].default_value = 1
mr.inputs["To Max"].default_value = 0
mr.use_clamp = True
nt.links.new(rl.outputs["Depth"], mr.inputs["Value"])
fo = nt.nodes.new("CompositorNodeOutputFile")
fo.base_path = str(OUTDIR)
fo.file_slots[0].path = "plate_depth_"
fo.format.file_format = "PNG"
fo.format.color_mode = "BW"
fo.format.color_depth = "16"
nt.links.new(mr.outputs[0], fo.inputs[0])
sc.render.image_settings.file_format = "JPEG"
sc.render.image_settings.quality = 93
sc.render.filepath = str(OUTDIR / "plate.jpg")
bpy.ops.render.render(write_still=True)
f = OUTDIR / f"plate_depth_{L.PRE + 1:04d}.png"
f.replace(OUTDIR / "plate_depth.png")

# the slide's centre line, head scarp to the river, in plate pixels, with half-width and pixels per metre
W, H = sc.render.resolution_x, sc.render.resolution_y
yr = float(L.river_y(np.array([0.0]))[0])
pts = []
for d in np.linspace(L.SCAR_D1 - 4, -12, 60):
    dd = max(d, L.SCAR_D0)
    cx = float(L.scar_cx(np.array([dd]))[0])
    hw = float(L.scar_half(np.array([dd]))[0]) * (0.7 if d >= L.SCAR_D0 else 0.8)
    y = yr + L.RIVER_HW + d
    p = Vector((cx, y, L.ground_z(cx, y) + 0.5))
    c = world_to_camera_view(sc, cam, p)
    e = world_to_camera_view(sc, cam, p + Vector((1, 0, 0)))
    ppm = float(np.hypot((e.x - c.x) * W, (e.y - c.y) * H))
    pts.append([round(c.x * W, 1), round((1 - c.y) * H, 1), round(hw * ppm, 1), round(ppm, 3)])
sun = bpy.data.objects["Sun"].matrix_world.to_3x3() @ Vector((0, 0, 1))
cs = cam.matrix_world.to_3x3().inverted() @ sun  # sun direction in camera space: x right, y up
(OUTDIR / "slide_path.json").write_text(json.dumps({"w": W, "h": H, "path": pts, "sun": [round(cs.x, 3), round(-cs.y, 3)]}))
print("PLATE_DONE", len(pts), pts[0], pts[-1], flush=True)
