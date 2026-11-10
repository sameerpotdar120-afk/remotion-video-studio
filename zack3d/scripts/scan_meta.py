import json, gzip, re, sys, os, urllib.request, concurrent.futures as cf
pat = re.compile(sys.argv[1], re.I); out = []
def one(i):
    fn = f'{i:03d}-{i:03d}.json.gz' if False else None
    url = f'https://huggingface.co/datasets/allenai/objaverse/resolve/main/metadata/000-{i:03d}.json.gz'
    p = f'000-{i:03d}.json.gz'
    if not os.path.exists(p):
        urllib.request.urlretrieve(url, p)
    d = json.load(gzip.open(p)); res = []
    for u, a in d.items():
        if a.get('license') in ('by', 'cc0') and (pat.search(a.get('name', '')) or any(pat.search(t.get('name', '')) for t in a.get('tags', []))):
            res.append((a.get('likeCount', 0), a.get('faceCount'), u, f'000-{i:03d}', a['name'][:50], a['license'], a['user']['username'], a.get('viewCount', 0)))
    return res
with cf.ThreadPoolExecutor(12) as ex:
    for r in ex.map(one, range(160)): out += r
out.sort(reverse=True)
json.dump(out, open(sys.argv[2], 'w'))
print(len(out))
