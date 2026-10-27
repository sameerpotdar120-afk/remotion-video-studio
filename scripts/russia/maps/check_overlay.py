"""Draw territory outlines/fills on a baked view with the same projection the code uses (alignment check)."""
import json, sys, math, numpy as np, cv2
sys.path.insert(0, 'scripts/russia/maps')
view, out, ids = sys.argv[1], sys.argv[2], sys.argv[3].split(',')
V = json.load(open('src/russia/maps/views.json'))[view]
img = cv2.imread('public/' + V['sat'])
p0, p1 = [math.radians(x) for x in V['parallels']]
tany = lambda y: math.tan((math.pi / 2 + y) / 2)
n = math.log(math.cos(p0) / math.cos(p1)) / math.log(tany(p1) / tany(p0)); f = math.cos(p0) * tany(p0) ** n / n
k, (tx, ty) = V['scale'], V['translate']
def proj(lon, lat):
    lam = math.radians(((lon - V['lon0'] + 180) % 360) - 180); phi = math.radians(lat)
    r = f / tany(phi) ** n
    return tx + k * r * math.sin(n * lam), ty - k * (f - r * math.cos(n * lam))
T = {ft['id']: ft for ft in json.load(open('src/russia/maps/territories.json'))['features']}
cols = [(60, 60, 220), (40, 200, 240), (200, 120, 40), (60, 180, 60), (200, 60, 200), (240, 240, 240)]
ov = img.copy()
for i, id_ in enumerate(ids):
    g = T[id_]['geometry']; polys = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
    for poly in polys:
        pts = np.array([proj(x, y) for x, y in poly[0]], np.int32)
        cv2.fillPoly(ov, [pts], cols[i % len(cols)])
        cv2.polylines(img, [pts], True, (255, 255, 255), max(2, img.shape[1] // 1500), cv2.LINE_AA)
img = cv2.addWeighted(ov, 0.45, img, 0.55, 0)
cv2.imwrite(out, cv2.resize(img, (1536, int(1536 * img.shape[0] / img.shape[1])), interpolation=cv2.INTER_AREA))
