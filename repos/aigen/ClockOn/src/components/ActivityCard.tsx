// ActivityCard - Displays today's activity with improved visual design
import React from 'react';
import { View, StyleSheet, ScrollView, ViewStyle } from 'react-native';
import { Card, Text, Divider, List, useTheme } from 'react-native-paper';
import { format } from 'date-fns';
import { EmployeeRecord } from '../types';
import { designTokens } from '../theme/theme';

interface ActivityCardProps {
  records: EmployeeRecord[];
  style?: ViewStyle;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ records, style }) => {
  const theme = useTheme();

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm:ss');
  };

  if (records.length === 0) {
    return (
      <Card style={[styles.card, style]}>
        <Card.Title
          title="Today's Activity"
          titleVariant="titleLarge"
          left={(props) => (
            <List.Icon
              {...props}
              icon="calendar-check"
              iconColor={designTokens.colors.primary}
            />
          )}
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
        left={(props) => (
          <List.Icon
            {...props}
            icon="calendar-check"
            size={24}
            iconColor={designTokens.colors.primary}
          />
        )}
      />
      <Card.Content>
        <ScrollView showsVerticalScrollIndicator={false}>
          {records.map((record, index) => {
            const isIn = record.clockType === 'IN';
            const icon = isIn ? 'arrow-right-bold-circle' : 'arrow-left-bold-circle';
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
                  left={(props) => (
                    <View style={styles.iconContainer}>
                      <List.Icon
                        {...props}
                        icon={icon}
                        iconColor={iconColor}
                      />
                    </View>
                  )}
                  right={(props) => (
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
