import { useMemo } from 'react';
import { SectionList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MealListItem } from '@/components/meal-list-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useMeals, type Meal } from '@/context/meals-context';

function dayKey(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function HistoryScreen() {
  const { meals } = useMeals();

  const sections = useMemo(() => {
    const groups = new Map<string, Meal[]>();
    for (const meal of meals) {
      const key = dayKey(meal.createdAt);
      const list = groups.get(key) ?? [];
      list.push(meal);
      groups.set(key, list);
    }
    return Array.from(groups.entries()).map(([title, data]) => ({ title, data }));
  }, [meals]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ThemedText type="title" style={styles.pageTitle}>
          История
        </ThemedText>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => (
            <ThemedText type="smallBold" style={styles.sectionHeader}>
              {section.title}
            </ThemedText>
          )}
          renderItem={({ item }) => <MealListItem meal={item} />}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              История пуста — добавленные приёмы пищи появятся здесь.
            </ThemedText>
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three },
  pageTitle: { fontSize: 28, lineHeight: 34, paddingTop: Spacing.two },
  listContent: { paddingBottom: Spacing.four },
  sectionHeader: { marginTop: Spacing.three, marginBottom: Spacing.one },
  empty: { paddingVertical: Spacing.four, textAlign: 'center' },
});
