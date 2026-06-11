// ThemeProvider.jsx — the RN equivalent of the web prototype's CSS variables.
// One theme object in Context, handed to the whole app. Pick Background+Accent →
// rebuild it → every screen recolors instantly, offline, persisted across launches.

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { buildTheme, DEFAULT_THEME } from './tokens';

const STORAGE_KEY = 'sfis.theme.v1';
const ThemeContext = createContext(null);

export function ThemeProvider({ children, fallback = null }) {
  const [keys, setKeys] = useState(DEFAULT_THEME);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) setKeys({ ...DEFAULT_THEME, ...JSON.parse(saved) });
      } catch (_) { /* default theme */ }
      finally { setHydrated(true); }
    })();
  }, []);

  const setTheme = useCallback((next) => {
    setKeys((prev) => {
      const merged = { ...prev, ...next };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(merged)).catch(() => {});
      return merged;
    });
  }, []);

  const theme = useMemo(() => buildTheme(keys.background, keys.accent), [keys]);
  const value = useMemo(() => ({ theme, keys, setTheme }), [theme, keys, setTheme]);

  if (!hydrated) return fallback;
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
}
