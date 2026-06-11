// Node test for the real matching engine. Run: node prototype/test-engine.js
global.window = {};
require('./data.js');                 // sets window.SFIS_DATA
global.SFIS_DATA = global.window.SFIS_DATA;
const { runMatch } = require('./engine.js');

const PROFILE = ['allergen.peanut','allergen.treenut','allergen.sesame','allergen.soy','allergen.wheat','allergen.milk'];
const DEMOS = {
  cookies: 'Whole grain oats, cane sugar, palm oil, soy lecithin, natural flavors, sea salt, baking soda.\nMay contain peanuts and tree nuts.',
  trail:   'Peanuts, almonds, honey, sesame seeds, crisp rice, dark chocolate (cocoa, sugar, soy lecithin).',
  stirfry: 'Water, soy sauce (water, wheat, soybeans, salt), toasted sesame oil, garlic, sugar, modified food starch.',
  crackers:'Enriched wheat flour, vegetable oil, spices, natural flavoring, salt, yeast.\nMade in a facility that also processes milk and sesame.',
};

let fails = 0;
const findItem = (r, common) => r.findings.flatMap(f=>f.items).find(i=>i.common.toLowerCase().includes(common.toLowerCase()));
const has = (r, common, kind) => { const it = findItem(r, common); return it && it.kind===kind; };
const unv = (r, term) => r.unverified.some(u=>u.term.toLowerCase().includes(term.toLowerCase()));
function check(name, cond){ console.log((cond?'  PASS  ':'  FAIL  ')+name); if(!cond) fails++; }

console.log('— cookies —');
let r = runMatch(DEMOS.cookies, PROFILE);
check('soy = contains (soy lecithin is soy-derived)', has(r,'Soy','contains'));
check('peanut = may (PAL)', has(r,'Peanut','may'));
check('tree nuts = may (PAL)', has(r,'Tree','may'));
check('natural flavors = could not verify', unv(r,'Natural Flavors'));

console.log('— trail bar —');
r = runMatch(DEMOS.trail, PROFILE);
check('peanut = contains', has(r,'Peanut','contains'));
check('almond = contains', has(r,'Almond','contains'));
check('sesame = contains', has(r,'Sesame','contains'));
check('soy = contains (soy lecithin)', has(r,'Soy','contains'));

console.log('— stir-fry sauce —');
r = runMatch(DEMOS.stirfry, PROFILE);
check('soy = contains', has(r,'Soy','contains'));
check('wheat = contains', has(r,'Wheat','contains'));
check('sesame = contains (toasted sesame oil beats oil-may)', has(r,'Sesame','contains'));
check('modified food starch = could not verify', unv(r,'Modified Food Starch'));

console.log('— mystery crackers —');
r = runMatch(DEMOS.crackers, PROFILE);
check('wheat = contains', has(r,'Wheat','contains'));
check('milk = may (PAL facility)', has(r,'Milk','may'));
check('sesame = may (PAL facility)', has(r,'Sesame','may'));
check('vegetable oil = could not verify', unv(r,'Vegetable Oil'));
check('spices = could not verify', unv(r,'Spices'));

console.log('\n'+(fails? `FAILURES: ${fails}` : 'ALL PASS'));
process.exit(fails?1:0);
