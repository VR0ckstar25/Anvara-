// OnboardingScreen.jsx — minimal profile setup (slice): pick allergens.
// Tiles map 1:1 to the Big 9 (Transfer Note §5.2). Selection → parent ids the
// matcher filters on. Severity / intolerance / dietary screens are out of scope
// for the vertical slice.

import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const TILES = [
  { key: 'milk', label: 'Milk and Dairy', parents: ['milk'] },
  { key: 'egg', label: 'Eggs', parents: ['egg'] },
  { key: 'wheat', label: 'Wheat', parents: ['wheat'] },
  { key: 'soy', label: 'Soybeans', parents: ['soy'] },
  { key: 'peanut', label: 'Peanuts', parents: ['peanut'] },
  { key: 'treenut', label: 'Tree Nuts', parents: ['almond', 'walnut', 'cashew', 'pecan', 'pistachio', 'hazelnut', 'brazil_nut', 'macadamia', 'pine_nut'] },
  { key: 'fish', label: 'Fish', parents: ['fish'] },
  { key: 'shellfish', label: 'Shellfish', parents: ['crustacean', 'mollusc'] },
  { key: 'sesame', label: 'Sesame', parents: ['sesame'] },
];

export function OnboardingScreen({ onDone }) {
  const { theme: t } = useTheme();
  const [selected, setSelected] = useState(() => new Set(['peanut', 'milk', 'treenut'])); // pre-picked for an instant demo

  const toggle = (key) => setSelected((prev) => {
    const next = new Set(prev);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  });

  const finish = () => {
    const parents = TILES.filter((tl) => selected.has(tl.key)).flatMap((tl) => tl.parents);
    onDone(parents);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
      <Text style={{ fontFamily: t.serif, fontSize: 27, color: t.ink, marginBottom: 6 }}>Your ingredients. Your rules.</Text>
      <Text style={{ fontFamily: t.sans, fontSize: 14.5, color: t.ink2, lineHeight: 21, marginBottom: 22 }}>
        Pick what you're managing. We'll flag these on your scans — you decide what to do with the information.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {TILES.map((tl) => {
          const on = selected.has(tl.key);
          return (
            <Pressable key={tl.key} onPress={() => toggle(tl.key)}
              accessibilityRole="checkbox" accessibilityState={{ checked: on }}
              style={{ width: '48%', marginBottom: 12, padding: 16, borderRadius: t.radius,
                backgroundColor: on ? t.accentTint : t.surface,
                borderWidth: on ? 2 : 1, borderColor: on ? t.accent : t.line }}>
              <Text style={{ fontFamily: t.sans, fontSize: 15.5, fontWeight: on ? '700' : '600',
                color: on ? t.accentDeep : t.ink }}>{tl.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={finish} disabled={selected.size === 0}
        style={{ height: 52, borderRadius: 14, marginTop: 14, alignItems: 'center', justifyContent: 'center',
          backgroundColor: selected.size ? t.accent : t.line }}>
        <Text style={{ fontFamily: t.sans, fontSize: 16, fontWeight: '700', color: t.onAccent }}>
          Continue{selected.size ? ` (${selected.size})` : ''}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
