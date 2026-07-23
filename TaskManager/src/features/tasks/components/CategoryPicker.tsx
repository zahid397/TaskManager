import React, { useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, spacing, typography } from '../../../theme';
import type { Category } from '@categories/types';

interface CategoryPickerProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelect: (categoryId: string | null) => void;
}

/**
 * A simple FlatList-in-a-Modal picker rather than pulling in
 * @react-native-picker/picker. That library requires native
 * linking/pod-install on both platforms for what is, here, a short list of
 * a few categories — a full-screen modal list is simpler, has zero extra
 * native surface, and is arguably easier to use on a touchscreen than a
 * native wheel picker for a list this short.
 */
function CategoryPicker({ categories, selectedCategoryId, onSelect }: CategoryPickerProps) {
  const [visible, setVisible] = useState(false);
  const selected = categories.find(c => c.id === selectedCategoryId);

  return (
    <>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
      >
        <Text style={selected ? styles.triggerText : styles.triggerPlaceholder}>
          {selected ? selected.name : 'Select category'}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={visible} animationType="slide" transparent onRequestClose={() => setVisible(false)}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Select Category</Text>
            <FlatList
              data={categories}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.option}
                  onPress={() => {
                    onSelect(item.id);
                    setVisible(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.name}</Text>
                  {item.id === selectedCategoryId && <Text style={styles.checkmark}>✓</Text>}
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No categories yet — add one from the Categories screen first.
                </Text>
              }
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

export default React.memo(CategoryPicker);

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  triggerText: {
    fontSize: typography.body,
    color: colors.text,
  },
  triggerPlaceholder: {
    fontSize: typography.body,
    color: colors.textMuted,
  },
  chevron: {
    color: colors.textMuted,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radii.lg,
    borderTopRightRadius: radii.lg,
    padding: spacing.md,
    maxHeight: '60%',
  },
  sheetTitle: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  optionText: {
    fontSize: typography.body,
    color: colors.text,
  },
  checkmark: {
    color: colors.primary,
    fontWeight: '700',
  },
  emptyText: {
    color: colors.textMuted,
    paddingVertical: spacing.md,
    textAlign: 'center',
  },
});
