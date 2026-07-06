import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import type { WeekDay } from '../../types/database';

export function WeekHeaderStrip({ week }: { week: WeekDay[] }) {
  return (
    <View style={styles.row}>
      {week.map((day) => (
        <View key={day.date} style={styles.column}>
          <Text style={styles.label}>{day.dayLabel}</Text>
          <View style={[styles.dot, day.completed ? styles.dotCompleted : styles.dotUpcoming]} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  column: {
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  label: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textSecondary,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotCompleted: {
    backgroundColor: theme.colors.sage,
  },
  dotUpcoming: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.accentBorder,
  },
});
