import type { ToonSpec } from "../engine/draw";
// Episode 3 cast. `hero` = our locked character (characters/samulation-hero); here in a blue hoodie.
export const C: Record<string, ToonSpec> = {
  hero: { hat: "spikes", coat: "#4a72a8", plain: true, chain: true, limbs: "#55555e", shoes: "#f2f0ea", head: 1.12, wide: 1.15 },
  gf: { hat: "ponytail", hatColor: "#3a2418", coat: "#d9467a", plain: true, limbs: "#55555e", shoes: "#f2f0ea", head: 1.1, wide: 1.05, height: 0.96 },
  teen: { hat: "cap", hatColor: "#2a2a30", band: "#c9302a", coat: "#6a6a74", plain: true, hair: "#3a2a1e", height: 0.9 },
  fan1: { hat: "cap", hatColor: "#2f7a6a", coat: "#c9a227", plain: true, hair: "#5a3a26" },
  fan2: { hat: "none", coat: "#7a3a8a", hair: "#2a1e16", plain: true, glasses: true },
  fan3: { hat: "flatcap", hatColor: "#3a3a46", coat: "#2f5a8a", hair: "#6a4428", beard: true },
  fan4: { hat: "bob", hatColor: "#c9542a", coat: "#2f8a5a", plain: true, height: 0.94 },
};
