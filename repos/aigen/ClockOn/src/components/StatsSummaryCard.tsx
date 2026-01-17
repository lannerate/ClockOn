// StatsSummaryCard - Enhanced monthly statistics summary with better visualization
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Divider, ProgressBar, useTheme } from 'react-native-paper';
import { MonthlyStats } from '../types';
import { designTokens } from '../theme/theme';

interface StatsSummaryCardProps {
  stats: MonthlyStats;
  style?: any;
}

export const StatsSummaryCard: React.FC<StatsSummaryCardProps> = ({
  stats,
  style,
}) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatMonthYear = (year: number, month: number) => {
    return `${monthNames[month - 1]} ${year}`;
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return designTokens.colors.success;
    if (rate >= 75) return designTokens.colors.warning;
    return designTokens.colors.error;
  };

  const attendanceColor = getAttendanceColor(stats.attendanceRate);

  return (
    <Card style={[styles.card, style]}>
      <Card.Title
        title={formatMonthYear(stats.year, stats.month)}
        titleVariant="headlineSmall"
        subtitle="Monthly Attendance Summary"
        subtitleStyle={styles.subtitle}
        left={(props) => (
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📊</Text>
          </View>
        )}
      />
      <Card.Content>
        {/* Attendance Rate - Hero Metric */}
        <View style={styles.heroMetricContainer}>
          <Text variant="titleMedium" style={styles.heroLabel}>
            Attendance Rate
          </Text>
          <Text style={[styles.heroValue, { color: attendanceColor }]}>
            {stats.attendanceRate.toFixed(1)}%
          </Text>
          <ProgressBar
            progress={stats.attendanceRate / 100}
            color={attendanceColor}
            style={styles.progressBar}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.gridItem}>
            <View style={styles.gridIconContainer}>
              <Text style={styles.gridIcon}>✓</Text>
            </View>
            <Text variant="headlineMedium" style={styles.gridValue}>
              {stats.daysClockedIn}
            </Text>
            <Text variant="bodyMedium" style={styles.gridLabel}>
              Days Worked
            </Text>
          </View>

          <View style={styles.gridItem}>
            <View style={styles.gridIconContainer}>
              <Text style={styles.gridIcon}>📅</Text>
            </View>
            <Text variant="headlineMedium" style={styles.gridValue}>
              {stats.totalWorkingDays}
            </Text>
            <Text variant="bodyMedium" style={styles.gridLabel}>
              Working Days
            </Text>
          </View>

          <View style={styles.gridItem}>
            <View style={styles.gridIconContainer}>
              <Text style={styles.gridIcon}>⏱</Text>
            </View>
            <Text variant="headlineMedium" style={styles.gridValue}>
              {stats.totalHours.toFixed(1)}h
            </Text>
            <Text variant="bodyMedium" style={styles.gridLabel}>
              Total Hours
            </Text>
          </View>
        </View>
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
  subtitle: {
    color: designTokens.colors.text.secondary,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: designTokens.borderRadius.md,
    backgroundColor: designTokens.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: designTokens.spacing.sm,
  },
  icon: {
    fontSize: 28,
  },
  heroMetricContainer: {
    alignItems: 'center',
    paddingVertical: designTokens.spacing.lg,
  },
  heroLabel: {
    color: designTokens.colors.text.secondary,
    marginBottom: designTokens.spacing.sm,
  },
  heroValue: {
    ...designTokens.typography.fontWeight.bold,
    fontSize: designTokens.typography.fontSize.display.small,
    lineHeight: designTokens.typography.lineHeight.tight,
    marginBottom: designTokens.spacing.md,
  },
  progressBar: {
    width: '100%',
    height: 16,
    borderRadius: designTokens.borderRadius.sm,
    backgroundColor: designTokens.colors.surfaceVariant,
  },
  divider: {
    backgroundColor: designTokens.colors.divider,
    marginVertical: designTokens.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: designTokens.spacing.md,
  },
  gridItem: {
    alignItems: 'center',
    flex: 1,
  },
  gridIconContainer: {
    width: 48,
    height: 48,
    borderRadius: designTokens.borderRadius.full,
    backgroundColor: designTokens.colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: designTokens.spacing.sm,
  },
  gridIcon: {
    fontSize: 24,
  },
  gridValue: {
    ...designTokens.typography.fontWeight.bold,
    fontSize: designTokens.typography.fontSize.headline.small,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.xs,
  },
  gridLabel: {
    fontSize: designTokens.typography.fontSize.body.medium,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
  },
});
