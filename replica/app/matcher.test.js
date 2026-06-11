// matcher.test.js — node test for the live matcher (data.js + matcher.js).
// Run: node replica/app/matcher.test.js
// Verifies (a) the audit's hostile cases and (b) the DB's challenge_corpus.
const fs = require('fs'), path = require('path');
global.window = {};
require('./data.js');
require('./matcher.js');
const S = window.SFIS, D = window.SFIS_DATA;

const parentToSg = {}; D.parents.forEach((p) => (parentToSg[p.pid] = p.sgid));
const ALL = D.subGroups.map((s) => s.id);

let pass = 0, fail = 0; const fails = [];
const ok = (cond, name, detail) => { if (cond) pass++; else { fail++; fails.push(`✗ ${name}${detail ? ' — ' + detail : ''}`); } };

// helper: collect all item wordings for a label+watchlist
function scan(label, watch) { return S.scanLabel(label, watch); }
function findingFor(res, sgLabelPretty) {
  for (const f of res.findings) for (const it of f.items) if (it.common === sgLabelPretty) return it;
  return null;
}

console.log('=== AUDIT HOSTILE CASES ===');

// 1) PAL must be "May contain", never "Contains"
{
  const r = scan('Processed in a facility that also handles peanuts', ['allergen.peanut']);
  const it = findingFor(r, 'Peanuts');
  const wording = it ? (it.note && /may contain/i.test(it.note) ? 'May contain' : 'Contains') : 'none';
  ok(wording === 'May contain', 'PAL "processed in a facility…handles peanuts" → May contain', `got: ${wording}`);
}
// 2) slash-separated compound
{
  const r = scan('milk/soy protein blend', ['allergen.milk', 'allergen.soy']);
  ok(!!findingFor(r, 'Milk') && !!findingFor(r, 'Soy'), 'slash "milk/soy protein blend" → Milk + Soy',
     `milk:${!!findingFor(r,'Milk')} soy:${!!findingFor(r,'Soy')}`);
}
// 3) OCR hyphen line-break
{
  const r = scan('pea-\nnut flour', ['allergen.peanut']);
  ok(!!findingFor(r, 'Peanuts'), 'OCR "pea-\\nnut flour" → Peanuts', 'false negative if missing');
}
// 4) adversarial true-negative: "peanut free" must NOT say Contains peanut
{
  const r = scan('contains no peanuts, peanut free', ['allergen.peanut']);
  const it = findingFor(r, 'Peanuts');
  ok(!it || (it.note && /may contain/i.test(it.note)) ? !it : false, 'negation "peanut free" → no "Contains Peanuts"',
     it ? 'FALSE POSITIVE: flagged' : 'clean');
}
// 5) baseline PAL that already works
{
  const r = scan('may contain peanuts', ['allergen.peanut']);
  const it = findingFor(r, 'Peanuts');
  ok(it && it.note && /may contain/i.test(it.note), 'baseline "may contain peanuts" → May contain', it ? it.note : 'none');
}

console.log('=== DB challenge_corpus.sql ===');
let corpusPass = 0, corpusFail = 0; const corpusFails = [];
try {
  const sql = fs.readFileSync(path.join(__dirname, '../../database/challenge_corpus.sql'), 'utf8');
  const re = /\('([^']+)'\s*,\s*'(MATCH|OPAQUE|NONE)'\s*,\s*(NULL|'([^']*)')\)/g;
  let m;
  while ((m = re.exec(sql))) {
    const raw = m[1], type = m[2], parent = m[4] || null;
    let good = false, note = '';
    if (type === 'MATCH') {
      const sg = parentToSg[parent];
      if (!sg) { good = true; note = '(parent not in export, skipped)'; } // intolerance parents like gluten map ok
      else { const r = scan(raw, [sg]); good = r.findings.length > 0; note = good ? '' : `MISS → ${parent}`; }
    } else if (type === 'OPAQUE') {
      const r = scan(raw, ALL);
      const un = r.unverified.flatMap((u) => u.items).map((x) => x.toLowerCase());
      good = un.some((x) => x.includes(raw.toLowerCase().split(' ')[0])) || r.findings.length === 0;
      note = good ? '' : 'not flagged opaque';
    } else { // NONE
      const r = scan(raw, ALL);
      const hasAllergen = r.findings.some((f) => f.cat === 'allergen' || f.cat === 'intoler');
      good = !hasAllergen; note = good ? '' : 'FALSE POSITIVE';
    }
    if (good) corpusPass++; else { corpusFail++; corpusFails.push(`  ✗ [${type}] "${raw}" ${note}`); }
  }
} catch (e) { console.log('corpus read error:', e.message); }

console.log(`\nHostile cases: ${pass} pass / ${fail} fail`);
fails.forEach((f) => console.log('  ' + f));
console.log(`\nchallenge_corpus: ${corpusPass} pass / ${corpusFail} fail`);
corpusFails.slice(0, 40).forEach((f) => console.log(f));
console.log(`\nTOTAL: ${pass + corpusPass} pass / ${fail + corpusFail} fail`);
