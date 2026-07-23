import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../../theme';
import type { TaskStatus } from '@tasks/types';

interface StatusBadgeProps {
  status: TaskStatus;
}

function StatusBadge({ status }: StatusBadgeProps) {
  const isDone = status === 'done';
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: isDone ? colors.successBackground : colors.warningBackground },
      ]}
    >
      <Text style={[styles.text, { color: isDone ? colors.success : colors.warningText }]}>
        {isDone ? 'Done' : 'Open'}
      </Text>
    </View>
  );
}

export default React.memo(StatusBadge);

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: typography.small,
    fontWeight: '700',
  },
});
