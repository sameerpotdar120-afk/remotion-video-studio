import json
def save(name, f0, f1, K, extra={}):
    json.dump({'f0': f0, 'f1': f1, 'keys': [[f, p] for f, p in sorted(K.items())], **extra}, open(f'/root/zack/anim/{name}.json', 'w'))
# shot 07 (418-525): mosquito needle in the cross-section; dive in from the surface, needle slides down to the vessel
K = {}
def k(f, **p): K.setdefault(f, {}).update(p)
k(418, cam=[0.2, -3.0, 1.5], tgt=[0.1, 0, -1.5], lens=24, z0=6.0)
k(432, cam=[0.2, -6.0, -2.6], tgt=[0.1, 0, -3.6], lens=26)
k(500, cam=[0.0, -5.4, -4.4], tgt=[0.1, 0, -5.2], lens=26, z0=0.0)
k(525, cam=[-0.6, -4.6, -5.0], tgt=[0.1, 0, -5.8], lens=28)
save('s07', 418, 525, K, {'mode': 'needle'})
# shots 13-14 (823-960): blades in, nerves flash on "sting" (851); vessel glows on "vein" (941) as the blades pass it
K = {}
k(823, cam=[0.2, -2.6, -6.2], tgt=[0, 0, -6.9], lens=28)
k(835, cam=[0.3, -8.0, -2.8], tgt=[0, 0, -3.4], lens=24)
k(885, cam=[0.0, -9.0, -3.6], tgt=[0, 0, -4.4], lens=24)
k(905, cam=[0.0, -9.6, -5.4], tgt=[0, 0, -6.4], lens=24)
k(960, cam=[0.4, -9.0, -6.0], tgt=[0, 0, -6.8], lens=24)
for i in range(4): k(823, **{f'z{i}': 0.0, f'g{i}': 0.0}); k(960, **{f'z{i}': 0.0})
k(823, gn=0.0, gv=0.0); k(847, gn=0.0); k(851, gn=1.0); k(866, gn=1.0); k(878, gn=0.0)
k(935, gv=0.0); k(941, gv=1.0); k(955, gv=1.0); k(960, gv=0.6)
save('s13_14', 823, 960, K)
print('ok')
