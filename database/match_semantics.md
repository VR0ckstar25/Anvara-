# Match Semantics — Runtime Result Vocabulary

The single most dangerous product outcome is a user reading **"No allergens
detected"** as **"Safe for me."** They are not equivalent. This document defines
the result states the runtime may use and the words it may *never* use. It binds
the database `match_class` and `opaque_terms` model to on-screen language, and
sits under Transfer Note §7 (Result Screen) and the Mirror Principle.

## How a finding reads on screen

Findings appear as amber **match bars** — one per category that has something
(allergen / intolerance / goal). A category with nothing relevant shows **no bar**;
that absence is how "nothing found" is communicated. There is **no per-ingredient
"not detected" label and no overall score** — those would clutter the screen with
non-findings the user does not need. Inside a bar, the **wording** carries the one
distinction that matters:

| Wording on screen | When (DB) | Reads as |
|---|---|---|
| **Contains [X]** | `match_class` DIRECT or DERIVED — the allergen is present | a plain fact about the label |
| **May contain [X]** | `match_class` POSSIBLE or AMBIGUOUS — source/manufacture dependent (refined oils, lecithin, "natural flavours") | an honest "it depends", not an alarm |

**"May contain" also carries precautionary allergen labelling (PAL).** Cross-contact
statements a manufacturer prints away from the ingredient list — *"may contain
peanuts"*, *"made in a facility that also processes tree nuts"* — are warnings, **not
ingredients**, so they can never appear under "Contains". The scan reads them off the
label and surfaces them as **May contain**, with a `note` citing the source
(e.g. *"listed as 'may contain' on the packaging"*).

Ingredients we could not identify stay in the existing **"Could not verify"** gray
section at the bottom (unchanged — this is the "unknown" case).

Both "Contains" and "May contain" sit in the **same amber bar with the same category
tint** — the only difference is the verb. **No second color, no confidence meter, no
good/bad.** Neutral throughout. (The old High/Medium/Low confidence meter is removed:
it misused `confidence_level`, which is search-ordering only — Issue 6.)

## Words the app must NEVER use

`Safe` · `Unsafe` · `Approved` · `Allergen-free` · `Free from` · `OK for you` ·
`You can eat this` · any green check / red cross binary.

The only exception: echoing a **manufacturer-certified** claim verbatim and
attributed (e.g. *"The label states: 'Certified gluten-free'"*) — and even then it
is presented as the manufacturer's claim, not the app's verdict.

## Why "May contain" must exist (and isn't clutter)

It is tempting to collapse everything into one of two buckets: a flat "Contains"
match, or the gray "Could not verify" list. But there is a real middle case the
database can't honestly put in either:

- **Refined peanut oil** usually carries no peanut protein; **lecithin** is usually
  soy but can be egg; **"natural flavours"** may hide milk. These are *identified*
  (so not "could not verify") but *conditional* (so not a flat "Contains").

Two failure modes if we drop the middle:
1. **Call it "Contains" →** we cry wolf. A peanut-allergic user sees "Contains
   peanut" on refined oil that's almost always fine, learns the amber dot
   over-warns, and starts ignoring it — including on a *real* peanut match. Alarm
   fatigue is a safety failure.
2. **Hide it →** false negative on a genuinely uncertain ingredient — the exact
   risk the database is built to prevent.

"May contain" resolves both, and it's also the **Mirror Principle in action**:
stating "this can come from peanut, depending how it's made" is the honest
reflection; a flat "Contains" would be a verdict the app isn't entitled to make.
Cost on screen is one extra word in a bar that already exists — not a new zone.

> Opaque terms (`vegetable oil`, `natural flavours`, `spices`) that map to a
> profile allergen surface as **"May contain"**; opaque terms with no profile link
> stay in the **"Could not verify"** gray list. Either way, silence never reads as
> safety.

## frequency_rank is never risk (and is deferred for v1)

A rare term (`arachis oil`) is not lower-risk than a common one — for the
peanut-allergic user it is critical. Risk derives from `match_class`, never
frequency. `frequency_rank` is **deferred to Phase 2** anyway (Decision 7): USDA
can't supply commercial appearance data, so v1 orders search/type-ahead by
validation status then alphabetically.

## Intolerance is BETA — and treated differently from allergy

`domains.launch_status='BETA'` for INTOLERANCE. Allergy and intolerance differ in
mechanism and severity, and intolerance data (esp. FODMAP / histamine, which are
`EXPERT_REVIEW` / `LOW`) is weaker-sourced than the Big 9 derivatives. So:

- **Visually distinct** from allergy findings (category palette + a BETA treatment),
  so users never read the weaker evidence base as equally authoritative.
- **Softer onboarding severity language** than allergens — already in the spec
  (Q2: "A little uncomfortable / Quite unpleasant / I avoid it completely" vs Q1's
  medication-carrying language). Keep that contrast.
- **Info card for `EXPERT_REVIEW` or `LOW` intolerance entries must state the
  confidence level and suggest confirming with a healthcare provider** for clinical
  certainty. This is the correct boundary: informational with epistemic humility,
  deferring to a professional — *not* the app issuing advice (which also keeps us on
  the non-device side; see `docs/02_security_privacy_legal/intended_use_guardrails.md`).

## Footer — PAL addition (PENDING attorney review)

The mandatory result footer (Content Library §5.7) gains, per founder decision
2026-06-05: *"Precautionary allergen statements such as 'may contain' may not always
be captured."* Implemented in `ui/screens/ResultScreen.jsx`; **attorney must review
before launch.**
