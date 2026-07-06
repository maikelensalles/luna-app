import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { Practice, PracticeItem } from '../types/database';

function toPracticeItem(row: Practice): PracticeItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    durationMinutes: row.duration_minutes,
    description: row.description,
  };
}

export function usePraticas(): {
  practices: PracticeItem[];
  isLoading: boolean;
  error: string | null;
} {
  const [practices, setPractices] = useState<PracticeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      const { data, error: queryError } = await supabase
        .from('practices')
        .select('*')
        .order('created_at')
        .returns<Practice[]>();

      if (!isMounted) return;

      if (queryError) {
        setError(queryError.message);
      } else {
        setError(null);
        setPractices((data ?? []).map(toPracticeItem));
      }
      setIsLoading(false);
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { practices, isLoading, error };
}
