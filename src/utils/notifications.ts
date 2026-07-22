import * as Notifications from 'expo-notifications';
import { supabase } from '../services/supabase';
import { groupCompletionByDate } from './dayCompletion';
import { getQuoteOfDay } from './quoteOfDay';
import type { Quote } from '../types/database';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermission(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;

  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export function timeStringToDate(time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

export function dateToTimeString(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function getNextOccurrence(time: string): Date {
  const target = timeStringToDate(time);
  if (target.getTime() <= Date.now()) {
    target.setDate(target.getDate() + 1);
  }
  return target;
}

type RescheduleParams = {
  reminderEnabled: boolean;
  reminderTime: string;
  alreadyPracticedToday: boolean;
  quoteEnabled: boolean;
  quoteTime: string;
  quoteText: string | null;
};

export async function rescheduleNotifications(params: RescheduleParams): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();

  if (params.reminderEnabled && !params.alreadyPracticedToday) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Hora de praticar',
        body: 'Pegue o tapete — sua prática de hoje está esperando.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: getNextOccurrence(params.reminderTime),
      },
    });
  }

  if (params.quoteEnabled && params.quoteText) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Frase do dia',
        body: params.quoteText,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: getNextOccurrence(params.quoteTime),
      },
    });
  }
}

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

type ProfileNotificationRow = {
  reminder_enabled: boolean;
  reminder_time: string;
  quote_notification_enabled: boolean;
  quote_notification_time: string;
};

/**
 * Busca as configurações e o estado do dia direto do Supabase (sem depender de
 * nenhum hook de tela) e reagenda — usada tanto pelo listener de AppState quanto
 * logo após o usuário salvar uma configuração em Perfil, garantindo dado fresco
 * mesmo sem um cache global entre instâncias de hook.
 */
export async function recomputeNotifications(userId: string): Promise<void> {
  const todayISO = toISODate(new Date());

  const [{ data: profileRow }, { data: todayRows }, { data: quotes }] = await Promise.all([
    supabase
      .from('profiles')
      .select('reminder_enabled, reminder_time, quote_notification_enabled, quote_notification_time')
      .eq('id', userId)
      .maybeSingle<ProfileNotificationRow>(),
    supabase
      .from('daily_practice_items')
      .select('check_date, completed')
      .eq('user_id', userId)
      .eq('check_date', todayISO)
      .returns<{ check_date: string; completed: boolean }[]>(),
    supabase.from('quotes').select('*').returns<Quote[]>(),
  ]);

  if (!profileRow) return;

  const granted = await requestNotificationPermission();
  if (!granted) return;

  const completedByDate = groupCompletionByDate(todayRows ?? []);

  await rescheduleNotifications({
    reminderEnabled: profileRow.reminder_enabled,
    reminderTime: profileRow.reminder_time,
    alreadyPracticedToday: completedByDate.get(todayISO) ?? false,
    quoteEnabled: profileRow.quote_notification_enabled,
    quoteTime: profileRow.quote_notification_time,
    quoteText: getQuoteOfDay(quotes ?? [])?.text ?? null,
  });
}
