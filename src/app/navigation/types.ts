import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Single source of truth for the stack's route names and params. Using one
 * shared param list (rather than each screen guessing its own props' shape)
 * is what makes `navigation.navigate('TaskDetail', { taskId })` type-check
 * against a typo or a missing param at compile time instead of at runtime.
 */
export type RootStackParamList = {
  TaskList: undefined;
  TaskDetail: { taskId: string };
  // `mode: 'create'` has no taskId; `mode: 'edit'` requires one.
  TaskForm:
    | { mode: 'create' }
    | { mode: 'edit'; taskId: string };
  Categories: undefined;
};

export type TaskListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'TaskList'
>;
export type TaskDetailScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'TaskDetail'
>;
export type TaskFormScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'TaskForm'
>;
export type CategoriesScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'Categories'
>;
