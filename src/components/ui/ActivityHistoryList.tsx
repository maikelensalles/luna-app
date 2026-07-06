import { Image, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import type { ActivityEntry } from '../../types/database';

const MONTH_NAMES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
];

function formatShortDate(isoDate: string): string {
  const [, month, day] = isoDate.split('-').map(Number);
  return `${day} de ${MONTH_NAMES[month - 1]}`;
}

function groupByDate(items: ActivityEntry[]): { checkDate: string; practiceTitles: string[] }[] {
  const order: string[] = [];
  const titlesByDate = new Map<string, string[]>();

  for (const item of items) {
    if (!titlesByDate.has(item.checkDate)) {
      order.push(item.checkDate);
      titlesByDate.set(item.checkDate, []);
    }
    titlesByDate.get(item.checkDate)!.push(item.practiceTitle);
  }

  return order.map((checkDate) => ({ checkDate, practiceTitles: titlesByDate.get(checkDate)! }));
}

export function ActivityHistoryList({ items }: { items: ActivityEntry[] }) {
  if (items.length === 0) {
    return <Text style={styles.empty}>Nenhuma prática registrada ainda</Text>;
  }

  const groups = groupByDate(items);

  return (
    <View>
      {groups.map((group) => (
        <View key={group.checkDate} style={styles.group}>
          <Text style={styles.dateHeader}>{formatShortDate(group.checkDate)}</Text>
          {group.practiceTitles.map((title, index) => (
            <View key={`${group.checkDate}-${index}`} style={styles.row}>
              <Image
                source={require('../../../assets/icons/icon-check.png')}
                style={styles.checkIcon}
                resizeMode="contain"
              />
              <Text style={styles.practiceTitle}>{title}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  group: {
    marginBottom: theme.spacing.md,
  },
  dateHeader: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  checkIcon: {
    width: 16,
    height: 16,
  },
  practiceTitle: {
    ...theme.typography.body,
    color: theme.colors.textPrimary,
  },
});
