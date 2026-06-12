import React, { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import {
  AlertTriangle,
  Bell,
  Camera,
  CheckCircle2,
  ChevronRight,
  HeartPulse,
  ScanLine,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';

const CONCEPTS = [
  {
    id: 'blossom-punch',
    name: 'Blossom Punch',
    mood: 'Warm, bold, friendly',
    bg: '#FFF2F7',
    surface: '#FFFFFF',
    surface2: '#FFF8ED',
    ink: '#20242B',
    muted: '#66707E',
    primary: '#D92F7D',
    primaryDark: '#9E215A',
    secondary: '#0EA5A2',
    pop: '#FF6B4A',
    amber: '#E79B18',
    soft: '#FADEEB',
  },
  {
    id: 'citrus-tide',
    name: 'Citrus Tide',
    mood: 'Fresh, active, modern',
    bg: '#F5FAEE',
    surface: '#FFFFFF',
    surface2: '#ECF8F6',
    ink: '#202A2A',
    muted: '#5F6D68',
    primary: '#0B8E89',
    primaryDark: '#05615E',
    secondary: '#D8427B',
    pop: '#F26B45',
    amber: '#D99610',
    soft: '#D8F0EA',
  },
  {
    id: 'berry-leaf',
    name: 'Berry Leaf',
    mood: 'Premium, calm, memorable',
    bg: '#F8F3FA',
    surface: '#FFFFFF',
    surface2: '#F2FAF6',
    ink: '#252633',
    muted: '#67667A',
    primary: '#B73474',
    primaryDark: '#7A2550',
    secondary: '#238B62',
    pop: '#EBA22A',
    amber: '#D88912',
    soft: '#F1DCEB',
  },
];

export function VisualConceptScreen() {
  const { theme: t } = useTheme();
  const [activeId, setActiveId] = useState(CONCEPTS[0].id);
  const concept = CONCEPTS.find((item) => item.id === activeId) || CONCEPTS[0];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: concept.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 30 }}>
      <View style={{ marginBottom: 14 }}>
        <Text style={{ fontFamily: t.mono, fontSize: 11, fontWeight: '900',
          textTransform: 'uppercase', color: concept.primaryDark }}>
          Visual direction
        </Text>
        <Text style={{ fontFamily: t.serif, fontSize: 28, lineHeight: 33,
          fontWeight: '700', color: concept.ink, marginTop: 4 }}>
          More pop, still calm.
        </Text>
        <Text style={{ fontFamily: t.sans, fontSize: 13.5, color: concept.muted,
          lineHeight: 19, marginTop: 5 }}>
          Pick a color attitude before we apply it across the real app.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
        {CONCEPTS.map((item) => (
          <ConceptTab key={item.id} item={item} active={item.id === concept.id}
            onPress={() => setActiveId(item.id)} />
        ))}
      </View>

      <HeroPanel p={concept} />
      <PaletteBand p={concept} />
      <MockResult p={concept} />
      <MockTabs p={concept} />
    </ScrollView>
  );
}

function ConceptTab({ item, active, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={{ flex: 1, minHeight: 72, borderRadius: 16, padding: 10,
        backgroundColor: active ? item.primary : item.surface,
        borderWidth: 1, borderColor: active ? item.primaryDark : item.soft }}>
      <View style={{ flexDirection: 'row', gap: 4, marginBottom: 8 }}>
        {[item.primary, item.secondary, item.pop].map((color) => (
          <View key={color} style={{ width: 15, height: 15, borderRadius: 5,
            backgroundColor: color, borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)' }} />
        ))}
      </View>
      <Text numberOfLines={1} style={{ fontSize: 12.5, fontWeight: '900',
        color: active ? '#FFF8F0' : item.ink }}>
        {item.name}
      </Text>
      <Text numberOfLines={1} style={{ fontSize: 10.5, fontWeight: '700',
        color: active ? '#FFE7F0' : item.muted, marginTop: 2 }}>
        {item.mood}
      </Text>
    </Pressable>
  );
}

function HeroPanel({ p }) {
  return (
    <View style={{ borderRadius: 24, backgroundColor: p.surface, borderWidth: 1,
      borderColor: p.soft, overflow: 'hidden', marginBottom: 14,
      shadowColor: p.primaryDark, shadowOpacity: 0.12, shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 }, elevation: 5 }}>
      <View style={{ height: 8, backgroundColor: p.primary }} />
      <View style={{ padding: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={{ fontSize: 11, fontWeight: '900', textTransform: 'uppercase',
              color: p.primaryDark }}>
              Anvara
            </Text>
            <Text style={{ fontSize: 30, lineHeight: 34, fontWeight: '900',
              color: p.ink, marginTop: 5 }}>
              Scan with less second guessing.
            </Text>
          </View>
          <View style={{ width: 72, height: 72, borderRadius: 23,
            backgroundColor: p.primary, alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={37} color="#FFF8F0" strokeWidth={2.6} />
          </View>
        </View>

        <View style={{ minHeight: 62, borderRadius: 18, backgroundColor: p.primary,
            marginTop: 18, paddingHorizontal: 16, flexDirection: 'row',
            alignItems: 'center', justifyContent: 'space-between',
            shadowColor: p.primaryDark, shadowOpacity: 0.2, shadowRadius: 14,
            shadowOffset: { width: 0, height: 6 }, elevation: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 11 }}>
            <ScanLine size={24} color="#FFF8F0" strokeWidth={2.6} />
            <Text style={{ fontSize: 17, fontWeight: '900', color: '#FFF8F0' }}>
              Scan ingredient label
            </Text>
          </View>
          <ChevronRight size={23} color="#FFF8F0" strokeWidth={2.8} />
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 13 }}>
          <MiniMetric icon={ShieldCheck} label="Profile" value="Ready" color={p.secondary} p={p} />
          <MiniMetric icon={Bell} label="Alerts" value="4" color={p.pop} p={p} />
          <MiniMetric icon={HeartPulse} label="Diary" value="18" color={p.primary} p={p} />
        </View>
      </View>
    </View>
  );
}

function MiniMetric({ icon: Icon, label, value, color, p }) {
  return (
    <View style={{ flex: 1, minHeight: 78, borderRadius: 17, backgroundColor: p.surface2,
      borderWidth: 1, borderColor: p.soft, padding: 10, justifyContent: 'space-between' }}>
      <Icon size={19} color={color} strokeWidth={2.4} />
      <View>
        <Text style={{ fontSize: 10.5, fontWeight: '800', color: p.muted }}>{label}</Text>
        <Text style={{ fontSize: 16, fontWeight: '900', color: p.ink }}>{value}</Text>
      </View>
    </View>
  );
}

function PaletteBand({ p }) {
  const swatches = [
    ['Primary', p.primary],
    ['Fresh', p.secondary],
    ['Pop', p.pop],
    ['Warm', p.amber],
  ];
  return (
    <View style={{ borderRadius: 20, backgroundColor: p.surface, borderWidth: 1,
      borderColor: p.soft, padding: 14, marginBottom: 14 }}>
      <Text style={{ fontSize: 13, fontWeight: '900', color: p.ink, marginBottom: 11 }}>
        Color system
      </Text>
      <View style={{ flexDirection: 'row', gap: 9 }}>
        {swatches.map(([label, color]) => (
          <View key={label} style={{ flex: 1 }}>
            <View style={{ height: 48, borderRadius: 14, backgroundColor: color,
              borderWidth: 1, borderColor: 'rgba(32,36,43,0.06)' }} />
            <Text numberOfLines={1} style={{ fontSize: 11.5, fontWeight: '800',
              color: p.muted, marginTop: 6 }}>
              {label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function MockResult({ p }) {
  return (
    <View style={{ borderRadius: 22, backgroundColor: p.surface, borderWidth: 1,
      borderColor: p.soft, padding: 15, marginBottom: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 13 }}>
        <View>
          <Text style={{ fontSize: 11, fontWeight: '900', textTransform: 'uppercase',
            color: p.primaryDark }}>
            Result surface
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '900', color: p.ink, marginTop: 3 }}>
            Sunflower cookies
          </Text>
        </View>
        <View style={{ width: 42, height: 42, borderRadius: 15, backgroundColor: p.surface2,
          alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={21} color={p.primary} strokeWidth={2.4} />
        </View>
      </View>

      <FindingRow icon={AlertTriangle} title="Contains milk" sub="Found as whey powder" color={p.amber} p={p} />
      <FindingRow icon={CheckCircle2} title="No peanut terms found" sub="Still verify if packaging says otherwise" color={p.secondary} p={p} />
    </View>
  );
}

function FindingRow({ icon: Icon, title, sub, color, p }) {
  return (
    <View style={{ minHeight: 70, borderRadius: 17, backgroundColor: p.surface2,
      borderWidth: 1, borderColor: p.soft, padding: 12, marginBottom: 9,
      flexDirection: 'row', alignItems: 'center', gap: 11 }}>
      <View style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: color,
        alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color="#FFF8F0" strokeWidth={2.5} />
      </View>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text style={{ fontSize: 15, fontWeight: '900', color: p.ink }}>{title}</Text>
        <Text style={{ fontSize: 12.5, color: p.muted, marginTop: 2 }}>{sub}</Text>
      </View>
    </View>
  );
}

function MockTabs({ p }) {
  const tabs = [
    ['Diary', HeartPulse, false],
    ['Scan', ScanLine, true],
    ['Patterns', Sparkles, false],
    ['Profile', ShieldCheck, false],
  ];
  return (
    <View style={{ borderRadius: 24, backgroundColor: p.ink, padding: 10,
      flexDirection: 'row', gap: 8 }}>
      {tabs.map(([label, Icon, active]) => (
        <View key={label} style={{ flex: 1, minHeight: 56, borderRadius: 17,
          backgroundColor: active ? p.primary : 'rgba(255,255,255,0.08)',
          alignItems: 'center', justifyContent: 'center', gap: 3 }}>
          <Icon size={19} color="#FFF8F0" strokeWidth={2.5} />
          <Text style={{ fontSize: 10.5, fontWeight: '900', color: '#FFF8F0' }}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}
