import { useRef } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import ViewShot from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { ScreenContainer } from '../../components/ui/ScreenContainer';
import { LunaButton } from '../../components/ui/LunaButton';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { MoonPhaseCard } from '../../components/ui/MoonPhaseCard';
import { StoryShareCard } from '../../components/hoje/StoryShareCard';
import { useQuotes } from '../../hooks/useQuotes';
import { useJornadaProgress } from '../../hooks/useJornadaProgress';
import { getQuoteOfDay } from '../../utils/quoteOfDay';
import { theme } from '../../constants/theme';

export default function HojeScreen() {
  const router = useRouter();
  const { quotes, isLoading: isQuotesLoading } = useQuotes();
  const { week, todayCompleted, isLoading: isJornadaLoading } = useJornadaProgress();
  const storyCardRef = useRef<ViewShot>(null);

  if (isQuotesLoading || isJornadaLoading) {
    return <LoadingSpinner />;
  }

  const completedCount = week.filter((day) => day.completed).length;
  const quoteOfTheDay = getQuoteOfDay(quotes);

  async function handleShareQuote() {
    if (!quoteOfTheDay) return;
    try {
      const uri = await storyCardRef.current?.capture?.();
      if (!uri) return;

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) return;

      await Sharing.shareAsync(uri, { mimeType: 'image/png', dialogTitle: 'Compartilhar frase do dia' });
    } catch {
      // captura/compartilhamento falhou (ex. simulador sem suporte) — não quebra a tela
    }
  }

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
            <Pressable style={styles.shareButton} onPress={handleShareQuote} hitSlop={8}>
              <Ionicons name="share-outline" size={18} color={theme.colors.textSecondary} />
            </Pressable>
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

      {quoteOfTheDay && (
        <View style={styles.offscreenCapture} pointerEvents="none">
          <ViewShot ref={storyCardRef} options={{ format: 'png', quality: 1 }}>
            <StoryShareCard quote={quoteOfTheDay.text} category={quoteOfTheDay.category} />
          </ViewShot>
        </View>
      )}
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
  shareButton: {
    position: 'absolute',
    top: theme.spacing.md,
    right: theme.spacing.md,
  },
  offscreenCapture: {
    position: 'absolute',
    top: 0,
    left: 0,
    opacity: 0,
    zIndex: -1,
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
