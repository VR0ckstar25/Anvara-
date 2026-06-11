-- =============================================================================
-- SAFETY TEST SUITE  (Issue: false-negative & false-positive coverage before
-- any production exposure). Run AFTER schema + all seeds + finalize.
-- Each test yields passed=1 (PASS) or 0 (FAIL). The final query prints the
-- failure count; CI should fail the build if FAILURES > 0.
-- =============================================================================
.headers on
.mode column

DROP VIEW IF EXISTS test_results;
CREATE TEMP VIEW test_results AS
-- ---- FALSE-NEGATIVE: hidden names MUST resolve to the right parent ----------
SELECT 'FN' class, 'arachis oil -> peanut' label,
  EXISTS(SELECT 1 FROM synonyms WHERE normalized_term='arachis oil' AND parent_id='peanut') passed
UNION ALL SELECT 'FN','casein -> milk',
  EXISTS(SELECT 1 FROM synonyms WHERE normalized_term='casein' AND parent_id='milk')
UNION ALL SELECT 'FN','semolina -> wheat',
  EXISTS(SELECT 1 FROM synonyms WHERE normalized_term='semolina' AND parent_id='wheat')
UNION ALL SELECT 'FN','goat milk -> milk (FDA 2025 ruminant)',
  EXISTS(SELECT 1 FROM synonyms WHERE normalized_term='goat milk' AND parent_id='milk')
UNION ALL SELECT 'FN','duck egg -> egg (FDA 2025 fowl)',
  EXISTS(SELECT 1 FROM synonyms WHERE normalized_term='duck egg' AND parent_id='egg')
UNION ALL SELECT 'FN','heartnut -> walnut',
  EXISTS(SELECT 1 FROM synonyms WHERE normalized_term='heartnut' AND parent_id='walnut')
UNION ALL SELECT 'FN','peanut self-term -> peanut',
  EXISTS(SELECT 1 FROM synonyms WHERE normalized_term='peanut' AND parent_id='peanut')
UNION ALL SELECT 'FN','sodium metabisulfite -> sulfites',
  EXISTS(SELECT 1 FROM synonyms WHERE normalized_term='sodium metabisulfite' AND parent_id='sulfites')
UNION ALL SELECT 'FN','fructans -> fodmaps',
  EXISTS(SELECT 1 FROM synonyms WHERE normalized_term='fructans' AND parent_id='fodmaps')
UNION ALL SELECT 'FN','barley -> gluten',
  EXISTS(SELECT 1 FROM synonyms WHERE normalized_term='barley' AND parent_id='gluten')

-- ---- FALSE-POSITIVE / over-assertion: refined oils must NOT be HIGH ---------
UNION ALL SELECT 'FP','arachis oil not HIGH (refined-exempt)',
  (SELECT count(*) FROM synonyms WHERE normalized_term='arachis oil' AND confidence_level='HIGH')=0
UNION ALL SELECT 'FP','almond oil not HIGH',
  (SELECT count(*) FROM synonyms WHERE normalized_term='almond oil' AND confidence_level='HIGH')=0
UNION ALL SELECT 'FP','walnut oil not HIGH',
  (SELECT count(*) FROM synonyms WHERE normalized_term='walnut oil' AND confidence_level='HIGH')=0
UNION ALL SELECT 'FP','sesame oil not HIGH',
  (SELECT count(*) FROM synonyms WHERE normalized_term='sesame oil' AND confidence_level='HIGH')=0
UNION ALL SELECT 'FP','lactose-as-milk-allergen not HIGH',
  (SELECT count(*) FROM synonyms WHERE normalized_term='lactose' AND parent_id='milk' AND confidence_level='HIGH')=0
UNION ALL SELECT 'FP','wheat starch not HIGH',
  (SELECT count(*) FROM synonyms WHERE normalized_term='wheat starch' AND parent_id='wheat' AND confidence_level='HIGH')=0

-- ---- REGULATORY correctness ------------------------------------------------
UNION ALL SELECT 'REG','mollusc is NOT FDA-major',
  (SELECT regulatory_major_allergen FROM parents WHERE parent_id='mollusc')=0
UNION ALL SELECT 'REG','crustacean IS FDA-major',
  (SELECT regulatory_major_allergen FROM parents WHERE parent_id='crustacean')=1
UNION ALL SELECT 'REG','pine_nut IS FDA-major (Edition 5, 12 tree nuts)',
  (SELECT regulatory_major_allergen FROM parents WHERE parent_id='pine_nut')=1

-- ---- GROUNDING invariants: evidence attached, nothing promoted -------------
UNION ALL SELECT 'GND','all FDA-major parents have a source_url',
  (SELECT count(*) FROM parents p JOIN source_attribution sa
     ON sa.entry_type='PARENT' AND sa.entry_id=p.parent_id
   WHERE p.regulatory_major_allergen=1 AND sa.source_url IS NULL)=0
UNION ALL SELECT 'GND','grounded rows still PENDING (not reviewed)',
  (SELECT count(*) FROM source_attribution WHERE source_url IS NOT NULL AND review_status!='PENDING')=0
UNION ALL SELECT 'GND','no reviewer set programmatically',
  (SELECT count(*) FROM source_attribution WHERE reviewer IS NOT NULL OR reviewed_at IS NOT NULL)=0

-- ---- COVERAGE: no empty intolerance parent; every allergen has identity -----
UNION ALL SELECT 'COV','no empty intolerance parent',
  (SELECT count(*) FROM parents p WHERE p.domain='INTOLERANCE'
     AND NOT EXISTS(SELECT 1 FROM synonyms s WHERE s.parent_id=p.parent_id))=0
UNION ALL SELECT 'COV','every allergen parent has a self/identity term',
  (SELECT count(*) FROM parents p WHERE p.domain='ALLERGEN'
     AND NOT EXISTS(SELECT 1 FROM synonyms s WHERE s.parent_id=p.parent_id
                    AND s.claim_type='major_allergen_identity'))=0

-- ---- SAFETY NET: no Open Food Facts leak; no orphans ------------------------
UNION ALL SELECT 'SAFE','no Open Food Facts source in attribution',
  (SELECT count(*) FROM source_attribution WHERE source NOT IN ('USDA','FDA','FARE','EXPERT_REVIEW'))=0
UNION ALL SELECT 'SAFE','no orphan synonyms',
  (SELECT count(*) FROM synonyms s LEFT JOIN parents p ON p.parent_id=s.parent_id WHERE p.parent_id IS NULL)=0
UNION ALL SELECT 'SAFE','nothing surfaces in type-ahead pre-validation',
  (SELECT count(*) FROM synonyms WHERE validation_status IN ('CONFIRMED','UT_DALLAS_REVIEWED'))=0

-- ---- match_class / risk taxonomy (Issue 2) ---------------------------------
UNION ALL SELECT 'CLASS','every synonym has a match_class',
  (SELECT count(*) FROM synonyms WHERE match_class IS NULL)=0
UNION ALL SELECT 'CLASS','casein is DIRECT/DERIVED (protein present)',
  EXISTS(SELECT 1 FROM synonyms WHERE normalized_term='casein' AND parent_id='milk'
         AND match_class IN ('DIRECT','DERIVED'))
UNION ALL SELECT 'CLASS','natural flavoring is AMBIGUOUS (not over-asserted)',
  EXISTS(SELECT 1 FROM synonyms WHERE normalized_term='natural flavoring'
         AND match_class='AMBIGUOUS')

-- ---- cross-source multi-parent (Issue 3) -----------------------------------
UNION ALL SELECT 'XSRC','lecithin maps to >=2 parents (soy & egg)',
  (SELECT count(DISTINCT parent_id) FROM synonyms WHERE normalized_term='lecithin')>=2

-- ---- opaque / unknown-state (Issue 1,7,10) ---------------------------------
UNION ALL SELECT 'OPAQUE','"natural flavors" is an opaque term',
  EXISTS(SELECT 1 FROM opaque_terms WHERE normalized_term='natural flavors')
UNION ALL SELECT 'OPAQUE','"seasoning blend" is an opaque term',
  EXISTS(SELECT 1 FROM opaque_terms WHERE normalized_term='seasoning blend')

-- ---- evidence strength (Issue 8) -------------------------------------------
UNION ALL SELECT 'EVID','every attribution row has evidence_strength',
  (SELECT count(*) FROM source_attribution WHERE evidence_strength IS NULL)=0
UNION ALL SELECT 'EVID','FDA major identities are STATUTORY',
  (SELECT count(*) FROM source_attribution WHERE claim_type='major_allergen_identity'
     AND source='FDA' AND evidence_strength!='STATUTORY')=0

-- ---- jurisdiction (Issue 4) ------------------------------------------------
UNION ALL SELECT 'JURIS','mollusc NOT US-major',
  (SELECT is_major FROM regulatory_jurisdiction WHERE parent_id='mollusc' AND jurisdiction='US')=0
UNION ALL SELECT 'JURIS','mollusc IS EU-major',
  (SELECT is_major FROM regulatory_jurisdiction WHERE parent_id='mollusc' AND jurisdiction='EU')=1

-- ---- intolerance beta (Issue 5) --------------------------------------------
UNION ALL SELECT 'BETA','intolerance domain is BETA',
  (SELECT launch_status FROM domains WHERE domain='INTOLERANCE')='BETA'

-- ---- FARE alias grounding --------------------------------------------------
UNION ALL SELECT 'GND','FARE peanut aliases carry a source_url',
  (SELECT count(*) FROM synonyms s JOIN source_attribution sa
     ON sa.entry_type='SYNONYM' AND sa.entry_id=CAST(s.synonym_id AS TEXT)
   WHERE s.parent_id='peanut' AND s.source='FARE' AND sa.source_url IS NULL)=0;

SELECT class, label, CASE passed WHEN 1 THEN 'PASS' ELSE 'FAIL' END status FROM test_results;
SELECT count(*) AS FAILURES FROM test_results WHERE passed=0;
