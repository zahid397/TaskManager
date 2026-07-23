import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Category, Task } from '@tasks/types';
import StarButton from './StarButton';
import StatusBadge from './StatusBadge';
import { formatDate } from '@utils/date';
import { colors, radii, spacing, typography } from '../../../theme';

interface TaskItemProps {
  task: Task;
  category?: Category;
  onPress: (taskId: string) => void;
  onToggleStar: (taskId: string) => void;
}

/**
 * Wrapped in React.memo, per the spec's explicit requirement to use
 * React.memo for TaskItem. Also worth being precise about *why* this
 * actually helps: FlatList re-renders items when their props change by
 * reference, and without memo every parent re-render (e.g. typing in the
 * search box, before debounce even settles) would re-render every visible
 * row even though most rows' own data hasn't changed at all.
 *
 * For memo to actually pay off, callbacks passed down (onPress, onToggleStar)
 * must be stable references — see TaskListScreen, where both are wrapped in
 * useCallback for exactly this reason. Passing a fresh inline arrow function
 * as a prop here would silently defeat the memoization.
 */
function TaskItem({ task, category, onPress, onToggleStar }: TaskItemProps) {
  const handlePress = () => onPress(task.id);
  const handleToggleStar = () => onToggleStar(task.id);

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.left}>
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>
            {task.title}
          </Text>
        </View>
        <View style={styles.metaRow}>
          {category && (
            <View style={styles.categoryChip}>
              <Text style={styles.categoryChipText} numberOfLines={1}>
                {category.name}
              </Text>
            </View>
          )}
          <StatusBadge status={task.status} />
        </View>
      </View>

      <View style={styles.right}>
        <Text style={styles.dueDate}>{formatDate(task.dueDate)}</Text>
        <StarButton starred={task.starred} onToggle={handleToggleStar} />
      </View>
    </TouchableOpacity>
  );
}

function areEqual(prev: TaskItemProps, next: TaskItemProps): boolean {
  return (
    prev.task === next.task &&
    prev.category?.id === next.category?.id &&
    prev.category?.name === next.category?.name &&
    prev.onPress === next.onPress &&
    prev.onToggleStar === next.onToggleStar
  );
}

export default React.memo(TaskItem, areEqual);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  left: {
    flex: 1,
    marginRight: spacing.sm,
  },
  titleRow: {
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: typography.subtitle,
    fontWeight: '600',
    color: colors.text,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  categoryChip: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipText: {
    fontSize: typography.small,
    color: colors.textMuted,
    fontWeight: '600',
  },
  right: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  dueDate: {
    fontSize: typography.small,
    color: colors.textMuted,
  },
});
