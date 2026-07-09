import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type NutritionGoals = {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
};

export const DEFAULT_GOALS: NutritionGoals = {
  calories: 2000,
  protein: 100,
  fat: 65,
  carbs: 225,
  fiber: 28,
};

const STORAGE_KEY = 'edazdrav.profile.goals';

type ProfileContextValue = {
  goals: NutritionGoals;
  isLoaded: boolean;
  updateGoals: (goals: NutritionGoals) => void;
};

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<NutritionGoals>(DEFAULT_GOALS);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setGoals(JSON.parse(raw));
        } catch {
          // повреждённые данные в хранилище — остаёмся на дефолтных целях
        }
      }
      setIsLoaded(true);
    });
  }, []);

  function updateGoals(next: NutritionGoals) {
    setGoals(next);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }

  return <ProfileContext.Provider value={{ goals, isLoaded, updateGoals }}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
