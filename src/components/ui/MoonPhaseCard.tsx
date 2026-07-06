import { Image, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../constants/theme';
import { getMoonPhase, PHASE_ICONS } from '../../utils/moonPhase';

export function MoonPhaseCard({ date }: { date?: Date }) {
  const { phase, label, description } = getMoonPhase(date ?? new Date());

  return (
    <View style={styles.card}>
      <View style={styles.texts}>
        <Text style={styles.eyebrow}>Fase Atual</Text>
        <Text style={styles.phaseLabel}>{label}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Image source={PHASE_ICONS[phase]} style={styles.icon} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radii.lg,
    borderWidth: 1,
    borderColor: theme.colors.accentBorder,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  texts: {
    flex: 1,
  },
  eyebrow: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  phaseLabel: {
    ...theme.typography.subheading,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  icon: {
    width: 72,
    height: 72,
  },
});
