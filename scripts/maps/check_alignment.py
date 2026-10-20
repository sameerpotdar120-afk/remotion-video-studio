import sys, json, numpy as np, cv2
R, region, out, coast = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
reg = json.load(open(f"{R}/public/assets/maps_raster/regions.json"))[region]
w, n, ppd = reg['west'], reg['north'], reg['pxPerDegree']
hs = cv2.imread(f"{R}/public/assets/maps_raster/hillshade_{region}.jpg", 0).astype(np.float32) / 255
dp = cv2.imread(f"{R}/public/assets/maps_raster/oceandepth_{region}.jpg", 0).astype(np.float32) / 255
lm = cv2.imread(f"{R}/public/assets/maps_raster/landmask_{region}.png", 0) > 127
img = np.zeros(hs.shape + (3,), np.float32)
land_c = np.array([0.45, 0.58, 0.62]); sea_deep = np.array([0.25, 0.17, 0.05]); sea_shelf = np.array([0.55, 0.45, 0.25])  # BGR
img[lm] = (land_c * hs[lm, None] * 1.2)
sea = ~lm; img[sea] = sea_deep + (sea_shelf - sea_deep) * dp[sea, None]
img = (np.clip(img, 0, 1) * 255).astype(np.uint8)
def P(lon, lat): return int(round((lon - w) * ppd)), int(round((n - lat) * ppd))
def draw(gj, col, th):
    for f in json.load(open(gj))['features']:
        g = f['geometry']
        if not g: continue
        polys = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates'] if g['type'] == 'MultiPolygon' else \
                [[g['coordinates']]] if g['type'] == 'LineString' else [[c] for c in g['coordinates']] if g['type'] == 'MultiLineString' else []
        for poly in polys:
            for ring in poly:
                pts = np.array([P(x, y) for x, y in ring], np.int32)
                cv2.polylines(img, [pts], False, col, th, cv2.LINE_AA)
th = max(1, int(img.shape[1] / 1600))
draw(f"{R}/public/maps/{coast}", (255, 255, 255), th)                 # Natural Earth coastline - white
draw(f"{R}/public/maps/colonies-1775.json", (60, 60, 255), th)          # colony borders - red
draw(f"{R}/public/maps/rivers-na-10m.json", (255, 200, 80), th)         # rivers - light blue
for name, lon, lat in [("Boston", -71.0589, 42.3601), ("New York", -74.0060, 40.7128), ("Philadelphia", -75.1652, 39.9526),
                       ("Cape Cod tip", -70.1860, 42.0632), ("Lexington", -71.2307, 42.4492), ("Concord", -71.3507, 42.4685),
                       ("Pittsburgh (Forks)", -80.0120, 40.4417), ("Jumonville Glen", -79.6417, 39.8806)]:
    x, y = P(lon, lat)
    if 0 <= x < img.shape[1] and 0 <= y < img.shape[0]:
        cv2.circle(img, (x, y), 4 * th + 3, (0, 255, 255), -1, cv2.LINE_AA)
        cv2.putText(img, name, (x + 8 * th, y - 6 * th), cv2.FONT_HERSHEY_SIMPLEX, 0.5 * th + 0.3, (0, 255, 255), max(1, th), cv2.LINE_AA)
cv2.imwrite(out, img, [cv2.IMWRITE_JPEG_QUALITY, 88]); print(out, img.shape)
