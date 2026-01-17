// OfficeLocationCard - Enhanced office location management card
import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Card, Text, Button, Divider, List, Switch, useTheme } from 'react-native-paper';
import { designTokens } from '../theme/theme';
import { OfficeLocation } from '../types';

interface OfficeLocationCardProps {
  locations: OfficeLocation[];
  onAdd: () => void;
  onEdit: (location: OfficeLocation) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  style?: any;
}

export const OfficeLocationCard: React.FC<OfficeLocationCardProps> = ({
  locations,
  onAdd,
  onEdit,
  onDelete,
  onToggle,
  style,
}) => {
  const theme = useTheme();

  return (
    <Card style={[styles.card, style]}>
      <Card.Title
        title="Office Locations"
        titleVariant="titleLarge"
        left={(props) => (
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📍</Text>
          </View>
        )}
        right={() => (
          <Button
            mode="contained-tonal"
            onPress={onAdd}
            icon="plus-circle"
            style={styles.addButton}
            contentStyle={styles.addButtonContent}
          >
            Add
          </Button>
        )}
      />
      <Card.Content>
        {locations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🏢</Text>
            <Text style={styles.emptyTitle}>No Office Locations</Text>
            <Text style={styles.emptyText}>
              Add your office location to enable automatic clock in/out when you
              enter or exit the geofence.
            </Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            {locations.map((location, index) => (
              <View key={location.id}>
                <List.Item
                  title={location.name}
                  titleStyle={styles.locationTitle}
                  description={`${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)} · ${location.radius}m`}
                  descriptionStyle={styles.locationDescription}
                  left={(props) => (
                    <View style={styles.locationIconContainer}>
                      <Text style={styles.locationIcon}>
                        {location.enabled ? '🟢' : '⚪'}
                      </Text>
                    </View>
                  )}
                  right={() => (
                    <Switch
                      value={location.enabled}
                      onValueChange={(value) => onToggle(location.id, value)}
                    />
                  )}
                  onPress={() => onEdit(location)}
                  style={styles.listItem}
                />
                <View style={styles.actionButtons}>
                  <Button
                    mode="text"
                    onPress={() => onEdit(location)}
                    icon="pencil"
                    textColor={designTokens.colors.primary}
                    labelStyle={styles.actionButtonLabel}
                  >
                    Edit
                  </Button>
                  <Button
                    mode="text"
                    onPress={() => onDelete(location.id)}
                    icon="trash-can-outline"
                    textColor={designTokens.colors.error}
                    labelStyle={styles.actionButtonLabel}
                  >
                    Delete
                  </Button>
                </View>
                {index < locations.length - 1 && <Divider style={styles.divider} />}
              </View>
            ))}
          </ScrollView>
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
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: designTokens.borderRadius.md,
    backgroundColor: designTokens.colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: designTokens.spacing.sm,
  },
  icon: {
    fontSize: 24,
  },
  addButton: {
    marginRight: designTokens.spacing.sm,
  },
  addButtonContent: {
    paddingHorizontal: designTokens.spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: designTokens.spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: designTokens.spacing.md,
  },
  emptyTitle: {
    ...designTokens.typography.fontWeight.semibold,
    fontSize: designTokens.typography.fontSize.title.medium,
    color: designTokens.colors.text.primary,
    marginBottom: designTokens.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: designTokens.typography.fontSize.body.medium,
    color: designTokens.colors.text.secondary,
    textAlign: 'center',
    lineHeight: designTokens.typography.lineHeight.relaxed,
    paddingHorizontal: designTokens.spacing.lg,
  },
  listItem: {
    paddingVertical: designTokens.spacing.sm,
  },
  locationIconContainer: {
    justifyContent: 'center',
    marginRight: designTokens.spacing.sm,
  },
  locationIcon: {
    fontSize: 20,
  },
  locationTitle: {
    ...designTokens.typography.fontWeight.semibold,
    fontSize: designTokens.typography.fontSize.title.medium,
    color: designTokens.colors.text.primary,
  },
  locationDescription: {
    fontSize: designTokens.typography.fontSize.body.medium,
    color: designTokens.colors.text.secondary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: designTokens.spacing.md,
    paddingBottom: designTokens.spacing.sm,
  },
  actionButtonLabel: {
    ...designTokens.typography.fontWeight.medium,
    fontSize: designTokens.typography.fontSize.label.medium,
  },
  divider: {
    backgroundColor: designTokens.colors.divider,
    marginTop: designTokens.spacing.sm,
  },
});
