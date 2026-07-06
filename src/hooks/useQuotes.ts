import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import type { Quote } from '../types/database';

export function useQuotes(): { quotes: Quote[]; isLoading: boolean; error: string | null } {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      const { data, error: queryError } = await supabase.from('quotes').select('*').returns<Quote[]>();

      if (!isMounted) return;

      if (queryError) {
        setError(queryError.message);
      } else {
        setError(null);
        setQuotes(data ?? []);
      }
      setIsLoading(false);
    }

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return { quotes, isLoading, error };
}
