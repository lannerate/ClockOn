// MonthSelectorCard - Horizontal scrolling month selector
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Button, useTheme } from 'react-native-paper';
import { MonthlyStats } from '../types';
import { designTokens } from '../theme/theme';

interface MonthSelectorCardProps {
  statsList: MonthlyStats[];
  selectedMonth: MonthlyStats | null;
  onSelectMonth: (stats: MonthlyStats) => void;
  style?: any;
}

export const MonthSelectorCard: React.FC<MonthSelectorCardProps> = ({
  statsList,
  selectedMonth,
  onSelectMonth,
  style,
}) => {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  return (
    <Card style={[styles.card, style]}>
      <Card.Content>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {statsList.map((stats) => {
            const isSelected = selectedMonth?.year === stats.year &&
                            selectedMonth?.month === stats.month;

            return (
              <Button
                key={`${stats.year}-${stats.month}`}
                mode={isSelected ? 'contained' : 'outlined'}
                onPress={() => onSelectMonth(stats)}
                style={[
                  styles.monthButton,
                  isSelected && styles.monthButtonSelected,
                ]}
                contentStyle={styles.monthButtonContent}
                labelStyle={styles.monthButtonLabel}
              >
                {monthNames[stats.month - 1]}
              </Button>
            );
          })}
        </ScrollView>
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
  scrollContent: {
    paddingVertical: designTokens.spacing.sm,
  },
  monthButton: {
    marginRight: designTokens.spacing.sm,
    borderColor: designTokens.colors.border,
  },
  monthButtonSelected: {
    backgroundColor: designTokens.colors.primary,
    borderColor: designTokens.colors.primary,
  },
  monthButtonContent: {
    paddingHorizontal: designTokens.spacing.md,
  },
  monthButtonLabel: {
    ...designTokens.typography.fontWeight.semibold,
    fontSize: designTokens.typography.fontSize.label.medium,
  },
});
