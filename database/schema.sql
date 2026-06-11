-- =============================================================================
-- SMART FOOD INGREDIENTS SCANNER — INGREDIENT DATABASE SCHEMA
-- Source of truth: SFIS Transfer Note v3.0 §3/§4 + Amendments v3.1 (Decisions 3,4,6)
--                  + Ingredient Database Construction note (Session 3 of 5)
--
-- SAFETY-CRITICAL. A false-negative allergen match is a physical-safety failure.
-- Every row carries a documented source and a validation_status. Nothing is
-- promoted to CONFIRMED/UT_DALLAS_REVIEWED without a documented basis.
--
-- Engine: SQLite (WatermelonDB + SQLCipher at app layer). This DDL is the
-- canonical definition; the WatermelonDB JS schema is generated from it.
-- Encryption (SQLCipher) and per-user isolation are applied at the app layer,
-- not here.
-- =============================================================================

PRAGMA foreign_keys = ON;

-- -----------------------------------------------------------------------------
-- 0. DATABASE METADATA  (Settings → About → Ingredient Database Version/Date)
-- -----------------------------------------------------------------------------
CREATE TABLE db_metadata (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL
);

-- -----------------------------------------------------------------------------
-- 1. DOMAINS & SUB-GROUPS  (Amendments v3.1 Decision 6 — sub-grouping enables
--    selective device download: only the user's chosen sub-groups are shipped
--    to the device after onboarding, then the priority cache is built locally.)
-- -----------------------------------------------------------------------------
CREATE TABLE domains (
    domain      TEXT PRIMARY KEY
                CHECK (domain IN ('ALLERGEN','INTOLERANCE','DIETARY_PREFERENCE','GOAL')),
    label       TEXT NOT NULL,
    -- Issue 5: allergy data is far stronger than intolerance data. Ship ALLERGY
    -- at launch; gate INTOLERANCE behind a BETA flag so users don't read the two
    -- as equally authoritative.
    launch_status TEXT NOT NULL DEFAULT 'LAUNCH'
                CHECK (launch_status IN ('LAUNCH','BETA','DISABLED'))
);

CREATE TABLE sub_groups (
    sub_group_id   TEXT PRIMARY KEY,           -- e.g. 'allergen.milk', 'diet.vegan'
    domain         TEXT NOT NULL REFERENCES domains(domain),
    label          TEXT NOT NULL,              -- user-facing, e.g. 'Milk and Dairy'
    download_unit  INTEGER NOT NULL DEFAULT 1, -- 1 = this sub-group is a selectable
                                               --     download package post-onboarding
    sort_order     INTEGER NOT NULL DEFAULT 0
);

-- -----------------------------------------------------------------------------
-- 2. PARENT TERMS  (canonical heads of the synonym graph: the Big 9 allergens,
--    each intolerance, etc. Information cards are written per parent — §7.2.)
-- -----------------------------------------------------------------------------
CREATE TABLE parents (
    parent_id        TEXT PRIMARY KEY,         -- slug, e.g. 'milk','peanut'
    domain           TEXT NOT NULL REFERENCES domains(domain),
    sub_group_id     TEXT NOT NULL REFERENCES sub_groups(sub_group_id),
    common_name      TEXT NOT NULL,            -- primary display name (plain language)
    technical_name   TEXT,                     -- shown only in parentheses, never primary
    -- 1 = FDA major food allergen (US): milk, egg, fish, CRUSTACEAN shellfish,
    -- tree nuts, wheat, peanuts, soybeans, sesame. Molluscs are NOT FDA-major
    -- (clinically significant; major in EU/UK/CA/AU-NZ). 0 = clinically tracked,
    -- not a US statutory major allergen.
    regulatory_major_allergen INTEGER NOT NULL DEFAULT 0
                CHECK (regulatory_major_allergen IN (0,1)),
    regulatory_basis TEXT,
    validation_status TEXT NOT NULL DEFAULT 'DRAFT'
                CHECK (validation_status IN
                      ('DRAFT','NEEDS_EXPERT_REVIEW','CONFIRMED','UT_DALLAS_REVIEWED')),
    source           TEXT NOT NULL
                CHECK (source IN ('USDA','FDA','FARE','EXPERT_REVIEW')),
    created_at       TEXT NOT NULL DEFAULT (datetime('now'))
);

-- -----------------------------------------------------------------------------
-- 3. SYNONYM GRAPH  (the safety-critical core: derivative/alias term → parent.
--    Scan flow checks priority cache → full synonym graph → primary DB. §4)
-- -----------------------------------------------------------------------------
CREATE TABLE synonyms (
    synonym_id        INTEGER PRIMARY KEY,
    parent_id         TEXT NOT NULL REFERENCES parents(parent_id),
    term              TEXT NOT NULL,           -- display term, e.g. 'Arachis oil'
    normalized_term   TEXT NOT NULL DEFAULT '', -- lower/trimmed, for prefix search (set in finalize)
    confidence_level  TEXT NOT NULL DEFAULT 'HIGH'
                CHECK (confidence_level IN ('HIGH','MEDIUM','LOW')),
    -- match_class: relationship/RISK class — distinct from confidence_level, which
    -- is for SEARCH ORDERING only (Issue 2). DIRECT/DERIVED = the allergen protein
    -- is present; POSSIBLE/AMBIGUOUS = it MAY be present (source/manufacture
    -- dependent). The runtime maps DIRECT/DERIVED -> "Detected", POSSIBLE/AMBIGUOUS
    -- -> "Possible" — never "Safe". See match_semantics.md.
    match_class       TEXT
                CHECK (match_class IS NULL OR match_class IN
                      ('DIRECT','DERIVED','POSSIBLE','AMBIGUOUS')),
    -- frequency_rank: how often the term appears in commercial products.
    -- ⚠️ DEFERRED TO PHASE 2 (Decision 7). USDA is nutrient-composition data and
    -- cannot supply commercial appearance frequency; only the Phase-2 Open Food
    -- Facts layer can. Column kept (nullable) for then. v1 orders type-ahead /
    -- priority cache by validation status, then alphabetically — NOT by frequency.
    -- SEARCH ORDERING ONLY — never feeds risk (a rare term like 'arachis oil'
    -- matters enormously to the peanut-allergic user).
    frequency_rank    INTEGER,
    -- Dual-source / cross-contamination note (e.g. 'lecithin' may be soy OR egg;
    -- 'glucosamine' is often shellfish-derived). Surfaced to validators.
    cross_note        TEXT,
    -- Derivative context sentence — STATUS: CONTENT PENDING (§7.2). Scaffold only.
    context_sentence  TEXT,
    claim_type        TEXT NOT NULL DEFAULT 'allergen_alias'
                CHECK (claim_type IN
                      ('major_allergen_identity','allergen_alias','derivative',
                       'cross_contaminant','species_variant','refined_exemption',
                       'intolerance_trigger','dietary_exclusion')),
    validation_status TEXT NOT NULL DEFAULT 'DRAFT'
                CHECK (validation_status IN
                      ('DRAFT','NEEDS_EXPERT_REVIEW','CONFIRMED','UT_DALLAS_REVIEWED')),
    source            TEXT NOT NULL
                CHECK (source IN ('USDA','FDA','FARE','EXPERT_REVIEW')),
    created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- -----------------------------------------------------------------------------
-- 4. PRIMARY INGREDIENT DATABASE  (Amendments v3.1 Decision 3 — USDA SR Legacy
--    + Foundation Foods, filtered by commercial significance. Populated by an
--    import job from the USDA datasets; a few illustrative rows are seeded.)
-- -----------------------------------------------------------------------------
CREATE TABLE ingredients (
    ingredient_id          INTEGER PRIMARY KEY,
    name                   TEXT NOT NULL,
    normalized_name        TEXT NOT NULL DEFAULT '',
    usda_fdc_id            INTEGER,            -- FoodData Central ID, when applicable
    -- plain-language description (USDA FoodData Central) — 6th-grade reading level
    description            TEXT,
    commercial_significance INTEGER,           -- filter/rank: commercial relevance
    frequency_rank         INTEGER,            -- USDA appearance data
    -- a primary ingredient may itself map to an allergen parent (e.g. 'whey'→milk)
    parent_id              TEXT REFERENCES parents(parent_id),
    validation_status      TEXT NOT NULL DEFAULT 'DRAFT'
                CHECK (validation_status IN
                      ('DRAFT','NEEDS_EXPERT_REVIEW','CONFIRMED','UT_DALLAS_REVIEWED')),
    source                 TEXT NOT NULL DEFAULT 'USDA'
                CHECK (source IN ('USDA','FDA','FARE','EXPERT_REVIEW')),
    created_at             TEXT NOT NULL DEFAULT (datetime('now'))
);

-- -----------------------------------------------------------------------------
-- 5. DIETARY PREFERENCE RULES  (vegan, vegetarian, halal, kosher … — terms that
--    do NOT align with a declared preference. Mirror principle: we flag presence,
--    never issue a verdict.)
-- -----------------------------------------------------------------------------
CREATE TABLE dietary_rules (
    rule_id           INTEGER PRIMARY KEY,
    sub_group_id      TEXT NOT NULL REFERENCES sub_groups(sub_group_id), -- 'diet.vegan' …
    excluded_term     TEXT NOT NULL,
    normalized_term   TEXT NOT NULL DEFAULT '',
    reason            TEXT,                    -- e.g. 'animal-derived'
    parent_id         TEXT REFERENCES parents(parent_id),
    validation_status TEXT NOT NULL DEFAULT 'DRAFT'
                CHECK (validation_status IN
                      ('DRAFT','NEEDS_EXPERT_REVIEW','CONFIRMED','UT_DALLAS_REVIEWED')),
    source            TEXT NOT NULL
                CHECK (source IN ('USDA','FDA','FARE','EXPERT_REVIEW')),
    created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);

-- -----------------------------------------------------------------------------
-- 6. GOAL FLAGS  (Less Sodium, Less Sugar, More Protein … — nutrient-based.
--    The app states the number against the user's declared goal — never advises.)
-- -----------------------------------------------------------------------------
CREATE TABLE goal_flags (
    goal_id       INTEGER PRIMARY KEY,
    sub_group_id  TEXT NOT NULL REFERENCES sub_groups(sub_group_id),   -- 'goal.less_sodium' …
    nutrient      TEXT NOT NULL,              -- 'sodium','sugar','protein','fibre','sat_fat'
    direction     TEXT NOT NULL CHECK (direction IN ('LESS','MORE')),
    label         TEXT NOT NULL
);

-- -----------------------------------------------------------------------------
-- 7. INFORMATION CARDS  (§7.2 — one card per parent allergen/family, max 150
--    words, 6th-grade level. STATUS: CONTENT PENDING — scaffold only.)
-- -----------------------------------------------------------------------------
CREATE TABLE information_cards (
    parent_id     TEXT PRIMARY KEY REFERENCES parents(parent_id),
    body          TEXT,                        -- CONTENT PENDING — leave NULL placeholder
    word_count    INTEGER,
    content_status TEXT NOT NULL DEFAULT 'CONTENT_PENDING'
                CHECK (content_status IN ('CONTENT_PENDING','DRAFT','APPROVED'))
);

-- -----------------------------------------------------------------------------
-- 8. SOURCE ATTRIBUTION  (Amendments v3.1 Decision 4 — records the source for
--    every entry. Allowed: USDA, FDA, FARE, EXPERT_REVIEW only. The
--    OPEN_FOOD_FACTS tag is reserved for the Phase 2 runtime layer and is NEVER
--    written here. Denormalized 'source' columns above are the operational copy;
--    this table holds the formal licence/attribution record.)
-- -----------------------------------------------------------------------------
CREATE TABLE source_attribution (
    attribution_id   INTEGER PRIMARY KEY,
    entry_type       TEXT NOT NULL
                CHECK (entry_type IN ('PARENT','SYNONYM','INGREDIENT','DIETARY_RULE')),
    entry_id         TEXT NOT NULL,            -- the PK of the referenced row (as text)
    source           TEXT NOT NULL
                CHECK (source IN ('USDA','FDA','FARE','EXPERT_REVIEW')),
    licence          TEXT NOT NULL,
    attribution_text TEXT NOT NULL,
    source_ref       TEXT,                     -- citation / document / dataset id
    -- Evidence-level audit fields (Issue 6 — category-level is not enough for a
    -- safety dataset). A row may only be promoted once these are filled and a
    -- reviewer signs off (enforced by triggers below).
    source_url       TEXT,                     -- exact page the claim was read from
    retrieved_at     TEXT,                     -- ISO date the source was retrieved
    claim_type       TEXT                      -- what kind of claim this is
                CHECK (claim_type IS NULL OR claim_type IN
                      ('major_allergen_identity','allergen_alias','derivative',
                       'cross_contaminant','species_variant','refined_exemption',
                       'dietary_exclusion','intolerance_trigger','ingredient_fact')),
    reviewer         TEXT,                     -- who signed off (expert / UT Dallas)
    reviewed_at      TEXT,
    review_status    TEXT NOT NULL DEFAULT 'PENDING'
                CHECK (review_status IN ('PENDING','REVIEWED','REJECTED')),
    -- evidence_strength: not all sources are equal (Issue 8). Statutory law (FALCPA
    -- major allergens) outranks regulatory guidance, which outranks advisory
    -- consumer lists (FARE), reference data (USDA), or a single expert opinion.
    evidence_strength TEXT
                CHECK (evidence_strength IS NULL OR evidence_strength IN
                      ('STATUTORY','REGULATORY_GUIDANCE','REFERENCE','ADVISORY',
                       'PEER_REVIEWED','MANUFACTURER','EXPERT')),
    UNIQUE (entry_type, entry_id)
);

-- -----------------------------------------------------------------------------
-- REGIONAL REGULATION  (Issue 4 — major-allergen status varies by jurisdiction.
-- US-only at launch, but modelled now so EU/UK/CA/AU-NZ migration is painless.
-- EU/UK add mustard, celery, lupin, molluscs, sulphites as future parents.)
-- -----------------------------------------------------------------------------
CREATE TABLE regulatory_jurisdiction (
    parent_id    TEXT NOT NULL REFERENCES parents(parent_id),
    jurisdiction TEXT NOT NULL DEFAULT 'US'
                 CHECK (jurisdiction IN ('US','EU','UK','CA','AU_NZ')),
    is_major     INTEGER NOT NULL DEFAULT 0 CHECK (is_major IN (0,1)),
    basis        TEXT,
    PRIMARY KEY (parent_id, jurisdiction)
);

-- -----------------------------------------------------------------------------
-- OPAQUE TERMS  (Issue 1,7,10 — composite/unspecified ingredients that may HIDE
-- an allergen: "natural flavors", "spices", "seasoning blend". A scan hitting one
-- must yield UNKNOWN, never "not found"/"safe". See match_semantics.md.)
-- -----------------------------------------------------------------------------
CREATE TABLE opaque_terms (
    term            TEXT PRIMARY KEY,
    normalized_term TEXT NOT NULL DEFAULT '',
    note            TEXT
);

-- -----------------------------------------------------------------------------
-- INGREDIENT DERIVATIVES  (Issue 1 — SCAFFOLD. Composite ingredient -> a parent
-- it may CONTAIN, with strength. Distinct from the alias synonym graph; not
-- populated for launch. Modelled now so composition can be added without
-- migration.)
-- -----------------------------------------------------------------------------
CREATE TABLE ingredient_derivatives (
    id              INTEGER PRIMARY KEY,
    composite_term  TEXT NOT NULL,
    parent_id       TEXT NOT NULL REFERENCES parents(parent_id),
    source_strength TEXT CHECK (source_strength IS NULL OR
                       source_strength IN ('ALWAYS','USUALLY','SOMETIMES','RARELY')),
    confidence      TEXT,
    note            TEXT
);

-- -----------------------------------------------------------------------------
-- VALIDATION WORKFLOW ENFORCEMENT  (Issue 6 — mandatory expert sign-off)
-- A synonym/parent cannot be promoted to CONFIRMED or UT_DALLAS_REVIEWED unless
-- its source_attribution row carries a source_url AND a reviewer. This makes the
-- "no guessing" rule a hard constraint, not a guideline.
-- -----------------------------------------------------------------------------
CREATE TRIGGER trg_block_unreviewed_synonym
BEFORE UPDATE OF validation_status ON synonyms
FOR EACH ROW
WHEN NEW.validation_status IN ('CONFIRMED','UT_DALLAS_REVIEWED')
 AND NOT EXISTS (
       SELECT 1 FROM source_attribution sa
       WHERE sa.entry_type='SYNONYM' AND sa.entry_id = CAST(NEW.synonym_id AS TEXT)
         AND sa.source_url IS NOT NULL AND sa.reviewer IS NOT NULL
         AND sa.review_status='REVIEWED')
BEGIN
  SELECT RAISE(ABORT,
    'Cannot promote synonym: needs source_url + reviewer + review_status=REVIEWED in source_attribution');
END;

CREATE TRIGGER trg_block_unreviewed_parent
BEFORE UPDATE OF validation_status ON parents
FOR EACH ROW
WHEN NEW.validation_status IN ('CONFIRMED','UT_DALLAS_REVIEWED')
 AND NOT EXISTS (
       SELECT 1 FROM source_attribution sa
       WHERE sa.entry_type='PARENT' AND sa.entry_id = NEW.parent_id
         AND sa.source_url IS NOT NULL AND sa.reviewer IS NOT NULL
         AND sa.review_status='REVIEWED')
BEGIN
  SELECT RAISE(ABORT,
    'Cannot promote parent: needs source_url + reviewer + review_status=REVIEWED in source_attribution');
END;

-- -----------------------------------------------------------------------------
-- 9. PROFILE PRIORITY CACHE  (§4 — DERIVED, on-device, built per user at profile
--    save. Defined here so the build job and tests share one shape. Decision 3:
--    this on-device table is the PRIMARY runtime matching path — filtering and
--    flagging happen here, offline, at zero server/API cost.)
-- -----------------------------------------------------------------------------
CREATE TABLE profile_priority_cache (
    cache_id                     INTEGER PRIMARY KEY,
    synonym_term                 TEXT NOT NULL,
    parent_allergen_common_name  TEXT NOT NULL,
    domain                       TEXT NOT NULL REFERENCES domains(domain),
    confidence_level             TEXT NOT NULL,
    frequency_rank               INTEGER,
    goal_flag                    TEXT
);

-- -----------------------------------------------------------------------------
-- INDEXES  (type-ahead target <200ms on min spec — Ingredient DB note. Prefix
-- search uses normalized_* columns; SQLite uses these for LIKE 'abc%'.)
-- -----------------------------------------------------------------------------
CREATE INDEX idx_syn_norm        ON synonyms (normalized_term);
CREATE INDEX idx_syn_parent      ON synonyms (parent_id);
CREATE INDEX idx_syn_validation  ON synonyms (validation_status);   -- type-ahead filters to CONFIRMED/UT_DALLAS_REVIEWED
CREATE INDEX idx_ing_norm        ON ingredients (normalized_name);
CREATE INDEX idx_ing_parent      ON ingredients (parent_id);
CREATE INDEX idx_diet_norm       ON dietary_rules (normalized_term);
CREATE INDEX idx_parent_subgroup ON parents (sub_group_id);
CREATE INDEX idx_ppc_term        ON profile_priority_cache (synonym_term);
CREATE INDEX idx_opaque_norm     ON opaque_terms (normalized_term);
