"""Builds docs/REMOTION_ANIMATION_CODE.md = header + every source file verbatim (so docs never drift from code)."""
from pathlib import Path
root = Path(__file__).resolve().parent.parent
files = [
    'remotion.config.ts', 'tsconfig.json', 'src/index.ts', 'src/Root.tsx',
    'src/lib/constants.ts', 'src/lib/easing.ts', 'src/lib/fonts.ts',
    'src/lib/map/geo.ts', 'src/lib/map/data.ts', 'src/lib/map/MapStage.tsx', 'src/lib/map/layers.tsx',
    'src/lib/fx/motion.tsx', 'src/lib/fx/transitions.tsx', 'src/lib/fx/text.tsx', 'src/lib/fx/particles.tsx', 'src/lib/fx/flags.tsx',
    'src/lib/character/Face.tsx', 'src/lib/character/Puppet.tsx', 'src/lib/character/MapCharacter.tsx', 'src/lib/character/rigs.ts',
    'src/scenes/Demos.tsx', 'scripts/build_colonies.mjs',
]
out = [(root / 'docs/_code_doc_header.md').read_text()]
for i, f in enumerate(files, 1):
    lang = 'tsx' if f.endswith('.tsx') else 'ts' if f.endswith('.ts') else 'js' if f.endswith('.mjs') else 'json'
    out.append(f'\n### 7.{i} `{f}`\n\n```{lang}\n{(root / f).read_text().rstrip()}\n```\n')
(root / 'docs/REMOTION_ANIMATION_CODE.md').write_text(''.join(out))
print('ok', len(files), 'files')
