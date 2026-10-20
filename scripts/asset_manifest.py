"""Write src/lib/assets.generated.json: every file under public/assets (path relative to public/assets).

Scenes ask `hasAsset('docs/pd_join_or_die_1754.png')`; a missing file renders a labelled PENDING card instead of
a broken image, so timing can be built before the asset arrives. Re-run after adding assets.
usage: python3 scripts/asset_manifest.py
"""
import json, os
root = "public/assets"
files = sorted(os.path.relpath(os.path.join(d, f), root).replace(os.sep, "/")
               for d, _, fs in os.walk(root) for f in fs if not f.startswith(".") and not f.endswith((".md", ".txt")))
json.dump(files, open("src/lib/assets.generated.json", "w"), indent=0)
print(len(files), "assets in manifest")
