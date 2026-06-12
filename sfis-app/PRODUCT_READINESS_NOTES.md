# Anvara Product Readiness Notes

Keep these visible before any paid or public launch.

## Tell the founder later

- Policy copy is placeholder product copy, not lawyer-reviewed Terms, Privacy, medical disclaimer, or allergy safety language.
- Real account recovery depends on configured Firebase/Auth providers. A local-only profile cannot recover a forgotten app PIN without erasing this phone's Anvara data.
- The bundled ingredient database is marked `PRE_VALIDATION`; it must be independently validated before safety/health marketing claims.
- Google/Apple sign-in need real OAuth clients and store-ready builds. Demo auth is only for preproduction testing.
- Payments, subscriptions, and ads must use App Store / Play billing and a reviewed ad network setup before any real money or ad inventory is involved.
- Do not show ads on result/detail screens where they could distract from allergy-related safety information.
- Cloud sync currently avoids label photo upload. If photo cloud storage is added, a real deletion job and storage rules review are required first.

## Launch gate

Anvara can be sold only after real auth, billing, legal policy text, validated data posture, accessibility review, and production monitoring are in place.
