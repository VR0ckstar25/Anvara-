# Anvara Autofix Audit - 2026-06-12

This gathers the open questions, concerns, inclinations, recommendations, and improvement ideas previously stored in `ANVARA_ADVISOR_REVIEW_QUEUE.md`, then records what was safe to fix without more founder guidance.

## Fixed In This Pass

- OCR review before saving: camera scans now let the user edit product name, brand, and recognized ingredients before checking/saving.
- Manual review before saving: typed scans now prepare a review card first, then save/check after confirmation.
- Product metadata editing: manual and OCR scan paths now support product name and brand before the result is saved.
- Weak OCR handling: camera OCR now shows reported confidence when available and tells the user to retake or edit uncertain text.
- Backup retry control: Security/Backup now has an explicit `Retry queued backups now` action outside temporary banners.
- Manual backup retry priority: manual retry forces queued backup items to run immediately rather than waiting for their scheduled retry time.
- Family removal: family members can now be removed with confirmation while saved scan history remains intact.
- Pattern transparency: each ranked pattern now says why it appears, using repeat days and product count.
- Offline download guardrails: a new regression test verifies recommended offline packs stay profile-specific and do not silently pull Big-9/full-database data.
- Production demo-auth guard: preproduction auth cannot activate when `NODE_ENV=production`, even if the preproduction flag is accidentally left on.
- Build checklist updated to reflect the completed items and remaining split between removal vs. permissions.

## Self-Review Tweaks Added After Adversarial Recheck

- Fixed sample-source leakage: the Scan screen's `Run sample` path now marks the scan as `sample` so it cannot count as real scan history or unlock Patterns.
- Removed fake product brands: manual scans no longer save `Manual entry` as a brand, and camera scans no longer save `Camera OCR` as a brand.
- Fixed backup expiry messaging: manual backup retry no longer reports expired queue items as synced.
- Hardened family display against malformed synced data by falling back to `Family member` when a name is missing.
- Removed consumer-facing "neural-ranked" wording from Patterns and replaced it with calmer local diary scoring language.
- Polished camera scan copy so users see "camera reads the label" instead of OCR jargon where it matters.
- Added a visible product review queue in Profile for Wrong, Unsure, and product issue reports.
- Added child-result defaults: if a matched family profile is a child, Result opens with child-friendly wording.

## Already Handled Before This Pass

- No mascot.
- No third-party ads on camera, result, detail, onboarding trust, or other safety-related surfaces.
- No credit-card wall before first value moment.
- First-run flow includes policy acknowledgement, sign-in/local choice, intent question, watchlist, credibility, sample result, how-it-works, offline setup, and Home.
- Watchlist cap is 8.
- Family cap is 5 profiles including self and children.
- Sample scans are labeled and excluded from pattern progress.
- Draft-data warnings are visible.
- Result feedback is saved and can queue/sync.
- Cloud sync strips OCR text and label photos.
- Label photos remain local and expire unless the user opts in.
- Recommended offline pack is profile-specific by default.
- Diary has search/filter and can reopen saved scans.
- Family attribution is visible in result cards and detail sheets.
- Pattern summaries use real scans only and avoid medical prediction language.

## Still Needs Founder, Legal, External Setup, Or Real-Device QA

- Exact market claim: label-reading helper vs allergy scanner vs food safety companion.
- Legal policy pack: Terms, Privacy Notice, medical/allergy disclaimer, and consent language.
- Independent database validation and governance process.
- Launch mode decision: private beta, public beta, or paid product.
- Production Firebase, Google OAuth, Apple sign-in, app identifiers, and store-ready builds.
- Firestore security rules and rules tests.
- Production billing and actual Free/Plus/Family entitlements.
- Whether any ads are acceptable at all; recommendation remains no third-party ads near safety flows.
- Live Android/iOS OCR QA.
- Accessibility QA on real devices.
- Visual direction choice and full-app application.
- Real account family invite/search flow and permissions model.
- Child consent/copy requirements.
- Launch geography and privacy/legal jurisdiction requirements.
- Support promise and response SLA for `Wrong` or `Unsure` reports.

## Larger Engineering Work Not Finished Here

- Replace the test family directory with real account invite/search.
- Add family permissions and invite acceptance.
- Add full child profile setup defaults.
- Add auth/sync merge, outbox retry, account-switch, and restore tests.
- Add typed schemas or runtime validators for profile, scan, feedback, offline pack, and cloud payloads.
- Add storage migrations for future profile model changes.
- Split `App.js` into smaller navigation/session/scan/sync/settings modules.
- Add CI for tests, parse, lint, rules tests, and dependency audit.
- Add production monitoring for crashes, sync failures, OCR failures, and product issue queue health.
- Replace pending ingredient explanations with reviewed content.
- Build a founder-facing product issue triage workflow.
- Add privacy-safe analytics that avoids ingredient text and health-adjacent details.
- Add a safe local data export flow after deciding format/security expectations.

## Current Recommendation

Keep building toward a trustworthy beta rather than a paid general release. The strongest near-term wedge is not database size; it is a calmer, more private, family-aware scanner that shows evidence, admits uncertainty, saves useful history, and does not trap users behind payment before trust is earned.
