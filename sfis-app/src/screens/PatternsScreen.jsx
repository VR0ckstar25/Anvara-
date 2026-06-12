import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Card, Overline, ProgressBar, ScreenIntro } from '../components/DesignPrimitives';

function frequencyRows(scans) {
  const counts = new Map();
  scans.forEach((scan) => {
    (scan.findings || []).forEach((finding) => {
      (finding.items || []).forEach((item) => {
        const key = `${finding.cat}:${item.common}`;
        const existing = counts.get(key) || { name: item.common, count: 0, cat: finding.cat };
        existing.count += 1;
        counts.set(key, existing);
      });
    });
  });
  return Array.from(counts.values()).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name)).slice(0, 6);
}

export function PatternsScreen({ scans = [], onScan }) {
  const { theme: t } = useTheme();
  // Patterns must never unlock or rank from fictional sample data (review finding).
  const realScans = useMemo(() => scans.filter((scan) => scan.source !== 'sample'), [scans]);
  const rows = useMemo(() => frequencyRows(realScans), [realScans]);
  const max = Math.max(1, ...rows.map((row) => row.count));
  const ready = realScans.length >= 6;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: 18, paddingBottom: 28 }}>
      <ScreenIntro
        title="Patterns"
        sub="Plain-language summaries from your saved scans. No medical claims, no score."
        t={t}
      />

      <Card t={t} style={{ marginBottom: 18 }}>
        <Overline t={t} color={t.accent}>{ready ? 'Saved scan summary' : 'Collecting scans'}</Overline>
        <Text style={{ fontFamily: t.serif, fontSize: 19, lineHeight: 27, color: t.ink, marginTop: 9 }}>
          {ready
            ? 'These counts come from the scans saved on this device.'
            : 'Pattern view starts at 6 scans. Until then, saved scans are listed without claiming a trend.'}
        </Text>
      </Card>

      <Overline t={t}>Most frequent in saved scans</Overline>
      <Card t={t} style={{ paddingVertical: 6, marginTop: 12, marginBottom: 18 }}>
        {rows.length ? rows.map((row, i) => (
          <View key={row.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 13,
            borderBottomWidth: i < rows.length - 1 ? 1 : 0, borderBottomColor: t.lineSoft }}>
            <Text style={{ width: 22, textAlign: 'center', fontFamily: t.mono, fontSize: 12, color: t.ink3 }}>
              {i + 1}
            </Text>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: t.sans, fontSize: 15.5, fontWeight: '800', color: t.ink }}>
                {row.name}
              </Text>
              <View style={{ marginTop: 8 }}>
                <ProgressBar value={row.count} max={max} color={t[row.cat]?.strong || t.accent} t={t} />
              </View>
            </View>
            <Text style={{ fontFamily: t.sans, fontSize: 14, fontWeight: '800', color: t.ink2 }}>
              {row.count}x
            </Text>
          </View>
        )) : (
          <View style={{ paddingVertical: 10 }}>
            <Text style={{ fontFamily: t.sans, fontSize: 15, fontWeight: '800', color: t.ink }}>
              No matched ingredients saved yet.
            </Text>
            <Text style={{ fontFamily: t.sans, fontSize: 13.5, color: t.ink2, lineHeight: 19, marginTop: 4 }}>
              Run a scan to build the frequency list.
            </Text>
          </View>
        )}
      </Card>

      <View style={{ borderRadius: 16, backgroundColor: t.accentTint, padding: 16,
        borderWidth: 1, borderColor: t.accentSoft }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
          <Text style={{ flex: 1, fontFamily: t.sans, fontSize: 15, fontWeight: '800', color: t.ink }}>
            Pattern view starts at 6 scans
          </Text>
          <Text style={{ fontFamily: t.mono, fontSize: 12.5, color: t.accentDeep }}>
            {Math.min(scans.length, 6)} / 6
          </Text>
        </View>
        <ProgressBar value={Math.min(scans.length, 6)} max={6} color={t.accent} t={t} />
        <Text style={{ fontFamily: t.sans, fontSize: 13, color: t.ink2, lineHeight: 19, marginTop: 10 }}>
          Saved scans stay local in this build and are shaped for a future backend analytics service.
        </Text>
        <Pressable onPress={onScan} accessibilityRole="button" style={{ marginTop: 14, minHeight: 44, borderRadius: 12,
          backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: t.sans, fontSize: 14, fontWeight: '800', color: t.accentDeep }}>Scan another label</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
