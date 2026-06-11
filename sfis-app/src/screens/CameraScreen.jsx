// CameraScreen.jsx — REAL device camera via expo-camera (requests permission,
// shows the live feed, captures). Real OCR is ML Kit (device-native, not in Expo
// Go), so the captured frame stands in for the read and we run the controlled
// tutorial label through the SAME real matching engine. On a dev build, OCR text
// simply replaces TUTORIAL.text here — a clean seam.

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../theme/ThemeProvider';
import { matchScan } from '../match/scanMatch';
import data from '../data/allergens.json';
import { TUTORIAL } from '../data/tutorial';

function Centered({ t, children }) {
  return <View style={{ flex: 1, backgroundColor: t.bg, alignItems: 'center', justifyContent: 'center', padding: 30 }}>{children}</View>;
}

export function CameraScreen({ profile, onResult, onBack }) {
  const { theme: t } = useTheme();
  const [permission, requestPermission] = useCameraPermissions();

  const capture = () => {
    const { findings, unverified } = matchScan(TUTORIAL.text, profile, data);
    onResult({ findings, unverified, product: { name: TUTORIAL.name, date: TUTORIAL.date } });
  };

  if (!permission) {
    return <Centered t={t}><Text style={{ fontFamily: t.sans, color: t.ink2 }}>Preparing camera…</Text></Centered>;
  }

  if (!permission.granted) {
    return (
      <Centered t={t}>
        <Text style={{ fontFamily: t.serif, fontSize: 22, color: t.ink, textAlign: 'center' }}>Use your camera to scan a label</Text>
        <Text style={{ fontFamily: t.sans, fontSize: 14, color: t.ink2, textAlign: 'center', marginTop: 8, lineHeight: 20 }}>
          We only use the camera while you’re scanning. Photos stay on your device.
        </Text>
        <Pressable onPress={requestPermission}
          style={{ marginTop: 22, height: 50, paddingHorizontal: 26, borderRadius: 14, backgroundColor: t.accent, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: t.sans, fontSize: 16, fontWeight: '700', color: t.onAccent }}>Allow camera</Text>
        </Pressable>
        <Pressable onPress={onBack} style={{ marginTop: 14 }}>
          <Text style={{ fontFamily: t.sans, fontSize: 14, color: t.ink3 }}>Not now</Text>
        </Pressable>
      </Centered>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#111' }}>
      <CameraView style={{ flex: 1 }} facing="back" />
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
        <Pressable onPress={onBack}><Text style={{ color: '#fff', fontFamily: t.sans, fontSize: 15 }}>‹ Back</Text></Pressable>
        <Text style={{ color: '#EDE7DD', fontFamily: t.mono, fontSize: 11 }}>Front label · Ingredients · 1 of 2</Text>
      </View>
      <View style={{ position: 'absolute', left: 24, right: 24, top: '24%', height: 280, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(255,255,255,.7)' }} />
      <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 24, alignItems: 'center', backgroundColor: 'rgba(20,17,14,.55)' }}>
        <Text style={{ color: '#fff', fontFamily: t.sans, fontSize: 14, marginBottom: 14 }}>Fill the frame with the ingredient list</Text>
        <Pressable onPress={capture}
          style={{ width: 70, height: 70, borderRadius: 35, backgroundColor: '#fff', borderWidth: 4, borderColor: 'rgba(255,255,255,.45)' }} />
        <Text style={{ color: '#B8B0A4', fontFamily: t.mono, fontSize: 10, marginTop: 12 }}>Reading is simulated in this build (ML Kit OCR is device-native)</Text>
      </View>
    </View>
  );
}
