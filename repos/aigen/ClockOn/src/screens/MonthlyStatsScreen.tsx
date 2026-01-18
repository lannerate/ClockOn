// Monthly statistics screen - attendance tracking by month

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import {
  Card,
  Text,
  Button,
  Surface,
  useTheme,
  Divider,
  List,
  ProgressBar,
} from 'react-native-paper';
import { format } from 'date-fns';
import SettingsService from '../services/SettingsService';
import MonthlyStatsService from '../services/MonthlyStatsService';
import { MonthlyStats } from '../types';

const { width, height } = Dimensions.get('window');

const MonthlyStatsScreen: React.FC = () => {
  const theme = useTheme();
  const [statsList, setStatsList] = useState<MonthlyStats[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<MonthlyStats | null>(null);

  useEffect(() => {
    loadMonthlyStats();
  }, []);

  const loadMonthlyStats = async () => {
    try {
      const employeeId = await SettingsService.getEmployeeId();
      if (!employeeId) {
        return;
      }

      const stats = await MonthlyStatsService.getAllMonthlyStats(employeeId);
      setStatsList(stats);

      // Select current month by default
      const now = new Date();
      const currentMonthStats = stats.find(
        (s) => s.year === now.getFullYear() && s.month === now.getMonth() + 1
      );
      if (currentMonthStats) {
        setSelectedMonth(currentMonthStats);
      } else if (stats.length > 0) {
        setSelectedMonth(stats[0]);
      }
    } catch (error) {
      console.error('Failed to load monthly stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadMonthlyStats();
    setRefreshing(false);
  };

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const formatMonthYear = (year: number, month: number) => {
    return `${monthNames[month - 1]} ${year}`;
  };

  const getAttendanceColor = (rate: number) => {
    if (rate >= 90) return theme.colors.primary;
    if (rate >= 75) return '#FF9800';
    return theme.colors.error;
  };

  const renderMonthSelector = () => {
    return (
      <Card style={styles.card}>
        <Card.Title
          title="Select Month"
          left={(props) => <List.Icon {...props} icon="calendar-multiple" size={24} />}
        />
        <Card.Content>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.monthSelector}
          >
            {statsList.map((stats) => (
              <Button
                key={`${stats.year}-${stats.month}`}
                mode={
                  selectedMonth?.year === stats.year &&
                  selectedMonth?.month === stats.month
                    ? 'contained'
                    : 'outlined'
                }
                onPress={() => setSelectedMonth(stats)}
                style={styles.monthButton}
                icon="calendar-month"
              >
                {monthNames[stats.month - 1].substring(0, 3)}
              </Button>
            ))}
          </ScrollView>
        </Card.Content>
      </Card>
    );
  };

  const renderStatsCard = () => {
    if (!selectedMonth) {
      return (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.emptyText}>
              No attendance records available. Start clocking in to see your
              monthly statistics.
            </Text>
          </Card.Content>
        </Card>
      );
    }

    const attendanceColor = getAttendanceColor(selectedMonth.attendanceRate);

    return (
      <Card style={styles.card}>
        <Card.Title
          title={formatMonthYear(selectedMonth.year, selectedMonth.month)}
          subtitle="Monthly Attendance Summary"
          left={(props) => <List.Icon {...props} icon="chart-bar" size={24} />}
        />
        <Card.Content>
          {/* Attendance Rate */}
          <View style={styles.statRow}>
            <View style={styles.statItem}>
              <Text variant="titleMedium" style={styles.statLabel}>
                Attendance Rate
              </Text>
              <Text
                variant="headlineLarge"
                style={[styles.statValue, { color: attendanceColor, fontSize: 48 }]}
              >
                {selectedMonth.attendanceRate.toFixed(1)}%
              </Text>
              <ProgressBar
                progress={selectedMonth.attendanceRate / 100}
                color={attendanceColor}
                style={styles.progressBar}
              />
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Days Stats */}
          <View style={styles.statsGrid}>
            <View style={styles.gridItem}>
              <Text variant="bodyMedium" style={styles.statLabel}>
                ✅ Days Worked
              </Text>
              <Text variant="headlineSmall" style={styles.statValue}>
                {selectedMonth.daysClockedIn}
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text variant="bodyMedium" style={styles.statLabel}>
                📆 Working Days
              </Text>
              <Text variant="headlineSmall" style={styles.statValue}>
                {selectedMonth.totalWorkingDays}
              </Text>
            </View>

            <View style={styles.gridItem}>
              <Text variant="bodyMedium" style={styles.statLabel}>
                ⏰ Total Hours
              </Text>
              <Text variant="headlineSmall" style={styles.statValue}>
                {selectedMonth.totalHours.toFixed(1)}h
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Daily Records */}
          <View style={styles.sectionHeader}>
            <List.Icon icon="calendar-text" size={20} />
            <Text variant="titleLarge" style={styles.sectionTitle}>
              Daily Records
            </Text>
          </View>
          {selectedMonth.records.length > 0 ? (
            <View style={styles.recordsList}>
              {selectedMonth.records.map((record, index) => (
                <View key={record.id}>
                  <List.Item
                    title={
                      record.clockType === 'IN' ? 'Clocked In' : 'Clocked Out'
                    }
                    description={format(new Date(record.timestamp), 'MMM dd, HH:mm:ss')}
                    left={(props) => (
                      <List.Icon
                        {...props}
                        icon={
                          record.clockType === 'IN'
                            ? 'login-variant'
                            : 'logout-variant'
                        }
                        iconColor={
                          record.clockType === 'IN'
                            ? theme.colors.primary
                            : theme.colors.error
                        }
                      />
                    )}
                    right={(props) => (
                      <Text
                        {...props}
                        style={[
                          props.style,
                          {
                            alignSelf: 'center',
                            fontWeight: '600',
                            color:
                              record.clockType === 'IN'
                                ? theme.colors.primary
                                : theme.colors.error,
                          },
                        ]}
                      >
                        {record.clockType}
                      </Text>
                    )}
                  />
                  {index < selectedMonth.records.length - 1 && <Divider />}
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>No records for this month</Text>
          )}
        </Card.Content>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {statsList.length > 0 && renderMonthSelector()}
        {renderStatsCard()}

        {/* Info Card */}
        <Card style={styles.card}>
          <Card.Content style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <List.Icon icon="information-outline" size={24} />
              <Text variant="titleMedium" style={styles.infoTitle}>
                About Attendance Rate
              </Text>
            </View>
            <Text variant="bodyMedium" style={styles.infoText}>
              Attendance Rate = (Days Clocked In ÷ Working Days) × 100%
              {'\n\n'}
              Working days are Monday to Friday, excluding weekends.
              {'\n\n'}
              Each day with at least one clock-in record counts as a worked day.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 12,
    elevation: 4,
    borderRadius: 16,
    overflow: 'hidden',
  },
  monthSelector: {
    marginVertical: 12,
    paddingHorizontal: 8,
  },
  monthButton: {
    marginRight: 12,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  statRow: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  statItem: {
    width: '100%',
    alignItems: 'center',
  },
  statLabel: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 12,
    fontSize: 14,
    fontWeight: '500',
  },
  statValue: {
    fontWeight: 'bold',
  },
  progressBar: {
    width: '100%',
    marginTop: 12,
    height: 10,
    borderRadius: 5,
  },
  divider: {
    marginVertical: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  gridItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordsList: {
    marginTop: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.5,
    padding: 24,
    fontSize: 14,
  },
  infoCard: {
    paddingVertical: 16,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    lineHeight: 24,
    fontSize: 14,
    opacity: 0.8,
  },
});

export default MonthlyStatsScreen;
