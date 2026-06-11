// MatchBar.jsx — core result atom. Minimal style (white card + bold category rail
// + universal amber dot). "Contains" (DIRECT/DERIVED) vs "May contain"
// (POSSIBLE/AMBIGUOUS, incl. PAL). No score, no confidence meter, no red/green.

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const VERB = { contains: 'Contains', may: 'May contain' };

export function MatchBar({ data, onOpen, child = false }) {
  const { theme: t } = useTheme();
  const pal = t[data.cat];
  const labelColor = child ? t.ink : pal.label;

  return (
    <View style={{ flexDirection: 'row', borderRadius: t.radius, backgroundColor: t.surface,
      borderWidth: 1, borderColor: t.line, marginBottom: 14, overflow: 'hidden' }}>
      <View style={{ width: 5, backgroundColor: pal.strong }} />
      <View style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14,
          paddingTop: 13, paddingBottom: 5 }}>
          <View style={{ width: child ? 16 : 13, height: child ? 16 : 13, borderRadius: 8, backgroundColor: t.amber }} />
          <Text style={{ fontFamily: t.sans, fontWeight: '800', fontSize: child ? 16 : 13,
            letterSpacing: child ? 0 : 0.4, textTransform: child ? 'none' : 'uppercase', color: labelColor }}>
            {data.label}
          </Text>
        </View>
        {data.items.map((it, i) => (
          <Pressable key={i} onPress={() => onOpen?.(data, it)}
            accessibilityRole="button"
            accessibilityLabel={`${VERB[it.kind] || VERB.contains} ${it.common}. Opens details.`}
            style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12,
              paddingHorizontal: 14, paddingVertical: child ? 14 : 12,
              borderTopWidth: 1, borderTopColor: t.lineSoft }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontFamily: t.mono, fontSize: 10.5, letterSpacing: 1,
                textTransform: 'uppercase', color: labelColor, marginBottom: 3 }}>
                {VERB[it.kind] || VERB.contains}
              </Text>
              <Text style={{ fontFamily: t.sans, fontWeight: '700', fontSize: child ? 21 : 18,
                color: t.ink, letterSpacing: -0.2, lineHeight: child ? 26 : 23 }}>
                {it.common}
              </Text>
              {it.technical && !child && (
                <Text style={{ fontFamily: t.sans, fontWeight: '500', fontSize: 13.5, color: t.ink2, marginTop: 2 }}>
                  ({it.technical})
                </Text>
              )}
              {it.note && (
                <Text style={{ fontFamily: t.sans, fontSize: 13.5, color: t.ink2, marginTop: 3, lineHeight: 19 }}>
                  {it.note}
                </Text>
              )}
              {it.profiles && (
                <View style={{ flexDirection: 'row', gap: 6, marginTop: 9, flexWrap: 'wrap' }}>
                  {it.profiles.map((p) => <ProfileTag key={p.name} name={p.name} isChild={p.child} t={t} />)}
                </View>
              )}
            </View>
            <Text style={{ color: pal.strong, fontSize: 18, marginTop: 14 }}>›</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function ProfileTag({ name, isChild, t }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, height: 22,
      paddingHorizontal: 9, paddingLeft: 6, borderRadius: 999,
      backgroundColor: t.surfaceWarm, borderWidth: 1, borderColor: t.line }}>
      <View style={{ width: 14, height: 14, borderRadius: 7, alignItems: 'center', justifyContent: 'center',
        backgroundColor: isChild ? '#E7D9C4' : t.accentSoft }}>
        <Text style={{ fontSize: 8.5, fontWeight: '800', color: isChild ? '#8A6B3D' : t.accentDeep }}>{name[0]}</Text>
      </View>
      <Text style={{ fontFamily: t.sans, fontSize: 11.5, fontWeight: '700', color: t.ink2 }}>{name}</Text>
    </View>
  );
}
