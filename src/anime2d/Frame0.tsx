// Frame 0 drawn as 2D anime: Silas rides straight at the lens on his black horse, the gang behind in the dust, sunset.
import React from "react";
import { AbsoluteFill } from "remotion";
import { Part, Stroke, Paper, INK } from "./kit2d";

const W = 1080, H = 1920;
const SKIN = "#f6d2bc", SKIN_SH = "rgba(170,70,90,0.32)", COAT = "#2a2733", COAT_SH = "rgba(10,6,24,0.55)", COAT_HI = "rgba(140,150,210,0.35)";
const HORSE = "#34324a", HORSE_SH = "rgba(6,4,20,0.6)", HORSE_HI = "rgba(170,180,255,0.5)", LEATHER = "#6a3a22";

const Sky: React.FC = () => (
  <g>
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e5616e" /><stop offset="0.35" stopColor="#f08a7a" /><stop offset="0.62" stopColor="#f9b089" /><stop offset="0.72" stopColor="#ffd6a0" /></linearGradient>
      <radialGradient id="sunglow" cx="0.78" cy="0.47" r="0.5"><stop offset="0" stopColor="#fff2c8" stopOpacity="0.95" /><stop offset="0.25" stopColor="#ffd9a0" stopOpacity="0.5" /><stop offset="1" stopColor="#ffd9a0" stopOpacity="0" /></radialGradient>
      <linearGradient id="ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f0b48a" /><stop offset="0.4" stopColor="#dc9272" /><stop offset="1" stopColor="#b86a5a" /></linearGradient>
    </defs>
    <rect width={W} height={H} fill="url(#sky)" />
    <rect width={W} height={H} fill="url(#sunglow)" />
    {/* painted clouds: flat lit tops, violet bellies */}
    {[[120, 260, 1.0], [820, 170, 1.25], [560, 470, 0.8], [-40, 620, 0.9]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x},${y}) scale(${s})`}>
        <path d="M0,60 C10,20 60,10 90,30 C110,0 170,-5 195,25 C230,10 280,25 285,60 Z" fill="#ffd8c0" />
        <path d="M0,60 C40,48 120,52 160,46 C200,52 250,48 285,60 C240,80 60,82 0,60 Z" fill="#c98aa8" opacity="0.85" />
        <path d="M30,38 C60,26 85,30 92,34" stroke="#fff3e6" strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.8" />
      </g>))}
    {/* mesas */}
    <path d="M0,960 L0,880 L60,870 L90,830 L210,826 L240,868 L330,880 L360,960 Z" fill="#b5729a" />
    <path d="M620,960 L660,900 L700,860 L860,852 L900,895 L1080,905 L1080,960 Z" fill="#a8679a" />
    <path d="M700,860 L860,852 L868,866 L705,872 Z" fill="#e9a0a8" />
    <path d="M90,830 L210,826 L216,840 L94,844 Z" fill="#efa8aa" />
    {/* ground */}
    <rect y={955} width={W} height={H - 955} fill="url(#ground)" />
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <path key={i} d={`M${540 + (i - 3) * 40},960 L${540 + (i - 3) * 420},${H}`} stroke="#c47c62" strokeWidth={3 + i % 2 * 3} opacity="0.35" />)}
    {/* fence rail far left */}
    <g stroke={INK} strokeWidth="3"><path d="M0,915 L330,905" /><path d="M0,945 L330,938" /></g>
    {[20, 110, 200, 290].map((x) => <rect key={x} x={x} y={890} width="12" height="70" fill="#8a5a42" stroke={INK} strokeWidth="2.5" />)}
  </g>
);

// small rider in the gang behind (flat, slightly hazed)
const Rider: React.FC<{ x: number; y: number; s: number; coat: string; hat: string; horse: string; flip?: boolean }> = ({ x, y, s, coat, hat, horse, flip }) => (
  <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`} opacity="0.92">
    <Part d="M-60,120 C-70,60 -40,20 0,18 C40,20 70,60 60,120 L50,260 L-50,260 Z" fill={horse} line={3} shade={["M10,18 L60,120 L50,260 L10,260 Z"]} />
    <Part d="M-38,130 L-30,260 L-12,262 L-10,160 Z" fill={horse} line={3} />
    <Part d="M-55,-40 C-50,-80 50,-80 55,-40 L62,60 L-62,60 Z" fill={coat} line={3} shade={["M10,-80 L62,60 L10,60 Z"]} />
    <Part d="M-22,-120 C-24,-95 -18,-70 0,-62 C18,-70 24,-95 22,-120 Z" fill={SKIN} line={3} shade={["M5,-130 L24,-120 L20,-70 L5,-64 Z"]} />
    <Part d="M-50,-118 Q0,-132 50,-118 Q0,-104 -50,-118 Z" fill={hat} line={3} />
    <Part d="M-22,-150 L22,-150 L26,-120 L-26,-120 Z" fill={hat} line={3} />
  </g>
);

const Dust: React.FC<{ x: number; y: number; r: number; o?: number }> = ({ x, y, r, o = 0.75 }) => (
  <g opacity={o}>
    <circle cx={x} cy={y} r={r} fill="#f7caa0" />
    <circle cx={x + r * 0.55} cy={y - r * 0.35} r={r * 0.7} fill="#ffe0bd" />
    <circle cx={x - r * 0.6} cy={y + r * 0.15} r={r * 0.6} fill="#e6a888" />
  </g>
);

const HorseBack: React.FC = () => (
  <g>
    {/* chest + raised foreleg + far leg */}
    <Part d="M230,1520 C240,1440 330,1400 470,1400 C620,1400 720,1450 740,1540 L760,1920 L200,1920 Z" fill={HORSE} shade={["M480,1400 L760,1500 L760,1920 L520,1920 Z"]} shadeCol={HORSE_SH} hi={["M240,1520 C260,1460 320,1430 380,1420 L376,1440 C320,1452 270,1480 256,1530 Z"]} hiCol={HORSE_HI} />
    <Part d="M250,1600 C220,1680 210,1740 240,1790 L300,1800 C290,1750 300,1700 330,1650 Z" fill={HORSE} shade={["M280,1600 L330,1650 L300,1800 L280,1800 Z"]} shadeCol={HORSE_SH} />
    <Part d="M232,1786 L306,1796 L300,1840 L226,1834 Z" fill="#3a3440" line={4} />
    {/* neck rising to the rider */}
    <Part d="M300,1060 C300,980 380,930 470,930 C580,930 650,990 660,1080 L700,1440 L260,1440 Z" fill={HORSE} shade={["M470,930 L660,1080 L700,1440 L480,1440 Z"]} shadeCol={HORSE_SH} hi={["M312,1060 C318,1000 360,962 420,948 L424,962 C372,978 336,1010 328,1064 Z"]} hiCol={HORSE_HI} />
    {/* mane flying to our right */}
    {[0, 1, 2, 3, 4, 5].map((i) => <Part key={i} line={3} fill="#121018" d={`M${520 + i * 22},${940 + i * 40} C${600 + i * 26},${930 + i * 38} ${660 + i * 24},${950 + i * 40} ${700 + i * 26},${990 + i * 36} C${650 + i * 22},${980 + i * 40} ${600 + i * 22},${975 + i * 40} ${540 + i * 22},${990 + i * 40} Z`} />)}
  </g>
);
const HorseHead: React.FC = () => (
  // local coords: (0,0) = middle of the forehead, muzzle at y ~ 520. Seen almost head-on, turned a touch to our right.
  <g>
    {/* forelock + ears behind */}
    <Part d="M-92,6 C-112,-40 -122,-90 -112,-136 C-86,-100 -66,-50 -58,-6 Z" fill={HORSE} shade={["M-112,-136 L-58,-6 L-76,0 Z"]} shadeCol={HORSE_SH} inner={[{ d: "M-104,-100 C-96,-70 -86,-40 -74,-12", w: 2.2 }]} />
    <Part d="M58,-8 C66,-56 82,-104 106,-138 C114,-92 108,-44 92,0 Z" fill={HORSE} shade={["M106,-138 L92,0 L72,-4 Z"]} shadeCol={HORSE_SH} inner={[{ d: "M98,-100 C92,-70 84,-42 74,-14", w: 2.2 }]} />
    {/* head */}
    <Part d="M-100,0 C-60,-20 60,-22 98,-4 C118,40 120,100 108,140 C96,220 74,300 62,360 C76,400 80,450 66,490 C50,528 -60,530 -76,492 C-92,452 -86,402 -72,360 C-84,300 -108,220 -118,140 C-126,90 -120,40 -100,0 Z"
      fill={HORSE}
      shade={["M30,-20 C80,-16 110,20 110,90 C110,200 80,300 62,360 C76,400 80,450 66,490 C50,528 20,530 10,520 C30,400 40,200 30,-20 Z", "M-118,140 C-108,220 -84,300 -72,360 L-60,360 C-76,300 -96,220 -104,140 Z"]} shadeCol={HORSE_SH}
      hi={["M-16,30 C-12,180 -8,320 -4,430 L10,430 C8,320 4,180 0,30 Z", "M-80,10 C-50,-4 0,-8 40,0 L38,10 C0,4 -48,8 -76,22 Z", "M-108,120 C-100,170 -88,220 -78,260 L-86,262 C-98,222 -108,172 -114,122 Z"]} hiCol={HORSE_HI}
      inner={[{ d: "M-86,170 C-70,200 -60,240 -56,280", w: 2.2 }, { d: "M84,160 C70,196 62,236 58,276", w: 2.2 }, { d: "M-60,430 C-30,416 30,416 56,430", w: 2 }]} />
    {/* muzzle: soft, lighter, nostrils flaring */}
    <Part d="M-78,420 C-50,404 50,402 74,420 C82,460 70,510 40,524 C10,534 -40,534 -64,516 C-84,496 -88,456 -78,420 Z" fill="#4a4660" line={0} shade={["M10,404 L74,420 C82,460 70,510 40,524 L10,530 Z"]} shadeCol={HORSE_SH} hi={["M-60,430 C-40,420 -20,418 0,420 L0,428 C-20,428 -40,430 -58,438 Z"]} hiCol={HORSE_HI} />
    <path d="M-50,458 C-62,470 -60,494 -44,500 C-34,490 -36,470 -50,458 Z" fill="#0b0910" stroke={INK} strokeWidth="2.5" />
    <path d="M40,456 C54,468 52,492 36,498 C26,488 28,468 40,456 Z" fill="#0b0910" stroke={INK} strokeWidth="2.5" />
    <path d="M-34,516 Q0,528 30,514" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" />
    {/* forelock: black strands falling between the eyes */}
    {["M-40,-14 C-30,20 -34,60 -48,96 C-24,70 -14,30 -16,-12 Z", "M-14,-18 C-4,30 2,80 -6,126 C16,90 20,40 12,-16 Z", "M14,-16 C30,20 36,60 30,98 C48,66 50,26 40,-10 Z"].map((d, i) => (
      <Part key={i} d={d} fill="#15131c" line={3} hi={[`M${-30 + i * 26},-10 L${-24 + i * 26},-10 L${-28 + i * 26},40 Z`]} hiCol="rgba(170,180,255,0.45)" />))}
    {/* eyes: big, wet, dark, on the sides of the head */}
    {[[-110, 150, -1], [98, 142, 1]].map(([x, y, s], i) => (
      <g key={i} transform={`translate(${x},${y}) rotate(${s * 18})`}>
        <ellipse rx="20" ry="15" fill="#0d0b12" stroke={INK} strokeWidth="3" />
        <ellipse cx={-s * 6} cy="-5" rx="7" ry="5" fill="#fff" /><circle cx={s * 7} cy="6" r="2.5" fill="#a8b4ff" />
        <path d="M-26,-12 Q0,-26 26,-12" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" />
        <path d="M-20,16 Q0,22 20,14" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>))}
    {/* bridle following the head: browband, cheekpieces, noseband, silver concho */}
    <g fill="none" strokeLinecap="round">
      {["M-104,34 C-50,18 50,16 104,30", "M-108,40 C-112,150 -96,260 -76,350", "M102,36 C108,150 92,260 70,350", "M-80,350 C-30,334 30,334 74,350"].map((d, i) => (
        <g key={i}><path d={d} stroke={INK} strokeWidth="12" /><path d={d} stroke={LEATHER} strokeWidth="7" /><path d={d} stroke="rgba(255,205,160,0.55)" strokeWidth="1.6" transform="translate(-1,-2)" /></g>))}
    </g>
    <circle cx="-2" cy="344" r="15" fill="#d4dbe8" stroke={INK} strokeWidth="3" /><circle cx="-6" cy="340" r="5" fill="#fff" />
    {/* warm rim light on the right edge from the low sun */}
    <path d="M100,0 C118,40 120,100 108,140 C96,220 74,300 62,360" stroke="#ffb27a" strokeWidth="4" fill="none" opacity="0.75" />
  </g>
);
const Silas: React.FC = () => (
  <g>
    {/* saddle + red blanket peeking at his hips */}
    <Part d="M250,1220 L340,1210 L350,1330 L246,1350 Z" fill="#8a2a2e" line={4} inner={[{ d: "M256,1260 L344,1252", w: 3, col: "#e8d2b0" }]} />
    <Part d="M760,1210 L850,1220 L854,1350 L752,1330 Z" fill="#8a2a2e" line={4} inner={[{ d: "M758,1252 L846,1260", w: 3, col: "#e8d2b0" }]} />
    {/* legs: knees out round the horse, boots in the stirrups */}
    <Part d="M300,1180 C250,1230 240,1320 260,1420 L250,1640 L320,1650 L330,1420 C340,1330 350,1260 360,1220 Z" fill="#34303c" shade={["M300,1180 L360,1220 L330,1650 L300,1650 Z"]} shadeCol={COAT_SH} />
    <Part d="M240,1620 L330,1630 L336,1700 L226,1700 Z" fill="#17151b" hi={["M244,1630 L270,1632 L262,1690 L240,1690 Z"]} hiCol="rgba(160,170,220,0.4)" />
    <Part d="M780,1220 C800,1280 810,1350 812,1420 L800,1640 L870,1650 L880,1420 C880,1320 860,1240 820,1180 Z" fill="#34303c" shade={["M820,1180 L880,1420 L870,1650 L840,1650 Z"]} shadeCol={COAT_SH} />
    <Part d="M790,1630 L880,1620 L894,1700 L784,1700 Z" fill="#17151b" />
    {/* torso: duster coat */}
    <Part d="M286,800 C296,730 380,690 560,684 C740,690 824,730 834,800 C852,900 846,1050 820,1220 L300,1220 C274,1050 268,900 286,800 Z"
      fill={COAT} shade={["M560,680 C690,680 790,700 830,760 C860,880 850,1040 820,1220 L620,1220 C640,1000 620,820 560,680 Z"]} shadeCol={COAT_SH}
      hi={["M300,780 C320,740 360,720 400,712 L396,728 C360,736 330,756 318,790 Z", "M296,860 C292,940 296,1020 306,1100 L294,1100 C284,1020 282,940 286,860 Z"]} hiCol={COAT_HI} />
    {/* fabric folds on the coat */}
    <g stroke={INK} strokeWidth="2.4" fill="none" strokeLinecap="round" opacity="0.85">
      <path d="M360,780 C380,860 390,960 384,1060" /><path d="M410,760 C420,800 424,850 420,900" /><path d="M760,790 C744,860 738,950 746,1050" /><path d="M716,760 C708,800 704,840 708,880" />
    </g>
    {/* open front: oxblood waistcoat, white shirt, dark cravat */}
    <Part d="M480,700 L640,700 L660,1220 L460,1220 Z" fill="#6e1f27" shade={["M560,700 L640,700 L660,1220 L570,1220 Z"]} shadeCol="rgba(40,0,20,0.45)" hi={["M486,720 L500,720 L490,1100 L478,1100 Z"]} hiCol="rgba(255,170,170,0.3)"
      inner={[{ d: "M560,820 L560,1210", w: 2.5 }]} extra={[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={548} cy={860 + i * 70} r="6" fill="#d8c69a" stroke={INK} strokeWidth="2" />)} />
    <Part d="M520,690 L600,690 L590,790 L560,760 L530,790 Z" fill="#f2ece2" shade={["M560,690 L600,690 L590,790 L560,760 Z"]} shadeCol="rgba(90,80,130,0.3)" line={3} />
    <Part d="M548,720 L572,720 L582,800 L560,840 L538,800 Z" fill="#241a22" line={3} hi={["M552,730 L558,730 L552,790 Z"]} hiCol="rgba(255,255,255,0.25)" />
    {/* lapels */}
    <Part d="M480,700 L430,720 L470,980 L500,760 Z" fill="#33303d" line={4} hi={["M440,722 L452,722 L476,940 L470,960 Z"]} hiCol={COAT_HI} />
    <Part d="M640,700 L690,720 L650,980 L620,760 Z" fill="#33303d" line={4} shade={["M640,700 L690,720 L650,980 Z"]} shadeCol={COAT_SH} />
    {/* high collar */}
    <Part d="M468,700 C470,650 490,620 512,612 L540,700 Z" fill={COAT} line={4} hi={["M474,690 L490,640 L498,646 L484,694 Z"]} hiCol={COAT_HI} />
    <Part d="M652,700 C650,650 630,620 608,612 L580,700 Z" fill={COAT} line={4} shade={["M652,700 L608,612 L580,700 Z"]} shadeCol={COAT_SH} />
  </g>
);
const SilasArms: React.FC = () => (
  <g>
    {/* arms: elbows out, hands meet on the saddle horn */}
    <Part d="M300,770 C250,840 240,950 280,1030 L330,1060 C340,980 350,900 380,840 Z" fill={COAT} shade={["M330,850 L380,840 L330,1060 L310,1050 Z"]} shadeCol={COAT_SH} hi={["M290,820 C270,880 268,950 286,1010 L276,1012 C258,950 260,880 282,816 Z"]} hiCol={COAT_HI} />
    <Part d="M280,1030 C330,1080 420,1100 500,1100 L510,1060 C440,1050 380,1030 330,990 Z" fill={COAT} shade={["M300,1040 L510,1080 L500,1100 C420,1100 330,1080 280,1030 Z"]} shadeCol={COAT_SH} />
    <Part d="M820,770 C870,840 880,950 840,1030 L790,1060 C780,980 770,900 740,840 Z" fill={COAT} shade={["M800,770 L880,950 L840,1030 L790,1060 Z"]} shadeCol={COAT_SH} />
    <Part d="M840,1030 C790,1080 700,1100 640,1104 L630,1064 C690,1054 750,1030 790,990 Z" fill={COAT} shade={["M640,1080 L840,1030 L790,1080 Z"]} shadeCol={COAT_SH} />
    {/* sleeve folds */}
    <g stroke={INK} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.85">
      <path d="M300,990 C320,1000 336,1006 350,1004" /><path d="M296,940 C306,950 318,956 330,956" /><path d="M820,990 C800,1002 786,1006 770,1004" /><path d="M826,936 C814,948 802,954 788,954" />
      <path d="M380,1050 C392,1070 400,1074 412,1074" /><path d="M740,1054 C728,1072 720,1076 708,1078" />
    </g>
    {/* reins from the hands down to the bit */}
    {["M540,1110 C500,1180 470,1250 440,1330", "M600,1110 C590,1190 560,1260 520,1330"].map((d, i) => <g key={i}><path d={d} stroke={INK} strokeWidth="9" fill="none" /><path d={d} stroke={LEATHER} strokeWidth="5" fill="none" /></g>)}
    {/* white cuffs */}
    <Part d="M490,1056 L520,1058 L516,1104 L486,1102 Z" fill="#f2ece2" line={3} /><Part d="M624,1062 L652,1060 L656,1106 L628,1108 Z" fill="#f2ece2" line={3} />
    {/* saddle horn under the hands */}
    <Part d="M556,1130 C556,1100 600,1096 604,1126 L600,1190 L560,1190 Z" fill="#7a4a2c" line={4} hi={["M564,1110 L576,1106 L572,1180 L562,1180 Z"]} hiCol="rgba(255,210,160,0.4)" />
    {/* hands: right over left on the horn, knuckles + finger lines */}
    <Part d="M512,1066 C540,1052 590,1056 604,1080 C612,1100 600,1126 572,1132 C546,1136 520,1126 512,1106 Z" fill={SKIN} shade={["M560,1100 L612,1092 L600,1126 L572,1132 Z"]} shadeCol={SKIN_SH}
      inner={[{ d: "M530,1084 C548,1078 568,1080 584,1088", w: 2 }, { d: "M532,1100 C552,1094 572,1096 588,1104", w: 2 }, { d: "M538,1114 C556,1110 574,1112 588,1118", w: 2 }]} />
    <Part d="M574,1060 C600,1050 640,1060 650,1082 C656,1104 640,1124 616,1126 C594,1126 578,1112 574,1092 Z" fill={SKIN} shade={["M612,1070 L652,1084 L640,1124 L616,1126 Z"]} shadeCol={SKIN_SH}
      inner={[{ d: "M588,1076 C604,1072 622,1074 636,1082", w: 2 }, { d: "M590,1092 C606,1088 624,1090 640,1098", w: 2 }]} />
  </g>
);
const SilasHead: React.FC = () => (
  <g>
    {/* neck */}
    <Part d="M530,600 L590,600 L594,700 L526,700 Z" fill={SKIN} shade={["M526,600 L594,600 L594,650 C570,662 548,662 526,650 Z"]} shadeCol="rgba(150,60,90,0.45)" />
    {/* head */}
    <g>
      {/* silver side locks behind the face */}
      <Part d="M450,420 C434,500 446,590 470,650 L500,640 L490,560 L640,560 L630,640 L662,650 C684,590 690,500 672,420 Z" fill="#c4ccda" shade={["M610,420 L672,420 C690,500 684,590 662,650 L630,640 Z"]} shadeCol="rgba(60,70,130,0.45)" hi={["M456,470 C452,520 456,570 468,610 L460,612 C446,570 444,520 448,470 Z"]} hiCol="rgba(255,255,255,0.6)" />
      {/* face: long, narrow, sharp V jaw */}
      <Part d="M466,420 C460,500 470,566 500,612 C520,636 540,652 556,658 Q560,660 564,658 C580,652 600,636 620,612 C650,566 660,500 654,420 Z" fill={SKIN}
        shade={["M606,420 L654,420 C660,500 650,566 620,612 C600,636 580,652 564,658 L566,630 C604,596 620,520 606,420 Z", "M466,420 L654,420 L654,480 C610,468 512,468 466,480 Z"]} shadeCol={SKIN_SH}
        hi={["M478,560 C488,598 506,626 528,646 L522,650 C498,630 482,600 474,562 Z"]} hiCol="rgba(255,245,235,0.6)" line={5} />
      {/* blush of the warm light on the cheeks */}
      <ellipse cx="500" cy="560" rx="22" ry="9" fill="rgba(255,120,110,0.18)" />
      {/* eyes: sharp almond anime eyes, cold steel grey, two highlights */}
      {[[514, 518, 1], [606, 518, -1]].map(([x, y, s], i) => {
        // s = +1 for his right eye (left of frame): the nose is towards +x. Upper lid is high at the outer corner, low at the inner: a cold, hard stare.
        const white = `M${-32 * s},-6 Q${-4 * s},-12 ${28 * s},2 Q${26 * s},10 ${18 * s},12 Q${-6 * s},14 ${-28 * s},6 Z`;
        return (<g key={i} transform={`translate(${x},${y}) scale(1.3)`}>
          <defs><clipPath id={`ew${i}`}><path d={white} /></clipPath><linearGradient id={`iris${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a323e" /><stop offset="0.55" stopColor="#6f7f94" /><stop offset="1" stopColor="#b6c4d4" /></linearGradient></defs>
          <path d={white} fill="#fbf7f4" />
          <g clipPath={`url(#ew${i})`}>
            <ellipse cx={-2 * s} cy="3" rx="11" ry="13" fill={`url(#iris${i})`} stroke={INK} strokeWidth="1.5" />
            <ellipse cx={-2 * s} cy="4" rx="5" ry="7" fill="#12151c" />
            <ellipse cx={-6 * s} cy="-1" rx="3.6" ry="2.8" fill="#fff" /><circle cx={3 * s} cy="9" r="1.7" fill="#fff" opacity="0.9" />
            <path d={`M${-34 * s},-14 L${34 * s},-14 L${34 * s},0 Q${-4 * s},-8 ${-34 * s},-2 Z`} fill="rgba(60,40,80,0.35)" />
          </g>
          <path d={`M${-36 * s},-4 Q${-6 * s},-15 ${30 * s},2 L${33 * s},6 Q${-6 * s},-7 ${-33 * s},1 Z`} fill={INK} />
          <path d={`M${-30 * s},-5 L${-40 * s},-9`} stroke={INK} strokeWidth="3" strokeLinecap="round" />
          <path d={`M${-24 * s},9 Q${-4 * s},13 ${16 * s},11`} stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </g>); })}
      {/* brows: hard, angled down to the nose */}
      <Stroke from={[470, 478]} ctrl={[512, 476]} to={[552, 496]} w={12} />
      <Stroke from={[568, 496]} ctrl={[608, 476]} to={[650, 478]} w={12} />
      {/* nose: a single shadowed edge + tip */}
      <path d="M566,540 L574,574 Q568,580 558,577" stroke={INK} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M568,544 L576,572 L566,568 Z" fill="rgba(170,70,90,0.25)" />
      {/* mouth: thin, set hard */}
      <path d="M540,606 Q560,600 582,605" stroke={INK} strokeWidth="3.2" fill="none" strokeLinecap="round" />
      <path d="M548,614 Q562,618 576,614" stroke="rgba(150,60,80,0.45)" strokeWidth="2" fill="none" />
      {/* scar down his left cheek */}
      <path d="M622,520 L606,596" stroke="#b03e52" strokeWidth="4.5" strokeLinecap="round" />
      {[0.18, 0.42, 0.66, 0.88].map((k) => <path key={k} d={`M${622 - 16 * k - 8},${520 + 76 * k - 3} l16,5`} stroke="#b03e52" strokeWidth="2.5" strokeLinecap="round" />)}
      {/* rim light from the low sun on the right side of the face */}
      <path d="M652,440 C656,510 646,570 618,614" stroke="#ffb27a" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.85" />
      {/* bangs: layered silver spikes falling over the forehead and between the eyes */}
      {[["M470,412 C470,450 476,480 490,506 C484,472 488,446 500,430 Z", 0], ["M490,412 C500,456 516,490 540,508 C528,476 528,444 536,424 Z", 0], ["M528,412 C540,450 548,486 548,530 C564,496 568,458 566,424 Z", 1], ["M560,412 C578,446 590,474 606,500 C604,466 600,440 592,418 Z", 1], ["M590,412 C612,440 630,462 648,474 C642,450 634,430 622,414 Z", 1], ["M620,412 C640,430 652,456 656,486 C664,456 664,432 656,414 Z", 1]].map(([d, sh], i) => (
        <Part key={i} d={d as string} fill={sh ? "#b8c0d0" : "#dfe5ee"} line={3.5} hi={[`M${470 + i * 30},414 L${486 + i * 30},414 L${480 + i * 30},440 Z`]} hiCol="rgba(255,255,255,0.8)" shade={sh ? [] : []} />))}
      <path d="M462,416 C520,404 600,404 660,416" stroke="rgba(60,60,110,0.5)" strokeWidth="10" fill="none" />
      {/* hat: flat crown, wide brim seen from below, silver conchos on the band */}
      <Part d="M460,410 L470,296 C520,282 600,282 650,296 L660,410 Z" fill="#1e1c24" shade={["M594,286 L650,296 L660,410 L604,410 Z"]} shadeCol="rgba(0,0,0,0.55)" hi={["M478,302 L494,300 L488,400 L474,400 Z"]} hiCol="rgba(160,170,230,0.4)" />
      <Part d="M470,296 C520,282 600,282 650,296 C600,308 520,308 470,296 Z" fill="#2c2a34" line={3} />
      <Part d="M460,376 L660,376 L660,408 L460,408 Z" fill="#383842" line={3} extra={[0, 1, 2, 3, 4, 5].map((i) => <g key={i}><circle cx={478 + i * 33} cy={392} r="7.5" fill="#e6ebf2" stroke={INK} strokeWidth="2" /><circle cx={476 + i * 33} cy={390} r="2.5" fill="#fff" /></g>)} />
      <Part d="M262,424 C350,386 460,378 560,378 C660,378 770,386 858,424 C770,452 660,460 560,460 C460,460 350,452 262,424 Z" fill="#26242c" shade={["M262,424 C350,440 460,448 560,448 C660,448 770,440 858,424 C770,452 660,460 560,460 C460,460 350,452 262,424 Z"]} shadeCol="rgba(0,0,0,0.6)"
        hi={["M286,418 C380,392 470,386 560,386 L560,392 C470,392 380,402 296,424 Z"]} hiCol="rgba(170,180,240,0.45)" />
      <path d="M840,418 C800,400 740,390 680,386" stroke="#ffb27a" strokeWidth="3" fill="none" opacity="0.8" />
    </g>
  </g>
);

export const Frame0: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
      <defs>
        <filter id="far" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="7" /></filter>
        <filter id="mid" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="3.5" /></filter>
        <filter id="dust" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves={3} seed={4} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="90" /><feGaussianBlur stdDeviation="10" /></filter>
        <radialGradient id="vig" cx="0.5" cy="0.45" r="0.75"><stop offset="0.6" stopColor="#000" stopOpacity="0" /><stop offset="1" stopColor="#2a0e2a" stopOpacity="0.45" /></radialGradient>
      </defs>
      <g filter="url(#far)"><Sky /></g>
      <g filter="url(#mid)">
        <g filter="url(#dust)"><Dust x={300} y={980} r={150} o={0.6} /><Dust x={820} y={990} r={170} o={0.6} /></g>
        <Rider x={190} y={830} s={0.95} coat="#c8402e" hat="#3a2a20" horse="#6b3a1f" />
        <Rider x={900} y={840} s={1.0} coat="#2e6a4a" hat="#c99a5a" horse="#d9d2c4" flip />
        <Rider x={700} y={790} s={0.75} coat="#d8a040" hat="#1a1418" horse="#9a4c22" />
        <g filter="url(#dust)"><Dust x={120} y={1180} r={190} o={0.85} /><Dust x={980} y={1200} r={210} o={0.85} /></g>
      </g>
      <g transform="translate(560,560) scale(1.55) translate(-560,-560)">
        <Silas />
        <HorseBack />
        <SilasArms />
        <SilasHead />
      </g>
      <g transform="translate(420,1250) scale(1.22)"><HorseHead /></g>
      <g filter="url(#dust)"><Dust x={150} y={1840} r={170} o={0.9} /><Dust x={920} y={1860} r={200} o={0.85} /></g>
      <rect width={W} height={H} fill="url(#vig)" />
      <Paper w={W} h={H} />
    </svg>
  </AbsoluteFill>
);
