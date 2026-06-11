-- =============================================================================
-- SEED 02 — BIG 9 ALLERGEN PARENTS + SYNONYM GRAPH  (SAFETY-CRITICAL CORE)
--
-- Basis: FDA FALCPA major-allergen identities + FARE "hidden names / other names"
-- allergen lists. ALL rows are validation_status = DRAFT (schema default) pending
-- UT Dallas food-science cross-validation — REQUIRED before launch (Ingredient
-- DB note §1). Nothing here is promoted to CONFIRMED/UT_DALLAS_REVIEWED until a
-- validator signs off, so none of it surfaces in type-ahead yet (that filter
-- requires CONFIRMED/UT_DALLAS_REVIEWED — Ingredient DB note §2.1).
--
-- confidence_level: HIGH = unambiguous derivative; MEDIUM/LOW = context-dependent
-- or dual-source — cross_note explains. frequency_rank is populated later from
-- USDA appearance data (Amendments v3.1 Decision 3).
-- =============================================================================

-- 1. ALLERGEN PARENTS --------------------------------------------------------
-- regulatory_major_allergen: 1 = FDA major allergen (US). FDA's nine major
-- allergens are milk, egg, fish, CRUSTACEAN shellfish, tree nuts, wheat,
-- peanuts, soybeans, sesame. Molluscs are NOT among them.
INSERT INTO parents
  (parent_id, domain, sub_group_id, common_name, technical_name,
   regulatory_major_allergen, regulatory_basis, source) VALUES
  ('milk','ALLERGEN','allergen.milk','Milk and Dairy',NULL,1,
     'FDA major allergen. FDA 2025 guidance: milk of cows, goats, sheep and other ruminants.','FDA'),
  ('egg','ALLERGEN','allergen.egg','Eggs',NULL,1,
     'FDA major allergen. FDA 2025 guidance: eggs of chickens, ducks, geese, quail and other fowl.','FDA'),
  ('wheat','ALLERGEN','allergen.wheat','Wheat',NULL,1,'FDA major allergen.','FDA'),
  ('soy','ALLERGEN','allergen.soy','Soybeans',NULL,1,'FDA major allergen.','FDA'),
  ('peanut','ALLERGEN','allergen.peanut','Peanuts','arachis hypogaea',1,'FDA major allergen.','FDA'),
  ('fish','ALLERGEN','allergen.fish','Fish',NULL,1,'FDA major allergen (finned fish).','FDA'),
  ('sesame','ALLERGEN','allergen.sesame','Sesame',NULL,1,'FDA major allergen (added 2023, FASTER Act).','FDA'),
  -- Tree nuts: each nut is its own graph head (FDA names tree nuts individually)
  ('almond','ALLERGEN','allergen.treenut','Almond',NULL,1,'FDA major allergen (tree nut).','FDA'),
  ('walnut','ALLERGEN','allergen.treenut','Walnut',NULL,1,
     'FDA major allergen (tree nut). FDA names black, California (English/Persian) and heartnut/Japanese walnut.','FDA'),
  ('cashew','ALLERGEN','allergen.treenut','Cashew',NULL,1,'FDA major allergen (tree nut).','FDA'),
  ('pecan','ALLERGEN','allergen.treenut','Pecan',NULL,1,'FDA major allergen (tree nut).','FDA'),
  ('pistachio','ALLERGEN','allergen.treenut','Pistachio',NULL,1,'FDA major allergen (tree nut).','FDA'),
  ('hazelnut','ALLERGEN','allergen.treenut','Hazelnut','filbert',1,'FDA major allergen (tree nut).','FDA'),
  ('brazil_nut','ALLERGEN','allergen.treenut','Brazil Nut',NULL,1,'FDA major allergen (tree nut).','FDA'),
  ('macadamia','ALLERGEN','allergen.treenut','Macadamia',NULL,1,'FDA major allergen (tree nut).','FDA'),
  -- Pine nut (pinon nut): one of the 12 FDA-named tree nuts requiring labeling
  -- (Q&A Guidance Edition 5, Jan 2025). FDA major allergen.
  ('pine_nut','ALLERGEN','allergen.treenut','Pine Nut',NULL,1,
     'FDA major allergen (tree nut). One of the 12 named tree nuts in Q&A Guidance Edition 5 (2025).','FDA'),
  -- Shellfish: crustacean is FDA-major; mollusc is NOT.
  ('crustacean','ALLERGEN','allergen.shellfish','Crustacean Shellfish',NULL,1,
     'FDA major allergen (crustacean shellfish).','FDA'),
  ('mollusc','ALLERGEN','allergen.shellfish','Mollusc Shellfish',NULL,0,
     'NOT an FDA major allergen (US). Clinically significant; major allergen in EU/UK/Canada/AU-NZ.','EXPERT_REVIEW');

-- 2. SYNONYM GRAPH -----------------------------------------------------------
-- columns: parent_id, term, confidence_level, source, cross_note

-- MILK
INSERT INTO synonyms (parent_id, term, confidence_level, source, cross_note) VALUES
  ('milk','Casein','HIGH','FARE',NULL),
  ('milk','Caseinate','HIGH','FARE',NULL),
  ('milk','Sodium caseinate','HIGH','FARE',NULL),
  ('milk','Calcium caseinate','HIGH','FARE',NULL),
  ('milk','Potassium caseinate','HIGH','FARE',NULL),
  ('milk','Rennet casein','HIGH','FARE',NULL),
  ('milk','Whey','HIGH','FARE',NULL),
  ('milk','Whey protein concentrate','HIGH','FARE',NULL),
  ('milk','Whey protein isolate','HIGH','FARE',NULL),
  ('milk','Lactalbumin','HIGH','FARE',NULL),
  ('milk','Lactoglobulin','HIGH','FARE',NULL),
  ('milk','Lactoferrin','HIGH','FARE',NULL),
  ('milk','Lactose','MEDIUM','FARE','Pure lactose is a milk SUGAR; may carry trace milk protein depending on manufacture. Also an intolerance parent.'),
  ('milk','Milk solids','HIGH','FARE',NULL),
  ('milk','Nonfat milk solids','HIGH','FARE',NULL),
  ('milk','Milk powder','HIGH','FARE',NULL),
  ('milk','Dry milk','HIGH','FARE',NULL),
  ('milk','Buttermilk','HIGH','FARE',NULL),
  ('milk','Butterfat','HIGH','FARE',NULL),
  ('milk','Ghee','HIGH','FARE',NULL),
  ('milk','Curds','HIGH','FARE',NULL),
  ('milk','Milk protein','HIGH','FARE',NULL),
  ('milk','Hydrolyzed casein','HIGH','FARE',NULL),
  ('milk','Recaldent','MEDIUM','FARE','CPP-ACP; milk-derived ingredient in some dental/gum products'),
  ('milk','Natural flavoring','LOW','FARE','May be milk-derived; verify with manufacturer');

-- EGG
INSERT INTO synonyms (parent_id, term, confidence_level, source, cross_note) VALUES
  ('egg','Albumin','HIGH','FARE',NULL),
  ('egg','Albumen','HIGH','FARE',NULL),
  ('egg','Ovalbumin','HIGH','FARE',NULL),
  ('egg','Ovomucoid','HIGH','FARE',NULL),
  ('egg','Ovomucin','HIGH','FARE',NULL),
  ('egg','Ovotransferrin','HIGH','FARE',NULL),
  ('egg','Conalbumin','HIGH','FARE',NULL),
  ('egg','Livetin','HIGH','FARE',NULL),
  ('egg','Lysozyme','HIGH','FARE',NULL),
  ('egg','Globulin','MEDIUM','FARE','Egg protein fraction; confirm context'),
  ('egg','Vitellin','HIGH','FARE',NULL),
  ('egg','Ovovitellin','HIGH','FARE',NULL),
  ('egg','Meringue','HIGH','FARE',NULL),
  ('egg','Mayonnaise','HIGH','FARE',NULL),
  ('egg','Egg white','HIGH','FARE',NULL),
  ('egg','Egg yolk','HIGH','FARE',NULL),
  ('egg','Dried egg','HIGH','FARE',NULL),
  ('egg','Egg powder','HIGH','FARE',NULL),
  ('egg','Egg solids','HIGH','FARE',NULL),
  ('egg','Lecithin','LOW','FARE','Usually soy-derived; can be egg-derived (E322) — dual-source, verify'),
  ('egg','Surimi','MEDIUM','FARE','Often contains egg white as binder; also a fish product');

-- WHEAT
INSERT INTO synonyms (parent_id, term, confidence_level, source, cross_note) VALUES
  ('wheat','Wheat flour','HIGH','FARE',NULL),
  ('wheat','Whole wheat','HIGH','FARE',NULL),
  ('wheat','Semolina','HIGH','FARE',NULL),
  ('wheat','Durum','HIGH','FARE',NULL),
  ('wheat','Durum wheat','HIGH','FARE',NULL),
  ('wheat','Spelt','HIGH','FARE',NULL),
  ('wheat','Farina','HIGH','FARE',NULL),
  ('wheat','Einkorn','HIGH','FARE',NULL),
  ('wheat','Emmer','HIGH','FARE',NULL),
  ('wheat','Kamut','HIGH','FARE',NULL),
  ('wheat','Khorasan wheat','HIGH','FARE',NULL),
  ('wheat','Farro','HIGH','FARE',NULL),
  ('wheat','Bulgur','HIGH','FARE',NULL),
  ('wheat','Couscous','HIGH','FARE',NULL),
  ('wheat','Seitan','HIGH','FARE',NULL),
  ('wheat','Vital wheat gluten','HIGH','FARE',NULL),
  ('wheat','Wheat gluten','HIGH','FARE',NULL),
  ('wheat','Wheat starch','MEDIUM','FARE','Processing-dependent: Codex gluten-free wheat starch exists; protein/gluten content varies. Confirm context.'),
  ('wheat','Wheat bran','HIGH','FARE',NULL),
  ('wheat','Wheat germ','HIGH','FARE',NULL),
  ('wheat','Hydrolyzed wheat protein','HIGH','FARE',NULL),
  ('wheat','Modified wheat starch','MEDIUM','FARE','Processing-dependent; protein/gluten content varies. Confirm context.'),
  ('wheat','Atta flour','HIGH','FARE',NULL),
  ('wheat','Graham flour','HIGH','FARE',NULL),
  ('wheat','Matzo','HIGH','FARE',NULL),
  ('wheat','Triticale','MEDIUM','FARE','Wheat-rye hybrid; relevant to wheat-avoiders');

-- SOY
INSERT INTO synonyms (parent_id, term, confidence_level, source, cross_note) VALUES
  ('soy','Soya','HIGH','FARE',NULL),
  ('soy','Soybean','HIGH','FARE',NULL),
  ('soy','Edamame','HIGH','FARE',NULL),
  ('soy','Tofu','HIGH','FARE',NULL),
  ('soy','Tempeh','HIGH','FARE',NULL),
  ('soy','Miso','HIGH','FARE',NULL),
  ('soy','Natto','HIGH','FARE',NULL),
  ('soy','Soy protein','HIGH','FARE',NULL),
  ('soy','Soy protein isolate','HIGH','FARE',NULL),
  ('soy','Soy protein concentrate','HIGH','FARE',NULL),
  ('soy','Textured vegetable protein','HIGH','FARE',NULL),
  ('soy','TVP','HIGH','FARE',NULL),
  ('soy','Tamari','HIGH','FARE',NULL),
  ('soy','Soy sauce','HIGH','FARE','Usually also contains wheat — flag wheat too'),
  ('soy','Soy flour','HIGH','FARE',NULL),
  ('soy','Hydrolyzed soy protein','HIGH','FARE',NULL),
  ('soy','Okara','HIGH','FARE',NULL),
  ('soy','Yuba','HIGH','FARE',NULL),
  ('soy','Soy lecithin','MEDIUM','FARE','Soy-derived emulsifier (E322); many soy-allergic tolerate it'),
  ('soy','Soybean oil','MEDIUM','FARE','Highly refined oil often tolerated; cold-pressed may carry protein');

-- PEANUT
INSERT INTO synonyms (parent_id, term, confidence_level, source, cross_note) VALUES
  ('peanut','Arachis oil','MEDIUM','FARE','Highly refined peanut oil is exempt from major-allergen labeling (statute targets allergenic protein); unrefined/cold-/expeller-pressed retains protein.'),
  ('peanut','Arachis hypogaea','HIGH','FARE',NULL),
  ('peanut','Groundnut','HIGH','FARE',NULL),
  ('peanut','Groundnut oil','MEDIUM','FARE','Refined groundnut oil is protein-exempt; unrefined retains protein.'),
  ('peanut','Cold-pressed peanut oil','HIGH','FARE','Unrefined — retains allergenic protein; not exempt.'),
  ('peanut','Expeller-pressed peanut oil','HIGH','FARE','Unrefined — retains allergenic protein; not exempt.'),
  ('peanut','Monkey nut','HIGH','FARE',NULL),
  ('peanut','Beer nuts','HIGH','FARE',NULL),
  ('peanut','Mandelona','HIGH','FARE','Peanuts flavored to imitate almonds'),
  ('peanut','Goober','HIGH','FARE',NULL),
  ('peanut','Goober peas','HIGH','FARE',NULL),
  ('peanut','Peanut butter','HIGH','FARE',NULL),
  ('peanut','Peanut flour','HIGH','FARE',NULL),
  ('peanut','Peanut protein','HIGH','FARE',NULL),
  ('peanut','Hydrolyzed peanut protein','HIGH','FARE',NULL),
  ('peanut','Valencia peanut','HIGH','FARE',NULL);

-- TREE NUTS
INSERT INTO synonyms (parent_id, term, confidence_level, source, cross_note) VALUES
  ('almond','Almond oil','MEDIUM','FARE','Refined almond oil is largely protein-exempt; unrefined/cold-pressed retains protein.'),
  ('almond','Almond butter','HIGH','FARE',NULL),
  ('almond','Almond flour','HIGH','FARE',NULL),
  ('almond','Almond paste','HIGH','FARE',NULL),
  ('almond','Marzipan','HIGH','FARE',NULL),
  ('almond','Almond extract','MEDIUM','FARE','May be imitation/benzaldehyde; verify if true almond'),
  ('almond','Praline','MEDIUM','FARE','Typically almond or hazelnut — verify nut'),
  ('walnut','Walnut oil','MEDIUM','FARE','Refined walnut oil is largely protein-exempt; unrefined/cold-pressed retains protein.'),
  ('walnut','Black walnut','HIGH','FARE','FDA-named walnut type.'),
  ('walnut','California walnut','HIGH','FARE','FDA-named walnut type (English/Persian).'),
  ('walnut','English walnut','HIGH','FARE','FDA-named walnut type (Persian).'),
  ('walnut','Persian walnut','HIGH','FARE','FDA-named walnut type (English).'),
  ('walnut','Heartnut','HIGH','FARE','Japanese walnut; FDA-named walnut type.'),
  ('walnut','Japanese walnut','HIGH','FARE','Heartnut; FDA-named walnut type.'),
  ('cashew','Cashew butter','HIGH','FARE',NULL),
  ('hazelnut','Filbert','HIGH','FARE',NULL),
  ('hazelnut','Gianduja','HIGH','FARE','Chocolate-hazelnut paste'),
  ('hazelnut','Frangelico','MEDIUM','FARE','Hazelnut liqueur'),
  ('brazil_nut','Brazil nut','HIGH','FARE',NULL),
  ('macadamia','Macadamia nut','HIGH','FARE',NULL),
  ('macadamia','Queensland nut','HIGH','FARE',NULL),
  ('macadamia','Bush nut','HIGH','FARE',NULL),
  ('pine_nut','Pignoli','HIGH','FARE',NULL),
  ('pine_nut','Pinon','HIGH','FARE',NULL);

-- FISH
INSERT INTO synonyms (parent_id, term, confidence_level, source, cross_note) VALUES
  ('fish','Anchovy','HIGH','FARE',NULL),
  ('fish','Cod','HIGH','FARE',NULL),
  ('fish','Salmon','HIGH','FARE',NULL),
  ('fish','Tuna','HIGH','FARE',NULL),
  ('fish','Tilapia','HIGH','FARE',NULL),
  ('fish','Bass','HIGH','FARE',NULL),
  ('fish','Haddock','HIGH','FARE',NULL),
  ('fish','Halibut','HIGH','FARE',NULL),
  ('fish','Mackerel','HIGH','FARE',NULL),
  ('fish','Sardine','HIGH','FARE',NULL),
  ('fish','Herring','HIGH','FARE',NULL),
  ('fish','Trout','HIGH','FARE',NULL),
  ('fish','Pollock','HIGH','FARE',NULL),
  ('fish','Surimi','HIGH','FARE','Imitation crab made from fish'),
  ('fish','Fish sauce','HIGH','FARE',NULL),
  ('fish','Fish gelatin','HIGH','FARE',NULL),
  ('fish','Fish stock','HIGH','FARE',NULL),
  ('fish','Caviar','HIGH','FARE',NULL),
  ('fish','Roe','HIGH','FARE',NULL),
  ('fish','Fish oil','MEDIUM','FARE','Refined fish oil may retain trace protein'),
  ('fish','Worcestershire sauce','MEDIUM','FARE','Often contains anchovy'),
  ('fish','Omega-3','LOW','FARE','May be fish-derived; can be algal/plant — verify source');

-- SHELLFISH — CRUSTACEAN
INSERT INTO synonyms (parent_id, term, confidence_level, source, cross_note) VALUES
  ('crustacean','Shrimp','HIGH','FARE',NULL),
  ('crustacean','Prawn','HIGH','FARE',NULL),
  ('crustacean','Crab','HIGH','FARE',NULL),
  ('crustacean','Lobster','HIGH','FARE',NULL),
  ('crustacean','Crayfish','HIGH','FARE',NULL),
  ('crustacean','Crawfish','HIGH','FARE',NULL),
  ('crustacean','Langoustine','HIGH','FARE',NULL),
  ('crustacean','Krill','HIGH','FARE',NULL),
  ('crustacean','Scampi','HIGH','FARE',NULL);

-- SHELLFISH — MOLLUSC
INSERT INTO synonyms (parent_id, term, confidence_level, source, cross_note) VALUES
  ('mollusc','Clam','HIGH','FARE',NULL),
  ('mollusc','Mussel','HIGH','FARE',NULL),
  ('mollusc','Oyster','HIGH','FARE',NULL),
  ('mollusc','Scallop','HIGH','FARE',NULL),
  ('mollusc','Squid','HIGH','FARE',NULL),
  ('mollusc','Calamari','HIGH','FARE',NULL),
  ('mollusc','Octopus','HIGH','FARE',NULL),
  ('mollusc','Snail','HIGH','FARE',NULL),
  ('mollusc','Escargot','HIGH','FARE',NULL),
  ('mollusc','Abalone','HIGH','FARE',NULL),
  ('mollusc','Cockle','HIGH','FARE',NULL),
  ('mollusc','Whelk','HIGH','FARE',NULL),
  ('mollusc','Cuttlefish','HIGH','FARE',NULL),
  ('mollusc','Glucosamine','LOW','FARE','Often shellfish-derived; can be corn-fermented — verify source');

-- SESAME
INSERT INTO synonyms (parent_id, term, confidence_level, source, cross_note) VALUES
  ('sesame','Sesame seed','HIGH','FARE',NULL),
  ('sesame','Sesame oil','MEDIUM','FARE','Refined sesame oil is largely protein-exempt; culinary/toasted sesame oil is usually unrefined and retains protein.'),
  ('sesame','Toasted sesame oil','HIGH','FARE','Unrefined/aromatic — retains protein; not exempt.'),
  ('sesame','Sesame paste','HIGH','FARE',NULL),
  ('sesame','Tahini','HIGH','FARE',NULL),
  ('sesame','Tahina','HIGH','FARE',NULL),
  ('sesame','Sesamol','HIGH','FARE',NULL),
  ('sesame','Sesamin','HIGH','FARE',NULL),
  ('sesame','Benne','HIGH','FARE',NULL),
  ('sesame','Benniseed','HIGH','FARE',NULL),
  ('sesame','Gingelly','HIGH','FARE',NULL),
  ('sesame','Gingelly oil','MEDIUM','FARE','Refined is largely protein-exempt; unrefined retains protein.'),
  ('sesame','Til','HIGH','FARE',NULL),
  ('sesame','Halvah','HIGH','FARE',NULL),
  ('sesame','Sim sim','HIGH','FARE',NULL),
  ('sesame','Sesame flour','HIGH','FARE',NULL),
  ('sesame','Hummus','LOW','FARE','Usually contains tahini (sesame) but not always; broad term — inference only.');

-- 3. CANONICAL SELF-TERMS  (every parent must match its own name when OCR reads
--    it literally — Issue 3. claim_type = major_allergen_identity.)
INSERT INTO synonyms (parent_id, term, confidence_level, source, claim_type) VALUES
  ('milk','Milk','HIGH','FDA','major_allergen_identity'),
  ('egg','Egg','HIGH','FDA','major_allergen_identity'),
  ('egg','Eggs','HIGH','FDA','major_allergen_identity'),
  ('wheat','Wheat','HIGH','FDA','major_allergen_identity'),
  ('soy','Soy','HIGH','FDA','major_allergen_identity'),
  ('peanut','Peanut','HIGH','FDA','major_allergen_identity'),
  ('peanut','Peanuts','HIGH','FDA','major_allergen_identity'),
  ('fish','Fish','HIGH','FDA','major_allergen_identity'),
  ('sesame','Sesame','HIGH','FDA','major_allergen_identity'),
  ('almond','Almond','HIGH','FDA','major_allergen_identity'),
  ('almond','Almonds','HIGH','FDA','major_allergen_identity'),
  ('walnut','Walnut','HIGH','FDA','major_allergen_identity'),
  ('walnut','Walnuts','HIGH','FDA','major_allergen_identity'),
  ('cashew','Cashew','HIGH','FDA','major_allergen_identity'),
  ('cashew','Cashews','HIGH','FDA','major_allergen_identity'),
  ('pecan','Pecan','HIGH','FDA','major_allergen_identity'),
  ('pecan','Pecans','HIGH','FDA','major_allergen_identity'),
  ('pistachio','Pistachio','HIGH','FDA','major_allergen_identity'),
  ('pistachio','Pistachios','HIGH','FDA','major_allergen_identity'),
  ('hazelnut','Hazelnut','HIGH','FDA','major_allergen_identity'),
  ('hazelnut','Hazelnuts','HIGH','FDA','major_allergen_identity'),
  ('brazil_nut','Brazil nuts','HIGH','FDA','major_allergen_identity'),
  ('macadamia','Macadamia','HIGH','FDA','major_allergen_identity'),
  ('pine_nut','Pine nut','HIGH','FDA','major_allergen_identity'),
  ('pine_nut','Pine nuts','HIGH','FDA','major_allergen_identity'),
  ('pine_nut','Pinon nut','HIGH','FDA','major_allergen_identity'),
  ('crustacean','Crustacean','HIGH','FDA','major_allergen_identity'),
  ('mollusc','Mollusc','HIGH','EXPERT_REVIEW','major_allergen_identity'),
  ('mollusc','Mollusk','HIGH','EXPERT_REVIEW','major_allergen_identity');

-- 4. MILK SPECIES VARIANTS  (FDA 2025: milk of cows, goats, sheep & other
--    ruminants — Issue 2.)
INSERT INTO synonyms (parent_id, term, confidence_level, source, claim_type, cross_note) VALUES
  ('milk','Cow milk','HIGH','FDA','species_variant',NULL),
  ('milk','Goat milk','HIGH','FDA','species_variant','FDA 2025: ruminant milk.'),
  ('milk','Sheep milk','HIGH','FDA','species_variant','FDA 2025: ruminant milk.'),
  ('milk','Buffalo milk','HIGH','FDA','species_variant','Ruminant milk.'),
  ('milk','Goat cheese','HIGH','FDA','species_variant',NULL),
  ('milk','Sheep cheese','HIGH','FDA','species_variant',NULL),
  ('milk','Goat whey','HIGH','FDA','species_variant',NULL),
  ('milk','Pecorino','MEDIUM','FARE','species_variant','Sheep-milk cheese.');

-- 5. EGG SPECIES VARIANTS  (FDA 2025: eggs of chickens, ducks, geese, quail &
--    other fowl — Issue 2.)
INSERT INTO synonyms (parent_id, term, confidence_level, source, claim_type, cross_note) VALUES
  ('egg','Chicken egg','HIGH','FDA','species_variant',NULL),
  ('egg','Duck egg','HIGH','FDA','species_variant','FDA 2025: fowl egg.'),
  ('egg','Goose egg','HIGH','FDA','species_variant','FDA 2025: fowl egg.'),
  ('egg','Quail egg','HIGH','FDA','species_variant','FDA 2025: fowl egg.'),
  ('egg','Fowl egg','HIGH','FDA','species_variant','FDA 2025: covers other fowl.');
