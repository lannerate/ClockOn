// LocationCard - Displays current location and geofence status
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { designTokens } from '../theme/theme';
import { LocationStatus } from '../types';

interface LocationCardProps {
  locationStatus: LocationStatus | null;
  style?: ViewStyle;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  locationStatus,
  style,
}) => {
  const formatDistance = (meters: number) => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const isInGeofence = locationStatus?.isInGeofence || false;
  const statusColor = isInGeofence
    ? designTokens.colors.inGeofence
    : designTokens.colors.outOfGeofence;
  const statusIcon = isInGeofence ? 'map-marker-check' : 'map-marker-alert';

  return (
    <Card style={[styles.card, style]}>
      <Card.Title
        title="Location Status"
        titleVariant="titleLarge"
        left={() => <Text style={{ fontSize: 24 }}>📍</Text>}
      />
      <Card.Content>
        <View style={styles.locationRow}>
          <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          <View style={styles.locationText}>
            <Text variant="titleMedium" style={styles.locationTitle}>
              {isInGeofence ? 'In Office' : 'Outside Office'}
            </Text>
            {locationStatus?.nearestOffice && (
              <Text variant="bodyMedium" style={styles.locationSubtitle}>
                {locationStatus.nearestOffice.name}
                {locationStatus.distance !== undefined && (
                  ` · ${formatDistance(locationStatus.distance)} away`
                )}
              </Text>
            )}
            {!locationStatus?.nearestOffice && (
              <Text variant="bodyMedium" style={styles.locationSubtitle}>
                No office configured
              </Text>
            )}
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: designTokens.spacing.sm,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: designTokens.borderRadius.full,
    marginRight: designTokens.spacing.md,
  },
  locationText: {
    flex: 1,
  },
  locationTitle: {
    ...designTokens.typography.fontWeight.semibold,
    color: designTokens.colors.text.primary,
    marginBottom: 2,
  },
  locationSubtitle: {
    color: designTokens.colors.text.secondary,
    lineHeight: designTokens.typography.lineHeight.normal,
  },
});
