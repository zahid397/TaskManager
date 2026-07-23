import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, typography } from '../../../theme';

interface StarButtonProps {
  starred: boolean;
  onToggle: () => void;
  size?: number;
}

/**
 * Renders a filled/outline star. Uses a plain text glyph rather than pulling
 * in an icon library — one fewer native dependency for something this
 * simple, and it's legible at any size without needing an icon font linked.
 */
function StarButton({ starred, onToggle, size = 22 }: StarButtonProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={starred ? 'Unstar task' : 'Star task'}
      accessibilityState={{ selected: starred }}
    >
      <Text style={[styles.glyph, { fontSize: size, color: starred ? colors.star : colors.border }]}>
        {starred ? '★' : '☆'}
      </Text>
    </TouchableOpacity>
  );
}

export default React.memo(StarButton);

const styles = StyleSheet.create({
  glyph: {
    fontWeight: '700',
    lineHeight: typography.heading,
  },
});
