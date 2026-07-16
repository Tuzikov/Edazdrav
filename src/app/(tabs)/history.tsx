import { useMemo, useState } from 'react';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealListItem } from '@/components/meal-list-item';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useMeals, type Meal } from '@/context/meals-context';
import { useProfile } from '@/context/profile-context';
import { useTheme } from '@/hooks/use-theme';
import { sumTotals, type NutrientTotals } from '@/lib/nutrition';

type MetricKey = Exclude<keyof NutrientTotals, 'calories'>;

const METRIC_OPTIONS: { key: MetricKey; label: string; unit: string }[] = [
  { key: 'protein', label: 'Белки', unit: 'г' },
  { key: 'fat', label: 'Жиры', unit: 'г' },
  { key: 'carbs', label: 'Углеводы', unit: 'г' },
  { key: 'fiber', label: 'Клетчатка', unit: 'г' },
];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDayTitle(date: Date) {
  return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function pluralizeDays(n: number) {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'день';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'дня';
  return 'дней';
}

export default function HistoryScreen() {
  const { meals } = useMeals();
  const { goals } = useProfile();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [metric, setMetric] = useState<MetricKey>('protein');
  const metricOption = METRIC_OPTIONS.find((option) => option.key === metric)!;

  const sections = useMemo(() => {
    const groups = new Map<string, { date: Date; title: string; data: Meal[] }>();
    for (const meal of meals) {
      const date = startOfDay(new Date(meal.createdAt));
      const key = date.toDateString();
      const existing = groups.get(key);
      if (existing) {
        existing.data.push(meal);
      } else {
        groups.set(key, { date, title: formatDayTitle(date), data: [meal] });
      }
    }
    return Array.from(groups.values()).map((group) => ({
      ...group,
      totals: sumTotals(group.data.map((meal) => meal.totals)),
    }));
  }, [meals]);

  // Считаем подряд идущие календарные дни (начиная с самого свежего, где
  // есть записи), в которые калории не превысили план — для геймификации.
  const streak = useMemo(() => {
    if (sections.length === 0) return 0;
    let count = 0;
    let expected = sections[0].date;
    for (const section of sections) {
      if (section.date.getTime() !== expected.getTime()) break;
      if (section.totals.calories > goals.calories) break;
      count++;
      expected = new Date(expected.getFullYear(), expected.getMonth(), expected.getDate() - 1);
    }
    return count;
  }, [sections, goals.calories]);

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
              <View>
                {streak > 0 && (
                  <View style={styles.streakRow}>
                    <ThemedText style={styles.streakNumber}>{streak}</ThemedText>
                    <ThemedText type="smallBold" style={styles.streakText}>
                      {pluralizeDays(streak)} в режиме 👍
                    </ThemedText>
                  </View>
                )}
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
              </View>
            ) : null
          }
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <ThemedText type="smallBold">{section.title}</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {Math.round(section.totals.calories)}/{Math.round(goals.calories)} ккал · {metricOption.label.toLowerCase()}:{' '}
                {Math.round(section.totals[metric])}/{Math.round(goals[metric])} {metricOption.unit}
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
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  streakNumber: { fontSize: 44, fontWeight: '800', lineHeight: 48 },
  streakText: { flex: 1 },
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
