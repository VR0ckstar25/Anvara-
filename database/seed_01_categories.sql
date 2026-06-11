-- =============================================================================
-- SEED 01 — DOMAINS, SUB-GROUPS, GOALS, INTOLERANCE PARENTS, DIETARY SUB-GROUPS
-- Sub-groups are the selectable download units (Amendments v3.1 Decision 6).
-- Onboarding preset tiles map 1:1 to these sub-groups (Transfer Note v3.0 §5.2).
-- =============================================================================

-- 1. DOMAINS -----------------------------------------------------------------
-- INTOLERANCE ships as BETA (Issue 5): its evidence base is weaker than allergy
-- data, so it must not appear equally authoritative.
INSERT INTO domains (domain, label, launch_status) VALUES
  ('ALLERGEN','Allergies','LAUNCH'),
  ('INTOLERANCE','Intolerances','BETA'),
  ('DIETARY_PREFERENCE','Dietary Preferences','LAUNCH'),
  ('GOAL','Nutritional & Digestive Goals','LAUNCH');

-- 2. SUB-GROUPS --------------------------------------------------------------
-- Allergens — the Big 9 (Q1 preset tiles)
INSERT INTO sub_groups (sub_group_id, domain, label, sort_order) VALUES
  ('allergen.milk','ALLERGEN','Milk and Dairy',1),
  ('allergen.egg','ALLERGEN','Eggs',2),
  ('allergen.wheat','ALLERGEN','Wheat',3),
  ('allergen.soy','ALLERGEN','Soybeans',4),
  ('allergen.peanut','ALLERGEN','Peanuts',5),
  ('allergen.treenut','ALLERGEN','Tree Nuts',6),
  ('allergen.fish','ALLERGEN','Fish',7),
  ('allergen.shellfish','ALLERGEN','Shellfish',8),
  ('allergen.sesame','ALLERGEN','Sesame',9);

-- Intolerances (Q2 preset tiles)
INSERT INTO sub_groups (sub_group_id, domain, label, sort_order) VALUES
  ('intol.lactose','INTOLERANCE','Lactose',1),
  ('intol.gluten','INTOLERANCE','Gluten',2),
  ('intol.fructose','INTOLERANCE','Fructose',3),
  ('intol.histamine','INTOLERANCE','Histamine',4),
  ('intol.sulfites','INTOLERANCE','Sulfites',5),
  ('intol.caffeine','INTOLERANCE','Caffeine',6),
  ('intol.sweeteners','INTOLERANCE','Artificial Sweeteners',7),
  ('intol.fodmaps','INTOLERANCE','FODMAPs',8);

-- Dietary preferences (Q3 preset tiles)
INSERT INTO sub_groups (sub_group_id, domain, label, sort_order) VALUES
  ('diet.vegan','DIETARY_PREFERENCE','Vegan',1),
  ('diet.vegetarian','DIETARY_PREFERENCE','Vegetarian',2),
  ('diet.pescatarian','DIETARY_PREFERENCE','Pescatarian',3),
  ('diet.keto','DIETARY_PREFERENCE','Keto',4),
  ('diet.mediterranean','DIETARY_PREFERENCE','Mediterranean',5),
  ('diet.halal','DIETARY_PREFERENCE','Halal',6),
  ('diet.kosher','DIETARY_PREFERENCE','Kosher',7);

-- Goals (Q4 preset tiles)
INSERT INTO sub_groups (sub_group_id, domain, label, sort_order) VALUES
  ('goal.less_sodium','GOAL','Less Sodium',1),
  ('goal.less_sugar','GOAL','Less Sugar',2),
  ('goal.more_protein','GOAL','More Protein',3),
  ('goal.more_fibre','GOAL','More Fibre',4),
  ('goal.less_sat_fat','GOAL','Less Saturated Fat',5),
  ('goal.easier_digest','GOAL','Easier to Digest',6),
  ('goal.low_fodmap','GOAL','Low FODMAP',7),
  ('goal.calorie_awareness','GOAL','Calorie Awareness',8);

-- 3. GOAL FLAGS (nutrient-based; app states the number vs the declared goal) ---
INSERT INTO goal_flags (sub_group_id, nutrient, direction, label) VALUES
  ('goal.less_sodium','sodium','LESS','Less Sodium'),
  ('goal.less_sugar','sugar','LESS','Less Sugar'),
  ('goal.more_protein','protein','MORE','More Protein'),
  ('goal.more_fibre','fibre','MORE','More Fibre'),
  ('goal.less_sat_fat','saturated_fat','LESS','Less Saturated Fat');

-- 4. INTOLERANCE PARENTS (graph heads for the intolerance domain) -------------
INSERT INTO parents (parent_id, domain, sub_group_id, common_name, technical_name, source) VALUES
  ('lactose','INTOLERANCE','intol.lactose','Lactose','milk sugar','FARE'),
  ('gluten','INTOLERANCE','intol.gluten','Gluten',NULL,'FDA'),
  ('fructose','INTOLERANCE','intol.fructose','Fructose','fruit sugar','USDA'),
  ('histamine','INTOLERANCE','intol.histamine','Histamine',NULL,'EXPERT_REVIEW'),
  ('sulfites','INTOLERANCE','intol.sulfites','Sulfites',NULL,'FDA'),
  ('caffeine','INTOLERANCE','intol.caffeine','Caffeine',NULL,'USDA'),
  ('sweeteners','INTOLERANCE','intol.sweeteners','Artificial Sweeteners',NULL,'FDA'),
  ('fodmaps','INTOLERANCE','intol.fodmaps','FODMAPs',NULL,'EXPERT_REVIEW');
