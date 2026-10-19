# Reference — Frame-by-Frame Animation Log

Every one of the 5,062 frames (30 fps, 1 frame = 33.3 ms) was inspected in 60-frame sheets and also
measured numerically (`reference-perframe.csv`: per-frame pixel change, cut flag, camera pan in px,
zoom %, changed-region bounding box, average colour, brightness).

## Motion grammar (the rules this channel animates by)

| Move | Duration (frames @30fps) | Notes |
|---|---|---|
| Prop / icon pop-in | **2–6 f** | scale 0 → ~110% → 100%; settle 3–4 f; often 1-frame squash ("thin sliver") first |
| Rubber-stamp slam | **1 f appear at ~150% → 100% in 3 f** + 3-4 f micro-shake | stamp lands ~9-10 f after a cut |
| Wind-up before a slam | 4–15 f | prop shrinks/drifts, then rises toward camera 3-4 f, then slams 2-3 f |
| Whip-pan transition | **3–5 f** of directional blur | used instead of cuts; blur frame often shared by both shots (blur-match) |
| Zoom-blur transition | 3–9 f radial smear | in AND out of scene plates/documents |
| Zoom punch (read a document) | **3–6 f** to 2.5–4x | ease-out + motion blur |
| Smash reveal | 1 f | e.g. f916: whole territory turns red in one frame at peak zoom, then 10-f zoom-out |
| Character slide-in | 3–18 f | fast (3-4 f + blur) for comedic entries, 15-18 f for travel |
| Stagger between repeated items | **1–3 f** | eyes on colonies, delegates, flags, soldiers, feather headbands |
| Musket raise | ~6 f rotation, 3–5 f offset per soldier | slight overshoot |
| Lip-flap | open/close every **4–6 f** | only on quoted dialogue |
| Gesture loop (glove point/pump) | ~8 f cycle | |
| Blink | 2–3 f, roughly every 2–3 s | |
| Strike-through / highlighter / marker loop | 6–18 f | constant speed; longer phrase = longer wipe |
| List rhythm (one item per spoken word) | **every 18–25 f** | items 0.6–0.8 s apart |
| Title entry | 4–8 f | either type-on (1 char/frame), scale-down from huge, or fade+105% |
| Quote type-on | one word per spoken word (10–16 f apart) | |
| Holds | 20–55 f typical; key "let it land" holds 84–150 f | camera keeps drifting during every hold |
| Black hold | **31 f (1.03 s)** once, after "the war begins" | only black in the video |

Camera never fully stops: even holds have a 3–8% slow push or drift. Fast moves are almost always eased
(ease-out on arrivals, ease-in on exits).

## Full frame log

f0-35   camera push-in on N. America satellite, ease-out (fast start, settles by f35).
f8-40   colony fill starts as WHITE sliver in Massachusetts (f8) and floods NE→SW state by state; each state appears white then tints to blue (two-step fill, ~6-8 f per state).
f40-57  white → final blue settle across whole colonies (~17 f).
f58     neon white outline/glow stroke snaps ON in 1 frame; holds f58-79 (22 f = 0.73 s); fades f79-81.
f82-99  flag-cloth fill reveals radially from a seed point (mid-Atlantic) outward across colonies (~17 f), cloth waving from f90.
f92-150 fireworks particle bursts (pink/gold), new burst every ~6-10 f; eagle shadow crosses bottom-right → left f100-160.
f114-120 timeline enters as a horizontal light streak (stretched/glitch line) 6 f; numbers fade up f121-126; "1776" turns yellow on f127 (1-frame colour switch).
f156-170 timeline streaks out (reverse of entry); f171-176 re-forms as 1755/1756/1757; "1756" yellow f176 (rewind gag ≈ 20 f total).
f187-202 TRANSITION: thin white vertical line sweeps right→left revealing parchment map behind it (line-wipe, 15 f).
f196-238 eraser prop (red/blue) enters top-right f196, scrubs down the coast f198-238 (≈1.4 s), flag erased under it → flat blue.
f240-267 eraser finishes Georgia then exits off bottom edge (f255-267, accelerating out = ease-in exit).
f259-268 faces appear on colonies: eyes pop in sequentially N→S, ~1 colony per frame (stagger 1 f) — not all at once.
f268-311 faces hold with subtle eye/brow jitter (boil) — bicker loop; camera slow drift right.
f311-316 FAST PAN east across the Atlantic (whip pan, ~5 f, no cut) to Britain.
f315-319 Britain already red; camera settles with ease-out zoom-in.
f320-326 golden crown DROPS from top of frame onto Scotland (6 f fall) with bounce settle f326-330; crown wobbles/rotates slightly in a loop thereafter.
f360-373 camera pulls back hard (zoom-out ~14 f) to world view; crown & Britain shrink.
f374     world colours flash in over ~2 f (semi-transparent at f374, solid f375) — red/blue alliance fills.
f375-382 title "Seven Years' War" + yellow "(1756-1763)" — text scales DOWN from large (f376-378) to settle f382 (scale-in from 130%→100%, ~7 f).
f383-455 slow push-in toward Europe (~2.4 s); small white/French flag waving over France from f425.
f455-462 title slides off right as camera accelerates right/zooms into N. America.
f463-468 cut-free pan to N America; f468 Spanish (orange) + French (grey-pink) territories appear in 1 frame.
f468-497 territories hold; French land is pale pink-grey (semi-transparent red).
f497-512 French land cross-fades pale → full red (15 f opacity ramp) = "Britain gains territory"; darker red overlay settles f512.
f530-560 camera pans right toward Britain (~30 f, ease in-out), Spain orange slides out of frame left.
f580     stamp prop enters as a THIN horizontal sliver (scale Y≈0) → f581 full size: 1-2 frame "pop" (squash→stretch).
f581-595 stamp hovers/drifts slightly smaller (anticipation, 14 f), f596-599 rises up toward camera (wind-up, scale ↑ 4 f).
f600-602 stamp slams DOWN fast (2-3 f) and leaves "DEBT" print; stamp lifts off top f601-603.
f603-626 DEBT stamp holds 24 f with micro-shake on the first ~4 f.
f627-629 DEBT text slides off to the right (2-3 f, fast exit) — Britain revealed with face (eyes + brows) already on.
f630-650 Britain face idle (blink, brow lowered = annoyed); slow push.
f650-668 Britain character SLIDES left/down across the ocean (~18 f, ease in-out) while camera pans west to the colonies — two motions combined.
f668-719 Britain hovers off the coast; eye darts left (looks at colonies) ~f676; idle bob.
f720-770 Britain idle hold (~50 f) with tiny brow/eye shifts only — "hold while VO talks".
f771-776 glove hand + noodle arm extends out from Britain toward colonies (arm grows over ~5 f), glove starts small.
f776-790 camera push-in (zoom ≈+30% over 14 f, ease-out) while glove waggles.
f790-875 Britain TALKING loop: mouth open/close every ~4-6 f (lip-flap), glove pumps/points ~8 f cycle, eyes blink once ~f830.
f876-882 camera recentres/pulls back slightly; f882 white block arrow pops in pointing at colonies (1-frame appear, then small 2-3 f bob loop).
f882-915 arrow bobs (move ~6px in/out each ~10 f) — "attention pulse".
f916     HARD 1-FRAME REVEAL: whole British North America floods red in 1 frame + camera zoomed IN at that instant, then f916-925 fast zoom-OUT (~10 f) — a "smash reveal".
f926     arrow re-pops pointing at the interior (same bob loop) f926-975.
f975-979 arrow scales UP toward camera and exits (2-4 f), camera zooms back in onto colonies + Britain (f976-985).
f985-1000 glove reaches over to the colonies; tiny white colony hand pokes back (f990-1000).
f1001-1002 yellow star/spark flash at the contact point (2 f) — "slap/poke" hit frame.
f1003-1012 small white hand thrown off/flies up-left and fades (8 f) — colonies get shoved.
f1012-1019 Britain idle, smug.
f1020-1075 HOLD ~55 f: only Britain's eyes shift (look left f1036, look up f1060) = "scheming" eye-darts, nothing else moves except slow camera drift.
f1075-1080 camera push-in (zoom ~+20% over 5 f, snappy).
f1080-1118 Britain thinking: brows tilt, mouth small "o" f1083-1090; idle.
f1119-1121 Sugar Act parchment pops in at glove (scale 0 → 110% in 2 f, settle 100% by f1124) + slight rotation wobble ±8° that damps over ~8 f.
f1125-1149 Britain grins wide (mouth swaps to big smile f1134); paper held.
f1150-1153 ZOOM PUNCH: scale ~3x in 3-4 f (ease-out, motion blur on f1151-1152) → close-up of paper & giant eye.
f1153-1181 hold close-up ~28 f with slow drift; the paper slowly rotates/slides (parallax vs face).
f1182    HARD CUT (1 f of blurred satellite = whip-in) → f1183 satellite colonies.
f1183-1205 slow settle push-in.
f1205-1218 taxed item #1 (wine/molasses) pops: grows from dot f1205 → full f1210, then the red TAXED sticker stamps on at f1218 (1 f appear + scale settle 3 f).
f1227-1240 item #2 (sugar sack) pops (dot→full in ~5 f), TAXED stamp f1240.
f1249-1262 item #3 (coffee) same pattern, stamp f1262.
f1276-1287 item #4 (red fabric) same, stamp f1287.
     → Rhythm: one item every ~22-25 f (0.75-0.8 s), each = 5-6 f pop + ~12 f wait + 1 f stamp slam. Synced to each word of the VO list.
f1288-1319 hold with idle wobble on stickers.
f1320-1327 stickers FLY OFF screen outward (each in its own direction, ~6 f, ease-in) while the scene darkens (exposure drop ~40% over 6 f, vignette) and the colony mob appears (faces + pitchforks + torches fade/pop in f1323-1328).
f1328-1360 mob idle: torches flicker (orange glow pulses every ~4 f), pitchforks bob slightly.
f1361-1364 Britain slides in from right edge (4 f, fast ease-out) – nervous face (wide eyes, wobbly mouth).
f1365-1412 Britain nervous idle; eyes look left at mob f1380; mouth talking ("Whoa whoa relax") flap f1395-1412.
f1413-1419 Sugar Act paper pops into glove (6 f).
f1420-1436 holds paper, grin.
f1437-1440 paper TEARS: splits into two halves in 1-2 f, halves held in two hands f1440-1452 (second arm appears).
f1453-1462 halves thrown up/outward, rotating, arcing off-screen (~10 f, gravity arc).
f1463-1495 Britain relieved grin, idle.
f1496-1500 Stamp Act paper pops into glove (dot→full 4 f).
f1500-1506 ZOOM PUNCH ~4x in 6 f (with motion blur f1503-1505) – Britain's face goes shocked (big round eyes, open mouth) mid-zoom f1505.
f1506-1510 paper settles into centred close-up, rotation wobble damps.
f1510-1550 hold close-up (~40 f) with very slow drift right.
f1551     HARD CUT to print-shop plate (sepia-warm AI still), colonist + clerk chibis already placed; slow push f1551-1600 (~+5%).
f1600-1601 red TAXED stamp appears LARGE over clerk (1 f) and shrinks to rest by f1604 (scale 150%→100% in 3 f = slam), slight rotation ~-10°.
f1604-1619 hold; small ink-bleed static.
f1620-1621 HARD CUT to store/office plate #2 (darker, bookshelves); same two chibis reused at same screen position (asset reuse; only bg swaps).
f1627-1631 TAXED stamp slam on clerk (same 150→100% 3 f).
f1643     HARD CUT plate #3 (grey-blue office); stamp slam f1652-1655.
f1666     HARD CUT plate #4 courtroom; judge chibi (white wig) behind bench; stamp slam f1676-1679.
     → STAMP RHYTHM: cut every ~22-27 f, stamp lands ~9-10 f after each cut. 4 locations in ~3 s.
f1693     HARD CUT tavern plate; colonist next to round card table; stamp slam on cards f1711-1714.
f1714-1750 colonist face goes from neutral → frown (brows drop f1730), slight body lean.
f1751-1757 anticipation: colonist leans/rotates toward table (6 f).
f1758-1768 TABLE FLIP: table rotates up & flies right with heavy motion blur (~10 f), cards scatter as particles; colonist arm swings (black line arm).
f1768-1786 cards flutter down & settle on floor (~18 f); colonist angry idle.
f1786-1790 ZOOM-BLUR transition OUT: radial blur + scale-in into centre over 4 f (f1790 fully smeared).
f1791     cut to satellite (zoomed in), f1791-1795 zoom-out settle (de-blur).
f1796-1810 chibi delegates POP IN one by one across the colonies (≈1 every 1-2 f, scale bounce).
f1811-1845 delegates idle; then f1840-1853 they SLIDE/converge toward New York (~13 f, ease-in).
f1852-1859 red pin drops in (scale up from dot 2 f), circle ring expands out from pin (ripple) f1855-1866.
f1858-1866 camera zooms in (~+40% over 8 f); label "New York" + date wipe on left→right f1864-1870.
f1898-1910 white outline circle icon (Parliament / Big Ben) draws on (stroke-draw 4 f) and fills f1900-1905.
f1911-1913 icon flashes RED neon glow (3 f), back to white f1914-1916, red again f1917-1919 → blinking warning pulse (~6 f period).
f1920-1925 red ✕ draws across Parliament icon (stroke-on ~3 f) and icon settles to steady red neon glow.
f1948-1960 second icon (handshake/money) draws on: white stroke circle grows from small (f1948) → full (f1956), fill f1956-1960.
f1962-1979 green neon glow FLICKERS on/off (green f1962-64, white f1965-67, green f1968+) — neon "buzz" flicker ≈3 f on/3 f off, 2 cycles, then steady.
f2001-2007 camera zooms OUT fast (6 f); icons slide out left/right edges (pushed off by zoom); colonies' eyes pop in f2002-2006.
f2008-2044 colonies' eyes idle; glare left/right (eye direction swaps ~f2025).
f2045-2049 IRIS/BLACK-BLOB TRANSITION: a soft-edged black circle enters from the right and grows to cover frame (4 f), then shrinks/exits left (f2049-2051) revealing a re-framed shot (not a true cut — a "blob swipe").
f2056-2066 red dot pin grows from 1 px → large (10 f, overshoot at f2065), ring ripple expands f2066-2074.
f2066-2076 label "Boston / March 5, 1770" wipes on (left→right, ~8 f).
f2080-2116 slow zoom-in toward Boston (+~60% over 36 f, accelerating).
f2116-2119 zoom ACCELERATES hard (3 f, ~3x) + motion blur → f2120-2123 radial zoom-blur into the Boston street plate (blur clears over 4 f).
f2124-2186 Boston street: crowd group left, redcoats right; whole plate push-in ~5%; crowd signs bob (each sign ±3px offset loop, staggered).
f2187     HARD CUT to close-up of crowd (bearded colonist, bald man, young man), signs above.
f2187-2219 bearded man shouts: mouth open/close every ~4-6 f, arm line waves (pumping fist) on 6-8 f cycle; Union Jack sign with ✕ bobs top-left.
f2220-2233 crowd shouting loop continues (≈4 f mouth cycle) while camera drifts left.
f2233-2235 WHIP-PAN right (3 f, heavy horizontal blur) – no cut – lands on redcoats close-up.
f2235-2304 redcoat close-up hold: front soldier's face changes ~every 15-20 f (neutral → raised brow f2246 → mouth "o" f2253 → squint f2262 → talking f2280-2290, "what the hell is that Brit thinking"). Body static; only face swaps.
f2305-2306 snowball enters from left (1-2 f, tiny), IMPACT f2307: white powder burst on front soldier's face (particle puff f2307-2319, ~12 f dissipate), head knocked back ~5° f2307-2310.
f2319-2330 flakes fall off; soldier squints, then frown.
f2331-2345 a stick/club thrown from left (line streak, motion blur) passes f2333-2345 — second projectile.
f2346-2372 soldier frowning, fixed stare (hold).
f2373-2380 FIRST musket rises: rotates from vertical (shoulder arms) to horizontal aim in ~6 f (ease-out, overshoot 1-2°).
f2380-2394 hold aim.
f2395-2409 second & third soldiers raise muskets with 3-5 f stagger (f2395, f2401, f2404).
f2410-2420 all aiming; slight camera push.
f2421-2430 muzzle SMOKE puffs spawn at barrel tips (grey particle clouds grow & drift left over ~20 f); recoil kick 1-2 f on each musket (≈4px back).
f2430-2443 smoke dissipates; soldiers hold.
f2443-2444 HARD CUT to wide crowd shot: fallen chibis lying horizontally (rotated 90°) in foreground; survivors shocked (wide-eye faces).
f2444-2493 hold with slight push; signs still bob.
f2494-2499 Paul Revere print flies in from right SPINNING (~90° rotation over 5 f, heavy motion blur), lands tilted ~-5°; background blurs (DOF pull) as it lands (f2498-2502).
f2500-2519 print hold, slight rotation drift.
f2520-2540 print holds; slow drift.
f2540-2546 camera pulls back/zooms out through the print (print shrinks, bg sharpens and blurs again) → f2546 blur crossfade.
f2547     cut to flat-blue zoomed map of Boston pin; f2547-2575 zoom-out (~ -60% over 28 f, ease-in-out) back to satellite colonies.
f2575-2581 BIG cartoon eyes pop onto every colony (staggered S→N then N→S, ~1 f stagger), eyes all look toward Boston.
f2581-2675 eyes idle; pupils dart toward Boston and back ~every 20-30 f ("rumours spread").
f2675-2680 eyes shrink/pop out (5 f).
f2683-2690 parchment tax list SLIDES IN from bottom-left on a curve (page curl/rotation ~25° → 0° over 7 f, like being tossed in), ease-out.
f2695-2707 list settles centred; camera slowly rises (tilt up along list).
f2706-2712 red strike line DRAWS across "Glass" left→right (6 f).
f2722-2728 strike "Lead" (6 f).  f2742-2748 strike "Paint".  f2760-2766 strike "Paper". → one strike every ~18-20 f.
f2742-2760 camera tilts down along the list to reveal "Tea" (scroll).
f2805-2812 green marker loop draws around "Tea" (stroke-on ~7 f, hand-drawn oval with overshoot tail).
f2810-2815 ZOOM PUNCH onto Tea (~2.5x in 5 f, ease-out) → f2815-2819 hold.
f2820-2838 Tea close-up hold.
f2839-2843 WHIP-PAN left (4 f horizontal smear) straight into the wharf plate — the list and the dock share the blur frame f2842 (blur-match cut).
f2843-2876 three colonists idle on dock (blink ~f2860), slight push-in.
f2877-2887 feather headbands DROP onto heads from above (each falls ~6-8 f, staggered 2-3 f: left f2877, middle f2880, right f2883), squash on landing; characters' arms (lines) reach up to adjust f2880-2899.
f2900-2924 hold in costume.
f2925-2932 camera ZOOM-OUT + tilt up (~7 f, blur) to reveal ship wide shot; characters shrink at bottom-left.
f2933-2970 chibis walk/hop up the gangplank one after another (each ~10 f, bob-hop gait), appear on deck behind crates.
f2970-3062 on deck: crates thrown overboard — each crate lifts, arcs out over rail (~8-10 f), small splash; new throw every ~15-20 f, three characters alternating.
f3062-3080 foreground heads (backs of chibi crowd) RISE INTO FRAME from bottom (slide up ~15 f, staggered) + camera moves back → over-the-shoulder spectator shot.
f3080-3094 crowd heads bob slightly (each on own offset).
f3095     title "Boston Tea Party" + date appear (fade+scale from 105% over ~4 f), hold through f3119+.
f3120-3132 Tea Party title hold.
f3133-3135 ZOOM-BLUR OUT (radial smear, 3 f) → f3136 cut to flat-blue Massachusetts map, Boston town illustration icon + label already present; f3136-3145 zoom-out settle (~9 f).
f3145-3157 hold.
f3158-3160 Britain SLIDES IN from right edge with motion blur (3 f!), furious face (V-brows, gritted teeth rectangle mouth).
f3160-3191 Britain fuming idle: brows twitch, teeth chatter (mouth swaps every ~3-4 f) — rage shake ±2px.
f3192-3195 Britain exits right (3 f, blur) — "sends punishment".
f3196-3198 red "CLOSED" stamp slams on the harbour (1-f appear oversized, settle 2-3 f).
f3198-3234 hold; slow zoom-in.
f3235-3238 "LIMITED" stamp slams on town (same slam) — stamp #2 ~39 f after #1.
f3269-3276 squad of redcoat chibis slides in from the right in a line (staggered 1 f each, 7 f total) and covers Boston.
f3276-3330 redcoats hold (tiny idle bob).
f3330-3338 zoom-out (8 f) + crossfade flat map → satellite map (f3335-3340 blend).
f3340-3346 colonies tint ORANGE state by state N→S (≈1 state per frame, wave), Georgia stays blue.
f3350-3362 title "FIRST CONTINENTAL CONGRESS" writes on letter-by-letter (typewriter, ~1 char/frame), date "(SEP 5, 1774)" in yellow after.
f3362-3419 hold with slow push-in.
f3420-3458 First Congress hold (~38 f), barely-perceptible push-in.
f3459-3463 red cap DROPS from top edge (4 f fall, rotating), lands on New England f3463 with squash; settles f3463-3466.
f3466-3494 cap hold (gag lands ~1 s).
f3494-3496 WHIP-PAN up/right with blur (2-3 f) → f3496 plain blue colonies (orange removed).
f3496-3506 settle; f3506-3512 pin drops on Lexington + label "Lexington" types on (f3507-3516), small date line.
f3516-3535 zoom-in toward Lexington (+~40%, ease-in).
f3536     HARD CUT to Lexington green plate (misty, dawn). Militia block left, redcoat block right, both ~15% frame height (wide shot).
f3536-3690 LONG HOLD ~150 f (5 s!) — only movement: very slow push-in, mist drift, soldiers' subtle idle bob, muskets lowered → raised. This is the tension beat ("the tension reaches its peak").
f3600-3615 both lines raise muskets (rotate to horizontal) with staggered offsets.
f3690-3700 single muzzle-smoke puff appears between the lines (left-centre), drifts and fades ~25 f.
f3697-3704 one redcoat (front right) tips over and falls flat (rotation 90° over ~6 f).
f3718-3719 quote "The shot" begins to type on (word by word).
f3719-3752 quote types WORD BY WORD synced to VO: "The shot" f3719 → "heard" f3735 → "round" f3745 → "the world." + attribution line f3752 (≈ every 10-16 f, i.e. each spoken word).
f3752-3792 full quote hold (~40 f).
f3793-3823 PURE BLACK for 31 frames (1.03 s) — the only black hold in the video ("The war begins").
f3824     cut in from black onto topographic parchment map (Boston/Lexington area), no fade — hard cut.
f3824-3920 battle-route animation: small redcoat sprites march W from Boston toward Concord (path), muskets, tiny smoke puffs at Lexington f3860-3880 and Concord f3885-3915; labels "Lexington" (f3850) and "Concord" (f3880) fade in w/ yellow dates; slow zoom-in.
f3920-3930 CROSS-DISSOLVE (10 f) from topo map → flat blue political Massachusetts map (state borders).
f3930-3940 fast zoom-out (10 f) through New England → parchment N. America (style switch inside the zoom).
f3938-3946 "SECOND CONTINENTAL CONGRESS" + "(MAY 10, 1775)" yellow — enter LARGE (fills frame) and shrink to final size top-left in ~8 f (scale-down entry, like a slam from camera).
f3946-3980 hold, slow push.
f3981-3995 army of chibi Continental soldiers SPAWNS across colonies S→N (cascade, ~2 per frame), fills colonies by f3995.
f3995-4019 army idle bob.
f4020-4032 Washington chibi pops in on New England (scale-in 3 f) + label "George Washington" with hand-drawn curved arrow (arrow stroke draws on ~6 f, f4033-4039).
f4033-4086 slow push toward Washington.
f4084-4092 FAST push-in (zoom ~4x over 8 f, ease-in-out) to Washington close-up; title slides out top-left.
f4092-4128 Washington holds "Truce, mb?" scroll (scroll popped in f4092-4094); blink f4115; gentle bob.
f4129-4135 scroll is let go → slides/flies off to the right (6 f) across the ocean.
f4135-4149 CAMERA FOLLOWS the scroll east: long whip-pan right across the Atlantic (~14 f, empty sea frames f4144-4149) — the camera move IS the transition (no cut).
f4149-4152 Britain slides into frame holding the scroll (arrives with the pan), annoyed face.
f4152-4174 Britain reads/holds scroll (eyes on scroll), brows lower.
f4175-4191 scroll TORN in two (split f4175), halves held apart in both hands f4177-4191 (pull apart, shake).
f4192-4199 halves flung up & out (rotating, ~8 f), fall off-screen.
f4200-4240 Britain fuming idle; slow zoom-out.
f4240-4252 camera pans WEST back across Atlantic (~12 f) — Britain slides out right.
f4252-4258 timeline ruler fades in top (1776 / Jul 1 / Jul 2 / Jul 3), "Jul 2" yellow by f4260.
f4258-4304 hold ~45 f with slow zoom-in on colonies.
f4305-4315 timeline + camera RUSH forward (3D fly-through: ruler scales up past camera ~10 f) while raised fists/arms with ballots POP UP from every colony (staggered, f4307-4316), each arm rises ~4 f.
f4316-4362 raised arms holding ballots hold (~46 f) – each arm wiggles slightly (vote shake), camera slow push.
f4363-4370 arms drop/vanish (pop out ~3 f stagger) while timeline flies back DOWN into frame from top in 3D (rotated perspective), "Jul 2 → Jul 3" scrolling.
f4370-4380 timeline ruler rotates in perspective (3D swing ~20°) and settles flat; scrolls to "Jul 4" (yellow ~f4386).
f4389-4400 flag-cloth fill sweeps across colonies again S→N (wipe ~11 f) — callback to f82-99.
f4410-4420 Declaration document drops in, rotating ~30° → 0° and scaling from 20% to 100% over ~10 f (toss-in), lands with small bounce.
f4420-4466 Declaration hold, slow push.
f4466-4472 Jefferson chibi peeks out from behind document (slides right ~6 f); timeline scales up and exits top (f4467-4472).
f4472-4480 zoom-in (~2x over 8 f) on Declaration + Jefferson.
f4480-4520 Jefferson holds quill, blinks f4500, slight bob.
f4521-4530 ZOOM-BLUR INTO document (radial blur, ~3x scale, 9 f) → macro manuscript.
f4527-4538 yellow highlighter wipes over "that all men are created equal" left→right (≈10 f).
f4538-4569 hold with lateral drift right (camera slides along line).
f4570-4579 FAST lateral whip along text (horizontal motion blur 9 f) to next passage.
f4580-4590 highlighter wipes "unalienable Rights" (~8 f).
f4590-4619 hold, slow drift.
f4620-4637 whip-glide along text (lateral blur ~10 f) to next passage.
f4638-4656 highlighter wipes "Life, Liberty and the pursuit of Happiness" (~18 f — longer phrase = longer wipe; speed ≈ constant px/frame, synced to VO).
f4656-4740 LONG HOLD on the phrase (~84 f ≈ 2.8 s) with slow drift — lets the line land before the twist.
f4740-4753 lateral whip-blur (13 f).
f4754-4756 whip lands in porch plate (blur clears 3 f): Martha chibi + tea table.
f4756-4789 Martha idle; slow push; blink f4775.
f4790-4795 children + baby cradle SLIDE IN from right (motion blur, ~5 f) — enter as a group.
f4795-4823 family hold.
f4824-4830 FAST PULL-BACK reveal (zoom-out ~2.5x + pan right, 6 f, heavy blur) → wide porch/plantation: enslaved people (dark-skin chibis) now visible serving/working; lawn & fields beyond.
f4830-4884 hold wide (~54 f) with slow push; no character motion — the image does the joke.
f4885     HARD CUT to parchment map (sea only visible), f4885-4890 fast pan-in from upper-left: red British N. America + purple-blue colonies slide in (5 f).
f4890-4919 settle; mini flags (US & Union Jack) begin popping on (tiny).
f4920-4940 mini flag icons (Union Jack on coast/sea, US flag inland) pop on one by one (~1 every 2 f), each 3-f scale-in.
f4936-4950 title "American Revolutionary War" fades in (dark red serif, ~12 f fade, no movement).
f4950-5061 slow continuous push-in (~+15% over 111 f) — flags shimmer slightly; NO end card, NO subscribe animation.
f5061    last frame; file ends on the map (hard out, no fade to black).
