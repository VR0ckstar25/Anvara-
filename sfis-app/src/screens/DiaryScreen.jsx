import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Card, Overline, PrimaryButton, ProgressBar, ScreenIntro } from '../components/DesignPrimitives';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function scanDate(scan) {
  const date = new Date(scan.savedAt || scan.product?.date || Date.now());
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function scanCategories(scan) {
  return [...new Set((scan.findings || []).map((finding) => finding.cat).filter(Boolean))];
}

function timeLabel(scan) {
  const date = scanDate(scan);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return `${MONTHS[date.getMonth()].slice(0, 3)} ${date.getDate()}`;
}

export function DiaryScreen({ scans = [], onSample, onScan }) {
  const { theme: t } = useTheme();
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const dotsByDay = scans.reduce((acc, scan) => {
    const date = scanDate(scan);
    if (date.getFullYear() === year && date.getMonth() === month) {
      acc[date.getDate()] = [...new Set([...(acc[date.getDate()] || []), ...scanCategories(scan)])];
    }
    return acc;
  }, {});
  const scanCount = scans.length;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: 18, paddingBottom: 28 }}>
      <ScreenIntro
        title="Diary"
        sub="Your saved scans become a food record you can look back through."
        t={t}
        right={
          <Pressable onPress={onScan} accessibilityRole="button" style={{ height: 38, paddingHorizontal: 13, borderRadius: 12,
            backgroundColor: t.surface, borderWidth: 1, borderColor: t.line, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: t.sans, fontSize: 13, fontWeight: '800', color: t.accentDeep }}>Scan</Text>
          </Pressable>
        }
      />

      <View style={{ borderRadius: 16, backgroundColor: t.accentTint, padding: 15, marginBottom: 16,
        borderWidth: 1, borderColor: t.accentSoft }}>
        <Text style={{ fontFamily: t.sans, fontSize: 15, fontWeight: '800', color: t.ink }}>
          {scanCount} saved scan{scanCount === 1 ? '' : 's'}
        </Text>
        <Text style={{ fontFamily: t.sans, fontSize: 13.5, color: t.ink2, lineHeight: 19, marginTop: 3 }}>
          Pattern summaries begin once there are 6 saved scans.
        </Text>
        <View style={{ marginTop: 12 }}>
          <ProgressBar value={Math.min(scanCount, 6)} max={6} color={t.accent} t={t} />
        </View>
      </View>

      <PrimaryButton onPress={onSample} t={t} style={{ marginBottom: 16 }}>
        Try a sample scan
      </PrimaryButton>

      <Card t={t} style={{ marginBottom: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <Text style={{ fontFamily: t.serif, fontSize: 19, fontWeight: '600', color: t.ink }}>
            {MONTHS[month]} {year}
          </Text>
          <Text style={{ fontFamily: t.sans, fontSize: 12.5, fontWeight: '700', color: t.ink3 }}>Saved scans</Text>
        </View>
        <View style={{ flexDirection: 'row', marginBottom: 6 }}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <Text key={`${d}-${i}`} style={{ width: `${100 / 7}%`, textAlign: 'center',
              fontFamily: t.mono, fontSize: 11, color: t.ink3 }}>
              {d}
            </Text>
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {days.map((d, i) => {
            const isToday = d === now.getDate();
            const dots = d ? (dotsByDay[d] || []) : [];
            return (
              <View key={`${d || 'blank'}-${i}`} style={{ width: `${100 / 7}%`, padding: 3 }}>
                <View style={{ aspectRatio: 1, borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: isToday ? t.accent : (dots.length ? t.surfaceWarm : 'transparent'),
                  borderWidth: dots.length && !isToday ? 1 : 0, borderColor: t.lineSoft }}>
                  {d ? (
                    <>
                      <Text style={{ fontFamily: t.sans, fontSize: 13, fontWeight: isToday ? '800' : '600',
                        color: isToday ? t.onAccent : t.ink }}>
                        {d}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 3, marginTop: 4 }}>
                        {dots.slice(0, 3).map((cat) => (
                          <View key={cat} style={{ width: 5, height: 5, borderRadius: 3,
                            backgroundColor: t[cat]?.strong || t.accent }} />
                        ))}
                      </View>
                    </>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </Card>

      <Overline t={t}>Recent scans</Overline>
      <View style={{ gap: 10, marginTop: 12 }}>
        {scans.length ? scans.slice(0, 6).map((entry) => {
          const dots = scanCategories(entry);
          return (
            <Card key={entry.id} t={t} style={{ padding: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 7 }}>
                    {dots.length ? dots.map((cat) => (
                      <View key={cat} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t[cat]?.strong || t.accent }} />
                    )) : <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.line }} />}
                    <Text style={{ fontFamily: t.mono, fontSize: 11, color: t.ink3 }}>{timeLabel(entry)}</Text>
                  </View>
                  <Text style={{ fontFamily: t.sans, fontSize: 16, fontWeight: '800', color: t.ink }}>
                    {entry.product?.name || 'Unnamed Product'}
                  </Text>
                </View>
                <Text style={{ fontFamily: t.sans, fontSize: 12.5, fontWeight: '800', color: t.ink3 }}>
                  {entry.source === 'sample' ? 'Sample' : 'Saved'}
                </Text>
              </View>
            </Card>
          );
        }) : (
          <Card t={t}>
            <Text style={{ fontFamily: t.sans, fontSize: 15, fontWeight: '800', color: t.ink }}>
              No scans saved yet.
            </Text>
            <Text style={{ fontFamily: t.sans, fontSize: 13.5, color: t.ink2, lineHeight: 19, marginTop: 4 }}>
              Run a manual or sample scan to start the diary.
            </Text>
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
