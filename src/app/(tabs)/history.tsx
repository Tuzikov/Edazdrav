import { useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MealListItem } from '@/components/meal-list-item';
import { PeriodCalendar, type DateRange } from '@/components/period-calendar';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useMeals, type Meal } from '@/context/meals-context';
import { useProfile } from '@/context/profile-context';
import { useTheme } from '@/hooks/use-theme';
import { getNutritionAdvice } from '@/lib/nutrition-advice-api';
import { sumTotals, type NutrientTotals } from '@/lib/nutrition';

type MetricKey = Exclude<keyof NutrientTotals, 'calories'>;

const METRIC_OPTIONS: { key: MetricKey; label: string; unit: string }[] = [
  { key: 'protein', label: 'Белки', unit: 'г' },
  { key: 'fat', label: 'Жиры', unit: 'г' },
  { key: 'carbs', label: 'Углеводы', unit: 'г' },
  { key: 'fiber', label: 'Клетчатка', unit: 'г' },
];

const PERIOD_METRICS: { key: keyof NutrientTotals; label: string; unit: string }[] = [
  { key: 'calories', label: 'Калории', unit: 'ккал' },
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

function formatPeriodLabel({ start, end }: DateRange) {
  const withYear: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
  if (start.getTime() === end.getTime()) return start.toLocaleDateString('ru-RU', withYear);

  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();
  const startStr = start.toLocaleDateString('ru-RU', sameMonth ? { day: 'numeric' } : { day: 'numeric', month: 'long' });
  const endStr = end.toLocaleDateString('ru-RU', withYear);
  return `${startStr} – ${endStr}`;
}

function daysBetweenInclusive(start: Date, end: Date) {
  return Math.round((startOfDay(end).getTime() - startOfDay(start).getTime()) / 86_400_000) + 1;
}

function scaleTotals(totals: NutrientTotals, factor: number): NutrientTotals {
  return {
    calories: totals.calories * factor,
    protein: totals.protein * factor,
    fat: totals.fat * factor,
    carbs: totals.carbs * factor,
    fiber: totals.fiber * factor,
  };
}

function formatMetricValue(value: number, unit: string) {
  return unit === 'ккал' ? `${Math.round(value)}` : value.toFixed(1);
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

  const [periodRange, setPeriodRange] = useState<DateRange>(() => {
    const end = startOfDay(new Date());
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    return { start, end };
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);
  const [adviceLoading, setAdviceLoading] = useState(false);
  const [adviceError, setAdviceError] = useState<string | null>(null);

  const periodDays = useMemo(() => daysBetweenInclusive(periodRange.start, periodRange.end), [periodRange]);
  const periodLabel = useMemo(() => formatPeriodLabel(periodRange), [periodRange]);

  const periodTotals = useMemo(() => {
    const startTime = periodRange.start.getTime();
    const endTime = periodRange.end.getTime();
    const periodMeals = meals.filter((meal) => {
      const day = startOfDay(new Date(meal.createdAt)).getTime();
      return day >= startTime && day <= endTime;
    });
    return sumTotals(periodMeals.map((meal) => meal.totals));
  }, [meals, periodRange]);

  const periodAverages = useMemo(() => scaleTotals(periodTotals, 1 / periodDays), [periodTotals, periodDays]);
  const periodGoalTotals = useMemo(() => scaleTotals(goals, periodDays), [goals, periodDays]);

  function handleRangeChange(range: DateRange) {
    setPeriodRange(range);
    setAdvice(null);
    setAdviceError(null);
  }

  async function handleGetAdvice() {
    setAdviceLoading(true);
    setAdviceError(null);
    try {
      const result = await getNutritionAdvice({
        periodLabel,
        days: periodDays,
        totals: periodTotals,
        averages: periodAverages,
        goals,
      });
      setAdvice(result);
    } catch (e) {
      setAdviceError(e instanceof Error ? e.message : 'Не получилось получить рекомендации');
    } finally {
      setAdviceLoading(false);
    }
  }

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

                <ThemedText type="smallBold" style={styles.periodTitle}>
                  Сводка за период
                </ThemedText>
                <Pressable onPress={() => setShowCalendar((prev) => !prev)} hitSlop={8}>
                  <ThemedText type="linkPrimary">{periodLabel}</ThemedText>
                </Pressable>

                {showCalendar && (
                  <ThemedView type="backgroundElement" style={styles.calendarCard}>
                    <PeriodCalendar value={periodRange} onChange={handleRangeChange} />
                  </ThemedView>
                )}

                <ThemedView type="backgroundElement" style={styles.periodCard}>
                  <View style={styles.periodTableHeader}>
                    <View style={{ flex: 1 }} />
                    <ThemedText type="small" themeColor="textSecondary" style={styles.periodValueCol}>
                      Итого
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.periodValueCol}>
                      В день
                    </ThemedText>
                  </View>
                  {PERIOD_METRICS.map((item) => (
                    <View key={item.key} style={styles.periodRow}>
                      <ThemedText type="small" style={{ flex: 1 }}>
                        {item.label}
                      </ThemedText>
                      <View style={styles.periodValueCol}>
                        <ThemedText type="smallBold">{formatMetricValue(periodTotals[item.key], item.unit)}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          план {formatMetricValue(periodGoalTotals[item.key], item.unit)}
                        </ThemedText>
                      </View>
                      <View style={styles.periodValueCol}>
                        <ThemedText type="smallBold">{formatMetricValue(periodAverages[item.key], item.unit)}</ThemedText>
                        <ThemedText type="small" themeColor="textSecondary">
                          план {formatMetricValue(goals[item.key], item.unit)}
                        </ThemedText>
                      </View>
                    </View>
                  ))}
                </ThemedView>

                <Pressable
                  style={[styles.adviceButton, { backgroundColor: theme.accentButton }, adviceLoading && styles.adviceButtonDisabled]}
                  onPress={handleGetAdvice}
                  disabled={adviceLoading}>
                  {adviceLoading ? (
                    <ActivityIndicator size="small" color={theme.onAccent} />
                  ) : (
                    <ThemedText type="smallBold" style={styles.adviceButtonText}>
                      Получить рекомендации
                    </ThemedText>
                  )}
                </Pressable>

                {adviceError && (
                  <ThemedText type="small" style={styles.adviceError}>
                    {adviceError}
                  </ThemedText>
                )}

                {advice && (
                  <ThemedView type="backgroundElement" style={styles.adviceCard}>
                    <ThemedText type="smallBold" style={styles.adviceCardTitle}>
                      Рекомендации
                    </ThemedText>
                    <ThemedText type="small">{advice}</ThemedText>
                  </ThemedView>
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
  periodTitle: { marginTop: Spacing.four },
  calendarCard: { borderRadius: 20, padding: Spacing.three, marginTop: Spacing.two },
  periodCard: { borderRadius: 20, padding: Spacing.three, marginTop: Spacing.two, gap: Spacing.two },
  periodTableHeader: { flexDirection: 'row' },
  periodValueCol: { width: 84, alignItems: 'flex-end' },
  periodRow: { flexDirection: 'row', alignItems: 'center' },
  adviceButton: {
    marginTop: Spacing.three,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  adviceButtonDisabled: { opacity: 0.7 },
  adviceButtonText: { color: '#fff' },
  adviceError: { color: '#e5484d', marginTop: Spacing.two },
  adviceCard: { borderRadius: 20, padding: Spacing.three, marginTop: Spacing.two, gap: Spacing.one },
  adviceCardTitle: { marginBottom: 2 },
  metricSelector: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two, marginTop: Spacing.four },
  metricPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  sectionHeader: { marginTop: Spacing.three, marginBottom: Spacing.one, gap: 2 },
  empty: { paddingVertical: Spacing.four, textAlign: 'center' },
});
