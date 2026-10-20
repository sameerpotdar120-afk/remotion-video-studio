"""Build plate-carree terrain rasters from AWS Terrain Tiles (terrarium, Web Mercator)."""
import sys, os, math, json, numpy as np, cv2, urllib.request, concurrent.futures as cf
CACHE=sys.argv[1]; OUT=sys.argv[2]; which=sys.argv[3:] 
URL="https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png"
# name: (west, south, east, north, zoom, px_per_degree)
REGIONS={
 "world":     (-180,-60, 180, 75, 4,  10.667),   # 3840 px wide
 "atlantic":  ( -82, 25,    5, 62, 7,  60),
 "eastcoast": ( -86, 28,  -64, 48, 8, 180),
 "appalachians":(-86,33,  -72, 45, 9, 240),
 "massachusetts":(-72,41.8,-69.8,43.0,12,1745.5),  # 3840 px wide
 "na3d":      (-110, 15,  -40, 62, 7,  80),      # everything the 3D colonies camera can see
 "europe":    ( -12, 34,   32, 62, 6,  60),
 "india":     (  66,  6,   98, 36, 6,  60),
}
def mx(lon,z): return (lon+180)/360*256*2**z
def my(lat,z):
    r=math.radians(lat); return (1-math.log(math.tan(r)+1/math.cos(r))/math.pi)/2*256*2**z
def fetch(z,x,y):
    p=f"{CACHE}/{z}_{x}_{y}.png"
    if os.path.exists(p) and os.path.getsize(p)>100: return p
    for a in range(4):
        try:
            with urllib.request.urlopen(URL.format(z=z,x=x,y=y),timeout=40) as r: d=r.read()
            open(p,"wb").write(d); return p
        except Exception as e:
            err=e
    raise RuntimeError(f"tile {z}/{x}/{y}: {err}")
def build(name):
    w,s,e,n,z,ppd=REGIONS[name]
    x0,x1=int(mx(w,z)//256),int(mx(e,z)//256); y0,y1=int(my(n,z)//256),int(my(s,z)//256)
    N=2**z; tiles=[(x%N,y) for x in range(x0,x1+1) for y in range(y0,y1+1)]
    print(f"[{name}] z{z} tiles {x1-x0+1}x{y1-y0+1}={len(tiles)}",flush=True)
    with cf.ThreadPoolExecutor(16) as ex: list(ex.map(lambda t: fetch(z,*t),tiles))
    H,W=(y1-y0+1)*256,(x1-x0+1)*256
    merc=np.zeros((H,W),np.float32)
    for x in range(x0,x1+1):
        for y in range(y0,y1+1):
            a=cv2.imread(f"{CACHE}/{z}_{x%N}_{y}.png",cv2.IMREAD_COLOR)[:,:,::-1].astype(np.float32)
            merc[(y-y0)*256:(y-y0+1)*256,(x-x0)*256:(x-x0+1)*256]=a[:,:,0]*256+a[:,:,1]+a[:,:,2]/256-32768
    OW,OH=int(round((e-w)*ppd)),int(round((n-s)*ppd))
    lons=w+(np.arange(OW)+0.5)/ppd; lats=n-(np.arange(OH)+0.5)/ppd
    mapx=np.tile((mx(lons,z)-x0*256).astype(np.float32),(OH,1))
    mapy=np.tile(np.array([my(la,z)-y0*256 for la in lats],np.float32)[:,None],(1,OW))
    el=cv2.remap(merc,mapx,mapy,cv2.INTER_LINEAR,borderMode=cv2.BORDER_REPLICATE)
    np.save(f"{CACHE}/{name}_elev.npy",el)
    meta=dict(name=name,west=w,south=s,east=e,north=n,width=OW,height=OH,px_per_degree=ppd,zoom=z,
              elev_min=float(el.min()),elev_max=float(el.max()))
    json.dump(meta,open(f"{CACHE}/{name}_meta.json","w"),indent=1)
    print(f"[{name}] {OW}x{OH}  elev {el.min():.0f}..{el.max():.0f} m",flush=True)
for nm in which: build(nm)
