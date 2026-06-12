# Anvara Build Checklist

This is the working product checklist for moving Anvara from preproduction to a sellable app. It is intentionally adversarial: anything marked blocked or provisional should not be marketed as finished.

## Current Sprint Priority

This is the practical order for the next build passes. Priority is based on user safety, trust, whether a feature is already promised by the product, and whether it can be completed inside the current app without waiting on outside accounts/legal review.

1. **Do not sell yet:** finish legal policy pack, independent ingredient DB validation, production Firebase/OAuth, billing, monitoring, accessibility QA, and real-device OCR QA.
2. **Safety clarity:** keep draft-data warnings visible, make family-member attribution obvious on every result, and remove any UI that implies unverified medical certainty.
3. **Trustworthy records:** make Diary usable at real volume with search/filter, editable product metadata, and dependable backup retry controls.
4. **Account/family reality:** replace test family directory with real invite/search, add removal/permissions, and test auth/sync conflict handling.
5. **Offline reality:** keep the recommended download profile-specific, test pack contents per watchlist, and show pack freshness clearly.
6. **Conversion polish:** apply one chosen v2 visual direction across the real app, then add referral/share only after the safety path is stable.

## Priority 0 - Launch Blockers

- [ ] Legal policy pack: real Terms, Privacy Notice, medical/allergy safety disclaimer, and consent language. Current policy copy is placeholder product copy.
- [ ] Ingredient database validation: `src/data/allergens.json` is `PRE_VALIDATION`. It needs independent review before safety or health claims.
- [ ] Production auth: Firebase project, Email/Password, Google OAuth clients, Apple sign-in, app identifiers, and store-ready builds must be configured.
- [ ] Production billing: App Store / Play billing must replace preview plan selection before charging money.
- [ ] Production monitoring: crash reporting, sync failure visibility, and product issue triage are not yet production-grade.
- [ ] Accessibility QA: screen reader labels, touch targets, contrast, and text scaling need a full pass on real devices.
- [ ] Live device QA: Android/iOS camera OCR, offline packs, app resume/lock behavior, and auth recovery need real-device test passes.

## Priority 1 - Safety And Trust

- [x] Result screen shows a draft-data warning.
- [x] Result feedback is saved and can sync/queue.
- [x] Wrong/Unsure/product issue reports show in a founder review queue.
- [x] Diary entries can reopen saved results.
- [x] Local storage uses encrypted SecureStore chunks for profile/scans/feedback/offline packs.
- [x] Label photos stay local and expire after 7 days unless the user opts in.
- [x] Cloud sync strips OCR text and label photos before upload.
- [x] Cross-account device data merge is blocked.
- [x] App PIN recovery no longer erases data as the first path.
- [x] Add a draft-data reminder before every real scan path, not only after results.
- [x] Add a clearer product issue queue/count for founder review.
- [ ] Add end-to-end tests for auth/sync merge and outbox behavior.
- [ ] Add Firestore rules tests.

## Priority 2 - Core User Value

- [x] First-run flow: Welcome -> policies -> sign in/local -> intent question -> watchlist -> credibility -> sample result -> how it works -> offline setup -> Home.
- [x] Watchlist cap is 8 preferences across UI, profile model, and storage normalization.
- [x] Watchlist state dedupes and caps bad/imported profile data before saving.
- [x] Unified watchlist supports allergies, intolerances, diet, and goals.
- [x] Severity is stored and displayed.
- [x] Matching engine has OCR tolerance, PAL/free-from handling, false-positive guards, and regression tests.
- [x] Cheese/butter/cream -> milk gap is covered in matcher data.
- [x] Manual ingredient entry works.
- [x] Camera OCR native bridge exists for dev builds.
- [x] Scan results save into Diary.
- [x] Patterns use real scans only, not sample scans.
- [x] Local pattern engine ranks repeated scan findings with a resettable on-device neural-style scorer.
- [x] Pattern engine stress suite clears model state across 100 normal runs and 50 adversarial runs.
- [ ] Validate real camera OCR on Android and iOS development builds.
- [ ] Improve content library explanations so result detail never needs a pending-review fallback.
- [x] Add product name/brand editing after OCR before saving.
- [x] Add search/filter inside Diary once scan count grows.

## Priority 3 - Family And Account

- [x] Family profile cap is 5 including self.
- [x] Child mode wording exists on result screen.
- [x] Family member watched items are included by matcher.
- [x] Family add flow exists with test directory data.
- [ ] Replace test directory with real account invite/search.
- [x] Make per-family-member result attribution visible enough for a parent in every result.
- [x] Add family removal flow.
- [ ] Add family permissions/invite acceptance flow.
- [x] Add child profile setup copy and child-result default wording.

## Priority 4 - Offline And Backup

- [x] Recommended offline pack is profile-specific, not full database by default.
- [x] Corrupted offline-pack selections are normalized to known pack IDs.
- [x] Offline pack storage is encrypted.
- [x] Backup outbox retries and reports pending failures.
- [x] Manual local checkpoint exists.
- [x] Add visible offline-pack freshness/version status.
- [x] Add explicit "retry all backups now" flow outside banners.
- [x] Add tests for offline pack contents per selected watchlist.

## Priority 5 - Monetization And Growth

- [x] Free / Plus / Family plan model exists.
- [x] Free house messages are blocked from result, camera, and detail contexts.
- [x] Plan selection is clearly preview-only.
- [x] No third-party ads are shown.
- [ ] Replace preview plan selection with store billing.
- [ ] Define actual plan limits and family entitlements.
- [ ] Decide whether any ads are acceptable. Recommendation: no third-party ads near allergy-related flows.
- [ ] Add referral/share loop only after core trust is proven.

## Priority 6 - Design And Conversion

- [x] Anvara name is used across current app/docs.
- [x] No mascot is present.
- [x] Bottom tabs use icons.
- [x] Bolder v2 visual concept preview exists in Profile -> Visual concept.
- [ ] Choose one visual direction and apply it across the real app.
- [ ] Remove duplicate/unclear preview entries once a direction is chosen.
- [ ] Real visual QA on Android/iOS for headers, safe areas, text wrapping, and button placement.
- [ ] Replace placeholder/system fonts with loaded brand fonts.

## Priority 7 - Developer Hygiene

- [x] Matcher/profile/retention/commercial regression suites pass.
- [x] Pattern engine stress suite passes.
- [x] App-wide state clearance suite passes 100 normal and 50 adversarial scenarios.
- [x] JS/JSX parse check passes.
- [ ] Split large `App.js` shell into focused navigation/state modules.
- [ ] Add typed schemas for stored data and cloud payloads.
- [ ] Add CI for tests, parse, lint, and rules tests.
- [x] Add code guard so preproduction/demo auth cannot activate when `NODE_ENV=production`.
- [ ] Remove preproduction/demo auth from production build variants.

## Fix Now Queue

1. [x] Add a scan-path draft-data reminder before manual/camera scanning.
2. [x] Fix stale family copy that says family matching has not shipped.
3. [x] Add offline-pack status/freshness to the security/offline area.
4. [x] Add product issue triage count beyond a simple feedback count.
5. [x] Add stress tests for the local pattern engine.
6. [x] Add visible family attribution summary and detail-sheet profile chips.
7. [x] Add Diary search and source/match filters.
8. [x] Add OCR/manual review step before scans are saved.
9. [x] Add explicit backup queue retry outside banners.
10. [x] Add family profile removal.
11. [x] Add offline pack content tests for profile-specific downloads.
12. [x] Add product review queue visibility for Wrong/Unsure/product issue reports.
13. [x] Add child-result default wording when a child family profile is matched.
14. Add tests for the new scan warning/offline logic where practical.
15. Add tests for auth/sync conflict merge, backup outbox retry, and Firestore rules before production auth is marketed.
