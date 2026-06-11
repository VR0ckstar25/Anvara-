// scanMatch.js — production matcher ported from the hardened reference engine.
// Pure JS: deterministic, offline, Node-testable, and Metro-compatible.
//
// Input: raw label text + selected profile ids + the bundled DB export.
// Selected ids may be parent ids ("milk", "almond") or sub-group ids
// ("allergen.milk", "allergen.treenut"). Output is ready for <ResultScreen/>.

const CAT_LABEL = {
  allergen: 'Allergen match',
  intolerance: 'Intolerance note',
  goal: 'May not align with your goals',
  dietary: "Doesn't fit your diet",
};

const DOMAIN_ORDER = ['allergen', 'intolerance', 'dietary', 'goal'];
const CONF = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' };
const PRETTY = {
  'Milk and Dairy': 'Milk',
  Soybeans: 'Soy',
  'Tree Nuts': 'Tree nuts',
  'Crustacean Shellfish': 'Shellfish',
  'Mollusc Shellfish': 'Shellfish',
};

const TREE_NUT_PARENTS = new Set([
  'almond', 'walnut', 'cashew', 'pecan', 'pistachio',
  'hazelnut', 'brazil_nut', 'macadamia', 'pine_nut',
]);
const SHELLFISH_PARENTS = new Set(['crustacean', 'mollusc']);

const GROUPS = {
  milk: { id: 'allergen.milk', label: 'Milk and Dairy', cat: 'allergen' },
  egg: { id: 'allergen.egg', label: 'Eggs', cat: 'allergen' },
  wheat: { id: 'allergen.wheat', label: 'Wheat', cat: 'allergen' },
  soy: { id: 'allergen.soy', label: 'Soybeans', cat: 'allergen' },
  peanut: { id: 'allergen.peanut', label: 'Peanuts', cat: 'allergen' },
  fish: { id: 'allergen.fish', label: 'Fish', cat: 'allergen' },
  sesame: { id: 'allergen.sesame', label: 'Sesame', cat: 'allergen' },
  lactose: { id: 'intol.lactose', label: 'Lactose', cat: 'intolerance' },
  gluten: { id: 'intol.gluten', label: 'Gluten', cat: 'intolerance' },
  fructose: { id: 'intol.fructose', label: 'Fructose', cat: 'intolerance' },
  histamine: { id: 'intol.histamine', label: 'Histamine', cat: 'intolerance' },
  sulfites: { id: 'intol.sulfites', label: 'Sulfites', cat: 'intolerance' },
  caffeine: { id: 'intol.caffeine', label: 'Caffeine', cat: 'intolerance' },
  sweeteners: { id: 'intol.sweeteners', label: 'Artificial Sweeteners', cat: 'intolerance' },
  fodmaps: { id: 'intol.fodmaps', label: 'FODMAPs', cat: 'intolerance' },
};

for (const parent of TREE_NUT_PARENTS) GROUPS[parent] = { id: 'allergen.treenut', label: 'Tree Nuts', cat: 'allergen' };
for (const parent of SHELLFISH_PARENTS) GROUPS[parent] = { id: 'allergen.shellfish', label: 'Shellfish', cat: 'allergen' };

const SUBGROUPS = Object.values(GROUPS).reduce((acc, g) => {
  acc[g.id] = g;
  return acc;
}, {});

const PANTRY = new Set([
  'salt', 'sea salt', 'water', 'sugar', 'rice', 'carrot', 'ascorbic acid',
  'baking soda', 'baking powder', 'vanilla', 'vanilla extract', 'yeast',
  'citric acid', 'canola oil', 'sunflower oil', 'palm oil', 'maltodextrin',
]);

const ADVISORY_RE = /\b(?:may (?:also )?contain|may be present|contains? traces|traces of|made (?:in|on)|manufactured (?:in|on)|processed (?:in|on)|produced (?:in|on)|prepared (?:in|on)|packa?ged (?:in|on|where)|in (?:a|the) (?:facility|kitchen|plant|production line)|on (?:shared )?equipment|shared (?:equipment|line|facility)|(?:also )?(?:handles|processes)|not suitable for|cannot guarantee)\b/i;
// NOTE: bare "no" is deliberately NOT an opener — "no sugar added, peanuts" must
// still flag peanuts. Only explicit free-from claims free the allergens they name.
const FREE_OPEN_RE = /\b(?:free from(?: the following)?|free of|does ?n.?t contain|does not contain|contains no)\b/i;
const INLINE_FREE_RE = /\b([a-z][a-z]+)[- ]free\b/ig;
const ZERO_RE = /\b0\s*(?:g|mg)\s+([a-z][a-z]+)\b/ig;
const CONTAINS_RE = /\b(?:contains?|ingredients?|allergens?)\b/i;

const GOAL_KW = [
  { id: 'goal.less_sugar', cat: 'goal', common: 'Added sugars', kws: ['sugar', 'cane sugar', 'glucose', 'glucose syrup', 'corn syrup', 'fructose', 'sucrose', 'dextrose', 'honey', 'molasses', 'syrup'] },
  { id: 'goal.less_sodium', cat: 'goal', common: 'Sodium', kws: ['salt', 'sodium', 'monosodium glutamate', 'msg'] },
  { id: 'goal.less_sat_fat', cat: 'goal', common: 'Saturated fat', kws: ['palm oil', 'butter', 'coconut oil', 'lard', 'palm kernel oil'] },
];
const DIET_KW = [
  { id: 'diet.vegan', cat: 'dietary', common: 'Animal-derived', kws: ['milk', 'butter', 'whey', 'casein', 'egg', 'eggs', 'honey', 'gelatin', 'gelatine', 'lard', 'fish', 'meat', 'beef', 'chicken', 'pork'] },
  { id: 'diet.vegetarian', cat: 'dietary', common: 'Meat or fish', kws: ['gelatin', 'gelatine', 'lard', 'fish', 'anchovy', 'meat', 'beef', 'chicken', 'pork', 'rennet'] },
];

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[‘’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function displayName(s) {
  return PRETTY[s] || s;
}

function titleCase(s) {
  return String(s).replace(/\b\w/g, (c) => c.toUpperCase());
}

function stem(w) {
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 4 && w.endsWith('ses')) return w.slice(0, -2);
  if (w.length > 4 && w.endsWith('es') && /(x|s|ch|sh)es$/.test(w)) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}

function ocrKey(s) {
  return norm(s)
    .replace(/0/g, 'o')
    .replace(/[1!|]/g, 'l')
    .replace(/3/g, 'e')
    .replace(/4/g, 'a')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/rn/g, 'm')
    .replace(/\s+/g, '');
}

function wEq(a, b) {
  return a === b || stem(a) === stem(b);
}

function containsWords(tokenWords, termWords) {
  if (!termWords.length || termWords.length > tokenWords.length) return false;
  for (let i = 0; i + termWords.length <= tokenWords.length; i++) {
    let ok = true;
    for (let j = 0; j < termWords.length; j++) {
      if (!wEq(tokenWords[i + j], termWords[j])) { ok = false; break; }
    }
    if (ok) return true;
  }
  return false;
}

function compactMatch(token, term) {
  const tc = token.replace(/\s+/g, '');
  const ec = term.replace(/\s+/g, '');
  if (ec.length < 4) return false;
  if (term.includes(' ')) return tc.includes(ec);
  return tc === ec;
}

function fuzzyMatch(token, term) {
  const tk = ocrKey(token);
  const ek = ocrKey(term);
  if (ek.length < 3) return false;
  if (tk === ek) return true;
  if (ek.length < 4) return false;
  if (term.includes(' ') && tk.includes(ek)) return true;
  if (!term.includes(' ') && tk.length === ek.length) return editDistanceLe1(tk, ek);
  return false;
}

function editDistanceLe1(a, b) {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, edits = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++edits > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else { i++; j++; }
  }
  return edits + (i < a.length || j < b.length ? 1 : 0) <= 1;
}

function parentGroup(parent) {
  return GROUPS[parent] || { id: parent, label: parent, cat: 'allergen' };
}

function watchFromProfile(profile, data) {
  const selected = new Set(profile || []);
  const groups = new Set();
  const parents = new Set();
  selected.forEach((id) => {
    if (SUBGROUPS[id]) groups.add(id);
    if (data.parents && data.parents[id]) {
      parents.add(id);
      groups.add(parentGroup(id).id);
    }
  });
  if (groups.has('allergen.treenut')) TREE_NUT_PARENTS.forEach((p) => parents.add(p));
  if (groups.has('allergen.shellfish')) SHELLFISH_PARENTS.forEach((p) => parents.add(p));
  return { selected, groups, parents };
}

function buildIndex(data) {
  const terms = [];
  const add = (row) => {
    const n = norm(row.term);
    if (!n) return;
    const parentMeta = data.parents[row.parent] || {};
    const group = parentGroup(row.parent);
    terms.push({
      n,
      w: n.split(' '),
      compact: n.replace(/\s+/g, ''),
      ocr: ocrKey(n),
      display: row.display || titleCase(n),
      parent: row.parent,
      groupId: group.id,
      groupLabel: group.label,
      parentCommon: row.parentCommon || parentMeta.common || titleCase(row.parent),
      cat: row.cat || parentMeta.cat || group.cat,
      matchClass: row.matchClass || 'DIRECT',
      note: row.note || null,
    });
  };
  (data.terms || []).forEach(add);

  // Group-level terms make generic PAL clauses like "not suitable for nut allergy
  // sufferers" distributable without inventing a specific nut.
  [
    { term: 'tree nut', parent: 'allergen.treenut', groupId: 'allergen.treenut', groupLabel: 'Tree Nuts', cat: 'allergen' },
    { term: 'tree nuts', parent: 'allergen.treenut', groupId: 'allergen.treenut', groupLabel: 'Tree Nuts', cat: 'allergen' },
    { term: 'nuts', parent: 'allergen.treenut', groupId: 'allergen.treenut', groupLabel: 'Tree Nuts', cat: 'allergen' },
    { term: 'dairy', parent: 'milk', groupId: 'allergen.milk', groupLabel: 'Milk and Dairy', cat: 'allergen' },
    { term: 'shellfish', parent: 'allergen.shellfish', groupId: 'allergen.shellfish', groupLabel: 'Shellfish', cat: 'allergen' },
  ].forEach((row) => {
    const n = norm(row.term);
    terms.push({
      n,
      w: n.split(' '),
      compact: n.replace(/\s+/g, ''),
      ocr: ocrKey(n),
      display: titleCase(n),
      parent: row.parent,
      groupId: row.groupId,
      groupLabel: row.groupLabel,
      parentCommon: row.groupLabel,
      cat: row.cat,
      matchClass: 'DIRECT',
      note: null,
      synthetic: true,
    });
  });

  const byParentTerms = {};
  terms.forEach((t) => {
    if (!t.synthetic) (byParentTerms[t.parent] = byParentTerms[t.parent] || []).push(t.display);
  });

  return { terms, opaque: new Set((data.opaque || []).map(norm)), byParentTerms };
}

function plantDairyFalsePositive(token, term, parent) {
  if (parent !== 'milk') return false;
  const n = norm(token);
  const t = norm(term);
  const plantPrefix = /\b(?:coconut|almond|cashew|oat|soy|soya|rice|hemp|pea|macadamia|hazelnut|walnut|pistachio|peanut|cocoa|cacao|shea|sunflower|sesame)\s+(?:milk|butter|cream|cheese)\b/.test(n);
  const nonDairy = /\b(?:vegan|plant based|non dairy|dairy free)\b.*\b(?:milk|butter|cream|cheese)\b/.test(n);
  if ((plantPrefix || nonDairy) && ['milk', 'butter', 'cream', 'cheese', 'dairy'].includes(t)) return true;
  if (/\bcream\s+(?:of\s+)?tartar\b/.test(n) && t === 'cream') return true;
  return false;
}

function tokenMatchesTerm(token, term) {
  const n = norm(token);
  if (!n) return false;
  const words = n.split(' ');
  if (containsWords(words, term.w)) return true;
  if (compactMatch(n, term.n)) return true;
  return fuzzyMatch(n, term.n);
}

function graphMatches(raw, index) {
  const best = {};
  const rank = { DIRECT: 0, DERIVED: 1, POSSIBLE: 2, AMBIGUOUS: 3 };
  index.terms.forEach((t) => {
    if (!tokenMatchesTerm(raw, t)) return;
    if (plantDairyFalsePositive(raw, t.n, t.parent)) return;
    const key = t.parent + '|' + t.groupId;
    const cur = best[key];
    if (!cur || t.w.length > cur.w.length || (t.w.length === cur.w.length && rank[t.matchClass] < rank[cur.matchClass])) {
      best[key] = t;
    }
  });
  return Object.values(best);
}

function expandTokens(text) {
  const out = [], inner = [];
  const base = text.replace(/\(([^()]*)\)/g, (m, g) => { inner.push(g); return ' '; });
  [base].concat(inner).forEach((s) => {
    const r = s.replace(/^[\s:;.\-–—•*]+|[\s:;.]+$/g, '').trim();
    if (r) out.push(r);
  });
  return out;
}

function markFree(txt, freeGroups, index) {
  graphMatches(txt, index).forEach((m) => freeGroups.add(m.groupId));
}

function isKnown(tok, index) {
  const n = norm(tok);
  return PANTRY.has(n) || index.opaque.has(n) || graphMatches(tok, index).length > 0;
}

function buildItem(entry, index) {
  const matches = entry.matches;
  const may = !matches.some((m) => !m.may);
  const pal = matches.every((m) => m.pal);
  const specifics = [...new Set(matches.map((m) => displayName(m.common)))];
  const multi = specifics.length > 1;
  const first = matches.find((m) => !m.may) || matches[0];
  const common = multi ? displayName(entry.groupLabel) : specifics[0];
  const aka = (index.byParentTerms[first.parent] || [])
    .filter((x) => !specifics.some((s) => norm(s) === norm(x)))
    .slice(0, 4);

  return {
    common,
    technical: multi ? specifics.join(', ') : (pal ? undefined : first.token),
    kind: may ? 'may' : 'contains',
    note: pal ? "Listed as a 'may contain' / cross-contact note on the packaging."
      : may ? (first.note || 'May be present depending on source or manufacture.')
        : undefined,
    derivative: pal ? "Listed as a precautionary 'may contain' statement on the packaging."
      : `Found on this label${first.token ? ` as "${first.token}"` : ''}.`,
    correlation: `Matches ${entry.groupLabel} on your profile.`,
    confidence: CONF[first.confidence] || 'Medium',
    aka,
  };
}

function watched(match, watch) {
  return watch.groups.has(match.groupId) || watch.parents.has(match.parent) || watch.selected.has(match.groupId);
}

function kwHit(tokenWords, kws) {
  return kws.some((k) => containsWords(tokenWords, norm(k).split(' ')));
}

function matchScan(rawText, profile, data) {
  const index = buildIndex(data);
  const watch = watchFromProfile(profile, data);
  const text0 = (' ' + String(rawText || '') + ' ')
    .replace(/-\s*[\r\n]+\s*/g, '')
    .replace(/\b(?:[a-z]\.){2,}[a-z]?\b/gi, (m) => m.replace(/\./g, ''));
  const segs = text0.split(/[,;\n]+|(?<!\d)\.(?!\d)| but /i).map((s) => s.trim()).filter(Boolean);

  const recs = [];
  const freeGroups = new Set();
  const unverified = new Set();
  let ctx = 'CONTAINS';

  const record = (tok, contextMay) => {
    let identified = false;
    graphMatches(tok, index).forEach((m) => {
      identified = true;
      const may = contextMay || m.matchClass === 'POSSIBLE' || m.matchClass === 'AMBIGUOUS';
      recs.push({
        groupId: m.groupId,
        groupLabel: m.groupLabel,
        parent: m.parent,
        cat: m.cat,
        common: m.parentCommon,
        token: tok,
        matchClass: m.matchClass,
        confidence: m.matchClass === 'DIRECT' || m.matchClass === 'DERIVED' ? 'HIGH' : 'MEDIUM',
        may,
        pal: contextMay,
        note: m.note,
      });
    });

    const tw = norm(tok).split(' ');
    GOAL_KW.forEach((g) => {
      if (watch.selected.has(g.id) && kwHit(tw, g.kws)) {
        identified = true;
        recs.push({ groupId: g.id, groupLabel: g.common, parent: g.id, cat: 'goal', common: g.common, token: tok, matchClass: 'DERIVED', confidence: 'MEDIUM', may: false, pal: false });
      }
    });
    DIET_KW.forEach((g) => {
      if (watch.selected.has(g.id) && kwHit(tw, g.kws)) {
        identified = true;
        recs.push({ groupId: g.id, groupLabel: g.common, parent: g.id, cat: 'dietary', common: g.common, token: tok, matchClass: 'DERIVED', confidence: 'MEDIUM', may: false, pal: false });
      }
    });

    return identified || isKnown(tok, index);
  };

  segs.forEach((seg) => {
    let s = seg;
    s = s.replace(ZERO_RE, (m, w) => { markFree(w, freeGroups, index); return ' '; });
    s = s.replace(INLINE_FREE_RE, (m, w) => {
      markFree(w, freeGroups, index);
      return /^(?:dairy|milk)$/i.test(w) ? ' non dairy ' : ' ';
    });

    const advisory = ADVISORY_RE.test(s);
    const freeOpen = !advisory && FREE_OPEN_RE.test(s);
    // Free-from is SEGMENT-SCOPED (never propagates across commas): a free claim
    // frees only the allergens it names, so "contains no artificial flavors, milk
    // powder" still flags milk. MAY/PAL DOES propagate so "may contain a, b, c"
    // distributes across the list. A free claim ends the clause → next is CONTAINS.
    if (advisory) ctx = 'MAY';
    else if (freeOpen) ctx = 'CONTAINS';
    else if (CONTAINS_RE.test(s)) ctx = 'CONTAINS';
    const segCtx = freeOpen ? 'FREE' : ctx;

    const cleaned = s
      .replace(ADVISORY_RE, ' ')
      .replace(FREE_OPEN_RE, ' ')
      .replace(CONTAINS_RE, ' ')
      .replace(/\b(?:the following|those|traces?|an?|of|that|with|present|sufferers|allergy|advice)\b/ig, ' ');

    expandTokens(cleaned).forEach((tok) => {
      if (segCtx === 'FREE') { markFree(tok, freeGroups, index); return; }
      const identified = record(tok, segCtx === 'MAY');
      const n = norm(tok);
      if (index.opaque.has(n)) unverified.add(n);
      else if (segCtx === 'CONTAINS' && !identified && /[a-z]{2,}/i.test(tok)) unverified.add(n);
    });
  });

  const byGroup = {};
  recs.forEach((r) => {
    if (!watched(r, watch)) return;
    const definite = (r.matchClass === 'DIRECT' || r.matchClass === 'DERIVED') && !r.pal && !r.may;
    if (freeGroups.has(r.groupId) && !definite) return;
    (byGroup[r.groupId] = byGroup[r.groupId] || { groupId: r.groupId, groupLabel: r.groupLabel, cat: r.cat, matches: [] }).matches.push(r);
  });

  const byCat = {};
  Object.values(byGroup).forEach((entry) => {
    (byCat[entry.cat] = byCat[entry.cat] || []).push(buildItem(entry, index));
  });

  const findings = DOMAIN_ORDER.filter((cat) => byCat[cat] && byCat[cat].length).map((cat) => ({
    cat: cat === 'dietary' ? 'goal' : cat,
    label: CAT_LABEL[cat],
    items: byCat[cat].sort((a, b) => (a.kind === b.kind ? a.common.localeCompare(b.common) : a.kind === 'contains' ? -1 : 1)),
  }));

  return { findings, unverified: [...unverified].filter(Boolean).map(titleCase) };
}

module.exports = { matchScan };
