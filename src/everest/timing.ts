/** Word cues (seconds) from faster-whisper on the 1.15x VO (public/everest/audio/vo_115.wav, 60.56 s). */
export const DURATION_S = 61.0; // 0.44 s of breath after "खड़ा है" before the loop starts again on "तुम"
export const C = {
  // 1. hook
  tum: 0.0, choti: 0.84, khade: 1.34, asal: 2.22, n8849: 3.04, meter: 4.66, ek: 6.04, samandar1: 6.52, tal1: 7.12, khade2: 7.4,
  // 2. limestone, India's edge
  choti2: 8.26, patthar: 8.76, chuna: 9.36, n47: 10.92, saal: 11.96, samandar2: 12.78, tali: 13.46, aurWo: 14.28, samandar3: 14.66,
  bharat1: 15.48, uttari: 16.2, kinare: 16.68,
  // 3. fossils
  isme: 17.5, fossil: 19.32, seep: 20.38, brachio: 21.06, crinoid: 22.14, lily: 23.7,
  // 4. drift, collision, rise
  phir: 24.76, bharat2: 24.92, khisak: 25.96, panch: 27.32, asia: 28.78, takraya: 29.36, beech: 30.36, tethys: 31.36, sikud: 32.0,
  tal4: 33.18, mud: 33.58, upar4: 34.48, uthta: 34.74,
  // 5. Langza
  ye: 35.58, everest3: 36.0, himachal: 37.18, spiti: 37.76, langza: 38.76, n4400: 40.68, wahan: 42.48, dhalan: 42.84, samandar5: 43.64,
  ammonite: 44.34, milte5: 45.06,
  // 6. still rising
  aur6: 45.86, kahani: 46.1, bharat6: 47.8, aaj6: 48.18, uttar6: 48.76, dhakka: 49.28, himalaya: 50.6, aaj6b: 51.08, upar6: 51.74,
  // 7. send line, loop
  to7: 52.62, agli: 52.98, dost: 53.76, spiti7: 54.18, everest7: 54.88, bata: 55.98, vo7: 56.66, pahad: 56.78, nahi: 57.32,
  bharat7: 57.94, purane7: 58.54, samandar7: 59.08, tal7: 59.66, khada: 59.94, end: 60.56,
};

/** Captions: [start, end, text] (the script's spelling, not whisper's). */
export const CAPS: [number, number, string][] = [
  [0.0, 0.8, 'तुम एवरेस्ट की'], [0.8, 2.06, 'चोटी पर खड़े हो,'], [2.06, 3.0, 'तो असल में तुम'], [3.0, 5.25, '8,849 मीटर'],
  [5.25, 6.5, 'ऊँचे, एक पुराने'], [6.5, 8.2, 'समंदर के तल पर खड़े हो।'],
  [8.2, 9.3, 'चोटी का ये पत्थर'], [9.3, 10.4, 'चूना पत्थर है,'], [10.4, 12.7, 'जो क़रीब 47 करोड़ साल पहले'],
  [12.7, 14.2, 'समंदर की तली पर बना।'], [14.2, 15.4, 'और वो समंदर था,'], [15.4, 17.45, 'भारत के उत्तरी किनारे पर।'],
  [17.45, 18.3, 'इसमें आज भी'], [18.3, 20.3, 'समुद्री जीवों के fossil मिलते हैं।'], [20.3, 22.0, 'सीप जैसे brachiopod,'],
  [22.0, 22.85, 'और crinoid,'], [22.85, 24.7, 'जिन्हें समुद्री लिली कहते हैं।'],
  [24.7, 26.7, 'फिर भारत उत्तर की ओर खिसकता गया,'], [26.7, 28.7, 'और क़रीब 5 करोड़ साल पहले'], [28.7, 30.3, 'एशिया से जा टकराया।'],
  [30.3, 31.3, 'बीच का समंदर,'], [31.3, 32.75, 'टेथिस, सिकुड़ गया,'], [32.75, 33.5, 'और उसका तल'], [33.5, 35.5, 'मुड़-मुड़ कर ऊपर उठता गया।'],
  [35.5, 37.1, 'ये सिर्फ़ एवरेस्ट की बात नहीं।'], [37.1, 38.7, 'हिमाचल की स्पीति घाटी में'], [38.7, 39.95, 'लांगज़ा नाम का गाँव है,'],
  [39.95, 42.4, 'क़रीब 4,400 मीटर ऊपर।'], [42.4, 43.6, 'वहाँ की ढलानों पर,'], [43.6, 45.8, 'समंदर के ammonite fossil मिलते हैं।'],
  [45.8, 47.7, 'और ये कहानी अभी ख़त्म नहीं हुई।'], [47.7, 50.4, 'भारत आज भी उत्तर की ओर धक्का दे रहा है,'],
  [50.4, 52.55, 'और हिमालय आज भी ऊपर उठ रहा है।'],
  [52.55, 53.7, 'तो अगली बार'], [53.7, 55.75, 'कोई दोस्त स्पीति या एवरेस्ट जाए,'], [55.75, 56.6, 'उसे बता देना,'],
  [56.6, 57.85, 'वो पहाड़ पर नहीं,'], [57.85, 59.0, 'भारत के पुराने'], [59.0, 61.0, 'समंदर के तल पर खड़ा है।'],
];

/** Moments that get a camera punch-in. */
export const PUNCH = [C.khade, C.n8849, C.samandar1, C.chuna, C.n47, C.bharat1, C.fossil, C.brachio, C.crinoid, C.takraya, C.tethys,
  C.himachal, C.langza, C.n4400, C.ammonite, C.bharat6, C.himalaya, C.dost, C.pahad, C.samandar7];
