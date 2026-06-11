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

  // simple plural fold so label "mussels/anchovies/cods" matches DB "mussel/anchovy/cod"
  function stem(w) {
    if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
    if (w.length > 4 && w.endsWith('ses')) return w.slice(0, -2);
    if (w.length > 4 && w.endsWith('es') && /(x|s|ch|sh)es$/.test(w)) return w.slice(0, -2);
    if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
    return w;
  }
  const wEq = (a, b) => a === b || stem(a) === stem(b);
  // does termWords appear as a contiguous run inside tokenWords? (stem-aware)
  function contains(tokenWords, termWords) {
    if (termWords.length > tokenWords.length) return false;
    for (let i = 0; i + termWords.length <= tokenWords.length; i++) {
      let ok = true;
      for (let j = 0; j < termWords.length; j++) if (!wEq(tokenWords[i + j], termWords[j])) { ok = false; break; }
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

  // ── precautionary (PAL) & free-from detection ──
  const ADVISORY_RE = /\b(?:may (?:also )?contain|may be present|contains? traces|traces of|made (?:in|on)|manufactured (?:in|on)|processed (?:in|on)|produced (?:in|on)|prepared (?:in|on)|packa?ged (?:in|on|where)|in (?:a|the) (?:facility|kitchen|plant|production line)|on (?:shared )?equipment|shared (?:equipment|line|facility)|(?:also )?(?:handles|processes)|not suitable for|cannot guarantee)\b/i;
  const FREE_OPEN_RE = /\b(?:free from(?: the following)?|free of|does ?n.?t contain|does not contain|contains no)\b/i;
  const INLINE_FREE_RE = /\b([a-z][a-z]+)[- ]free\b/ig;
  const ZERO_RE = /\b0\s*(?:g|mg)\s+([a-z][a-z]+)\b/ig;
  const CONTAINS_RE = /\b(?:contains?|ingredients?)\b/i;
  const hasLetters = (s) => /[a-z]{2,}/i.test(s);

  function sgFirstParent(sgid) { const p = D.parents.find((x) => x.sgid === sgid); return p ? p.pid : null; }
  function expandTokens(text) {
    const out = [], inner = [];
    const base = text.replace(/\(([^()]*)\)/g, (m, g) => { inner.push(g); return ' '; });
    [base].concat(inner).forEach((s) => { const r = s.replace(/^[\s:;.\-–—•*]+|[\s:;.]+$/g, '').trim(); if (r) out.push(r); });
    return out;
  }
  // build one finding item for a sub-group, listing all matched specifics
  function buildItem(sgid, domain, specifics, token, may, pal, conf) {
    const sg = subGroupById[sgid];
    const multi = specifics.length > 1;
    const aka = (byParentTerms[sgFirstParent(sgid)] || []).filter((x) => !specifics.some((s) => norm(s) === norm(x))).slice(0, 4);
    const dietNote = domain === 'GOAL' ? 'Relates to your goal.' : 'Doesn’t fit your selection.';
    return {
      common: multi ? pretty(sg.label) : specifics[0],
      technical: multi ? specifics.join(', ') : (pal ? null : token),
      note: (domain === 'ALLERGEN' || domain === 'INTOLERANCE')
        ? (pal ? '“May contain” — precautionary note on the label' : (may ? '“May contain” — depends on source' : null))
        : dietNote,
      derivative: pal ? 'Listed as a precautionary “may contain” statement on the packaging.'
        : (may ? 'May be present depending on source or manufacture.' : `Found on this label${token ? ` as “${token}”` : ''}.`),
      correlation: `Matches ${sg.label} on your profile.`,
      confidence: CONF[conf] || 'Medium',
      aka,
    };
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
  // Segments carry a propagating context: CONTAINS (default) → flips to MAY at a
  // precautionary marker, FREE at a free-from opener; the context applies to the
  // allergens that follow (so "may contain: a, b, c" and "free from: a, b" distribute).
  function scanLabel(label, selectedIds) {
    const watch = new Set(selectedIds || []);
    const text0 = (' ' + label + ' ').replace(/-\s*[\r\n]+\s*/g, ''); // join OCR hyphen line-breaks
    const segs = text0.split(/[,;\n]+|(?<!\d)\.(?!\d)| but /i).map((s) => s.trim()).filter(Boolean);

    const recs = [];           // {sgid, domain, common, token, mc, conf, may, pal}
    const freeSet = new Set();  // sub-groups declared free-from
    const unverified = [];
    let ctx = 'CONTAINS';

    const markFree = (txt) => graphMatches(txt).forEach((m) => freeSet.add(m.sgid));
    const record = (tok, contextMay) => {
      let identified = false;
      graphMatches(tok).forEach((m) => {
        identified = true;
        const may = contextMay || m.mc === 'POSSIBLE' || m.mc === 'AMBIGUOUS';
        recs.push({ sgid: m.sgid, domain: m.domain, common: m.common, token: tok, mc: m.mc, conf: m.conf, may, pal: contextMay });
      });
      const tw = norm(tok).split(' ');
      GOAL_KW.forEach((g) => { if (kwHit(tw, g.kws)) { identified = true; recs.push({ sgid: g.sgid, domain: 'GOAL', common: g.common, token: tok, mc: 'DERIVED', conf: 'MEDIUM', may: false, pal: false }); } });
      DIET_KW.forEach((g) => { if (kwHit(tw, g.kws)) { identified = true; recs.push({ sgid: g.sgid, domain: 'DIETARY_PREFERENCE', common: g.common, token: tok, mc: 'DERIVED', conf: 'MEDIUM', may: false, pal: false }); } });
      if (knownIngredients.has(norm(tok)) || PANTRY.has(norm(tok))) identified = true;
      return identified;
    };

    segs.forEach((seg) => {
      let s = seg;
      s = s.replace(ZERO_RE, (m, w) => { markFree(w); return ' '; });        // "0g lactose" → free lactose
      s = s.replace(INLINE_FREE_RE, (m, w) => { markFree(w); return ' '; }); // "lactose-free" → free lactose, keep the rest
      const adv = ADVISORY_RE.test(s);
      const freeOpen = !adv && FREE_OPEN_RE.test(s);
      if (adv) ctx = 'MAY'; else if (freeOpen) ctx = 'FREE'; else if (CONTAINS_RE.test(s)) ctx = 'CONTAINS';
      const cleaned = s.replace(ADVISORY_RE, ' ').replace(FREE_OPEN_RE, ' ').replace(CONTAINS_RE, ' ')
        .replace(/\b(?:the following|those|traces?|an?|of|that|with|present|sufferers|allergy)\b/ig, ' ');
      expandTokens(cleaned).forEach((tok) => {
        if (ctx === 'FREE') { markFree(tok); return; }
        const identified = record(tok, ctx === 'MAY');
        if (ctx === 'CONTAINS' && !identified && hasLetters(tok)) unverified.push(tok);
      });
    });

    // group by sub-group, aggregate specifics; free-from suppresses only UNCERTAIN matches
    const bySg = {};
    recs.forEach((r) => {
      if (!watch.has(r.sgid)) return;
      const definite = (r.mc === 'DIRECT' || r.mc === 'DERIVED') && !r.pal && !r.may;
      if (freeSet.has(r.sgid) && !definite) return; // a definite ingredient overrides a free-from claim (surfaces contradictions)
      (bySg[r.sgid] = bySg[r.sgid] || { domain: r.domain, sgid: r.sgid, matches: [] }).matches.push(r);
    });

    const groups = {};
    Object.values(bySg).forEach((e) => {
      const may = !e.matches.some((m) => !m.may);
      const pal = e.matches.every((m) => m.pal);
      const specifics = [...new Set(e.matches.map((m) => pretty(m.common)))];
      const def = e.matches.find((m) => !m.may);
      const token = specifics.length === 1 ? ((def && def.token) || e.matches[0].token) : null;
      (groups[e.domain] = groups[e.domain] || []).push(buildItem(e.sgid, e.domain, specifics, token, may, pal, e.matches[0].conf));
    });

    const findings = DOMAIN_ORDER.filter((d) => groups[d] && groups[d].length).map((d) => ({
      cat: DOMAIN_META[d].cat, label: DOMAIN_META[d].label, childLabel: DOMAIN_META[d].child, items: groups[d],
    }));
    const unv = unverified.length ? [{ tier: 'Not in our database', items: [...new Set(unverified)] }] : [];
    return { findings, unverified: unv };
  }

  window.SFIS = {
    searchSubGroups, scanLabel, subGroupById, parentById,
    SEVERITY, SEVERITY_DEFAULT, DOMAIN_META, DOMAIN_ORDER,
    subGroupsByDomain: (dom) => D.subGroups.filter((s) => s.domain === dom),
    domainOf: (sgid) => (subGroupById[sgid] || {}).domain,
    labelOf: (sgid) => (subGroupById[sgid] || {}).label,
  };
})();
