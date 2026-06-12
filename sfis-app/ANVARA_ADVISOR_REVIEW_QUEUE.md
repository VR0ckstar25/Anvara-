# Anvara Advisor Review Queue

This file stores questions, concerns, inclinations, recommendations, and improvement ideas for later founder review. It is intentionally critical and user-first. Nothing here should be treated as a completed feature unless it is also checked off in the build checklist or verified in code.

Related files:

- `ANVARA_BUILD_CHECKLIST.md` - prioritized build and launch checklist.
- `PRODUCT_READINESS_NOTES.md` - launch-gate reminders.

## Executive View

Anvara's strongest product promise is: help a person compare a food label against their own watchlist, save what happened, and notice repeated patterns without pretending to be a doctor or a certification authority.

The app should stay narrow, honest, and emotionally calming until the data, OCR, auth, billing, and legal posture are mature. The dangerous failure mode is not "the app is missing features." The dangerous failure mode is "the app feels complete enough that users over-trust draft data."

## Competitive Strategy Note: Fig

Founder concern: Anvara could be released as a monetized scanner, but that risks making it one more allergy/diet scanner in a crowded category. Fig is already established, publicly markets 1M+ members and 2,800+ allergy/diet/condition options, and appears to monetize through scan limits, trials, or paid plans depending on channel/version. Public source links to revisit: Google Play `https://play.google.com/store/apps/details?id=com.fig`, App Store `https://apps.apple.com/us/app/fig-food-scanner-guide/id1564434726`, Fig site `https://foodisgood.com/`.

Strategic implication: Anvara should not compete first on raw database breadth or "scanner app" sameness. Fig can credibly say it covers more categories today. Anvara's opening should be trust, privacy, family clarity, transparent uncertainty, scan history, and lower-friction time-to-value.

Recommended stance:

- Do not force credit card entry before the first useful result. That creates an immediate trust opening for Anvara.
- Let users experience a personalized sample scan and at least a small number of real scans before asking for payment.
- Monetize around durable value: family profiles, sync, history depth, offline packs, product issue follow-up, and premium convenience.
- Keep basic allergy-result clarity free enough to build trust. Do not make the first emotional moment feel trapped behind payment.
- Position Anvara as "calm, private, profile-aware label reading" rather than "largest database."
- Make transparent limitations a feature: draft/validated data status, label evidence, why it matched, and what could not be verified.
- Win a wedge before broadening: families with children, privacy-conscious allergy users, or people who want a saved pattern diary.

Possible differentiators to build:

- Trust-first onboarding: policies, account/local choice, watchlist, personalized sample result, then optional plan.
- Family mode that clearly says which child/person a finding applies to.
- Evidence-based result detail: label evidence, derivative, also-known-as, uncertainty, and database validation state.
- Local-first privacy: label photos expire, OCR text not synced, profile-specific offline packs.
- Saved scan memory: Diary and Patterns turn scanning into a useful record, not a one-off lookup.
- Human review loop: `Wrong` and `Unsure` should feed a visible product-data correction workflow.

Open decision: Should Anvara deliberately avoid a hard paywall during onboarding and instead use a beta/free tier that proves trust before monetization?

## Onboarding Pattern Adaptation

Founder clarification: the goal is to replicate the proven process pattern used by apps like Fig, not their UI style, wording, brand, screens, screenshots, or proprietary creative. This is acceptable product pattern learning: most consumer apps use similar onboarding funnels, but Anvara should execute the pattern with its own trust-first posture.

Publicly observed Fig-style pattern to adapt:

1. Welcome/value promise.
2. Quick profiling questions that make the app feel personalized.
3. Preference/restriction selection.
4. Trust/disclaimer screen.
5. First-scan tutorial or sample value moment.
6. Monetization or trial prompt in some versions/channels.
7. App entry.

Anvara translation:

1. Welcome: calm label help, no verdicts.
2. Policies and safety acknowledgement before personal data.
3. Sign in or local-only path.
4. Quick intent question: allergy, family/child, intolerance, diet, or mixed needs.
5. Watchlist builder with no hidden preselected allergens.
6. Credibility/trust screen focused on privacy, draft-data honesty, and issue reporting.
7. Personalized sample result using the user's real watchlist.
8. How-it-works tutorial.
9. Profile-specific offline setup.
10. Home.

Design guardrails:

- Do not copy Fig's wording, UI layout, illustrations, colors, or paywall structure.
- Do not force credit card entry before a user experiences real value.
- Keep Anvara's differentiators visible: privacy, family attribution, uncertainty, saved history, and local-first data.
- Do not use safe/unsafe verdicts. Use evidence and explanation.
- Keep the sample scan clearly labeled as sample and exclude it from real pattern progress.

## Questions To Decide

- What exact claim are we willing to make: "label-reading helper," "food safety companion," "allergy scanner," or something else?
- Who independently validates `src/data/allergens.json`, what standard do they use, and what makes an entry ready for production?
- Are we launching as private beta, public beta, or paid product? The acceptable risk level is different for each.
- Should an account be required before preferences, or should local use remain available after policy acceptance for lower friction?
- If a user forgets the app PIN on a local-only profile, what recovery promise do we make without misleading them?
- Do we ever upload label photos, or do we keep the current posture: photos local only, OCR text stripped before cloud sync?
- What is the support promise when someone taps `Wrong` or `Unsure` on a result?
- How do family invites work in the real account system: email invite, household code, parent-managed local-only profiles, or all three?
- What extra consent/copy is required for child profiles and family members?
- What are the exact Free, Plus, and Family limits, and which features are trust-building rather than paywalled safety basics?
- Which visual direction wins: current Blossom/Fuchsia, Market Pop, Electric Garden, Berry Volt, or a hybrid?
- What launch geography is intended first? Legal/privacy/data rules can change by market.

## Critical Concerns

- The bundled database is marked `PRE_VALIDATION`. Do not market results as medically validated or safety-certified.
- Real device OCR still needs Android and iOS validation. A scanner app that cannot reliably read labels is not sellable yet.
- Production Firebase, Google sign-in, Apple sign-in, Firestore rules, and billing are not finished launch infrastructure.
- Demo/preproduction auth must not leak into production builds.
- The result experience is clearer now, but any wording that sounds like "safe" or "unsafe" could create dangerous over-trust.
- Pattern summaries must stay descriptive. Do not imply diagnosis, prediction, or medical advice.
- Family profiles introduce sensitive household and child data. Permissions, removal, consent, and account boundaries need real design.
- Backup/sync needs tests for conflict merge, outbox retry, failed writes, account switch, and restore behavior.
- Legal policy copy is placeholder product copy until reviewed.
- Accessibility has not had a full real-device pass. This matters because many users may be anxious, in stores, and using one hand.
- Visual design is still split between the current app and preview concepts. A split identity weakens trust.
- App.js is carrying too much navigation/state responsibility. It works, but long-term maintenance risk is rising.

## My Inclinations

- Keep Anvara local-first and privacy-forward by default.
- Keep sample scanning after the user creates a real watchlist so the first "aha" moment is personalized.
- Do not put third-party ads anywhere near camera, result, ingredient detail, onboarding trust, or child/family flows.
- Keep the recommended offline download small and profile-specific. Full database download should remain optional.
- Prefer "watchlist" over "preferences" for user-facing copy. It sounds more active and less casual for allergies.
- Avoid "neural network" in consumer copy. Use "patterns," "repeated findings," or "on-device summaries."
- Keep "Draft data" visible until the database is independently validated.
- Do not add a mascot. The product needs calm trust, not character branding.
- Make manual ingredient entry a permanent fallback, not a temporary workaround.
- Treat product issue reporting as an operations feature, not just a UI button.

## User Experience Improvements

- Add an OCR review step: show read text, product name, and brand before saving or matching.
- Let users edit product name and brand after OCR before a scan is saved.
- Add clearer retake/edit options when OCR confidence is weak.
- Add a richer empty state for Diary that points to the next useful action without feeling fake.
- Make Patterns explain when there is not enough real scan history yet.
- Add a simple "why am I seeing this?" explanation on each pattern insight.
- Make family attribution visible in every result path and detail path. Do not make parents hunt for it.
- Add family member removal, permissions, and child defaults.
- Improve result explanation content so "Detailed explanation pending review" disappears before launch.
- Add an offline update reminder when the local pack is stale.
- Add "retry all backups now" in Security/Backup outside temporary banners.
- Add export/delete controls for local data in plain language.
- Add plain-language privacy copy in settings: what stays on phone, what syncs, what expires.
- Review all wording for anxiety: calm, specific, honest, and never alarmist.

## Engineering Improvements

- Add end-to-end tests for auth, account switching, sync merge, and outbox retry.
- Add Firestore rules tests before production auth is marketed.
- Add typed schemas or runtime validators for profile, scan, feedback, offline pack, and cloud payloads.
- Add storage migrations for future profile model changes.
- Split large `App.js` into navigation, auth/session, scan, sync, and settings modules.
- Add CI for matcher tests, app clearance tests, parse, lint, rules tests, and dependency audit.
- Add production build guards that fail if demo auth is enabled.
- Add real monitoring: crash reports, sync failures, OCR failures, and product issue queue health.
- Add test coverage for profile-specific offline pack contents.
- Add test cases for corrupted local encrypted chunks and partial restore.
- Add performance checks for large scan histories and SecureStore chunk counts.
- Add a privacy-safe analytics plan that tracks feature health without collecting sensitive ingredient text.

## Business And Operations Improvements

- Launch first as a clearly labeled beta until data validation, OCR QA, legal, and support workflows are stable.
- Build a product issue review console or at least a structured founder triage file before public beta.
- Define a response SLA for serious product-data reports.
- Create a database governance process: source, validator, version, reviewer, rollback plan, and user-facing update note.
- Define plan tiers around convenience, family, sync, and history. Do not paywall basic safety warnings.
- Keep house messages limited to Home and make them feel like product tips, not ads.
- Build retention around "calm saved history" rather than streak pressure.
- Prepare app store copy that says what Anvara does not do as clearly as what it does.
- Set up a small closed beta with allergy-aware users before paid launch.
- Decide whether schools, caregivers, or families are a future segment. That changes consent and sharing requirements.

## Do Not Regress

- No mascot.
- No third-party ads on result, camera, detail, onboarding trust, or safety-related surfaces.
- No "safe to eat" verdicts.
- No hidden preselected allergens in onboarding.
- Watchlist cap stays at 8 unless deliberately changed.
- Family cap stays at 5 profiles including self and children.
- Sample scans must stay labeled as samples and must not pollute real pattern progress.
- Local label photos expire after 7 days unless the user opts in to save them.
- Cloud sync must not upload OCR text or label photos under the current privacy posture.
- Recommended offline pack stays profile-specific by default.
- Draft-data warning stays visible until validation is complete.

## Suggested Next Build Order

1. Product name/brand editing after OCR and before save.
2. Backup "retry all now" control plus auth/sync/outbox tests.
3. Firestore rules tests and production/demo auth build guards.
4. Family removal, permissions, and child setup defaults.
5. Offline pack contents tests per watchlist.
6. Apply one selected visual direction across the real app.
7. Replace pending ingredient explanations with reviewed content.
8. Real Android/iOS OCR QA and accessibility QA.
9. Production monitoring and product issue triage workflow.
10. Billing and store launch prep only after the above are stable.
