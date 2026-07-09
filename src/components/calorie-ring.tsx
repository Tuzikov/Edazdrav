import { View } from 'react-native';
import { Circle, Svg } from 'react-native-svg';

import { ThemedText } from '@/components/themed-text';

type Props = {
  consumed: number;
  goal: number;
  size?: number;
  strokeWidth?: number;
  color: string;
  trackColor: string;
};

export function CalorieRing({ consumed, goal, size = 200, strokeWidth = 16, color, trackColor }: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = goal > 0 ? Math.min(consumed / goal, 1) : 0;
  const dashOffset = circumference * (1 - progress);
  const center = size / 2;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={center} cy={center} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          fill="none"
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <ThemedText type="title" style={{ fontSize: 36, lineHeight: 40 }}>
          {Math.round(consumed)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          из {goal} ккал
        </ThemedText>
      </View>
    </View>
  );
}
