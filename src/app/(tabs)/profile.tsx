import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useProfile, type NutritionGoals } from '@/context/profile-context';
import { useTheme } from '@/hooks/use-theme';

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

  if (goals !== syncedGoals) {
    setSyncedGoals(goals);
    setDraft(stringifyGoals(goals));
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
        <ThemedText type="title" style={styles.pageTitle}>
          Профиль
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
          Дневные цели по калориям и нутриентам. Можно изменить в любой момент.
        </ThemedText>
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
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.three },
  pageTitle: { fontSize: 28, lineHeight: 34, paddingTop: Spacing.two },
  hint: { marginTop: Spacing.one, marginBottom: Spacing.three },
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
  saveButtonText: { color: '#fff' },
});
