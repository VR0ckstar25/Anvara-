// scanMatch.js — matching engine (deterministic, no ML — spec §2).
// Hardened port of the reference engine (replica/app/matcher.js), verified against
// the adversarial corpus. Input: raw label text + profile (parent ids) + data
// { terms, opaque }. Output: { findings:[bar], unverified:[string] } for <ResultScreen/>.
//
// Pipeline:
//   • Split the label into segments; a CONTAINS / MAY / FREE context propagates
//     across a list (so "may contain: a, b, c" and "free from: a, b" distribute).
//   • Match each token against the synonym graph (stem-aware, longest-term-wins).
//   • Precautionary ("may contain", "made in a facility…") → May contain, never Contains.
//   • Free-from claims ("peanut free", "does not contain X") suppress that allergen,
//     but a definite ingredient elsewhere still surfaces (contradictions aren't hidden).
//   • Keep only findings on the user's profile; opaque/unknown terms → "Could not verify".
//   • Group by parent; verb = Contains (DIRECT/DERIVED) vs May contain (POSSIBLE/AMBIGUOUS, incl. PAL).
//
// CommonJS so it runs in Node (verification) and React Native (metro).

const CAT_LABEL = {
  allergen: 'Allergen Match',
  intolerance: 'Intolerance Note',
  goal: 'May Not Align With Your Goals',
};
const CAT_ORDER = ['allergen', 'intolerance', 'goal'];
const PAL_NOTE = "Listed as a 'may contain' / cross-contact note on the packaging.";

const norm = (s) => String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const titleCase = (s) => s.replace(/\b\w/g, (c) => c.toUpperCase());

// simple plural fold so "mussels/anchovies/cods" match DB "mussel/anchovy/cod"
function stem(w) {
  if (w.length > 4 && w.endsWith('ies')) return w.slice(0, -3) + 'y';
  if (w.length > 4 && w.endsWith('ses')) return w.slice(0, -2);
  if (w.length > 4 && /(x|s|ch|sh)es$/.test(w)) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith('s') && !w.endsWith('ss')) return w.slice(0, -1);
  return w;
}
const wEq = (a, b) => a === b || stem(a) === stem(b);
function contains(tokenWords, termWords) {
  if (termWords.length > tokenWords.length) return false;
  for (let i = 0; i + termWords.length <= tokenWords.length; i++) {
    let ok = true;
    for (let j = 0; j < termWords.length; j++) if (!wEq(tokenWords[i + j], termWords[j])) { ok = false; break; }
    if (ok) return true;
  }
  return false;
}

const ADVISORY_RE = /\b(?:may (?:also )?contain|may be present|contains? traces|traces of|made (?:in|on)|manufactured (?:in|on)|processed (?:in|on)|produced (?:in|on)|prepared (?:in|on)|packa?ged (?:in|on|where)|in (?:a|the) (?:facility|kitchen|plant|production line)|on (?:shared )?equipment|shared (?:equipment|line|facility)|(?:also )?(?:handles|processes)|not suitable for|cannot guarantee)\b/i;
const FREE_OPEN_RE = /\b(?:free from(?: the following)?|free of|does ?n.?t contain|does not contain|contains no)\b/i;
const INLINE_FREE_RE = /\b([a-z][a-z]+)[- ]free\b/ig;
const ZERO_RE = /\b0\s*(?:g|mg)\s+([a-z][a-z]+)\b/ig;
const CONTAINS_RE = /\b(?:contains?|ingredients?)\b/i;
const MC_RANK = { DIRECT: 0, DERIVED: 1, POSSIBLE: 2, AMBIGUOUS: 3 };
const hasLetters = (s) => /[a-z]{2,}/i.test(s);
const PANTRY = new Set(['water', 'sugar', 'salt', 'sea salt', 'cane sugar', 'brown sugar',
  'baking soda', 'baking powder', 'vanilla', 'vanilla extract', 'yeast', 'citric acid'].map(norm));

function expandTokens(text) {
  const out = [], inner = [];
  const base = text.replace(/\(([^()]*)\)/g, (m, g) => { inner.push(g); return ' '; });
  [base].concat(inner).forEach((s) => { const r = s.replace(/^[\s:;.\-–—•*]+|[\s:;.]+$/g, '').trim(); if (r) out.push(r); });
  return out;
}

function matchScan(rawText, profile, data) {
  const prof = new Set(profile || []);
  const termList = data.terms.map((t) => { const n = norm(t.term); return { n, w: n.split(' '), parent: t.parent, common: t.parentCommon, cat: t.cat, mc: t.matchClass, display: t.display || t.term }; });
  const opaque = new Set((data.opaque || []).map(norm));

  function graphMatches(raw) {
    const tw = norm(raw).split(' ');
    const best = {};
    termList.forEach((t) => { if (contains(tw, t.w)) { const cur = best[t.parent]; if (!cur || t.w.length > cur.w.length || (t.w.length === cur.w.length && MC_RANK[t.mc] < MC_RANK[cur.mc])) best[t.parent] = t; } });
    return Object.values(best);
  }

  const text0 = (' ' + String(rawText || '').replace(/\r/g, ' ') + ' ').replace(/-\s*[\r\n]+\s*/g, ''); // join OCR hyphen line-breaks
  const segs = text0.split(/[,;\n]+|\.(?=\s|$)| but /i).map((s) => s.trim()).filter(Boolean);

  const recs = [];            // {parent, common, cat, display, mc, kind, pal}
  const freeSet = new Set();   // parents declared free-from
  const unverified = new Set();
  let ctx = 'CONTAINS';

  const markFree = (txt) => graphMatches(txt).forEach((m) => freeSet.add(m.parent));
  const record = (tok, contextMay) => {
    let identified = false;
    graphMatches(tok).forEach((m) => {
      identified = true;
      const may = contextMay || m.mc === 'POSSIBLE' || m.mc === 'AMBIGUOUS';
      recs.push({ parent: m.parent, common: m.common, cat: m.cat, display: m.display, mc: m.mc, kind: may ? 'may' : 'contains', pal: contextMay });
    });
    const nt = norm(tok);
    if (opaque.has(nt)) { unverified.add(nt); identified = true; }  // opaque always surfaces (never silently dropped)
    if (PANTRY.has(nt)) identified = true;
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
      const nt = norm(tok);
      if (ctx === 'FREE') { markFree(tok); if (opaque.has(nt)) unverified.add(nt); return; }
      const identified = record(tok, ctx === 'MAY');
      if (ctx === 'CONTAINS' && !identified && hasLetters(tok) && !PANTRY.has(nt)) unverified.add(nt);
    });
  });

  // group by parent; free-from suppresses only UNCERTAIN matches (a definite ingredient surfaces contradictions)
  const byParent = {};
  recs.forEach((r) => {
    if (!prof.has(r.parent)) return;
    const definite = (r.mc === 'DIRECT' || r.mc === 'DERIVED') && !r.pal && r.kind === 'contains';
    if (freeSet.has(r.parent) && !definite) return;
    const e = byParent[r.parent] = byParent[r.parent] || { parent: r.parent, common: r.common, cat: r.cat, matches: [] };
    e.matches.push(r);
  });

  const byCat = {};
  Object.values(byParent).forEach((e) => {
    const kind = e.matches.some((m) => m.kind === 'contains') ? 'contains' : 'may';
    const pal = e.matches.every((m) => m.pal);
    const displays = [...new Set(e.matches.filter((m) => !m.pal).map((m) => m.display).filter((d) => norm(d) !== norm(e.common)))];
    (byCat[e.cat] = byCat[e.cat] || []).push({
      common: e.common,
      technical: displays.length ? displays.join(', ') : undefined,
      kind,
      note: kind === 'may' && pal ? PAL_NOTE : undefined,
    });
  });

  const findings = CAT_ORDER.filter((c) => byCat[c] && byCat[c].length).map((c) => ({
    cat: c, label: CAT_LABEL[c],
    items: byCat[c].sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'contains' ? -1 : 1)),
  }));
  return { findings, unverified: [...unverified].map(titleCase) };
}

module.exports = { matchScan };
