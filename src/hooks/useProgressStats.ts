import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useSession } from '../contexts/SessionContext';
import { groupCompletionByDate } from '../utils/dayCompletion';
import type { ActivityEntry } from '../types/database';

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function useProgressStats(): {
  totalDiasPraticados: number;
  sequenciaAtual: number;
  recentActivity: ActivityEntry[];
  isLoading: boolean;
  error: string | null;
} {
  const { session } = useSession();
  const userId = session?.user.id;
  const [totalDiasPraticados, setTotalDiasPraticados] = useState(0);
  const [sequenciaAtual, setSequenciaAtual] = useState(0);
  const [recentActivity, setRecentActivity] = useState<ActivityEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!userId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const [daysResult, activityResult] = await Promise.all([
        supabase
          .from('daily_practice_items')
          .select('check_date, completed')
          .eq('user_id', userId)
          .returns<{ check_date: string; completed: boolean }[]>(),
        supabase
          .from('daily_practice_items')
          .select('check_date, created_at, practices(title)')
          .eq('user_id', userId)
          .eq('completed', true)
          .order('check_date', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(20)
          .returns<{ check_date: string; created_at: string; practices: { title: string } | null }[]>(),
      ]);

      if (!isMounted) return;

      if (daysResult.error || activityResult.error) {
        setError((daysResult.error ?? activityResult.error)?.message ?? 'Erro desconhecido');
        setIsLoading(false);
        return;
      }

      setError(null);

      const completedByDate = groupCompletionByDate(daysResult.data ?? []);
      const completedDates = new Set(
        Array.from(completedByDate.entries())
          .filter(([, completed]) => completed)
          .map(([date]) => date),
      );
      setTotalDiasPraticados(completedDates.size);

      let cursor = new Date();
      if (!completedDates.has(toISODate(cursor))) {
        cursor = addDays(cursor, -1);
      }

      let streak = 0;
      while (completedDates.has(toISODate(cursor))) {
        streak += 1;
        cursor = addDays(cursor, -1);
      }
      setSequenciaAtual(streak);

      setRecentActivity(
        (activityResult.data ?? [])
          .filter((row) => row.practices)
          .map((row) => ({
            checkDate: row.check_date,
            practiceTitle: row.practices!.title,
          })),
      );

      setIsLoading(false);
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return { totalDiasPraticados, sequenciaAtual, recentActivity, isLoading, error };
}
