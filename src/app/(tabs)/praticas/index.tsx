import { useState } from 'react';
import { FlatList, StyleSheet, Text } from 'react-native';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { PracticeItemCard } from '../../../components/praticas/PracticeItemCard';
import { PracticeDetailModal } from '../../../components/praticas/PracticeDetailModal';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { usePraticas } from '../../../hooks/usePraticas';
import { useTodayJourney } from '../../../hooks/useTodayJourney';
import { theme } from '../../../constants/theme';
import type { PracticeItem } from '../../../types/database';

export default function PraticasScreen() {
  const { practices, isLoading: isPraticasLoading, error } = usePraticas();
  const { items, addPractice, removePractice, isLoading: isJourneyLoading } = useTodayJourney();
  const [selectedPractice, setSelectedPractice] = useState<PracticeItem | null>(null);

  if (isPraticasLoading || isJourneyLoading) {
    return <LoadingSpinner />;
  }

  function isDoneToday(practiceId: string): boolean {
    return !!items.find((item) => item.practiceId === practiceId)?.completed;
  }

  function isInToday(practiceId: string): boolean {
    return !!items.find((item) => item.practiceId === practiceId);
  }

  function handleRemovePractice(practiceId: string) {
    const item = items.find((i) => i.practiceId === practiceId);
    return item ? removePractice(item.id) : Promise.resolve({ error: null });
  }

  return (
    <ScreenContainer>
      {error && <Text style={styles.error}>Não foi possível carregar as práticas.</Text>}
      <FlatList
        data={practices}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PracticeItemCard
            item={item}
            isDoneToday={isDoneToday(item.id)}
            onPress={() => setSelectedPractice(item)}
          />
        )}
        contentContainerStyle={styles.list}
      />
      <PracticeDetailModal
        practice={selectedPractice}
        isInToday={selectedPractice ? isInToday(selectedPractice.id) : false}
        onClose={() => setSelectedPractice(null)}
        onAddPractice={addPractice}
        onRemovePractice={handleRemovePractice}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  error: {
    ...theme.typography.body,
    color: theme.colors.danger,
    marginBottom: theme.spacing.md,
  },
  list: {
    paddingTop: theme.spacing.lg,
    paddingBottom: 100,
  },
});
