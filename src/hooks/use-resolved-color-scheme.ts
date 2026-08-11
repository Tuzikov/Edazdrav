import { useThemePreference } from '@/context/theme-preference-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Системная тема + ручной выбор пользователя, всегда сведённые к 'light' | 'dark'. */
export function useResolvedColorScheme(): 'light' | 'dark' {
  const { preference } = useThemePreference();
  const system = useColorScheme();

  if (preference !== 'system') return preference;
  return system === 'dark' ? 'dark' : 'light';
}
