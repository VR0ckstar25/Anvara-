// Node verification for the profile model + family scan flow.
// Run: node src/profile/profileModel.test.js  (wired into `npm test`)
// These are the app-flow regressions the UI depends on: severity persistence,
// family-member union into scans, per-member attribution, and owner-safe shapes.

const { matchScan } = require('../match/scanMatch.js');
const data = require('../data/allergens.json');
const {
  buildSelfProfile,
  defaultSeverityFor,
  FAMILY_MEMBER_CAP,
  PROFILE_ITEM_CAP,
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

const tooMany = buildSelfProfile([
  'milk',
  'egg',
  'wheat',
  'soy',
  'peanut',
  'allergen.treenut',
  'fish',
  'allergen.shellfish',
  'sesame',
], {});
check('profile caps self preferences at 8', tooMany.items.length === PROFILE_ITEM_CAP, JSON.stringify(tooMany.items.map((item) => item.id)));

const duplicated = buildSelfProfile(['milk', 'milk', 'egg', 'egg', 'soy'], {});
check('profile dedupes self preferences', duplicated.items.map((item) => item.id).join(',') === 'milk,egg,soy', JSON.stringify(duplicated.items));

const oversizedFamily = buildSelfProfile(['milk'], {}, {
  familyMembers: Array.from({ length: 7 }, (_, index) => ({
    id: `m${index}`,
    name: `Member ${index}`,
    watched: ['milk', 'milk', 'egg', 'wheat', 'soy', 'peanut', 'fish', 'sesame', 'gluten', 'lactose'],
  })),
});
check('profile caps family members to 4', oversizedFamily.familyMembers.length === FAMILY_MEMBER_CAP, JSON.stringify(oversizedFamily.familyMembers));
check('profile caps member watched items to 8', oversizedFamily.familyMembers.every((m) => m.watched.length <= PROFILE_ITEM_CAP), JSON.stringify(oversizedFamily.familyMembers));
check('profile dedupes member watched items', oversizedFamily.familyMembers.every((m) => new Set(m.watched.map((item) => typeof item === 'string' ? item : item.id)).size === m.watched.length), JSON.stringify(oversizedFamily.familyMembers));

console.log(`\n${pass} passed, ${fail} failed`);
failures.forEach((f) => console.log(f));
process.exit(fail ? 1 : 0);
