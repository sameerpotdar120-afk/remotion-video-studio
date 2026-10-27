"""
Russia video map views: real terrain reprojected to a Lambert conformal conic view (so Russia is not
stretched like on a plate-carrée map), painted in a natural "satellite" palette.

Each view writes  public/russia/maps/<view>_sat.jpg   (colour, relief baked in)
                  public/russia/maps/<view>_land.png  (land mask, for fills that must stop at the coast)
and its projection parameters to src/russia/maps/views.json. The code builds the SAME projection with
d3.geoConicConformal().rotate([-lon0, 0]).parallels(p).scale(k).translate([tx, ty]) — the inverse below is
d3's own conicConformalRaw, so vectors and rasters line up to the pixel.

usage: bake_views.py SRC_DIR NE_DIR [view ...]
  SRC_DIR: build_terrain.py output (<src>_elev.npy + <src>_meta.json)
  NE_DIR : Natural Earth geojson (geography_regions_polys, glaciated_areas, lakes)
"""
import json, math, os, sys
import numpy as np, cv2

SRC, NE = sys.argv[1], sys.argv[2]
OUT_IMG, OUT_JSON = 'public/russia/maps', 'src/russia/maps/views.json'
os.makedirs(OUT_IMG, exist_ok=True); os.makedirs(os.path.dirname(OUT_JSON), exist_ok=True)

VIEWS = {
    #  name           W     H    lon0  parallels    fit bbox (w, s, e, n)        source            VE
    'ru_west':     (6144, 3456, 36, (45, 62), (8, 38, 66, 68),            'src_ru_west',     9),
    'eurasia':     (5760, 3240, 92, (35, 65), (-8, 22, 192, 78),          'src_eurasia',     14),
    'india_route': (3840, 2160, 58, (15, 45), (28, 5, 88, 60),            'src_india_route', 9),
    'europe_wide': (5760, 3240, 25, (40, 62), (-12, 34, 62, 70),          'src_europe_wide', 10),
    'world_eq':    (8192, 4096, 0, None, (-180, -90, 180, 90),          'src_eurasia',     16),   # globe texture (equirectangular)
}

# ---------------------------------------------------------------- d3 conicConformal (spherical)
def lcc(p0, p1):
    y0, y1 = math.radians(p0), math.radians(p1)
    tany = lambda y: math.tan((math.pi / 2 + y) / 2)
    cy0 = math.cos(y0)
    n = math.sin(y0) if y0 == y1 else math.log(cy0 / math.cos(y1)) / math.log(tany(y1) / tany(y0))
    f = cy0 * tany(y0) ** n / n
    def fwd(lam, phi):
        phi = np.maximum(phi, -math.pi / 2 + 1e-6) if f > 0 else np.minimum(phi, math.pi / 2 - 1e-6)
        r = f / np.tan((math.pi / 2 + phi) / 2) ** n
        return r * np.sin(n * lam), f - r * np.cos(n * lam)
    def inv(x, y):
        fy = f - y
        r = np.sign(n) * np.sqrt(x * x + fy * fy)
        l = np.arctan2(x, np.abs(fy)) * np.sign(fy)
        l = np.where(fy * n < 0, l - math.pi * np.sign(x) * np.sign(fy), l)
        return l / n, 2 * np.arctan((f / r) ** (1 / n)) - math.pi / 2
    return fwd, inv

def fit(view):
    W, H, lon0, (p0, p1), (w, s, e, n_), *_ = view
    fwd, inv = lcc(p0, p1)
    lons = np.concatenate([np.linspace(w, e, 200), np.full(100, e), np.linspace(e, w, 200), np.full(100, w)])
    lats = np.concatenate([np.full(200, s), np.linspace(s, n_, 100), np.full(200, n_), np.linspace(n_, s, 100)])
    x, y = fwd(np.radians(lons - lon0), np.radians(lats))
    y = -y                                             # d3: screen y = ty - k*y
    k = min(W / (x.max() - x.min()), H / (y.max() - y.min()))
    tx = W / 2 - k * (x.max() + x.min()) / 2
    ty = H / 2 - k * (y.max() + y.min()) / 2
    return k, tx, ty, fwd, inv

# ---------------------------------------------------------------- vector masks rasterised in lon/lat space
def poly_rings(geom):
    if geom['type'] == 'Polygon': return [geom['coordinates']]
    if geom['type'] == 'MultiPolygon': return geom['coordinates']
    return []

def lonlat_mask(features, LON, LAT, ppd=4.0, blur_deg=0.0):
    """rasterise polygons on a global 4 px/deg grid, then sample at LON/LAT (wrapped)"""
    gw, gh = int(360 * ppd), int(180 * ppd)
    m = np.zeros((gh, gw), np.uint8)
    for f in features:
        for poly in poly_rings(f['geometry']):
            ring = np.array(poly[0], np.float64)
            pts = np.stack([(ring[:, 0] + 180) * ppd, (90 - ring[:, 1]) * ppd], 1)
            cv2.fillPoly(m, [np.round(pts).astype(np.int32)], 255, cv2.LINE_AA)
    m = m.astype(np.float32) / 255
    if blur_deg: m = cv2.GaussianBlur(m, (0, 0), blur_deg * ppd)
    gx = (((LON + 180) % 360) * ppd).astype(np.float32)
    gy = ((90 - LAT) * ppd).astype(np.float32)
    return cv2.remap(m, gx, gy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_WRAP)

def hexc(h):
    h = h.lstrip('#'); return np.array([int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)], np.float32) / 255

def smooth(x, a, b):
    t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

def value_noise(H, W, cell, seed):
    rng = np.random.default_rng(seed)
    g = rng.random((H // cell + 2, W // cell + 2)).astype(np.float32)
    return cv2.resize(g, (W + cell, H + cell), interpolation=cv2.INTER_CUBIC)[:H, :W]

geo = json.load(open(f'{NE}/ne_50m_geography_regions_polys.geojson'))['features']
glac = json.load(open(f'{NE}/ne_10m_glaciated_areas.geojson'))['features']
lakes = json.load(open(f'{NE}/ne_10m_lakes.geojson'))['features']
by = lambda *cls: [f for f in geo if f['properties']['FEATURECLA'] in cls]
byname = lambda *names: [f for f in geo if f['properties']['NAME'].upper() in names]

views_json = json.load(open(OUT_JSON)) if os.path.exists(OUT_JSON) else {}
for name in (sys.argv[3:] or list(VIEWS)):
    view = VIEWS[name]
    W, H, lon0, par, bbox, src, VE = view
    px, py = np.meshgrid(np.arange(W, dtype=np.float64) + 0.5, np.arange(H, dtype=np.float64) + 0.5)
    if par is None:                                   # equirectangular
        k = tx = ty = 0
        LON = -180 + px / W * 360; LAT = 90 - py / H * 180
    else:
        k, tx, ty, fwd, inv = fit(view)
        lam, phi = inv((px - tx) / k, -(py - ty) / k)
        LON = np.degrees(lam) + lon0; LAT = np.degrees(phi)
        del lam, phi
    del px, py
    # elevation: the view's own source, then wider/coarser sources wherever the frame runs past it
    e = np.zeros(LON.shape, np.float32); todo = np.ones(LON.shape, bool)
    for sname in (src, 'src_eurasia', 'src_arctic', 'world', 'src_antarctic'):
        meta = json.load(open(f'{SRC}/{sname}_meta.json')); el = np.load(f'{SRC}/{sname}_elev.npy')
        ppd = meta['px_per_degree']
        lon = ((LON + 180) % 360) - 180 if sname == 'world' else LON
        sx = ((lon - meta['west']) * ppd - 0.5).astype(np.float32)
        sy = ((meta['north'] - LAT) * ppd - 0.5).astype(np.float32)
        ok = (sx >= 0) & (sy >= 0) & (sx <= el.shape[1] - 1) & (sy <= el.shape[0] - 1)
        if sname == 'src_antarctic': ok = np.ones_like(ok)          # last resort: edge-replicate
        use = todo & ok
        if use.any():
            v = cv2.remap(el.astype(np.float32), sx, sy, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)
            e[use] = v[use]
        todo &= ~use
        del el, sx, sy
    outside = np.zeros(LON.shape, bool)
    # no terrain source reaches the poles: open Arctic Ocean north of 84°, Antarctic ice south of -80°
    e = np.where(LAT > 84, -3500 * smooth(LAT, 84, 85.5) + e * (1 - smooth(LAT, 84, 85.5)), e).astype(np.float32)
    e = np.where(LAT < -80, np.maximum(e, 2500), e).astype(np.float32)
    med = cv2.medianBlur(e.astype(np.float32), 5); bad = np.abs(e - med) > 1500; e[bad] = med[bad]
    # lakes burned in (natural lakes sit above sea level)
    lake = lonlat_mask([f for f in lakes if (f['properties'].get('scalerank') or 0) <= 6], LON, LAT, ppd=20) > 0.5
    land = (e > 0.5) & ~lake
    land = cv2.medianBlur(land.astype(np.uint8) * 255, 5) > 127
    # ---------------- hillshade on the projected grid (metres per pixel from the projection scale)
    R = 6371000.0
    # local scale of LCC: m per px ≈ R / k / (dimensionless scale factor); estimate numerically
    lat_r = np.radians(LAT)
    dlat = np.gradient(LAT, axis=0); dlon = np.gradient(LON, axis=1)
    mpp_y = np.abs(dlat) * 111320.0 + 1e-3
    mpp_x = np.abs(dlon) * 111320.0 * np.cos(lat_r) + 1e-3
    ez = np.where(land, e, 0).astype(np.float32) * VE
    gy, gx = np.gradient(ez)
    gx = gx / mpp_x; gy = gy / mpp_y
    def shade(az, alt):
        a, b = math.radians(360 - az + 90), math.radians(alt)
        slope = np.arctan(np.hypot(gx, gy)); aspect = np.arctan2(gy, -gx)
        return np.sin(b) * np.cos(slope) + np.cos(b) * np.sin(slope) * np.cos(a - aspect)
    hs = np.clip(0.75 * shade(315, 40) + 0.25 * shade(270, 55), 0, 1.2)
    flat = math.sin(math.radians(40)) * 0.75 + math.sin(math.radians(55)) * 0.25
    hs = np.where(land, hs / flat, 1.0).astype(np.float32)          # 1 = flat
    del gx, gy
    # ---------------- biome weights
    nz = sum(value_noise(H, W, max(4, W // d), 7 + i) * a for i, (d, a) in enumerate([(60, .45), (160, .27), (420, .17), (1100, .11)]))
    draw = np.clip(lonlat_mask(by('Desert'), LON, LAT, blur_deg=3.0) * 1.4
                   + 0.7 * lonlat_mask(byname('TURAN LOWLAND', 'USTYURT PLATEAU', 'CASPIAN DEPRESSION'), LON, LAT, blur_deg=3.0), 0, 1.3)
    near = smooth(draw, 0.02, 0.2)                    # noise only roughens edges near real deserts
    draw = draw + 0.9 * (nz - 0.5) * near
    desert = smooth(draw, 0.38, 0.72)                 # sandy core with ragged edges
    semi = smooth(draw, 0.08, 0.40) * (1 - desert)    # dry olive-tan fringe around it
    steppe = np.clip(lonlat_mask(byname('KAZAKH STEPPE', 'PONTIC STEPPE', 'MONGOLIAN PLATEAU', 'KAZAKH UPLAND'), LON, LAT, blur_deg=2.0) * 1.2, 0, 1.2)
    steppe = smooth(steppe + 0.5 * (nz - 0.5), 0.2, 0.75)
    tundra = np.clip(smooth(LAT, 64.5, 70.5) + 0.8 * lonlat_mask(by('Tundra'), LON, LAT, blur_deg=1.0), 0, 1)
    tundra *= 1 - 0.6 * smooth(-LON, -32, -2)                      # Scandinavian coast stays forested longer
    ice = np.clip(lonlat_mask(glac, LON, LAT, ppd=20, blur_deg=0.08) + smooth(e, 4600, 5600) + smooth(LAT, 79, 82)
                  + smooth(-LAT, 60, 63), 0, 1)
    rock = smooth(e, 1700, 3300) * (1 - ice)
    tropic = smooth(-LAT, -30, -18)                                 # India / SE Asia: greener-olive
    jitter = value_noise(H, W, 96, 1) * 0.6 + value_noise(H, W, 23, 2) * 0.4
    # ---------------- colours (natural-colour satellite, tuned to read under translucent fills)
    forest = hexc('#2F4A2B'); mixed = hexc('#46602F'); temperate = hexc('#5C7238'); steppe_c = hexc('#9C9A5E')
    desert_c = hexc('#C9AE7E'); tundra_c = hexc('#71705A'); rock_c = hexc('#7D6F5E'); ice_c = hexc('#EDF1F4'); tropic_c = hexc('#5B6A33')
    taiga_w = smooth(LAT, 47, 55)                                    # south: temperate/mixed, north: dark taiga
    base = temperate * (1 - taiga_w)[..., None] + (mixed * 0.45 + forest * 0.55) * taiga_w[..., None]
    base = base * (1 - tropic)[..., None] + tropic_c * tropic[..., None]
    base = base * (0.9 + 0.2 * jitter)[..., None]
    def mix(img, col, w): return img * (1 - w)[..., None] + col * w[..., None]
    img = mix(base, steppe_c, steppe * 0.6)
    img = mix(img, hexc('#8F8A5A'), semi * 0.8)
    img = mix(img, desert_c * (0.92 + 0.16 * jitter)[..., None], desert)
    img = mix(img, tundra_c, tundra * 0.9)
    img = mix(img, rock_c, rock * 0.85)
    img = mix(img, ice_c, ice)
    img = img * (0.35 + 0.65 * np.clip(hs, 0, 1.25))[..., None] ** 1.0
    # sea: deep navy → lighter shelf; lakes slightly lighter
    depth = np.sqrt(np.clip(-cv2.GaussianBlur(e, (0, 0), max(2.0, W / 500)), 0, 5000) / 5000)
    sea = hexc('#1E4E78') * (1 - depth)[..., None] + hexc('#0B2441') * depth[..., None]
    sea = np.where(lake[..., None], hexc('#235A85'), sea)
    # coast: thin lighter shallow-water rim
    rim = cv2.GaussianBlur(land.astype(np.float32), (0, 0), max(1.0, W / 2600)) * (~land)
    sea = sea + (hexc('#3F7FA6') - sea) * (0.55 * rim)[..., None]
    out = np.where(land[..., None], img, sea)
    out[outside] = hexc('#0B2441')
    out = np.clip(out, 0, 1)
    cv2.imwrite(f'{OUT_IMG}/{name}_sat.jpg', (out[..., ::-1] * 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90])
    small = cv2.resize(land.astype(np.uint8) * 255, (W // 2, H // 2), interpolation=cv2.INTER_AREA)
    cv2.imwrite(f'{OUT_IMG}/{name}_land.png', small, [cv2.IMWRITE_PNG_COMPRESSION, 9])
    if par is None:
        views_json[name] = dict(width=W, height=H, projection='equirectangular', sat=f'russia/maps/{name}_sat.jpg')
        print(f'{name:12} {W}x{H} equirect', flush=True); continue
    views_json[name] = dict(width=W, height=H, lon0=lon0, parallels=list(par), scale=round(k, 4),
                            translate=[round(tx, 3), round(ty, 3)], sat=f'russia/maps/{name}_sat.jpg',
                            land=f'russia/maps/{name}_land.png', outsideSourcePct=round(float(outside.mean() * 100), 2))
    print(f'{name:12} {W}x{H} k={k:.1f} land {land.mean()*100:.1f}%  outside-source {outside.mean()*100:.2f}%', flush=True)
    del LON, LAT, e, out, img, base
json.dump(views_json, open(OUT_JSON, 'w'), indent=1)
