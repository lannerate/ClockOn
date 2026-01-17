// StatusCard - Enhanced card component for displaying attendance status
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { designTokens } from '../theme/theme';

interface StatusCardProps {
  isClockedIn: boolean;
  workDuration?: number;
  clockInTime?: string;
  style?: ViewStyle;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  isClockedIn,
  workDuration = 0,
  clockInTime,
  style,
}) => {
  const theme = useTheme();

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <Card style={[styles.card, style]}>
      <Card.Content>
        {/* Status Badge */}
        <View style={[styles.statusContainer, {
          backgroundColor: isClockedIn
            ? designTokens.colors.success
            : designTokens.colors.surfaceVariant
        }]}>
          <Text
            style={[
              styles.statusText,
              {
                color: isClockedIn
                  ? designTokens.colors.text.inverse
                  : designTokens.colors.text.secondary
              }
            ]}
          >
            {isClockedIn ? 'CLOCKED IN' : 'CLOCKED OUT'}
          </Text>
        </View>

        {/* Duration Display - Only show when clocked in */}
        {isClockedIn && (
          <View style={styles.durationContainer}>
            <Text variant="titleMedium" style={styles.durationLabel}>
              Duration
            </Text>
            <Text
              style={[
                styles.durationValue,
                {
                  color: designTokens.colors.primary,
                  fontSize: designTokens.typography.fontSize.display.small,
                }
              ]}
            >
              {formatDuration(workDuration)}
            </Text>
            {clockInTime && (
              <Text variant="bodyMedium" style={styles.sinceText}>
                Since {clockInTime}
              </Text>
            )}
          </View>
        )}
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    ...designTokens.shadows.md,
    borderRadius: designTokens.borderRadius.lg,
    marginHorizontal: designTokens.spacing.md,
    marginTop: designTokens.spacing.md,
  },
  statusContainer: {
    paddingVertical: designTokens.spacing.lg,
    paddingHorizontal: designTokens.spacing.xl,
    borderRadius: designTokens.borderRadius.md,
    alignItems: 'center',
    marginBottom: designTokens.spacing.md,
  },
  statusText: {
    ...designTokens.typography.fontWeight.semibold,
    fontSize: designTokens.typography.fontSize.title.large,
    letterSpacing: designTokens.typography.letterSpacing.wide,
  },
  durationContainer: {
    alignItems: 'center',
    paddingVertical: designTokens.spacing.md,
  },
  durationLabel: {
    color: designTokens.colors.text.secondary,
    marginBottom: designTokens.spacing.sm,
  },
  durationValue: {
    ...designTokens.typography.fontWeight.bold,
    lineHeight: designTokens.typography.lineHeight.tight,
  },
  sinceText: {
    color: designTokens.colors.text.tertiary,
    marginTop: designTokens.spacing.sm,
  },
});
