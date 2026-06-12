import React from 'react';
import { View, Text, Pressable } from 'react-native';

export const CARD_SHADOW = {
  shadowColor: '#26313D',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

export function ScreenIntro({ title, sub, right, t }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginBottom: 12 }}>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: t.serif, fontSize: 23, fontWeight: '600', color: t.ink, lineHeight: 28 }}>
          {title}
        </Text>
        {sub ? (
          <Text style={{ fontFamily: t.sans, fontSize: 13.2, color: t.ink2, lineHeight: 18, marginTop: 3 }}>
            {sub}
          </Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}

export function Overline({ children, t, color }) {
  return (
    <Text style={{ fontFamily: t.mono, fontSize: 11, fontWeight: '700', letterSpacing: 0,
      textTransform: 'uppercase', color: color || t.ink3 }}>
      {children}
    </Text>
  );
}

export function Card({ children, t, style }) {
  return (
    <View style={[{ backgroundColor: t.surface, borderRadius: t.radius, borderWidth: 1,
      borderColor: t.lineSoft, padding: 16 }, CARD_SHADOW, style]}>
      {children}
    </View>
  );
}

export function PrimaryButton({ children, onPress, t, disabled, style }) {
  return (
    <Pressable onPress={onPress} disabled={disabled}
      accessibilityRole="button"
      style={[{ minHeight: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 16, backgroundColor: disabled ? t.line : t.accent }, style]}>
      <Text style={{ fontFamily: t.sans, fontSize: 15.5, fontWeight: '800', color: disabled ? t.ink3 : t.onAccent,
        textAlign: 'center' }}>
        {children}
      </Text>
    </Pressable>
  );
}

export function SecondaryButton({ children, onPress, t, disabled, style }) {
  return (
    <Pressable onPress={onPress} disabled={disabled}
      accessibilityRole="button"
      style={[{ minHeight: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
        paddingHorizontal: 16, backgroundColor: t.surface, borderWidth: 1,
        borderColor: disabled ? t.line : t.accentSoft }, style]}>
      <Text style={{ fontFamily: t.sans, fontSize: 15, fontWeight: '700',
        color: disabled ? t.ink3 : t.accentDeep, textAlign: 'center' }}>
        {children}
      </Text>
    </Pressable>
  );
}

export function Chip({ label, selected, onPress, t, palette = 'accent', compact = false }) {
  const pal = t[palette];
  const activeBg = palette === 'accent' ? t.accentTint : pal.tint;
  const activeEdge = palette === 'accent' ? t.accent : pal.edge;
  const activeInk = palette === 'accent' ? t.accentDeep : pal.label;

  return (
    <Pressable onPress={onPress} accessibilityRole="checkbox" accessibilityState={{ checked: selected }}
      style={{ minHeight: compact ? 34 : 42, paddingHorizontal: compact ? 11 : 13,
        paddingVertical: compact ? 7 : 10, borderRadius: 999, backgroundColor: selected ? activeBg : t.surface,
        borderWidth: selected ? 2 : 1, borderColor: selected ? activeEdge : t.line,
        alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ fontFamily: t.sans, fontSize: compact ? 12.5 : 14, fontWeight: selected ? '800' : '600',
        color: selected ? activeInk : t.ink2, textAlign: 'center' }}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Pill({ children, t, palette = 'accent' }) {
  const pal = t[palette];
  const bg = palette === 'accent' ? t.accentTint : pal.tint;
  const fg = palette === 'accent' ? t.accentDeep : pal.label;
  const edge = palette === 'accent' ? t.accentSoft : pal.edge;

  return (
    <View style={{ height: 26, paddingHorizontal: 10, borderRadius: 999, backgroundColor: bg,
      borderWidth: 1, borderColor: edge, alignItems: 'center', justifyContent: 'center', maxWidth: '100%' }}>
      <Text numberOfLines={1} style={{ fontFamily: t.sans, fontSize: 11.5, fontWeight: '800', color: fg }}>
        {children}
      </Text>
    </View>
  );
}

export function ProgressBar({ value, max, color, t }) {
  const pct = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));
  return (
    <View style={{ height: 8, borderRadius: 999, overflow: 'hidden', backgroundColor: t.lineSoft }}>
      <View style={{ width: `${pct}%`, height: '100%', borderRadius: 999, backgroundColor: color || t.accent }} />
    </View>
  );
}

export function SwitchPill({ on, onPress, t }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="switch" accessibilityState={{ checked: on }}
      style={{ width: 48, height: 30, borderRadius: 999, padding: 3, backgroundColor: on ? t.accent : t.line }}>
      <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: t.surface,
        transform: [{ translateX: on ? 18 : 0 }], shadowColor: '#111', shadowOpacity: 0.18,
        shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 2 }} />
    </Pressable>
  );
}
