import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { LunaButton } from '../ui/LunaButton';
import { theme } from '../../constants/theme';
import type { PracticeItem } from '../../types/database';

type PracticeDetailModalProps = {
  practice: PracticeItem | null;
  isInToday: boolean;
  onClose: () => void;
  onAddPractice: (practiceId: string) => Promise<unknown>;
  onRemovePractice: (practiceId: string) => Promise<unknown>;
};

export function PracticeDetailModal({
  practice,
  isInToday,
  onClose,
  onAddPractice,
  onRemovePractice,
}: PracticeDetailModalProps) {
  const router = useRouter();

  if (!practice) {
    return null;
  }

  async function handleAdd() {
    await onAddPractice(practice!.id);
    onClose();
    router.push('/(tabs)/jornada');
  }

  async function handleRemove() {
    await onRemovePractice(practice!.id);
    onClose();
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}>
          <Text style={styles.title}>{practice.title}</Text>
          <Text style={styles.meta}>
            {practice.category} · {practice.durationMinutes} min
          </Text>
          <Text style={styles.description}>
            {practice.description ?? `Uma prática de ${practice.category} para o seu dia.`}
          </Text>
          {isInToday ? (
            <LunaButton label="Remover da Jornada" variant="ghost" onPress={handleRemove} />
          ) : (
            <LunaButton label="Adicionar à Jornada" onPress={handleAdd} />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sheet: {
    backgroundColor: theme.colors.backgroundElevated,
    borderTopLeftRadius: theme.radii.lg,
    borderTopRightRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.accentBorder,
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.subheading,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  meta: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
});
