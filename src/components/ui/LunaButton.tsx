import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../../constants/theme';

type LunaButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'ghost';
  isLoading?: boolean;
  disabled?: boolean;
};

export function LunaButton({
  label,
  onPress,
  variant = 'primary',
  isLoading = false,
  disabled = false,
}: LunaButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' ? styles.primary : styles.ghost,
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'primary' ? theme.colors.background : theme.colors.gold} />
      ) : (
        <Text style={variant === 'primary' ? styles.primaryLabel : styles.ghostLabel}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: theme.radii.pill,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: theme.colors.accent,
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.accentBorder,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
  primaryLabel: {
    color: theme.colors.background,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '700',
  },
  ghostLabel: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
  },
});
