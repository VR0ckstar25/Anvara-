// Node verification for the matching engine. Run: npm run test:match
const { matchScan } = require('./scanMatch.js');
const data = require('../data/allergens.json');

let pass = 0, fail = 0;
const check = (name, cond) => { cond ? pass++ : fail++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}`); };
const bar = (r, cat) => r.findings.find((f) => f.cat === cat);
const item = (r, cat, common) => (bar(r, cat)?.items || []).find((i) => i.common === common);

// A — Contains (derived + word-level) + opaque → could-not-verify; non-profile ignored
let r = matchScan('Ingredients: wheat flour, sugar, peanut oil, whey, tahini, natural flavors, salt.',
  ['peanut', 'milk', 'sesame'], data);
check('A peanut → Contains', item(r, 'allergen', 'Peanuts')?.kind === 'contains');
check('A milk (whey) → Contains', item(r, 'allergen', 'Milk and Dairy')?.kind === 'contains');
check('A sesame (tahini) → Contains', item(r, 'allergen', 'Sesame')?.kind === 'contains');
check('A wheat NOT shown (not on profile)', !item(r, 'allergen', 'Wheat'));
check('A "natural flavors" → could-not-verify', r.unverified.some((u) => /natural flavors/i.test(u)));

// B — PAL statement → May contain (not Contains), with a note
r = matchScan('Ingredients: oats, sugar. May contain almonds.', ['almond'], data);
check('B almond → May contain', item(r, 'allergen', 'Almond')?.kind === 'may');
check('B PAL note present', !!item(r, 'allergen', 'Almond')?.note);

// C — parenthetical sub-ingredients split out (FDA "spices (sesame, wheat)" example)
r = matchScan('Ingredients: potatoes, canola oil, spices (sesame, wheat), salt. Contains: Wheat, Sesame.',
  ['sesame', 'wheat'], data);
check('C sesame in parens → Contains', item(r, 'allergen', 'Sesame')?.kind === 'contains');
check('C wheat in parens → Contains', item(r, 'allergen', 'Wheat')?.kind === 'contains');

// D — dedupe: ingredient "Contains" beats PAL "May contain" for same parent
r = matchScan('Ingredients: peanuts. May contain peanuts.', ['peanut'], data);
check('D peanut → Contains (not may)', item(r, 'allergen', 'Peanuts')?.kind === 'contains');
check('D peanut appears once', bar(r, 'allergen').items.filter((i) => i.common === 'Peanuts').length === 1);

// E — clean: nothing on profile, no opaque → empty (no "not detected" clutter)
r = matchScan('Ingredients: water, sugar, salt.', ['milk'], data);
check('E no findings', r.findings.length === 0);
check('E no unverified', r.unverified.length === 0);

// F — cross-source multi-parent: lecithin → soy AND egg, both "May contain"
r = matchScan('Ingredients: lecithin.', ['soy', 'egg'], data);
check('F lecithin → soy May contain', item(r, 'allergen', 'Soybeans')?.kind === 'may');
check('F lecithin → egg May contain', item(r, 'allergen', 'Eggs')?.kind === 'may');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
