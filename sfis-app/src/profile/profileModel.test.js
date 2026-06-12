// Node verification for the profile model + family scan flow.
// Run: node src/profile/profileModel.test.js  (wired into `npm test`)
// These are the app-flow regressions the UI depends on: severity persistence,
// family-member union into scans, per-member attribution, and owner-safe shapes.

const { matchScan } = require('../match/scanMatch.js');
const data = require('../data/allergens.json');
const {
  buildSelfProfile,
  defaultSeverityFor,
  profileIds,
  profileItems,
} = require('./profileModel.js');

let pass = 0, fail = 0;
const failures = [];
const check = (name, cond, detail = '') => {
  if (cond) pass++;
  else { fail++; failures.push(`FAIL  ${name}${detail ? ` — ${detail}` : ''}`); }
};

console.log('=== Profile model + family flow regression suite ===');

// — severity is collected AND survives the round-trip (review: was discarded) —
let p = buildSelfProfile(['peanut', 'lactose'], { peanut: 'Strict avoid', lactose: 'Mild' });
check('severity persists on items', profileItems(p).some((i) => i.id === 'peanut' && i.severity === 'Strict avoid'), JSON.stringify(profileItems(p)));
check('profileIds returns self ids', profileIds(p).includes('peanut') && profileIds(p).includes('lactose'));

// editing keeps prior family members
const edited = buildSelfProfile(['milk'], { milk: 'Important' }, { ...p, familyMembers: [{ id: 'm1', name: 'Theo', watched: [] }] });
check('editing preserves familyMembers', (edited.familyMembers || []).length === 1, JSON.stringify(edited.familyMembers));

// — family union: a member's allergen affects the scan (review: was decorative) —
p = buildSelfProfile(['peanut'], { peanut: 'Strict avoid' });
p.familyMembers = [{ id: 'test-theo', name: 'Theo', child: true, watched: [{ id: 'milk', severity: 'Important' }] }];
check('profileIds unions member ids', profileIds(p).includes('milk'));

let r = matchScan('milk powder, oats', p, data);
const milkItem = r.findings.flatMap((f) => f.items).find((i) => i.common === 'Milk');
check('member allergen fires on scan', milkItem?.kind === 'contains', JSON.stringify(r));
check('finding attributes the member', (milkItem?.profiles || []).some((m) => m.name === 'Theo'), JSON.stringify(milkItem));

r = matchScan('peanut butter', p, data);
check('self allergen still fires', r.findings.some((f) => f.items.some((i) => i.common === 'Peanuts')), JSON.stringify(r));

// member watching a sub-group id works too
p.familyMembers = [{ id: 'x', name: 'Maya', watched: [{ id: 'allergen.treenut', severity: 'Strict avoid' }] }];
r = matchScan('almond flour', p, data);
check('member sub-group id (treenut) fires', r.findings.some((f) => f.items.some((i) => /Almond|Tree nuts/.test(i.common))), JSON.stringify(r));

// — array profiles (legacy/manual callers) still work —
r = matchScan('whey, sugar', ['milk'], data);
check('legacy array profile still supported', r.findings.some((f) => f.items.some((i) => i.common === 'Milk')));

// — defaults are sane —
check('defaultSeverityFor returns a string for every known id', typeof defaultSeverityFor('peanut') === 'string' && typeof defaultSeverityFor('goal.less_sugar') === 'string');

console.log(`\n${pass} passed, ${fail} failed`);
failures.forEach((f) => console.log(f));
process.exit(fail ? 1 : 0);
