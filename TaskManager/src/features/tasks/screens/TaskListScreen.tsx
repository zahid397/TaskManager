import React, { useCallback, useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTaskStore } from '@tasks/store/taskStore';
import { useCategoryStore } from '@categories/store/categoryStore';
import { useFilteredTasks } from '@tasks/hooks/useFilteredTasks';
import { useTasksSync } from '@sync/hooks/useTasksSync';
import { useNetworkStatus } from '@sync/hooks/useNetworkStatus';
import TaskItem from '@tasks/components/TaskItem';
import SearchBar from '@tasks/components/SearchBar';
import FilterBar from '@tasks/components/FilterBar';
import SortControls from '@tasks/components/SortControls';
import EmptyState from '@tasks/components/EmptyState';
import OfflineBanner from '../../../sync/components/OfflineBanner';
import SyncStatusBar from '../../../sync/components/SyncStatusBar';
import { colors, radii, spacing, typography } from '../../../theme';
import type { SortOption, Task } from '@tasks/types';
import type { TaskListScreenProps } from '@app/navigation/types';

function TaskListScreen({ navigation }: TaskListScreenProps) {
  // sortOption is local UI state (see useFilteredTasks' doc comment for why
  // it isn't in the Zustand store).
  const [sortOption, setSortOption] = useState<SortOption>('createdTime');

  const categories = useCategoryStore(state => state.categories);
  const categoriesById = React.useMemo(
    () => new Map(categories.map(c => [c.id, c])),
    [categories],
  );

  const filters = useTaskStore(state => state.filters);
  const searchQuery = useTaskStore(state => state.searchQuery);
  const setSearch = useTaskStore(state => state.setSearch);
  const setCategoryFilter = useTaskStore(state => state.setCategoryFilter);
  const setStatusFilter = useTaskStore(state => state.setStatusFilter);
  const toggleStar = useTaskStore(state => state.toggleStar);
  const loading = useTaskStore(state => state.loading);
  const lastRefresh = useTaskStore(state => state.lastRefresh);
  const onlineStatus = useTaskStore(state => state.onlineStatus);

  // Requirement 4.1 + 4.5: initial cache-first load, background refresh,
  // and the online/offline mirror into the store.
  const { refresh } = useTasksSync();
  useNetworkStatus();

  const filteredTasks = useFilteredTasks(sortOption);

  // Stable callback identities so TaskItem's React.memo actually prevents
  // re-renders (see TaskItem.tsx's areEqual comment).
  const handlePressTask = useCallback(
    (taskId: string) => {
      navigation.navigate('TaskDetail', { taskId });
    },
    [navigation],
  );

  const handleToggleStar = useCallback(
    (taskId: string) => {
      toggleStar(taskId);
    },
    [toggleStar],
  );

  const keyExtractor = useCallback((task: Task) => task.id, []);

  const renderItem = useCallback(
    ({ item }: { item: Task }) => (
      <TaskItem
        task={item}
        category={item.categoryId ? categoriesById.get(item.categoryId) : undefined}
        onPress={handlePressTask}
        onToggleStar={handleToggleStar}
      />
    ),
    [categoriesById, handlePressTask, handleToggleStar],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Categories')}
            accessibilityRole="button"
            accessibilityLabel="Manage categories"
          >
            <Text style={styles.headerButtonText}>Categories</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, styles.headerButtonPrimary]}
            onPress={() => navigation.navigate('TaskForm', { mode: 'create' })}
            accessibilityRole="button"
            accessibilityLabel="Create new task"
          >
            <Text style={styles.headerButtonPrimaryText}>+ New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <OfflineBanner visible={!onlineStatus} />

      <SearchBar value={searchQuery} onChangeText={setSearch} />

      <FilterBar
        categories={categories}
        selectedCategoryId={filters.categoryId}
        onSelectCategory={setCategoryFilter}
        status={filters.status}
        onSelectStatus={setStatusFilter}
      />

      <SortControls sortOption={sortOption} onChange={setSortOption} />

      <SyncStatusBar lastRefresh={lastRefresh} loading={loading} />

      <FlatList
        data={filteredTasks}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onRefresh={refresh}
        refreshing={loading}
        contentContainerStyle={
          filteredTasks.length === 0 ? styles.emptyContent : styles.listContent
        }
        ListEmptyComponent={
          <EmptyState
            title="No tasks found"
            message={
              searchQuery || filters.categoryId || filters.status !== 'All'
                ? 'Try adjusting your search or filters.'
                : 'Create your first task to get started.'
            }
          />
        }
        // Requirement note (2,000-task scale question from the interview
        // prep): FlatList already virtualizes off-screen rows, keyExtractor
        // above gives it stable identity, and TaskItem is memoized — the
        // three things you'd check first before reaching for pagination.
        initialNumToRender={12}
        windowSize={7}
        removeClippedSubviews
      />
    </View>
  );
}

export default TaskListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  headerTitle: {
    fontSize: typography.heading,
    fontWeight: '800',
    color: colors.text,
  },
  headerActions: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  headerButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.sm,
  },
  headerButtonText: {
    color: colors.textMuted,
    fontWeight: '600',
    fontSize: typography.body,
  },
  headerButtonPrimary: {
    backgroundColor: colors.primary,
    borderRadius: radii.sm,
  },
  headerButtonPrimaryText: {
    color: colors.surface,
    fontWeight: '700',
    fontSize: typography.body,
  },
  listContent: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
  },
  emptyContent: {
    flexGrow: 1,
  },
});
