import React, { useCallback, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTaskStore } from '@tasks/store/taskStore';
import { useCategoryStore } from '@categories/store/categoryStore';
import { setTaskStatus, deleteTask as deleteTaskApi, TaskApiError } from '@services/taskApi';
import { setTasksCache } from '@services/cache';
import StarButton from '@tasks/components/StarButton';
import StatusBadge from '@tasks/components/StatusBadge';
import ErrorBanner from '@tasks/components/ErrorBanner';
import { formatDate, formatDateTime } from '@utils/date';
import { colors, radii, spacing, typography } from '../../../theme';
import type { TaskDetailScreenProps } from '@app/navigation/types';

function TaskDetailScreen({ route, navigation }: TaskDetailScreenProps) {
  const { taskId } = route.params;

  const task = useTaskStore(state => state.tasks.find(t => t.id === taskId));
  const tasks = useTaskStore(state => state.tasks);
  const storeUpdateTask = useTaskStore(state => state.updateTask);
  const storeDeleteTask = useTaskStore(state => state.deleteTask);
  const toggleStar = useTaskStore(state => state.toggleStar);
  const categories = useCategoryStore(state => state.categories);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const category = task?.categoryId
    ? categories.find(c => c.id === task.categoryId)
    : undefined;

  const handleToggleComplete = useCallback(async () => {
    if (!task) return;
    setError(null);
    setBusy(true);
    const nextStatus = task.status === 'done' ? 'open' : 'done';

    try {
      // Write flow per spec: request first, update cache+store only on
      // success. On failure the store/cache are left exactly as they were.
      const updated = await setTaskStatus(task.id, nextStatus);
      storeUpdateTask(task.id, { status: updated.status, updatedAt: updated.updatedAt });
      await setTasksCache(
        tasks.map(t => (t.id === task.id ? { ...t, status: updated.status, updatedAt: updated.updatedAt } : t)),
      );
    } catch (err) {
      const message =
        err instanceof TaskApiError ? err.message : 'Could not update task status.';
      setError(message);
    } finally {
      setBusy(false);
    }
  }, [task, tasks, storeUpdateTask]);

  const handleDelete = useCallback(() => {
    if (!task) return;

    Alert.alert('Delete task?', `"${task.title}" will be permanently deleted.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setError(null);
          setBusy(true);
          try {
            await deleteTaskApi(task.id);
            storeDeleteTask(task.id);
            await setTasksCache(tasks.filter(t => t.id !== task.id));
            navigation.goBack();
          } catch (err) {
            const message =
              err instanceof TaskApiError ? err.message : 'Could not delete task.';
            setError(message);
            setBusy(false);
          }
        },
      },
    ]);
  }, [task, tasks, storeDeleteTask, navigation]);

  const handleToggleStar = useCallback(() => {
    if (!task) return;
    // Local-only: no API call, no error path — see taskStore.toggleStar.
    toggleStar(task.id);
  }, [task, toggleStar]);

  if (!task) {
    // Can legitimately happen if the task was deleted (e.g. on another
    // device) between navigating here and this render.
    return (
      <View style={styles.container}>
        <Text style={styles.notFound}>This task no longer exists.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ErrorBanner message={error} />

      <View style={styles.titleRow}>
        <Text style={styles.title}>{task.title}</Text>
        <StarButton starred={task.starred} onToggle={handleToggleStar} size={28} />
      </View>

      <View style={styles.badgeRow}>
        {category && (
          <View style={styles.categoryChip}>
            <Text style={styles.categoryChipText}>{category.name}</Text>
          </View>
        )}
        <StatusBadge status={task.status} />
      </View>

      {task.description ? (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Description</Text>
          <Text style={styles.sectionValue}>{task.description}</Text>
        </View>
      ) : null}

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Due Date</Text>
        <Text style={styles.sectionValue}>{formatDate(task.dueDate)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Created</Text>
        <Text style={styles.sectionValue}>{formatDateTime(task.createdAt)}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Last Updated</Text>
        <Text style={styles.sectionValue}>{formatDateTime(task.updatedAt)}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.completeButton]}
          onPress={handleToggleComplete}
          disabled={busy}
        >
          <Text style={styles.completeButtonText}>
            {task.status === 'done' ? '↺ Reopen' : '✓ Mark as Done'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.editButton]}
          onPress={() => navigation.navigate('TaskForm', { mode: 'edit', taskId: task.id })}
          disabled={busy}
        >
          <Text style={styles.editButtonText}>✎ Edit Task</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDelete}
          disabled={busy}
        >
          <Text style={styles.deleteButtonText}>🗑 Delete Task</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

export default TaskDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  notFound: {
    padding: spacing.lg,
    fontSize: typography.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  title: {
    flex: 1,
    fontSize: typography.heading,
    fontWeight: '800',
    color: colors.text,
    marginRight: spacing.sm,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginBottom: spacing.lg,
  },
  categoryChip: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  categoryChipText: {
    fontSize: typography.small,
    fontWeight: '600',
    color: colors.textMuted,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.small,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  sectionValue: {
    fontSize: typography.body,
    color: colors.text,
  },
  actions: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  actionButton: {
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    alignItems: 'center',
    borderWidth: 1,
  },
  completeButton: {
    backgroundColor: colors.successBackground,
    borderColor: colors.success,
  },
  completeButtonText: {
    color: colors.success,
    fontWeight: '700',
    fontSize: typography.body,
  },
  editButton: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
  },
  editButtonText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: typography.body,
  },
  deleteButton: {
    backgroundColor: colors.dangerBackground,
    borderColor: colors.danger,
  },
  deleteButtonText: {
    color: colors.danger,
    fontWeight: '700',
    fontSize: typography.body,
  },
});
