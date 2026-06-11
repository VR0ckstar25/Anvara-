-- =============================================================================
-- GROUNDING 02 — FARE ALLERGEN ALIASES  (run AFTER finalize.sql; after ground_01)
--
-- Attaches FARE source_url + retrieved_at to the allergen-ALIAS rows (the hidden
-- names) for the nine high-risk allergen groups. Per directive:
--   * FARE is SECONDARY evidence (advisory) — it supports allergen_alias, while
--     FDA owns major_allergen_identity. evidence_strength stays 'ADVISORY'.
--   * Fill source_url + retrieved_at ONLY. review_status stays PENDING.
--   * Do NOT set reviewer/reviewed_at; do NOT touch validation_status.
--
-- ⚠️ URL VERIFICATION NEEDED. fda.gov and several FARE pages bot-block the
-- automated fetcher. The FARE per-allergen slugs below are the best-known
-- canonical pattern; the verified-loading reference is FARE's allergen hub +
-- the tree-nut page. The founder is fetching the per-allergen pages back to me
-- (see the URL list in chat) so exact slugs/content can be confirmed before any
-- reviewer sign-off. retrieved_at reflects the grounding date, not a page read.
-- =============================================================================

-- helper pattern: ground all FARE-sourced synonyms for a parent group to a URL
UPDATE source_attribution
   SET source_url='https://www.foodallergy.org/living-food-allergies/food-allergy-essentials/common-allergens/milk',
       retrieved_at='2026-06-04'
 WHERE entry_type='SYNONYM' AND source='FARE'
   AND entry_id IN (SELECT CAST(synonym_id AS TEXT) FROM synonyms WHERE parent_id='milk');

UPDATE source_attribution
   SET source_url='https://www.foodallergy.org/living-food-allergies/food-allergy-essentials/common-allergens/egg',
       retrieved_at='2026-06-04'
 WHERE entry_type='SYNONYM' AND source='FARE'
   AND entry_id IN (SELECT CAST(synonym_id AS TEXT) FROM synonyms WHERE parent_id='egg');

UPDATE source_attribution
   SET source_url='https://www.foodallergy.org/living-food-allergies/food-allergy-essentials/common-allergens/wheat',
       retrieved_at='2026-06-04'
 WHERE entry_type='SYNONYM' AND source='FARE'
   AND entry_id IN (SELECT CAST(synonym_id AS TEXT) FROM synonyms WHERE parent_id='wheat');

UPDATE source_attribution
   SET source_url='https://www.foodallergy.org/living-food-allergies/food-allergy-essentials/common-allergens/soy',
       retrieved_at='2026-06-04'
 WHERE entry_type='SYNONYM' AND source='FARE'
   AND entry_id IN (SELECT CAST(synonym_id AS TEXT) FROM synonyms WHERE parent_id='soy');

UPDATE source_attribution
   SET source_url='https://www.foodallergy.org/living-food-allergies/food-allergy-essentials/common-allergens/peanut',
       retrieved_at='2026-06-04'
 WHERE entry_type='SYNONYM' AND source='FARE'
   AND entry_id IN (SELECT CAST(synonym_id AS TEXT) FROM synonyms WHERE parent_id='peanut');

UPDATE source_attribution
   SET source_url='https://www.foodallergy.org/living-food-allergies/food-allergy-essentials/common-allergens/tree-nut',
       retrieved_at='2026-06-04'
 WHERE entry_type='SYNONYM' AND source='FARE'
   AND entry_id IN (SELECT CAST(synonym_id AS TEXT) FROM synonyms
                    WHERE parent_id IN ('almond','walnut','cashew','pecan','pistachio',
                                        'hazelnut','brazil_nut','macadamia','pine_nut'));

UPDATE source_attribution
   SET source_url='https://www.foodallergy.org/living-food-allergies/food-allergy-essentials/common-allergens/fish',
       retrieved_at='2026-06-04'
 WHERE entry_type='SYNONYM' AND source='FARE'
   AND entry_id IN (SELECT CAST(synonym_id AS TEXT) FROM synonyms WHERE parent_id='fish');

UPDATE source_attribution
   SET source_url='https://www.foodallergy.org/living-food-allergies/food-allergy-essentials/common-allergens/shellfish',
       retrieved_at='2026-06-04'
 WHERE entry_type='SYNONYM' AND source='FARE'
   AND entry_id IN (SELECT CAST(synonym_id AS TEXT) FROM synonyms WHERE parent_id IN ('crustacean','mollusc'));

UPDATE source_attribution
   SET source_url='https://www.foodallergy.org/living-food-allergies/food-allergy-essentials/common-allergens/sesame',
       retrieved_at='2026-06-04'
 WHERE entry_type='SYNONYM' AND source='FARE'
   AND entry_id IN (SELECT CAST(synonym_id AS TEXT) FROM synonyms WHERE parent_id='sesame');
