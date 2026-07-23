import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../../theme';
import type { Category } from '@categories/types';
import type { StatusFilter } from '@tasks/types';

interface FilterBarProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
  status: StatusFilter;
  onSelectStatus: (status: StatusFilter) => void;
}

const STATUS_OPTIONS: StatusFilter[] = ['All', 'Open', 'Done'];

/**
 * Renders both the category chips (horizontally scrollable, since the
 * category list is open-ended) and the All/Open/Done status segmented
 * control (fixed 3 options, so a plain row works fine without scrolling).
 * All the actual filtering logic lives in filterTasks/useFilteredTasks —
 * this component only reports user intent upward via the two callbacks.
 */
function FilterBar({
  categories,
  selectedCategoryId,
  onSelectCategory,
  status,
  onSelectStatus,
}: FilterBarProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoryRow}
      >
        <Chip
          label="All Categories"
          selected={selectedCategoryId === null}
          onPress={() => onSelectCategory(null)}
        />
        {categories.map(category => (
          <Chip
            key={category.id}
            label={category.name}
            selected={selectedCategoryId === category.id}
            onPress={() => onSelectCategory(category.id)}
          />
        ))}
      </ScrollView>

      <View style={styles.statusRow}>
        {STATUS_OPTIONS.map(option => (
          <TouchableOpacity
            key={option}
            style={[styles.statusPill, status === option && styles.statusPillActive]}
            onPress={() => onSelectStatus(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: status === option }}
          >
            <Text
              style={[
                styles.statusPillText,
                status === option && styles.statusPillTextActive,
              ]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

function Chip({ label, selected, onPress }: ChipProps) {
  return (
    <TouchableOpacity
      style={[styles.chip, selected && styles.chipSelected]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default React.memo(FilterBar);

const styles = StyleSheet.create({
  container: {
    paddingBottom: spacing.sm,
  },
  categoryRow: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginRight: spacing.xs,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.small,
    fontWeight: '600',
    color: colors.textMuted,
  },
  chipTextSelected: {
    color: colors.surface,
  },
  statusRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  statusPill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusPillActive: {
    backgroundColor: colors.primaryDark,
    borderColor: colors.primaryDark,
  },
  statusPillText: {
    fontSize: typography.small,
    fontWeight: '700',
    color: colors.textMuted,
  },
  statusPillTextActive: {
    color: colors.surface,
  },
});
