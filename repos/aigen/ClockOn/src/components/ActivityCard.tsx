// ActivityCard - Displays today's activity with improved visual design
import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle, TouchableOpacity, Alert } from 'react-native';
import { Card, Text, Divider, List, useTheme } from 'react-native-paper';
import { format } from 'date-fns';
import { EmployeeRecord } from '../types';
import { designTokens } from '../theme/theme';
import DatabaseService from '../database/DatabaseService';

interface ActivityCardProps {
  records: EmployeeRecord[];
  style?: ViewStyle;
  onRefresh?: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ records, style, onRefresh }) => {
  const theme = useTheme();

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm:ss');
  };

  const handleDeleteRecord = (record: EmployeeRecord) => {
    Alert.alert(
      'Delete Record',
      `Are you sure you want to delete this ${record.clockType === 'IN' ? 'clock in' : 'clock out'} record?\n\nTime: ${formatTime(record.timestamp)}`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await DatabaseService.deleteRecord(record.id);
              if (onRefresh) {
                onRefresh();
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete record');
            }
          },
        },
      ]
    );
  };

  if (records.length === 0) {
    return (
      <Card style={[styles.card, style]}>
        <Card.Title
          title="Today's Activity"
          titleVariant="titleLarge"
          left={() => <Text style={{ fontSize: 24 }}>📅</Text>}
        />
        <Card.Content>
          <Text style={styles.emptyText}>
            No activity recorded today
          </Text>
        </Card.Content>
      </Card>
    );
  }

  return (
    <Card style={[styles.card, style]}>
      <Card.Title
        title="Today's Activity"
        titleVariant="titleLarge"
        left={() => <Text style={{ fontSize: 24 }}>📅</Text>}
      />
      <Card.Content>
        <ScrollView showsVerticalScrollIndicator={false}>
          {records.map((record, index) => {
            const isIn = record.clockType === 'IN';
            const iconColor = isIn
              ? designTokens.colors.success
              : designTokens.colors.error;
            const title = isIn ? 'Clocked In' : 'Clocked Out';

            return (
              <View key={record.id}>
                <List.Item
                  title={title}
                  titleStyle={styles.activityTitle}
                  description={formatTime(record.timestamp)}
                  descriptionStyle={styles.activityTime}
                  left={() => (
                    <View style={styles.iconContainer}>
                      <Text style={{ fontSize: 24, marginRight: 12 }}>
                        {isIn ? '🟢' : '🔴'}
                      </Text>
                    </View>
                  )}
                  right={() => (
                    <View style={styles.rightContainer}>
                      <View style={styles.typeBadge}>
                        <Text
                          style={[
                            styles.typeText,
                            { color: iconColor }
                          ]}
                        >
                          {record.clockType}
                        </Text>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleDeleteRecord(record)}
                        style={styles.deleteButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                      >
                        <Text style={styles.deleteIcon}>🗑️</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                  style={styles.listItem}
                />
                {index < records.length - 1 && (
                  <Divider style={styles.divider} />
                )}
              </View>
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
    marginBottom: designTokens.spacing.md,
  },
  listItem: {
    paddingVertical: designTokens.spacing.sm,
  },
  iconContainer: {
    justifyContent: 'center',
    marginRight: designTokens.spacing.sm,
  },
  activityTitle: {
    ...designTokens.typography.fontWeight.semibold,
    fontSize: designTokens.typography.fontSize.title.medium,
    color: designTokens.colors.text.primary,
  },
  activityTime: {
    fontSize: designTokens.typography.fontSize.body.medium,
    color: designTokens.colors.text.secondary,
    marginTop: 2,
  },
  typeBadge: {
    justifyContent: 'center',
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: designTokens.spacing.xs,
    backgroundColor: designTokens.colors.surfaceVariant,
    borderRadius: designTokens.borderRadius.sm,
  },
  typeText: {
    ...designTokens.typography.fontWeight.semibold,
    fontSize: designTokens.typography.fontSize.label.medium,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: designTokens.spacing.sm,
  },
  deleteButton: {
    padding: designTokens.spacing.xs,
  },
  deleteIcon: {
    fontSize: 20,
    opacity: 0.6,
  },
  divider: {
    backgroundColor: designTokens.colors.divider,
    marginVertical: designTokens.spacing.xs,
  },
  emptyText: {
    fontSize: designTokens.typography.fontSize.body.medium,
    color: designTokens.colors.text.tertiary,
    textAlign: 'center',
    paddingVertical: designTokens.spacing.lg,
  },
});
