import { ScrollView, StyleSheet, Text } from 'react-native';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { WeekHeaderStrip } from '../../../components/jornada/WeekHeaderStrip';
import { TodayPracticeTrail } from '../../../components/jornada/TodayPracticeTrail';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { useJornadaProgress } from '../../../hooks/useJornadaProgress';
import { useTodayJourney } from '../../../hooks/useTodayJourney';
import { theme } from '../../../constants/theme';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function JornadaScreen() {
  const { week, isLoading: isWeekLoading, error: weekError } = useJornadaProgress();
  const {
    items,
    allCompletedToday,
    isLoading: isTodayLoading,
    error: todayError,
    toggleItem,
  } = useTodayJourney();

  if (isWeekLoading || isTodayLoading) {
    return <LoadingSpinner />;
  }

  const today = todayISO();
  const weekWithToday = week.map((day) => (day.date === today ? { ...day, completed: allCompletedToday } : day));
  const error = weekError ?? todayError;

  return (
    <ScreenContainer>
      {error && <Text style={styles.error}>Não foi possível carregar sua jornada.</Text>}

      <WeekHeaderStrip week={weekWithToday} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <TodayPracticeTrail items={items} allCompletedToday={allCompletedToday} onToggleItem={toggleItem} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  error: {
    ...theme.typography.body,
    color: theme.colors.danger,
    marginBottom: theme.spacing.md,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.lg,
  },
});
