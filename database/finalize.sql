-- =============================================================================
-- FINALIZE — normalized search columns, information-card placeholders, and the
-- formal ODbL/source attribution records (Amendments v3.1 Decision 4).
-- Run after schema.sql + seed_01 + seed_02 + seed_03.
-- =============================================================================

-- 1. Populate normalized columns for type-ahead prefix search -----------------
UPDATE synonyms      SET normalized_term = lower(trim(term));
UPDATE ingredients   SET normalized_name = lower(trim(name));
UPDATE dietary_rules SET normalized_term = lower(trim(excluded_term));
UPDATE opaque_terms  SET normalized_term = lower(trim(term));

-- 1b. match_class backfill (Issue 2) — only where a seed didn't set it
-- explicitly. DIRECT/DERIVED = protein present; POSSIBLE/AMBIGUOUS = may be.
UPDATE synonyms SET match_class = CASE
    WHEN claim_type IN ('major_allergen_identity','species_variant') THEN 'DIRECT'
    WHEN confidence_level='HIGH'   THEN 'DERIVED'
    WHEN confidence_level='MEDIUM' THEN 'POSSIBLE'
    ELSE 'AMBIGUOUS' END
WHERE match_class IS NULL;

-- 1c. US regulatory jurisdiction rows from parents (Issue 4). EU/UK scaffolds
-- are seeded separately in seed_05.
INSERT INTO regulatory_jurisdiction (parent_id, jurisdiction, is_major, basis)
SELECT parent_id, 'US', regulatory_major_allergen, regulatory_basis
FROM parents WHERE domain='ALLERGEN';

-- 2. Information cards — one per parent — CONTENT PENDING (§7.2) ---------------
INSERT INTO information_cards (parent_id, content_status)
SELECT parent_id, 'CONTENT_PENDING' FROM parents;

-- 3. Source attribution — formal record per entry -----------------------------
-- Allowed sources only: USDA, FDA, FARE, EXPERT_REVIEW. Open Food Facts is
-- NEVER written here (reserved for the Phase 2 runtime layer).
-- All rows start review_status='PENDING' with source_url/retrieved_at/reviewer
-- left NULL. The promotion triggers (schema.sql) block CONFIRMED/UT_DALLAS_REVIEWED
-- until those evidence fields are filled and review_status='REVIEWED'.
INSERT INTO source_attribution
  (entry_type, entry_id, source, licence, attribution_text, source_ref, claim_type)
SELECT 'PARENT', p.parent_id, p.source,
       CASE p.source
         WHEN 'USDA' THEN 'Public Domain (U.S. Government Work)'
         WHEN 'FDA'  THEN 'Public Domain (U.S. Government Work)'
         WHEN 'FARE' THEN 'Factual reference (no copyright on facts)'
         ELSE 'Internal'
       END,
       CASE p.source
         WHEN 'USDA' THEN 'Data from USDA FoodData Central (fdc.nal.usda.gov), public domain.'
         WHEN 'FDA'  THEN 'Allergen identity per FDA FALCPA / FDA guidance (fda.gov), public domain.'
         WHEN 'FARE' THEN 'Allergen alias referenced from FARE allergen lists (foodallergy.org).'
         ELSE 'Internal expert-reviewed entry — pending validation.'
       END,
       p.source,
       CASE p.domain WHEN 'ALLERGEN' THEN 'major_allergen_identity'
                     WHEN 'INTOLERANCE' THEN 'intolerance_trigger'
                     ELSE 'allergen_alias' END
FROM parents p;

INSERT INTO source_attribution
  (entry_type, entry_id, source, licence, attribution_text, source_ref, claim_type)
SELECT 'SYNONYM', CAST(s.synonym_id AS TEXT), s.source,
       CASE s.source
         WHEN 'USDA' THEN 'Public Domain (U.S. Government Work)'
         WHEN 'FDA'  THEN 'Public Domain (U.S. Government Work)'
         WHEN 'FARE' THEN 'Factual reference (no copyright on facts)'
         ELSE 'Internal'
       END,
       CASE s.source
         WHEN 'USDA' THEN 'Data from USDA FoodData Central (fdc.nal.usda.gov), public domain.'
         WHEN 'FDA'  THEN 'Allergen identity per FDA FALCPA / FDA guidance (fda.gov), public domain.'
         WHEN 'FARE' THEN 'Allergen alias referenced from FARE allergen lists (foodallergy.org).'
         ELSE 'Internal expert-reviewed entry — pending validation.'
       END,
       s.source,
       s.claim_type
FROM synonyms s;

INSERT INTO source_attribution
  (entry_type, entry_id, source, licence, attribution_text, source_ref, claim_type)
SELECT 'INGREDIENT', CAST(i.ingredient_id AS TEXT), i.source,
       'Public Domain (U.S. Government Work)',
       'Data from USDA FoodData Central (fdc.nal.usda.gov), public domain.',
       i.source, 'ingredient_fact'
FROM ingredients i;

INSERT INTO source_attribution
  (entry_type, entry_id, source, licence, attribution_text, source_ref, claim_type)
SELECT 'DIETARY_RULE', CAST(d.rule_id AS TEXT), d.source,
       'Internal',
       'Internal expert-reviewed entry — pending validation.',
       d.source, 'dietary_exclusion'
FROM dietary_rules d;

-- evidence_strength baseline by source (Issue 8). Statutory upgrades for FDA
-- major-allergen identities are applied in ground_01.
UPDATE source_attribution SET evidence_strength = CASE source
    WHEN 'FDA'  THEN 'REGULATORY_GUIDANCE'
    WHEN 'USDA' THEN 'REFERENCE'
    WHEN 'FARE' THEN 'ADVISORY'
    ELSE 'EXPERT' END
WHERE evidence_strength IS NULL;
