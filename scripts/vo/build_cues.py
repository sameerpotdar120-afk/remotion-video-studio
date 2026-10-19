"""
Builds the master cue sheet from the aligned VO (vo_timeline.json):
  - src/vo/cues.json      → used by the scenes (every animation trigger as a frame @60fps)
  - docs/VO_CUE_SHEET.md  → human-readable: scene, time, frame, word, what happens

Each event = (phrase, action). Phrases are searched IN ORDER through the VO words, so a repeated
phrase always resolves to the right occurrence. A phrase that is not found stops the build — the cue
sheet can never silently drift from the audio.
"""
import json, re, sys
from pathlib import Path

root = Path(__file__).resolve().parents[2]
tl = json.load(open(root / 'scripts/vo/vo_timeline.json'))
words = tl['words']
FPS = tl['fps']
norm = lambda s: re.sub(r'[।,?.!"“”]', '', s)

# (scene id, title, map/plate style, [(phrase, action), ...])
SCENES = [
 ('S01_hook', 'Hook — loved the King, then took up guns', 'Map3D → satellite', [
   ('आपको बताया गया', '3D map: top view of North America, colonies start rising one by one (Map3D riseStart)'),
   ('आज़ादी के लिए', 'Grand Union flag cloth sweeps over the colonies (FlagFill) + fireworks'),
   ('सत्रह सौ तिरसठ में यही', 'TimelineRuler REWINDS 1776 → 1763 (rewind_tape.wav), flag erased'),
   ('राजा से प्यार', 'Britain map-character pops in, golden crown DropIn, colonies get heart-eyes (RegionEyes mood smile)'),
   ('तेरह साल', 'Timeline ticks 1763 → 1776 fast'),
   ('बंदूक उठा ली', 'Colonies RegionEyes switch to angry; musket_militia PopIn on the coast'),
   ('जान की बाज़ी', 'Camera punch-in + Shake; heartbeat_low.wav'),
 ]),
 ('S02_turn', 'What this video will show', 'parchment', [
   ('आज हम इस पूरी कहानी', 'LineWipe satellite → parchment'),
   ('एक जंगल में चली एक गोली', 'Dotted route DrawLine starts at Jumonville Glen'),
   ('चार July सत्रह सौ छिहत्तर', 'Route reaches Philadelphia, MapPin "4 July 1776"'),
   ('हर बार problem को solve', 'Icons pop along the route: crown, stamp, teacup, musket, quill (stagger 8)'),
   ('problem और बड़ी हो गई', 'Each icon scales up bigger (problem grows) + whoosh'),
 ]),
 ('S03_colonies', 'The 13 colonies', 'parchment', [
   ('शुरुआत करते हैं इन तेरह colonies', 'Camera to Eastern NA; ColonyFill N→S (14 f per state)'),
   ('Atlantic के किनारे', 'NeonOutline on the whole coastal strip'),
   ('New Hampshire से Georgia', 'Labels New Hampshire (top) and Georgia (bottom) PopIn'),
   ('पच्चीस लाख', 'Big counter MapTitle "25,00,000" type-on'),
   ('पाँच लाख अश्वेत', 'Second counter "5,00,000" in a different colour'),
   ('ये number याद रखना', 'Counter pinned to the top-right corner (it returns at the end)'),
   ('ये एक देश थे ही नहीं', 'RegionEyes on every colony, bickering (look ±1, mood angry)'),
   ('अपना पैसा', 'Different coin icons pop on 3 colonies'),
   ('आपस में ही उलझते', 'Two colonies push each other (Shake + small slides)'),
   ('Benjamin Franklin', 'franklin puppet slides in from left'),
   ('Join, or Die', 'Paper3D: pd_join_or_die_1754 floats in'),
   ('एक हो जाओ', 'Snake pieces flash one by one over the colonies'),
   ('नहीं, शुक्रिया', 'StampSlam stamp_rejected on the cartoon'),
   ('Britain के ख़िलाफ़ क्या खड़े होते', 'Colonies turn their backs (eyes look away)'),
 ]),
 ('S04_first_shot', 'Jumonville Glen 1754 → world war', 'parchment 3D-tilt → forest plate → world map', [
   ('अट्ठाईस May', 'Camera to Western PA with tilt 25 + hillshade; MapPin "Jumonville Glen / 28 May 1754"'),
   ('Ohio नदी', 'Ohio River path glows (DrawLine blue)'),
   ('Britain और France, दोनों का दावा', 'Red and blue claim areas pulse over the Ohio country'),
   ('बाईस साल का एक लड़का', 'ZoomBlur into bg_forest_ohio_1754_dawn (ParallaxPlate); washingtonYoung puppet'),
   ('French camp पर हमला', 'Musket volley + MuzzleSmoke + Shake (musket_single.wav ×3)'),
   ('पंद्रह minute', 'clock_15min icon PopIn'),
   ('Jumonville मारा जाता है', 'French officer puppet fallAt'),
   ('George Washington.', 'MapTitle "George Washington" + ArrowLabel to the puppet (beat of silence)'),
   ('British की तरफ़ से', 'Union Flag 1707 PopIn beside Washington'),
   ('World War बन गई', 'Smash-cut to world map; fire spreads from the pin (Territory fills)'),
   ('Europe', 'Europe pulses'),
   ('Caribbean', 'Caribbean pulses'),
   ('हमारे भारत तक', 'India pulses + camera nudge'),
   ("Seven Years' War", "MapTitle \"Seven Years' War\" / (1756–1763) slam"),
 ]),
 ('S05_debt', 'Britain wins, Britain is broke', 'parchment', [
   ('Britain जीत गया', 'Britain map-character, crown, mood smug'),
   ('Treaty of Paris', 'Paper3D doc_treaty_of_paris_1763'),
   ('France ने Canada', 'Territory: Canada smash-fill red'),
   ('छोटी सी दिक़्क़त', 'Britain mood worried'),
   ('बहुत महँगी', 'Coins drain out of Britain'),
   ('क़र्ज़ लगभग दोगुना', 'StampSlam stamp_debt WITH wooden handle wind-up (stamp_slam.wav)'),
   ('ये bill भरेगा कौन', 'Britain eye-darts (look −1/1), mood thinking'),
   ('जवाब था, colonies', 'Britain slides across Atlantic (slideTravel) and glove-points at the colonies; ArrowBob'),
 ]),
 ('S06_proclamation', 'The 1763 line on the mountains', 'parchment + 3D terrain tilt', [
   ('Native American क़बीलों', 'Western frontier flashes; small smoke puffs'),
   ('सात October', 'MapPin-style date card "7 October 1763"'),
   ('Appalachian पहाड़ों', 'Camera tilts 28° over hillshade Appalachians'),
   ('एक line खींच दी गई', 'DrawLine Proclamation Line (dashed red)'),
   ('कोई नई बस्ती नहीं', 'West side shades grey + NeonIcon red X'),
   ('जिस ज़मीन के लिए जंग लड़ी', 'Settler puppets walk to the line'),
   ('उधर जाना मना है', 'Settlers bump into the line and bounce back (comic)'),
 ]),
 ('S07_sugar', 'Sugar Act 1764', 'parchment → satellite', [
   ('फिर आया Sugar Act', 'Britain pulls doc_sugar_act_1764 → ZoomPunch'),
   ('tax बढ़ाया नहीं, घटाया', 'Price tag "6d" PopIn'),
   ('छह pence से सीधा तीन pence', 'StrikeThrough 6d → "3d" pops'),
   ('sab smuggling'.replace('sab', 'सब'), 'Small ships sneak along the coast (smuggling)'),
   ('Navy सख़्ती से वसूली', 'British navy ship icons circle the coast'),
   ('jury ही नहीं', 'Courtroom icon + NeonIcon red X on "jury"'),
   ('जेब तक पहुँच गया', 'Glove reaches across the Atlantic into a colony pocket (gag)'),
 ]),
 ('S08_stamp', 'Stamp Act 1765', 'plates (fast cuts) → map', [
   ('असली बवाल', 'ZoomPunch doc_stamp_act_1765'),
   ('अख़बार', 'CUT bg_print_shop_1765 + StampSlam taxed'),
   ('contract', 'CUT bg_lawyer_office_1765 + StampSlam taxed'),
   ('license', 'CUT bg_courtroom_1765 + StampSlam taxed'),
   ('ताश के पत्तों', 'CUT bg_tavern_1765 + StampSlam taxed on the cards'),
   ('ये हर किसी को चुभा', 'Colonist flips the card table (Fling table + cards, wood_crash_cards.wav)'),
   ('पुतला एक पेड़ पर', 'bg_liberty_tree_1765, effigy swings'),
   ('Liberty Tree', 'MapTitle "Liberty Tree"'),
   ('नौ colonies', 'Map: 9 colonies light up one by one'),
   ('New York में एक साथ मिले', 'Delegates converge on New York; MapPin "Stamp Act Congress / October 1765"'),
   ('No taxation without representation', 'Big serif slogan + NeonIcon Parliament X and coins ✓'),
 ]),
 ('S09_repeal', 'Repeal + Declaratory Act', 'parchment', [
   ('Boycott हुआ', 'Crates stack up at London docks (boycott)'),
   ('अठारह March', 'Date card "18 March 1766"'),
   ('वापस ले लिया गया', 'PaperTear on the Stamp Act'),
   ('एक और क़ानून आया', 'Britain smirks'),
   ('Declaratory Act', 'Paper3D doc_declaratory_act_1766'),
   ('in all cases whatsoever', 'Highlighter on the phrase'),
 ]),
 ('S10_townshend', 'Townshend Acts + troops', 'parchment', [
   ('Townshend Acts', 'doc_townshend_list slides in'),
   ('काँच', 'Glass row: TAXED pops'),
   ('paint', 'Paint row: TAXED pops'),
   ('काग़ज़', 'Paper row: TAXED pops'),
   ('और चाय पर tax', 'Tea row: TAXED pops'),
   ('फिर से ग़ुस्सा', 'Colonies glare'),
   ('Boston में अपनी फ़ौज', 'Redcoat squad SlideIn onto Boston'),
 ]),
 ('S11_massacre', 'Boston Massacre 1770', 'map → King Street plate', [
   ('पाँच March', 'IrisBlob → MapPin "Boston / 5 March 1770"'),
   ('ठंडी रात', 'ZoomBlurIn to bg_king_street_boston_1770_night (ParallaxPlate, snow)'),
   ('धक्का-मुक्की', 'Crowd vs redcoats, crowd talk loop (crowd_angry_loop.wav)'),
   ('बर्फ़ के गोले', 'Fling snowball + ImpactPuff on a soldier'),
   ('गोली चल गई', 'Staggered musket raise → volley, MuzzleSmoke, Shake (musket_volley.wav)'),
   ('पाँच लोग मारे गए', 'Five candles light one by one; music drops'),
   ('Crispus Attucks', 'attucks puppet, respectful hold, name card'),
   ('पहला शहीद', 'Slow push-in, no SFX'),
   ('Paul Revere ने इसकी एक तस्वीर', 'Paper3D pd_revere_bloody_massacre_1770 spins in'),
   ('असल घटना इतनी सीधी नहीं', 'Split: engraving vs chaotic scene'),
   ('viral post', 'Like/share icons burst from the engraving (gag)'),
 ]),
 ('S12_adams', 'John Adams defends the soldiers', 'courtroom plate', [
   ('John Adams ने लड़ा', 'bg_courtroom_1765, johnAdams puppet talking'),
   ('दूसरे President', 'Small portrait card "2nd President"'),
   ('बरी हो गए', 'Soldier puppets mood smile, gavel tap'),
 ]),
 ('S13_tea', 'Tea Act → Boston Tea Party', 'parchment → wharf plate', [
   ('Tea Act', 'doc_townshend_list again: strike Glass, Paint, Paper; MarkerLoop on Tea'),
   ('East India Company', 'Camera swings to India; Bengal pulses'),
   ('चाय बिक नहीं रही', 'Tea chests pile up in a warehouse icon'),
   ('चाय सस्ती भी हो गई', 'Price tag drops'),
   ('उसूल की है', 'Colonist crosses arms (mood smug)'),
   ('सोलह December', 'Date card "16 December 1773" → wharf plate (night)'),
   ('भेस बदलकर', 'teaPartyDisguised ×3 pop in'),
   ('तीन जहाज़ों पर चढ़े', 'Puppets hop up the gangplank'),
   ('Dartmouth', 'Ship label Dartmouth'),
   ('Eleanor', 'Ship label Eleanor'),
   ('Beaver', 'Ship label Beaver'),
   ('तीन सौ बयालीस पेटियाँ', 'Counter to 342 while tea_chest Flings into the water (splash ×N)'),
   ('समुद्र में फेंक दीं', 'Title "Boston Tea Party / 16 December 1773"'),
 ]),
 ('S14_intolerable', 'Intolerable Acts + First Congress', 'flat map → satellite', [
   ('Britain भड़क गया', 'Britain slides in furious (rage shake)'),
   ('Intolerable Acts', 'Paper3D doc_intolerable_acts'),
   ('Boston का port बंद', 'StampSlam stamp_closed on Boston harbour'),
   ('पाँच September', 'Date card "5 September 1774"'),
   ('First Continental Congress', 'ColonyFill orange for 12 colonies (Georgia stays blue); MapTitle'),
   ('छप्पन delegates', 'Counter 56 + delegate chibis converge on Philadelphia'),
 ]),
 ('S15_lexington', 'Lexington & Concord 1775', 'night map → Lexington plate → black', [
   ('अठारह April', 'Night map, lantern_pair PopIn on Boston (church_bell.wav)'),
   ('Concord में रखे हथियार', 'Route Boston → Concord draws'),
   ('Paul Revere घोड़े पर', 'paul_revere_on_horse rides along the route (horse_gallop.wav)'),
   ('myth भी तोड़ दो', 'Myth card "The British are coming!" PopIn'),
   ('अंग्रेज़ ही मानते थे', 'NeonIcon red X over the myth card'),
   ('उन्नीस April की सुबह', 'Dawn plate bg_lexington_green_1775_dawn, militia vs redcoats, long hold'),
   ('एक गोली चली', 'ONE MuzzleSmoke + Shake (musket_single.wav), music cuts'),
   ('आज तक कोई नहीं जानता', 'Question mark fades over the smoke'),
   ('आठ लोग मारे गए', 'Eight markers fade in'),
   ('The shot heard round the world', 'WordReveal quote, then BlackHold 62 f'),
 ]),
 ('S16_washington', 'Second Congress, Washington, Bunker Hill, Olive Branch', 'parchment', [
   ('लौटने का रास्ता बंद', 'Map back, slow push'),
   ('Second Continental Congress', 'MapTitle "Second Continental Congress / 10 May 1775"'),
   ('पंद्रह June', 'continental puppets cascade across the colonies'),
   ('सेनापति बना दिया गया', 'washington (1775) puppet + ArrowLabel "George Washington"'),
   ('इक्कीस साल पहले', 'Flash-back inset: young Washington from S04'),
   ('Bunker Hill', 'bg_breeds_hill_1775 plate, many MuzzleSmoke'),
   ('एक हज़ार से ज़्यादा', 'Counter "1,000+ killed or wounded"'),
   ('Olive Branch Petition', 'Washington holds doc_olive_branch_scroll ("Truce?")'),
   ('राजा ने उसे पढ़ा तक नहीं', 'Camera follows the scroll across the Atlantic; king_george_iii tears it (PaperTear)'),
 ]),
 ('S17_common_sense', 'Common Sense 1776', 'print-shop plate → map', [
   ('दस January', 'Date card "10 January 1776"'),
   ('Common Sense', 'Paper3D pd_common_sense_titlepage_1776'),
   ('छोटा सा द्वीप', 'Map: tiny Britain vs huge continent (scale comparison)'),
   ('और आग लग गई', 'Copies Fling across the colonies; colonies glow'),
 ]),
 ('S18_july', 'July 2 vote, July 4 Declaration', 'parchment', [
   ('दो July', 'TimelineRuler Jul 1 / Jul 2 / Jul 3'),
   ('बारह colonies ने हाँ', 'ballot_raised_fist pops on 12 colonies (New York none)'),
   ('John Adams ने अपनी पत्नी', 'johnAdams puppet writing (quill_scratch.wav)'),
   ('दो July को जश्न', 'Speech-bubble "2 July!"'),
   ('दो दिन से चूक गए', 'Timeline slides to Jul 4 (gag: Adams shrugs)'),
   ('Declaration of Independence', 'FlagFill Grand Union again (callback), DropIn declaration'),
   ('तैंतीस साल के Thomas Jefferson', 'jefferson puppet peeks from behind the document'),
   ('All men are created equal', 'ZoomBlurIn to pd_declaration_engrossed macro; Highlighter (29 chars)'),
 ]),
 ('S19_monticello', 'The twist — Monticello', 'porch plate → wide', [
   ('उसी वक़्त', 'Whip to bg_monticello_porch_1776: martha + patsy'),
   ('दो सौ लोग ग़ुलाम', 'Slow pull-back to bg_monticello_1776 with enslaved puppets; music drops, NO gag'),
   ('पाँच लाख लोगों', 'The pinned counter from S03 returns: "5,00,000"'),
   ('बहुत दूर था', 'Hold 200 f'),
 ]),
 ('S20_payoff_close', 'Answer + Part 2', 'parchment', [
   ('तो सत्रह सौ तिरसठ में', 'Recap: icons for every law pop along a timeline (20 f apart)'),
   ('किसी एक tax से नहीं', 'Icons fade; one word "फ़ैसला" in the centre'),
   ('फ़ैसला कौन करेगा', 'Crown vs colonies tug-of-war'),
   ('और क़रीब आ गईं', 'Colonies slide together, NeonOutline as one shape'),
   ("Franklin का साँप", 'Join, or Die snake pieces snap together into one'),
   ('जीतना नहीं', 'War map: red vs blue, mini flags pop'),
   ('France इस जंग में', 'Bourbon flag pops over France'),
   ('अगले part में', 'Part 2 teaser card'),
   ('subscribe कर लो', 'Subscribe button + end card'),
 ]),
]

def find(phrase, start):
    p = [norm(x) for x in phrase.split()]
    for i in range(start, len(words) - len(p) + 1):
        if all(norm(words[i + k]['w']) == p[k] for k in range(len(p))):
            return i
    raise SystemExit(f'Phrase not found after word {start}: {phrase}')

tc = lambda s: f'{int(s // 60)}:{s % 60:05.2f}'
out, md = [], ['# VO CUE SHEET — every animation pinned to its word (60 fps)\n',
               f'VO length: **{tc(tl["durationSec"])}** = **{round(tl["durationSec"] * FPS)} frames**. '
               'File: `public/assets/vo/vo_master.mp3` (loudness-normalised to −14 LUFS).\n',
               'Built by `scripts/vo/build_cues.py` from `scripts/vo/vo_timeline.json`. Frame = absolute frame in the full video.\n']
pos = 0
for sid, title, style, events in SCENES:
    evs = []
    for phrase, action in events:
        i = find(phrase, pos)
        w = words[i]
        evs.append({'phrase': phrase, 'action': action, 'frame': w['f'], 'sec': w['start'], 'wordIndex': i})
        pos = i + 1
    out.append({'id': sid, 'title': title, 'style': style, 'events': evs})
# scene boundaries: a scene starts at its first cue, ends where the next begins
for k, s in enumerate(out):
    s['from'] = s['events'][0]['frame'] if k else 0
    s['to'] = out[k + 1]['events'][0]['frame'] if k + 1 < len(out) else round(tl['durationSec'] * FPS) + 60
for s in out:
    md.append(f"\n## {s['id']} — {s['title']}\nFrames **{s['from']}–{s['to']}** ({tc(s['from']/FPS)}–{tc(s['to']/FPS)}, {round((s['to']-s['from'])/FPS,1)} s) · style: {s['style']}\n")
    md.append('| Time | Frame | Local f | On the word | Animation |\n|---|---|---|---|---|')
    for e in s['events']:
        md.append(f"| {tc(e['sec'])} | {e['frame']} | {e['frame'] - s['from']} | {e['phrase']} | {e['action']} |")
(root / 'src/vo').mkdir(exist_ok=True)
json.dump({'fps': FPS, 'totalFrames': round(tl['durationSec'] * FPS) + 60, 'scenes': out}, open(root / 'src/vo/cues.json', 'w'), ensure_ascii=False, indent=1)
(root / 'docs/VO_CUE_SHEET.md').write_text('\n'.join(md) + '\n')
print('scenes', len(out), 'events', sum(len(s['events']) for s in out))
