import React, { useState } from 'react';
import { ScrollView, Text, Pressable, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { Card, Overline, PrimaryButton, ScreenIntro, SecondaryButton } from '../components/DesignPrimitives';

export function SaveProfileScreen({ hasProfile, onUseLocal, onBack }) {
  const { theme: t } = useTheme();
  const [status, setStatus] = useState('');
  const title = hasProfile ? 'Save your profile' : 'Sign in';
  const sub = hasProfile
    ? 'Create a free account to save and sync once auth is wired, or keep using this device locally.'
    : 'Account sync is pending in this build. You can still start locally.';

  const pressAuth = (method) => {
    setStatus(`${method} sign-in is not wired in this build. Local use is available now.`);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ padding: 18, paddingBottom: 30 }}>
      <ScreenIntro title={title} sub={sub} t={t} />

      <Card t={t} style={{ marginBottom: 16 }}>
        <Overline t={t}>Free account</Overline>
        <Text style={{ fontFamily: t.serif, fontSize: 20, color: t.ink, lineHeight: 28, marginTop: 8 }}>
          Account sync will save across devices when available.
        </Text>
        <Text style={{ fontFamily: t.sans, fontSize: 13.5, color: t.ink2, lineHeight: 20, marginTop: 6 }}>
          Privacy language is pending legal review.
        </Text>
      </Card>

      <View style={{ gap: 10, marginBottom: 14 }}>
        {['Apple', 'Google', 'Email/password'].map((method) => (
          <Pressable key={method} onPress={() => pressAuth(method)} accessibilityRole="button"
            style={{ minHeight: 48, borderRadius: 14, backgroundColor: t.surface,
              borderWidth: 1, borderColor: t.line, alignItems: 'center', justifyContent: 'center',
              paddingHorizontal: 14 }}>
            <Text style={{ fontFamily: t.sans, fontSize: 15, fontWeight: '800', color: t.ink }}>
              Continue with {method}
            </Text>
          </Pressable>
        ))}
      </View>

      {status ? (
        <Card t={t} style={{ padding: 13, marginBottom: 14 }}>
          <Text style={{ fontFamily: t.sans, fontSize: 13.5, color: t.ink2, lineHeight: 19 }}>
            {status}
          </Text>
        </Card>
      ) : null}

      {/* Skip path — allowed, but with an explicit recovery warning (founder decision 2026-06-11) */}
      <View style={{ borderRadius: 14, backgroundColor: t.surfaceWarm, borderWidth: 1, borderColor: t.line,
        padding: 13, marginBottom: 12 }}>
        <Text style={{ fontFamily: t.sans, fontSize: 13.5, fontWeight: '800', color: t.ink }}>
          Skipping keeps everything on this phone only.
        </Text>
        <Text style={{ fontFamily: t.sans, fontSize: 12.5, color: t.ink2, lineHeight: 18, marginTop: 3 }}>
          Without an account, your profile and diary can't be restored if this phone is lost,
          replaced, or the app is removed.
        </Text>
      </View>
      <PrimaryButton onPress={onUseLocal} t={t}>
        Skip for now — use on this phone
      </PrimaryButton>
      <SecondaryButton onPress={onBack} t={t} style={{ marginTop: 10 }}>
        Back
      </SecondaryButton>
    </ScrollView>
  );
}
