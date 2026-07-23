import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { formatRelativeTime } from '@utils/date';
import { colors, spacing, typography } from '../../theme';

interface SyncStatusBarProps {
  lastRefresh: string | null;
  loading: boolean;
}

/**
 * Requirement 4.5: last refreshed time + loading state during background
 * refresh. Deliberately does NOT show the offline indicator itself (that's
 * OfflineBanner's job) — keeping these as two small components instead of
 * one big "sync header" makes each one trivial to reason about and test in
 * isolation.
 */
function SyncStatusBar({ lastRefresh, loading }: SyncStatusBarProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        Last synced {formatRelativeTime(lastRefresh)}
      </Text>
      {loading && <ActivityIndicator size="small" color={colors.primary} />}
    </View>
  );
}

export default React.memo(SyncStatusBar);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  text: {
    color: colors.textMuted,
    fontSize: typography.small,
  },
});
