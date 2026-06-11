-- =============================================================================
-- SEED 03 — DIETARY RULES (starter) + PRIMARY INGREDIENT SAMPLES + METADATA
-- Dietary rules flag PRESENCE of non-aligning terms only (mirror principle —
-- never a verdict). Vegan/Vegetarian seeded as the highest-impact starters;
-- Halal/Kosher/Keto/etc. expand in validation with domain experts.
-- =============================================================================

-- 1. DIETARY RULES — VEGAN (animal-derived terms) ----------------------------
INSERT INTO dietary_rules (sub_group_id, excluded_term, reason, parent_id, source) VALUES
  ('diet.vegan','Milk','animal-derived','milk','EXPERT_REVIEW'),
  ('diet.vegan','Whey','animal-derived','milk','EXPERT_REVIEW'),
  ('diet.vegan','Casein','animal-derived','milk','EXPERT_REVIEW'),
  ('diet.vegan','Egg','animal-derived','egg','EXPERT_REVIEW'),
  ('diet.vegan','Honey','animal-derived',NULL,'EXPERT_REVIEW'),
  ('diet.vegan','Gelatin','animal-derived',NULL,'EXPERT_REVIEW'),
  ('diet.vegan','Lard','animal-derived',NULL,'EXPERT_REVIEW'),
  ('diet.vegan','Tallow','animal-derived',NULL,'EXPERT_REVIEW'),
  ('diet.vegan','Carmine','insect-derived (cochineal)',NULL,'EXPERT_REVIEW'),
  ('diet.vegan','Cochineal','insect-derived',NULL,'EXPERT_REVIEW'),
  ('diet.vegan','Shellac','insect-derived',NULL,'EXPERT_REVIEW'),
  ('diet.vegan','Isinglass','fish-derived','fish','EXPERT_REVIEW'),
  ('diet.vegan','Rennet','animal-derived',NULL,'EXPERT_REVIEW'),
  ('diet.vegan','Beeswax','animal-derived',NULL,'EXPERT_REVIEW'),
  ('diet.vegan','Lanolin','animal-derived',NULL,'EXPERT_REVIEW');

-- 2. DIETARY RULES — VEGETARIAN (meat/fish terms) ----------------------------
INSERT INTO dietary_rules (sub_group_id, excluded_term, reason, parent_id, source) VALUES
  ('diet.vegetarian','Beef','meat',NULL,'EXPERT_REVIEW'),
  ('diet.vegetarian','Pork','meat',NULL,'EXPERT_REVIEW'),
  ('diet.vegetarian','Chicken','meat',NULL,'EXPERT_REVIEW'),
  ('diet.vegetarian','Gelatin','animal-derived',NULL,'EXPERT_REVIEW'),
  ('diet.vegetarian','Lard','animal-derived',NULL,'EXPERT_REVIEW'),
  ('diet.vegetarian','Tallow','animal-derived',NULL,'EXPERT_REVIEW'),
  ('diet.vegetarian','Anchovy','fish','fish','EXPERT_REVIEW'),
  ('diet.vegetarian','Fish sauce','fish','fish','EXPERT_REVIEW'),
  ('diet.vegetarian','Animal rennet','animal-derived',NULL,'EXPERT_REVIEW');

-- 3. PRIMARY INGREDIENT DATABASE — SAMPLES ------------------------------------
-- Illustrative only. The full table is populated by the USDA import job from
-- SR Legacy + Foundation Foods, filtered by commercial significance
-- (Amendments v3.1 Decision 3). usda_fdc_id values below are placeholders.
INSERT INTO ingredients (name, description, commercial_significance, parent_id, source) VALUES
  ('Sunflower oil','A cooking oil pressed from sunflower seeds.',95,NULL,'USDA'),
  ('Sugar','Refined sweetener from sugar cane or beet.',99,NULL,'USDA'),
  ('Wheat flour','Flour milled from wheat grain.',98,'wheat','USDA'),
  ('Whey','The liquid part of milk left after curds form.',80,'milk','USDA'),
  ('Soy lecithin','An emulsifier made from soybeans.',75,'soy','USDA'),
  ('Palm oil','An edible oil from the fruit of oil palms.',90,NULL,'USDA'),
  ('Maltodextrin','A starch-based carbohydrate used as a thickener.',70,NULL,'USDA'),
  ('Citric acid','A common acid used as a preservative and flavoring.',85,NULL,'USDA');

-- 4. DATABASE METADATA --------------------------------------------------------
INSERT INTO db_metadata (key, value) VALUES
  ('schema_version','1.0.0'),
  ('seed_version','2026.06-draft'),
  ('coverage','Big 9 allergen synonym graph (draft) + vegan/vegetarian starter rules'),
  ('validation_state','PRE_VALIDATION — all entries DRAFT, pending UT Dallas cross-validation'),
  ('off_layer','Open Food Facts reserved for Phase 2 runtime layer — not present at launch');
