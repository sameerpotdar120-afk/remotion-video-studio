# Reference Breakdown — "How Did America Become Independent" (Animated History)

Source file: 1280×720, 30 fps, 2:48.8, 5,062 frames, AAC stereo 44.1 kHz.
Method: every hard cut detected (ffmpeg scene score), full frame sheets at 2 fps (337 frames),
full 30 fps micro-sheets on key actions, frame-difference motion analysis on all 5,062 frames,
full VO transcription (Whisper small.en), loudness (EBU R128), spectral-flux SFX hit detection.
Transcript: `reference-transcript.txt`.

---

## 1. Format at a glance

| Item | Value |
|---|---|
| Runtime | 2:48 (short "long-form" explainer) |
| Topic arc | 1756 → July 4, 1776 (20 years in under 3 minutes) |
| VO words | ~486 words, **~173 wpm** (fast, no dead air) |
| Hard cuts | only **15** in 168 s; everything else is continuous camera moves on maps |
| Visual change | something new on screen roughly **every 1.5–3 s** |
| Animation | on 1s (every frame moves); 29% of frames are holds, concentrated in "talking" beats |
| Loudness | **-14.1 LUFS integrated**, LRA 2.6 LU (heavily compressed, YouTube-normalised); peaks clip above 0 dBFS |
| Silence | **zero** gaps >0.35 s below -28 dB — wall-to-wall audio |

---

## 2. Visual style bible

### 2.1 Three map "looks" — rotated to reset attention
1. **Satellite map** (Blue-Marble style terrain, deep blue ocean). Used for "present-tense / factual" beats: hook open, Sugar Act items, Congresses, Lexington pin.
   - The 13 colonies are a flat **light-to-mid blue fill (#5b9be0-ish)** with thin white state borders and small white serif state labels.
2. **Antique parchment map** (tan land, desaturated teal sea, paper grain + vignette). Used for "story / character" beats: Britain-as-character, Seven Years' War, Second Congress, July 1776, ending.
   - Colonies here are **slate/steel blue**; Britain is **bright red (#d62935-ish)**.
3. **Flat political map** (solid blue land, dark navy sea, no texture) — used once for the Boston punishment close-up (1:44–1:51), plus a **topographic relief parchment** for the Lexington/Concord battle map (2:07–2:10).

Rule observed: style switches always land on a **narrative turn** (new act / new tax / new place).

### 2.2 Live-action-looking scene plates (AI-generated photoreal backgrounds)
Photoreal 18th-century environments with **2D chibi cut-out characters composited on top** (no matching lighting — the contrast is the style):
- Print shop / store / courtroom / tavern (Stamp Act list, 0:51–0:59)
- Snowy Boston street with Old State House (Boston Massacre, 1:10–1:23)
- Boston wharf + 3-mast ship with Union Jack (Tea Party, 1:34–1:44)
- Misty dawn Lexington green with church (1:58–2:06)
- Brick plantation porch / Monticello lawn (2:38–2:43)
Plates get slow push-ins, shallow depth-of-field blur when a prop is in front, and zoom-blur entries.

### 2.3 Characters
**A. Map-shape characters (the main comedic device)**
- **Great Britain** = the red island shape itself with **cartoon googly eyes + eyebrows + mouth**, one **rubber-hose (noodle) arm with a white cartoon glove**. Expressions: smug grin, side-eye, nervous, furious (gritted teeth, V brows), shocked "o" mouth.
- **The 13 colonies** = each colony gets its own small pair of eyes/brows; they bicker (0:08), look toward Boston (1:26), hold **pitchforks & glowing torches** as a mob (0:44).
- Movement: translate across the ocean + squash/bob, eye darts, blinks, brow tilts, lip-flap synced to quoted lines.

**B. Chibi humans ("bean" people)**
- Big round head, two dot eyes, tiny line mouth, no visible arms most of the time (arms drawn as thin black lines when gesturing), body is a rounded bell shape with **detailed period costume** (tricorn hats, waistcoats, buttons, cravats).
- Archetypes: colonist (brown coat), redcoat (red coat, cream waistcoat, black tricorn with white trim, flintlock musket), judge (white wig), Washington (white wig, blue/buff coat), Jefferson (powdered hair + quill), Martha + children, enslaved workers, militia.
- Thick dark outline, soft cel-shade, warm skin tone — looks like a vector/rig puppet (likely After Effects + Duik/RubberHose, or Moho).

### 2.4 Character animation (from 30 fps micro-frames)
- **Puppet/rig animation on 1s**: rigid parts rotate on pivots (musket raises rotate around the shoulder), no frame-by-frame redraw.
- **Staggered offsets**: in the firing line (1:19–1:21) each soldier raises his musket 2–4 frames after the previous one — gives a natural "volley" feel.
- **Overshoot/ease**: props snap in with scale overshoot (~110% → 100% over 4–6 frames).
- **Motion blur** on fast actions (table flip 0:58.6, print flying in 1:23, crate throws).
- **Physics gag props**: playing cards scatter as particles, tea crates arc into water, torn paper halves fly.
- **Mouth**: 2–3 mouth shapes (closed line / open oval / grin) — simple lip-flap on quoted dialogue only.
- **Secondary motion**: constant slight camera drift so even "still" shots never freeze.

### 2.5 Props & icons library (all used as pop-in stickers)
- Aged parchment documents with title + year + fake signature: "Sugar Act 1764", "Stamp Act 1765", "Truce, mb?" scroll, tax list (Glass / Lead / Paint / Paper / Tea with engraved icons).
- **Red rubber stamps**: "DEBT", "TAXED", "CLOSED", "LIMITED" — slam in with shake + SFX.
- 3D-rendered props: golden crown, wooden gavel/stamp block, eraser (rubs the flag off the colonies), red "MAKE AMERICA GREAT" cap (meme gag).
- Taxed goods icons (wine barrel/molasses, sugar sack, coffee beans, red fabric), each with a mini TAXED stamp.
- **Neon-glow circle icons**: red ring with Parliament/Big Ben + ✕ (no representation), green ring with handshake + ✓.
- Map pins: red teardrop pin + ripple ring, label "City" (white serif) + date line (small).
- White block arrows pointing at regions; hand-drawn curved arrows pointing to labels.
- Flag cloth simulation (Union Jack / US flag) wrapped onto the colony shapes — used as **bookend** (0:03 and 2:26).
- Real historical artefacts: Paul Revere's Boston Massacre engraving (flies in spinning), the actual Declaration manuscript (macro close-up with yellow highlighter wipes).
- Fireworks particles + flying eagle shadow (opening only).

### 2.6 Typography
- Titles & place labels: **high-contrast serif** (Times / Playfair-style), white with soft drop shadow on maps, black on sky plates.
- Dates under titles in **yellow** serif, smaller: "(1756-1763)", "(SEP 5, 1774)", "(MAY 10, 1775)".
- Timeline ticker: horizontal ruler with three dates, active one **yellow**, others white; it scrolls/rotates in 3D (camera flies along it at 2:23–2:26).
- Quote cards type on word by word: "The shot heard round the world." + small attribution line.
- Thumbnail: heavy condensed sans (Impact/Anton-like), white + yellow, black stroke.

### 2.7 Camera & transitions
- Default move: **slow continuous push-in or pan** on the map (Ken-Burns on vectors).
- **Zoom punch** (instant 2–3× scale) to read a document (0:38.5, 0:50).
- **Whip-pan / zoom-blur** transitions between map and scene plates (0:59.5, 1:10.5, 1:34.5, 2:30.5, 2:38.5).
- **Iris/black blob wipe** (1:08) into the Boston pin.
- **White flash/wipe** for the style switch satellite → parchment (0:06.5).
- **Hard black frames ~0.7 s** right after "the war begins" (2:06.5) — the only true pause.
- Rack-focus across the Declaration text (2:31–2:38).
- Wide reveal pull-back for the twist (2:41: porch → plantation with enslaved people).

### 2.8 Colour logic
- Britain/British side = **red**, colonies = **blue**, France (Seven Years' War) = blue vs Britain red, Spain = orange, Continental Congress members = **orange** fill (Georgia left blue = absent).
- Accent yellow = "important" (active date, highlighter, dates).
- Green circle/check = approval, red circle/✕ = denial.

---

## 3. Timeline — shot by shot

| Time | VO (summary) | Visual |
|---|---|---|
| 0:00–0:02 | "Why did these 13 British colonies unite…" | Satellite N. America, push-in; colonies fill blue state-by-state, glowing white outline pulse |
| 0:03–0:06 | "…and become independent 250 years ago?" | Flag cloth wraps the colonies, fireworks, eagle shadow; timeline 1775-**1776**-1777 then **rewinds to 1756** |
| 0:06.5–0:10 | "they weren't planning to become one country… argued" | White wipe → parchment; eraser rubs flag off; every colony gets angry eyes, bickering |
| 0:10.5–0:12 | "loyal to the British crown" | Britain red with 3D golden crown bobbing |
| 0:12.5–0:15 | "Seven Years' War begins" | World map red vs blue, title "Seven Years' War (1756-1763)" |
| 0:15.5–0:19 | "Britain defeats France and gains huge territories" | French N. America (grey) floods red; pan to Britain |
| 0:19.5–0:21 | "deeply in debt" | Gavel/stamp slam → red **DEBT** stamp on Britain |
| 0:21–0:29 | "Britain turns to the colonies: We protected you…" | Britain grows a face, slides across Atlantic, glove-points at colonies, talking |
| 0:29.5–0:33 | Sarcasm: "not to take half a continent" | White arrow → zoom out reveals giant red British America |
| 0:34–0:39 | "Let's tax the colonies even more! Sugar Act" | Britain eyes dart (scheming), pulls out "Sugar Act 1764", zoom punch |
| 0:39.4–0:44 | "molasses, sugar, coffee, fabrics" | Cut to satellite; taxed goods icons pop onto colonies with TAXED stamps |
| 0:44–0:49 | "The colonies don't like this. Relax, it's just a joke" | Darken; colony mob with pitchforks & torches; Britain tears Sugar Act in half |
| 0:49.5–0:51 | "But you know what's not a joke? The Stamp Act" | Shocked Britain → zoom punch "Stamp Act 1765" |
| 0:51.7–0:59 | "newspapers, contracts, licenses, court docs, playing cards" | Rapid 1–1.5 s cuts: print shop, store, courtroom, tavern; TAXED stamp each; colonist flips card table |
| 0:59.5–1:03 | "colonies hold a joint Congress" | Whip to satellite; chibi delegates converge; pin "New York, October 7, 1765" |
| 1:03.5–1:07 | "no representatives… forced to pay taxes" | Neon red ✕ Parliament icon, green ✓ icon; colonies glare |
| 1:08–1:10 | "In 1770, something happens in Boston" | Iris wipe → pin "Boston, March 5, 1770" |
| 1:10.5–1:22.5 | "Hey Brits, go back home!… Boston Massacre, five die" | Zoom-blur into snowy Boston; protest signs; snowball hits redcoat; staggered volley, smoke; bodies fallen |
| 1:23–1:25 | "rumors spread" | Paul Revere engraving spins in |
| 1:25–1:29 | "across the colonies" | Satellite; every colony grows big eyes looking at Boston |
| 1:29.5–1:34 | "cancels almost all taxes… keeps tea" | Parchment tax list; items struck through one by one; Tea circled green |
| 1:34.5–1:44 | "dress up as Native Americans… 300+ chests of tea" | Wharf; feather headbands drop on chibis; ship wide; crates thrown; over-shoulder crowd + "Boston Tea Party Dec 16, 1773" |
| 1:44.5–1:51 | "closes the Port, limits self-government, troops" | Flat map; furious Britain slides in; CLOSED / LIMITED stamps; redcoat squad icon |
| 1:51–1:56 | "First Continental Congress… independence forms" | Colonies orange, title + date; MAGA-style red cap drops on (meme gag) |
| 1:56.5–2:06 | "Lexington… first shot… shot heard around the world" | Pin Lexington; misty green; two lines face off, one shot, a redcoat drops; quote types on |
| 2:06.5–2:07 | "The war begins." | **Black frames** |
| 2:07.5–2:11 | "Lexington and Concord" | Relief map with battle sprites + smoke, labels with dates |
| 2:11.5–2:17.5 | "Second Continental Congress, Continental Army, Washington" | Title + army chibis multiply across colonies; Washington labelled; holds "Truce, mb?" scroll |
| 2:18–2:21 | "send the king a letter, rejected" | Furious Britain tears the scroll in two |
| 2:21.5–2:25 | "July 2, 1776 vote to break away" | Timeline Jul 1-**Jul 2**-Jul 3; raised fists with ballots from every colony |
| 2:25.5–2:30 | "July 4, Declaration, Thomas Jefferson" | Timeline flies to **Jul 4**; flag wraps colonies again (bookend); Declaration drops in, Jefferson peeks |
| 2:30.5–2:38 | "all men created equal… life, liberty, happiness" | Macro on manuscript, yellow highlighter wipes key phrases |
| 2:38.5–2:43 | "waiting at home: wife, children, 100+ slaves" | Porch with Martha & kids → pull-back reveals enslaved people (irony twist) |
| 2:43–2:48 | "war becomes a war for independence. Different story." | Parchment map, mini flags pop on battle sites, title "American Revolutionary War"; hard end |

---

## 4. Audio

> Note: these are measurements, not listening. Timbre descriptions are inferred from spectrum/levels.

### 4.1 Voice-over
- Single male narrator, **American English**, conversational and dry/ironic; ~173 wpm, almost no breaths left in (tight edit).
- **Character voices**: the narrator performs Britain's lines ("We protected you, so you owe us", "Whoa, whoa, relax. It's just a joke") and protestors ("Hey Brits! Go back home!") with a different tone.
- Sarcastic asides break the fourth wall: "Of course, Britain *totally* fought that war just to protect the colonists…"
- VO sits ~**20–25 dB above the music bed** (VO ~-11 dB RMS, bed ~-31 to -38 dB in pauses).

### 4.2 Background music
- Continuous underscore, **no strong drum beat** (rhythmic periodicity very weak) → light orchestral / pizzicato / ambient "documentary-comedy" bed rather than a beat track.
- **Drops out almost completely at ~2:00–2:10** (floor falls to -48 dB) around the shot / "The war begins" / black frames → silence used as an impact.
- Swells back for the Second Congress and fades lower in the final ~8 s (floor -44 dB) under the outro line.

### 4.3 SFX (strong transient hits detected, aligned to visuals)
| Time | Likely SFX |
|---|---|
| 5.9 | rewind/whoosh (timeline scrubs back) |
| 13.8, 16.7 | map whoosh / territory fill |
| 19.4 | **stamp slam** ("DEBT") |
| 21.8, 28.2, 30.4 | pops / slide whoosh (Britain moves, arrow) |
| 33.4–36.1 | cartoon pops, eye-dart blips |
| 40.7, 41.4 | sticker pops (taxed goods) |
| 44.1, 46.4 | crowd/mob rumble, torch |
| 47.7 | **paper tear** |
| 50.1 | zoom punch whoosh |
| 53.5, 54.4, 55.2, 56.0, 57.1 | **TAXED stamp hits** (one per location) |
| 58.7 | **table flip crash + cards** |
| 68.4, 68.8 | neon icon pops |
| 71.9–78.0 (dense) | crowd shouting, snowball impact, Boston ambience |
| 79.9, 80.8 | **musket volley** |
| 89.6, 92.1 | paper slide / marker strikes |
| 98.3 | headband pop |
| 104.8, 106.3 | crates splashing |
| 116.5, 117.4 | stamp hits (CLOSED/LIMITED region) |
| 122.1, 123.1 | **single gunshot** (Lexington) |
| 128.0 | war-begins impact / music re-entry |
| 136.2 | scroll / Washington pop |
| 163.4, 166.6 | flag pops on final map |

Pattern: **every visual pop-in or stamp gets its own SFX**; impacts land exactly on the noun in the VO.

---

## 5. Script structure & retention tricks

1. **Hook (0:00–0:06)**: question + payoff image first ("Why did these 13 colonies unite and become independent 250 years ago?") — shows the end state (flag + fireworks + 1776), then **rewinds** to 1756. Anniversary peg: "250 years ago" (2026).
2. **Counter-intuitive premise (0:06–0:10)**: "they weren't planning to become one country at all" — sets up the mystery.
3. **Cause → effect chain**, each link 10–20 s: War → Debt → Taxes → Anger → Concession → Defiance → Punishment → Congress → Shot → War → Declaration.
4. **Comedy beat every ~15–20 s**: sarcasm, "just a joke", table flip, snowball, feather headbands, MAGA cap, "Truce, mb?".
5. **Escalation ladder**: Sugar Act (small) → Stamp Act (everything) → Massacre (deaths) → Tea Party → Intolerable Acts → shots fired.
6. **Specific facts as anchors**: dates on every pin/title, "five people die", "more than 300 chests of tea", "more than a hundred slaves".
7. **Pattern interrupts**: map-style switches, live-action plates, black frames, zoom punches.
8. **Bookend**: the flag-wrap from the hook returns at July 4.
9. **Twist/irony ending**: "all men are created equal" → reveal of Jefferson's slaves.
10. **Open-loop outro**: "But that's a whole different story." — teases a sequel (no explicit subscribe CTA heard).

### Weak spots we can beat
- No explicit CTA / subscribe moment, no end screen in the file.
- Hook is a plain question; no stakes or tension in the first 3 s.
- Simplifications to fix or deepen in our version (verify each before scripting):
  - The **Townshend Acts (1767)** — the glass/lead/paint/paper/tea taxes on the list at 1:29 — are never named; the video jumps from the Stamp Act to the Massacre.
  - The Sugar Act actually **cut** the molasses duty (6d → 3d) but enforced it hard — a better "gotcha" than "taxes even more".
  - The Stamp Act was **repealed in 1766** — skipped.
  - The Declaration was drafted by Jefferson but edited by a committee and Congress.
  - "His wife, his children" — in 1776 Jefferson had one surviving child (Martha, b. 1772).
  - Correct as shown: 5 deaths at the Boston Massacre, 342 chests of tea, Stamp Act Congress (9 colonies, Oct 1765), Georgia absent from the First Continental Congress, Olive Branch Petition rejected, July 2 vote / July 4 adoption.
- Audio clips (peaks > 0 dBFS).
- Very short for "long-form" (2:48) — room to go deeper per beat.

---

## 6. Production recipe to rebuild this look (Remotion-friendly)
- Maps: GeoJSON of 1770s colonies + world → SVG paths; fills/strokes animated with `interpolate`/`spring`; texture layers (satellite image / parchment PNG) under the SVG.
- Characters: SVG part rigs (body, head, eyes, brows, mouth set, arm path + glove) animated by rotation/translate keyframes; staggered `delay` per instance.
- Props/stamps: PNG/SVG stickers with spring scale-in (overshoot) + 3-frame camera shake on stamp.
- Scene plates: AI-generated stills (1920×1080) with slow scale 1.00→1.06, blur when a foreground prop is active.
- Transitions: zoom-blur (scale + directional blur), iris wipe (SVG circle mask), white flash, black hold.
- Text: serif titles with yellow date line; word-by-word type-on for quotes; timeline ruler component.
- Audio: VO -14 LUFS target, music ducked ~20 dB under VO, SFX library: stamp, pop, whoosh, paper tear, musket, crowd, splash, crash.

Note: this repo is currently set to 1080×1920 vertical @ 24 fps; the reference is 1280×720 horizontal @ 30 fps — a 16:9 composition will be needed for long-form.
