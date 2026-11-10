import json
def save(name, f0, f1, K):
    json.dump({'f0': f0, 'f1': f1, 'keys': [[f, p] for f, p in sorted(K.items())]}, open(f'/root/zack/anim/{name}.json', 'w'))
def mk():
    K = {}
    def k(f, **p): K.setdefault(f, {}).update(p)
    return K, k
# 01 (1-66) and 25 (1750-1839): mosquito drifts down and lands softly; slow push; whip right at the end
for name, f0, f1 in (('s01', 1, 66), ('s25', 1750, 1839)):
    K, k = mk(); L = f1 - f0
    k(f0, mz=2.2, mx=-0.6, pitch=8, yaw=-30, cam=[0.5, -7.2, 1.2], tgt=[0, 0, 1.8], lens=55, focus=[0, -1.2, 0.5])
    k(f0 + int(L * 0.55), mz=0.0, mx=0.0, pitch=0, yaw=-20, focus=[0, -1.2, 0.5])
    k(f1 - 8, cam=[0.4, -6.0, 0.8], tgt=[0, 0, 0.95], lens=58)
    k(f1, cam=[2.6, -5.6, 0.9], tgt=[2.4, 0, 1.0], lens=58)
    save(name, f0, f1, K)
# 06 (322-417): front close-up of the head/proboscis on the skin, slow push, then a fast dive down at the needle
K, k = mk()
k(322, mz=0.0, cam=[0.35, -4.6, 0.75], tgt=[0, -0.9, 0.42], lens=70, focus=[-0.1, -0.78, 0.4], fstop=9)
k(400, cam=[0.2, -3.3, 0.55], tgt=[0, -0.9, 0.35], lens=72)
k(417, cam=[0.1, -2.2, 0.25], tgt=[0, -1.1, -0.1], lens=60)
save('s06', 322, 417, K)
print('ok')
