import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../../theme';
import type { SortOption } from '@tasks/types';

interface SortControlsProps {
  sortOption: SortOption;
  onChange: (sortOption: SortOption) => void;
}

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'createdTime', label: 'Created Time' },
];

function SortControls({ sortOption, onChange }: SortControlsProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sort by</Text>
      <View style={styles.optionsRow}>
        {OPTIONS.map(option => {
          const active = option.value === sortOption;
          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.option, active && styles.optionActive]}
              onPress={() => onChange(option.value)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.optionText, active && styles.optionTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default React.memo(SortControls);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  label: {
    fontSize: typography.small,
    color: colors.textMuted,
    fontWeight: '600',
  },
  optionsRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  option: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  optionActive: {
    backgroundColor: colors.background,
  },
  optionText: {
    fontSize: typography.small,
    color: colors.textMuted,
  },
  optionTextActive: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
});
