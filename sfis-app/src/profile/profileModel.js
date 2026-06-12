export const SEVERITY = {
  allergen: ['Flag it', 'Important', 'Strict avoid'],
  intolerance: ['Light', 'Moderate', 'Strict'],
  diet: ['Heads-up', 'Prefer', 'Avoid'],
  goal: ['Heads-up', 'Prefer less', 'Avoid'],
};

export const PROFILE_ITEM_CAP = 8;
export const FAMILY_MEMBER_CAP = 4;

const LEGACY_SEVERITY = {
  Trace: 'Flag it',
  Some: 'Important',
  'Any amount': 'Strict avoid',
  Mild: 'Light',
  Notice: 'Heads-up',
};

export const PROFILE_SECTIONS = [
  {
    title: 'Allergies',
    palette: 'allergen',
    items: [
      { id: 'milk', label: 'Milk and Dairy', aliases: ['whey', 'butter', 'casein'] },
      { id: 'egg', label: 'Eggs', aliases: ['albumen'] },
      { id: 'wheat', label: 'Wheat', aliases: ['flour', 'gluten'] },
      { id: 'soy', label: 'Soybeans', aliases: ['soy lecithin'] },
      { id: 'peanut', label: 'Peanuts', aliases: ['groundnut'] },
      { id: 'allergen.treenut', label: 'All Tree Nuts', aliases: ['almond', 'cashew', 'walnut'] },
      { id: 'almond', label: 'Almonds', aliases: ['almond flour', 'almond butter'] },
      { id: 'cashew', label: 'Cashews', aliases: ['cashew cream', 'cashew butter'] },
      { id: 'walnut', label: 'Walnuts', aliases: ['black walnut'] },
      { id: 'pecan', label: 'Pecans', aliases: ['pecan meal'] },
      { id: 'pistachio', label: 'Pistachios', aliases: ['pistachio paste'] },
      { id: 'hazelnut', label: 'Hazelnuts', aliases: ['filbert', 'gianduja'] },
      { id: 'brazil_nut', label: 'Brazil Nuts', aliases: ['brazilnut'] },
      { id: 'macadamia', label: 'Macadamia Nuts', aliases: ['macadamia oil'] },
      { id: 'pine_nut', label: 'Pine Nuts', aliases: ['pignoli', 'pinoli'] },
      { id: 'fish', label: 'Fish', aliases: ['cod', 'anchovy'] },
      { id: 'allergen.shellfish', label: 'All Shellfish', aliases: ['shrimp', 'crab', 'mollusc'] },
      { id: 'crustacean', label: 'Crustacean Shellfish', aliases: ['shrimp', 'crab', 'lobster', 'prawn'] },
      { id: 'mollusc', label: 'Mollusc Shellfish', aliases: ['clam', 'oyster', 'mussel', 'scallop'] },
      { id: 'sesame', label: 'Sesame', aliases: ['tahini'] },
    ],
  },
  {
    title: 'Intolerances',
    badge: 'Beta',
    palette: 'intolerance',
    items: [
      { id: 'lactose', label: 'Lactose', aliases: ['milk sugar', 'whey'] },
      { id: 'gluten', label: 'Gluten', aliases: ['barley', 'rye'] },
      { id: 'fructose', label: 'Fructose', aliases: ['fruit sugar'] },
      { id: 'histamine', label: 'Histamine', aliases: ['fermented'] },
      { id: 'sulfites', label: 'Sulfites', aliases: ['sulphites'] },
      { id: 'caffeine', label: 'Caffeine', aliases: ['coffee'] },
      { id: 'sweeteners', label: 'Artificial Sweeteners', aliases: ['aspartame'] },
      { id: 'fodmaps', label: 'FODMAPs', aliases: ['inulin'] },
    ],
  },
  {
    title: 'Diet',
    palette: 'diet',
    items: [
      { id: 'diet.vegan', label: 'Vegan', aliases: ['animal-derived'] },
      { id: 'diet.vegetarian', label: 'Vegetarian', aliases: ['meat', 'fish'] },
      { id: 'diet.pescatarian', label: 'Pescatarian', aliases: ['pescetarian', 'fish ok', 'no meat'] },
      { id: 'diet.no_red_meat', label: 'No Red Meat', aliases: ['beef', 'lamb', 'veal'] },
      { id: 'diet.no_pork', label: 'No Pork', aliases: ['ham', 'bacon', 'lard'] },
      { id: 'diet.no_poultry', label: 'No Poultry', aliases: ['chicken', 'turkey', 'duck'] },
    ],
  },
  {
    title: 'Goals',
    palette: 'goal',
    optional: true,
    items: [
      { id: 'goal.less_sugar', label: 'Less added sugar', aliases: ['sugar', 'syrup'] },
      { id: 'goal.less_sodium', label: 'Less sodium', aliases: ['salt', 'msg'] },
      { id: 'goal.less_sat_fat', label: 'Less saturated fat', aliases: ['palm oil'] },
      { id: 'goal.avoid_dates', label: 'Avoid dates', aliases: ['dates', 'date paste', 'date syrup'] },
    ],
  },
];

export const PROFILE_ITEMS = PROFILE_SECTIONS.flatMap((section) => section.items.map((item) => ({
  ...item,
  section: section.title,
  palette: section.palette,
})));

export const PROFILE_LABELS = Object.fromEntries(PROFILE_ITEMS.map((item) => [item.id, item]));

export const BIG_NINE_SELECTIONS = ['milk', 'egg', 'wheat', 'soy', 'peanut', 'allergen.treenut', 'fish', 'allergen.shellfish', 'sesame'];

export function defaultSeverityFor(id) {
  const item = PROFILE_LABELS[id];
  const scale = SEVERITY[item?.palette || 'goal'];
  return scale[Math.min(1, scale.length - 1)];
}

export function normalizeSeverityFor(id, severity, palette) {
  const item = PROFILE_LABELS[id];
  const scale = SEVERITY[palette || item?.palette || 'goal'] || SEVERITY.goal;
  const mapped = LEGACY_SEVERITY[severity] || severity;
  return scale.includes(mapped) ? mapped : defaultSeverityFor(id);
}

function idFromWatched(item) {
  if (typeof item === 'string') return item;
  return item?.id || null;
}

function uniqueIds(ids = []) {
  const out = [];
  const seen = new Set();
  (Array.isArray(ids) ? ids : []).forEach((id) => {
    if (!id || seen.has(id)) return;
    seen.add(id);
    out.push(id);
  });
  return out;
}

function watchedIds(items = []) {
  return (Array.isArray(items) ? items : []).map(idFromWatched).filter(Boolean);
}

function capWatchedItems(items = []) {
  const seen = new Set();
  return (Array.isArray(items) ? items : []).filter((item) => {
    const id = idFromWatched(item);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  }).slice(0, PROFILE_ITEM_CAP);
}

function capFamilyMembers(members = []) {
  return (Array.isArray(members) ? members : []).slice(0, FAMILY_MEMBER_CAP).map((member, index) => {
    const capped = {
      ...member,
      id: member?.id || `member-${index}`,
      name: member?.name || 'Family member',
    };
    if (Array.isArray(member?.watched)) capped.watched = capWatchedItems(member.watched);
    if (Array.isArray(member?.items)) capped.items = capWatchedItems(member.items);
    return capped;
  });
}

export function profileIds(profile) {
  if (Array.isArray(profile)) return profile;
  const ids = new Set(watchedIds(profile?.items));
  (profile?.familyMembers || []).forEach((member) => {
    watchedIds(member.watched || member.items).forEach((id) => ids.add(id));
  });
  return Array.from(ids);
}

export function profileItems(profile) {
  if (Array.isArray(profile)) {
    return profile.map((id) => ({
      ...(PROFILE_LABELS[id] || { id, label: id, palette: 'goal', section: 'Goals and diet' }),
      severity: defaultSeverityFor(id),
    }));
  }
  return (profile?.items || []).map((item) => ({
    ...(PROFILE_LABELS[item.id] || { id: item.id, label: item.label || item.id, palette: item.category || 'goal', section: 'Saved' }),
    ...item,
    palette: item.palette || item.category || PROFILE_LABELS[item.id]?.palette || 'goal',
    severity: normalizeSeverityFor(item.id, item.severity, item.palette || item.category),
  }));
}

export function buildSelfProfile(selectedIds, severityById = {}, previousProfile = null) {
  const now = new Date().toISOString();
  const cappedIds = uniqueIds(selectedIds).slice(0, PROFILE_ITEM_CAP);
  return {
    id: previousProfile?.id || 'self',
    name: previousProfile?.name || 'You',
    type: previousProfile?.type || 'adult',
    createdAt: previousProfile?.createdAt || now,
    updatedAt: now,
    familyMembers: capFamilyMembers(previousProfile?.familyMembers),
    items: cappedIds.map((id) => {
      const source = PROFILE_LABELS[id] || { id, label: id, palette: 'goal', section: 'Saved' };
      return {
        id,
        label: source.label,
        category: source.palette,
        palette: source.palette,
        severity: normalizeSeverityFor(id, severityById[id], source.palette),
      };
    }),
  };
}
