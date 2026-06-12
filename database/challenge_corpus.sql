-- =============================================================================
-- HOSTILE CHALLENGE CORPUS  (adversarial review Issue 9 — the biggest gap)
-- Real-world label/menu strings with the expected outcome. Catches real failures
-- that schema tests cannot. Run AFTER schema + all seeds + finalize + grounding.
--
-- expect_type:
--   MATCH  -> raw_term must resolve to expect_parent via the synonym graph
--   OPAQUE -> raw_term must be flagged opaque (UNKNOWN), never "not found"
--   NONE   -> raw_term must NOT produce any allergen match (true negative)
--
-- This is a STARTER corpus (~75 rows). A production corpus needs THOUSANDS of
-- strings across cuisines, brands and OCR-mangled variants (logged as future work).
-- =============================================================================
.headers on
.mode column

DROP TABLE IF EXISTS challenge_corpus;
CREATE TABLE challenge_corpus (
    id INTEGER PRIMARY KEY,
    raw_term TEXT NOT NULL,
    expect_type TEXT NOT NULL CHECK (expect_type IN ('MATCH','OPAQUE','NONE')),
    expect_parent TEXT
);

INSERT INTO challenge_corpus (raw_term, expect_type, expect_parent) VALUES
  -- MILK hidden names
  ('sodium caseinate','MATCH','milk'),('lactalbumin','MATCH','milk'),
  ('casein','MATCH','milk'),('whey','MATCH','milk'),('ghee','MATCH','milk'),
  ('paneer','MATCH','milk'),('goat milk','MATCH','milk'),
  ('cheese','MATCH','milk'),('butter','MATCH','milk'),('cream','MATCH','milk'),
  -- EGG
  ('ovalbumin','MATCH','egg'),('albumin','MATCH','egg'),('lysozyme','MATCH','egg'),
  ('meringue','MATCH','egg'),('duck egg','MATCH','egg'),('nougat','MATCH','egg'),
  -- WHEAT / gluten
  ('semolina','MATCH','wheat'),('durum','MATCH','wheat'),('seitan','MATCH','wheat'),
  ('couscous','MATCH','wheat'),('barley','MATCH','gluten'),
  -- SOY
  ('edamame','MATCH','soy'),('tofu','MATCH','soy'),('miso','MATCH','soy'),
  ('tempeh','MATCH','soy'),('natto','MATCH','soy'),('tamari','MATCH','soy'),
  ('gochujang','MATCH','soy'),('doenjang','MATCH','soy'),('hoisin','MATCH','soy'),
  ('lecithin','MATCH','soy'),
  -- PEANUT
  ('arachis oil','MATCH','peanut'),('groundnut','MATCH','peanut'),('mandelona','MATCH','peanut'),
  -- TREE NUTS
  ('marzipan','MATCH','almond'),('praline','MATCH','almond'),
  ('gianduja','MATCH','hazelnut'),('filbert','MATCH','hazelnut'),
  ('pignoli','MATCH','pine_nut'),('pinon nut','MATCH','pine_nut'),
  ('heartnut','MATCH','walnut'),('california walnut','MATCH','walnut'),
  -- FISH
  ('anchovy','MATCH','fish'),('surimi','MATCH','fish'),('caviar','MATCH','fish'),
  ('worcestershire sauce','MATCH','fish'),('furikake','MATCH','fish'),
  -- SHELLFISH
  ('shrimp','MATCH','crustacean'),('prawn','MATCH','crustacean'),('krill','MATCH','crustacean'),
  ('calamari','MATCH','mollusc'),('escargot','MATCH','mollusc'),('abalone','MATCH','mollusc'),
  -- SESAME
  ('tahini','MATCH','sesame'),('halvah','MATCH','sesame'),('gingelly','MATCH','sesame'),
  ('benne','MATCH','sesame'),('til','MATCH','sesame'),('furikake','MATCH','sesame'),
  -- INTOLERANCE (beta)
  ('sodium metabisulfite','MATCH','sulfites'),('fructans','MATCH','fodmaps'),
  ('aspartame','MATCH','sweeteners'),('guarana','MATCH','caffeine'),
  -- OPAQUE — must be UNKNOWN, never "not found"
  ('natural flavors','OPAQUE',NULL),('natural flavoring','OPAQUE',NULL),
  ('spices','OPAQUE',NULL),('seasoning blend','OPAQUE',NULL),
  ('vegetable oil','OPAQUE',NULL),('hydrolyzed vegetable protein','OPAQUE',NULL),
  ('modified food starch','OPAQUE',NULL),('enzymes','OPAQUE',NULL),
  -- NONE — true negatives, must not flag
  ('water','NONE',NULL),('salt','NONE',NULL),('sugar','NONE',NULL),
  ('rice','NONE',NULL),('carrot','NONE',NULL),('ascorbic acid','NONE',NULL);

DROP VIEW IF EXISTS corpus_results;
CREATE TEMP VIEW corpus_results AS
SELECT c.id, c.raw_term, c.expect_type, c.expect_parent,
  CASE c.expect_type
    WHEN 'MATCH'  THEN EXISTS(SELECT 1 FROM synonyms s
                              WHERE s.normalized_term=lower(trim(c.raw_term))
                                AND s.parent_id=c.expect_parent)
    WHEN 'OPAQUE' THEN EXISTS(SELECT 1 FROM opaque_terms o
                              WHERE o.normalized_term=lower(trim(c.raw_term)))
    WHEN 'NONE'   THEN (NOT EXISTS(SELECT 1 FROM synonyms s
                              WHERE s.normalized_term=lower(trim(c.raw_term))))
  END AS passed
FROM challenge_corpus c;

SELECT expect_type, count(*) AS total, sum(passed) AS passed, count(*)-sum(passed) AS failed
FROM corpus_results GROUP BY expect_type;

-- list any misses (false negatives / false positives) for triage
SELECT raw_term, expect_type, COALESCE(expect_parent,'') AS expect_parent, 'MISS' AS result
FROM corpus_results WHERE passed=0 ORDER BY expect_type, raw_term;

SELECT count(*) AS TOTAL_FAILURES FROM corpus_results WHERE passed=0;
