# Desert town (exec'd inside world.py): depot + platform on the right of the track, GRAND OPENING banner, bunting,
# a street of false-front buildings behind it. All procedural; signs use Blender's built-in font.
M_WALL2 = mat('wall2', lambda nt, out: m_wood(nt, out, '#7fa3b0', '#56788a', '#a6c4cc', 0.12))
M_WALL3 = mat('wall3', lambda nt, out: m_wood(nt, out, '#d9b26a', '#a8824a', '#ecd09a', 0.12))
M_WALL4 = mat('wall4', lambda nt, out: m_wood(nt, out, '#b86a4a', '#86462e', '#d48a66', 0.12))
M_TRIM = mat('trim', lambda nt, out: principled(nt, out, color=hexc('#f3ead6'), rough=0.7))
M_WIN = mat('win', lambda nt, out: principled(nt, out, color=hexc('#1c2433'), rough=0.15, spec=0.6))
M_CLOTH = mat('cloth', lambda nt, out: principled(nt, out, color=hexc('#f6f0e2'), rough=0.9))
M_INK = mat('signink', lambda nt, out: principled(nt, out, color=hexc('#a3262a'), rough=0.8))
M_INK2 = mat('signink2', lambda nt, out: principled(nt, out, color=hexc('#26324f'), rough=0.8))
M_RED = mat('fred', lambda nt, out: principled(nt, out, color=hexc('#c8302c'), rough=0.85))
M_BLUE = mat('fblue', lambda nt, out: principled(nt, out, color=hexc('#2f4fa8'), rough=0.85))
M_WHITE = mat('fwhite', lambda nt, out: principled(nt, out, color=hexc('#f4f1e8'), rough=0.85))
CT3 = coll('town2')
SX, SY = 7.6, 190.0                    # depot centre (right of the track)
PLAT_X, PLAT_TOP = 3.25, 0.32          # platform edge near the rails, top height

def text(s, loc, rot, size, m, c=CT3, depth=0.01, align='CENTER'):
    cu = bpy.data.curves.new('t', 'FONT'); cu.body = s; cu.size = size; cu.extrude = depth; cu.align_x = align; cu.align_y = 'CENTER'
    o = bpy.data.objects.new('t', cu); o.location = loc; o.rotation_euler = rot; cu.materials.append(m); return link(o, c)

# depot: walls, windows, door, roof with overhang over the platform, posts
box('depot', (6.0, 16.0, 4.0), (SX, SY, 1.95), M_WALL2, CT3, bevel=0.03)
box('depot_trim', (6.15, 16.15, 0.18), (SX, SY, 0.35), M_TRIM, CT3)
for k in range(-3, 4):
    y = SY + k * 2.1
    if k == 0: box('door', (0.06, 1.3, 2.4), (SX - 3.02, y, 1.55), M_WIN, CT3); continue
    box('win', (0.06, 1.0, 1.4), (SX - 3.02, y, 2.15), M_WIN, CT3); box('wtrim', (0.08, 1.2, 0.12), (SX - 3.03, y, 2.9), M_TRIM, CT3)
roof = box('roof', (8.6, 18.6, 0.28), (SX - 1.0, SY, 4.15), M_ROOF, CT3); roof.rotation_euler = (0, math.radians(-8), 0)   # overhang stops at the platform edge, clear of the loco stack
for k in range(-4, 5): cyl('post', 0.09, 3.6, (PLAT_X + 0.5, SY + k * 2.2, 2.1), M_TRIM, CT3, 8)
box('platform', (3.6, 24.0, 0.5), (PLAT_X + 1.8, SY, PLAT_TOP - 0.25), M_TIE, CT3)
box('pedge', (0.12, 24.0, 0.1), (PLAT_X + 0.06, SY, PLAT_TOP + 0.01), M_TRIM, CT3)
# depot name board on the roof ridge + GRAND OPENING banner hung under the eave (facing the track, -X)
box('board', (0.12, 7.0, 1.0), (SX - 3.2, SY, 5.0), M_TRIM, CT3)
text('DEPOT', (SX - 3.27, SY, 5.0), (math.pi / 2, 0, -math.pi / 2), 0.75, M_INK2, depth=0.02)
ban = box('banner', (0.04, 9.0, 1.15), (PLAT_X + 0.35, SY, 3.25), M_CLOTH, CT3)
text('GRAND OPENING', (PLAT_X + 0.32, SY, 3.45), (math.pi / 2, 0, -math.pi / 2), 0.55, M_INK, depth=0.008)
text('JULY 4', (PLAT_X + 0.32, SY, 2.92), (math.pi / 2, 0, -math.pi / 2), 0.42, M_INK2, depth=0.008)

def bunting(a, b, n, sag=0.35, size=0.28):
    """string of red/white/blue pennants between points a and b"""
    a, b = Vector(a), Vector(b); cols = (M_RED, M_WHITE, M_BLUE)
    cu = bpy.data.curves.new('str', 'CURVE'); cu.dimensions = '3D'; cu.bevel_depth = 0.006; sp = cu.splines.new('POLY'); sp.points.add(n)
    for i in range(n + 1):
        t = i / n; p = a.lerp(b, t); p.z -= sag * 4 * t * (1 - t); sp.points[i].co = (p.x, p.y, p.z, 1)
        if i < n:
            q = a.lerp(b, (i + 0.5) / n); q.z -= sag * 4 * ((i + 0.5) / n) * (1 - (i + 0.5) / n)
            d = (b - a).normalized() * size * 0.5
            me = bpy.data.meshes.new('pen'); bm = bmesh.new(); v = [bm.verts.new(q - d), bm.verts.new(q + d), bm.verts.new(q + Vector((0, 0, -size * 1.2)))]
            bm.faces.new(v); bm.to_mesh(me); bm.free(); o = bpy.data.objects.new('pen', me); me.materials.append(cols[i % 3]); link(o, CT3)
    o = bpy.data.objects.new('str', cu); cu.materials.append(M_WIRE); link(o, CT3)
for k in range(-4, 4): bunting((PLAT_X + 0.42, SY + k * 2.2, 3.85), (PLAT_X + 0.42, SY + (k + 1) * 2.2, 3.85), 5, 0.3, 0.26)

# main street of false-front buildings behind the depot (two rows facing each other)
SIGNS = ['HOTEL', 'GENERAL STORE', 'BANK', 'BARBER', 'FEED & SEED', 'SALOON', 'POST OFFICE', 'BAKERY', 'TAILOR', 'SHERIFF']
WALLS = [M_WALL3, M_WALL4, M_WALL2, M_WALL, M_WALL3, M_WALL4, M_WALL, M_WALL2, M_WALL4, M_WALL3]
for row, (x, face) in enumerate(((16.0, -1), (30.0, -1))):   # both rows face the track (-X); back row stands taller
    for k in range(5):
        y = SY - 16 + k * 8.4; idx = row * 5 + k; wd, h = 7.4, R.uniform(4.0, 6.0) + row * 2.5; dpt = 9.0; y += row * 4.2
        box('bld', (dpt, wd, h), (x + dpt / 2, y, h / 2 - 0.3), WALLS[idx], CT3)
        fx = x if face == -1 else x  # facade plane x
        fz = h + 1.6; box('front', (0.25, wd + 0.2, fz), (fx, y, fz / 2 - 0.3), WALLS[idx], CT3)
        box('cornice', (0.45, wd + 0.5, 0.25), (fx, y, fz - 0.35), M_TRIM, CT3)
        box('signb', (0.08, wd * 0.8, 0.9), (fx + face * 0.15, y, fz - 1.2), M_TRIM, CT3)
        text(SIGNS[idx], (fx + face * 0.2, y, fz - 1.2), (math.pi / 2, 0, -math.pi / 2 if face == -1 else math.pi / 2), 0.5 if len(SIGNS[idx]) < 9 else 0.38, M_INK2, depth=0.01)
        for dy in (-2.2, 2.2): box('w', (0.06, 1.4, 1.6), (fx + face * 0.14, y + dy, 1.6), M_WIN, CT3)
        box('door', (0.06, 1.2, 2.3), (fx + face * 0.14, y, 1.0), M_WIN, CT3)
        # porch roof on posts
        box('porch', (2.4, wd + 0.2, 0.12), (fx + face * 1.2, y, 3.0), M_ROOF, CT3)
        for dy in (-wd / 2 + 0.2, 0, wd / 2 - 0.2): cyl('pp', 0.07, 3.2, (fx + face * 2.3, y + dy, 1.4), M_TRIM, CT3, 8)
        box('boardwalk', (2.6, wd + 0.2, 0.15), (fx + face * 1.3, y, -0.22), M_TIE, CT3)
