// ClockButton - Enhanced clock in/out button with animations and feedback
import React from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { Button, useTheme } from 'react-native-paper';
import { designTokens } from '../theme/theme';

interface ClockButtonProps {
  type: 'in' | 'out';
  disabled: boolean;
  loading: boolean;
  onPress: () => void;
  style?: any;
}

export const ClockButton: React.FC<ClockButtonProps> = ({
  type,
  disabled,
  loading,
  onPress,
  style,
}) => {
  const theme = useTheme();
  const isClockIn = type === 'in';

  const buttonColor = isClockIn
    ? designTokens.colors.success
    : designTokens.colors.error;

  const emoji = isClockIn ? '🟢' : '🔴';
  const label = isClockIn ? 'IN' : 'OUT';

  return (
    <View style={[styles.container, style]}>
      <Button
        mode="contained"
        onPress={onPress}
        disabled={disabled}
        loading={loading}
        buttonColor={buttonColor}
        textColor={designTokens.colors.text.inverse}
        style={styles.button}
        contentStyle={styles.buttonContent}
        labelStyle={styles.buttonLabel}
      >
        {emoji} {label}
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginHorizontal: designTokens.spacing.xs,
  },
  button: {
    ...designTokens.shadows.sm,
    borderRadius: designTokens.borderRadius.md,
  },
  buttonContent: {
    paddingVertical: designTokens.spacing.md,
    paddingHorizontal: designTokens.spacing.lg,
  },
  buttonLabel: {
    ...designTokens.typography.fontWeight.semibold,
    fontSize: designTokens.typography.fontSize.label.large,
    letterSpacing: designTokens.typography.letterSpacing.normal,
  },
});
