import type { BuiltSet } from "./types";
import { buildFort } from "./fort";
import { buildTown } from "./town";
import { buildSaloon } from "./saloon";
import { buildCabin } from "./cabin";
import { buildGraveyard } from "./graveyard";
import { buildCampus } from "./campus";
import { buildStadium } from "./stadium";
export const SETS: Record<string, () => BuiltSet> = { fort: buildFort, town: buildTown, saloon: buildSaloon, cabin: buildCabin, graveyard: buildGraveyard, campus: buildCampus, stadium: buildStadium };
