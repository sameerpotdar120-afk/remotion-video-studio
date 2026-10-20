"""Bake per-look colour textures for a map region from the terrain layers (see SOURCES.md).

Colours are the reference's measured on-screen colours (analysis/reference-microframe.md + docs/PROMPTS_REMOTION_MISSING.md R4.2).
They are calibrated afterwards against renders, because 3D lighting shifts them.
usage: python3 scripts/maps/bake_looks.py <region> [looks...]
"""
import sys, json, numpy as np, cv2

D = "public/assets/maps_raster"
region = sys.argv[1]
looks = sys.argv[2:] or ["parchment", "flat", "relief"]

def hexc(h):  # '#RRGGBB' -> float BGR 0..1
    h = h.lstrip('#'); return np.array([int(h[4:6], 16), int(h[2:4], 16), int(h[0:2], 16)], np.float32) / 255

hs = cv2.imread(f"{D}/hillshade_{region}.jpg", 0).astype(np.float32) / 255 / 0.8   # 1.0 = flat ground
dp = cv2.imread(f"{D}/oceandepth_{region}.jpg", 0).astype(np.float32) / 255      # 1 = coast/shelf, 0 = deep
lm = cv2.imread(f"{D}/landmask_{region}.png", 0) > 127
H, W = lm.shape

# paper: the GPT parchment texture (luminance only, mean 1) + fine grain tile, tiled to the region size
paper = cv2.imread("public/assets/textures/parchment_paper_4k.jpg", 0).astype(np.float32)
paper = cv2.resize(paper, (W, H), interpolation=cv2.INTER_CUBIC); paper /= paper.mean()
grain = cv2.imread("public/assets/textures/paper_grain_tile.jpg", 0).astype(np.float32)
grain = np.tile(grain, (H // grain.shape[0] + 1, W // grain.shape[1] + 1))[:H, :W]; grain /= grain.mean()

# ink edge: a thin darker line just inside the coast, like a hand-tinted map
edge_px = max(1, round(W / 2800))
er = cv2.erode(lm.astype(np.uint8), np.ones((2 * edge_px + 1, 2 * edge_px + 1), np.uint8)) > 0
coast = (lm & ~er).astype(np.float32)
coast = cv2.GaussianBlur(coast, (0, 0), edge_px * 0.8)

def relief(base, k):  # multiply-style relief, k = strength
    return base * (1 + k * (hs - 1))[..., None]

def save(name, img):
    out = f"{D}/look_{name}_{region}.jpg"
    cv2.imwrite(out, (np.clip(img, 0, 1) * 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 90])
    print("wrote", out, img.shape[1], "x", img.shape[0])

for look in looks:
    img = np.zeros((H, W, 3), np.float32)
    if look in ("parchment", "relief"):
        land, sea = hexc('#A19573'), hexc('#5E8488')
        L = np.broadcast_to(land, (H, W, 3)).copy()
        L = relief(L, 0.28 if look == "parchment" else 0.85)
        if look == "relief":                                     # warm sepia hillshade, not grey
            L = L * (1 - 0.10) + hexc('#6B5A3A') * 0.10 * (1 - np.clip(hs, 0, 1))[..., None]
        S = np.broadcast_to(sea, (H, W, 3)) * (1.06 + 0.10 * dp)[..., None]   # shelf slightly lighter (calibrated: +12% vs first render)
        img = np.where(lm[..., None], L, S)
        img = img * (1 - 0.30 * coast)[..., None]                 # ink edge
        img = img * (0.55 + 0.45 * paper)[..., None]              # paper fibres / foxing (everything is printed)
        img = img * (0.85 + 0.15 * grain)[..., None]
    elif look == "flat":
        land, sea = hexc('#2A79BA'), hexc('#122834')
        L = relief(np.broadcast_to(land, (H, W, 3)).copy(), 0.15)
        img = np.where(lm[..., None], L, np.broadcast_to(sea, (H, W, 3)))
        img = img * (1 - 0.25 * coast)[..., None]
    save(look, img)
json.dump({"region": region, "looks": looks}, open(f"{D}/looks_{region}.json", "w"))
