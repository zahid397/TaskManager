import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../../theme';

interface ErrorBannerProps {
  message: string | null;
}

/**
 * Requirement 4.2: "if the write fails, show an error and leave the cache
 * untouched." This is the visible half of that contract — the untouched-cache
 * half lives in the screens' catch blocks (they deliberately do not call
 * setTasks/setTasksCache on failure).
 */
function ErrorBanner({ message }: ErrorBannerProps) {
  if (!message) {
    return null;
  }
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

export default React.memo(ErrorBanner);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.dangerBackground,
    borderRadius: radii.md,
    padding: spacing.sm,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  text: {
    color: colors.danger,
    fontSize: typography.body,
    fontWeight: '600',
  },
});
