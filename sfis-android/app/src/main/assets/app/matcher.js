// matcher.js — runtime search + label matching over the real DB export (data.js).
// Plain JS (loaded before the React screens). Exposes window.SFIS.
//
// What's real: allergen + intolerance matching via the 363-term synonym graph,
// with match_class → "Contains" (DIRECT/DERIVED) vs "May contain" (POSSIBLE/
// AMBIGUOUS / PAL), per database/match_semantics.md. Goal & dietary use a small
// keyword pass (nutrient data isn't on an ingredient line). Unidentified tokens
// fall to "Could not verify" — never a silent "not found".

(function () {
  const D = window.SFIS_DATA;
  const norm = (s) => (s || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

  const subGroupById = {}; D.subGroups.forEach((sg) => (subGroupById[sg.id] = sg));
  const parentById = {}; D.parents.forEach((p) => (parentById[p.pid] = p));

  // domain → theme palette key + on-screen labels (adult / child)
  const DOMAIN_META = {
    ALLERGEN:           { cat: 'allergen', label: 'Allergen match',             child: 'Things you’re allergic to' },
    INTOLERANCE:        { cat: 'intoler',  label: 'Intolerance note',           child: 'Things that upset your tummy' },
    DIETARY_PREFERENCE: { cat: 'goal',     label: 'Doesn’t fit your diet',      child: 'Doesn’t fit how you eat' },
    GOAL:               { cat: 'goal',     label: 'May not align with your goals', child: 'Things you’re cutting back on' },
  };
  const DOMAIN_ORDER = ['ALLERGEN', 'INTOLERANCE', 'DIETARY_PREFERENCE', 'GOAL'];

  // tailored severity scales (founder decision 2026-06-06)
  const SEVERITY = {
    ALLERGEN:           ['Mild', 'Moderate', 'Severe'],
    INTOLERANCE:        ['Mild', 'Moderate', 'Severe'],
    DIETARY_PREFERENCE: ['Flexible', 'Strict'],
    GOAL:               ['Casual', 'Focused', 'Strict'],
  };
  const SEVERITY_DEFAULT = { ALLERGEN: 'Moderate', INTOLERANCE: 'Moderate', DIETARY_PREFERENCE: 'Strict', GOAL: 'Focused' };

  const PRETTY = { 'Milk and Dairy': 'Milk', 'Soybeans': 'Soy', 'Tree Nuts': 'Tree nuts', 'Crustacean Shellfish': 'Shellfish', 'Mollusc Shellfish': 'Shellfish' };
  const pretty = (s) => PRETTY[s] || s;
  const CONF = { HIGH: 'High', MEDIUM: 'Medium', LOW: 'Low' };

  // ── term index: normalized term → {pid, sgid, domain, common, mc, conf, term}
  const termList = [];
  const byParentTerms = {}; // pid → [term,...]  (for "also labeled as")
  function addTerm(term, pid, mc, conf) {
    const p = parentById[pid]; if (!p || !term) return;
    termList.push({ n: norm(term), w: norm(term).split(' '), term, pid, sgid: p.sgid, domain: p.domain, common: p.common, mc, conf });
    (byParentTerms[pid] = byParentTerms[pid] || []).push(term);
  }
  D.synonyms.forEach((s) => addTerm(s.term, s.pid, s.mc, s.conf));
  D.parents.forEach((p) => { addTerm(p.common, p.pid, 'DIRECT', 'HIGH'); if (p.technical) addTerm(p.technical, p.pid, 'DIRECT', 'HIGH'); });
  // sub-group labels as matchable terms (e.g. a generic "tree nuts" on a PAL line,
  // which the per-nut parents don't cover). pid === sgid for these synthetic terms.
  D.subGroups.forEach((sg) => termList.push({ n: norm(sg.label), w: norm(sg.label).split(' '), term: sg.label, pid: sg.id, sgid: sg.id, domain: sg.domain, common: pretty(sg.label), mc: 'DIRECT', conf: 'HIGH' }));

  const knownIngredients = new Set(D.ingredients.map((i) => norm(i.norm || i.name)));
  const PANTRY = new Set(['salt', 'sea salt', 'water', 'baking soda', 'baking powder', 'vanilla', 'vanilla extract',
    'yeast', 'citric acid', 'spices', 'natural color', 'vegetable oil', 'canola oil']);

  // lightweight goal / dietary keyword passes
  const GOAL_KW = [
    { sgid: 'goal.less_sugar',   common: 'Added sugars',  kws: ['sugar', 'cane sugar', 'glucose', 'glucose syrup', 'corn syrup', 'fructose', 'sucrose', 'dextrose', 'honey', 'molasses', 'syrup'] },
    { sgid: 'goal.less_sodium',  common: 'Sodium',        kws: ['salt', 'sodium', 'monosodium glutamate', 'msg'] },
    { sgid: 'goal.less_sat_fat', common: 'Saturated fat', kws: ['palm oil', 'butter', 'coconut oil', 'lard', 'palm kernel oil'] },
  ];
  const DIET_KW = [
    { sgid: 'diet.vegan',      common: 'Animal-derived', kws: ['milk', 'butter', 'whey', 'casein', 'egg', 'eggs', 'honey', 'gelatin', 'gelatine', 'lard', 'fish', 'meat', 'beef', 'chicken', 'pork'] },
    { sgid: 'diet.vegetarian', common: 'Meat or fish',   kws: ['gelatin', 'gelatine', 'lard', 'fish', 'anchovy', 'meat', 'beef', 'chicken', 'pork', 'rennet'] },
  ];

  // does termWords appear as a contiguous run inside tokenWords?
  function contains(tokenWords, termWords) {
    if (termWords.length > tokenWords.length) return false;
    for (let i = 0; i + termWords.length <= tokenWords.length; i++) {
      let ok = true;
      for (let j = 0; j < termWords.length; j++) if (tokenWords[i + j] !== termWords[j]) { ok = false; break; }
      if (ok) return true;
    }
    return false;
  }
  const kwHit = (tokenWords, kws) => kws.some((k) => contains(tokenWords, norm(k).split(' ')));

  // ── onboarding search: query → up to 8 sub-groups, with "matched via" term ──
  function searchSubGroups(query) {
    const q = norm(query); if (!q) return [];
    const hits = {};
    const consider = (sgid, via, rank) => { if (!hits[sgid] || rank < hits[sgid].rank) hits[sgid] = { sgid, domain: subGroupById[sgid].domain, label: subGroupById[sgid].label, via, rank }; };
    D.subGroups.forEach((sg) => { const n = norm(sg.label); if (n === q) consider(sg.id, null, 0); else if (n.indexOf(q) === 0) consider(sg.id, null, 1); else if (n.indexOf(q) >= 0) consider(sg.id, null, 2); });
    termList.forEach((t) => { let r = -1; if (t.n === q) r = 0; else if (t.n.indexOf(q) === 0) r = 1; else if (t.n.indexOf(q) >= 0) r = 2; if (r >= 0) { const via = norm(subGroupById[t.sgid].label) === t.n ? null : t.term; consider(t.sgid, via, r + 0.5); } });
    return Object.values(hits).sort((a, b) => a.rank - b.rank).slice(0, 8);
  }

  // ── label tokenizer: returns ingredient tokens + PAL ("may contain") items ──
  function tokenize(label) {
    const palItems = [];
    let text = ' ' + label + ' ';
    text = text.replace(/(?:may contain(?: traces of)?|contains traces of|traces of|made (?:in|on)[^.,;]*?(?:processes|handles))\s+([^.;\n]+)/gi,
      (m, grp) => { grp.split(/,| and | & /).forEach((g) => { const r = g.trim().replace(/\.$/, ''); if (r) palItems.push(r); }); return ' '; });
    const tokens = [];
    text.split(/[,;\n]/).forEach((part) => {
      const inner = [];
      part = part.replace(/\(([^)]*)\)/g, (m, g) => { inner.push(g); return ' '; });
      [part].concat(inner).forEach((s) => { const r = s.trim().replace(/\.$/, ''); if (r) tokens.push(r); });
    });
    return { tokens, palItems };
  }

  // best graph matches for one raw token → [{pid, mc, conf, domain, sgid, common}] (one per parent)
  const MC_RANK = { DIRECT: 0, DERIVED: 1, POSSIBLE: 2, AMBIGUOUS: 3 };
  function graphMatches(raw) {
    const tw = norm(raw).split(' ');
    const best = {};
    // per parent, prefer the most specific (longest) matching term; tie-break by
    // match_class. So "soy lecithin" (POSSIBLE) wins over generic "soy" (DIRECT).
    termList.forEach((t) => { if (contains(tw, t.w)) { const cur = best[t.pid]; if (!cur || t.w.length > cur.w.length || (t.w.length === cur.w.length && MC_RANK[t.mc] < MC_RANK[cur.mc])) best[t.pid] = t; } });
    return Object.values(best);
  }

  // ── main: scan a label against a profile (selected sub-group ids) ──
  function scanLabel(label, selectedIds) {
    const watch = new Set(selectedIds || []);
    const { tokens, palItems } = tokenize(label);
    const groups = {}; // domain → { sgid → item }
    const seenIdentified = []; // tokens we recognized at all
    const unverifiedNames = [];

    const addItem = (sgid, domain, rawToken, wording, conf, viaCommon) => {
      const sg = subGroupById[sgid]; if (!sg) return;
      const g = (groups[domain] = groups[domain] || {});
      const isMay = wording === 'May contain';
      const existing = g[sgid];
      // prefer a "Contains" over a previously-recorded "May contain"
      if (existing && existing._may && !isMay) { /* upgrade below */ } else if (existing) return;
      const aka = (byParentTerms[sgFirstParent(sgid)] || []).filter((x) => norm(x) !== norm(rawToken)).slice(0, 4);
      g[sgid] = {
        common: pretty(viaCommon || sg.label),
        technical: rawToken,
        note: domain === 'ALLERGEN' || domain === 'INTOLERANCE'
          ? (isMay ? '“May contain” — depends on source' : null)
          : (domain === 'GOAL' ? 'Relates to your goal.' : 'Doesn’t fit your selection.'),
        derivative: isMay ? `Appears here as “${rawToken}” — may be present depending on source or manufacture.`
                          : `Found on this label as “${rawToken}.”`,
        correlation: `Matches ${sg.label} on your profile.`,
        confidence: CONF[conf] || 'Medium',
        aka, _may: isMay,
      };
    };

    function sgFirstParent(sgid) { const p = D.parents.find((x) => x.sgid === sgid); return p ? p.pid : null; }

    function handleToken(raw, forcePal) {
      let identified = false;
      // allergen / intolerance via synonym graph
      graphMatches(raw).forEach((m) => {
        identified = true;
        if (!watch.has(m.sgid)) return;
        const isMay = forcePal || m.mc === 'POSSIBLE' || m.mc === 'AMBIGUOUS';
        addItem(m.sgid, m.domain, raw, isMay ? 'May contain' : 'Contains', m.conf, m.common);
      });
      const tw = norm(raw).split(' ');
      // goal keywords
      GOAL_KW.forEach((g) => { if (kwHit(tw, g.kws)) { identified = true; if (watch.has(g.sgid)) addItem(g.sgid, 'GOAL', raw, 'Contains', 'MEDIUM', g.common); } });
      // dietary keywords
      DIET_KW.forEach((g) => { if (kwHit(tw, g.kws)) { identified = true; if (watch.has(g.sgid)) addItem(g.sgid, 'DIETARY_PREFERENCE', raw, 'Contains', 'MEDIUM', g.common); } });
      // known-but-irrelevant / pantry → identified, no finding
      if (knownIngredients.has(norm(raw)) || PANTRY.has(norm(raw))) identified = true;
      if (forcePal) return; // PAL items never go to "could not verify"
      if (!identified) unverifiedNames.push(raw.replace(/\b\w/g, (c) => c)); // keep original casing-ish
    }

    tokens.forEach((t) => handleToken(t, false));
    palItems.forEach((t) => handleToken(t, true));

    const findings = DOMAIN_ORDER.filter((d) => groups[d] && Object.keys(groups[d]).length).map((d) => ({
      cat: DOMAIN_META[d].cat, label: DOMAIN_META[d].label, childLabel: DOMAIN_META[d].child,
      items: Object.values(groups[d]).map((it) => { delete it._may; return it; }),
    }));
    const unverified = unverifiedNames.length ? [{ tier: 'Not in our database', items: unverifiedNames }] : [];
    return { findings, unverified };
  }

  window.SFIS = {
    searchSubGroups, scanLabel, subGroupById, parentById,
    SEVERITY, SEVERITY_DEFAULT, DOMAIN_META, DOMAIN_ORDER,
    subGroupsByDomain: (dom) => D.subGroups.filter((s) => s.domain === dom),
    domainOf: (sgid) => (subGroupById[sgid] || {}).domain,
    labelOf: (sgid) => (subGroupById[sgid] || {}).label,
  };
})();
