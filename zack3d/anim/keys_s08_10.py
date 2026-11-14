import json
K = {}
def k(f, **p): K.setdefault(f, {}).update(p)
# camera: whip in from the left (fast), settle wide on four blades, drift; push close for the sawing; fast push out at the end
k(526, cam=[-7.5, -7.0, -1.0], tgt=[-3.0, 0, -3.0], lens=24, _lin=0)
k(538, cam=[-0.4, -10.5, -2.2], tgt=[0, 0, -3.4], lens=24)
k(600, cam=[0.3, -9.8, -2.4], tgt=[0, 0, -3.6], lens=24)
k(664, cam=[0.2, -6.5, -3.0], tgt=[0, 0, -4.0], lens=26)
k(712, cam=[-0.6, -3.6, -4.2], tgt=[-0.7, 0, -4.8], lens=28)
k(720, cam=[-0.6, -2.4, -5.6], tgt=[-0.7, 0, -6.6], lens=28)
# glow: one blade per beat on "four blades" (561/576), then pairs on mandibles (609) and maxillae (641)
for i in range(4): k(526, **{f'g{i}': 0.0}); k(720, **{f'g{i}': 0.0})
for c, i in ((553, 2), (561, 0), (569, 1), (577, 3)):
    k(c - 3, **{f'g{i}': 0.0}); k(c, **{f'g{i}': 1.0}); k(c + 7, **{f'g{i}': 0.0})
for c, ids in ((609, (0, 1)), (641, (2, 3))):
    for i in ids: k(c - 4, **{f'g{i}': 0.0}); k(c, **{f'g{i}': 1.0}); k(c + 18, **{f'g{i}': 1.0}); k(c + 26, **{f'g{i}': 0.0})
# sawing: B0/B1 alternate up/down every 9 frames from 664
for j, f in enumerate(range(664, 721, 9)):
    up = 0.45 if j % 2 else -0.45; k(f, z0=up, z1=-up)
k(526, z0=0.0, z1=0.0, z2=0.0, z3=0.0); k(660, z0=0.0, z1=0.0)
json.dump({'f0': 526, 'f1': 720, 'keys': [[f, p] for f, p in sorted(K.items())]}, open('/root/zack/anim/s08_10.json', 'w'))
print(len(K), 'keys')
