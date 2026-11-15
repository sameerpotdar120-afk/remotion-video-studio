# 4-4-0 "American" steam locomotive + tender, procedural (exec'd after world.py). Local +Y = front. Rail top at z = 0.16.
M_BOILER = mat('boiler', lambda nt, out: principled(nt, out, color=hexc('#1f3b34'), rough=0.35, metal=0.3, spec=0.6))
M_SMOKEBOX = mat('smokebox', lambda nt, out: principled(nt, out, color=hexc('#26242a'), rough=0.5, metal=0.4))
M_BRASS = mat('brass', lambda nt, out: principled(nt, out, color=hexc('#d9a441'), rough=0.25, metal=1.0))
M_LOCORED = mat('locored', lambda nt, out: principled(nt, out, color=hexc('#a8261f'), rough=0.45, spec=0.5))
M_LAMP = mat('lamp', m_emit('#fff1c4', 25.0))
M_STEEL = mat('steel', lambda nt, out: principled(nt, out, color=hexc('#8a8f96'), rough=0.3, metal=1.0))

def build_loco(name='loco', ribbon=False):
    root = bpy.data.objects.new(name, None); link(root); parts = []; wheels = []
    def P(o): o.parent = root; parts.append(o); return o
    def cylY(nm, r, ln, loc, m, verts=24):     # cylinder along local Y
        return P(cyl(nm, r, ln, loc, m, None, verts, (math.pi / 2, 0, 0)))
    def cylX(nm, r, ln, loc, m, verts=24):
        return P(cyl(nm, r, ln, loc, m, None, verts, (0, math.pi / 2, 0)))
    zr = 0.16
    # frame + running boards
    P(box('frame', (1.2, 8.6, 0.35), (0, 0.3, zr + 0.75), M_SMOKEBOX))
    for s in (-1, 1): P(box('runboard', (0.5, 6.0, 0.06), (s * 1.05, 0.9, zr + 1.55), M_SMOKEBOX))
    # boiler, smokebox, bands, domes, stack, bell, headlamp
    cylY('boiler', 0.72, 5.2, (0, 1.0, zr + 2.15), M_BOILER, 32)
    cylY('smokebox', 0.78, 1.3, (0, 4.2, zr + 2.15), M_SMOKEBOX, 32)
    cylY('sbfront', 0.62, 0.06, (0, 4.86, zr + 2.15), M_SMOKEBOX, 32)
    for y in (-1.2, 0.0, 1.2, 2.4, 3.55): cylY('band', 0.735, 0.08, (0, y, zr + 2.15), M_BRASS, 32)
    P(cyl('stack', 0.2, 1.2, (0, 4.2, zr + 3.3), M_SMOKEBOX, None, 16))
    bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.2, radius2=0.62, depth=0.9, location=(0, 4.2, zr + 4.3)); c = bpy.context.object; c.data.materials.append(M_SMOKEBOX); P(c)
    P(cyl('stacklip', 0.64, 0.12, (0, 4.2, zr + 4.78), M_BRASS, None, 24))
    for (y, r, h) in ((1.4, 0.36, 0.7), (-0.6, 0.3, 0.55)):
        P(cyl('dome', r, h, (0, y, zr + 2.95), M_BRASS, None, 24))
        bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=r, location=(0, y, zr + 3.3)); c = bpy.context.object; c.scale = (1, 1, 0.55); c.data.materials.append(M_BRASS); P(c)
        for p in c.data.polygons: p.use_smooth = True
    P(cyl('bell', 0.16, 0.25, (0, 0.4, zr + 3.05), M_BRASS, None, 16))
    P(box('lampbox', (0.6, 0.6, 0.6), (0, 4.65, zr + 3.2), M_LOCORED, None, bevel=0.03))
    cylY('lamp', 0.2, 0.05, (0, 4.96, zr + 3.2), M_LAMP, 24)
    # cylinders + steam chests
    for s in (-1, 1): cylY('cyl', 0.32, 1.1, (s * 0.95, 3.4, zr + 0.95), M_SMOKEBOX, 20)
    # cowcatcher: slanted bars
    for i in range(-5, 6):
        b = P(box('cc', (0.06, 1.25, 0.06), (i * 0.13, 5.35, zr + 0.45), M_LOCORED)); b.rotation_euler = (math.radians(-35), 0, math.radians(i * -4.5))
    P(box('ccbeam', (1.7, 0.18, 0.2), (0, 4.85, zr + 0.9), M_LOCORED))
    # wheels: 4 small lead wheels, 4 big drivers (spoked, red, steel tyre), side rods
    def wheel(r, y, s, spokes):
        w = bpy.data.objects.new('wheel', None); link(w); w.parent = root; w.location = (s * 0.79, y, zr + r - 0.02); wheels.append((w, r))
        hub = cyl('hub', r * 0.18, 0.12, (0, 0, 0), M_LOCORED, None, 16, (0, math.pi / 2, 0)); hub.parent = w
        tyre = cyl('tyre', r, 0.1, (0, 0, 0), M_STEEL, None, 32, (0, math.pi / 2, 0)); tyre.parent = w
        rim = cyl('rim', r * 0.86, 0.12, (0, 0, 0), M_LOCORED, None, 32, (0, math.pi / 2, 0)); rim.parent = w
        inner = cyl('in', r * 0.74, 0.14, (0, 0, 0), M_SMOKEBOX, None, 32, (0, math.pi / 2, 0)); inner.parent = w
        for k in range(spokes):
            a = k / spokes * math.tau; sp = box('spoke', (0.05, 0.05, r * 0.8), (0, math.sin(a) * r * 0.4, math.cos(a) * r * 0.4), M_LOCORED); sp.rotation_euler = (-a, 0, 0); sp.parent = w
        pin = cyl('pin', 0.06, 0.2, (s * 0.12, 0, r * 0.5), M_STEEL, None, 10, (0, math.pi / 2, 0)); pin.parent = w
        return w
    for s in (-1, 1):
        for y in (3.9, 2.9): wheel(0.42, y, s, 8)
        for y in (0.6, -1.6): wheel(0.86, y, s, 14)
    rods = []
    for s in (-1, 1):
        rd = P(box('rod', (0.06, 2.4, 0.12), (s * 0.98, -0.5, zr + 0.86), M_STEEL)); rods.append((rd, s))
    # cab
    P(box('cab', (2.5, 2.2, 2.3), (0, -2.9, zr + 2.35), M_LOCORED, None, bevel=0.03))
    for s in (-1, 1): P(box('cabwin', (0.04, 0.8, 0.7), (s * 1.26, -2.75, zr + 2.75), M_WIN))
    P(box('cabroof', (2.9, 2.7, 0.14), (0, -2.9, zr + 3.6), M_SMOKEBOX))
    # tender
    P(box('tender', (2.4, 4.2, 1.6), (0, -6.4, zr + 1.55), M_LOCORED, None, bevel=0.04))
    P(box('tload', (2.1, 3.6, 0.4), (0, -6.5, zr + 2.45), M_TIE))
    for y in (-5.0, -7.8):
        for s in (-1, 1): wheel(0.42, y, s, 8)
    P(box('tframe', (1.4, 4.4, 0.3), (0, -6.4, zr + 0.62), M_SMOKEBOX))
    if ribbon:   # opening-day ribbon + bunting across the smokebox
        P(box('ribbon', (1.8, 0.04, 0.22), (0, 5.0, zr + 2.15), M_RED))
        for s in (-1, 1):
            b = P(box('bow', (0.35, 0.05, 0.25), (s * 0.2, 5.03, zr + 2.15), M_RED)); b.rotation_euler = (0, s * 0.5, 0)
    return root, wheels, rods

def loco_update(root, wheels, rods, travelled):
    """roll every wheel by distance/radius; side rods follow the crank pin (main drivers)"""
    for (w, r) in wheels: w.rotation_euler = (-travelled / r, 0, 0)
    ang = -travelled / 0.86
    for (rd, s) in rods: rd.location.y = -0.5 - 0.43 * math.sin(ang); rd.location.z = 0.16 + 0.86 + 0.43 * math.cos(ang)

M_SMOKE = mat('smoke', lambda nt, out: principled(nt, out, color=hexc('#a9a19b'), rough=1.0, spec=0.0))
def smoke_puffs(n, seed=3):
    rs = random.Random(seed); out = []
    for i in range(n):
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1.0); o = bpy.context.object; o.data.materials.append(M_SMOKE)
        for p in o.data.polygons: p.use_smooth = True
        for v in o.data.vertices: v.co *= 1 + 0.18 * noise.noise(v.co * 2.5 + Vector((i, seed, 0)))
        o.visible_shadow = False; out.append((o, rs.random(), rs.uniform(-1, 1), rs.uniform(-1, 1)))
    return out
