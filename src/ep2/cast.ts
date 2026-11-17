import type { ToonSpec } from "../engine/draw";
// Episode 2 cast. `hero` is the channel's locked character (characters/samulation-hero): Flame Spikes hair + gold S chain.
export const C: Record<string, ToonSpec> = {
  hero: { hat: "spikes", coat: "#4a72a8", plain: true, chain: true, limbs: "#55555e", shoes: "#f2f0ea", head: 1.12, wide: 1.15 },                    // the tow-truck driver
  sheriff: { hat: "sheriff", hatColor: "#8a5a2e", band: "#4a2e16", coat: "#b59a62", plain: true, badge: true, hair: "#3a2a1e", moustache: true, glasses: true, wide: 1.1 },
  worker1: { hat: "hardhat", hatColor: "#f2b630", coat: "#e8762a", vest: "#d9e04a", hair: "#3a2a1e" },
  worker2: { hat: "hardhat", hatColor: "#f2b630", coat: "#4a6a8a", vest: "#d9e04a", hair: "#6a4428", moustache: true },
  driver1: { hat: "cap", hatColor: "#c23a2e", band: "#f2f0ea", coat: "#2f7a6a", hair: "#5a3a26" },
  driver2: { hat: "none", coat: "#8a3a5a", hair: "#2a1e16", plain: true },
  driver3: { hat: "cap", hatColor: "#2a4a7a", coat: "#7a6a3a", hair: "#7a5030", beard: true },
};
