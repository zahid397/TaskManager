import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useTaskStore } from '@tasks/store/taskStore';
import { useCategoryStore } from '@categories/store/categoryStore';
import { createTask, updateTask as updateTaskApi, TaskApiError } from '@services/taskApi';
import { setTasksCache } from '@services/cache';
import CategoryPicker from '@tasks/components/CategoryPicker';
import ErrorBanner from '@tasks/components/ErrorBanner';
import { colors, radii, spacing, typography } from '../../../theme';
import type { TaskFormScreenProps } from '@app/navigation/types';

/** yyyy-mm-dd validation for the plain-text due date field (see note below). */
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function TaskFormScreen({ route, navigation }: TaskFormScreenProps) {
  const isEdit = route.params.mode === 'edit';
  const editingTaskId = route.params.mode === 'edit' ? route.params.taskId : null;

  const tasks = useTaskStore(state => state.tasks);
  const existingTask = editingTaskId ? tasks.find(t => t.id === editingTaskId) : undefined;

  const addTask = useTaskStore(state => state.addTask);
  const storeUpdateTask = useTaskStore(state => state.updateTask);
  const categories = useCategoryStore(state => state.categories);

  const [title, setTitle] = useState(existingTask?.title ?? '');
  const [description, setDescription] = useState(existingTask?.description ?? '');
  const [categoryId, setCategoryId] = useState<string | null>(existingTask?.categoryId ?? null);
  const [dueDate, setDueDate] = useState(existingTask?.dueDate?.slice(0, 10) ?? '');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    setError(null);

    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      setError('Title is required.');
      return;
    }
    if (dueDate.length > 0 && !DATE_PATTERN.test(dueDate)) {
      setError('Due date must be in YYYY-MM-DD format, or left blank.');
      return;
    }

    setSubmitting(true);

    const payload = {
      title: trimmedTitle,
      description: description.trim().length > 0 ? description.trim() : null,
      categoryId,
      dueDate: dueDate.length > 0 ? new Date(dueDate).toISOString() : null,
    };

    try {
      if (isEdit && editingTaskId) {
        // Write flow per spec: backend first, then cache+store on success.
        const updated = await updateTaskApi(editingTaskId, payload);
        const nextTasks = tasks.map(t =>
          t.id === editingTaskId
            ? { ...t, ...updated, starred: t.starred } // starred is local; keep it
            : t,
        );
        storeUpdateTask(editingTaskId, { ...updated, starred: existingTask?.starred ?? false });
        await setTasksCache(nextTasks);
      } else {
        const created = await createTask(payload);
        const withStar = { ...created, starred: false };
        addTask(withStar);
        await setTasksCache([withStar, ...tasks]);
      }
      navigation.goBack();
    } catch (err) {
      // On failure: show the error, leave cache/store untouched (we simply
      // never call addTask/storeUpdateTask/setTasksCache on this path).
      const message =
        err instanceof TaskApiError ? err.message : 'Could not save task. Please try again.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ErrorBanner message={error} />

        <Text style={styles.label}>Title *</Text>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Enter task title"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          accessibilityLabel="Task title"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Enter task description (optional)"
          placeholderTextColor={colors.textMuted}
          style={[styles.input, styles.textArea]}
          multiline
          numberOfLines={4}
          accessibilityLabel="Task description"
        />

        <Text style={styles.label}>Category</Text>
        <CategoryPicker
          categories={categories}
          selectedCategoryId={categoryId}
          onSelect={setCategoryId}
        />

        <Text style={styles.label}>Due Date</Text>
        <TextInput
          value={dueDate}
          onChangeText={setDueDate}
          placeholder="YYYY-MM-DD (optional)"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          accessibilityLabel="Due date"
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.hint}>
          Simple text field by design — a native date picker needs an extra
          native dependency for one field; see README "Future improvements".
        </Text>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Text style={styles.submitButtonText}>
            {submitting ? 'Saving...' : 'Save Task'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default TaskFormScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  label: {
    fontSize: typography.small,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: colors.text,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: typography.small,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: typography.subtitle,
  },
});
