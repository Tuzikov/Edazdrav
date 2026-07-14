import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealListItem } from '@/components/meal-list-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useMeals, type Meal } from '@/context/meals-context';
import { useTheme } from '@/hooks/use-theme';
import { sumTotals, type NutrientTotals } from '@/lib/nutrition';

type MetricKey = Exclude<keyof NutrientTotals, 'calories'>;

const METRIC_OPTIONS: { key: MetricKey; label: string; unit: string }[] = [
  { key: 'protein', label: 'Белки', unit: 'г' },
  { key: 'fat', label: 'Жиры', unit: 'г' },
  { key: 'carbs', label: 'Углеводы', unit: 'г' },
  { key: 'fiber', label: 'Клетчатка', unit: 'г' },
];

function dayKey(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function HistoryScreen() {
  const { meals } = useMeals();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [metric, setMetric] = useState<MetricKey>('protein');
  const metricOption = METRIC_OPTIONS.find((option) => option.key === metric)!;

  const sections = useMemo(() => {
    const groups = new Map<string, Meal[]>();
    for (const meal of meals) {
      const key = dayKey(meal.createdAt);
      const list = groups.get(key) ?? [];
      list.push(meal);
      groups.set(key, list);
    }
    return Array.from(groups.entries()).map(([title, data]) => ({
      title,
      data,
      totals: sumTotals(data.map((meal) => meal.totals)),
    }));
  }, [meals]);

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.safeArea, { paddingTop: insets.top }]}>
        <ThemedText type="title" style={styles.pageTitle}>
          История
        </ThemedText>
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          ListHeaderComponent={
            sections.length > 0 ? (
              <View style={styles.metricSelector}>
                {METRIC_OPTIONS.map((option) => {
                  const selected = option.key === metric;
                  return (
                    <Pressable
                      key={option.key}
                      onPress={() => setMetric(option.key)}
                      style={[
                        styles.metricPill,
                        { borderColor: theme.textSecondary },
                        selected && { backgroundColor: theme.text, borderColor: theme.text },
                      ]}>
                      <ThemedText type="small" style={selected ? { color: theme.background } : undefined}>
                        {option.label}
                      </ThemedText>
                    </Pressable>
                  );
                })}
              </View>
            ) : null
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <ThemedText type="smallBold">{section.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {Math.round(section.totals.calories)} ккал · {metricOption.label.toLowerCase()}:{' '}
                {section.totals[metric].toFixed(1)} {metricOption.unit}
              </ThemedText>
            </View>
          )}
          renderItem={({ item }) => <MealListItem meal={item} />}
          ListEmptyComponent={
            <ThemedText type="small" themeColor="textSecondary" style={styles.empty}>
              История пуста — добавленные приёмы пищи появятся здесь.
            </ThemedText>
          }
        />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three },
  pageTitle: { fontSize: 28, lineHeight: 34, paddingTop: Spacing.two },
  listContent: { paddingBottom: Spacing.four },
  metricSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.three },
  metricPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  sectionHeader: { marginTop: Spacing.three, marginBottom: Spacing.one, gap: 2 },
  empty: { paddingVertical: Spacing.four, textAlign: 'center' },
});
