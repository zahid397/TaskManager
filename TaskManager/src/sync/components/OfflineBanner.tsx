import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';

interface OfflineBannerProps {
  visible: boolean;
}

/**
 * Requirement 4.5: offline indicator when the device is offline.
 * Renders nothing (not even a zero-height view) when online, so it never
 * affects layout for the common case.
 */
function OfflineBanner({ visible }: OfflineBannerProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.text}>You&apos;re offline — showing cached tasks</Text>
    </View>
  );
}

export default React.memo(OfflineBanner);

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.warningBackground,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  text: {
    color: colors.warningText,
    fontSize: typography.small,
    fontWeight: '600',
    textAlign: 'center',
  },
});
