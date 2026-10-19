# VO CUE SHEET — every animation pinned to its word (60 fps)

VO length: **8:11.00** = **29460 frames**. File: `public/assets/vo/vo_master.mp3` (loudness-normalised to −14 LUFS).

Built by `scripts/vo/build_cues.py` from `scripts/vo/vo_timeline.json`. Frame = absolute frame in the full video.


## S01_hook — Hook — loved the King, then took up guns
Frames **0–962** (0:00.00–0:16.03, 16.0 s) · style: Map3D → satellite

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 0:00.00 | 0 | 0 | आपको बताया गया | 3D map: top view of North America, colonies start rising one by one (Map3D riseStart) |
| 0:01.88 | 112 | 112 | आज़ादी के लिए | Grand Union flag cloth sweeps over the colonies (FlagFill) + fireworks |
| 0:04.27 | 256 | 256 | सत्रह सौ तिरसठ में यही | TimelineRuler REWINDS 1776 → 1763 (rewind_tape.wav), flag erased |
| 0:06.66 | 399 | 399 | राजा से प्यार | Britain map-character pops in, golden crown DropIn, colonies get heart-eyes (RegionEyes mood smile) |
| 0:09.14 | 548 | 548 | तेरह साल | Timeline ticks 1763 → 1776 fast |
| 0:13.06 | 783 | 783 | बंदूक उठा ली | Colonies RegionEyes switch to angry; musket_militia PopIn on the coast |
| 0:14.34 | 860 | 860 | जान की बाज़ी | Camera punch-in + Shake; heartbeat_low.wav |

## S02_turn — What this video will show
Frames **962–1909** (0:16.03–0:31.82, 15.8 s) · style: parchment

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 0:16.05 | 962 | 0 | आज हम इस पूरी कहानी | LineWipe satellite → parchment |
| 0:19.29 | 1157 | 195 | एक जंगल में चली एक गोली | Dotted route DrawLine starts at Jumonville Glen |
| 0:21.84 | 1310 | 348 | चार July सत्रह सौ छिहत्तर | Route reaches Philadelphia, MapPin "4 July 1776" |
| 0:26.25 | 1575 | 613 | हर बार problem को solve | Icons pop along the route: crown, stamp, teacup, musket, quill (stagger 8) |
| 0:29.90 | 1793 | 831 | problem और बड़ी हो गई | Each icon scales up bigger (problem grows) + whoosh |

## S03_colonies — The 13 colonies
Frames **1909–5333** (0:31.82–1:28.88, 57.1 s) · style: parchment

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 0:31.82 | 1909 | 0 | शुरुआत करते हैं इन तेरह colonies | Camera to Eastern NA; ColonyFill N→S (14 f per state) |
| 0:34.82 | 2089 | 180 | Atlantic के किनारे | NeonOutline on the whole coastal strip |
| 0:38.04 | 2282 | 373 | New Hampshire से Georgia | Labels New Hampshire (top) and Georgia (bottom) PopIn |
| 0:42.53 | 2551 | 642 | पच्चीस लाख | Big counter MapTitle "25,00,000" type-on |
| 0:46.46 | 2787 | 878 | पाँच लाख अश्वेत | Second counter "5,00,000" in a different colour |
| 0:50.05 | 3002 | 1093 | ये number याद रखना | Counter pinned to the top-right corner (it returns at the end) |
| 0:55.83 | 3349 | 1440 | ये एक देश थे ही नहीं | RegionEyes on every colony, bickering (look ±1, mood angry) |
| 0:59.73 | 3583 | 1674 | अपना पैसा | Different coin icons pop on 3 colonies |
| 1:02.63 | 3757 | 1848 | आपस में ही उलझते | Two colonies push each other (Shake + small slides) |
| 1:05.88 | 3952 | 2043 | Benjamin Franklin | franklin puppet slides in from left |
| 1:14.52 | 4471 | 2562 | Join, or Die | Paper3D: pd_join_or_die_1754 floats in |
| 1:17.02 | 4620 | 2711 | एक हो जाओ | Snake pieces flash one by one over the colonies |
| 1:20.60 | 4835 | 2926 | नहीं, शुक्रिया | StampSlam stamp_rejected on the cartoon |
| 1:25.63 | 5137 | 3228 | Britain के ख़िलाफ़ क्या खड़े होते | Colonies turn their backs (eyes look away) |

## S04_first_shot — Jumonville Glen 1754 → world war
Frames **5333–7620** (1:28.88–2:07.00, 38.1 s) · style: parchment 3D-tilt → forest plate → world map

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 1:28.89 | 5333 | 0 | अट्ठाईस May | Camera to Western PA with tilt 25 + hillshade; MapPin "Jumonville Glen / 28 May 1754" |
| 1:33.39 | 5603 | 270 | Ohio नदी | Ohio River path glows (DrawLine blue) |
| 1:34.89 | 5693 | 360 | Britain और France, दोनों का दावा | Red and blue claim areas pulse over the Ohio country |
| 1:37.84 | 5870 | 537 | बाईस साल का एक लड़का | ZoomBlur into bg_forest_ohio_1754_dawn (ParallaxPlate); washingtonYoung puppet |
| 1:42.59 | 6155 | 822 | French camp पर हमला | Musket volley + MuzzleSmoke + Shake (musket_single.wav ×3) |
| 1:45.16 | 6309 | 976 | पंद्रह minute | clock_15min icon PopIn |
| 1:47.79 | 6467 | 1134 | Jumonville मारा जाता है | French officer puppet fallAt |
| 1:51.09 | 6665 | 1332 | George Washington. | MapTitle "George Washington" + ArrowLabel to the puppet (beat of silence) |
| 1:55.44 | 6926 | 1593 | British की तरफ़ से | Union Flag 1707 PopIn beside Washington |
| 1:58.71 | 7122 | 1789 | World War बन गई | Smash-cut to world map; fire spreads from the pin (Territory fills) |
| 2:00.49 | 7229 | 1896 | Europe | Europe pulses |
| 2:02.10 | 7326 | 1993 | Caribbean | Caribbean pulses |
| 2:03.04 | 7382 | 2049 | हमारे भारत तक | India pulses + camera nudge |
| 2:05.44 | 7526 | 2193 | Seven Years' War | MapTitle "Seven Years' War" / (1756–1763) slam |

## S05_debt — Britain wins, Britain is broke
Frames **7620–8906** (2:07.00–2:28.43, 21.4 s) · style: parchment

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 2:07.00 | 7620 | 0 | Britain जीत गया | Britain map-character, crown, mood smug |
| 2:09.53 | 7771 | 151 | Treaty of Paris | Paper3D doc_treaty_of_paris_1763 |
| 2:11.00 | 7860 | 240 | France ने Canada | Territory: Canada smash-fill red |
| 2:14.62 | 8076 | 456 | छोटी सी दिक़्क़त | Britain mood worried |
| 2:16.40 | 8183 | 563 | बहुत महँगी | Coins drain out of Britain |
| 2:19.06 | 8343 | 723 | क़र्ज़ लगभग दोगुना | StampSlam stamp_debt WITH wooden handle wind-up (stamp_slam.wav) |
| 2:22.69 | 8561 | 941 | ये bill भरेगा कौन | Britain eye-darts (look −1/1), mood thinking |
| 2:24.43 | 8665 | 1045 | जवाब था, colonies | Britain slides across Atlantic (slideTravel) and glove-points at the colonies; ArrowBob |

## S06_proclamation — The 1763 line on the mountains
Frames **8906–10111** (2:28.43–2:48.52, 20.1 s) · style: parchment + 3D terrain tilt

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 2:28.45 | 8906 | 0 | Native American क़बीलों | Western frontier flashes; small smoke puffs |
| 2:32.60 | 9156 | 250 | सात October | MapPin-style date card "7 October 1763" |
| 2:36.38 | 9382 | 476 | Appalachian पहाड़ों | Camera tilts 28° over hillshade Appalachians |
| 2:37.79 | 9467 | 561 | एक line खींच दी गई | DrawLine Proclamation Line (dashed red) |
| 2:40.60 | 9635 | 729 | कोई नई बस्ती नहीं | West side shades grey + NeonIcon red X |
| 2:43.38 | 9803 | 897 | जिस ज़मीन के लिए जंग लड़ी | Settler puppets walk to the line |
| 2:46.91 | 10014 | 1108 | उधर जाना मना है | Settlers bump into the line and bounce back (comic) |

## S07_sugar — Sugar Act 1764
Frames **10111–11690** (2:48.52–3:14.83, 26.3 s) · style: parchment → satellite

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 2:48.52 | 10111 | 0 | फिर आया Sugar Act | Britain pulls doc_sugar_act_1764 → ZoomPunch |
| 2:53.17 | 10390 | 279 | tax बढ़ाया नहीं, घटाया | Price tag "6d" PopIn |
| 2:55.63 | 10537 | 426 | छह pence से सीधा तीन pence | StrikeThrough 6d → "3d" pops |
| 3:00.46 | 10827 | 716 | सब smuggling | Small ships sneak along the coast (smuggling) |
| 3:02.35 | 10941 | 830 | Navy सख़्ती से वसूली | British navy ship icons circle the coast |
| 3:07.29 | 11237 | 1126 | jury ही नहीं | Courtroom icon + NeonIcon red X on "jury" |
| 3:12.33 | 11539 | 1428 | जेब तक पहुँच गया | Glove reaches across the Atlantic into a colony pocket (gag) |

## S08_stamp — Stamp Act 1765
Frames **11690–13485** (3:14.83–3:44.75, 29.9 s) · style: plates (fast cuts) → map

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 3:14.84 | 11690 | 0 | असली बवाल | ZoomPunch doc_stamp_act_1765 |
| 3:18.77 | 11926 | 236 | अख़बार | CUT bg_print_shop_1765 + StampSlam taxed |
| 3:19.67 | 11980 | 290 | contract | CUT bg_lawyer_office_1765 + StampSlam taxed |
| 3:20.50 | 12030 | 340 | license | CUT bg_courtroom_1765 + StampSlam taxed |
| 3:22.26 | 12135 | 445 | ताश के पत्तों | CUT bg_tavern_1765 + StampSlam taxed on the cards |
| 3:24.29 | 12257 | 567 | ये हर किसी को चुभा | Colonist flips the card table (Fling table + cards, wood_crash_cards.wav) |
| 3:28.21 | 12492 | 802 | पुतला एक पेड़ पर | bg_liberty_tree_1765, effigy swings |
| 3:32.85 | 12770 | 1080 | Liberty Tree | MapTitle "Liberty Tree" |
| 3:34.96 | 12897 | 1207 | नौ colonies | Map: 9 colonies light up one by one |
| 3:36.31 | 12978 | 1288 | New York में एक साथ मिले | Delegates converge on New York; MapPin "Stamp Act Congress / October 1765" |
| 3:41.90 | 13313 | 1623 | No taxation without representation | Big serif slogan + NeonIcon Parliament X and coins ✓ |

## S09_repeal — Repeal + Declaratory Act
Frames **13485–14698** (3:44.75–4:04.97, 20.2 s) · style: parchment

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 3:44.75 | 13485 | 0 | Boycott हुआ | Crates stack up at London docks (boycott) |
| 3:46.09 | 13565 | 80 | अठारह March | Date card "18 March 1766" |
| 3:49.19 | 13751 | 266 | वापस ले लिया गया | PaperTear on the Stamp Act |
| 3:51.46 | 13887 | 402 | एक और क़ानून आया | Britain smirks |
| 3:53.14 | 13988 | 503 | Declaratory Act | Paper3D doc_declaratory_act_1766 |
| 3:58.29 | 14297 | 812 | in all cases whatsoever | Highlighter on the phrase |

## S10_townshend — Townshend Acts + troops
Frames **14698–15355** (4:04.97–4:15.92, 10.9 s) · style: parchment

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 4:04.98 | 14698 | 0 | Townshend Acts | doc_townshend_list slides in |
| 4:07.18 | 14830 | 132 | काँच | Glass row: TAXED pops |
| 4:07.88 | 14873 | 175 | paint | Paint row: TAXED pops |
| 4:08.30 | 14897 | 199 | काग़ज़ | Paper row: TAXED pops |
| 4:08.75 | 14924 | 226 | और चाय पर tax | Tea row: TAXED pops |
| 4:10.09 | 15005 | 307 | फिर से ग़ुस्सा | Colonies glare |
| 4:13.41 | 15204 | 506 | Boston में अपनी फ़ौज | Redcoat squad SlideIn onto Boston |

## S11_massacre — Boston Massacre 1770
Frames **15355–17487** (4:15.92–4:51.45, 35.5 s) · style: map → King Street plate

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 4:15.93 | 15355 | 0 | पाँच March | IrisBlob → MapPin "Boston / 5 March 1770" |
| 4:19.25 | 15555 | 200 | ठंडी रात | ZoomBlurIn to bg_king_street_boston_1770_night (ParallaxPlate, snow) |
| 4:21.76 | 15705 | 350 | धक्का-मुक्की | Crowd vs redcoats, crowd talk loop (crowd_angry_loop.wav) |
| 4:22.85 | 15771 | 416 | बर्फ़ के गोले | Fling snowball + ImpactPuff on a soldier |
| 4:25.03 | 15901 | 546 | गोली चल गई | Staggered musket raise → volley, MuzzleSmoke, Shake (musket_volley.wav) |
| 4:26.21 | 15972 | 617 | पाँच लोग मारे गए | Five candles light one by one; music drops |
| 4:28.68 | 16120 | 765 | Crispus Attucks | attucks puppet, respectful hold, name card |
| 4:31.82 | 16309 | 954 | पहला शहीद | Slow push-in, no SFX |
| 4:33.73 | 16424 | 1069 | Paul Revere ने इसकी एक तस्वीर | Paper3D pd_revere_bloody_massacre_1770 spins in |
| 4:40.20 | 16812 | 1457 | असल घटना इतनी सीधी नहीं | Split: engraving vs chaotic scene |
| 4:46.68 | 17200 | 1845 | viral post | Like/share icons burst from the engraving (gag) |

## S12_adams — John Adams defends the soldiers
Frames **17487–18006** (4:51.45–5:00.10, 8.7 s) · style: courtroom plate

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 4:51.46 | 17487 | 0 | John Adams ने लड़ा | bg_courtroom_1765, johnAdams puppet talking |
| 4:54.20 | 17651 | 164 | दूसरे President | Small portrait card "2nd President" |
| 4:57.21 | 17832 | 345 | बरी हो गए | Soldier puppets mood smile, gavel tap |

## S13_tea — Tea Act → Boston Tea Party
Frames **18006–19806** (5:00.10–5:30.10, 30.0 s) · style: parchment → wharf plate

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 5:00.10 | 18006 | 0 | Tea Act | doc_townshend_list again: strike Glass, Paint, Paper; MarkerLoop on Tea |
| 5:00.99 | 18059 | 53 | East India Company | Camera swings to India; Bengal pulses |
| 5:05.87 | 18351 | 345 | चाय बिक नहीं रही | Tea chests pile up in a warehouse icon |
| 5:10.88 | 18653 | 647 | चाय सस्ती भी हो गई | Price tag drops |
| 5:15.81 | 18948 | 942 | उसूल की है | Colonist crosses arms (mood smug) |
| 5:16.99 | 19019 | 1013 | सोलह December | Date card "16 December 1773" → wharf plate (night) |
| 5:20.54 | 19232 | 1226 | भेस बदलकर | teaPartyDisguised ×3 pop in |
| 5:21.37 | 19282 | 1276 | तीन जहाज़ों पर चढ़े | Puppets hop up the gangplank |
| 5:23.20 | 19391 | 1385 | Dartmouth | Ship label Dartmouth |
| 5:24.15 | 19449 | 1443 | Eleanor | Ship label Eleanor |
| 5:25.03 | 19501 | 1495 | Beaver | Ship label Beaver |
| 5:26.50 | 19590 | 1584 | तीन सौ बयालीस पेटियाँ | Counter to 342 while tea_chest Flings into the water (splash ×N) |
| 5:28.31 | 19698 | 1692 | समुद्र में फेंक दीं | Title "Boston Tea Party / 16 December 1773" |

## S14_intolerable — Intolerable Acts + First Congress
Frames **19806–20649** (5:30.10–5:44.15, 14.1 s) · style: flat map → satellite

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 5:30.10 | 19806 | 0 | Britain भड़क गया | Britain slides in furious (rage shake) |
| 5:31.65 | 19898 | 92 | Intolerable Acts | Paper3D doc_intolerable_acts |
| 5:33.30 | 19997 | 191 | Boston का port बंद | StampSlam stamp_closed on Boston harbour |
| 5:35.77 | 20145 | 339 | पाँच September | Date card "5 September 1774" |
| 5:39.41 | 20364 | 558 | First Continental Congress | ColonyFill orange for 12 colonies (Georgia stays blue); MapTitle |
| 5:42.93 | 20575 | 769 | छप्पन delegates | Counter 56 + delegate chibis converge on Philadelphia |

## S15_lexington — Lexington & Concord 1775
Frames **20649–22533** (5:44.15–6:15.55, 31.4 s) · style: night map → Lexington plate → black

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 5:44.16 | 20649 | 0 | अठारह April | Night map, lantern_pair PopIn on Boston (church_bell.wav) |
| 5:47.93 | 20876 | 227 | Concord में रखे हथियार | Route Boston → Concord draws |
| 5:50.78 | 21046 | 397 | Paul Revere घोड़े पर | paul_revere_on_horse rides along the route (horse_gallop.wav) |
| 5:53.84 | 21230 | 581 | myth भी तोड़ दो | Myth card "The British are coming!" PopIn |
| 5:59.44 | 21566 | 917 | अंग्रेज़ ही मानते थे | NeonIcon red X over the myth card |
| 6:01.34 | 21680 | 1031 | उन्नीस April की सुबह | Dawn plate bg_lexington_green_1775_dawn, militia vs redcoats, long hold |
| 6:04.49 | 21869 | 1220 | एक गोली चली | ONE MuzzleSmoke + Shake (musket_single.wav), music cuts |
| 6:06.69 | 22001 | 1352 | आज तक कोई नहीं जानता | Question mark fades over the smoke |
| 6:09.19 | 22151 | 1502 | आठ लोग मारे गए | Eight markers fade in |
| 6:13.11 | 22386 | 1737 | The shot heard round the world | WordReveal quote, then BlackHold 62 f |

## S16_washington — Second Congress, Washington, Bunker Hill, Olive Branch
Frames **22533–24244** (6:15.55–6:44.07, 28.5 s) · style: parchment

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 6:15.56 | 22533 | 0 | लौटने का रास्ता बंद | Map back, slow push |
| 6:19.65 | 22778 | 245 | Second Continental Congress | MapTitle "Second Continental Congress / 10 May 1775" |
| 6:22.33 | 22939 | 406 | पंद्रह June | continental puppets cascade across the colonies |
| 6:24.76 | 23085 | 552 | सेनापति बना दिया गया | washington (1775) puppet + ArrowLabel "George Washington" |
| 6:26.70 | 23202 | 669 | इक्कीस साल पहले | Flash-back inset: young Washington from S04 |
| 6:30.02 | 23401 | 868 | Bunker Hill | bg_breeds_hill_1775 plate, many MuzzleSmoke |
| 6:32.97 | 23578 | 1045 | एक हज़ार से ज़्यादा | Counter "1,000+ killed or wounded" |
| 6:40.17 | 24010 | 1477 | Olive Branch Petition | Washington holds doc_olive_branch_scroll ("Truce?") |
| 6:41.81 | 24108 | 1575 | राजा ने उसे पढ़ा तक नहीं | Camera follows the scroll across the Atlantic; king_george_iii tears it (PaperTear) |

## S17_common_sense — Common Sense 1776
Frames **24244–24998** (6:44.07–6:56.63, 12.6 s) · style: print-shop plate → map

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 6:44.08 | 24244 | 0 | दस January | Date card "10 January 1776" |
| 6:47.89 | 24473 | 229 | Common Sense | Paper3D pd_common_sense_titlepage_1776 |
| 6:50.97 | 24658 | 414 | छोटा सा द्वीप | Map: tiny Britain vs huge continent (scale comparison) |
| 6:55.50 | 24929 | 685 | और आग लग गई | Copies Fling across the colonies; colonies glow |

## S18_july — July 2 vote, July 4 Declaration
Frames **24998–26572** (6:56.63–7:22.87, 26.2 s) · style: parchment

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 6:56.64 | 24998 | 0 | दो July | TimelineRuler Jul 1 / Jul 2 / Jul 3 |
| 6:59.65 | 25179 | 181 | बारह colonies ने हाँ | ballot_raised_fist pops on 12 colonies (New York none) |
| 7:01.70 | 25301 | 303 | John Adams ने अपनी पत्नी | johnAdams puppet writing (quill_scratch.wav) |
| 7:04.47 | 25468 | 470 | दो July को जश्न | Speech-bubble "2 July!" |
| 7:08.18 | 25690 | 692 | दो दिन से चूक गए | Timeline slides to Jul 4 (gag: Adams shrugs) |
| 7:10.83 | 25849 | 851 | Declaration of Independence | FlagFill Grand Union again (callback), DropIn declaration |
| 7:13.98 | 26038 | 1040 | तैंतीस साल के Thomas Jefferson | jefferson puppet peeks from behind the document |
| 7:17.79 | 26267 | 1269 | All men are created equal | ZoomBlurIn to pd_declaration_engrossed macro; Highlighter (29 chars) |

## S19_monticello — The twist — Monticello
Frames **26572–27228** (7:22.87–7:33.80, 10.9 s) · style: porch plate → wide

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 7:22.87 | 26572 | 0 | उसी वक़्त | Whip to bg_monticello_porch_1776: martha + patsy |
| 7:25.52 | 26731 | 159 | दो सौ लोग ग़ुलाम | Slow pull-back to bg_monticello_1776 with enslaved puppets; music drops, NO gag |
| 7:27.71 | 26862 | 290 | पाँच लाख लोगों | The pinned counter from S03 returns: "5,00,000" |
| 7:32.35 | 27141 | 569 | बहुत दूर था | Hold 200 f |

## S20_payoff_close — Answer + Part 2
Frames **27228–29520** (7:33.80–8:12.00, 38.2 s) · style: parchment

| Time | Frame | Local f | On the word | Animation |
|---|---|---|---|---|
| 7:33.81 | 27228 | 0 | तो सत्रह सौ तिरसठ में | Recap: icons for every law pop along a timeline (20 f apart) |
| 7:39.08 | 27544 | 316 | किसी एक tax से नहीं | Icons fade; one word "फ़ैसला" in the centre |
| 7:42.58 | 27754 | 526 | फ़ैसला कौन करेगा | Crown vs colonies tug-of-war |
| 7:49.67 | 28180 | 952 | और क़रीब आ गईं | Colonies slide together, NeonOutline as one shape |
| 7:51.62 | 28296 | 1068 | Franklin का साँप | Join, or Die snake pieces snap together into one |
| 7:58.50 | 28709 | 1481 | जीतना नहीं | War map: red vs blue, mini flags pop |
| 8:04.30 | 29057 | 1829 | France इस जंग में | Bourbon flag pops over France |
| 8:06.71 | 29202 | 1974 | अगले part में | Part 2 teaser card |
| 8:09.96 | 29397 | 2169 | subscribe कर लो | Subscribe button + end card |
