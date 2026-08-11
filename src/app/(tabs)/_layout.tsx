import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Image } from 'react-native';

import { Colors } from '@/constants/theme';
import { useResolvedColorScheme } from '@/hooks/use-resolved-color-scheme';

export default function TabsLayout() {
  const scheme = useResolvedColorScheme();
  const theme = Colors[scheme];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.text,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: { backgroundColor: theme.background },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Сегодня',
          tabBarIcon: ({ color, size }) => <Ionicons name="sunny-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'История',
          tabBarIcon: ({ color, size }) => <Ionicons name="time-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../../assets/images/profile-tab-icon.png')}
              style={{ width: size, height: size }}
              tintColor={color}
              resizeMode="contain"
            />
          ),
        }}
      />
    </Tabs>
  );
}
