// App.js — root. ThemeProvider + a tiny screen router (no nav lib, keeps deps
// minimal): Onboarding → Scan → Result, with Appearance reachable from Scan.

import React, { useState } from 'react';
import { SafeAreaView, View, Text, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { ScanScreen } from './src/screens/ScanScreen';
import { CameraScreen } from './src/screens/CameraScreen';
import { ResultScreen } from './src/screens/ResultScreen';
import { AppearanceScreen } from './src/screens/AppearanceScreen';

function HeaderButton({ label, onPress, align, t }) {
  return (
    <View style={{ width: 96, alignItems: align }}>
      {label ? (
        <Pressable onPress={onPress} hitSlop={8}>
          <Text style={{ fontFamily: t.sans, fontSize: 14.5, fontWeight: '700', color: t.accentDeep }}>{label}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function Shell() {
  const { theme: t } = useTheme();
  const [profile, setProfile] = useState(null);
  const [screen, setScreen] = useState('onboarding');
  const [result, setResult] = useState(null);

  let body, title, left = {}, right = {};
  if (!profile || screen === 'onboarding') {
    title = 'Welcome';
    body = <OnboardingScreen onDone={(p) => { setProfile(p); setScreen('scan'); }} />;
  } else if (screen === 'scan') {
    title = 'Scan';
    right = { label: 'Theme', onPress: () => setScreen('appearance') };
    body = <ScanScreen profile={profile} onResult={(r) => { setResult(r); setScreen('result'); }}
              onCamera={() => setScreen('camera')} />;
  } else if (screen === 'camera') {
    title = 'Camera';
    left = { label: '‹ Scan', onPress: () => setScreen('scan') };
    body = <CameraScreen profile={profile} onBack={() => setScreen('scan')}
              onResult={(r) => { setResult(r); setScreen('result'); }} />;
  } else if (screen === 'result') {
    title = 'Result';
    left = { label: '‹ Scan', onPress: () => setScreen('scan') };
    body = <ResultScreen {...result} />;
  } else if (screen === 'appearance') {
    title = 'Appearance';
    left = { label: '‹ Back', onPress: () => setScreen('scan') };
    body = <AppearanceScreen />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: 14, height: 52, backgroundColor: t.surfaceWarm,
        borderBottomWidth: 1, borderBottomColor: t.lineSoft }}>
        <HeaderButton label={left.label} onPress={left.onPress} align="flex-start" t={t} />
        <Text style={{ fontFamily: t.sans, fontSize: 16, fontWeight: '800', color: t.ink }}>{title}</Text>
        <HeaderButton label={right.label} onPress={right.onPress} align="flex-end" t={t} />
      </View>
      <View style={{ flex: 1 }}>{body}</View>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider fallback={null}>
      <Shell />
    </ThemeProvider>
  );
}
