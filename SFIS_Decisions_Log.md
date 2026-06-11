# SFIS — Decisions Log & Reconciliation (single source of truth)

Read this **alongside** Transfer Note v3.0, Amendments v3.1, the Design Note, and
Content Library v1.1. Where this log conflicts with an older document, **this log
wins** — it exists because decisions were drifting across separate notes.

Last updated: **2026-06-05.**

---

## A. Stale statements in v3.0 — superseded (do not build from these)

| v3.0 says | Actually | Source of truth |
|---|---|---|
| 12-day trial | **14-day** trial | Amendments §8.1 |
| Open Food Facts = product-name API at launch | **USDA**; OFF deferred to **Phase 2** | Amendments Dec. 2,3,4 |
| "Content Library v1.0" | **v1.1** (supersedes v1.0) | Content Library v1.1 |
| "Session X of 4" (in SFIS_3) | **of 5** | doc set |
| Sync/data "WiFi only — never mobile data" (§3.1) | **relaxed** — see Decision 2 below | this log |
| Result bars are warm-amber/orange/blue-gray tint (Design Note §4/§6.1) | **minimal white card + rail** | this log, Decision 4 |

---

## B. Decisions — 2026-06-05

1. **`frequency_rank` deferred to Phase 2.** USDA (nutrient composition) cannot
   supply commercial appearance frequency; only the Phase-2 Open Food Facts layer
   can. v1 orders type-ahead / priority cache by **validation status, then
   alphabetically**. Column kept (nullable). Frequency is search-ordering only,
   never risk.

2. **Connectivity relaxed (supersedes §3.1 WiFi-only).** On-demand ingredient
   lookups and **text-only** log sync **may use mobile data**. Bulk sub-group
   downloads / DB updates default to WiFi with a user toggle to allow mobile data.
   **Images never leave the device, ever.**

3. **Selective download confirmed (Decision 6).** After onboarding, the user's
   chosen sub-groups ship to the device and work **fully offline** (their profile).
   The **rest of the database is reached online on demand** (general "search any
   ingredient" — now works over mobile data per Decision 2).

4. **Result bar = minimal** (white card + bold category rail + universal amber dot).
   Founder decision; **supersedes Design Note §4/§6.1 tinted bars.** Category still
   differentiated; intolerance visually distinct + BETA.

5. **Amber dot = relevance — confirmed.** "Filled amber circle = a finding relevant
   to the user's profile is present in this category; absent = nothing relevant
   found." It is **not** an error/compromise signal. Unidentified ingredients and
   processing failures live in the gray **"Could not verify"** list / error states —
   never the amber dot.

6. **PAL footer sentence added** (ATTORNEY REVIEW PENDING). Content Library §5.7
   footer gains: *"Precautionary allergen statements such as 'may contain' may not
   always be captured."* Implemented in `ui/screens/ResultScreen.jsx`.

7. **Efficacy claim = directional/internal only.** "Saves 2–3 minutes" is a future
   marketing/positioning claim. **Not user-facing** until substantiated (Legal §8).
   ⏳ **Revisit when designing promotions / App Store copy.**

8. **Intolerance treatment.** BETA; visually distinct from allergens; softer
   onboarding severity language (already in spec); and for `EXPERT_REVIEW`/`LOW`
   intolerance entries the **info card states the confidence level and suggests
   confirming with a healthcare provider** — informational + humble, not advisory.

9. **UT Dallas = validation (essential) vs branding (promotional).** See §C — the
   validation is required; the UT Dallas *name* is the swappable promotional wrapper.

10. **Build order — new Step 1.5.** Between the schema sprint and broad feature dev:
    **one complete vertical slice** — single allergen, real OCR → real matching →
    real result screen — before any other feature. Confirms integration; surfaces
    what specs can't. *Schema sprint → thin slice → broad build (not schema → broad).*

11. **External-validator schedule risk — accepted, mitigated by parallelism.** Start
    UT Dallas + attorney outreach **now**; build everything that doesn't need their
    sign-off in parallel. The app can be **built** completely; it cannot be
    **launched** until they deliver.

---

## C. Why UT Dallas validation is NOT just promotion (answer to the question)

The **UT Dallas brand** is promotional and swappable. The **validation it performs
is safety-critical and required**, regardless of who does it. If we skipped
independent expert validation and shipped the DRAFT data:

- **Safety:** the synonym graph is seeded but unverified. An error = a **false
  negative** = a user with a severe allergy eats the thing they were avoiding. This
  is the failure the whole database exists to prevent.
- **Legal/liability:** shipping unvalidated safety-critical data, then a reaction
  occurs, is far harder to defend than "independently cross-validated by qualified
  food scientists."
- **Functional:** the type-ahead gate only shows `CONFIRMED`/`UT_DALLAS_REVIEWED`.
  Until a qualified reviewer signs off, **nothing surfaces** — so validation is a
  hard dependency, not a nice-to-have.

**Takeaway:** keep the validation step (any qualified validator — food-science
faculty, allergist, RD); treat the *UT Dallas name* as marketing to confirm later
(same bucket as the §8.1 App Store "UT Dallas validation" claim, already removed
until formalised).

---

## D. Open items / attorney queue

- PAL footer sentence — review (Decision 6).
- FARE alias-list licence treatment.
- Efficacy claim substantiation before any user-facing use (Decision 7).
- ODbL share-alike — before the Phase 2 OFF layer.
- FDA SaMD review — before any Phase 3 predictive feature (`intended_use_guardrails.md`).
