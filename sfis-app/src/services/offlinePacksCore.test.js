const data = require('../data/allergens.json');
const { buildSelfProfile } = require('../profile/profileModel.js');
const {
  buildOfflinePackFromData,
  recommendedOfflinePackIds,
  usesLegacyBroadRecommendation,
} = require('./offlinePacksCore.js');

let pass = 0;
let fail = 0;
const failures = [];

function check(name, condition, detail = '') {
  if (condition) pass += 1;
  else {
    fail += 1;
    failures.push(`FAIL  ${name}${detail ? ` - ${detail}` : ''}`);
  }
}

function parentSet(pack) {
  return new Set((pack.data?.terms || []).map((term) => term.parent));
}

console.log('=== Offline pack recommendation suite ===');

const milkOnly = buildSelfProfile(['milk'], { milk: 'Strict avoid' });
const milkRecommended = recommendedOfflinePackIds(milkOnly);
const milkPack = buildOfflinePackFromData(data, milkOnly, milkRecommended);
const milkParents = parentSet(milkPack);

check('milk recommendation is profile-only', milkRecommended.join('|') === 'watchlist', JSON.stringify(milkRecommended));
check('milk pack includes milk terms', milkParents.has('milk'), JSON.stringify([...milkParents]));
check('milk pack does not include peanut terms', !milkParents.has('peanut'), JSON.stringify([...milkParents]));
check('milk pack does not include full Big-9', milkParents.size < 9, JSON.stringify([...milkParents]));
check('milk pack is not legacy broad', !usesLegacyBroadRecommendation(milkPack), JSON.stringify(milkPack.selectedPackIds));

const treeNut = buildSelfProfile(['allergen.treenut'], { 'allergen.treenut': 'Strict avoid' });
const treeNutPack = buildOfflinePackFromData(data, treeNut, recommendedOfflinePackIds(treeNut));
const treeNutParents = parentSet(treeNutPack);
check('tree nut parent expands to almond', treeNutParents.has('almond'), JSON.stringify([...treeNutParents]));
check('tree nut parent expands to cashew', treeNutParents.has('cashew'), JSON.stringify([...treeNutParents]));
check('tree nut pack does not pull milk', !treeNutParents.has('milk'), JSON.stringify([...treeNutParents]));

const mixed = buildSelfProfile(['lactose', 'diet.pescatarian', 'goal.avoid_dates'], {
  lactose: 'Strict',
  'diet.pescatarian': 'Prefer',
  'goal.avoid_dates': 'Avoid',
});
const mixedRecommended = recommendedOfflinePackIds(mixed);
const mixedPack = buildOfflinePackFromData(data, mixed, mixedRecommended);
check('mixed recommendation includes watchlist', mixedRecommended.includes('watchlist'), JSON.stringify(mixedRecommended));
check('mixed recommendation includes intolerances', mixedRecommended.includes('intolerances'), JSON.stringify(mixedRecommended));
check('mixed recommendation includes diet goals feature', mixedRecommended.includes('dietGoals'), JSON.stringify(mixedRecommended));
check('mixed pack enables dietGoals feature', mixedPack.features.dietGoals === true, JSON.stringify(mixedPack.features));

const corruptedPack = buildOfflinePackFromData(data, milkOnly, ['unknown-pack']);
check('corrupted selection falls back to recommended watchlist', corruptedPack.selectedPackIds.join('|') === 'watchlist', JSON.stringify(corruptedPack.selectedPackIds));

console.log(`\n${pass} passed, ${fail} failed`);
if (fail) {
  console.error(failures.join('\n'));
  process.exit(1);
}

