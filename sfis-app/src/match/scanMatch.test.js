// Node verification for the production matcher. Run: npm run test:match
const fs = require('fs');
const path = require('path');
const { matchScan } = require('./scanMatch.js');
const data = require('../data/allergens.json');

let pass = 0, fail = 0;
const failures = [];
const check = (name, cond, detail = '') => {
  if (cond) pass++;
  else { fail++; failures.push(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`); }
};

const ALL = Object.keys(data.parents);
const bar = (r, cat) => r.findings.find((f) => f.cat === cat);
const items = (r) => r.findings.flatMap((f) => f.items.map((it) => ({ ...it, cat: f.cat })));
const item = (r, common) => items(r).find((i) => i.common === common);
const hasKind = (r, common, kind) => item(r, common)?.kind === kind;
const noAllergen = (r) => !(bar(r, 'allergen')?.items || []).length;
const hasUnverified = (r, term) => r.unverified.some((u) => u.toLowerCase().includes(term.toLowerCase().split(' ')[0]));

console.log('=== Production matcher regression suite ===');

// Baseline/reference parity
let r = matchScan('Ingredients: wheat flour, sugar, peanut oil, whey, tahini, natural flavors, salt.',
  ['peanut', 'milk', 'sesame'], data);
check('baseline peanut -> Contains', hasKind(r, 'Peanuts', 'contains'));
check('baseline milk via whey -> Contains', hasKind(r, 'Milk', 'contains'));
check('baseline sesame via tahini -> Contains', hasKind(r, 'Sesame', 'contains'));
check('baseline wheat hidden if not on profile', !item(r, 'Wheat'));
check('baseline opaque natural flavors -> Could not verify', hasUnverified(r, 'natural flavors'));

r = matchScan('Ingredients: oats, sugar. May contain almonds.', ['almond'], data);
check('PAL almond -> May contain', hasKind(r, 'Almond', 'may'), JSON.stringify(r));
check('PAL note present', /may contain|cross-contact/i.test(item(r, 'Almond')?.note || ''));

r = matchScan('Ingredients: potatoes, canola oil, spices (sesame, wheat), salt. Contains: Wheat, Sesame.',
  ['sesame', 'wheat'], data);
check('parenthetical sesame -> Contains', hasKind(r, 'Sesame', 'contains'));
check('parenthetical wheat -> Contains', hasKind(r, 'Wheat', 'contains'));

r = matchScan('Ingredients: peanuts. May contain peanuts.', ['peanut'], data);
check('Contains beats PAL for same parent', hasKind(r, 'Peanuts', 'contains'));
check('Contains/PAL dedupes same parent', items(r).filter((i) => i.common === 'Peanuts').length === 1);

r = matchScan('milk/soy protein blend', ['milk', 'soy'], data);
check('slash milk/soy finds milk', hasKind(r, 'Milk', 'contains'));
check('slash milk/soy finds soy', hasKind(r, 'Soy', 'contains'));

r = matchScan('Processed in a facility that also handles peanuts', ['peanut'], data);
check('processed-in-facility PAL -> May contain', hasKind(r, 'Peanuts', 'may'));

r = matchScan('pea-\nnut flour', ['peanut'], data);
check('OCR hyphen line-break -> peanut', hasKind(r, 'Peanuts', 'contains'));

r = matchScan('contains no peanuts, peanut free', ['peanut'], data);
check('free-from peanut does not false-positive', !item(r, 'Peanuts'), JSON.stringify(r));

// Wave 2 — OCR tolerance
r = matchScan('Ingredients: mi1k, alrnonds, peanutbutter, egg5, c0d, soy lec ithin.',
  ['milk', 'almond', 'peanut', 'egg', 'fish', 'soy'], data);
check('OCR mi1k -> Milk', hasKind(r, 'Milk', 'contains'), JSON.stringify(r));
check('OCR alrnonds -> Almond', hasKind(r, 'Almond', 'contains'), JSON.stringify(r));
check('OCR peanutbutter -> Peanuts', hasKind(r, 'Peanuts', 'contains'), JSON.stringify(r));
check('OCR egg5 -> Eggs', hasKind(r, 'Eggs', 'contains'), JSON.stringify(r));
check('OCR c0d -> Fish', hasKind(r, 'Fish', 'contains'), JSON.stringify(r));
check('OCR soy lec ithin -> Soy May contain', hasKind(r, 'Soy', 'may'), JSON.stringify(r));

r = matchScan('p.e.a.n.u.t.s and pea nut pieces', ['peanut'], data);
check('OCR extra spaces/punctuation -> Peanuts', hasKind(r, 'Peanuts', 'contains'), JSON.stringify(r));

// Wave 3 — false-positive guards + dairy data gap
r = matchScan('coconut milk, cocoa butter, cream of tartar, butterfly pea tea',
  ['milk', 'peanut', 'almond'], data);
check('plant-word dairy/pea guards prevent allergen false positives', noAllergen(r), JSON.stringify(r));

r = matchScan('dairy-free cheese, vegan butter', ['milk'], data);
check('non-dairy cheese/butter guard prevents milk false positives', noAllergen(r), JSON.stringify(r));

r = matchScan('cheese, butter, cream', ['milk', 'lactose'], data);
check('DB gap cheese/butter/cream -> Milk allergen', hasKind(r, 'Milk', 'contains'), JSON.stringify(r));
check('cheese/butter/cream still supports lactose intolerance', hasKind(r, 'Lactose', 'contains') || hasKind(r, 'Lactose', 'may'), JSON.stringify(r));

r = matchScan('almonds, walnuts, cashews', ['almond', 'walnut', 'cashew'], data);
check('multiple tree nuts collapse to Tree nuts group', hasKind(r, 'Tree nuts', 'contains'), JSON.stringify(r));
check('tree nut specifics retained', /Almond.*Walnut.*Cashew|Almond.*Cashew.*Walnut/.test(item(r, 'Tree nuts')?.technical || ''), JSON.stringify(item(r, 'Tree nuts')));

r = matchScan('fat-free milk', ['milk'], data);
check('fat-free milk still flags milk', hasKind(r, 'Milk', 'contains'), JSON.stringify(r));

r = matchScan('may contain milk, eggs, soy and tree nuts', ['milk', 'egg', 'soy', 'almond'], data);
check('PAL distributes to milk', hasKind(r, 'Milk', 'may'), JSON.stringify(r));
check('PAL distributes to egg', hasKind(r, 'Eggs', 'may'), JSON.stringify(r));
check('PAL distributes to soy', hasKind(r, 'Soy', 'may'), JSON.stringify(r));
check('PAL distributes to generic tree nuts', hasKind(r, 'Tree nuts', 'may'), JSON.stringify(r));

// Wave 4 — negation safety (adversarial review): a free-from / "no X" claim must
// never swallow a co-located REAL allergen in the same comma list.
r = matchScan('contains no artificial flavors, milk powder', ['milk'], data);
check('negation: "contains no artificial flavors, milk powder" -> Milk', hasKind(r, 'Milk', 'contains'), JSON.stringify(r));
r = matchScan('no sugar added, peanuts', ['peanut'], data);
check('negation: "no sugar added, peanuts" -> Peanuts', hasKind(r, 'Peanuts', 'contains'), JSON.stringify(r));
r = matchScan('no artificial colors, peanut flour', ['peanut'], data);
check('negation: "no artificial colors, peanut flour" -> Peanuts', hasKind(r, 'Peanuts', 'contains'), JSON.stringify(r));
r = matchScan('contains no peanuts', ['peanut'], data);
check('negation: "contains no peanuts" -> no peanut finding', !item(r, 'Peanuts'), JSON.stringify(r));

// DB hostile challenge corpus: production matcher should resolve MATCH rows and
// surface OPAQUE rows under Could not verify.
console.log('=== DB challenge_corpus.sql ===');
let corpusTotal = 0;
try {
  const sql = fs.readFileSync(path.join(__dirname, '../../../database/challenge_corpus.sql'), 'utf8');
  const valuesBlock = (sql.match(/INSERT INTO challenge_corpus[\s\S]*?;\n/) || [''])[0];
  const re = /\('([^']+)'\s*,\s*'(MATCH|OPAQUE|NONE)'\s*,\s*(NULL|'([^']*)')\)/g;
  let m;
  while ((m = re.exec(valuesBlock))) {
    const raw = m[1], type = m[2], parent = m[4] || null;
    corpusTotal++;
    const result = matchScan(raw, parent ? [parent] : ALL, data);
    if (type === 'MATCH') {
      check(`corpus MATCH ${raw} -> ${parent}`, result.findings.length > 0, JSON.stringify(result));
    } else if (type === 'OPAQUE') {
      check(`corpus OPAQUE ${raw}`, hasUnverified(result, raw), JSON.stringify(result));
    } else {
      check(`corpus NONE ${raw}`, noAllergen(result), JSON.stringify(result));
    }
  }
} catch (e) {
  check('challenge corpus readable', false, e.message);
}

console.log(`\n${pass} passed, ${fail} failed (${corpusTotal} corpus rows)`);
failures.slice(0, 80).forEach((f) => console.log(f));
process.exit(fail ? 1 : 0);
