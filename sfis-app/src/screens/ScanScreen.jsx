import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { Camera, Keyboard } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { matchScan } from '../match/scanMatch';
import data from '../data/allergens.json';
import { TUTORIAL } from '../data/tutorial';
import { Card, PrimaryButton, ScreenIntro, SecondaryButton } from '../components/DesignPrimitives';
import { profileIds } from '../profile/profileModel';

export function ScanScreen({ profile, matcherData, onResult, onCamera }) {
  const { theme: t } = useTheme();
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const watchedIds = profileIds(profile);
  const activeData = matcherData || data;

  const run = (rawText, productName) => {
    const { findings, unverified } = matchScan(rawText, profile, activeData);
    onResult({
      findings,
      unverified,
      product: { name: productName || 'Unnamed Product', brand: productName ? '' : 'Manual entry', date: new Date().toISOString().slice(0, 10) },
    });
  };

  const loadSample = () => { setText(TUTORIAL.text); setName(TUTORIAL.name); };
  const runSample = () => {
    const { findings, unverified } = matchScan(TUTORIAL.text, profile, activeData);
    onResult({
      findings,
      unverified,
      product: { name: TUTORIAL.name, brand: TUTORIAL.brand, date: TUTORIAL.date },
    });
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: 18, paddingBottom: 28 }}>
      <ScreenIntro
        title="Check a label"
        sub="Start with the camera, or paste ingredients when a label is hard to scan."
        t={t}
      />

      <Pressable onPress={onCamera} accessibilityRole="button"
        accessibilityLabel="Scan ingredient label with camera"
        style={{ minHeight: 142, borderRadius: 18, marginBottom: 16, padding: 18,
          backgroundColor: t.accent, borderWidth: 1, borderColor: t.accentDeep,
          flexDirection: 'row', alignItems: 'center', gap: 16,
          shadowColor: t.accentDeep, shadowOpacity: 0.18, shadowRadius: 16,
          shadowOffset: { width: 0, height: 8 }, elevation: 5 }}>
        <View style={{ width: 66, height: 66, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.22)',
          alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.45)' }}>
          <Camera size={34} color={t.onAccent} strokeWidth={2.4} />
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ fontFamily: t.sans, fontSize: 23, lineHeight: 28, fontWeight: '900', color: t.onAccent }}>
            Scan ingredient label
          </Text>
          <Text style={{ fontFamily: t.sans, fontSize: 13.5, lineHeight: 19, color: t.onAccent, opacity: 0.86, marginTop: 5 }}>
            Camera OCR, then you review before Anvara checks it.
          </Text>
        </View>
        <Text style={{ fontFamily: t.sans, fontSize: 30, fontWeight: '800', color: t.onAccent }}>›</Text>
      </Pressable>

      <Card t={t} style={{ marginBottom: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 12 }}>
          <View style={{ width: 32, height: 32, borderRadius: 11, backgroundColor: t.surfaceWarm,
            borderWidth: 1, borderColor: t.line, alignItems: 'center', justifyContent: 'center' }}>
            <Keyboard size={17} color={t.accentDeep} strokeWidth={2.4} />
          </View>
          <Text style={{ fontFamily: t.sans, fontSize: 16, fontWeight: '900', color: t.ink }}>
            Paste ingredients instead
          </Text>
        </View>

        <TextInput value={name} onChangeText={setName} placeholder="Product name (optional)"
          placeholderTextColor={t.ink3}
          style={{ backgroundColor: t.surfaceWarm, borderRadius: 12, borderWidth: 1, borderColor: t.line,
            paddingHorizontal: 14, height: 46, fontFamily: t.sans, fontSize: 15, color: t.ink, marginBottom: 12 }} />

        <TextInput value={text} onChangeText={setText} placeholder="Ingredients: …" placeholderTextColor={t.ink3}
          multiline textAlignVertical="top"
          style={{ backgroundColor: t.surfaceWarm, borderRadius: 12, borderWidth: 1, borderColor: t.line,
            padding: 14, minHeight: 132, fontFamily: t.sans, fontSize: 15, color: t.ink, lineHeight: 21 }} />

        <PrimaryButton onPress={() => run(text, name)} disabled={!text.trim()} t={t} style={{ marginTop: 14 }}>
          Check typed ingredients
        </PrimaryButton>
      </Card>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <SecondaryButton onPress={loadSample} t={t} style={{ flex: 1 }}>
          Load sample
        </SecondaryButton>
        <SecondaryButton onPress={runSample} t={t} style={{ flex: 1 }}>
          Run sample
        </SecondaryButton>
      </View>

      <Text style={{ fontFamily: t.mono, fontSize: 11, color: t.ink3, marginTop: 18, lineHeight: 17 }}>
        Profile: {watchedIds.length} watched item{watchedIds.length === 1 ? '' : 's'} active. Deterministic matching · no ML · runs offline.
      </Text>
    </ScrollView>
  );
}
