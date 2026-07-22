import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import { useSession } from '../contexts/SessionContext';
import { recomputeNotifications } from '../utils/notifications';

export function useDailyNotifications(): void {
  const { session } = useSession();
  const userId = session?.user.id;

  const recompute = useCallback(() => {
    if (!userId) return;
    recomputeNotifications(userId);
  }, [userId]);

  useEffect(() => {
    recompute();
  }, [recompute]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') recompute();
    });
    return () => subscription.remove();
  }, [recompute]);
}
