import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { Pressable } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

export default function AddMealLayout() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
      }}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Новое блюдо',
          headerLeft: () => (
            <Pressable onPress={() => router.dismiss()} hitSlop={12}>
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
          ),
        }}
      />
      <Stack.Screen name="analyzing" options={{ title: 'Анализ', headerBackVisible: false, gestureEnabled: false }} />
      <Stack.Screen name="review" options={{ title: 'Проверьте результат', headerBackVisible: false, gestureEnabled: false }} />
    </Stack>
  );
}
