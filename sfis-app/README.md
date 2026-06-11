# SFIS — Working Prototype (vertical slice)

The **Step 1.5 vertical slice**: one real path end-to-end —
**onboarding → scan → real matching → result** — on the real (DRAFT) allergen data.
Built React Native + Expo (the locked stack).

## Run it

```sh
cd sfis-app
npm install
npx expo start          # then press 'w' for web, or scan the QR with Expo Go
# npx expo start --web   # straight to browser
```

Verify the engine without the app:
```sh
npm run test:match       # 15 assertions on the real data
```

## What's real vs stubbed (honest boundary)

| Piece | Status |
|---|---|
| Theme system + Appearance picker (20 combos, persisted) | **real** |
| Matching engine (synonym graph, PAL, parens, multi-parent, dedupe) | **real**, Node-verified |
| Result screen (Contains / May contain / Could-not-verify, minimal bars) | **real**, renders matcher output |
| Onboarding (pick allergens → profile) | **real** (slice: allergens only) |
| **Camera → OCR** | **stubbed** — ML Kit is device-only. The slice uses **manual text entry** + the **pre-loaded tutorial sample** (both spec-sanctioned, §6.1/§6.2). On a device, OCR text just replaces the TextInput value — that's the only seam. |
| Severity, intolerance/dietary onboarding, login, calendar, paywall, family | not in the slice |

## Flow to try
1. **Onboarding** pre-selects Peanuts + Milk + Tree Nuts (edit freely) → Continue.
2. **Scan** → tap **Load tutorial sample** (Sunshine Oat Cookies) → **Check these ingredients**.
3. **Result**: Milk + Almond show **Contains**; Peanut shows **May contain** (from the
   "may contain peanuts" PAL line); "natural flavours" sits under **Could not verify**.
   Wheat/soy are present on the label but **not shown** — they're not on the profile.
4. Tap **Theme** to recolor the whole app live; the amber finding dot never changes.

## Notes
- Data is **DRAFT** (`src/data/allergens.json`, exported from `../database`). Nothing is
  clinically validated — prototype only.
- Matching is deterministic, offline, no ML (spec §2). `frequency_rank` unused (Decision 7).
- Custom fonts (Source Serif 4 / Hanken Grotesk / Spline Sans Mono) use system
  fallback here; load via `expo-font` as a polish step.
