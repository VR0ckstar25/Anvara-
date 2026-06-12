import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { ChartNoAxesColumnIncreasing, House, ScanLine, UserRound } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';

const TABS = [
  { key: 'diary', label: 'Home', Icon: House },
  { key: 'scan', label: 'Scan', Icon: ScanLine },
  { key: 'patterns', label: 'Patterns', Icon: ChartNoAxesColumnIncreasing },
  { key: 'profile', label: 'Profile', Icon: UserRound },
];

export function BottomTabs({ active, onChange }) {
  const { theme: t } = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', minHeight: 76, paddingHorizontal: 10,
      paddingTop: 8, paddingBottom: 10, backgroundColor: t.surfaceWarm, borderTopWidth: 1, borderTopColor: t.lineSoft }}>
      {TABS.map((tab) => {
        const on = active === tab.key;
        const Icon = tab.Icon;
        return (
          <Pressable key={tab.key} onPress={() => onChange(tab.key)}
            accessibilityRole="tab" accessibilityLabel={`${tab.label} tab`} accessibilityState={{ selected: on }}
            style={{ flex: 1, minHeight: 56, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ minWidth: on ? 78 : 48, height: 42, borderRadius: 999, paddingHorizontal: 12,
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7,
              backgroundColor: on ? t.accentTint : 'transparent', borderWidth: on ? 1 : 0,
              borderColor: t.accentSoft }}>
              <Icon size={21} strokeWidth={on ? 2.7 : 2.25} color={on ? t.accentDeep : t.ink3} />
              {on ? (
                <Text numberOfLines={1} style={{ fontFamily: t.sans, fontSize: 12.5, fontWeight: '900',
                  color: t.accentDeep }}>
                  {tab.label}
                </Text>
              ) : null}
            </View>
            {!on ? (
              <Text numberOfLines={1} style={{ fontFamily: t.sans, fontSize: 11, fontWeight: '700',
                color: t.ink3, marginTop: 2 }}>
                {tab.label}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </View>
  );
}
