import json, math
def save(name, f0, f1, K, extra={}):
    json.dump({'f0': f0, 'f1': f1, 'keys': [[f, p] for f, p in sorted(K.items())], **extra}, open(f'/root/zack/anim/{name}.json', 'w'))
def mk():
    K = {}
    def k(f, **p): K.setdefault(f, {}).update(p)
    return K, k
# 21 (1423-1515): whip out from a tight flank view to the wide zebra, then slow drift
K, k = mk()
k(1423, cam=[-60, -10, 60], tgt=[-17, 0, 58], lens=50, focus=[-17, 0, 58])
k(1440, cam=[-380, 28, 45], tgt=[0, 12, 52], lens=50, focus=[0, 0, 55])
k(1515, cam=[-350, 22, 44], tgt=[0, 12, 54], lens=50)
save('s21', 1423, 1515, K)
# 22 (1516-1581): flies circle the zebra (ellipse around the body), slow push
K, k = mk(); N = 8
for f in range(1516, 1582, 3):
    for i in range(N):
        ph = (f - 1516) * 0.07 + i * 2 * math.pi / N; r = 1 + 0.15 * math.sin(i * 1.7)
        x, y, z = -30 - 14 * r * math.cos(ph), 62 * r * math.sin(ph), 100 + 12 * math.sin(ph * 2 + i)
        k(f, **{f'f{i}': [x, y, z, math.degrees(ph) + 90, 8], '_lin': 1})
k(1516, cam=[-300, 10, 50], tgt=[0, 0, 68], lens=50)
k(1581, cam=[-240, 0, 55], tgt=[0, 0, 70], lens=50)
save('s22', 1516, 1581, K, {'nflies': N, 'fly_len': 13.0})
# 23a horse (1582-1638) many flies landed on the flank; 23b zebra (1639-1695) only a few, others circling
LAND = [(-25, 62), (-12, 55), (0, 66), (8, 58), (18, 64), (26, 56), (-5, 50), (14, 72), (-18, 70), (30, 68)]
SX = {-30: -6, -20: -17, -10: -19, 0: -17, 10: -17, 20: -17, 30: -16, 40: -14}
def sx(y): return min(SX.items(), key=lambda kv: abs(kv[0] - y))[1] - 2.4
for name, f0, f1, nl, coat in (('s23a', 1582, 1638, 10, 'horse'), ('s23b', 1639, 1695, 2, 'zebra')):
    K, k = mk()
    for i in range(10):
        if i < nl:
            y, z = LAND[i]; k(f0, **{f'f{i}': [sx(y), y, z, 90, 90]})
        else:
            for f in range(f0, f1 + 1, 3):
                ph = (f - f0) * 0.08 + i * 0.9
                k(f, **{f'f{i}': [-34 - 8 * math.cos(ph), 46 * math.sin(ph), 92 + 8 * math.sin(2 * ph), math.degrees(ph), 6], '_lin': 1})
    if coat == 'horse': k(f0, cam=[-170, -30, 62], tgt=[0, 0, 60], lens=50, focus=[-17, 0, 60]); k(f1, cam=[-150, -10, 62], tgt=[0, 0, 60], lens=50); k(f1 - 6, cam=[-150, -14, 62], tgt=[0, 0, 60])
    else: k(f0, cam=[-150, 40, 66], tgt=[0, 20, 68], lens=50, focus=[-17, 0, 60]); k(f0 + 8, cam=[-160, 0, 66], tgt=[0, 0, 68]); k(f1, cam=[-140, -10, 66], tgt=[0, 0, 68], lens=50)
    save(name, f0, f1, K, {'nflies': 10, 'coat': coat, 'fly_len': 8.0})
# 24 (1696-1749): slow-mo: one fly comes in fast, does not brake, bumps the flank at 1708 ("stripes") and flies off
K, k = mk(); S = [-17.5, 10, 62]
k(1696, f0=[-50, -6, 70, 60, -10], cam=[-42, -16, 62], tgt=[-19, 8, 61], lens=50, focus=[-19, 9, 62])
k(1708, f0=[S[0] - 2.2, S[1], S[2], 80, -5], _lin=1)
k(1712, f0=[S[0] - 4, S[1] - 2, S[2] + 2, 140, 20])
k(1749, f0=[-45, -14, 78, 200, 15], cam=[-40, -14, 62], tgt=[-20, 6, 62], lens=50)
save('s24', 1696, 1749, K, {'nflies': 1, 'fly_len': 4.0})
print('ok')
