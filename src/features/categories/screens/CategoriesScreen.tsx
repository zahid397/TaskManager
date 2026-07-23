import React, { useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useCategoryStore } from '@categories/store/categoryStore';
import { createCategory, CategoryApiError } from '@services/categoryApi';
import { setCategoriesCache } from '@services/cache';
import ErrorBanner from '@tasks/components/ErrorBanner';
import EmptyState from '@tasks/components/EmptyState';
import { colors, radii, spacing, typography } from '../../../theme';
import type { Category } from '@categories/types';

function CategoriesScreen() {
  const categories = useCategoryStore(state => state.categories);
  const addCategory = useCategoryStore(state => state.addCategory);

  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleAdd = async () => {
    setError(null);
    const trimmed = name.trim();
    if (trimmed.length === 0) {
      setError('Category name is required.');
      return;
    }
    if (categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('A category with this name already exists.');
      return;
    }

    setSubmitting(true);
    try {
      const created = await createCategory({ name: trimmed });
      addCategory(created);
      await setCategoriesCache([...categories, created]);
      setName('');
    } catch (err) {
      const message =
        err instanceof CategoryApiError ? err.message : 'Could not add category.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  const renderItem = ({ item }: { item: Category }) => (
    <View style={styles.row}>
      <Text style={styles.rowText}>{item.name}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <ErrorBanner message={error} />

      <View style={styles.form}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="New category name"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          accessibilityLabel="New category name"
        />
        <TouchableOpacity
          style={[styles.addButton, submitting && styles.addButtonDisabled]}
          onPress={handleAdd}
          disabled={submitting}
        >
          <Text style={styles.addButtonText}>{submitting ? '...' : 'Add'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={categories}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={
          categories.length === 0 ? styles.emptyContent : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState title="No categories yet" message="Add your first category above." />
        }
      />
    </View>
  );
}

export default CategoriesScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  form: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.md,
  },
  input: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.body,
    color: colors.text,
  },
  addButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonText: {
    color: colors.surface,
    fontWeight: '700',
  },
  listContent: {
    paddingBottom: spacing.xl,
  },
  emptyContent: {
    flexGrow: 1,
  },
  row: {
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  rowText: {
    fontSize: typography.subtitle,
    color: colors.text,
    fontWeight: '600',
  },
});
