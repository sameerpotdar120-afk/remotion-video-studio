"""Cues, captions, chapter pauses and Short windows for the Six-Day War video, from the creator's VO.

    python3 -I tools/sixday_timing.py <whisper_words.json>

The VO (public/sixday/audio/vo_115.wav) is the creator's ElevenLabs read sped up 1.15x as asked (599.4 s).
faster-whisper "medium" word times are aligned onto the script's own words (dynamic programming on string similarity,
in a band around the diagonal). The long video breathes at every blank line of the script (a chapter or bridge
break): PAUSE seconds of silence are inserted there, so every time in timing.json is on the long video's clock.
No pause falls inside a Short (each Short is one block of the script), so the Shorts play the VO exactly as read.
"""
import difflib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "sixday" / "edit" / "timing.json"
SCRIPT = (ROOT / "public" / "sixday" / "script_elevenlabs.txt").read_text()
VO_LEN = 599.42
LEAD = 0.6       # silence before the first word
PAUSE = 1.4      # added at each blank line
TAIL = 2.2       # after the last word
SHORTS = [  # (name, first words, last words) of each Short's block
    ("tiran", "Red Sea के कोने में", "पूरा Middle East जल उठा।"),
    ("ghante", "एक जंग जो छह दिन चली,", "तीन घंटों का नतीजा थी।"),
    ("gaza", "ग़ाज़ा में उन्नीस सौ सड़सठ में भारत के", "शांति की टोपी पहने हुए थे।"),
    ("golan", "गोलान हाइट्स के लिए", "ज़्यादा क़ीमती होती है।"),
    ("naqsha", "इज़राइल का नक़्शा सिर्फ़ छह दिन", "का सवाल आज भी खुला है।"),
    ("fleet", "स्वेज़ नहर में उन्नीस सौ सड़सठ में", "अपने इंजन से घर लौट पाए।"),
]
NUM = [("उन्नीस सौ सड़सठ", "1967"), ("उन्नीस सौ अड़तालीस", "1948"), ("उन्नीस सौ छप्पन", "1956"), ("उन्नीस सौ सत्तावन", "1957"),
       ("उन्नीस सौ अड़सठ", "1968"), ("उन्नीस सौ पचहत्तर", "1975"), ("उन्नीस सौ बयासी", "1982"), ("उन्नीस सौ तिहत्तर", "1973"),
       ("उन्नीस सौ उन्यासी", "1979"), ("दो हज़ार पाँच", "2005"), ("दो सौ बयालीस", "242"), ("सात बजकर पैंतालीस मिनट", "7:45"),
       ("आठ सौ", "800"), ("एक हज़ार", "1,000"), ("पंद्रह से बीस हज़ार", "15 से 20 हज़ार"), ("दो सौ", "200"),
       ("चौदह", "14"), ("पंद्रह", "15"), ("अठारह", "18"), ("बाईस", "22"), ("तीस", "30"), ("साठ", "60")]
LATIN = {"west": "वेस्ट", "bank": "बैंक", "news": "न्यूज़", "report": "रिपोर्ट", "un": "यूएन", "red": "रेड", "sea": "सी", "straits": "स्ट्रेट्स",
         "of": "ऑफ", "tiran": "तिरान", "middle": "मिडल", "east": "ईस्ट", "reservists": "रिज़र्विस्ट", "airbase": "एयरबेस", "jet": "जेट",
         "radar": "रडार", "runway": "रनवे", "air": "एयर", "force": "फोर्स", "operation": "ऑपरेशन", "focus": "फोकस", "battalions": "बटालियन",
         "division": "डिवीजन", "old": "ओल्ड", "city": "सिटी", "paratroopers": "पैराट्रूपर्स", "bunker": "बंकर", "ceasefire": "सीज़फायर",
         "great": "ग्रेट", "bitter": "बिटर", "lake": "लेक", "timsah": "तिमसाह", "crew": "क्रू", "club": "क्लब", "olympics": "ओलंपिक्स",
         "yellow": "येलो", "fleet": "फ्लीट", "security": "सिक्योरिटी", "council": "काउंसिल", "resolution": "रिज़ॉल्यूशन", "land": "लैंड",
         "for": "फॉर", "peace": "पीस"}
CUES = {  # name: a phrase from the script (first occurrence after the previous cue unless (phrase, n))
    "hook": "तुम ग़ाज़ा,", "golan0": "गोलान और", "wb0": "West Bank का", "chhah0": "छह दिन की", "naqshe0": "नक़्शे पर लिखे", "june67": "जून उन्नीस",
    "israel0": "एक तरफ़ इज़राइल।", "egypt0": "दूसरी तरफ़ इजिप्ट,", "jordan0": "जॉर्डन और सीरिया।", "syria0": "सीरिया। और", "faisla0": "फ़ैसला पहले",
    "teen0": "तीन घंटे में ही", "aaj0": "आज, नक़्शे पर,", "kahani0": "पूरी कहानी।",
    "ch1": "पहले नक़्शा समझो।", "patli1": "एक पतली सी ज़मीन", "patli2": "सबसे पतली जगह", "km15": "पंद्रह किलोमीटर।", "tank1": "एक टैंक आधे",
    "egypt1": "नीचे इजिप्ट।", "sinai1": "सिनाई का बड़ा", "fauj1": "अरब दुनिया की", "jordan1": "पूरब में जॉर्डन,", "wb1": "West Bank और पुराना",
    "jeru1": "पुराना यरूशलम। और", "syria1": "ऊपर सीरिया,", "golan1": "गोलान की ऊँची", "n1948": "उन्नीस सौ अड़तालीस", "n1956": "उन्नीस सौ छप्पन",
    "golabari1": "सीमा पर गोलाबारी आम बात", "garmi": "गर्मियों तक,", "teeno1": "तीनों तरफ़ फ़ौज",
    "ch2": "मई उन्नीस सौ सड़सठ में सब", "report1": "एक Report से।", "soviet": "सोवियत यूनियन", "egypt2": "इजिप्ट को बताया", "syriab": "सीरिया की सीमा पर फ़ौज",
    "galat": "ग़लत निकली।", "der": "देर हो चुकी", "may14": "चौदह मई से", "sinai2": "सिनाई में उतरने", "cairo": "काहिरा की सड़कों", "parade": "टैंकों की परेड",
    "unef1": "शांति सेना तैनात", "unefn": "यू-एन-ई-एफ़। और", "bharat1": "भारत का एक बड़ा", "may18": "अठारह मई को", "hatana1": "सेना हटाना शुरू कर",
    "redsea1": "Red Sea के किनारे", "chowki": "चौकी ख़ाली", "sharm": "शर्म अल-शेख़।", "gali0": "बहुत पतली गली",
    "s1": "Red Sea के कोने", "gali1": "समुंदरी गली है,", "jung1": "पूरी जंग शुरू", "straits": "Straits of Tiran।", "sinai3": "इजिप्ट का सिनाई,", "saudi": "सऊदी अरब।",
    "eilat": "बंदरगाह था, ईलात।", "rasta": "सिर्फ़ एक रास्ता:", "yahigali": "यही गली।", "asia": "एशिया और अफ़्रीका", "tanker": "तेल के टैंकर,",
    "n1957b": "उन्नीस सौ सत्तावन में ही", "elaan1": "जंग का ऐलान", "may22": "बाईस मई", "nasser": "नासिर ने", "nahi_guzrenge": "तिरान से नहीं",
    "ulti": "उल्टी गिनती", "may30": "तीस मई को", "pact": "रक्षा समझौता किया।", "june4": "चार जून को इज़राइल", "faisla1": "जंग का फ़ैसला ले",
    "june5a": "पाँच जून की सुबह, सिर्फ़", "jal": "जल उठा।",
    "ch3": "अगले दो हफ़्ते", "reservists": "Reservists थे।", "aam": "आम लोग,", "dukaan": "दुकान, खेत", "ruk": "रुक गया था।", "june1": "एक जून को",
    "dayan": "मोशे दयान", "sawaal": "एक ही सवाल", "intezaar": "इंतज़ार करें,", "vaar": "पहला वार", "raat": "चार जून की रात", "bridge2": "और अब वो सुबह,",
    "s2": "एक जंग जो छह दिन चली,", "teen2": "पहले तीन घंटे में ही हो गया था। पाँच", "t745": "सात बजकर", "airbase": "Airbase पर", "gasht": "गश्त ख़त्म",
    "zameen1": "ज़मीन पर खड़े थे।", "tabhi": "तभी इज़राइल के Jet", "bhumadhya": "भूमध्य सागर", "neeche": "इतने नीचे", "radar": "Radar उन्हें",
    "runway": "पहले Runway", "khade2": "फिर ज़मीन पर खड़े", "ekek": "एक-एक करके।", "lehar1": "पहली लहर", "n200": "दो सौ इजिप्शियन", "khatam1": "ज़मीन पर ही ख़त्म",
    "lehar2": "दूसरी लहर", "dopahar": "दोपहर तक", "jordsyr": "जॉर्डन और सीरिया की Air", "focus": "Operation Focus।", "aasman": "आसमान हाथ से",
    "chhatri": "बिना छतरी", "panch": "अगले पाँच दिन", "nateeja": "तीन घंटों का नतीजा",
    "bridge3": "पर उसी सुबह, ग़ाज़ा", "bharatki": "वो कहानी भारत की",
    "s3": "ग़ाज़ा में उन्नीस सौ सड़सठ में भारत", "n14a": "चौदह जवान शहीद हुए, और भारत", "lada": "लड़ा ही नहीं", "unef3": "ये जवान UN", "battalions": "Battalions बारी-बारी",
    "neeli": "नीली टोपी,", "rokna": "लड़ने से रोकना।", "hatana3": "सेना हटाना शुरू किया।", "jahaaz3": "अपने जहाज़ का", "ghar": "घर लौटने",
    "chhid": "तभी पाँच जून को जंग", "phans": "दो फ़ौजों के बीच", "n14b": "भारत के चौदह जवान शहीद हुए, और कई", "brazil": "ब्राज़ील का", "sachar": "कैप्टन विजय",
    "kisi": "उन्होंने किसी की", "topi": "शांति की टोपी",
    "ch5": "पाँच जून की सुबह ही", "teendiv": "तीन Division,", "uttar": "उत्तर में,", "arish": "अल-अरीश", "beech": "बीच में अबू", "sharon": "एरियल शेरॉन",
    "toda": "घेरा और तोड़ा।", "dakshin": "और दक्षिण में,", "tank5": "टैंक थे, मोर्चे", "sirpar": "सिर पर आसमान", "june6": "छह जून को",
    "khali": "सिनाई ख़ाली करो।", "jaldi": "जल्दबाज़ी में", "phansi": "तंग रास्तों पर", "mitla": "मितला और गिद्दी", "pehle_pahunch": "पहले पहुँच चुके",
    "june8": "आठ जून तक", "suez": "स्वेज़ नहर के किनारे", "teenguna": "तीन गुना बड़ा", "chardin": "चार दिन में",
    "ch6": "उसी पहले दिन,", "topen": "जॉर्डन की तोपें", "telaviv": "तेल अवीव के", "koonch": "West Bank की तरफ़ कूच", "banta": "बँटा हुआ शहर",
    "naya": "नया शहर", "purana": "और पुराना शहर,", "deewar": "अपनी दीवारों", "jordanpaas": "अंदर, जॉर्डन के पास।", "sadak": "सड़क-सड़क", "june7": "सात जून को",
    "para": "Paratroopers Old City", "nadi": "जॉर्डन नदी के पार", "jenin": "जेनिन से", "hebron": "हेब्रोन तक,", "bahas": "उसकी बहस",
    "bridge4": "अब बचा था", "uparsy": "ऊपर, सीरिया।", "paanchve": "पाँचवें दिन।",
    "s4": "गोलान हाइट्स के लिए", "aakhri": "आख़िरी दिन", "upar": "जो ऊपर बैठा,", "maalik": "नीचे का मालिक।", "pathaar": "पथरीला पठार",
    "galil": "नीचे गलील", "sagar": "गलील का सागर,", "meetha": "मीठा पानी।", "pehle4": "सड़सठ से पहले सीरिया", "gaon": "गाँव नीचे।",
    "golabari4": "गोलाबारी आम थी।", "dhara": "जॉर्डन नदी की कुछ", "june9": "नौ जून को", "chadhai": "सीधी चढ़ाई,", "bunker": "सीरिया के Bunker।",
    "june10": "दस जून को गोलान", "ceasefire": "Ceasefire लग", "aajbhi": "आज भी गोलान", "apna": "अपना मानता", "unchai": "कुछ सौ मीटर",
    "keemti": "ज़्यादा क़ीमती",
    "s5": "इज़राइल का नक़्शा सिर्फ़", "teenguna5": "तीन गुना से भी ज़्यादा बड़ा", "subah5": "पाँच जून की सुबह, इज़राइल", "km15b": "पंद्रह किलोमीटर। दस",
    "shaam": "दस जून की शाम", "sinaigaza": "इजिप्ट से सिनाई", "wbj": "जॉर्डन से West", "golan5": "सीरिया से गोलान।", "kabza": "क़ब्ज़े का इलाक़ा",
    "keemat": "क़ीमत?", "il_loss": "इज़राइल के करीब", "arab_loss": "अरब देशों के,", "n1520": "पंद्रह से बीस", "hamesha": "ये नक़्शा हमेशा",
    "n1982a": "उन्नीस सौ बयासी में", "sinaiback": "सिनाई इजिप्ट को लौट गया। दो", "n2005": "दो हज़ार पाँच", "gazaout": "ग़ाज़ा से हट",
    "khula": "आज भी खुला",
    "bridge5": "पर इस जंग का सबसे अजीब", "nahar0": "एक नहर में।",
    "s6": "स्वेज़ नहर में उन्नीस", "n15a": "पंद्रह जहाज़ फँसे,", "aathsaal": "आठ साल तक", "beechraaste": "नहर के बीच रास्ते", "band": "नहर बंद कर",
    "duba": "जहाज़ डुबा कर", "n15b": "पंद्रह जहाज़ अंदर", "gbl": "Great Bitter Lake में,", "timsah": "Lake Timsah में।", "kinara_il": "एक किनारे इज़राइल",
    "kinara_eg": "दूसरे किनारे", "beechye": "बीच में ये जहाज़।", "mahine": "महीने बीते,", "club": "एक Club", "olympics": "Olympics भी",
    "reth": "पीली रेत", "yellow": "Yellow Fleet।", "bharat6": "भारत से यूरोप", "africa": "पूरे अफ़्रीका का", "khuli": "जून उन्नीस सौ पचहत्तर में",
    "do6": "सिर्फ़ दो जहाज़", "ghar6": "घर लौट पाए।",
    "ch8": "जंग ख़त्म हुई,", "nov22": "बाईस नवंबर", "res242": "Resolution दो सौ", "lautao": "ज़मीन लौटाओ,", "haq": "सुरक्षित सीमा", "lfp": "Land for Peace।",
    "khartoum": "ख़ार्तूम में", "na1": "न शांति,", "na2": "न मान्यता,", "na3": "न बातचीत।", "teenna": "तीन ना कहा", "n1973": "उन्नीस सौ तिहत्तर",
    "baatcheet": "उसी जंग के बाद", "n1979": "उन्नीस सौ उन्यासी में", "n1982b": "उन्नीस सौ बयासी तक",
    "close": "तो ये थी वो जंग,", "galiband": "एक गली बंद", "teenghante": "तीन घंटे में आसमान", "nayanaqsha": "एक नया नक़्शा", "sawaal9": "पर जो सवाल",
    "saath": "साठ साल बाद", "agli": "इसलिए अगली बार", "gaza9": "ग़ाज़ा, गोलान या", "yaad": "याद रखना:", "chhahdin9": "उन छह दिनों", "comment": "कमेंट में बताओ:",
    "hairaan": "हैरान कर गया?",
}
FIX: dict = {}


def norm(s: str) -> str:
    s = re.sub(r"[^\w]", "", s.lower().replace("़", "").replace("ँ", "ं"))
    return LATIN.get(s, s)


def tokens(text: str):
    """Words of the script, with the index of the paragraph block (blank-line separated) each belongs to."""
    out = []
    for b, block in enumerate(re.split(r"\n\s*\n", text.strip())):
        out += [(w, b) for w in block.split()]
    return out


def main() -> None:
    tw = tokens(SCRIPT)
    words = [w for w, _ in tw]
    ww = json.load(open(sys.argv[1]))
    a, b = [norm(w) for w in words], [norm(w[2]) for w in ww]
    n, m = len(a), len(b)
    BAND = 140
    INF = 1e9
    D = [[INF] * (m + 1) for _ in range(n + 1)]
    for j in range(m + 1):
        D[0][j] = j * 1.0
    for i in range(1, n + 1):
        c = round(i * m / n)
        lo, hi = max(0, c - BAND), min(m, c + BAND)
        if lo == 0:
            D[i][0] = i * 1.0
        for j in range(max(1, lo), hi + 1):
            s = difflib.SequenceMatcher(None, a[i - 1], b[j - 1]).ratio()
            D[i][j] = min(D[i - 1][j - 1] + (1 - s) * 2, D[i - 1][j] + 1, D[i][j - 1] + 1)
    i, j, match = n, m, {}
    while i > 0 and j > 0:
        s = difflib.SequenceMatcher(None, a[i - 1], b[j - 1]).ratio()
        if abs(D[i][j] - (D[i - 1][j - 1] + (1 - s) * 2)) < 1e-9:
            if s > 0.45:
                match[i - 1] = (ww[j - 1][0], ww[j - 1][1])
            i -= 1; j -= 1
        elif abs(D[i][j] - (D[i - 1][j] + 1)) < 1e-9:
            i -= 1
        else:
            j -= 1
    t0 = [match[k][0] if k in match else None for k in range(n)]
    known = [k for k in range(n) if t0[k] is not None]
    print(f"matched {len(known)}/{n}")
    for k in range(n):  # unmatched words: spread evenly between their matched neighbours
        if t0[k] is None:
            p = max([q for q in known if q < k], default=None)
            nx = min([q for q in known if q > k], default=None)
            tp = match[p][1] if p is not None else 0.0
            tn = t0[nx] if nx is not None else VO_LEN
            gap = [q for q in range(p + 1 if p is not None else 0, nx if nx is not None else n)]
            t0[k] = round(tp + (tn - tp) * (gap.index(k) + 0.5) / len(gap), 2)
    for k in range(1, n):
        t0[k] = max(t0[k], round(t0[k - 1] + 0.05, 2))

    # ---- the long video's clock: LEAD, then PAUSE at every block change
    blocks = [bk for _, bk in tw]
    shifts, add = [], LEAD
    shifts.append([0.0, LEAD])
    T = []
    for k in range(n):
        if k and blocks[k] != blocks[k - 1]:
            src = round((t0[k - 1] + 0.35 + t0[k]) / 2 if t0[k] - t0[k - 1] > 0.5 else t0[k] - 0.05, 2)
            add += PAUSE
            shifts.append([src, round(add, 2)])
        T.append(round(t0[k] + add, 2))
    duration = round(VO_LEN + add + TAIL, 2)

    # ---- captions (numbers as digits)
    caps, k = [], 0
    while k < n:
        hit = None
        for phrase, digits in NUM:
            ph = phrase.split()
            if [w.strip('।,?:.') for w in words[k:k + len(ph)]] == ph:
                tail = words[k + len(ph) - 1][len(ph[-1]):]
                hit = (len(ph), digits + tail)
                break
        if hit:
            caps.append([T[k], hit[1], blocks[k]]); k += hit[0]
        else:
            caps.append([T[k], words[k], blocks[k]]); k += 1

    # ---- cues: each phrase searched from the previous cue on
    def find(phrase: str, start: int) -> int:
        ph = phrase.split()
        for q in range(start, n - len(ph) + 1):
            if words[q:q + len(ph)] == ph:
                return q
        sys.exit(f"cue phrase not found after word {start}: {phrase!r}")
    cues, pos = {}, 0
    for name, phrase in CUES.items():
        q = find(phrase, pos)
        cues[name] = FIX.get(name, T[q]); pos = q

    shorts = []
    for name, first, last in SHORTS:
        q0 = find(first, 0)
        q1 = find(last, q0) + len(last.split()) - 1
        end = (match[q1][1] + (T[q1] - t0[q1])) if q1 in match else T[q1] + 0.5
        shorts.append({"name": name, "t0": round(T[q0] - 0.12, 2), "t1": round(end + 0.35, 2), "w0": q0, "w1": q1})
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps({"duration": duration, "vo_len": VO_LEN, "shifts": shifts, "cues": cues, "shorts": shorts, "caps": caps},
                              ensure_ascii=False, indent=0))
    print("duration", duration, "pauses", len(shifts) - 1)
    for s in shorts:
        print(s["name"], s["t0"], s["t1"], round(s["t1"] - s["t0"], 1))


if __name__ == "__main__":
    main()
