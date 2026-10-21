# Code-built recreation of Franklin's public-domain 1754 woodcut "Join, or Die" (8-piece snake), woodcut look.
# Rasterise: headless_shell --no-sandbox --hide-scrollbars --window-size=2600,1800 --screenshot=out/jod.png file://$PWD/out/join_or_die.html
#            then convert out/jod.png -strip PNG24:public/assets/docs/pd_join_or_die_1754.png
import math, random
random.seed(7)
W, H = 1300, 900
def C(t):  # snake centre line, tail (t=0, left) to neck (t=1, right)
    x = 120 + 1000 * t
    y = 455 - 120 * math.sin(2 * math.pi * (1.05 * t) + 0.35) - 40 * t
    return x, y
N = 2000
pts = [C(i / N) for i in range(N + 1)]
L = [0.0]
for i in range(1, len(pts)):
    L.append(L[-1] + math.dist(pts[i], pts[i - 1]))
tot = L[-1]
def at(s):
    j = min(range(len(L)), key=lambda k: abs(L[k] - s)); return j
def norm(j):
    a, b = pts[max(j - 1, 0)], pts[min(j + 1, N)]
    dx, dy = b[0] - a[0], b[1] - a[1]; n = math.hypot(dx, dy); return -dy / n, dx / n
def thick(s):
    u = s / tot; return 16 + 46 * min(1, u * 1.6) ** 0.8
labels = ['S.C.', 'N.C.', 'V.', 'M.', 'P.', 'N.J.', 'N.Y.', 'N.E.']
gap = 30; seg = (tot - gap * 7) / 8
svg = []
ink = '#1d1712'
for k in range(8):
    s0 = k * (seg + gap); s1 = s0 + seg
    j0, j1 = at(s0), at(s1)
    left, right = [], []
    for j in range(j0, j1 + 1, 4):
        nx, ny = norm(j); t = thick(L[j]) / 2
        left.append((pts[j][0] + nx * t, pts[j][1] + ny * t)); right.append((pts[j][0] - nx * t, pts[j][1] - ny * t))
    poly = left + right[::-1]
    d = 'M' + ' L'.join(f'{x:.1f},{y:.1f}' for x, y in poly) + ' Z'
    svg.append(f'<path d="{d}" fill="{ink}"/>')
    # scales: rows of small white crescents cut into the black, like the woodcut
    for j in range(j0 + 18, j1 - 10, 26):
        nx, ny = norm(j); t = thick(L[j]) / 2
        for r in (-0.5, 0.0, 0.5):
            cx, cy = pts[j][0] + nx * t * r, pts[j][1] + ny * t * r
            tx, ty = ny, -nx
            a = (cx - nx * t * 0.22 - tx * 5, cy - ny * t * 0.22 - ty * 5)
            b = (cx + nx * t * 0.22 - tx * 5, cy + ny * t * 0.22 - ty * 5)
            m = (cx + tx * 4, cy + ty * 4)
            svg.append(f'<path d="M{a[0]:.1f},{a[1]:.1f} Q{m[0]:.1f},{m[1]:.1f} {b[0]:.1f},{b[1]:.1f}" stroke="#efe3c6" stroke-width="2.2" fill="none" stroke-linecap="round"/>')
    # label beside the piece, below the curve
    jm = (j0 + j1) // 2; nx, ny = norm(jm)
    side = 1 if ny > 0 else -1
    off = thick(L[jm]) / 2 + 52
    lx, ly = pts[jm][0] + nx * off * side, pts[jm][1] + ny * off * side + 14
    svg.append(f'<text x="{lx:.0f}" y="{ly:.0f}" text-anchor="middle" font-family="Liberation Serif" font-style="italic" font-size="44" fill="{ink}">{labels[k]}</text>')
# head at the neck end, raised and facing right
hx, hy = pts[-1]; hx += 34; hy -= 18
svg.append(f'<path d="M{hx-50},{hy+12} C{hx-40},{hy-40} {hx+30},{hy-52} {hx+70},{hy-14} C{hx+84},{hy-2} {hx+80},{hy+14} {hx+62},{hy+20} C{hx+20},{hy+36} {hx-30},{hy+40} {hx-50},{hy+12} Z" fill="{ink}"/>')
svg.append(f'<ellipse cx="{hx+28}" cy="{hy-16}" rx="9" ry="7" fill="#efe3c6"/><circle cx="{hx+30}" cy="{hy-16}" r="4" fill="{ink}"/>')
svg.append(f'<path d="M{hx+60},{hy+8} L{hx+30},{hy+16}" stroke="#efe3c6" stroke-width="3"/>')
svg.append(f'<path d="M{hx+76},{hy+6} L{hx+112},{hy+2} M{hx+112},{hy+2} l14,-10 M{hx+112},{hy+2} l15,8" stroke="#8c2a1c" stroke-width="4" fill="none" stroke-linecap="round"/>')
for i in range(4):
    svg.append(f'<path d="M{hx-30+i*18},{hy-20+i*2} q6,10 0,20" stroke="#efe3c6" stroke-width="2" fill="none"/>')
body = '\n'.join(svg)
html = f'''<!doctype html><html><head><style>html,body{{margin:0;background:transparent}}</style></head><body>
<svg xmlns="http://www.w3.org/2000/svg" width="{W*2}" height="{H*2}" viewBox="0 0 {W} {H}">
<defs>
<filter id="rough" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="3.2"/></filter>
<filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="9"/><feColorMatrix values="0 0 0 0 0.55  0 0 0 0 0.42  0 0 0 0 0.25  0 0 0 0.22 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
<filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" seed="2"/><feColorMatrix values="0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0 0.1  0 0 0 0.10 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
</defs>
<rect width="{W}" height="{H}" fill="#efe3c6"/>
<rect width="{W}" height="{H}" fill="#000" filter="url(#paper)"/>
<rect width="{W}" height="{H}" fill="#000" filter="url(#grain)"/>
<rect x="18" y="18" width="{W-36}" height="{H-36}" fill="none" stroke="#1d1712" stroke-width="3" opacity="0.55" filter="url(#rough)"/>
<g filter="url(#rough)">{body}
<text x="{W/2}" y="{H-92}" text-anchor="middle" font-family="Liberation Serif" font-weight="bold" font-size="104" letter-spacing="4" fill="#1d1712">JOIN, <tspan font-style="italic" font-weight="normal" font-size="84">or</tspan> DIE.</text>
</g>
</svg></body></html>'''
open('out/join_or_die.html', 'w').write(html)
