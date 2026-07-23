import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../../theme';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

/**
 * Purely a controlled input — it does not debounce itself. Debouncing
 * happens one layer up in useFilteredTasks (via useDebouncedSearch), so the
 * text the user sees typed always matches immediately, while the expensive
 * filter pass it triggers is what's delayed. Debouncing the visible text
 * itself would make the input feel laggy, which is the opposite of what
 * debouncing is supposed to buy you.
 */
function SearchBar({ value, onChangeText }: SearchBarProps) {
  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search tasks..."
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoCorrect={false}
        clearButtonMode="while-editing"
        accessibilityLabel="Search tasks by title"
      />
    </View>
  );
}

export default React.memo(SearchBar);

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
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
});
