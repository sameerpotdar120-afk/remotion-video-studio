import type { PersonSpec } from "../engine/person";
// Mountain Cabin series cast (our own designs, reference-style adults)
export const P: Record<string, PersonSpec> = {
  narrator: { skin: "#c98f6a", hair: "sidepart", hairColor: "#3a2a20", top: "jacket_tie", topColor: "#2c3448", top2: "#c9ccd6", bottom: "chinos", bottomColor: "#8a7a5a", shoes: "#2a2020", stubble: true },
  emma: { skin: "#e0a882", hair: "long", hairColor: "#7a3a22", top: "blouse", topColor: "#d9a23a", bottom: "jeans", bottomColor: "#3a4a6a", female: true, height: 0.94 },
  josh: { skin: "#b9805a", hair: "buzz", hairColor: "#2a1e16", top: "tee", topColor: "#5a6a3a", bottom: "shorts", bottomColor: "#4a6a9a", shoes: "#e8e4dc", build: 1.08 },
  lauren: { skin: "#f0c4a2", hair: "ponytail", hairColor: "#e0c070", top: "blouse", topColor: "#8a6ac8", bottom: "skirt", bottomColor: "#3a3a46", female: true, height: 0.92 },
  ryan: { skin: "#e8b48e", hair: "sidepart", hairColor: "#b08850", top: "flannel", topColor: "#a8322a", bottom: "jeans", bottomColor: "#34445e", build: 1.05 },
  kate: { skin: "#d49a74", hair: "bob", hairColor: "#1e1a1e", top: "sweater", topColor: "#e8dcc4", bottom: "skirt", bottomColor: "#6a3a2a", female: true, height: 0.93 },
  stranger: { skin: "#c9b4a4", hair: "stringy", hairColor: "#2a2a30", top: "torn", topColor: "#3a4a34", bottom: "torn", bottomColor: "#2e3528", female: true, height: 0.95, build: 0.92, eyeBags: true, pale: true },
  truckman: { skin: "#b8907a", hair: "bald", hairColor: "#5a4a3a", top: "workjacket", topColor: "#2a2a44", bottom: "jeans", bottomColor: "#3a3a3a", build: 1.12, stubble: true },
};
export const NAMES: Record<string, string> = { narrator: "Narrator (me)", emma: "Emma (wife)", josh: "Josh (brother)", lauren: "Lauren", ryan: "Ryan (host)", kate: "Kate (fiancée)", stranger: "The stranger", truckman: "Man by the truck" };
