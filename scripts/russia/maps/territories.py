"""
Historical territories for the Russia video → src/russia/maps/territories.json (GeoJSON, lon/lat).

Sources of shape: modern borders are Natural Earth 10m admin-0 (public domain); historical outlines are
hand-traced approximations of standard atlas maps of each period (for a cartoon explainer, accurate to
roughly a degree), then clipped to Natural Earth land so every fill stops at the real coastline.
Crimea is kept as its own piece: "russia_modern" is Russia WITHOUT Crimea and "ukraine" WITH it, so the
2014 annexation is shown as a change (Natural Earth's default worldview draws Crimea inside Russia).

usage: territories.py NE_ADMIN0_10M LAND_10M
"""
import json, sys
from shapely.geometry import shape, mapping, Polygon, MultiPolygon, Point, box
from shapely.ops import unary_union, voronoi_diagram

adm = {f['properties']['ADMIN']: shape(f['geometry']) for f in json.load(open(sys.argv[1]))['features']}
land = unary_union([shape(f['geometry']).buffer(0) for f in json.load(open(sys.argv[2]))['features']
                    if shape(f['geometry']).intersects(box(-30, 20, 200, 85))])
# land beyond 180° E (Chukotka) is stored at negative longitudes: add a shifted copy for 180..200
from shapely.affinity import translate
land = unary_union([land, translate(land.intersection(box(-180, 50, -160, 75)), xoff=360)])

import math, random
_seed = [0]
def P(*pts):
    """hand-traced outline → densified and gently roughened so borders look surveyed, not ruled"""
    _seed[0] += 1
    rnd = random.Random(_seed[0])
    ring = Polygon(pts).buffer(0).exterior.segmentize(0.08).coords[:-1]
    L, acc = [0.0], 0.0
    for a, b in zip(ring, ring[1:] + ring[:1]):
        acc += math.dist(a, b); L.append(acc)
    waves = [(rnd.uniform(0.7, 1.3) * 2 * math.pi / w, rnd.uniform(0, 6.3), amp) for w, amp in ((4.0, 0.16), (1.7, 0.07), (0.8, 0.025))]
    out = []
    for i, (x, y) in enumerate(ring):
        a, b = ring[i - 1], ring[(i + 1) % len(ring)]
        tx_, ty_ = b[0] - a[0], b[1] - a[1]; d = math.hypot(tx_, ty_) or 1
        nx, ny = -ty_ / d, tx_ / d
        off = sum(amp * math.sin(k * L[i] + ph) for k, ph, amp in waves)
        out.append((x + nx * off, y + ny * off))
    from shapely import make_valid
    base = Polygon(pts).buffer(0)
    g = make_valid(Polygon(out))
    g = unary_union([q for q in getattr(g, 'geoms', [g]) if q.geom_type in ('Polygon', 'MultiPolygon')])
    if abs(g.area - base.area) > 0.08 * base.area: raise SystemExit(f'roughen broke a polygon: {g.area:.2f} vs {base.area:.2f}')
    return g
def C(*names):
    g = []
    for n in names:
        s = adm[n]
        if n == 'Russia':   # put Chukotka's far tip on the +180..200 side too
            s = unary_union([s, translate(s.intersection(box(-180, 50, -160, 75)), xoff=360)])
        g.append(s)
    return unary_union(g)
def on_land(g): return g.intersection(land).buffer(0)

crimea = on_land(P((32.3, 46.12), (33.9, 46.20), (34.9, 46.2), (36.0, 45.6), (36.8, 45.4), (36.6, 44.9), (35.3, 44.4),
                   (33.6, 44.2), (32.3, 45.2)))
out = {}
def add(id_, g, **props):
    g = g.buffer(0)
    if g.is_empty: raise SystemExit(f'empty: {id_}')
    out[id_] = (g, props)

# ---------------------------------------------------------------- modern
add('russia_modern', C('Russia').difference(crimea))
add('crimea', crimea)
add('ukraine', unary_union([C('Ukraine'), crimea]))
REP15 = ['Russia', 'Ukraine', 'Belarus', 'Moldova', 'Lithuania', 'Latvia', 'Estonia', 'Georgia', 'Armenia', 'Azerbaijan',
         'Kazakhstan', 'Uzbekistan', 'Turkmenistan', 'Kyrgyzstan', 'Tajikistan']
for n in REP15:
    g = C(n)
    if n == 'Russia': g = g.difference(crimea)
    if n == 'Ukraine': g = unary_union([g, crimea])
    add('rep_' + n.lower(), g, name=n)
add('ussr_1945', unary_union([C(*REP15)]))
add('india', C('India'))
add('japan', C('Japan'))
add('alaska', C('United States of America').intersection(box(-170, 51, -129, 72)))
add('usa_main', C('United States of America').intersection(box(-126, 24, -66, 50)))
add('sweden_modern', C('Sweden'))
add('poland_modern', C('Poland'))
add('germany_modern', C('Germany'))
add('china', C('China'))
add('mongolia', C('Mongolia'))
add('turkey', C('Turkey'))

# ---------------------------------------------------------------- Rus (862–1240)
rus_882 = on_land(P((31.5, 61.0), (35, 60.6), (38.6, 58.6), (40.2, 57.2), (39.6, 55.6), (37.2, 54.2), (35.5, 52.2), (34.0, 50.6),
                    (32.2, 49.6), (30.0, 49.4), (28.2, 50.0), (26.8, 51.4), (26.2, 53.0), (27.0, 55.0), (27.4, 57.0), (28.0, 58.5),
                    (29.0, 59.9), (30.4, 60.6)))
add('kievan_rus_882', rus_882, name='Kievan Rus')
rus_1000 = on_land(P((29.0, 60.4), (31.0, 61.6), (34.5, 62.3), (38.5, 61.8), (41.5, 59.6), (43.0, 57.6), (43.5, 56.0), (41.6, 54.4),
                     (39.8, 53.2), (37.5, 52.0), (35.6, 50.6), (34.0, 49.2), (32.3, 48.8), (30.2, 49.0), (28.0, 48.7), (25.8, 48.2),
                     (23.4, 49.0), (22.6, 50.4), (23.6, 51.6), (24.0, 53.2), (24.6, 54.6), (26.0, 55.6), (26.6, 57.0), (27.6, 58.0),
                     (27.8, 59.3)))
add('kievan_rus_1000', rus_1000, name='Kievan Rus')
# principalities ≈1150: Voronoi cells around each capital, clipped to the Rus outline
caps = [('Novgorod', 31.3, 59.2), ('Pskov', 28.3, 57.8), ('Polotsk', 28.6, 55.4), ('Smolensk', 32.4, 54.6), ('Vladimir-Suzdal', 40.0, 57.0),
        ('Ryazan', 40.4, 54.3), ('Chernigov', 32.6, 52.0), ('Kyiv', 30.0, 50.4), ('Pereyaslavl', 33.4, 49.9), ('Turov-Pinsk', 27.4, 52.3),
        ('Volhynia', 24.4, 51.0), ('Galicia', 24.4, 49.3), ('Rostov', 38.6, 58.6), ('Murom', 42.4, 55.6)]
from shapely.geometry import MultiPoint
vor = voronoi_diagram(MultiPoint([Point(x, y) for _, x, y in caps]), envelope=box(15, 40, 50, 70))
for name, x, y in caps:
    cell = next(c for c in vor.geoms if c.contains(Point(x, y)))
    add('prin_' + name.lower().replace('-', '_'), cell.intersection(rus_1000), name=name)

# ---------------------------------------------------------------- Mongols (1237–1480)
horde = on_land(P((28.5, 45.4), (30.2, 46.6), (31.8, 47.6), (34.0, 49.0), (36.2, 50.6), (39.0, 52.0), (41.5, 53.2), (44.0, 54.6), (46.5, 55.6),
                  (49.0, 56.4), (52.5, 57.0), (56.5, 57.2), (60.0, 57.0), (64.0, 56.4), (68.5, 55.6), (73.0, 54.2), (77.0, 52.4), (80.5, 50.4),
                  (82.6, 48.2), (81.0, 45.6), (77.0, 44.0), (72.0, 43.0), (67.0, 42.0), (62.6, 40.6), (59.6, 40.4), (56.0, 41.0), (53.0, 41.4),
                  (49.0, 42.2), (47.2, 43.4), (44.6, 43.4), (41.0, 43.8), (38.0, 44.6), (35.6, 44.6), (33.6, 44.4), (32.4, 45.4), (30.2, 45.8)))
add('golden_horde', horde, name='Golden Horde')
add('muscovy_1300', on_land(P((35.6, 55.2), (36.4, 56.3), (38.4, 56.6), (39.8, 55.9), (39.6, 55.0), (37.6, 54.6))), name='Moscow')
add('muscovy_1462', on_land(P((33.8, 55.6), (35.0, 57.3), (37.5, 58.8), (40.0, 59.8), (43.0, 60.0), (46.0, 59.5), (46.0, 58.0), (44.0, 57.0),
                              (43.0, 56.0), (41.5, 55.0), (40.0, 54.0), (38.0, 53.8), (36.0, 54.0), (34.5, 54.6))), name='Muscovy')
add('novgorod_rep', on_land(P((27.8, 57.6), (28.0, 59.4), (30.0, 61.0), (32.4, 63.0), (33.4, 65.0), (34.6, 67.0), (38.0, 68.6), (44.0, 68.6),
                              (52.0, 68.8), (60.0, 68.6), (62.0, 64.0), (58.4, 61.2), (52.0, 61.4), (46.0, 61.0), (40.0, 60.6), (37.0, 59.2),
                              (34.4, 57.6), (32.0, 57.0), (29.6, 56.8))), name='Novgorod')
add('muscovy_1505', on_land(P((28.0, 57.6), (27.8, 59.3), (30.0, 61.0), (32.4, 63.0), (33.4, 65.0), (34.6, 67.0), (38.0, 68.8), (44.0, 68.8),
                              (53.0, 68.8), (60.0, 68.6), (62.4, 64.0), (59.0, 61.0), (57.6, 59.2), (55.0, 58.6), (52.0, 58.0), (48.0, 57.2),
                              (46.0, 56.4), (43.6, 55.8), (42.0, 54.8), (40.2, 53.4), (37.6, 52.4), (35.2, 52.4), (33.2, 53.6), (32.6, 54.6),
                              (31.6, 55.6), (30.0, 56.2))), name='Muscovy')
add('kazan_khanate', on_land(P((45.6, 54.6), (46.0, 56.4), (48.0, 57.4), (52.0, 58.2), (55.4, 58.0), (56.6, 56.2), (54.0, 54.4), (50.0, 53.4),
                               (47.4, 53.6))), name='Kazan')
russia_1584 = on_land(P((28.0, 57.6), (27.8, 59.3), (30.0, 61.0), (32.4, 63.0), (33.4, 65.0), (34.6, 67.0), (38.0, 69.0), (44.0, 69.0),
                        (53.0, 69.2), (60.0, 69.6), (66.0, 69.0), (68.0, 64.0), (66.0, 60.0), (62.6, 57.6), (59.6, 55.0), (56.6, 52.6),
                        (53.0, 51.0), (50.0, 49.0), (48.6, 47.0), (47.6, 45.8), (46.6, 46.4), (46.6, 47.8), (45.0, 49.0), (43.2, 50.4),
                        (40.6, 51.0), (38.0, 51.2), (35.4, 52.0), (33.0, 53.2), (31.8, 54.2), (30.8, 55.4), (29.6, 56.0)))
add('russia_1584', russia_1584, name='Tsardom of Russia')
add('oprichnina', on_land(P((34.6, 55.4), (35.4, 56.8), (37.2, 58.0), (38.6, 59.6), (40.6, 61.0), (44.6, 61.4), (46.0, 60.0), (43.4, 58.6),
                            (41.4, 57.4), (40.2, 56.2), (38.0, 55.4), (36.0, 54.8))), name='Oprichnina')

# ---------------------------------------------------------------- Troubles (1610)
pl_lt = on_land(P((14.4, 54.2), (17.8, 54.8), (21.0, 55.3), (21.0, 57.4), (24.2, 57.6), (27.4, 56.2), (30.8, 56.0), (32.6, 55.0), (34.0, 53.6),
                  (34.6, 52.0), (34.4, 50.2), (35.6, 49.0), (33.0, 48.0), (30.0, 48.2), (28.8, 46.8), (27.0, 48.0), (24.0, 48.0), (22.4, 49.0),
                  (19.0, 49.3), (17.0, 50.2), (15.0, 51.0), (14.4, 52.6)))
add('poland_lithuania_1610', pl_lt, name='Poland–Lithuania')
add('sweden_1610', unary_union([C('Sweden', 'Finland', 'Estonia')]), name='Sweden')
add('sweden_nibble_1611', on_land(P((27.8, 59.3), (28.0, 57.8), (29.6, 57.4), (32.2, 57.8), (33.6, 59.6), (33.0, 61.4), (30.4, 61.6))),
    name='Swedish-held Novgorod')
add('russia_1610', russia_1584.difference(pl_lt).difference(out['sweden_nibble_1611'][0]), name='Russia')

# ---------------------------------------------------------------- Peter / Catherine
ussr15 = out['ussr_1945'][0]
amur = on_land(P((120.0, 53.6), (126.0, 53.6), (132.0, 52.0), (137.0, 54.6), (141.6, 53.0), (141.6, 42.0), (130.0, 42.0), (120.0, 49.0)))
n_caucasus = on_land(P((36.6, 46.0), (40.0, 46.4), (44.0, 46.8), (47.6, 45.6), (48.6, 42.0), (40.0, 41.0), (36.6, 43.0)))
s_siberia = on_land(P((50.0, 53.0), (56.0, 54.6), (62.0, 55.2), (70.0, 55.6), (78.0, 55.4), (86.0, 54.4), (90.0, 52.0), (92.0, 48.0), (50.0, 45.0)))
russia_modern = out['russia_modern'][0]
left_bank = on_land(P((30.4, 51.6), (30.2, 50.6), (31.4, 49.4), (34.0, 49.0), (36.2, 49.8), (38.2, 50.2), (38.2, 51.6), (35.0, 52.4), (32.0, 52.4)))
kamchatka = on_land(box(150, 50, 166, 63))
r1700 = unary_union([russia_modern.difference(C('Russia').intersection(box(19, 54, 23.5, 56)))   # Kaliningrad
                     .difference(on_land(P((27.0, 58.8), (27.8, 61.4), (31.0, 64.0), (34.0, 66.0), (36.6, 64.6), (33.4, 61.0), (30.6, 59.4))))  # Ingria/Karelia (Swedish)
                     .difference(amur).difference(n_caucasus).difference(s_siberia).difference(kamchatka), left_bank])
add('russia_1700', r1700, name='Russia')
sweden_1700 = unary_union([C('Sweden', 'Finland', 'Estonia'), C('Latvia').intersection(box(20, 56.6, 28, 58.2)),
                           on_land(P((27.0, 58.8), (27.8, 61.4), (31.0, 64.0), (34.0, 66.0), (36.6, 64.6), (33.4, 61.0), (30.6, 59.4)))])
add('sweden_1700', sweden_1700, name='Sweden')
r1725 = unary_union([r1700, C('Estonia'), C('Latvia').intersection(box(20, 56.6, 28, 58.2)),
                     on_land(P((27.0, 58.8), (27.8, 61.4), (30.2, 62.6), (29.4, 61.2), (28.2, 60.6))), kamchatka])
add('russia_1725', r1725, name='Russian Empire')
crimean_khanate = unary_union([crimea, on_land(P((31.0, 46.6), (31.2, 47.6), (33.6, 47.6), (36.6, 47.4), (39.4, 46.6), (38.0, 45.4), (35.0, 45.6), (33.2, 46.1)))])
add('crimean_khanate', crimean_khanate, name='Crimean Khanate')
ottoman = unary_union([C('Turkey', 'Greece', 'Bulgaria', 'North Macedonia', 'Albania', 'Republic of Serbia', 'Bosnia and Herzegovina',
                         'Montenegro', 'Kosovo', 'Romania', 'Moldova')])
add('ottoman', ottoman, name='Ottoman Empire')
r1796 = unary_union([r1725, C('Latvia', 'Lithuania', 'Belarus'), C('Ukraine').difference(box(22, 47, 26.6, 50.4)), crimea,
                     on_land(P((36.6, 46.0), (40.0, 46.4), (43.0, 46.0), (41.0, 44.6), (37.0, 44.8)))]).difference(C('Moldova'))
add('russia_1796', r1796, name='Russian Empire')
add('pugachev_revolt', on_land(P((44.6, 50.2), (45.6, 53.4), (48.4, 56.8), (53.0, 58.6), (59.4, 59.0), (61.6, 56.0), (58.6, 52.2), (54.0, 51.0),
                                 (49.0, 49.4))), name='Pugachev')

# ---------------------------------------------------------------- 1812
add('napoleon_1812', unary_union([C('France', 'Belgium', 'Netherlands', 'Luxembourg', 'Germany', 'Switzerland', 'Italy', 'Spain',
                                    'Austria', 'Czechia', 'Slovenia', 'Croatia', 'Denmark'),
                                   C('Poland').intersection(box(16.6, 49.6, 23.6, 54.2))]), name="Napoleon's Europe")
r1812 = unary_union([r1796, C('Finland'), C('Moldova')])
add('russia_1812', r1812, name='Russian Empire')

# ---------------------------------------------------------------- 1914 – 1945
congress_poland = C('Poland').intersection(P((17.6, 52.0), (18.6, 50.8), (19.8, 50.2), (22.0, 50.4), (24.2, 50.6), (24.0, 54.4), (21.0, 54.4), (19.0, 53.2)))
galicia = unary_union([C('Ukraine').intersection(P((22.0, 47.8), (26.4, 47.8), (26.4, 50.4), (23.4, 50.6), (22.0, 49.4))), C('Poland').intersection(box(19, 49, 22.4, 50.4))])
r1914 = unary_union([ussr15, C('Finland'), congress_poland]).difference(galicia).difference(on_land(box(141, 45.8, 145, 50)))  # S. Sakhalin Japanese after 1905
add('russia_1914', r1914, name='Russian Empire')
add('ussr_1922', ussr15.difference(C('Estonia', 'Latvia', 'Lithuania', 'Moldova'))
    .difference(on_land(P((23.0, 56.0), (27.6, 55.6), (27.6, 53.4), (26.8, 51.6), (26.6, 49.6), (25.6, 47.8), (22.0, 47.8), (22.0, 54.0)))),
    name='USSR')
add('germany_1941', unary_union([C('Germany', 'Austria', 'Czechia', 'Slovakia', 'Hungary', 'Romania', 'Poland')]), name='Germany and allies')
east_ger = C('Germany').intersection(P((10.4, 54.6), (11.4, 53.0), (10.6, 51.6), (10.0, 50.4), (12.0, 50.2), (15.2, 50.8), (14.4, 54.6)))
add('eastern_bloc', unary_union([C('Poland', 'Czechia', 'Slovakia', 'Hungary', 'Romania', 'Bulgaria', 'Albania'), east_ger]), name='Eastern Bloc')

# ---------------------------------------------------------------- write (simplified, rounded)
feats = []
for id_, (g, props) in out.items():
    g = g.simplify(0.015, preserve_topology=True)
    if g.geom_type == 'GeometryCollection':
        g = unary_union([p for p in g.geoms if p.geom_type in ('Polygon', 'MultiPolygon')])
    # drop specks (< 0.002 deg²)
    if g.geom_type == 'MultiPolygon':
        g = MultiPolygon([p for p in g.geoms if p.area > 0.002]) if any(p.area > 0.002 for p in g.geoms) else g
    m = mapping(g)
    def rnd(c):
        return [rnd(x) for x in c] if isinstance(c[0], (list, tuple)) else [round(c[0], 3), round(c[1], 3)]
    m = {'type': m['type'], 'coordinates': rnd(m['coordinates'])}
    c = g.representative_point()
    feats.append({'type': 'Feature', 'id': id_, 'properties': {'id': id_, 'label': [round(c.x, 2), round(c.y, 2)], **props}, 'geometry': m})
json.dump({'type': 'FeatureCollection', 'features': feats}, open('src/russia/maps/territories.json', 'w'), separators=(',', ':'))
import os
print(len(feats), 'features', os.path.getsize('src/russia/maps/territories.json') // 1024, 'KB')
