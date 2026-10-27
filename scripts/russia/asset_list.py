"""
Russia video — every image asset that is generated outside the repo (ChatGPT image tool).
Single source of truth for: docs/russia/PROMPTS_IMAGES.md, docs/russia/paste/*.txt and the code's
pending-asset placeholders (src/russia/assets.ts reads the same file names).

Fields: folder, file, style, size, priority (A = needed, B = nice), used (chapter / beat), prompt, attach
Everything else on screen (host face/arms/legs, maps, routes, year tags, stamps, counters, flags,
loop wheel, chapter scroll, candles' smoke, fire, snow, 3D globe, Sputnik, extruded 3D countries) is
built in code.
"""

STYLES = {
    'P': """STYLE P (character): 2D illustrated character for an animated history YouTube channel, in a "peg doll" cartoon style. The whole figure is ONE soft rounded capsule like a wooden peg doll or a bowling pin: a very large, perfectly round head (45% of the total height) sitting directly on the collar with NO neck; below it a smooth rounded body that widens slightly toward a flat, gently rounded bottom edge. NO LEGS, NO FEET, NO SHOES: the clothing simply ends at the rounded bottom of the body. Body width at the bottom about 1.1 times the head width. Historically accurate clothing of the era named in the CHARACTER line, drawn ONTO the body shape with fine detail (embroidery, fur trims, buttons, belts, sashes follow the body's curve). Soft painterly shading with gentle gradients, light from the top left, subtle paper grain inside the colours, a thin-to-medium dark-brown outline (#3A2A20) around the silhouette and main shapes. Warm pale skin (#F3DCC4) unless stated. Hair, beards and fur drawn with fine strands. Hats are large and overhang the head. BLANK FACE: the face is completely smooth skin with NO eyes, NO eyebrows, NO nose, NO mouth, NO blush. Beards and moustaches are allowed: they frame the LOWER edge of the face, and the skin from the forehead down to just above the moustache stays completely blank. NO ARMS and NO HANDS anywhere (arms are added in animation). Front view, body very slightly turned to the right. Centred, the bottom of the body touching the bottom edge of the canvas, 6% empty margin left, right and top. Transparent background, PNG, no ground shadow, no text, no border, square 1024x1024.""",
    'H': """STYLE H (horse): the same painterly peg-doll toy style as the characters (soft painterly shading, light from the top left, subtle paper grain, thin dark-brown outline #3A2A20). A cartoon horse in exact SIDE VIEW facing RIGHT, chunky toy proportions (big head, short round barrel body, fairly short legs, flowing mane and tail), saddle and saddle blanket on its back, NO RIDER. The top of the saddle sits exactly 42% down from the top of the canvas and the horse is centred horizontally. Transparent background, no ground shadow, no text, wide 1536x1024.""",
    'C': """STYLE C (portrait card): a painted head-and-shoulders portrait used as a card in a history explainer. The subject looks slightly to the right. Rich classical oil-painting brushwork, warm museum lighting, plain dark warm background with a soft vignette. A NORMAL painted face with full features (eyes, nose, mouth): this is a painting, NOT a peg doll. ORIGINAL artwork: do not copy any existing painting or photograph. No frame, no text, no signature, no border. Fills the whole canvas, portrait 1024x1280.""",
    'C20': """STYLE C20 (20th-century portrait card): a painted head-and-shoulders portrait used as a card in a history explainer. The subject looks slightly to the right. Painted in a muted sepia, warm-grey and faded-ink palette that suggests an old photograph, but clearly a PAINTING with visible brushwork (not a photo). A NORMAL painted face with full features. ORIGINAL artwork: do not copy any existing photograph. Plain soft grey-brown background. No frame, no text, no signature, no border. Fills the whole canvas, portrait 1024x1280.""",
    'B': """STYLE B (background): photorealistic cinematic matte painting, gentle atmospheric haze, shallow depth of field on the far background, rich but slightly desaturated colours, film-still quality. Keep important elements inside the middle band (15% to 85% of the height) and leave the lower third open floor/ground where cartoon characters will stand. ABSOLUTELY NO PEOPLE, no animals, no text, no letters, no modern objects unless the era is modern. Wide 1536x1024, full scene (not transparent).""",
    'R': """STYLE R (3D-rendered prop): a stylised 3D-rendered object for an animated history video: semi-realistic, slightly toy-like proportions, rendered like a high-end Blender Cycles / Pixar product shot, soft studio lighting from the top left, gentle ambient occlusion, softly bevelled edges, believable materials (wood, iron, gold, cloth, parchment) with a light hand-painted texture. 3/4 view from slightly above unless stated. Centred, filling 80% of the frame, transparent background PNG, NO ground shadow, NO text, NO letters or numbers, square 1024x1024.""",
    'M': """STYLE M (3D map token): a tiny 3D-rendered isometric miniature like a premium board-game piece, viewed from 3/4 above, soft studio light from the top left, gentle ambient occlusion, bright clean colours, centred, filling 75% of the frame, transparent background, NO ground shadow, NO text, square 1024x1024.""",
}

ASSETS = []
def A(folder, file, style, prompt, used, pri='A', size=None, attach=None):
    ASSETS.append(dict(folder=folder, file=file, style=style, prompt=prompt, used=used, pri=pri, size=size, attach=attach))

STYLE_SHEET = 'chars/_style_reference_sheet.png (the America one) + chars/_style_sheet_russia.png once approved'

# ---------------------------------------------------------------- 0. style sheet + host
A('chars', '_style_sheet_russia.png', 'P',
  'A character model sheet on a plain light-grey background showing SIX peg-doll characters standing in a row at the same scale, in the exact style of the attached sheet: a Viking chieftain of 860 with a red braided beard and a blue cloak; a Russian boyar of 1550 in a very tall cylindrical brown fur hat and a long gold-brocade kaftan with a long dark beard; a Tsar in a gold Cap of Monomakh with sable fur rim; an 18th-century Russian empress with powdered hair and an ermine mantle; a 1917 factory worker in a flat cap and padded jacket; a Soviet soldier of 1943 in a khaki tunic and side cap. Every figure is one rounded capsule: very large round head (45% of the height) directly on the collar, no neck, smooth body widening slightly to a flat rounded bottom, NO LEGS, NO FEET, NO ARMS, NO HANDS. All faces completely blank. Wide 1536x1024, light-grey background (not transparent).',
  'style anchor for every Russia character', size='1536x1024', attach='chars/_style_reference_sheet.png (America)')
A('chars', 'host_narrator.png', 'P',
  "CHARACTER: the channel's funny narrator-host (fictional, modern, not historical): a cheerful Indian traveller-historian. An OVERSIZED brown fur ushanka hat (Russian trapper hat) with both ear flaps sticking out sideways like little wings, slightly too big for him; a long saffron-orange knitted scarf wrapped twice round the collar with one end hanging down the front; a mustard-yellow knee-length kurta-style coat with a mandarin collar and a row of small wooden toggle buttons; a brown leather satchel strap across the body; a small red Indian-flag-free pin (just a plain round red badge) on the chest. Friendly, slightly goofy silhouette. Warm medium-brown skin (#C68B59).",
  'host on every grey-stage beat, bottom-right on maps (code adds face, lip-flap, blinks, noodle arms, gloves, stick legs, pointer)')
A('props', 'host_pointer_staff.png', 'R',
  "A long thin wooden pointer staff, like a teacher's pointer crossed with a pilgrim's staff: straight polished light wood, a small red wool tassel tied just below the top, a brass ferrule at the bottom tip. Perfectly VERTICAL, the staff fills 95% of the canvas height. Portrait 512x1536.",
  "host's prop (the reference host's spear) — pointing, dropped flat at chapter breaks", size='512x1536')

# ---------------------------------------------------------------- 1. RUS (862–1240)
A('chars', 'slav_elder.png', 'P', 'CHARACTER: an East Slav tribal elder of the 9th century: a long white beard, a cream linen tunic with red embroidered bands at the collar, a brown fur-trimmed wool cloak pinned at the shoulder, a low round fur cap.', 'Ch1 — tribes argue, "come and rule us"')
A('chars', 'finn_elder.png', 'P', 'CHARACTER: a Finnic forest-tribe elder of the 9th century: a grey-brown wool kaftan hung with small bronze pendants and a beaded belt, a pointed felt hood, a short braided grey beard.', 'Ch1 — tribes argue')
A('chars', 'balt_elder.png', 'P', 'CHARACTER: a Baltic tribal elder of the 9th century: a dark-green wool cloak held by a round amber-and-bronze brooch, long loose sandy hair to the shoulders, a short reddish beard, a woven sash.', 'Ch1 — tribes argue')
A('chars', 'rurik_viking.png', 'P', 'CHARACTER: Rurik, a Viking (Varangian) chieftain of 862: an open-faced round iron helmet WITHOUT horns and without a nose guard, a long red braided beard, a chainmail shirt over a dark-red tunic, a royal-blue cloak with a gold-and-bronze brooch, a round wooden shield painted red and white slung on his back (rim visible behind the shoulders).', 'Ch1 — steps off the longship')
A('chars', 'viking_warrior.png', 'P', 'CHARACTER: a Varangian warrior of the 9th century: an open-faced conical iron helmet WITHOUT horns, a blond beard, a padded leather jerkin over a grey tunic, a round shield painted yellow and black on his back.', 'Ch1 — crew of the longship, route to Kyiv', pri='B')
A('chars', 'vladimir_prince.png', 'P', 'CHARACTER: Prince Vladimir of Kyiv in 988: a gold cap with a thick sable-fur rim, a long red silk kaftan with heavy gold embroidery and a jewelled belt, a long drooping brown moustache and a short trimmed beard.', 'Ch1 — choosing a religion (988)')
A('chars', 'envoy_kievan.png', 'P', 'CHARACTER: a Kievan envoy of 987 back from a long journey: a dusty forest-green travelling kaftan, a brown fur hat, a leather satchel, a short brown beard. (Used four times with different tints.)', 'Ch1 — four envoys report')
A('chars', 'batu_khan.png', 'P', 'CHARACTER: Batu Khan, Mongol ruler of 1237: a richly embroidered deep-blue silk deel robe with a gold belt, a round fur-brimmed hat with a gold top ornament and a red plume, a thin long moustache and a small goatee, warm tan skin (#D9A877).', 'Ch1 end / Ch2 — the Khan, yarlyk, Ugra')
A('chars', 'mongol_warrior.png', 'P', 'CHARACTER: a Mongol cavalry warrior of 1237: lamellar leather armour in brown and red, a pointed iron helmet with a fur rim and a short plume, a bow case and quiver at the hip, warm tan skin (#D9A877).', 'Ch1 end — horde, Ch2 — Ugra standoff')
A('chars', 'rus_prince.png', 'P', 'CHARACTER: a Rus prince of the 13th century bowing to the Khan: a crimson cloak over a gold-trimmed blue kaftan, a round fur-rimmed cap, a long brown beard.', 'Ch2 — goes to the Khan for the yarlyk')

# ---------------------------------------------------------------- 2. MONGOLS (1240–1480)
A('chars', 'alexander_nevsky.png', 'P', 'CHARACTER: Prince Alexander Nevsky in 1242, young: a pointed steel helmet (shishak) with gold trim, a chainmail shirt, a scarlet cloak, a short light-brown beard.', 'Ch2 — Battle on the Ice (rides horse_brown)')
A('chars', 'teutonic_knight.png', 'P', 'CHARACTER: a Teutonic (German crusader) knight of 1242: a white surcoat with a plain black cross over chainmail, a chainmail hood with an open round face opening, a white cloak.', 'Ch2 — knights fall through the ice')
A('chars', 'moscow_soldier.png', 'P', 'CHARACTER: a Muscovite foot soldier of 1380–1480: a pointed steel helmet, a quilted red tegilyai coat over chainmail, a short dark beard.', 'Ch2 — Kulikovo, Ugra standoff')
A('chars', 'afanasy_nikitin.png', 'P', "CHARACTER: Afanasy Nikitin, a merchant from Tver travelling to India around 1469: a dusty brown kaftan with a red sash, a tall brown felt hat, a big cloth travel bundle tied on his back (visible above both shoulders), a full brown beard, sun-tanned skin.", 'Ch2 — India detour')
A('chars', 'ivan_iii.png', 'P', 'CHARACTER: Ivan III, Grand Prince of Moscow, about 1480: an older man with a long grey-brown beard, the gold Cap of Monomakh (gold filigree cap with a sable rim and a small gold cross on top), a heavy gold-brocade robe with a jewelled collar.', 'Ch2 end — "Moscow अब बॉस"')

# ---------------------------------------------------------------- 3. IVAN (1533–1598)
A('chars', 'ivan_iv_young.png', 'P', 'CHARACTER: Ivan IV at his coronation in 1547, aged 16: no beard, short dark-brown hair under the gold Cap of Monomakh (gold filigree, sable rim, small gold cross on top), a gold-brocade coronation robe with a wide jewelled collar (barmy).', 'Ch3 — coronation, Kazan, good early years')
A('chars', 'ivan_iv_child.png', 'P', 'CHARACTER: Ivan IV as a small boy of about 6 in 1536: a tiny figure (head even bigger than usual, 50% of the height), a little gold-brocade kaftan, a fur-rimmed cap that is much too big and slips over one side.', 'Ch3 — boy prince ignored by the boyars')
A('chars', 'ivan_iv_terrible.png', 'P', 'CHARACTER: Ivan IV ("the Terrible") in 1570, gaunt and grim: a long pointed dark beard, a black monk-like robe with thin gold trim, a tall dark sable hat, a heavy gold cross pendant.', 'Ch3 — Oprichnina, Novgorod, 1581')
A('chars', 'boyar_a.png', 'P', 'CHARACTER: a fat Russian boyar of the 1530s: a VERY tall cylindrical brown fur hat (gorlatnaya), a long red-and-gold brocade kaftan with long hanging sleeves folded back, a long bushy black beard.', 'Ch3 — boyars bully the boy; Ch5 — beard snip')
A('chars', 'boyar_b.png', 'P', 'CHARACTER: a thin Russian boyar of the 1530s: a VERY tall cylindrical grey fur hat, a long green-and-gold brocade kaftan, a very long grey beard reaching the waist.', 'Ch3 — boyars; Ch5 — beard line')
A('chars', 'boyar_a_beardless.png', 'P', 'CHARACTER: EXACTLY the same boyar as the attached image (same hat, same red-and-gold kaftan, same size and position on the canvas) but his beard has just been shaved off: smooth chin, a little patch of stubble, nothing else changed.', 'Ch5 — after the SNIP', attach='chars/boyar_a.png')
A('chars', 'oprichnik.png', 'P', 'CHARACTER: an oprichnik (Ivan IV\'s black guard) of 1565: an all-black monk-like cassock with a black hood up, a black sash, a thin black beard, pale skin. Sinister but cartoon, not gory.', 'Ch3 — black riders (rides horse_black)')

# ---------------------------------------------------------------- 4. TROUBLES (1598–1613)
A('chars', 'boris_godunov.png', 'P', 'CHARACTER: Tsar Boris Godunov in 1601: a dark trimmed beard, the gold Cap of Monomakh, a dark-red velvet robe with gold embroidery, a worried look in his posture.', 'Ch4 — crowned, then famine')
A('chars', 'polish_hussar.png', 'P', 'CHARACTER: a Polish winged hussar of 1610: an open-faced shiny lobster-tail helmet, polished breastplate, a leopard-skin cloak over one shoulder, a tall frame of white-and-brown feather wings rising from the back above the head, a big curled moustache.', 'Ch4 — Polish garrison in the Kremlin')
A('chars', 'kuzma_minin.png', 'P', 'CHARACTER: Kuzma Minin, a meat-merchant of Nizhny Novgorod in 1612: a plain brown wool kaftan with a rope belt, a soft brown cap, a bushy brown beard, a leather money pouch at the belt.', 'Ch4 — the comeback from below')
A('chars', 'dmitry_pozharsky.png', 'P', 'CHARACTER: Prince Dmitry Pozharsky in 1612: a pointed steel helmet with a gold band, chainmail under a crimson cloak, a dark beard.', 'Ch4 — the comeback from below')
A('chars', 'militia_volunteer.png', 'P', 'CHARACTER: a Russian townsman volunteer of 1612: a rough grey homespun kaftan, a rope belt, a fur cap with ear flaps tied up, a short beard.', 'Ch4 — volunteer army marches (crowd)')
A('chars', 'michael_romanov.png', 'P', 'CHARACTER: Michael Romanov elected Tsar in 1613, aged 16, nervous: no beard, a gold Cap of Monomakh that is a little too big for him, a gold-and-white brocade robe.', 'Ch4 — new dynasty')

# ---------------------------------------------------------------- 5. PETER (1682–1725)
A('chars', 'peter_great.png', 'P', 'CHARACTER: Peter the Great in 1700: noticeably TALLER and slimmer than a normal peg doll (the body is longer, head 38% of the height), a dark-green Preobrazhensky regiment coat with red cuffs and gold buttons, a black tricorne, short dark-brown hair to the ears (no wig), a small dark moustache, no beard.', 'Ch5 — throughout')
A('chars', 'peter_carpenter.png', 'P', 'CHARACTER: Peter the Great disguised as a shipyard carpenter in Holland, 1697: tall and slim like the attached Peter, a plain red shirt, a brown leather apron, a wide-brimmed black hat, small moustache.', 'Ch5 — "Pyotr Mikhailov" at Zaandam', attach='chars/peter_great.png')
A('chars', 'swedish_soldier.png', 'P', 'CHARACTER: a Swedish Carolean soldier of 1709: a blue coat with yellow cuffs, a black tricorne, a buff leather belt.', 'Ch5 — Great Northern War, Poltava')
A('chars', 'serf_worker.png', 'P', 'CHARACTER: a Russian serf labourer of 1703: a rough off-white linen shirt with a rope belt, grey wool trousers tucked in (body only), a battered felt cap, a tangled beard, tired posture.', 'Ch5 — building St Petersburg; Ch6 — serfs; Ch7 — freed serfs')
A('chars', 'serf_woman.png', 'P', 'CHARACTER: a Russian peasant woman of the 18th–19th century: a red sarafan dress over a white blouse with embroidered sleeves, a patterned headscarf tied under the chin.', 'Ch6/Ch7 — serfs, crowds', pri='B')

# ---------------------------------------------------------------- 6. CATHERINE (1762–1796)
A('chars', 'catherine_great.png', 'P', 'CHARACTER: Catherine the Great in 1762: powdered grey-white hair in a neat updo, a small diamond crown, a silver-white silk gown, a wide pale-blue sash of the Order of St Andrew, an ermine mantle with black spots over the shoulders.', 'Ch6 — throughout')
A('chars', 'peter_iii.png', 'P', 'CHARACTER: Emperor Peter III in 1762: a thin young man in a tight Prussian-style blue uniform coat with red cuffs, a white powdered wig with side curls, a black ribbon queue.', 'Ch6 — toy soldiers, coup')
A('chars', 'russian_guard.png', 'P', 'CHARACTER: a Russian Preobrazhensky guardsman of 1762: a dark-green coat with red cuffs, a tall brass-fronted grenadier mitre cap, white cross-belt.', 'Ch6 — guards behind Catherine')
A('chars', 'potemkin.png', 'P', "CHARACTER: Prince Grigory Potemkin in 1787: a big burly man, a white powdered wig, a red-and-gold general's coat covered in star-shaped orders, one eye slightly narrowed.", 'Ch6 — Potemkin villages')
A('chars', 'pugachev.png', 'P', 'CHARACTER: Yemelyan Pugachev, the Cossack rebel of 1773: a thick black beard, a crude home-made gold paper crown slightly crooked on a fur cap, a red Cossack kaftan, a sabre belt.', 'Ch6 — rebellion')

# ---------------------------------------------------------------- 7. 1812 & REFORMS
A('chars', 'napoleon.png', 'P', 'CHARACTER: Napoleon Bonaparte in 1812: a black bicorne hat worn sideways, a grey greatcoat open over a dark-green chasseur uniform with a white waistcoat, short dark hair, slightly plump. Small and confident.', 'Ch7 — invasion, Moscow burns (rides horse_white)')
A('chars', 'french_soldier.png', 'P', 'CHARACTER: a French line infantryman of 1812: a tall black shako with a brass plate and red pompom, a dark-blue coat with white lapels and red cuffs, white cross-belts.', 'Ch7 — Grande Armée, retreat in snow')
A('chars', 'russian_soldier_1812.png', 'P', 'CHARACTER: a Russian infantryman of 1812: a black shako, a dark-green coat with red collar, white cross-belts, a grey greatcoat roll over one shoulder.', 'Ch7 — Borodino')
A('chars', 'decembrist_officer.png', 'P', 'CHARACTER: a young Russian guards officer of 1825: a dark-green uniform with a high red collar and gold epaulettes, a black bicorne with a white plume, curly sideburns.', 'Ch7 — Paris dream, Decembrists')
A('chars', 'alexander_ii.png', 'P', 'CHARACTER: Tsar Alexander II in 1861: balding with neat side hair, big mutton-chop sideburns joined to a thick moustache, a white military tunic with gold epaulettes and a blue sash.', 'Ch7 — frees the serfs, 1881')

# ---------------------------------------------------------------- 8. LAST TSAR
A('chars', 'nicholas_ii.png', 'P', 'CHARACTER: Tsar Nicholas II in 1905: short brown hair, a neatly trimmed brown beard and moustache, a plain khaki military tunic with small shoulder boards, no hat.', 'Ch8 — throughout (crown is a separate prop)')
A('chars', 'alexandra.png', 'P', 'CHARACTER: Empress Alexandra in 1916: auburn hair in a high Edwardian updo, a long white lace dress with a high collar, a long pearl necklace.', 'Ch8 — Rasputin whispers')
A('chars', 'rasputin.png', 'P', 'CHARACTER: Grigori Rasputin in 1916: long black hair parted in the middle, a huge bushy black beard, a black peasant tunic belted with a cord, a large wooden-and-silver cross pendant. Mysterious but cartoon.', 'Ch8 — palace')
A('chars', 'worker_1905.png', 'P', 'CHARACTER: a St Petersburg factory worker of 1905–1917: a flat cloth cap, a grey padded jacket, a scarf, a short beard.', 'Ch8 — Bloody Sunday, bread line, revolution (crowd)')
A('chars', 'worker_woman_1917.png', 'P', 'CHARACTER: a Petrograd working woman of 1917: a dark wool coat, a grey woollen headscarf, holding nothing.', 'Ch8 — bread line becomes a crowd')
A('chars', 'tsarist_soldier_1914.png', 'P', 'CHARACTER: a Russian Imperial Army private of 1914: a khaki gymnastyorka tunic, a khaki peaked cap, a rolled grey greatcoat over the shoulder, a leather belt.', 'Ch8 — WWI, soldiers refuse to fire')
A('chars', 'red_guard_1917.png', 'P', 'CHARACTER: a Bolshevik Red Guard of October 1917: a black leather jacket, a cloth cap with a red ribbon, a red armband.', 'Ch8 — October, civil war (Reds)')
A('chars', 'white_officer_1919.png', 'P', 'CHARACTER: a White Army officer of 1919: a khaki officer tunic with gold shoulder boards, a white-banded officer cap, a neat moustache.', 'Ch8 — civil war (Whites)', pri='B')

# ---------------------------------------------------------------- 9. STALIN
A('chars', 'stalin.png', 'P', 'CHARACTER: Joseph Stalin in 1937: thick swept-back black-grey hair, a thick black moustache, a plain grey-khaki high-collared tunic with breast pockets, no badges.', 'Ch9 — throughout')
A('chars', 'kolkhoz_farmer.png', 'P', 'CHARACTER: a Soviet collective-farm peasant of 1932: a patched grey shirt, a cloth cap, a thin worried look in the posture, a thin beard.', 'Ch9 — collectivisation, famine')
A('chars', 'soviet_soldier_ww2.png', 'P', 'CHARACTER: a Red Army soldier of 1943: a khaki tunic with a leather belt, a khaki side cap (pilotka) with a small red star, a rolled greatcoat over one shoulder.', 'Ch9 — Stalingrad, Berlin')
A('chars', 'german_soldier_ww2.png', 'P', 'CHARACTER: a German Wehrmacht soldier of 1942: a field-grey uniform, a grey steel helmet, a winter scarf, NO insignia, NO symbols, NO eagle, NO swastika anywhere.', 'Ch9 — invasion, Stalingrad', pri='A')
A('chars', 'german_general_surrender.png', 'P', 'CHARACTER: a defeated German general in February 1943: a long grey greatcoat, a grey peaked cap, a tired unshaven face area (stubble only on the chin), NO insignia, NO symbols, NO swastika anywhere.', 'Ch9 — surrender at Stalingrad')

# ---------------------------------------------------------------- 10. TODAY
A('chars', 'gagarin_spacesuit.png', 'P', 'CHARACTER: Yuri Gagarin in 1961 in his orange flight spacesuit with a white rounded helmet pushed back so the blank face is fully visible, a small red patch on the chest with no letters, a wide smile implied by posture.', 'Ch10 — first man in space')
A('chars', 'soviet_navy_officer.png', 'P', 'CHARACTER: a Soviet submarine officer of 1962: a dark-navy officer uniform with gold buttons, a white-topped peaked officer cap, sweating (small drops on the cap brim), a moustache. (Used three times with tints.)', 'Ch10 — the submarine (Arkhipov + 2 officers)')
A('chars', 'soviet_citizen_1980s.png', 'P', 'CHARACTER: a Soviet citizen of 1985 queueing: a grey wool overcoat, a brown fur ushanka hat, a string shopping bag (avoska) hanging from the coat button.', 'Ch10 — empty shelves, queues')
A('chars', 'russian_1990s.png', 'P', 'CHARACTER: a Russian man in the chaotic 1990s: a shiny maroon tracksuit jacket, a thin gold chain, short buzz-cut hair.', 'Ch10 — 1990s chaos', pri='B')

# ---------------------------------------------------------------- HORSES (two gallop frames each — swapped every 4 frames in animation)
for horse, desc, used in [
    ('horse_brown', 'a chestnut-brown horse with a dark mane, red saddle blanket with a gold border', 'Nevsky, Rus riders'),
    ('horse_black', 'a coal-black horse with a black mane, a black saddle blanket, with a carved wooden dog\'s-head emblem and a twig broom tied behind the saddle (folk-art, cartoon, NOT gory)', 'oprichniki'),
    ('horse_steppe', 'a small sturdy dun-coloured Mongol steppe pony with a short dark mane, a red-and-blue felt saddle blanket and a wooden saddle', 'Mongol riders'),
    ('horse_white', 'an elegant white-grey horse with a red-and-gold saddle blanket', 'Napoleon, Peter, generals'),
]:
    A('horses', f'{horse}_gallop_a.png', 'H', f'{desc}. GALLOP FRAME A: all four legs stretched out (front legs reaching forward, back legs kicked back), mane and tail flying back.', used)
    A('horses', f'{horse}_gallop_b.png', 'H', f'EXACTLY the same horse as the attached frame A, same size, same canvas position, same saddle height. GALLOP FRAME B: all four legs gathered under the belly, head slightly lower, mane and tail lifting.', used, attach=f'horses/{horse}_gallop_a.png')

# ---------------------------------------------------------------- PORTRAIT CARDS
for f, st, who, used, *rest in [
    ('card_anna_porphyrogenita', 'C', 'Anna Porphyrogenita, Byzantine princess of 988, sister of Emperor Basil II: dark hair under a jewelled Byzantine crown with pearl pendants, a purple-and-gold silk robe.', 'Ch1 — marriage deal'),
    ('card_anastasia', 'C', 'Anastasia Romanovna, first wife of Ivan IV, about 1555: a young gentle woman with a pearl-embroidered kokoshnik headdress over a white veil, a deep-red brocade dress.', 'Ch3 — her death (black ribbon added in code)'),
    ('card_tsarevich_ivan', 'C', 'Tsarevich Ivan Ivanovich, about 1580: a young man of 26 with a short dark beard, a fur-trimmed brocade kaftan and a sable hat.', 'Ch3 — 1581'),
    ('card_false_dmitry', 'C', 'False Dmitry I, about 1605: a young man with reddish hair, no beard, a broad face with a wart beside the nose, a Polish-style hussar collar under a Russian fur cloak.', 'Ch4 — three identical cards, FAKE stamps'),
    ('card_tsarevich_alexei', 'C', 'Tsarevich Alexei Petrovich, son of Peter the Great, about 1715: a thin pale young man with long brown hair, a dark European coat with a white cravat.', 'Ch5 — 1718'),
    ('card_sophie_princess', 'C', 'Sophie of Anhalt-Zerbst (the future Catherine the Great) aged 15 in 1744: a young German princess with powdered hair, a pale-pink silk gown, a small pearl choker.', 'Ch6 — "Sophie · Germany से"'),
    ('card_voltaire', 'C', 'Voltaire, French philosopher, about 1770: an old thin man with a sly smile, a long white curled wig, a brown velvet coat.', 'Ch6 — letters to philosophers', 'B'),
    ('card_alexander_ii', 'C', 'Tsar Alexander II about 1870: balding with neat side hair, big mutton-chop sideburns joined to a thick moustache, a white military tunic with gold epaulettes and a blue sash.', 'Ch7 — 1861 serfs freed, 1881'),
    ('card_nicholas_ii', 'C20', 'Tsar Nicholas II about 1905: trimmed brown beard and moustache, a dark-green military tunic with a few orders.', 'Ch8 — the last Tsar'),
    ('card_romanov_family', 'C20', 'a formal family group of seven in 1913: a bearded father in a military tunic, a mother in a white dress and a wide hat, four daughters in white dresses with long hair, one small boy in a sailor suit. Everyone calm and formal. Landscape 1280x1024 instead of portrait.', 'Ch8 — family card; cellar (seven candles)'),
    ('card_lenin', 'C20', 'Vladimir Lenin in 1917: bald, with a short reddish goatee and moustache, a dark suit and tie, a determined look.', 'Ch8 — October 1917; Ch9 — death 1924'),
    ('card_stalin', 'C20', 'Joseph Stalin about 1937: thick swept-back hair, a thick moustache, a plain grey military-style tunic.', 'Ch9 — cards: purge, pact'),
    ('card_hitler', 'C20', 'Adolf Hitler in 1939, the German dictator, painted in a cold grey palette: side-parted dark hair, a small toothbrush moustache, a plain brown jacket, NO armband, NO symbols, NO swastika.', 'Ch9 — 1939 pact, the torn card (if the tool refuses, skip it: the code shows a silhouette card)'),
    ('card_gagarin', 'C20', 'Yuri Gagarin in 1961: a young smiling man with short dark hair in an officer\'s uniform cap, a very warm big smile.', 'Ch10 — 108 minutes'),
    ('card_arkhipov', 'C20', 'Vasily Arkhipov, Soviet naval officer, 1962: a calm man in his thirties, dark hair, a navy officer jacket.', 'Ch10 — the man who said no'),
    ('card_rakesh_sharma', 'C20', 'Rakesh Sharma, Indian Air Force pilot and cosmonaut in 1984: a young Indian man with a neat moustache, a blue flight suit, a confident smile. Full colour, NOT sepia.', 'Ch10 — "सारे जहाँ से अच्छा"'),
    ('card_gorbachev', 'C20', 'Mikhail Gorbachev about 1987: a bald man with the well-known birthmark on the top of his head, glasses, a dark suit and tie. Full muted colour.', 'Ch10 — Glasnost'),
    ('card_yeltsin', 'C20', 'Boris Yeltsin about 1999: a big man with thick white-grey hair, a heavy face, a dark suit and tie.', 'Ch10 — resigns on TV (shown inside a TV set)'),
    ('card_putin', 'C20', 'Vladimir Putin about 2000: a slim man with thinning light-brown hair, a dark suit and tie, a neutral expression. Full muted colour.', 'Ch10 — the strong man again'),
]:
    A('cards', f + '.png', st, 'SUBJECT: ' + who, used, pri=rest[0] if rest else 'A',
      size='1280x1024' if 'Landscape' in who else '1024x1280')

# ---------------------------------------------------------------- BACKGROUNDS
for f, d, used, *rest in [
    ('bg_forest_river_862', 'Northern Europe, the year 862, misty early morning. A wide calm river curving through dense pine and birch forest, a rough wooden landing jetty on the near bank, low grey sky.', 'Ch1 — tribes, Rurik arrives'),
    ('bg_kyiv_hall_988', 'Kyiv, 988, warm firelight. The great wooden hall of a Kievan prince: carved and painted wooden pillars, heavy roof beams, bear and wolf furs on the floor, bronze oil lamps, an EMPTY raised platform at the back centre (no throne).', 'Ch1 — Vladimir chooses a religion'),
    ('bg_hagia_sophia_interior', 'Constantinople, 10th century. The interior of the Hagia Sophia: the vast golden dome floating on a ring of windows, shafts of golden light streaming down, gold mosaics without readable figures, marble columns, incense haze.', 'Ch1 — "स्वर्ग या ज़मीन?"'),
    ('bg_kyiv_burning_1240', 'Kyiv, December 1240, dusk. A wooden-walled hill city with a few golden church domes, heavy black smoke and orange fire glow rising from behind the walls, snow on the ground, a dark red sky.', 'Ch1 — collapse #1'),
    ('bg_steppe_horde_camp', 'The Golden Horde, 13th century, bright day. Endless green-gold steppe, a large camp of round white felt yurts, one big golden yurt in the centre, banners on poles (plain colours, no symbols), blue sky with flat white clouds.', 'Ch2 — yarlyk'),
    ('bg_frozen_lake_1242', 'Lake Peipus, April 1242, cold overcast morning. A wide frozen lake of grey-white ice with dark cracks, a low snowy forest shoreline far away, grey sky.', 'Ch2 — Battle on the Ice'),
    ('bg_kulikovo_field_1380', 'Kulikovo Field, September 1380, early autumn morning mist. A wide open field of yellowing grass, a small river and a birch grove at the edge, low sun through the mist.', 'Ch2 — Kulikovo'),
    ('bg_ugra_river_1480', 'The Ugra River, autumn 1480. A NARROW river running straight across the middle of the frame from left to right, both banks open meadow with autumn trees, a grey autumn sky. Seen from slightly above so BOTH banks are visible: the far bank across the upper-middle, the near bank in the lower third.', 'Ch2 — the great standoff'),
    ('bg_cathedral_1547', 'Moscow Kremlin, Cathedral of the Dormition, 1547. Interior: a towering golden iconostasis wall of icons (faces too small to read), hundreds of candles, painted pillars, warm golden light, an open stone floor.', 'Ch3 — coronation'),
    ('bg_kremlin_hall_1530s', 'Moscow Kremlin, 1530s. A low vaulted palace chamber with every surface painted in red, gold and green ornament, one thick central pillar, small deep windows, an EMPTY space at the back centre for a throne.', 'Ch3 — boyars and the boy; dark throne room (tinted in code)'),
    ('bg_red_square_1561', 'Moscow, 1561, bright winter day. Red Square: the red-brick Kremlin wall and towers along the left side, a snowy open square, wooden market stalls in the distance. The RIGHT THIRD of the image is open sky and snow (a cathedral is added there in animation).', 'Ch3 — St Basil\'s builds up'),
    ('bg_snow_road_night', 'Russia, winter 1565, night. A snowy road running into the distance through a birch forest, deep blue moonlight, a pale moon, cold mist.', 'Ch3 — oprichniki ride'),
    ('bg_village_1601', 'A Russian log-cabin village in the summer of 1601, wrong weather: grey sky, snow on the green fields and on the rooftops, frozen crops, a wooden church in the distance.', 'Ch4 — famine'),
    ('bg_kremlin_exterior_1612', 'Moscow, autumn 1612. The red-brick Kremlin walls and towers seen from across the Moskva river, golden church domes inside, smoke from a few fires, grey-gold autumn light, an open riverbank in the foreground.', 'Ch4 — liberation; Ch8/9/10 — Kremlin establishing'),
    ('bg_shipyard_zaandam_1697', 'Zaandam, Holland, 1697, bright day. A busy shipyard: a half-built wooden ship hull on a slipway, timber stacks, ropes and pulleys, a windmill in the distance, an open plank yard in the foreground.', 'Ch5 — Peter the carpenter'),
    ('bg_peter_court_1698', 'Moscow, 1698. A palace reception hall half way between Russian and European: a painted vaulted ceiling, new European chairs pushed against the walls, tall windows, a polished open floor.', 'Ch5 — beard snip'),
    ('bg_neva_swamp_1703', 'The Neva river mouth, May 1703. A flat grey marsh with reeds, standing water, a wide grey river, rows of freshly driven wooden piles, low grey sky.', 'Ch5 — St Petersburg founded'),
    ('bg_st_petersburg_1725', 'St Petersburg, 1725. A granite river embankment, the gilded needle spire of the Peter and Paul Cathedral across the river, new baroque palaces in pastel colours, ships with furled sails.', 'Ch5 — the new capital'),
    ('bg_dark_study_1718', 'A dark 18th-century study at night: a heavy desk with papers and a single candle, a dark wood-panelled wall, a barred window.', 'Ch5 — Alexei'),
    ('bg_palace_room_1762', 'St Petersburg, 1762. A rococo palace room in pale blue, white and gold, a tall window with daylight, a polished parquet floor that is open in the lower third.', 'Ch6 — Peter III and toy soldiers, the coup'),
    ('bg_riverbank_1787', 'The Dnieper river, 1787, sunny. A wide river on the left half with a calm surface, a grassy empty bank on the right half, a few poplar trees, open land behind (empty — facades are added in animation).', 'Ch6 — Potemkin villages'),
    ('bg_volga_steppe_1773', 'The lower Volga steppe, 1773, stormy evening. Flat grassland to the horizon, the wide Volga, a dramatic orange-grey storm sky.', 'Ch6 — Pugachev', 'B'),
    ('bg_borodino_1812', 'Borodino, 7 September 1812. A rolling field covered in white and grey cannon smoke, earthen redoubts, a burning village and a church in the distance, broken wheels.', 'Ch7 — Borodino'),
    ('bg_moscow_skyline_1812', 'Moscow, September 1812, seen from a hill. A panorama of the city: the Kremlin towers, the Ivan the Great bell tower, dozens of golden and green onion domes, wooden houses, an evening sky. (Fire is added in animation.)', 'Ch7 — Moscow burns'),
    ('bg_winter_retreat_1812', 'Russia, November 1812. A flat endless snowy plain under a heavy grey blizzard, a frozen road with an abandoned overturned cart and a broken cannon wheel half buried in snow.', 'Ch7 — the retreat'),
    ('bg_paris_1814', 'Paris, 1814, spring. The Seine with an old stone bridge, Notre-Dame cathedral in the distance, cream stone buildings, blue sky. NO Eiffel Tower.', 'Ch7 — officers see Paris (thought bubble)', 'B'),
    ('bg_senate_square_1825', 'St Petersburg, Senate Square, 14 December 1825. A wide snowy square, the Bronze Horseman statue of Peter the Great on its rock, a yellow-and-white classical Senate building, grey winter sky.', 'Ch7 — Decembrists'),
    ('bg_canal_street_1881', 'St Petersburg, 1 March 1881, winter. A snowy embankment street beside a frozen canal with an iron railing, lamp posts, pastel buildings, grey sky.', 'Ch7 — Alexander II assassinated'),
    ('bg_palace_square_1905', 'St Petersburg, January 1905. The huge snowy Palace Square in front of the green-and-white Winter Palace, the Alexander Column, grey sky.', 'Ch8 — Bloody Sunday'),
    ('bg_palace_interior_1916', 'Tsarskoye Selo, 1916, evening. A dim, rich imperial drawing room with dark wood, icons in a corner lit by a small red lamp, heavy curtains, a fireplace.', 'Ch8 — Rasputin'),
    ('bg_petrograd_street_1917', 'Petrograd, February 1917, cold morning. A snowy city street with a closed bakery shopfront (blank sign), lamp posts, tram rails, grey sky.', 'Ch8 — bread line → revolution'),
    ('bg_cellar_1918', 'A dark empty basement room in Yekaterinburg, July 1918: striped wallpaper, a vaulted low ceiling, a single bare light bulb, a closed wooden door. Sombre, nothing violent.', 'Ch8 — the family\'s end (shown only as candles)'),
    ('bg_industrial_1930s', 'The USSR in 1932. A new steel plant under construction on an open plain: smokestacks, scaffolding, cranes, blast furnaces, red sunset sky, a dirt road in the foreground.', 'Ch9 — industrialisation'),
    ('bg_stalingrad_ruins_1942', 'Stalingrad, winter 1942. A ruined city street under snow: burnt-out brick apartment blocks with empty windows, rubble, smoke, grey sky.', 'Ch9 — street fighting'),
    ('bg_submarine_1962', 'Inside a Soviet diesel submarine in October 1962: a cramped control room, red emergency lighting, pipes and valves everywhere, round dials with NO readable numbers, condensation and heat haze.', 'Ch10 — Arkhipov'),
    ('bg_soviet_shop_1985', 'A Soviet grocery shop in 1985: long EMPTY shelves, a bare counter, an abacus on the counter, pale green walls, fluorescent light.', 'Ch10 — economy hollow'),
    ('bg_apartment_1999', 'A Russian apartment living room on 31 December 1999, night: a patterned carpet hanging on the wall, a small decorated New Year tree, a wooden sideboard; an EMPTY low table in the centre (a TV is added in animation).', 'Ch10 — Yeltsin resigns on TV'),
    ('bg_chernobyl_1986', 'Chernobyl, 26 April 1986, night. A big industrial nuclear power plant with a tall red-and-white striped ventilation chimney, one reactor building broken open with smoke and an eerie blue glow, dark sky.', 'Ch10 — Chernobyl'),
    ('bg_berlin_wall_1989', 'Berlin, November 1989, night. A long grey concrete wall covered in colourful abstract graffiti shapes (NO readable words), floodlights, a crack running down one section.', 'Ch10 — the wall falls'),
]:
    A('bg', f + '.png', 'B', d, used, pri=rest[0] if rest else 'A', size='1536x1024')

# ---------------------------------------------------------------- PROPS (3D-rendered)
for f, d, used, *rest in [
    ('viking_longship', 'A Viking longship in exact side view facing RIGHT: a long low dark-oak clinker hull, a carved dragon-head prow, a row of round shields along the side (red, white, yellow), a single square sail with broad red and white vertical stripes, oars out. Wide 1536x1024.', 'Ch1 — elastic pop on the river; route to Kyiv'),
    ('oar_wooden', 'A single long wooden ship oar, diagonal from bottom-left to top-right.', 'Ch1 — "Rus = rowers"'),
    ('icon_card_mosque', 'A small domed mosque with one slender minaret, sand-coloured stone, a green dome, standing on a round grassy base.', 'Ch1 — envoy card 1 (style M)'),
    ('icon_card_synagogue', 'A small medieval stone synagogue with a round arched window and a low tiled roof, standing on a round grassy base.', 'Ch1 — envoy card 2 (style M)'),
    ('icon_card_latin_church', 'A small Romanesque Latin church with a square bell tower and a red tiled roof, standing on a round grassy base.', 'Ch1 — envoy card 3 (style M)'),
    ('hagia_sophia_model', 'A miniature model of the Hagia Sophia in Constantinople as it was in 988 (NO minarets): the great central dome with half-domes, warm stone, golden light glowing from the windows, on a round base.', 'Ch1 — envoy card 4 (style M)'),
    ('wine_jug', 'A rustic clay wine jug with a handle, a little red wine splashing from the spout.', 'Ch1 — "पीना Rus की ख़ुशी है"'),
    ('throne_wooden', 'A carved dark-wood medieval throne with a high back, carved bear and bird motifs, a red cushion, front 3/4 view.', 'Ch1 — Vladimir'),
    ('throne_gold', 'A Russian Tsar\'s throne: gilded and carved, covered in ivory panels and jewels, a high back crowned by a double-headed eagle, a red velvet cushion, front view. Big and too large for a child.', 'Ch3/Ch4 — boy Ivan, empty throne, Michael'),
    ('cap_of_monomakh', 'The Cap of Monomakh: a gold filigree cap with a thick dark sable fur rim, studded with rubies, emeralds and pearls, topped by a small gold cross.', 'Ch2/Ch3 — crown pops; Ch4'),
    ('double_headed_eagle', 'A golden Byzantine-Russian double-headed eagle emblem with spread wings and two crowned heads, metallic gold, flat front view, no shield on its chest.', 'Ch2 end — Ivan III'),
    ('yarlyk_scroll', 'An unrolled parchment scroll (Mongol yarlyk) with lines of illegible vertical script and a big round red wax seal at the bottom, rolled ends top and bottom. Portrait 1024x1536.', 'Ch2 — permission slip'),
    ('money_bag', 'A fat brown leather money bag tied at the top with a string, gold coins spilling out at the base. (A cartoon smirk is added in animation.)', 'Ch2 — Moscow collects the tax'),
    ('tribute_sack', 'A burlap sack bulging with sable furs and silver coins, tied at the top.', 'Ch2 — tribute flies to the Horde'),
    ('kremlin_tower', 'A miniature Moscow Kremlin tower: red brick with white trim, a tall green tent roof and a small gold spire on top, standing on a short piece of crenellated red wall.', 'map city token for Moscow (style M)'),
    ('onion_church_small', 'A small white Russian church with one golden onion dome and a gold cross, on a round grassy base.', 'map city tokens (Kyiv, Novgorod, Vladimir) (style M)'),
    ('st_basils_cathedral', 'St Basil\'s Cathedral in Moscow: the cluster of nine colourful swirled onion domes (red-green, blue-white, gold, striped), red brick and white trim, front view, on a small patch of snowy ground. Portrait 1024x1280.', 'Ch3 — builds up dome by dome'),
    ('pointed_staff', 'Ivan the Terrible\'s staff: a long dark wooden staff with a sharp iron point and a carved ivory knob on top, vertical. Portrait 512x1536.', 'Ch3 — 1581'),
    ('volcano_erupting', 'A small toy-like volcano erupting: a brown cone, orange lava glow at the top, a big grey ash cloud billowing up.', 'Ch4 — Huaynaputina (on a mini-globe)'),
    ('shears_giant', 'A pair of giant iron tailor\'s shears, open, diagonal.', 'Ch5 — beard snip'),
    ('beard_token', 'The 1698 Russian beard-tax token: a small copper coin showing an embossed beard and moustache on one face, slightly worn, 3/4 tilt showing the edge. NO readable letters.', 'Ch5 — beard tax (spins in 3D in code)'),
    ('carpenter_hammer', 'A 17th-century carpenter\'s hammer with a wooden handle and an iron head, diagonal.', 'Ch5 — shipyard'),
    ('ship_russian_1700', 'A Russian navy sailing frigate of 1700 in side view facing RIGHT, three masts with white sails, green-and-gold hull, NO flags. Wide 1536x1024.', 'Ch5 — Peter builds a navy'),
    ('palace_facade_baroque', 'A long pastel-yellow and white baroque palace facade (front view, flat, like a theatre flat) with tall windows and columns, a green roof. Wide 1536x1024.', 'Ch5 — St Petersburg builds up'),
    ('toy_soldiers', 'A small group of five painted wooden toy soldiers in blue Prussian uniforms standing in a row on the floor.', 'Ch6 — Peter III plays'),
    ('crown_catherine', 'The Great Imperial Crown of Russia: two silver half-domes covered in diamonds, a row of pearls between them, a big red spinel and a small cross on top.', 'Ch6 — the crown; Ch8 — slides off Nicholas'),
    ('potemkin_facade_front', 'A row of three pretty painted wooden village house fronts (only the flat fronts, like theatre scenery), with flower boxes and smiling painted windows. Wide 1536x1024.', 'Ch6 — Potemkin village front'),
    ('potemkin_facade_back', 'The BACK of the same row of flat wooden house fronts: bare planks, diagonal wooden props and scaffolding holding them up, nothing behind. Wide 1536x1024.', 'Ch6 — the reveal behind', 'A'),
    ('royal_barge', 'A royal 18th-century river barge in side view facing RIGHT, gilded, with a red-and-gold canopy, oars out. Wide 1536x1024.', 'Ch6 — Catherine sails past'),
    ('books_quill', 'A small stack of old leather-bound books with a quill pen in an inkwell on top.', 'Ch6 — the "enlightened" empress'),
    ('letter_sealed', 'A folded 18th-century letter with a red wax seal, slightly tilted.', 'Ch6 — letters fly to Voltaire'),
    ('napoleon_bicorne', 'Napoleon\'s black felt bicorne hat with a small red-white-blue cockade, side view.', 'map token for Napoleon\'s route'),
    ('cannon_1812', 'An early-19th-century field cannon on a wooden carriage, side view facing RIGHT, dark bronze barrel.', 'Ch7 — Borodino, Decembrists'),
    ('chains_broken', 'A short length of heavy iron chain with one link snapped open, pieces flying apart.', 'Ch7 — serfs freed', 'B'),
    ('carriage_1881', 'A black closed imperial carriage of 1881 on a sleigh-like chassis, side view facing RIGHT, gold trim, no horses.', 'Ch7 — 1881'),
    ('warship_1904', 'A Russian pre-dreadnought battleship of 1904, side view facing RIGHT, grey hull, two yellow funnels, gun turrets, NO flags.', 'Ch8 — sunk by Japan (bubbles in code)'),
    ('church_banner', 'An Orthodox procession banner on a tall pole: a gold-fringed cloth with a gold cross on deep red, no faces, no text.', 'Ch8 — Bloody Sunday march'),
    ('bread_loaf', 'A round dark rye bread loaf.', 'Ch8 — bread lines'),
    ('factory_chimneys', 'A small Soviet factory with three tall brick chimneys puffing grey smoke, red brick walls.', 'Ch9 — chimneys pop across the USSR (style M)'),
    ('tractor_1930', 'A 1930s Soviet wheeled tractor, red bodywork, big steel rear wheels, 3/4 view.', 'Ch9 — collectivisation'),
    ('grain_sack', 'A bulging burlap grain sack tied at the top, a little grain spilling.', 'Ch9 — grain flows out of Ukraine/Kazakhstan'),
    ('tank_t34', 'A Soviet T-34 tank of 1943 in 3/4 view, olive-green, a red star on the turret.', 'Ch9 — map tokens (style M)'),
    ('tank_german', 'A German Panzer IV tank of 1942 in 3/4 view, dark grey, NO crosses, NO symbols, NO numbers.', 'Ch9 — map tokens (style M)'),
    ('pact_document', 'A typed 1939 diplomatic treaty document on two sheets with two signatures and two wax seals, lines of illegible text, slightly tilted. Portrait 1024x1280.', 'Ch9 — torn in two / burns'),
    ('rocket_vostok', 'The Soviet Vostok rocket on the launch pad, white and grey with the four flared side boosters, vertical. Portrait 768x1536, NO letters.', 'Ch10 — Gagarin launch (flame + smoke in code)'),
    ('submarine_foxtrot', 'A Soviet Foxtrot-class diesel submarine in side view facing RIGHT, black hull, on the surface, NO numbers. Wide 1536x1024.', 'Ch10 — off Cuba'),
    ('reactor_building', 'The Chernobyl reactor 4 building after the explosion, a broken roof with smoke, a red-and-white striped chimney beside it.', 'Ch10 — map token (style M)'),
    ('tv_crt_1999', 'A late-1990s CRT television set with a silver-grey plastic body and a dark empty screen, front 3/4 view.', 'Ch10 — Yeltsin on TV (picture added in code)'),
    ('oil_barrel', 'A blue steel oil barrel with a little shine.', 'Ch10 — oil money'),
    ('rouble_banknotes', 'A fanned stack of colourful generic paper banknotes with NO readable numbers or words, tied with a paper band.', 'Ch10 — 1998 default'),
    ('subscribe_bell', 'A shiny golden bell, slightly tilted as if ringing.', 'Close — subscribe', 'B'),
]:
    style = 'M' if '(style M)' in used else 'R'
    pri = rest[0] if rest and rest[0] else 'A'
    size = '1536x1024' if 'Wide 1536x1024' in d else ('1024x1536' if 'Portrait 1024x1536' in d else ('512x1536' if '512x1536' in d else ('768x1536' if '768x1536' in d else ('1024x1280' if '1024x1280' in d else None))))
    A('props', f + '.png', style, d, used.replace(' (style M)', ''), pri=pri, size=size)

A('docs', 'primary_chronicle_page.png', 'R', 'An open medieval manuscript book (the Russian Primary Chronicle): two pages of dense illegible Old Cyrillic-style handwriting in brown ink, red decorated initial letters, a small painted miniature of boats on a river in one corner, worn vellum. Wide 1536x1024.', 'Ch1 — "सबसे पुरानी chronicle"', size='1536x1024')
A('docs', 'rurik_family_tree.png', 'R', 'A parchment family tree: an old oak tree drawn in brown ink with many small round empty medallions on its branches, a few gold leaves, worn edges. NO names, NO letters. Portrait 1024x1280.', 'Ch3 — the last leaf turns grey and falls', size='1024x1280')
