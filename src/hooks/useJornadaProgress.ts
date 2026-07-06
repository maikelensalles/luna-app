import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../services/supabase';
import { useSession } from '../contexts/SessionContext';
import { groupCompletionByDate } from '../utils/dayCompletion';
import type { WeekDay } from '../types/database';

const DAY_LABELS = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

function toISODate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getWeekDates(reference: Date): Date[] {
  const day = reference.getDay(); // 0 = domingo ... 6 = sábado
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const monday = new Date(reference);
  monday.setDate(reference.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return date;
  });
}

export function useJornadaProgress(): {
  week: WeekDay[];
  todayCompleted: boolean;
  isLoading: boolean;
  error: string | null;
} {
  const { session } = useSession();
  const userId = session?.user.id;
  const [week, setWeek] = useState<WeekDay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const weekDates = getWeekDates(new Date());
    const monday = toISODate(weekDates[0]);
    const sunday = toISODate(weekDates[6]);

    if (!userId) {
      if (requestId === requestIdRef.current) {
        setWeek(weekDates.map((date, i) => ({ date: toISODate(date), dayLabel: DAY_LABELS[i], completed: false })));
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    const { data, error: queryError } = await supabase
      .from('daily_practice_items')
      .select('check_date, completed')
      .eq('user_id', userId)
      .gte('check_date', monday)
      .lte('check_date', sunday)
      .returns<{ check_date: string; completed: boolean }[]>();

    if (requestId !== requestIdRef.current) return;

    if (queryError) {
      console.error('useJornadaProgress error:', JSON.stringify(queryError, null, 2));
      setError(queryError.message);
    } else {
      setError(null);
      const completedByDate = groupCompletionByDate(data ?? []);

      setWeek(
        weekDates.map((date, i) => {
          const isoDate = toISODate(date);
          return { date: isoDate, dayLabel: DAY_LABELS[i], completed: completedByDate.get(isoDate) ?? false };
        }),
      );
    }
    setIsLoading(false);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  const todayISO = toISODate(new Date());
  const todayCompleted = week.find((day) => day.date === todayISO)?.completed ?? false;

  return { week, todayCompleted, isLoading, error };
}
