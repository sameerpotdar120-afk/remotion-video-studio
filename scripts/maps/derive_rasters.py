import sys, json, math, os, numpy as np, cv2
D, OUT = sys.argv[1], sys.argv[2]
# vertical exaggeration per region (wide views need more to read as relief at 4K)
VE   = dict(world=18, atlantic=10, europe=8, india=8, eastcoast=5, appalachians=3, massachusetts=2.2)
DESP = dict(world=None, atlantic=2500, europe=1500, india=1500, eastcoast=600, appalachians=600, massachusetts=250)
CLAMP= dict(massachusetts=(-320, 700))      # Gulf of Maine edge ~ -250 m; Mt Wachusett 611 m is inside the crop
LAKES = None
index = {}
for nm in ["world","atlantic","europe","india","eastcoast","appalachians","massachusetts"]:
    m = json.load(open(f"{D}/{nm}_meta.json")); e = np.load(f"{D}/{nm}_elev.npy").astype(np.float32)
    LAKES = sys.argv[3] if nm in ("eastcoast", "appalachians", "massachusetts", "atlantic") else sys.argv[4]
    fixed = 0
    if DESP[nm]:
        med = cv2.medianBlur(e, 5); bad = np.abs(e - med) > DESP[nm]; fixed = int(bad.sum()); e[bad] = med[bad]
    if nm in CLAMP:
        lo, hi = CLAMP[nm]; bad = (e < lo) | (e > hi); fixed += int(bad.sum())
        med = cv2.medianBlur(np.clip(e, lo, hi), 5); e[bad] = med[bad]
    H, W = e.shape; ppd = m['px_per_degree']
    # --- water bodies: natural lakes sit ABOVE sea level, so burn Natural Earth lake polygons in ---
    lakes = np.zeros((H, W), np.uint8)
    for f in json.load(open(LAKES))['features']:
        g = f['geometry']; polys = [g['coordinates']] if g['type'] == 'Polygon' else g['coordinates']
        for poly in polys:
            rings = [np.array([[(x - m['west']) * ppd, (m['north'] - y) * ppd] for x, y in r], np.float32) for r in poly]
            if not any(((r[:, 0] > -50) & (r[:, 0] < W + 50) & (r[:, 1] > -50) & (r[:, 1] < H + 50)).any() for r in rings): continue
            cv2.fillPoly(lakes, [np.round(rings[0]).astype(np.int32)], 255, cv2.LINE_AA)
            for hole in rings[1:]: cv2.fillPoly(lakes, [np.round(hole).astype(np.int32)], 0, cv2.LINE_AA)
    lake = lakes > 127
    lat = m['north'] - (np.arange(H) + 0.5) / ppd
    dy = 111320.0 / ppd; dx = (111320.0 * np.cos(np.radians(lat)) / ppd)[:, None]
    # land/sea edge: 0.5 m threshold, then a median filter that removes the coarse-source staircase
    # blocks along some shores (visible at Cape Cod at z12) without moving real coastline
    raw = ((e > 0.5) & ~lake).astype(np.uint8) * 255
    k = 7 if ppd >= 1000 else 5 if ppd >= 150 else 3
    land = cv2.medianBlur(raw, k) > 127
    # drop specks: land islands and sea holes smaller than ~0.012 deg^2-equivalent at this resolution
    minpx = max(12, int((ppd * 0.012) ** 2))
    for val in (True, False):
        n_, lab, st, _ = cv2.connectedComponentsWithStats((land == val).astype(np.uint8), 8)
        small = np.isin(lab, np.nonzero(st[:, cv2.CC_STAT_AREA] < minpx)[0]) & (land == val)
        land[small] = not val
    # --- hillshade (land only), az 315 alt 40, plus a soft second light from 270 to open shadows ---
    ez = np.where(land, e, 0) * VE[nm]
    gy, gx = np.gradient(ez)
    gx = gx / dx; gy = gy / dy
    def shade(az, alt):
        a, b = math.radians(360 - az + 90), math.radians(alt)
        slope = np.arctan(np.hypot(gx, gy)); aspect = np.arctan2(gy, -gx)
        return np.sin(b) * np.cos(slope) + np.cos(b) * np.sin(slope) * np.cos(a - aspect)
    hs = np.clip(0.75 * shade(315, 40) + 0.25 * shade(270, 55), 0, 1)
    flat = math.sin(math.radians(40)) * 0.75 + math.sin(math.radians(55)) * 0.25
    hs = np.clip(hs / flat, 0, 1.25) / 1.25        # 0.8 = flat ground, brighter on lit slopes
    hs = np.where(land, hs, 0.8)                     # ocean neutral (= flat) so multiply leaves it alone
    cv2.imwrite(f"{OUT}/hillshade_{nm}.jpg", (hs * 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90])
    # --- ocean depth: 0 m -> 255 (shelf, light) ... 4000 m+ -> 0 (deep), sqrt curve so the shelf edge reads ---
    depth = np.clip(-e, 0, 4000) / 4000
    bath = np.where(land, 255, np.where(lake, 215, (1 - np.sqrt(depth)) * 255)).astype(np.uint8)   # lakes = light, shallow
    cv2.imwrite(f"{OUT}/oceandepth_{nm}.jpg", cv2.GaussianBlur(bath, (0, 0), max(1, ppd / 120)), [cv2.IMWRITE_JPEG_QUALITY, 88])
    # --- land mask ---
    cv2.imwrite(f"{OUT}/landmask_{nm}.png", (land * 255).astype(np.uint8), [cv2.IMWRITE_PNG_COMPRESSION, 9])
    # --- heightmap for 3D displacement: land 0..max -> 0..255, sqrt to keep lowlands visible; max 2048 wide ---
    hmax = float(np.percentile(e[land], 99.9)) if land.any() else 1.0
    hm = np.where(land, np.sqrt(np.clip(e, 0, hmax) / hmax), 0)
    sc = min(1.0, 2048 / W)
    hm = cv2.resize(hm, (int(W * sc), int(H * sc)), interpolation=cv2.INTER_AREA)
    cv2.imwrite(f"{OUT}/height_{nm}.png", (hm * 255).astype(np.uint8), [cv2.IMWRITE_PNG_COMPRESSION, 9])
    index[nm] = dict(west=m['west'], south=m['south'], east=m['east'], north=m['north'], width=W, height=H,
                     pxPerDegree=round(ppd, 4), heightmap=dict(file=f"height_{nm}.png", width=int(W * sc), height=int(H * sc),
                     metresAtWhite=round(hmax, 1), encoding="sqrt(elev/metresAtWhite)*255, sea=0"),
                     verticalExaggerationInHillshade=VE[nm], spikesRepaired=fixed,
                     elevRange=[round(float(e.min())), round(float(e.max()))])
    print(f"{nm:14} {W}x{H}  spikes fixed {fixed:5d}  elev {e.min():8.0f}..{e.max():6.0f} m  land {land.mean()*100:4.1f}%  lakes {lake.mean()*100:4.2f}%  heightmap white = {hmax:.0f} m", flush=True)
json.dump(index, open(f"{OUT}/regions.json", "w"), indent=1)
