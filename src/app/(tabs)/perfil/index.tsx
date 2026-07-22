import { useEffect, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { ScreenContainer } from '../../../components/ui/ScreenContainer';
import { LunaButton } from '../../../components/ui/LunaButton';
import { LunaTextInput } from '../../../components/ui/LunaTextInput';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ActivityHistoryList } from '../../../components/ui/ActivityHistoryList';
import { useSession } from '../../../contexts/SessionContext';
import { useProfile } from '../../../hooks/useProfile';
import { useProgressStats } from '../../../hooks/useProgressStats';
import { timeStringToDate, dateToTimeString, recomputeNotifications } from '../../../utils/notifications';
import { theme } from '../../../constants/theme';

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

function formatMemberSince(isoDate: string): string {
  const date = new Date(isoDate);
  return `Membro desde ${MONTH_NAMES[date.getMonth()]} de ${date.getFullYear()}`;
}

export default function PerfilScreen() {
  const { session, signOut } = useSession();
  const {
    profile,
    isLoading: isProfileLoading,
    error: profileError,
    updateDisplayName,
    uploadAvatar,
    updateNotificationSettings,
  } = useProfile();
  const {
    totalDiasPraticados,
    sequenciaAtual,
    recentActivity,
    isLoading: isStatsLoading,
    error: statsError,
  } = useProgressStats();
  const [displayName, setDisplayName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showReminderPicker, setShowReminderPicker] = useState(false);
  const [showQuotePicker, setShowQuotePicker] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.displayName ?? '');
  }, [profile?.displayName]);

  if (isProfileLoading || isStatsLoading) {
    return <LoadingSpinner />;
  }

  const error = profileError ?? statsError;

  async function handleAvatarPress() {
    if (isUploading) return;
    setIsUploading(true);
    await uploadAvatar();
    setIsUploading(false);
  }

  async function handleReminderToggle(value: boolean) {
    await updateNotificationSettings({ reminderEnabled: value });
    if (session?.user.id) recomputeNotifications(session.user.id);
  }

  async function handleReminderTimeChange(selectedDate: Date | undefined) {
    setShowReminderPicker(false);
    if (!selectedDate) return;
    await updateNotificationSettings({ reminderTime: dateToTimeString(selectedDate) });
    if (session?.user.id) recomputeNotifications(session.user.id);
  }

  async function handleQuoteToggle(value: boolean) {
    await updateNotificationSettings({ quoteNotificationEnabled: value });
    if (session?.user.id) recomputeNotifications(session.user.id);
  }

  async function handleQuoteTimeChange(selectedDate: Date | undefined) {
    setShowQuotePicker(false);
    if (!selectedDate) return;
    await updateNotificationSettings({ quoteNotificationTime: dateToTimeString(selectedDate) });
    if (session?.user.id) recomputeNotifications(session.user.id);
  }

  return (
    <ScreenContainer>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {error && <Text style={styles.errorText}>Não foi possível carregar seu perfil.</Text>}

        <Pressable style={styles.avatarWrapper} onPress={handleAvatarPress} disabled={isUploading}>
        <Image
          source={
            profile?.avatarUrl
              ? { uri: profile.avatarUrl }
              : require('../../../../assets/images/luna-icon.png')
          }
          style={styles.avatar}
          resizeMode="cover"
        />
        <View style={styles.cameraBadge}>
          <Ionicons name="camera" size={16} color={theme.colors.background} />
        </View>
      </Pressable>

      <LunaTextInput
        label="Nome de exibição"
        value={displayName}
        onChangeText={setDisplayName}
        onBlur={() => updateDisplayName(displayName.trim())}
        placeholder="Como você quer ser chamada?"
      />

      <View style={styles.card}>
        <Text style={styles.label}>Membro desde</Text>
        <Text style={styles.value}>
          {session?.user?.created_at ? formatMemberSince(session.user.created_at) : '—'}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Seu progresso</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{totalDiasPraticados}</Text>
            <Text style={styles.statCaption}>dias praticados</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{sequenciaAtual}</Text>
            <Text style={styles.statCaption}>dias de sequência atual</Text>
          </View>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Histórico</Text>
        <ActivityHistoryList items={recentActivity} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Notificações</Text>

        <View style={styles.notificationRow}>
          <View style={styles.notificationRowText}>
            <Text style={styles.notificationRowTitle}>Lembrete diário</Text>
            <Text style={styles.notificationRowSubtitle}>
              {profile?.reminderEnabled ? `Às ${profile.reminderTime}` : 'Desligado'}
            </Text>
          </View>
          <Switch value={profile?.reminderEnabled ?? false} onValueChange={handleReminderToggle} />
        </View>
        {profile?.reminderEnabled && (
          <Pressable onPress={() => setShowReminderPicker(true)}>
            <Text style={styles.timeButton}>{profile.reminderTime}</Text>
          </Pressable>
        )}
        {showReminderPicker && (
          <DateTimePicker
            value={timeStringToDate(profile?.reminderTime ?? '08:00')}
            mode="time"
            onChange={(_event, selectedDate) => handleReminderTimeChange(selectedDate)}
          />
        )}

        <View style={styles.notificationRow}>
          <View style={styles.notificationRowText}>
            <Text style={styles.notificationRowTitle}>Frase do dia</Text>
            <Text style={styles.notificationRowSubtitle}>
              {profile?.quoteNotificationEnabled ? `Às ${profile.quoteNotificationTime}` : 'Desligado'}
            </Text>
          </View>
          <Switch value={profile?.quoteNotificationEnabled ?? false} onValueChange={handleQuoteToggle} />
        </View>
        {profile?.quoteNotificationEnabled && (
          <Pressable onPress={() => setShowQuotePicker(true)}>
            <Text style={styles.timeButton}>{profile.quoteNotificationTime}</Text>
          </Pressable>
        )}
        {showQuotePicker && (
          <DateTimePicker
            value={timeStringToDate(profile?.quoteNotificationTime ?? '09:00')}
            mode="time"
            onChange={(_event, selectedDate) => handleQuoteTimeChange(selectedDate)}
          />
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{session?.user?.email}</Text>
      </View>

        <LunaButton label="Sair" variant="ghost" onPress={signOut} />
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
  errorText: {
    ...theme.typography.body,
    color: theme.colors.danger,
    marginBottom: theme.spacing.md,
  },
  avatarWrapper: {
    alignSelf: 'center',
    width: 96,
    height: 96,
    borderRadius: 48,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: theme.colors.background,
  },
  card: {
    backgroundColor: theme.colors.backgroundElevated,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.accentBorder,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },
  label: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
    marginBottom: theme.spacing.xs,
  },
  value: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.xl,
  },
  statItem: {
    alignItems: 'flex-start',
  },
  statNumber: {
    ...theme.typography.heading,
    color: theme.colors.accent,
  },
  statCaption: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  notificationRowText: {
    flex: 1,
    marginRight: theme.spacing.md,
  },
  notificationRowTitle: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.body.fontSize,
  },
  notificationRowSubtitle: {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.caption.fontSize,
  },
  timeButton: {
    ...theme.typography.subheading,
    color: theme.colors.accent,
    marginBottom: theme.spacing.md,
  },
});
