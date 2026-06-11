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

// G — adversarial hostile cases (from the 80-failure sweep; must stay fixed)
const allParents = [...new Set(data.terms.map((t) => t.parent))];
const has = (r, common) => r.findings.some((f) => f.items.some((i) => i.common === common));
const kindFor = (r, common) => { for (const f of r.findings) for (const i of f.items) if (i.common === common) return i.kind; return null; };

r = matchScan('Processed in a facility that also handles peanuts.', ['peanut'], data);
check('G PAL "processed in a facility…" → May contain (not Contains)', kindFor(r, 'Peanuts') === 'may');
r = matchScan('pea-\nnut flour, sugar', ['peanut'], data);
check('G OCR hyphen-break "pea-\\nnut" → Contains Peanuts', kindFor(r, 'Peanuts') === 'contains');
r = matchScan('Ingredients: fat-free milk, sugar.', ['milk'], data);
check('G "fat-free milk" → Contains Milk (real allergen not dropped)', kindFor(r, 'Milk and Dairy') === 'contains');
r = matchScan('Roasted corn. Does not contain peanuts.', ['peanut'], data);
check('G "does not contain peanuts" → no peanut finding (FP fixed)', !has(r, 'Peanuts'));
r = matchScan('Free from: milk, egg, soy', ['milk', 'egg', 'soy'], data);
check('G free-from list → nothing leaks', r.findings.length === 0);
r = matchScan('Mussels, clams, water', ['mollusc'], data);
check('G plural "mussels/clams" → Shellfish (stemming)', has(r, 'Mollusc Shellfish'));
r = matchScan('Anchovies', ['fish'], data);
check('G plural "anchovies" → Fish', has(r, 'Fish'));
r = matchScan('Oats. May contain almonds, walnuts and milk.', ['almond', 'walnut', 'milk'], data);
check('G multi-allergen PAL distributes — almond may', kindFor(r, 'Almond') === 'may');
check('G multi-allergen PAL distributes — walnut may', kindFor(r, 'Walnut') === 'may');
check('G multi-allergen PAL distributes — milk may', kindFor(r, 'Milk and Dairy') === 'may');

// H — DB challenge_corpus.sql (raw label strings → expected outcome)
const fs = require('fs'), path = require('path');
try {
  const sql = fs.readFileSync(path.join(__dirname, '../../../database/challenge_corpus.sql'), 'utf8');
  const re = /\('([^']+)'\s*,\s*'(MATCH|OPAQUE|NONE)'\s*,\s*(NULL|'([^']*)')\)/g;
  let m, cp = 0, cf = 0; const cfails = [];
  while ((m = re.exec(sql))) {
    const raw = m[1], type = m[2], parent = m[4] || null; let good;
    if (type === 'MATCH') good = matchScan(raw, [parent], data).findings.length > 0;
    else if (type === 'OPAQUE') good = matchScan(raw, allParents, data).unverified.length > 0;
    else good = matchScan(raw, allParents, data).findings.length === 0;
    if (good) cp++; else { cf++; cfails.push(`[${type}] "${raw}"${parent ? ' → ' + parent : ''}`); }
  }
  check(`H challenge_corpus (${cp}/${cp + cf})`, cf === 0);
  cfails.slice(0, 25).forEach((x) => console.log('       miss:', x));
} catch (e) { console.log('  (corpus skipped:', e.message, ')'); }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
