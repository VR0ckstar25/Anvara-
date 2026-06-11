-- =============================================================================
-- GROUNDING 01 — FDA REGULATORY IDENTITIES  (run AFTER finalize.sql)
--
-- Attaches live FDA source_url + retrieved_at to the major_allergen_identity and
-- species_variant evidence rows. Per founder directive:
--   * FDA owns major_allergen_identity; FARE is secondary (used for allergen_alias).
--   * Fill source_url + retrieved_at ONLY. review_status stays PENDING.
--   * Do NOT set reviewer / reviewed_at and do NOT touch validation_status.
--     Nothing is promoted here — a human reviewer signs off later.
--
-- NOTE ON VERIFICATION: fda.gov bot-blocks the automated fetcher (HTTP 404 to
-- our tool), so these FDA URLs were not machine-read; the underlying facts were
-- corroborated against FARE's FDA-guidance summary (verified):
--   https://www.foodallergy.org/fare-blog/update-fda-guidance-food-allergen-labeling
-- The human reviewer MUST open each FDA URL and confirm before promotion.
-- retrieved_at reflects the grounding date, not a confirmed page read.
-- =============================================================================

-- 1. FALCPA original eight — parent identities --------------------------------
UPDATE source_attribution
   SET source_url   = 'https://www.fda.gov/industry/fda-basics-industry/what-major-food-allergen',
       retrieved_at = '2026-06-04'
 WHERE entry_type='PARENT'
   AND entry_id IN ('milk','egg','peanut','wheat','soy','fish','crustacean')
   AND source='FDA';

-- 2. Sesame — FASTER Act (9th major allergen) ---------------------------------
UPDATE source_attribution
   SET source_url   = 'https://www.fda.gov/food/food-allergies/faster-act-sesame-ninth-major-food-allergen',
       retrieved_at = '2026-06-04'
 WHERE entry_type='PARENT' AND entry_id='sesame' AND source='FDA';

-- 3. Tree-nut parents — Q&A Guidance Edition 5 (the 12 named tree nuts, incl.
--    pine nut; coconut & 10 others removed) ----------------------------------
UPDATE source_attribution
   SET source_url   = 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/guidance-industry-questions-and-answers-regarding-food-allergen-labeling-edition-5',
       retrieved_at = '2026-06-04'
 WHERE entry_type='PARENT'
   AND entry_id IN ('almond','walnut','cashew','pecan','pistachio','hazelnut',
                    'brazil_nut','macadamia','pine_nut')
   AND source='FDA';

-- 4. Canonical self-terms (FDA identity synonyms) — same URLs by group --------
--    FALCPA-8 self-terms
UPDATE source_attribution
   SET source_url   = 'https://www.fda.gov/industry/fda-basics-industry/what-major-food-allergen',
       retrieved_at = '2026-06-04'
 WHERE entry_type='SYNONYM' AND source='FDA'
   AND entry_id IN (SELECT CAST(synonym_id AS TEXT) FROM synonyms
                    WHERE claim_type='major_allergen_identity'
                      AND parent_id IN ('milk','egg','peanut','wheat','soy','fish','crustacean'));
--    sesame self-term
UPDATE source_attribution
   SET source_url   = 'https://www.fda.gov/food/food-allergies/faster-act-sesame-ninth-major-food-allergen',
       retrieved_at = '2026-06-04'
 WHERE entry_type='SYNONYM' AND source='FDA'
   AND entry_id IN (SELECT CAST(synonym_id AS TEXT) FROM synonyms
                    WHERE claim_type='major_allergen_identity' AND parent_id='sesame');
--    tree-nut self-terms
UPDATE source_attribution
   SET source_url   = 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/guidance-industry-questions-and-answers-regarding-food-allergen-labeling-edition-5',
       retrieved_at = '2026-06-04'
 WHERE entry_type='SYNONYM' AND source='FDA'
   AND entry_id IN (SELECT CAST(synonym_id AS TEXT) FROM synonyms
                    WHERE claim_type='major_allergen_identity'
                      AND parent_id IN ('almond','walnut','cashew','pecan','pistachio',
                                        'hazelnut','brazil_nut','macadamia','pine_nut'));

-- 5. Milk (ruminants) & egg (fowl) species variants — Q&A Guidance Edition 5 --
UPDATE source_attribution
   SET source_url   = 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/guidance-industry-questions-and-answers-regarding-food-allergen-labeling-edition-5',
       retrieved_at = '2026-06-04'
 WHERE entry_type='SYNONYM' AND source='FDA'
   AND entry_id IN (SELECT CAST(synonym_id AS TEXT) FROM synonyms WHERE claim_type='species_variant');

-- 6. Evidence strength: the nine FDA major-allergen IDENTITIES are STATUTORY
--    (FALCPA + FASTER Act). Species variants stay REGULATORY_GUIDANCE (the
--    ruminant/fowl reading lives in guidance, not statute text).
UPDATE source_attribution
   SET evidence_strength='STATUTORY'
 WHERE claim_type='major_allergen_identity' AND source='FDA' AND source_url IS NOT NULL;
