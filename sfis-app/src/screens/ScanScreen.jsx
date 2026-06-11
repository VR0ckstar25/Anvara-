// ScanScreen.jsx — the scan entry point for the prototype. Live camera OCR is
// device-only (ML Kit), so the runnable slice uses the two spec-sanctioned paths:
//   • Manual text entry ("manual text entry fallback always available" — §6.1)
//   • The pre-loaded tutorial sample (§6.2, bypasses OCR)
// Both feed the SAME real matching engine. The camera→OCR step is a clean seam:
//   on a device, OCR text simply replaces the TextInput value.

import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { matchScan } from '../match/scanMatch';
import data from '../data/allergens.json';
import { TUTORIAL } from '../data/tutorial';

export function ScanScreen({ profile, onResult, onCamera }) {
  const { theme: t } = useTheme();
  const [text, setText] = useState('');
  const [name, setName] = useState('');

  const run = (rawText, productName) => {
    const { findings, unverified } = matchScan(rawText, profile, data);
    onResult({
      findings,
      unverified,
      product: { name: productName || 'Unnamed Product', date: TUTORIAL.date },
    });
  };

  const loadSample = () => { setText(TUTORIAL.text); setName(TUTORIAL.name); };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: 22, paddingBottom: 40 }}>
      <Text style={{ fontFamily: t.serif, fontSize: 26, color: t.ink, marginBottom: 6 }}>Check a label</Text>
      <Text style={{ fontFamily: t.sans, fontSize: 14, color: t.ink2, lineHeight: 20, marginBottom: 18 }}>
        On a phone this is a camera scan. Here, type or paste a label's ingredient list — or load the tutorial sample.
      </Text>

      <TextInput value={name} onChangeText={setName} placeholder="Product name (optional)"
        placeholderTextColor={t.ink3}
        style={{ backgroundColor: t.surface, borderRadius: 12, borderWidth: 1, borderColor: t.line,
          paddingHorizontal: 14, height: 46, fontFamily: t.sans, fontSize: 15, color: t.ink, marginBottom: 12 }} />

      <TextInput value={text} onChangeText={setText} placeholder="Ingredients: …" placeholderTextColor={t.ink3}
        multiline textAlignVertical="top"
        style={{ backgroundColor: t.surface, borderRadius: 12, borderWidth: 1, borderColor: t.line,
          padding: 14, minHeight: 150, fontFamily: t.sans, fontSize: 15, color: t.ink, lineHeight: 21 }} />

      <Pressable onPress={onCamera}
        style={{ height: 52, borderRadius: 14, marginTop: 16, alignItems: 'center', justifyContent: 'center',
          backgroundColor: t.accent, flexDirection: 'row', gap: 8 }}>
        <Text style={{ fontFamily: t.sans, fontSize: 16, fontWeight: '700', color: t.onAccent }}>📷  Scan with camera</Text>
      </Pressable>

      <Pressable onPress={() => run(text, name)} disabled={!text.trim()}
        style={{ height: 50, borderRadius: 14, marginTop: 10, alignItems: 'center', justifyContent: 'center',
          backgroundColor: t.surface, borderWidth: 1, borderColor: text.trim() ? t.accent : t.line }}>
        <Text style={{ fontFamily: t.sans, fontSize: 15, fontWeight: '600', color: text.trim() ? t.accentDeep : t.ink3 }}>Check typed ingredients</Text>
      </Pressable>

      <Pressable onPress={loadSample}
        style={{ height: 48, borderRadius: 14, marginTop: 10, alignItems: 'center', justifyContent: 'center',
          backgroundColor: t.surface, borderWidth: 1, borderColor: t.line }}>
        <Text style={{ fontFamily: t.sans, fontSize: 15, fontWeight: '600', color: t.accentDeep }}>Load tutorial sample</Text>
      </Pressable>

      <Text style={{ fontFamily: t.mono, fontSize: 11, color: t.ink3, marginTop: 18, lineHeight: 17 }}>
        Profile: {profile.length} allergen{profile.length === 1 ? '' : 's'} active. Deterministic matching · no ML · runs offline.
      </Text>
    </ScrollView>
  );
}
