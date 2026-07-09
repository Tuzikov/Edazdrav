import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CalorieRing } from '@/components/calorie-ring';
import { MacroCard } from '@/components/macro-card';
import { MealListItem } from '@/components/meal-list-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useMeals } from '@/context/meals-context';
import { useProfile } from '@/context/profile-context';
import { sumIngredients } from '@/lib/nutrition';

function isToday(iso: string) {
  return new Date(iso).toDateString() === new Date().toDateString();
}

export default function TodayScreen() {
  const { goals } = useProfile();
  const { meals } = useMeals();

  const todaysMeals = useMemo(() => meals.filter((meal) => isToday(meal.createdAt)), [meals]);

  const totals = useMemo(
    () => sumIngredients(todaysMeals.flatMap((meal) => meal.ingredients)),
    [todaysMeals]
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <FlatList
          data={todaysMeals}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.header}>
              <ThemedText type="title" style={styles.pageTitle}>
                Сегодня
              </ThemedText>
              <View style={styles.ringWrap}>
                <CalorieRing consumed={totals.calories} goal={goals.calories} color="#3c87f7" trackColor="rgba(120,120,128,0.24)" />
              </View>
              <View style={styles.macroGrid}>
                <MacroCard label="Белки" consumed={totals.protein} goal={goals.protein} color="#3c87f7" />
                <MacroCard label="Жиры" consumed={totals.fat} goal={goals.fat} color="#f7a23c" />
                <MacroCard label="Углеводы" consumed={totals.carbs} goal={goals.carbs} color="#3cc26a" />
                <MacroCard label="Клетчатка" consumed={totals.fiber} goal={goals.fiber} color="#a23cf7" />
              </View>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Приёмы пищи
              </ThemedText>
            </View>
          }
          renderItem={({ item }) => <MealListItem meal={item} />}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              Пока ничего не добавлено — нажмите на кнопку камеры, чтобы добавить первый приём пищи.
            </ThemedText>
          }
        />
        <Pressable style={styles.fab} onPress={() => router.push('/add-meal')}>
          <Ionicons name="camera" size={28} color="#fff" />
        </Pressable>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.three, paddingBottom: 100 },
  header: { gap: Spacing.three, paddingTop: Spacing.two },
  pageTitle: { fontSize: 28, lineHeight: 34 },
  ringWrap: { alignItems: 'center', paddingVertical: Spacing.three },
  macroGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, justifyContent: 'space-between' },
  sectionTitle: { marginTop: Spacing.two },
  empty: { paddingVertical: Spacing.four, textAlign: 'center' },
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.four,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3c87f7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
