import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { LunaButton } from '../../components/ui/LunaButton';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { MoonPhaseCard } from '../../components/ui/MoonPhaseCard';
import { useQuotes } from '../../hooks/useQuotes';
import { useJornadaProgress } from '../../hooks/useJornadaProgress';
import { theme } from '../../constants/theme';

function getDayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diffMs = date.getTime() - start.getTime();
  return Math.floor(diffMs / 86_400_000);
}

export default function HojeScreen() {
  const router = useRouter();
  const { quotes, isLoading: isQuotesLoading } = useQuotes();
  const { week, todayCompleted, isLoading: isJornadaLoading } = useJornadaProgress();

  if (isQuotesLoading || isJornadaLoading) {
    return <LoadingSpinner />;
  }

  const completedCount = week.filter((day) => day.completed).length;
  const quoteOfTheDay = quotes.length > 0 ? quotes[getDayOfYear(new Date()) % quotes.length] : null;

  return (
    <ScreenContainer>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Image
          source={require('../../../assets/images/luna-mascot.png')}
          style={styles.mascot}
          resizeMode="contain"
        />

        <MoonPhaseCard />

        {quoteOfTheDay && (
          <View style={styles.card}>
            <Ionicons name="sparkles-outline" size={20} color={theme.colors.gold} />
            <Text style={styles.quoteText}>“{quoteOfTheDay.text}”</Text>
            <Text style={styles.quoteCategory}>{quoteOfTheDay.category}</Text>
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sua semana</Text>
          <Text style={styles.cardBody}>{completedCount} de 7 dias esta semana</Text>
          {!todayCompleted && (
            <LunaButton label="Ver práticas" variant="ghost" onPress={() => router.push('/(tabs)/praticas')} />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xl,
  },
  mascot: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.accentBorder,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    ...theme.typography.subheading,
    color: theme.colors.gold,
    marginBottom: theme.spacing.sm,
  },
  cardBody: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  quoteText: {
    ...theme.typography.body,
    fontStyle: 'italic',
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  quoteCategory: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textTransform: 'capitalize',
  },
});
