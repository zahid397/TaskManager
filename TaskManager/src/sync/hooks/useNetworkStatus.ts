import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useTaskStore } from '@tasks/store/taskStore';

/**
 * Subscribes to NetInfo and mirrors connectivity into the task store's
 * `onlineStatus`. Mounted once near the app root (see App.tsx) so every
 * screen can read `onlineStatus` from the store without each one needing
 * its own NetInfo subscription.
 *
 * `isConnected` can briefly be `null` while NetInfo is still determining
 * initial state — treated as `false` (show the offline banner) rather than
 * `true`, since assuming connectivity we don't actually have yet is the
 * riskier default (it's what would let a doomed network request slip
 * through instead of gracefully falling back to cache).
 */
export function useNetworkStatus(): void {
  const syncStatus = useTaskStore(state => state.syncStatus);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      syncStatus({ onlineStatus: state.isConnected === true });
    });

    return () => {
      unsubscribe();
    };
  }, [syncStatus]);
}
