// AppearanceScreen.jsx — Settings → Appearance. The user-facing color picker.
// Two independent choices: Background (5) × Accent (4) = 20 combos.
// A live preview shows a real match bar + button so the user sees their pick on
// the actual UI — and sees that the FIXED safety colors (amber dot, category
// tint) do NOT change, only their personal background/accent.

import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { BACKGROUND_PRESETS, ACCENT_PRESETS } from '../theme/tokens';

export function AppearanceScreen() {
  const { theme, keys, setTheme } = useTheme();
  const t = theme;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: 22, paddingBottom: 48 }}>
      <Text style={{ fontFamily: t.serif, fontSize: 26, color: t.ink, marginBottom: 6 }}>Appearance</Text>
      <Text style={{ fontFamily: t.sans, fontSize: 14.5, color: t.ink2, lineHeight: 21, marginBottom: 22 }}>
        Make it yours. Pick a background and an accent — your allergen colors stay the same so findings always read the same way.
      </Text>

      {/* ── Live preview ── */}
      <Preview t={t} />

      {/* ── Background ── */}
      <SectionLabel t={t}>Background</SectionLabel>
      <SwatchGrid>
        {Object.entries(BACKGROUND_PRESETS).map(([key, p]) => (
          <Swatch key={key} label={p.label} selected={keys.background === key}
            ring={t.accent} onPress={() => setTheme({ background: key })}
            colors={[p.bg, p.bgDeep, p.surfaceWarm]} t={t} />
        ))}
      </SwatchGrid>

      {/* ── Accent ── */}
      <SectionLabel t={t}>Accent</SectionLabel>
      <SwatchGrid>
        {Object.entries(ACCENT_PRESETS).map(([key, p]) => (
          <Swatch key={key} label={p.label} selected={keys.accent === key}
            ring={t.accent} onPress={() => setTheme({ accent: key })}
            colors={[p.accent, p.accentDeep, p.accentSoft]} t={t} />
        ))}
      </SwatchGrid>
    </ScrollView>
  );
}

// ── A swatch chip: hero color + two supporting stripes, selected ring ──
function Swatch({ label, colors, selected, ring, onPress, t }) {
  const [hero, ...rest] = colors;
  return (
    <Pressable onPress={onPress} accessibilityRole="radio" accessibilityState={{ selected }}
      style={{ width: '31%', marginBottom: 14 }}>
      <View style={{ height: 56, borderRadius: 14, overflow: 'hidden', flexDirection: 'row',
        borderWidth: selected ? 2.5 : 1, borderColor: selected ? ring : t.line,
        backgroundColor: hero }}>
        <View style={{ flex: 2, backgroundColor: hero }} />
        <View style={{ flex: 1 }}>
          {rest.map((c, i) => <View key={i} style={{ flex: 1, backgroundColor: c }} />)}
        </View>
      </View>
      <Text style={{ fontFamily: t.sans, fontSize: 12.5, fontWeight: '600',
        color: selected ? t.ink : t.ink2, marginTop: 6, textAlign: 'center' }}>{label}</Text>
    </Pressable>
  );
}

function SwatchGrid({ children }) {
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>{children}</View>;
}

function SectionLabel({ children, t }) {
  return <Text style={{ fontFamily: t.mono, fontSize: 11, letterSpacing: 1.4, textTransform: 'uppercase',
    color: t.ink3, marginTop: 20, marginBottom: 12 }}>{children}</Text>;
}

// ── Live preview: a real match bar (FIXED amber + allergen tint) + a themed button ──
function Preview({ t }) {
  return (
    <View style={{ backgroundColor: t.surface, borderRadius: t.radius, padding: 16,
      borderWidth: 1, borderColor: t.line, marginBottom: 8 }}>
      <Text style={{ fontFamily: t.mono, fontSize: 10.5, letterSpacing: 1, textTransform: 'uppercase',
        color: t.ink3, marginBottom: 12 }}>Preview</Text>

      {/* Match bar — uses FIXED allergen tint + amber dot (these never theme) */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 13, borderRadius: 14,
        backgroundColor: t.allergen.tint, borderWidth: 1, borderColor: t.allergen.edge, marginBottom: 14 }}>
        <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: t.amber }} />
        <View>
          <Text style={{ fontFamily: t.sans, fontSize: 13, fontWeight: '700', color: t.allergen.label }}>Allergen Match</Text>
          <Text style={{ fontFamily: t.sans, fontSize: 14, color: t.allergen.ink, marginTop: 2 }}>Contains peanuts</Text>
        </View>
      </View>

      {/* Primary button — uses the chosen ACCENT */}
      <View style={{ height: 48, borderRadius: 14, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: t.sans, fontSize: 15.5, fontWeight: '600', color: t.onAccent }}>Scan a label</Text>
      </View>
    </View>
  );
}
