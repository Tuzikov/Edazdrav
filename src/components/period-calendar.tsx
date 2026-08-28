import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type DateRange = { start: Date; end: Date };

type Props = {
  value: DateRange;
  onChange: (range: DateRange) => void;
};

const WEEKDAY_LABELS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTH_LABELS = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

// понедельник = 0 ... воскресенье = 6, чтобы неделя начиналась с Пн
function mondayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

function buildMonthGrid(monthStart: Date): (Date | null)[] {
  const year = monthStart.getFullYear();
  const month = monthStart.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const leading = mondayIndex(new Date(year, month, 1));

  const cells: (Date | null)[] = [];
  for (let i = 0; i < leading; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(new Date(year, month, day));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function PeriodCalendar({ value, onChange }: Props) {
  const theme = useTheme();
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(value.end.getFullYear(), value.end.getMonth(), 1));
  const [pendingStart, setPendingStart] = useState<Date | null>(null);

  const today = startOfDay(new Date());
  const cells = buildMonthGrid(visibleMonth);
  const isCurrentMonth = isSameMonth(visibleMonth, today);

  function handleDayPress(day: Date) {
    if (day.getTime() > today.getTime()) return;

    if (!pendingStart || day.getTime() < pendingStart.getTime()) {
      setPendingStart(day);
      onChange({ start: day, end: day });
      return;
    }

    onChange({ start: pendingStart, end: day });
    setPendingStart(null);
  }

  function changeMonth(delta: number) {
    setVisibleMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => changeMonth(-1)} hitSlop={8}>
          <Ionicons name="chevron-back" size={20} color={theme.text} />
        </Pressable>
        <ThemedText type="smallBold">
          {MONTH_LABELS[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
        </ThemedText>
        <Pressable onPress={() => changeMonth(1)} hitSlop={8} disabled={isCurrentMonth}>
          <Ionicons name="chevron-forward" size={20} color={isCurrentMonth ? theme.textSecondary : theme.text} />
        </Pressable>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_LABELS.map((label) => (
          <ThemedText key={label} type="small" themeColor="textSecondary" style={styles.weekdayCell}>
            {label}
          </ThemedText>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((day, index) => {
          if (!day) return <View key={index} style={styles.dayCell} />;

          const isFuture = day.getTime() > today.getTime();
          const isEdge = isSameDay(day, value.start) || isSameDay(day, value.end);
          const inRange = day.getTime() > value.start.getTime() && day.getTime() < value.end.getTime();

          return (
            <Pressable key={index} style={styles.dayCell} disabled={isFuture} onPress={() => handleDayPress(day)}>
              <View
                style={[
                  styles.dayFill,
                  inRange && { backgroundColor: `${theme.accent}33` },
                  isEdge && { backgroundColor: theme.accent },
                ]}>
                <ThemedText
                  type="small"
                  style={[isFuture && { opacity: 0.35 }, isEdge && { color: theme.onAccent }]}
                  themeColor={isFuture ? 'textSecondary' : undefined}>
                  {day.getDate()}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.two },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.one },
  weekdayRow: { flexDirection: 'row' },
  weekdayCell: { flex: 1, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayCell: { width: `${100 / 7}%`, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayFill: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
});
