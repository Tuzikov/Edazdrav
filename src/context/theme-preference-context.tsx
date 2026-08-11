import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

const STORAGE_KEY = 'edazdrav.themePreference';

type ThemePreferenceContextValue = {
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
};

const ThemePreferenceContext = createContext<ThemePreferenceContextValue | null>(null);

function isThemePreference(value: string | null): value is ThemePreference {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (isThemePreference(raw)) setPreferenceState(raw);
    });
  }, []);

  function setPreference(next: ThemePreference) {
    setPreferenceState(next);
    AsyncStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <ThemePreferenceContext.Provider value={{ preference, setPreference }}>{children}</ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const ctx = useContext(ThemePreferenceContext);
  if (!ctx) throw new Error('useThemePreference must be used within ThemePreferenceProvider');
  return ctx;
}
