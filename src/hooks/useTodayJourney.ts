import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useSession } from '../contexts/SessionContext';
import type { DailyPracticeItem, Practice } from '../types/database';

const DEFAULT_PRACTICE_TITLES = ['Yoga', 'Meditação'];

type JourneyItem = DailyPracticeItem & { practices: Practice };

type DailyPracticeItemRow = {
  id: string;
  user_id: string;
  practice_id: string;
  check_date: string;
  completed: boolean;
  is_default: boolean;
  practices: Practice;
};

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function toJourneyItem(row: DailyPracticeItemRow): JourneyItem {
  return {
    id: row.id,
    userId: row.user_id,
    practiceId: row.practice_id,
    checkDate: row.check_date,
    completed: row.completed,
    isDefault: row.is_default,
    practices: row.practices,
  };
}

export function useTodayJourney(): {
  items: JourneyItem[];
  allCompletedToday: boolean;
  isLoading: boolean;
  error: string | null;
  addPractice: (practiceId: string) => Promise<{ error: string | null }>;
  removePractice: (itemId: string) => Promise<{ error: string | null }>;
  toggleItem: (itemId: string) => Promise<void>;
} {
  const { session } = useSession();
  const userId = session?.user.id;
  const [items, setItems] = useState<JourneyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    if (!userId) {
      if (requestId === requestIdRef.current) setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const todayISO = toISODate(new Date());

    const { data, error: queryError } = await supabase
      .from('daily_practice_items')
      .select('*, practices(*)')
      .eq('user_id', userId)
      .eq('check_date', todayISO)
      .order('created_at', { ascending: true })
      .returns<DailyPracticeItemRow[]>();

    if (requestId !== requestIdRef.current) return;

    if (queryError) {
      setError(queryError.message);
      setIsLoading(false);
      return;
    }

    if ((data ?? []).length > 0) {
      setError(null);
      setItems(data.map(toJourneyItem));
      setIsLoading(false);
      return;
    }

    const { data: defaults, error: defaultsError } = await supabase
      .from('practices')
      .select('id, title')
      .in('title', DEFAULT_PRACTICE_TITLES);

    if (requestId !== requestIdRef.current) return;

    if (defaultsError) {
      setError(defaultsError.message);
      setIsLoading(false);
      return;
    }

    if (defaults && defaults.length > 0) {
      const rows = defaults.map((practice) => ({
        user_id: userId,
        practice_id: practice.id,
        check_date: todayISO,
        completed: false,
        is_default: true,
      }));

      const { error: seedError } = await supabase
        .from('daily_practice_items')
        .upsert(rows, { onConflict: 'user_id,check_date,practice_id', ignoreDuplicates: true });

      if (requestId !== requestIdRef.current) return;

      if (seedError) {
        setError(seedError.message);
        setIsLoading(false);
        return;
      }
    }

    const { data: seeded, error: reloadError } = await supabase
      .from('daily_practice_items')
      .select('*, practices(*)')
      .eq('user_id', userId)
      .eq('check_date', todayISO)
      .order('created_at', { ascending: true })
      .returns<DailyPracticeItemRow[]>();

    if (requestId !== requestIdRef.current) return;

    if (reloadError) {
      setError(reloadError.message);
      setIsLoading(false);
      return;
    }

    setError(null);
    setItems((seeded ?? []).map(toJourneyItem));
    setIsLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const addPractice = useCallback(
    async (practiceId: string): Promise<{ error: string | null }> => {
      if (!userId) return { error: 'Sessão inválida.' };

      const todayISO = toISODate(new Date());
      const { error: upsertError } = await supabase.from('daily_practice_items').upsert(
        { user_id: userId, practice_id: practiceId, check_date: todayISO, completed: false },
        { onConflict: 'user_id,check_date,practice_id', ignoreDuplicates: true },
      );

      if (upsertError) {
        setError(upsertError.message);
        return { error: upsertError.message };
      }

      await load();
      return { error: null };
    },
    [userId, load],
  );

  const removePractice = useCallback(
    async (itemId: string): Promise<{ error: string | null }> => {
      const { error: deleteError } = await supabase.from('daily_practice_items').delete().eq('id', itemId);

      if (deleteError) {
        setError(deleteError.message);
        return { error: deleteError.message };
      }

      await load();
      return { error: null };
    },
    [load],
  );

  const toggleItem = useCallback(
    async (itemId: string) => {
      const current = items.find((item) => item.id === itemId);
      if (!current) return;

      const { error: updateError } = await supabase
        .from('daily_practice_items')
        .update({ completed: !current.completed })
        .eq('id', itemId);

      if (updateError) {
        setError(updateError.message);
        return;
      }

      await load();
    },
    [items, load],
  );

  const allCompletedToday = items.length > 0 && items.every((item) => item.completed);

  return { items, allCompletedToday, isLoading, error, addPractice, removePractice, toggleItem };
}
