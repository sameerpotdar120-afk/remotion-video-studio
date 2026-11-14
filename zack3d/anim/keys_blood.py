import json
def save(name, f0, f1, K):
    json.dump({'f0': f0, 'f1': f1, 'keys': [[f, p] for f, p in sorted(K.items())]}, open(f'/root/zack/anim/{name}.json', 'w'))
# 12 (751-822, bead mode, no bead): low skim along the fresh cut, then dive into it
K = {}
def k(f, **p): K.setdefault(f, {}).update(p)
k(751, cam=[-2.0, -2.6, 2.0], tgt=[0.6, 0.1, 0.0], lens=40, grow=0.0)
k(790, cam=[-0.3, -2.0, 2.0], tgt=[0.2, 0.05, 0.0], lens=42)
k(822, cam=[0.0, -0.25, 0.35], tgt=[0.0, 0.0, -0.4], lens=30)
save('s12', 751, 822, K)
# 16 (997-1104, bead): slow push while the bead swells
K = {}
k(997, cam=[0.4, -2.8, 2.6], tgt=[0, 0, 0], lens=42, grow=0.0)
k(1010, grow=0.05); k(1080, grow=1.0)
k(1104, cam=[0.1, -2.2, 2.1], tgt=[0, 0, 0.05], lens=42)
save('s16', 997, 1104, K)
# 17 (1105-1167, saliva): saliva fills the cut on "saliva" (1112)
K = {}
k(1105, cam=[-0.5, -2.6, 2.4], tgt=[0, 0, 0], lens=42, grow=0.0)
k(1108, grow=0.0); k(1140, grow=1.0)
k(1167, cam=[0.2, -2.3, 2.2], tgt=[0.2, 0, 0], lens=42)
save('s17', 1105, 1167, K)
# 18 (1168-1281, pad): pad comes down on "spongy" (1194), blood climbs it
K = {}
k(1168, cam=[0.3, -5.2, 2.6], tgt=[0, 0, 0.5], lens=34, padz=2.5, soak=0.0)
k(1194, padz=0.0)
k(1200, soak=0.0); k(1270, soak=0.62)
k(1281, cam=[0.3, -4.4, 2.3], tgt=[0, 0, 0.3], lens=34)
save('s18', 1168, 1281, K)
print('ok')
