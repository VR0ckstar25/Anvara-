// engine.js — the REAL matching engine (no UI). Runs in the browser (reads
// window.SFIS_DATA) and in Node (for tests). Mirrors the production scan flow:
// tokenize label text → match against the synonym graph for the user's profile →
// classify Contains vs May contain (match_class) → detect PAL → flag opaque terms.
(function () {
  const root = typeof window !== 'undefined' ? window : global;
  const D = root.SFIS_DATA || (root.window && root.window.SFIS_DATA);

  const norm = s => (s || '').toLowerCase().replace(/[‘’']/g, '')
    .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();

  const synsByParent = {};
  D.synonyms.forEach(s => { (synsByParent[s.parent] = synsByParent[s.parent] || []).push(s); });
  const opaqueByNorm = Object.fromEntries(D.opaque.map(o => [o.norm, o.note]));
  const parentsOfSub = sub => D.parents.filter(p => p.sub === sub);
  const subLabel = id => (D.subGroups.find(s => s.id === id) || {}).label || id;

  const PAL_KW = {
    'allergen.milk': ['milk', 'dairy'], 'allergen.egg': ['egg', 'eggs'], 'allergen.peanut': ['peanut', 'peanuts'],
    'allergen.treenut': ['tree nut', 'tree nuts', 'almond', 'almonds', 'walnut', 'cashew', 'pecan', 'pistachio', 'hazelnut', 'macadamia', 'brazil nut', 'pine nut'],
    'allergen.soy': ['soy', 'soya', 'soybean', 'soybeans'], 'allergen.wheat': ['wheat'], 'allergen.fish': ['fish'],
    'allergen.shellfish': ['shellfish', 'crustacean', 'shrimp', 'prawn', 'crab', 'lobster', 'mollusc', 'clam', 'oyster'], 'allergen.sesame': ['sesame'],
  };
  const hasWord = (hay, needle) => (' ' + hay + ' ').indexOf(' ' + needle + ' ') >= 0;

  function runMatch(text, selectedSubs) {
    const lines = text.split(/\n/);
    const palRe = /may contain|may also contain|made in a facility|manufactured in a facility|processed in (a|the) facility|produced in a facility|traces of/i;
    const palText = norm(lines.filter(l => palRe.test(l)).join(' '));
    const ingText = lines.filter(l => !palRe.test(l)).join(', ').replace(/[()]/g, ',');
    const tokens = ingText.split(/[,;\n]/).map(norm).filter(Boolean);

    const byParent = {};
    const upgrade = (cur, cand) => !cur ? cand : (cur.kind === 'contains' ? cur : (cand.kind === 'contains' ? cand : cur));

    selectedSubs.forEach(sub => parentsOfSub(sub).forEach(P => {
      (synsByParent[P.id] || []).forEach(syn => {
        if (tokens.some(t => hasWord(t, syn.norm))) {
          const term = norm(syn.term) !== norm(P.common) ? syn.term : null;
          byParent[P.id] = upgrade(byParent[P.id], { common: P.common, kind: syn.kind, term, note: syn.note, domain: P.domain });
        }
      });
    }));

    selectedSubs.forEach(sub => {
      const parents = parentsOfSub(sub);
      if (parents.some(P => byParent[P.id])) return;          // already matched in this sub
      const kws = PAL_KW[sub] || [];
      if (palText && kws.some(kw => hasWord(palText, kw))) {
        const P = parents[0]; if (!P) return;
        byParent['PAL:' + sub] = {
          common: (P.domain === 'ALLERGEN' && parents.length > 1) ? subLabel(sub) : P.common,
          kind: 'may', term: null,
          note: 'listed as a precautionary “may contain / made in a facility” statement', domain: P.domain,
        };
      }
    });

    const items = Object.values(byParent);
    const mk = (cat, label) => {
      const it = items.filter(i => i.domain === (cat === 'allergen' ? 'ALLERGEN' : 'INTOLERANCE'))
        .map(i => ({ common: i.common, technical: i.term, kind: i.kind, note: i.note }));
      return it.length ? { cat, label, items: it } : null;
    };
    const findings = [mk('allergen', 'Allergen Match'), mk('intolerance', 'Intolerance Note')].filter(Boolean);

    const seen = new Set(), unverified = [];
    tokens.forEach(t => {
      if (opaqueByNorm[t] !== undefined && !seen.has(t)) {
        seen.add(t); unverified.push({ term: t.replace(/\b\w/g, c => c.toUpperCase()), note: opaqueByNorm[t] });
      }
    });
    return { findings, unverified };
  }

  const api = { runMatch, subLabel };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.SFIS_ENGINE = api;
})();
