import json
def save(name, f0, f1, K, extra={}):
    json.dump({'f0': f0, 'f1': f1, 'keys': [[f, p] for f, p in sorted(K.items())], **extra}, open(f'/root/zack/anim/{name}.json', 'w'))
def mk():
    K = {}
    def k(f, **p): K.setdefault(f, {}).update(p)
    return K, k
# 04a male (178-193): eyes meet; whip right at the end.  04b female (194-231): whip in, gap glows on "females"
K, k = mk()
k(178, cam=[0.25, -3.2, -0.3], tgt=[0, 0, -0.25], lens=50); k(187, cam=[0.2, -3.0, -0.32], tgt=[0, 0, -0.25])
k(193, cam=[1.6, -2.8, -0.3], tgt=[1.4, 0, -0.25])
save('s04a', 178, 193, K, {'who': 'male'})
K, k = mk()
k(194, cam=[-1.4, -2.8, -0.3], tgt=[-1.3, 0, -0.25], lens=50, g=0.0)
k(201, cam=[0.15, -3.0, -0.32], tgt=[0, 0, -0.25], g=0.7)
k(231, cam=[0.1, -2.6, -0.3], tgt=[0, 0, -0.22], g=0.7)
save('s04b', 194, 231, K, {'who': 'female'})
# 05 (232-321): x-ray of the abdomen; eggs appear as the blood streams in, glow on "eggs" (296)
K, k = mk()
k(232, cam=[3.4, 1.0, 2.4], tgt=[0, 0.8, 0.9], lens=55, eggs=0.0, ge=0.0)
k(250, eggs=0.0); k(300, eggs=1.0); k(292, ge=0.0); k(296, ge=1.0); k(312, ge=1.0); k(321, ge=0.4)
k(321, cam=[2.8, 1.6, 2.0], tgt=[0, 0.8, 0.9], lens=55)
save('s05', 232, 321, K)
# 19 (1282-1353): "In one meal..." the abdomen swells and turns red
K, k = mk()
k(1282, cam=[3.4, 0.6, 1.8], tgt=[0, 0.8, 0.9], lens=55, eggs=0.0, red=0.0, sw=1.0)
k(1300, red=0.0, sw=1.0); k(1345, red=0.85, sw=1.15)
k(1353, cam=[3.1, 1.0, 1.7], tgt=[0, 0.8, 0.95], lens=55)
save('s19', 1282, 1353, K)
# 20 (1354-1422): balance settles level; the drop glints on "weight" (1391)
K, k = mk()
k(1354, cam=[0, -19.5, 7.4], tgt=[0, 0, 5.4], lens=40, tilt=9.0, gd=0.0)
k(1378, tilt=-1.5); k(1388, tilt=0.4); k(1396, tilt=0.0)
k(1387, gd=0.0); k(1391, gd=1.0); k(1402, gd=1.0); k(1412, gd=0.0)
k(1422, cam=[0, -18.0, 7.1], tgt=[0, 0, 5.3], lens=40)
save('s20', 1354, 1422, K)
print('ok')
