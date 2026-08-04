import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Props = {
  label: string;
  consumed: number;
  goal: number;
  unit?: string;
  color: string;
};

export function MacroCard({ label, consumed, goal, unit = 'г', color }: Props) {
  const theme = useTheme();
  const progress = goal > 0 ? Math.min(consumed / goal, 1) : 0;

  return (
    <ThemedView type="backgroundElement" style={styles.card}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {Math.round(consumed)} / {Math.round(goal)} {unit}
      </ThemedText>
      <View style={[styles.track, { backgroundColor: `${theme.text}3D` }]}>
        <View style={[styles.fill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: '48%',
    borderRadius: 20,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 3,
  },
});
