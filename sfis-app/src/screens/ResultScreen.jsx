// ResultScreen.jsx — the core surface. Bars (only categories WITH findings) →
// "Could not verify" gray section → mandatory footer. No score/verdict/red-green.

import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { MatchBar } from '../components/MatchBar';

// Content Library 5.7 — final sentence is a PENDING PAL addition (attorney review).
const FOOTER =
  'Based on the label as we read it. Always check the original packaging. ' +
  'Ingredient data current as of {DATE}. Scan may not capture all ingredients — ' +
  'we show what we could read. ' +
  "Precautionary allergen statements such as 'may contain' may not always be captured.";

export function ResultScreen({ findings = [], unverified = [], product = {} }) {
  const { theme: t } = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }}
      contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>

      <Text style={{ fontFamily: t.serif, fontSize: 24, color: t.ink, marginBottom: 2 }}>
        {product.name || 'Unnamed Product'}
      </Text>
      <Text style={{ fontFamily: t.mono, fontSize: 12, color: t.ink3, marginBottom: 18 }}>
        {product.date || ''}
      </Text>

      {findings.map((f, i) => <MatchBar key={i} data={f} onOpen={() => {}} />)}

      {findings.length === 0 && (
        <View style={{ backgroundColor: t.surfaceWarm, borderRadius: t.radius, padding: 16,
          borderWidth: 1, borderColor: t.line, marginBottom: 14 }}>
          <Text style={{ fontFamily: t.sans, fontSize: 15, color: t.ink, lineHeight: 21 }}>
            Nothing from your profile in what we could read.
          </Text>
          <Text style={{ fontFamily: t.sans, fontSize: 13, color: t.ink2, marginTop: 4, lineHeight: 19 }}>
            Always check the original packaging.
          </Text>
        </View>
      )}

      {unverified.length > 0 && (
        <View style={{ marginTop: 6, marginBottom: 14 }}>
          <Text style={{ fontFamily: t.sans, fontWeight: '700', fontSize: 13, color: t.ink2, marginBottom: 8 }}>
            Could not verify
          </Text>
          {unverified.map((ing, i) => (
            <Text key={i} style={{ fontFamily: t.sans, fontSize: 14, color: t.unknownInk, lineHeight: 22 }}>
              {ing}
            </Text>
          ))}
          <Text style={{ fontFamily: t.sans, fontSize: 12.5, color: t.ink3, marginTop: 8, lineHeight: 18 }}>
            These ingredients are not in our current database. Connect to the internet for more
            information or check the original label.
          </Text>
        </View>
      )}

      <View style={{ borderTopWidth: 1, borderTopColor: t.lineSoft, paddingTop: 14, marginTop: 6 }}>
        <Text style={{ fontFamily: t.sans, fontSize: 11.5, color: t.ink3, lineHeight: 17 }}>
          {FOOTER.replace('{DATE}', product.date || '—')}
        </Text>
      </View>
    </ScrollView>
  );
}
