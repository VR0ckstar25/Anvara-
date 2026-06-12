# Anvara — Preproduction App

The current preproduction path is:
**welcome → policy acknowledgement → sign in/local use → watchlist → credibility screen → sample proof result → how it works → offline setup → Home → scan → result**.
Built with React Native + Expo.

## Run it

```sh
cd sfis-app
npm install
npx expo start
```

Verify the engine without the app:
```sh
npm run test:match
```

Camera OCR and Apple sign-in require an iOS/Android development build because they use native modules. Expo Go can still use manual entry and sample scans; web is not configured in this package.

## What's Real (Honest Boundary)

| Piece | Status |
|---|---|
| Theme system + Appearance picker (20 combos, persisted) | **real** |
| Matching engine (synonym graph, PAL/free-from context, OCR tolerance, false-positive guards, parens, multi-parent, dedupe) | **real**, Node-verified |
| Result screen (Contains / May contain / Could-not-verify, minimal bars) | **real**, renders matcher output |
| Onboarding (allergies, intolerances, goals/diet + severity UI) | **real UI**, matcher-backed for supported ids |
| Diary + Patterns | **real local persistence**. Patterns use a local resettable neural-style scorer over real saved scans only; sample scans are ignored. |
| Profile/family shell | **real self profile + deferred Add members state** |
| **Camera → OCR** | **native bridge added** — Android uses on-device ML Kit text recognition, iOS uses on-device Apple Vision. Expo Go/web show an honest unavailable state. |
| Auth + cloud sync | **Firebase scaffold wired** for email, Google token sign-in, Apple sign-in, Firestore profile/scans/feedback sync. Requires `.env` Firebase/OAuth values. |
| Plans + ads | **commercial logic scaffolded**. Free can show internal house messages on Home; paid levels are preview-only until store billing is connected. Result/camera/detail screens stay ad-free. |
| Cloud photo storage | deliberately **off**. Storage rules deny all uploads until a reviewed 7-day deletion job exists. |
| App clearance tests | **real Node stress suite**. Clears simulated state across 100 normal and 50 adversarial app scenarios. |

## Flow to try
1. **Welcome** → accept the policy acknowledgement.
2. **Sign in** with configured Firebase/OAuth, use explicit preproduction demo auth, or skip for local use.
3. **Build your label watchlist** → save it → review the credibility screen, or skip quickly from the bottom.
4. **Preview the sample proof result**: Milk + Almond show **Contains**; Peanut shows **May contain** (from the
   "may contain peanuts" PAL line); "natural flavours" sits under **Could not verify**.
   Wheat/soy are present on the label but **not shown** — they're not on the profile.
5. Finish the how-it-works and offline setup screens, then use **Scan** or **Diary**.
6. Open **Profile → Plans & ads** to preview Free / Plus / Family commercial levels.

## Backend setup

Use Firebase Spark for the first production slice: it has a no-cost tier without a required payment method, Firebase Auth, and Firestore sync. Copy `.env.example` to `.env` and fill the Firebase web app values. Enable Email/Password in Firebase Auth. Enable Google and Apple providers when the OAuth/app identifiers are ready.

`EXPO_PUBLIC_PREPROD_AUTH=true` enables local demo auth only when Firebase keys are blank. Leave it unset or set it to `false` for production builds.

Firestore paths:
- `users/{uid}/profile/self`
- `users/{uid}/scans/{scanId}`
- `users/{uid}/feedback/{feedbackId}`

Rules are user-owned only. Storage is deny-by-default because label photos should stay local.

## Privacy posture

Default behavior is minimal retention: OCR runs on-device; label photos are not uploaded; captured label images are removed from this phone after 7 days unless the user turns on **Save label photos** in Profile. Cloud sync stores profile choices, product names, matcher results, OCR metadata, and feedback. OCR text and label photos are stripped before cloud sync.

## Commercial posture

Plans are preview logic only until App Store / Play billing is connected. Free may show internal house messages on Home. Plus and Family hide those messages. Anvara intentionally does not show ads on result screens, camera/OCR, or ingredient detail sheets.

## Notes
- Data is **DRAFT** (`src/data/allergens.json`, exported from `../database`). Nothing is
  clinically validated — prototype only.
- Matching is deterministic and offline. OCR is only for reading label text before the matcher runs.
- Custom fonts (Source Serif 4 / Hanken Grotesk / Spline Sans Mono) use system
  fallback here; load via `expo-font` as a polish step.
