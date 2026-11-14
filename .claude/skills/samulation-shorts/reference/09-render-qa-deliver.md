# 09: Render, QA, deliver

## 1. Before the full render (cheap checks)
1. Key frame per shot: `SOFTWARE_GL=1 node tools/capture.mjs frames review/k "<one time per shot>"` (~10-30 s each). Look at every
   one at full size. Fix, repeat. Send the creator a sheet of them (gate b).
2. Typical fixes found at this step: camera too close (object fills frame) → pull back; a prop hides a character → move it;
   a light blows out a document/door → lower emissive/point intensity and bloom; character cut at the frame edge → move inward;
   official behind a counter too short → raise him on a platform.
3. `node tools/capture.mjs check` draws every 0.25 s; on CPU it can exceed 2 minutes for a 40 s film, so run it in the background.

## 2. Full render
`bash SKILL/tools/render_parallel.sh renders/final.mp4 3` (parts = CPU cores − 1). Measured: 40 s = 1205 frames in 30 min with 3
parts on 4 cores (≈2.9 s per frame per process). Tell the creator the finish time in **IST** up front; progress prints only every
150 frames per part. Expect ±1 frame from joining parts.

## 3. QA (never skip)
`bash SKILL/tools/contact_sheet.sh renders/final.mp4 review/qa.jpg 0.5 9`: read all ~80 cells. Check:
- [ ] hero on model (spikes, chain, tube limbs) in every shot; faces readable; no one cut by the frame edge
- [ ] every reveal lands on its word; captions spelled right, on the word, never over the hero's face
- [ ] no hard cuts (`tools/cuts.py`), camera moving everywhere, dissolves ~5 frames
- [ ] nothing blown out, no camera inside geometry, props in hands
- [ ] loop: the last shot returns to shot 1's place
- [ ] audio: -14 LUFS (±1), true peak ≤ -1 dBTP, video length = audio length
List what's still weak honestly (with timestamps) when delivering.

## 4. Delivery set
`Samulation-NN-<Topic>.mp4` (1080x1920, 30 fps, CRF 17, AAC 256k) · QA sheet · thumbnail 1080x1920 · SEO kit .md · script with
sources. Send files as soon as each is ready.
