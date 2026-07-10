import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useProfile, type NutritionGoals } from '@/context/profile-context';
import { useTheme } from '@/hooks/use-theme';
import { ACTIVITY_LEVELS, calculateGoals, type ActivityLevel, type Sex } from '@/lib/goal-calculator';

const FIELDS: { key: keyof NutritionGoals; label: string; unit: string }[] = [
  { key: 'calories', label: 'Калории', unit: 'ккал/день' },
  { key: 'protein', label: 'Белки', unit: 'г' },
  { key: 'fat', label: 'Жиры', unit: 'г' },
  { key: 'carbs', label: 'Углеводы', unit: 'г' },
  { key: 'fiber', label: 'Клетчатка', unit: 'г' },
];

function stringifyGoals(goals: NutritionGoals): Record<string, string> {
  return Object.fromEntries(FIELDS.map((field) => [field.key, String(goals[field.key])]));
}

export default function ProfileScreen() {
  const { goals, updateGoals } = useProfile();
  const theme = useTheme();
  const [draft, setDraft] = useState<Record<string, string>>(() => stringifyGoals(goals));
  const [syncedGoals, setSyncedGoals] = useState(goals);

  const [sex, setSex] = useState<Sex>('female');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState<ActivityLevel>('sedentary');

  if (goals !== syncedGoals) {
    setSyncedGoals(goals);
    setDraft(stringifyGoals(goals));
  }

  const ageNum = Number(age);
  const weightNum = Number(weight);
  const heightNum = Number(height);
  const canCalculate = ageNum > 0 && weightNum > 0 && heightNum > 0;

  function handleCalculate() {
    if (!canCalculate) return;
    const calculated = calculateGoals({ sex, age: ageNum, weightKg: weightNum, heightCm: heightNum, activity });
    setDraft(stringifyGoals(calculated));
  }

  function handleSave() {
    const next = { ...goals };
    for (const field of FIELDS) {
      const parsed = Number(draft[field.key]);
      if (!Number.isNaN(parsed) && parsed > 0) {
        next[field.key] = parsed;
      }
    }
    updateGoals(next);
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <ThemedText type="title" style={styles.pageTitle}>
            Профиль
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
            Дневные цели по калориям и нутриентам. Можно изменить в любой момент.
          </ThemedText>

          <ThemedView type="backgroundElement" style={styles.calculatorCard}>
            <ThemedText type="smallBold">Быстрый расчёт целей</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              Заполните параметры — рассчитаем цели и подставим их в поля ниже, а вы сможете поправить вручную.
            </ThemedText>

            <View style={styles.sexRow}>
              {(
                [
                  { key: 'female', label: 'Женский' },
                  { key: 'male', label: 'Мужской' },
                ] as const
              ).map((option) => {
                const selected = sex === option.key;
                return (
                  <Pressable
                    key={option.key}
                    onPress={() => setSex(option.key)}
                    style={[
                      styles.pill,
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

            <View style={styles.calcInputsRow}>
              <View style={styles.calcInputGroup}>
                <ThemedText type="small" themeColor="textSecondary">
                  Возраст
                </ThemedText>
                <TextInput
                  style={[styles.calcInput, { color: theme.text, borderColor: theme.textSecondary }]}
                  keyboardType="numeric"
                  value={age}
                  onChangeText={setAge}
                  placeholder="лет"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.calcInputGroup}>
                <ThemedText type="small" themeColor="textSecondary">
                  Вес
                </ThemedText>
                <TextInput
                  style={[styles.calcInput, { color: theme.text, borderColor: theme.textSecondary }]}
                  keyboardType="numeric"
                  value={weight}
                  onChangeText={setWeight}
                  placeholder="кг"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
              <View style={styles.calcInputGroup}>
                <ThemedText type="small" themeColor="textSecondary">
                  Рост
                </ThemedText>
                <TextInput
                  style={[styles.calcInput, { color: theme.text, borderColor: theme.textSecondary }]}
                  keyboardType="numeric"
                  value={height}
                  onChangeText={setHeight}
                  placeholder="см"
                  placeholderTextColor={theme.textSecondary}
                />
              </View>
            </View>

            <ThemedText type="small" themeColor="textSecondary" style={styles.activityLabel}>
              Уровень активности
            </ThemedText>
            <View style={styles.activityList}>
              {ACTIVITY_LEVELS.map((level) => {
                const selected = activity === level.key;
                return (
                  <Pressable key={level.key} style={styles.activityRow} onPress={() => setActivity(level.key)}>
                    <View
                      style={[
                        styles.radio,
                        { borderColor: theme.textSecondary },
                        selected && { borderColor: theme.text },
                      ]}>
                      {selected ? <View style={[styles.radioDot, { backgroundColor: theme.text }]} /> : null}
                    </View>
                    <ThemedText type="small" style={styles.activityText}>
                      {level.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              style={[styles.calculateButton, !canCalculate && styles.saveButtonDisabled]}
              onPress={handleCalculate}
              disabled={!canCalculate}>
              <ThemedText type="smallBold" style={styles.saveButtonText}>
                Рассчитать и заполнить
              </ThemedText>
            </Pressable>
          </ThemedView>

          <View style={styles.form}>
            {FIELDS.map((field) => (
              <View key={field.key} style={styles.row}>
                <ThemedText type="default">{field.label}</ThemedText>
                <View style={styles.inputWrap}>
                  <TextInput
                    style={[styles.input, { color: theme.text, borderColor: theme.textSecondary }]}
                    keyboardType="numeric"
                    value={draft[field.key] ?? ''}
                    onChangeText={(text) => setDraft((prev) => ({ ...prev, [field.key]: text }))}
                  />
                  <ThemedText type="small" themeColor="textSecondary">
                    {field.unit}
                  </ThemedText>
                </View>
              </View>
            ))}
          </View>
          <Pressable style={styles.saveButton} onPress={handleSave}>
            <ThemedText type="smallBold" style={styles.saveButtonText}>
              Сохранить
            </ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three },
  scrollContent: { paddingBottom: Spacing.six },
  pageTitle: { fontSize: 28, lineHeight: 34, paddingTop: Spacing.two },
  hint: { marginTop: Spacing.one, marginBottom: Spacing.three },
  calculatorCard: {
    borderRadius: Spacing.three,
    padding: Spacing.three,
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  sexRow: { flexDirection: 'row', gap: Spacing.two },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
  },
  calcInputsRow: { flexDirection: 'row', gap: Spacing.two },
  calcInputGroup: { flex: 1, gap: Spacing.one },
  calcInput: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    textAlign: 'center',
  },
  activityLabel: { marginTop: Spacing.one },
  activityList: { gap: Spacing.two },
  activityRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: { width: 10, height: 10, borderRadius: 5 },
  activityText: { flex: 1 },
  calculateButton: {
    backgroundColor: '#3c87f7',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  form: { gap: Spacing.three },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    width: 80,
    textAlign: 'right',
  },
  saveButton: {
    marginTop: Spacing.four,
    backgroundColor: '#3c87f7',
    borderRadius: Spacing.two,
    paddingVertical: Spacing.three,
    alignItems: 'center',
  },
  saveButtonDisabled: { opacity: 0.5 },
  saveButtonText: { color: '#fff' },
});
