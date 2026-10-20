// Builds public/maps/*.json from public-domain data:
//  - us-atlas 3.0.1 (US Census Bureau cartographic boundaries 2017, public domain)
//  - world-atlas 2.0.2 (Natural Earth 1:10m / 1:50m, public domain)
// 1775 colonies = modern state outlines, with Maine merged into Massachusetts and
// West Virginia merged into Virginia (both were part of those colonies in 1775).
// Vermont is exported separately as a disputed territory (claimed by NY and NH).
// Western land claims (Kentucky, Tennessee, Ohio country) are intentionally NOT included.
import fs from 'node:fs';
import * as topo from 'topojson-client';
const [usPath, worldDir, out] = process.argv.slice(2);
const us = JSON.parse(fs.readFileSync(usPath, 'utf8'));
const colonies = [
  ['new-hampshire', 'New Hampshire', ['33']],
  ['massachusetts', 'Massachusetts', ['25', '23']],
  ['rhode-island', 'Rhode Island', ['44']],
  ['connecticut', 'Connecticut', ['09']],
  ['new-york', 'New York', ['36']],
  ['new-jersey', 'New Jersey', ['34']],
  ['pennsylvania', 'Pennsylvania', ['42']],
  ['delaware', 'Delaware', ['10']],
  ['maryland', 'Maryland', ['24']],
  ['virginia', 'Virginia', ['51', '54']],
  ['north-carolina', 'North Carolina', ['37']],
  ['south-carolina', 'South Carolina', ['45']],
  ['georgia', 'Georgia', ['13']],
];
const geoms = us.objects.states.geometries;
const features = colonies.map(([id, name, fips], order) => ({
  type: 'Feature',
  properties: { id, name, order }, // order = north→south, used for stagger
  geometry: topo.merge(us, geoms.filter((g) => fips.includes(String(g.id).padStart(2, '0')))),
}));
fs.writeFileSync(`${out}/colonies-1775.json`, JSON.stringify({ type: 'FeatureCollection', features }));
const vt = geoms.filter((g) => String(g.id) === '50');
fs.writeFileSync(`${out}/vermont-disputed.json`, JSON.stringify({ type: 'Feature', properties: { id: 'vermont', name: 'Vermont (disputed NY/NH)' }, geometry: topo.merge(us, vt) }));
// World land + countries (Natural Earth 50m is enough for 4K at continental zoom; 10m for close-ups)
for (const f of ['land-50m', 'countries-50m', 'land-10m', 'countries-10m']) {
  const w = JSON.parse(fs.readFileSync(`${worldDir}/${f}.json`, 'utf8'));
  const key = f.startsWith('land') ? 'land' : 'countries';
  fs.writeFileSync(`${out}/${f}.geo.json`, JSON.stringify(topo.feature(w, w.objects[key])));
}
console.log('ok', features.map((f) => f.properties.id).join(','));
