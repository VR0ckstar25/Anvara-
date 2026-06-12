# Anvara Ingredient Database

The safety-critical ingredient core behind Anvara. A false-negative
allergen match is a physical-safety failure — so **every row carries a documented
source and a validation status, and nothing is trusted until it is validated.**

Built per Transfer Note v3.0 §3/§4, the Ingredient Database Construction note
(Session 3 of 5), and **Amendments v3.1** (Decisions 3, 4, 6).

## Build

```sh
rm -f sfis_ingredients.db
for f in schema.sql seed_01_categories.sql seed_02_allergens.sql \
         seed_03_dietary_primary_meta.sql seed_04_intolerances.sql \
         seed_05_composite_global.sql seed_06_gap_fills.sql finalize.sql \
         ground_01_fda_identities.sql ground_02_fare_aliases.sql; do
  sqlite3 sfis_ingredients.db < "$f"
done
sqlite3 sfis_ingredients.db < tests.sql            # 42 checks — CI fails if FAILURES > 0
sqlite3 sfis_ingredients.db < challenge_corpus.sql  # hostile real-world strings

# Regenerate the app's data export FROM the DB (never hand-edit allergens.json):
node export-data.js                                 # → ../sfis-app/src/data/allergens.json
```

## Adversarial-review hardening (structural/semantic)

| Risk | Fix |
|---|---|
| **Composition** (allergens hidden in composite ingredients) | `opaque_terms` (19) force **Unknown**; `ingredient_derivatives` scaffold for composite→parent |
| **Coarse confidence** | `synonyms.match_class` (DIRECT/DERIVED = present; POSSIBLE/AMBIGUOUS = may be) — separate from search `confidence_level` |
| **Cross-source** | Multi-parent edges (lecithin→soy+egg, HVP→soy+wheat, tocopherols, enzymes…) — 65 POSSIBLE/AMBIGUOUS rows |
| **Jurisdiction** | `regulatory_jurisdiction` table; US seeded, EU/UK molluscs scaffolded; mustard/celery/lupin noted as future parents |
| **Intolerance ≠ allergy** | `domains.launch_status='BETA'` for INTOLERANCE |
| **Frequency = risk** | `frequency_rank` documented search-ordering-only; risk derives from `match_class` |
| **Absence of evidence** | Four runtime states **Detected / Possible / Unknown / Not detected** — see [match_semantics.md](match_semantics.md); never "Safe" |
| **Provenance strength** | `source_attribution.evidence_strength` (STATUTORY > guidance > advisory > reference > expert) |
| **No hostile corpus** | [challenge_corpus.sql](challenge_corpus.sql) — 77 real-world strings (MATCH/OPAQUE/NONE), 0 failures; starter for a thousands-row production corpus |

FARE aliases grounded (`ground_02`): FARE `source_url` attached to alias rows as
**ADVISORY** evidence — still PENDING, FDA remains primary for identities. 251
attribution rows now carry a `source_url`; **0 promoted**.

## Grounding status (live-source citations)

`ground_01_fda_identities.sql` attaches FDA `source_url` + `retrieved_at` to the
**major_allergen_identity** and **species_variant** rows (56 rows). FDA owns the
regulatory identity; FARE stays secondary (allergen aliases). Per directive,
grounding fills evidence **only** — `review_status` stays `PENDING`, `reviewer`/
`reviewed_at` are never set programmatically, and `validation_status` is untouched.
**Nothing is promoted; nothing surfaces in type-ahead.** A human reviewer opens each
cited URL and signs off to promote.

URLs cited: FDA *What Is a Major Food Allergen?* (FALCPA-8 identities), FDA *FASTER
Act* (sesame), FDA *Q&A Guidance Edition 5, Jan 2025* (12 named tree nuts incl. pine
nut; milk-ruminant / egg-fowl interpretation). fda.gov bot-blocks the automated
fetcher, so facts were corroborated against
[FARE's FDA-guidance summary](https://www.foodallergy.org/fare-blog/update-fda-guidance-food-allergen-labeling)
(verified); the reviewer must confirm the FDA pages directly.

## What's in this cut

| Table | Rows | Notes |
|---|---|---|
| `parents` | 26 | Big 9 allergen heads (18, tree nuts + shellfish split per FDA) + 8 intolerance heads |
| `synonyms` | 366 | Allergen graph + canonical self-terms + species variants + all 8 intolerance graphs |
| `sub_groups` | 32 | Selectable download units (Decision 6); map 1:1 to onboarding tiles |
| `dietary_rules` | 24 | Vegan + vegetarian starters |
| `ingredients` | 8 | Illustrative USDA samples — full set comes from the import job |
| `information_cards` | 26 | One per parent, all `CONTENT_PENDING` (§7.2) |
| `source_attribution` | 424 | One per entry; USDA/FDA/FARE/EXPERT_REVIEW only; evidence-level fields |

## Expert-review corrections applied

1. **Molluscs are not FDA-major.** `parents.regulatory_major_allergen` added: 1 for the
   nine FDA majors (incl. **crustacean** shellfish), **0 for molluscs** (kept clinically
   searchable; major in EU/UK/CA/AU-NZ). **Pine nut corrected to 1 / FDA** — it is one of
   the 12 named tree nuts in Q&A Guidance Edition 5 (coconut + 10 others were removed).
2. **FDA 2025 species variants.** Milk → cow/goat/sheep/buffalo (+ goat whey, sheep
   cheese…); egg → chicken/duck/goose/quail/fowl. `claim_type='species_variant'`.
3. **Tree-nut naming.** Walnut split into black / California / English / Persian /
   heartnut(Japanese); canonical self-terms added for **every** parent.
4. **Intolerance graphs populated.** All 8 (lactose, gluten, fructose, histamine,
   sulfites, caffeine, sweeteners, FODMAPs) — 105 entries. Tiles must stay disabled
   until validated.
5. **Refined-oil & broad-term downgrades.** Refined arachis/almond/walnut/sesame oils,
   wheat starch, and milk-`lactose` dropped from HIGH (statute targets allergenic
   protein; refined oils are exempt). Unrefined/cold-/expeller-pressed and toasted
   sesame variants added at HIGH. `hummus` → LOW.
6. **Evidence-level attribution + enforced workflow.** `source_attribution` now carries
   `source_url`, `retrieved_at`, `claim_type`, `reviewer`, `reviewed_at`, `review_status`.
   Triggers `trg_block_unreviewed_synonym` / `_parent` **block promotion** to
   CONFIRMED/UT_DALLAS_REVIEWED unless a `source_url` + `reviewer` exist and
   `review_status='REVIEWED'`. A false-negative/false-positive **test suite**
   (`tests.sql`, 23 checks) gates production.

## Design decisions baked in

- **USDA is primary (Decision 3).** Primary ingredients come from USDA SR Legacy +
  Foundation Foods, filtered by commercial significance.
- **`frequency_rank` is DEFERRED to Phase 2 (Decision 7, 2026-06-05).** USDA is a
  nutrient-composition database; it does **not** record how often an ingredient
  appears across commercial products, so it cannot fill this field. The only source
  that can is the Phase-2 Open Food Facts layer. **v1 does not use frequency for
  ordering** — type-ahead / priority-cache order by validation status, then
  alphabetically. The column stays (nullable) for Phase 2. Frequency is for *search
  ordering only* and must never feed risk.
- **Open Food Facts is Phase 2 only (Decisions 2, 4).** Never merged into this
  database, never written to `source_attribution`. Keeps the ODbL share-alike
  question off the launch critical path.
- **Sub-grouping enables selective download (Decision 6, confirmed).** A `sub_group`
  is one download package. After onboarding the app ships the user's chosen
  sub-groups to the device (their profile works fully **offline**); the **rest of
  the database is reachable online on demand** (general "search any ingredient").
- **Connectivity (Decision 7, relaxes §3.1 WiFi-only):** on-demand ingredient
  lookups and text-only log sync **may use mobile data**; bulk sub-group downloads /
  DB updates default to WiFi with a user toggle to allow mobile data. **Images never
  leave the device** regardless. So: profile matching = offline; general search =
  online (mobile data OK).
- **On-device is the primary runtime path (Decision 3).** Profile matching runs
  against the local priority cache / synonym graph offline, at zero server cost.
- **Cross-contamination / dual-source terms are flagged**, not silently mapped
  (`cross_note` + lowered `confidence_level`): e.g. *lecithin* (soy or egg),
  *glucosamine* (often shellfish), *soy sauce* (also wheat), *omega-3* (may be fish).

## Validation status — READ THIS

**Every entry is currently `DRAFT`.** The type-ahead filter only shows
`CONFIRMED` / `UT_DALLAS_REVIEWED`, so **nothing surfaces in the app yet — by
design.** Promotion path:

```
DRAFT ──(validator confirms against a live primary source)──▶ CONFIRMED
DRAFT ──(UT Dallas food-science faculty sign-off)──────────▶ UT_DALLAS_REVIEWED
DRAFT ──(ambiguous / needs a human)────────────────────────▶ NEEDS_EXPERT_REVIEW
```

> ⚠️ **Source honesty.** The allergen synonyms were seeded from the well-established
> FDA FALCPA major-allergen identities and FARE "hidden names" lists. They have not
> been re-fetched and confirmed against the live sources entry-by-entry. Treat this
> as a high-quality **draft corpus for validation**, not validated data. UT Dallas
> cross-validation is mandatory before launch regardless (Ingredient DB note §1).
> Attorney to confirm the FARE-list licence treatment (facts aren't copyrightable;
> a compiled list may be).

## Still to do (in rough order)

1. **UT Dallas cross-validation** of the synonym graph → promote `DRAFT` rows.
2. **USDA import job** to populate `ingredients` from SR Legacy + Foundation Foods,
   filtered by commercial significance; set `usda_fdc_id`.
3. **Populate `frequency_rank` in Phase 2** only when a commercial appearance source
   is selected; v1 does not use frequency for type-ahead, priority-cache ordering,
   or risk.
4. **Intolerance synonym graphs** — drafted (105 entries). Validate, then enable the
   intolerance tiles (keep disabled until then).
5. **Dietary rules** beyond vegan/vegetarian (pescatarian, keto, mediterranean,
   halal, kosher) — with domain experts.
6. **Content (separate session):** information-card bodies (25–30, §7.2),
   derivative context sentences (200–300) — both `CONTENT_PENDING`.
7. **`profile_priority_cache` build job** (on-device, fires on profile save, <100ms
   on min spec) and the type-ahead query (<200ms target).
