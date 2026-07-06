import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import { getPracticeIcon } from '../../utils/practiceIcons';
import type { PracticeItem } from '../../types/database';

type PracticeItemCardProps = {
  item: PracticeItem;
  onPress?: () => void;
  isDoneToday?: boolean;
};

export function PracticeItemCard({ item, onPress, isDoneToday = false }: PracticeItemCardProps) {
  const content = (
    <View style={[styles.row, isDoneToday && styles.rowDone]}>
      <Image source={getPracticeIcon(item)} style={styles.categoryIcon} resizeMode="contain" />
      <View style={styles.texts}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.meta}>
          {item.category} · {item.durationMinutes} min
        </Text>
      </View>
      {isDoneToday && (
        <Image
          source={require('../../../assets/icons/icon-check.png')}
          style={styles.checkIcon}
          resizeMode="contain"
        />
      )}
    </View>
  );

  if (!onPress) {
    return content;
  }

  return (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.pressed}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.accentBorder,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  rowDone: {
    borderColor: theme.colors.accent,
  },
  pressed: {
    opacity: 0.8,
  },
  texts: {
    flex: 1,
  },
  title: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
  meta: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
  },
  categoryIcon: {
    width: 24,
    height: 24,
  },
  checkIcon: {
    width: 20,
    height: 20,
  },
});
