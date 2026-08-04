import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Image, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { Meal } from '@/context/meals-context';
import { useTheme } from '@/hooks/use-theme';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function MealListItem({ meal }: { meal: Meal }) {
  const theme = useTheme();

  return (
    <Pressable style={styles.row} onPress={() => router.push(`/meal/${meal.id}`)}>
      {meal.photoUri ? (
        <Image source={{ uri: meal.photoUri }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: theme.backgroundElement }]}>
          <Ionicons name="restaurant-outline" size={20} color={theme.textSecondary} />
        </View>
      )}
      <View style={styles.info}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {meal.ingredients.map((ingredient) => ingredient.nameRu).join(', ')}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {formatTime(meal.createdAt)}
        </ThemedText>
      </View>
      <ThemedText type="smallBold">{Math.round(meal.totals.calories)} ккал</ThemedText>
      <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  thumb: {
    width: 44,
    height: 44,
    borderRadius: 14,
  },
  thumbPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
});
