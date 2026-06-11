// MemberSearchSheet.jsx — the "+ Add members" flow (founder spec 2026-06-11):
// tapping the gray + circle opens a search bar to find family members by name/
// email. Honest state: user lookup needs accounts, which aren't live — the sheet
// is fully functional UI over a pending backend, and says so.

import React, { useState } from 'react';
import { Modal, Pressable, Text, TextInput, View } from 'react-native';

export function MemberSearchSheet({ visible, onClose, t }) {
  const [query, setQuery] = useState('');

  const close = () => { setQuery(''); onClose(); };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={close}>
      <Pressable onPress={close} style={{ flex: 1, backgroundColor: 'rgba(20,24,28,0.34)', justifyContent: 'flex-end' }}>
        <Pressable onPress={() => {}} style={{ backgroundColor: t.surface, borderTopLeftRadius: 22,
          borderTopRightRadius: 22, padding: 20, paddingBottom: 30, borderWidth: 1, borderColor: t.line }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ fontFamily: t.serif, fontSize: 21, fontWeight: '600', color: t.ink }}>
              Add a family member
            </Text>
            <Pressable onPress={close} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
              <Text style={{ fontFamily: t.sans, fontSize: 14, fontWeight: '900', color: t.ink3 }}>Close</Text>
            </Pressable>
          </View>

          <View style={{ backgroundColor: t.surfaceWarm, borderRadius: 14, borderWidth: 1, borderColor: t.line,
            minHeight: 50, paddingHorizontal: 14, justifyContent: 'center', marginBottom: 12 }}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name or email"
              placeholderTextColor={t.ink3}
              autoCapitalize="none"
              autoFocus
              accessibilityLabel="Search for a family member"
              style={{ fontFamily: t.sans, fontSize: 15, color: t.ink, minHeight: 48 }}
            />
          </View>

          {query.trim() ? (
            <View style={{ borderRadius: 14, backgroundColor: t.surfaceWarm, borderWidth: 1, borderColor: t.line, padding: 14 }}>
              <Text style={{ fontFamily: t.sans, fontSize: 14, fontWeight: '800', color: t.ink }}>
                No members found for “{query.trim()}”
              </Text>
              <Text style={{ fontFamily: t.sans, fontSize: 13, color: t.ink2, lineHeight: 19, marginTop: 4 }}>
                Member search looks up Anvara accounts, and accounts aren't live in this build yet.
                Once sign-in ships, family members you find here join with their own watched items.
              </Text>
            </View>
          ) : (
            <Text style={{ fontFamily: t.sans, fontSize: 13, color: t.ink2, lineHeight: 19 }}>
              Search for someone who already uses Anvara. Each member keeps their own profile;
              scans can check everyone at once. A family supports up to 5 profiles.
            </Text>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
