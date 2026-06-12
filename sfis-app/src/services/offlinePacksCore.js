import { profileIds } from '../profile/profileModel.js';

const TREE_NUTS = new Set(['almond', 'walnut', 'cashew', 'pecan', 'pistachio', 'hazelnut', 'brazil_nut', 'macadamia', 'pine_nut']);
const SHELLFISH = new Set(['crustacean', 'mollusc']);
export const OFFLINE_RECOMMENDATION_VERSION = 2;

export const OFFLINE_PACKS = [
  {
    id: 'watchlist',
    title: 'My Profile Only',
    sub: 'Recommended. Downloads only the allergens and requirements you picked.',
    recommended: true,
  },
  {
    id: 'big9',
    title: 'Big-9 Allergens',
    sub: 'Optional broader safety pack for all major allergens.',
  },
  {
    id: 'intolerances',
    title: 'Intolerances',
    sub: 'Added only when your profile includes intolerance requirements.',
  },
  {
    id: 'dietGoals',
    title: 'Diet + Goals',
    sub: 'Added only when your profile includes diet or goal requirements.',
  },
  {
    id: 'opaque',
    title: 'Could Not Verify',
    sub: 'Optional. Flags vague terms like natural flavors.',
  },
];

const VALID_OFFLINE_PACK_IDS = new Set(OFFLINE_PACKS.map((pack) => pack.id));

function parentIdsForProfile(profile) {
  const selected = new Set(profileIds(profile));
  if (selected.has('allergen.treenut')) TREE_NUTS.forEach((id) => selected.add(id));
  if (selected.has('allergen.shellfish')) SHELLFISH.forEach((id) => selected.add(id));
  if (selected.has('allergen.milk')) selected.add('milk');
  if (selected.has('allergen.egg')) selected.add('egg');
  if (selected.has('allergen.wheat')) selected.add('wheat');
  if (selected.has('allergen.soy')) selected.add('soy');
  if (selected.has('allergen.peanut')) selected.add('peanut');
  if (selected.has('allergen.fish')) selected.add('fish');
  if (selected.has('allergen.sesame')) selected.add('sesame');
  return selected;
}

function includeTerm(term, packIds, profileParents) {
  if (packIds.has('watchlist') && profileParents.has(term.parent)) return true;
  if (packIds.has('big9') && term.cat === 'allergen') return true;
  if (packIds.has('intolerances') && term.cat === 'intolerance') return true;
  return false;
}

export function recommendedOfflinePackIds(profile) {
  const ids = new Set(['watchlist']);
  const watched = profileIds(profile);
  if (watched.some((id) => id.startsWith('diet.') || id.startsWith('goal.'))) ids.add('dietGoals');
  if (watched.some((id) => id === 'lactose' || id === 'gluten' || id.startsWith('intol.'))) ids.add('intolerances');
  return Array.from(ids);
}

export function usesLegacyBroadRecommendation(pack) {
  return !!(
    pack
    && !pack.recommendationVersion
    && Array.isArray(pack.selectedPackIds)
    && pack.selectedPackIds.includes('watchlist')
    && pack.selectedPackIds.includes('big9')
  );
}

function normalizedPackIdSet(profile, selectedPackIds) {
  const fallback = recommendedOfflinePackIds(profile).filter((id) => VALID_OFFLINE_PACK_IDS.has(id));
  const raw = Array.isArray(selectedPackIds) && selectedPackIds.length ? selectedPackIds : fallback;
  const valid = raw.filter((id) => VALID_OFFLINE_PACK_IDS.has(id));
  return new Set(valid.length ? valid : fallback);
}

export function buildOfflinePackFromData(sourceData, profile, selectedPackIds) {
  const packIds = normalizedPackIdSet(profile, selectedPackIds);
  const profileParents = parentIdsForProfile(profile);
  const terms = (sourceData.terms || []).filter((term) => includeTerm(term, packIds, profileParents));
  const parentIds = new Set(terms.map((term) => term.parent));
  const parents = Object.fromEntries(Object.entries(sourceData.parents || {}).filter(([id]) => parentIds.has(id)));
  const opaque = packIds.has('opaque') ? (sourceData.opaque || []) : [];
  const offlineData = {
    version: sourceData.version,
    generatedAt: sourceData.generatedAt,
    validationState: sourceData.validationState,
    note: sourceData.note,
    terms,
    opaque,
    parents,
  };
  const serialized = JSON.stringify(offlineData);
  return {
    id: `offline-${Date.now()}`,
    recommendationVersion: OFFLINE_RECOMMENDATION_VERSION,
    selectedPackIds: Array.from(packIds),
    data: offlineData,
    features: { dietGoals: packIds.has('dietGoals') },
    downloadedAt: new Date().toISOString(),
    bytes: serialized.length,
    termCount: terms.length,
  };
}

export function estimateOfflinePackFromData(sourceData, profile, selectedPackIds) {
  const pack = buildOfflinePackFromData(sourceData, profile, selectedPackIds);
  return {
    bytes: pack.bytes,
    termCount: pack.termCount,
    selectedPackIds: pack.selectedPackIds,
  };
}

export function formatBytes(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`;
  return `${Math.round(bytes / 1024 / 102.4) / 10} MB`;
}
