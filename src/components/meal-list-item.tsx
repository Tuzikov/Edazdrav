import { Ionicons } from '@expo/vector-icons';
import { Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import type { Meal } from '@/context/meals-context';

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

export function MealListItem({ meal }: { meal: Meal }) {
  return (
    <View style={styles.row}>
      {meal.photoUri ? (
        <Image source={{ uri: meal.photoUri }} style={styles.thumb} />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder]}>
          <Ionicons name="restaurant-outline" size={20} color="#888" />
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
    </View>
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
    borderRadius: Spacing.two,
  },
  thumbPlaceholder: {
    backgroundColor: 'rgba(120,120,128,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
});
