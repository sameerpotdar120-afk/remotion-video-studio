import json
def save(name, f0, f1, K, extra={}):
    json.dump({'f0': f0, 'f1': f1, 'keys': [[f, p] for f, p in sorted(K.items())], **extra}, open(f'/root/zack/anim/{name}.json', 'w'))
def mk():
    K = {}
    def k(f, **p): K.setdefault(f, {}).update(p)
    return K, k
# 02 (67-141): whip in from the left; the horsefly drops nose-first and lands hard (tiny overshoot), camera settles low
K, k = mk()
k(67, z=2.4, pitch=22, yaw=-24, cam=[-2.6, -7.0, 1.6], tgt=[-2.4, 0, 2.2], lens=55)
k(76, cam=[-0.2, -7.6, 0.9], tgt=[-0.45, 0, 1.9], lens=58)
k(104, z=-0.04, pitch=0, yaw=-16); k(110, z=0.0)
k(141, cam=[-0.1, -6.4, 0.6], tgt=[-0.4, 0, 1.25], lens=60)
save('s02', 67, 141, K)
# 03 (142-177): push into the head-on face; mouthparts pulse orange (150)
K, k = mk()
k(142, z=0.0, pitch=0, yaw=-16, cam=[-0.1, -6.4, 0.6], tgt=[-0.4, 0, 1.25], lens=60, fstop=6, focus_head=[0, -0.5, -0.1])
k(177, cam=[-0.15, -3.4, 0.7], tgt=[-0.35, -0.9, 1.1], lens=60, fstop=9)
k(145, mouth=0.0); k(150, mouth=1.0); k(160, mouth=1.0); k(170, mouth=0.0)
save('s03', 142, 177, K)
# 11 (721-750): down at skin level at the mouthparts; blades press into the skin (long mouthparts)
K, k = mk()
k(721, z=-0.05, pitch=-16, yaw=14, rel_head=1, cam=[-0.3, -2.45, -0.4], tgt=[0, -0.25, -1.0], lens=42, fstop=5, focus=[0, -0.25, -1.1])
k(750, cam=[-0.12, -1.85, -0.62], tgt=[0, -0.25, -1.3], lens=36)
save('s11', 721, 750, K, {'mlen': 1.9})
# 15 (961-996): "She waits." wide low shot along the skin, fly small in the centre, slow push
K, k = mk()
k(961, z=0.0, pitch=0, yaw=-10, cam=[-0.6, -21.0, 1.0], tgt=[0, 0, 0.7], lens=55, fstop=8, focus=[0, 0, 0.3])
k(996, cam=[-0.3, -18.6, 0.9], tgt=[0, 0, 0.7], lens=55)
save('s15', 961, 996, K, {'front_fill': 1})
# 26 (1840-1907): horsefly drops in and lands hard; ends on the frame-1 framing (mosquito shot) for the loop
K, k = mk()
k(1840, z=2.4, pitch=22, yaw=-24, cam=[2.6, -5.6, 0.9], tgt=[2.4, 0, 1.0], lens=58)
k(1850, cam=[-0.1, -6.4, 0.9], tgt=[-0.45, 0, 1.4], lens=56)
k(1880, z=-0.04, pitch=0, yaw=-20); k(1886, z=0.0)
k(1907, cam=[0.0, -7.2, 1.2], tgt=[-0.4, 0, 1.8], lens=55)
save('s26', 1840, 1907, K)
print('ok')
