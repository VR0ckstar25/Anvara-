// tokens.js — single source of truth for all colors in the app.
// Ported from the design handoff (theme-presets.js + theme.jsx) to React Native.
// There are NO CSS variables in React Native — instead the whole app reads
// colors from one theme object handed down by ThemeProvider (see ThemeProvider.jsx).
//
// TWO kinds of token:
//   • THEMEABLE — the user picks one Background + one Accent (20 combos).
//   • FIXED     — never themed; these carry legal/safety meaning (amber finding
//                 dot, category tints, ink/lines). Never route these through the
//                 picker. No red, no green, ever.

// ── Themeable: BACKGROUND (page / wells / soft cards) ───────────────────────
export const BACKGROUND_PRESETS = {
  sky:      { label: 'Sky',      bg: '#E9F3FB', bgDeep: '#D6E8F6', surfaceWarm: '#F4FAFE' }, // default
  mint:     { label: 'Mint',     bg: '#E6F5EE', bgDeep: '#D2EBDF', surfaceWarm: '#F2FBF7' },
  lemon:    { label: 'Lemon',    bg: '#FBF6DD', bgDeep: '#F3EAC2', surfaceWarm: '#FEFBEC' },
  lavender: { label: 'Lavender', bg: '#F1ECFB', bgDeep: '#E2D8F4', surfaceWarm: '#F8F4FD' },
  blossom:  { label: 'Blossom',  bg: '#FCEDF3', bgDeep: '#F6DCE7', surfaceWarm: '#FEF5F8' },
};

// ── Themeable: ACCENT (CTAs / selection / links / active states) ────────────
export const ACCENT_PRESETS = {
  cobalt:    { label: 'Cobalt',    accent: '#3360CE', accentDeep: '#284BA0', accentSoft: '#DFE7F7', accentTint: '#F0F4FC' }, // default
  turquoise: { label: 'Turquoise', accent: '#0EA5A2', accentDeep: '#0B8280', accentSoft: '#D5F0EF', accentTint: '#EBF8F7' },
  fuchsia:   { label: 'Fuchsia',   accent: '#D6398A', accentDeep: '#AC2C6E', accentSoft: '#FAE0EE', accentTint: '#FDF0F7' },
  grape:     { label: 'Grape',     accent: '#8139C2', accentDeep: '#66299E', accentSoft: '#EFE0F8', accentTint: '#F7F0FB' },
};

export const DEFAULT_THEME = { background: 'sky', accent: 'cobalt' };

// ── FIXED tokens — DO NOT expose to the picker. Meaning, not taste. ─────────
export const FIXED = {
  surface:  '#FFFFFF',
  onAccent: '#FBF7EF',  // text/icon on top of an accent fill
  ink:      '#222932',  // primary text
  ink2:     '#5C6471',  // secondary
  ink3:     '#97A1AE',  // tertiary / placeholder
  line:     '#E2E8EF',
  lineSoft: '#EDF1F6',

  // Universal "finding present" indicator — same amber on EVERY match bar.
  amber:    '#E89318',

  // Category tints (differentiate category ONLY — never good/bad, never red/green).
  allergen:    { tint: '#FDEBC9', edge: '#F4CE83', strong: '#D2870F', ink: '#7E5410', label: '#96640F' },
  intolerance: { tint: '#FBE2CC', edge: '#F1C198', strong: '#CA6A2C', ink: '#7E3E1A', label: '#A1531F' },
  goal:        { tint: '#E7E9F1', edge: '#CCD1E0', strong: '#6A7396', ink: '#414B66', label: '#4D5772' },
  unknownInk:  '#8E857A', // "Could not verify" ingredients — neutral gray text

  // Type + shape (fixed design constants)
  serif: 'SourceSerif4',      // emotional moments
  sans:  'HankenGrotesk',     // all functional UI
  mono:  'SplineSansMono',    // dates / placeholders
  radius: 18,
};

// Compose the flat theme object the app consumes. Merges the user's two choices
// over the fixed tokens. ThemeProvider memoizes this; components never call it.
export function buildTheme(backgroundKey = DEFAULT_THEME.background, accentKey = DEFAULT_THEME.accent) {
  const bg = BACKGROUND_PRESETS[backgroundKey] || BACKGROUND_PRESETS.sky;
  const ac = ACCENT_PRESETS[accentKey] || ACCENT_PRESETS.cobalt;
  return {
    ...FIXED,
    bg: bg.bg, bgDeep: bg.bgDeep, surfaceWarm: bg.surfaceWarm,
    accent: ac.accent, accentDeep: ac.accentDeep, accentSoft: ac.accentSoft, accentTint: ac.accentTint,
  };
}
