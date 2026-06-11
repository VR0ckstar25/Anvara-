-- =============================================================================
-- SEED 04 — INTOLERANCE SYNONYM GRAPHS  (Issue 4 — parents existed but were
-- empty, a major functional false-negative risk. These tiles must NOT be enabled
-- until these graphs are validated.)
--
-- All rows: claim_type = 'intolerance_trigger', validation_status = DRAFT.
-- Confidence is honest: many triggers are dose/context-dependent (MEDIUM/LOW).
-- Sources: sulfites & sweeteners are FDA-regulated; gluten labeling is FDA;
-- histamine / FODMAPs / fructose-malabsorption are clinical → EXPERT_REVIEW.
-- =============================================================================

-- LACTOSE (lactose-containing dairy; aged cheese & whey are often low-lactose) --
INSERT INTO synonyms (parent_id, term, confidence_level, source, claim_type, cross_note) VALUES
  ('lactose','Lactose','HIGH','FARE','intolerance_trigger',NULL),
  ('lactose','Milk','HIGH','FARE','intolerance_trigger',NULL),
  ('lactose','Whole milk','HIGH','FARE','intolerance_trigger',NULL),
  ('lactose','Skim milk','HIGH','FARE','intolerance_trigger',NULL),
  ('lactose','Milk solids','HIGH','FARE','intolerance_trigger',NULL),
  ('lactose','Milk powder','HIGH','FARE','intolerance_trigger',NULL),
  ('lactose','Buttermilk','HIGH','FARE','intolerance_trigger',NULL),
  ('lactose','Cream','HIGH','FARE','intolerance_trigger',NULL),
  ('lactose','Condensed milk','HIGH','FARE','intolerance_trigger',NULL),
  ('lactose','Evaporated milk','HIGH','FARE','intolerance_trigger',NULL),
  ('lactose','Ice cream','HIGH','FARE','intolerance_trigger',NULL),
  ('lactose','Lactose monohydrate','HIGH','FARE','intolerance_trigger',NULL),
  ('lactose','Curds','HIGH','FARE','intolerance_trigger',NULL),
  ('lactose','Whey','MEDIUM','FARE','intolerance_trigger','Whey can be low-lactose depending on processing.'),
  ('lactose','Cheese','MEDIUM','FARE','intolerance_trigger','Aged/hard cheeses are often very low in lactose.'),
  ('lactose','Butter','LOW','FARE','intolerance_trigger','Very low lactose.');

-- GLUTEN (wheat, barley, rye, triticale + derivatives) -----------------------
INSERT INTO synonyms (parent_id, term, confidence_level, source, claim_type, cross_note) VALUES
  ('gluten','Gluten','HIGH','FDA','intolerance_trigger',NULL),
  ('gluten','Wheat','HIGH','FDA','intolerance_trigger',NULL),
  ('gluten','Barley','HIGH','FDA','intolerance_trigger',NULL),
  ('gluten','Rye','HIGH','FDA','intolerance_trigger',NULL),
  ('gluten','Triticale','HIGH','FDA','intolerance_trigger',NULL),
  ('gluten','Malt','HIGH','FDA','intolerance_trigger','Usually barley-derived.'),
  ('gluten','Malt extract','HIGH','FDA','intolerance_trigger',NULL),
  ('gluten','Malt vinegar','HIGH','FDA','intolerance_trigger',NULL),
  ('gluten','Spelt','HIGH','FDA','intolerance_trigger',NULL),
  ('gluten','Kamut','HIGH','FDA','intolerance_trigger',NULL),
  ('gluten','Semolina','HIGH','FDA','intolerance_trigger',NULL),
  ('gluten','Durum','HIGH','FDA','intolerance_trigger',NULL),
  ('gluten','Farro','HIGH','FDA','intolerance_trigger',NULL),
  ('gluten','Bulgur','HIGH','FDA','intolerance_trigger',NULL),
  ('gluten','Seitan','HIGH','FDA','intolerance_trigger',NULL),
  ('gluten','Brewer''s yeast','MEDIUM','FARE','intolerance_trigger','Often barley-derived.'),
  ('gluten','Oats','MEDIUM','FDA','intolerance_trigger','Pure oats are gluten-free; risk is cross-contamination.'),
  ('gluten','Wheat starch','MEDIUM','FDA','intolerance_trigger','Codex gluten-free wheat starch exists; varies.');

-- FRUCTOSE (fructose malabsorption) ------------------------------------------
INSERT INTO synonyms (parent_id, term, confidence_level, source, claim_type, cross_note) VALUES
  ('fructose','Fructose','HIGH','USDA','intolerance_trigger',NULL),
  ('fructose','Crystalline fructose','HIGH','USDA','intolerance_trigger',NULL),
  ('fructose','High-fructose corn syrup','HIGH','USDA','intolerance_trigger',NULL),
  ('fructose','HFCS','HIGH','USDA','intolerance_trigger',NULL),
  ('fructose','Agave','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('fructose','Agave nectar','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('fructose','Honey','HIGH','USDA','intolerance_trigger',NULL),
  ('fructose','Invert sugar','MEDIUM','USDA','intolerance_trigger',NULL),
  ('fructose','Fruit juice concentrate','MEDIUM','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('fructose','Sorbitol','MEDIUM','EXPERT_REVIEW','intolerance_trigger','Polyol; worsens fructose malabsorption.'),
  ('fructose','Inulin','MEDIUM','EXPERT_REVIEW','intolerance_trigger',NULL);

-- HISTAMINE (high-histamine & histamine-liberating foods — context-dependent) -
INSERT INTO synonyms (parent_id, term, confidence_level, source, claim_type, cross_note) VALUES
  ('histamine','Aged cheese','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('histamine','Cured meats','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('histamine','Salami','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('histamine','Fermented foods','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('histamine','Sauerkraut','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('histamine','Kimchi','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('histamine','Wine','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('histamine','Smoked fish','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('histamine','Soy sauce','MEDIUM','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('histamine','Vinegar','MEDIUM','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('histamine','Tuna','MEDIUM','EXPERT_REVIEW','intolerance_trigger','Scombroid risk if poorly stored.'),
  ('histamine','Tomatoes','MEDIUM','EXPERT_REVIEW','intolerance_trigger','Histamine liberator.'),
  ('histamine','Spinach','MEDIUM','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('histamine','Avocado','MEDIUM','EXPERT_REVIEW','intolerance_trigger',NULL);

-- SULFITES (FDA requires declaration at >=10 ppm) ----------------------------
INSERT INTO synonyms (parent_id, term, confidence_level, source, claim_type, cross_note) VALUES
  ('sulfites','Sulfites','HIGH','FDA','intolerance_trigger',NULL),
  ('sulfites','Sulphur dioxide','HIGH','FDA','intolerance_trigger',NULL),
  ('sulfites','Sulfur dioxide','HIGH','FDA','intolerance_trigger',NULL),
  ('sulfites','Sodium sulfite','HIGH','FDA','intolerance_trigger',NULL),
  ('sulfites','Sodium bisulfite','HIGH','FDA','intolerance_trigger',NULL),
  ('sulfites','Sodium metabisulfite','HIGH','FDA','intolerance_trigger',NULL),
  ('sulfites','Potassium bisulfite','HIGH','FDA','intolerance_trigger',NULL),
  ('sulfites','Potassium metabisulfite','HIGH','FDA','intolerance_trigger',NULL),
  ('sulfites','E220','HIGH','FDA','intolerance_trigger','Sulphur dioxide.'),
  ('sulfites','E223','HIGH','FDA','intolerance_trigger','Sodium metabisulfite.'),
  ('sulfites','E224','HIGH','FDA','intolerance_trigger','Potassium metabisulfite.');

-- CAFFEINE -------------------------------------------------------------------
INSERT INTO synonyms (parent_id, term, confidence_level, source, claim_type, cross_note) VALUES
  ('caffeine','Caffeine','HIGH','USDA','intolerance_trigger',NULL),
  ('caffeine','Coffee','HIGH','USDA','intolerance_trigger',NULL),
  ('caffeine','Tea','HIGH','USDA','intolerance_trigger',NULL),
  ('caffeine','Green tea','HIGH','USDA','intolerance_trigger',NULL),
  ('caffeine','Black tea','HIGH','USDA','intolerance_trigger',NULL),
  ('caffeine','Matcha','HIGH','USDA','intolerance_trigger',NULL),
  ('caffeine','Guarana','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('caffeine','Yerba mate','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('caffeine','Kola nut','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('caffeine','Cocoa','MEDIUM','USDA','intolerance_trigger','Contains some caffeine + theobromine.'),
  ('caffeine','Chocolate','MEDIUM','USDA','intolerance_trigger',NULL),
  ('caffeine','Green tea extract','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL);

-- ARTIFICIAL SWEETENERS (FDA-approved high-intensity sweeteners) --------------
INSERT INTO synonyms (parent_id, term, confidence_level, source, claim_type, cross_note) VALUES
  ('sweeteners','Aspartame','HIGH','FDA','intolerance_trigger',NULL),
  ('sweeteners','Sucralose','HIGH','FDA','intolerance_trigger',NULL),
  ('sweeteners','Saccharin','HIGH','FDA','intolerance_trigger',NULL),
  ('sweeteners','Acesulfame potassium','HIGH','FDA','intolerance_trigger',NULL),
  ('sweeteners','Acesulfame K','HIGH','FDA','intolerance_trigger',NULL),
  ('sweeteners','Neotame','HIGH','FDA','intolerance_trigger',NULL),
  ('sweeteners','Advantame','HIGH','FDA','intolerance_trigger',NULL),
  ('sweeteners','E951','HIGH','FDA','intolerance_trigger','Aspartame.'),
  ('sweeteners','E955','HIGH','FDA','intolerance_trigger','Sucralose.'),
  ('sweeteners','E950','HIGH','FDA','intolerance_trigger','Acesulfame K.');

-- FODMAPs (Monash classification — clinical) ---------------------------------
INSERT INTO synonyms (parent_id, term, confidence_level, source, claim_type, cross_note) VALUES
  ('fodmaps','Fructans','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('fodmaps','Galacto-oligosaccharides','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('fodmaps','GOS','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('fodmaps','Inulin','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('fodmaps','Chicory root','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('fodmaps','Sorbitol','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('fodmaps','Mannitol','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('fodmaps','Xylitol','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('fodmaps','Maltitol','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('fodmaps','Onion','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('fodmaps','Garlic','HIGH','EXPERT_REVIEW','intolerance_trigger',NULL),
  ('fodmaps','Lactose','MEDIUM','EXPERT_REVIEW','intolerance_trigger','A FODMAP for those who malabsorb it.'),
  ('fodmaps','Wheat','MEDIUM','EXPERT_REVIEW','intolerance_trigger','Fructan source.');
