// scanMatch.js — the matching engine (pure, deterministic, no ML — spec §2).
// Input: raw label text + the user's profile (parent ids) + the bundled data.
// Output: { findings:[bar], unverified:[string] } ready for <ResultScreen/>.
//
// Pipeline:
//   1. Pull PRECAUTIONARY (PAL) statements first ("may contain…", "made in a
//      facility that processes…") and remove them from the ingredient text so
//      they read as "May contain", never "Contains".
//   2. Tokenize the ingredient list (commas / semicolons / parentheses → tokens,
//      so "spices (sesame, wheat)" yields sesame + wheat).
//   3. Match each token (whole token, then word-level) against the synonym graph.
//   4. Keep only findings on the user's profile; opaque terms → "Could not verify".
//   5. Group by category; verb = Contains (DIRECT/DERIVED) vs May contain
//      (POSSIBLE/AMBIGUOUS, incl. PAL). Frequency is never used (Decision 7).
//
// CommonJS so it runs in Node (verification) and React Native (metro interop).

function norm(s) { return String(s).toLowerCase().replace(/\s+/g, ' ').trim(); }
function titleCase(s) { return s.replace(/\b\w/g, (c) => c.toUpperCase()); }
function kindOf(mc) { return mc === 'DIRECT' || mc === 'DERIVED' ? 'contains' : 'may'; }

const STOP = new Set(['ingredients', 'ingredient', 'contains', 'allergens',
  'allergen information', 'allergy advice', 'and', 'or', 'other']);

const CAT_LABEL = {
  allergen: 'Allergen Match',
  intolerance: 'Intolerance Note',
  goal: 'May Not Align With Your Goals',
};
const PAL_NOTE = "Listed as a 'may contain' / cross-contact note on the packaging.";

function buildIndex(data) {
  const termMap = new Map(); // normalized term -> [term row, ...] (multi-parent ok)
  for (const t of data.terms) {
    const arr = termMap.get(t.term) || [];
    arr.push(t);
    termMap.set(t.term, arr);
  }
  return { termMap, opaque: new Set(data.opaque) };
}

// find profile-relevant terms inside a free-text phrase (used for PAL spans)
function scanPhrase(phrase, termMap, profile, out) {
  const cleaned = norm(phrase).replace(/[()]/g, ' ');
  const chunks = cleaned.split(/[,;]/);
  for (const ch of chunks) {
    const words = ch.trim().split(' ');
    const candidates = [ch.trim(), ...words];
    for (const c of candidates) {
      if (termMap.has(c)) {
        for (const t of termMap.get(c)) {
          if (profile.has(t.parent)) out.push(t);
        }
      }
    }
  }
}

function matchScan(rawText, profile, data) {
  const { termMap, opaque } = buildIndex(data);
  const prof = new Set(profile);
  let text = ' ' + String(rawText || '').replace(/\r/g, ' ') + ' ';

  // 1. PAL extraction (then strip span so it can't read as "Contains")
  const palHits = [];
  const palRe = /(may contain|made (?:in|on)[^.;\n]*?(?:processes|handles|shared)|manufactured[^.;\n]*?(?:processes|shared))([^.;\n)]*)/gi;
  text = text.replace(palRe, (m, lead, rest) => {
    const found = [];
    scanPhrase(rest, termMap, prof, found);
    for (const t of found) palHits.push({ ...t, kind: 'may', note: PAL_NOTE });
    return ' ';
  });

  // 2. tokenize ingredient list ( () → , so sub-ingredients split out )
  const tokens = text.replace(/[()]/g, ',').split(/[,;.\n]/).map(norm)
    .filter((tk) => tk && !STOP.has(tk));

  // 3. match tokens (whole token, then word-level)
  const ingredientHits = [];
  const unverified = new Set();
  for (const tk of tokens) {
    if (termMap.has(tk)) {
      for (const t of termMap.get(tk)) ingredientHits.push({ ...t, kind: kindOf(t.matchClass), term: t.display });
    } else {
      for (const w of tk.split(' ')) {
        if (w.length >= 3 && termMap.has(w)) {
          for (const t of termMap.get(w)) ingredientHits.push({ ...t, kind: kindOf(t.matchClass), term: t.display });
        }
      }
    }
    if (opaque.has(tk)) unverified.add(tk);
  }

  // 4. keep only profile findings; group by category → parent|kind
  const all = [...ingredientHits, ...palHits].filter((h) => prof.has(h.parent));
  const byCat = {};
  for (const h of all) {
    (byCat[h.cat] = byCat[h.cat] || new Map());
    const key = h.parent + '|' + h.kind;
    let item = byCat[h.cat].get(key);
    if (!item) { item = { parent: h.parent, common: h.parentCommon, kind: h.kind, terms: new Set(), note: null }; byCat[h.cat].set(key, item); }
    if (h.term && norm(h.term) !== norm(h.parentCommon)) item.terms.add(h.term);
    if (h.kind === 'may' && !item.note && h.note) item.note = h.note;
  }

  // dedupe: if a parent is a definite "Contains", drop its "May contain"
  for (const cat of Object.keys(byCat)) {
    const m = byCat[cat];
    for (const [key, item] of [...m]) {
      if (item.kind === 'may' && m.has(item.parent + '|contains')) m.delete(key);
    }
  }

  // 5. assemble (Contains before May contain inside each bar)
  const order = ['allergen', 'intolerance', 'goal'];
  const findings = order.filter((c) => byCat[c]).map((c) => ({
    cat: c,
    label: CAT_LABEL[c],
    items: [...byCat[c].values()]
      .sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'contains' ? -1 : 1))
      .map((it) => ({
        common: it.common,
        technical: it.terms.size ? [...it.terms].join(', ') : undefined,
        kind: it.kind,
        note: it.note || undefined,
      })),
  }));

  return { findings, unverified: [...unverified].map(titleCase) };
}

module.exports = { matchScan };
