// Dashboard screen - main attendance status display (Enhanced UI)

import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  useTheme,
  Divider,
} from 'react-native-paper';
import { format } from 'date-fns';
import useAppStore from '../store/useAppStore';
import ClockService from '../services/ClockService';
import LocationService from '../services/LocationService';
import SettingsService from '../services/SettingsService';
import { formatDistance, isInGeofence as checkInGeofence } from '../utils/location';
import { EmployeeRecord } from '../types';

// Enhanced UI Components
import { StatusCard } from '../components/StatusCard';
import { LocationCard } from '../components/LocationCard';
import { ClockButton } from '../components/ClockButton';
import { ActivityCard } from '../components/ActivityCard';
import { clockOnTheme } from '../theme/theme';

const DashboardScreen: React.FC = () => {
  const theme = useTheme();
  const {
    clockStatus,
    locationStatus,
    isLoading,
    error,
    setClockStatus,
    setLocationStatus,
    setIsLoading,
    setError,
    setRecentEvent,
  } = useAppStore();

  const [workDuration, setWorkDuration] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Load initial data
  useEffect(() => {
    initializeData();

    // Subscribe to clock events
    const unsubscribe = ClockService.onClockEvent((record) => {
      setRecentEvent(record);
      refreshStatus();
    });

    // Subscribe to location errors
    const unsubscribeError = ClockService.onError((errorMessage) => {
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    });

    // Subscribe to location updates
    const unsubscribeLocation = LocationService.onLocationUpdate(
      (location) => {
        updateLocationStatus(location);
      }
    );

    // Start location watching
    LocationService.startWatching();

    // Timer for work duration
    const durationInterval = setInterval(() => {
      if (clockStatus?.isClockedIn) {
        updateWorkDuration();
      }
    }, 1000);

    return () => {
      unsubscribe();
      unsubscribeError();
      unsubscribeLocation();
      clearInterval(durationInterval);
    };
  }, []);

  const initializeData = async () => {
    try {
      setIsLoading(true);

      // Initialize clock service
      await ClockService.initialize();

      // Load settings
      const employeeId = await SettingsService.getEmployeeId();
      if (!employeeId) {
        Alert.alert(
          'Welcome',
          'Please configure your employee ID in Settings to get started.'
        );
      }

      await refreshStatus();

      // Get current location
      const location = await LocationService.getCurrentLocation();
      if (location) {
        updateLocationStatus(location);
      }
    } catch (err) {
      setError('Failed to initialize app');
      console.error('Initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshStatus = async () => {
    try {
      const status = await ClockService.getStatus();
      setClockStatus(status);
      await updateWorkDuration();
    } catch (err) {
      console.error('Failed to refresh status:', err);
    }
  };

  const updateLocationStatus = async (location: any) => {
    const offices = await SettingsService.getOfficeLocations();
    const { inGeofence: isInGeofence, distance, nearestOffice } = checkInGeofence(location, offices);

    setLocationStatus({
      isInGeofence,
      distance,
      nearestOffice,
      currentLocation: location,
    });
  };

  const updateWorkDuration = async () => {
    const duration = await ClockService.getTodayWorkDuration();
    setWorkDuration(duration);
  };

  const handleClockIn = async () => {
    try {
      setIsLoading(true);
      const record = await ClockService.clockIn();
      if (record) {
        Alert.alert('Success', `Clocked IN at ${formatTime(record.timestamp)}`);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to clock in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      setIsLoading(true);
      const record = await ClockService.clockOut();
      if (record) {
        Alert.alert('Success', `Clocked OUT at ${formatTime(record.timestamp)}`);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to clock out');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshStatus();
    const location = await LocationService.getCurrentLocation();
    if (location) {
      updateLocationStatus(location);
    }
    setRefreshing(false);
  };

  const formatTime = (timestamp: string) => {
    return format(new Date(timestamp), 'HH:mm:ss');
  };

  const formatDuration = (milliseconds: number) => {
    const seconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(secs).padStart(2, '0')}`;
  };

  const isClockedIn = clockStatus?.isClockedIn || false;
  const locationInfo = locationStatus;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={clockOnTheme.colors.primary}
        />
      }
    >
      {/* Status Card - Shows clock in/out status and duration */}
      <StatusCard
        isClockedIn={isClockedIn}
        workDuration={workDuration}
        clockInTime={clockStatus?.currentRecord ? formatTime(clockStatus.currentRecord.timestamp) : undefined}
      />

      {/* Location Card - Shows geofence status */}
      <LocationCard locationStatus={locationStatus} />

      {/* Action Buttons - Clock In / Clock Out */}
      <View style={styles.buttonContainer}>
        <ClockButton
          type="in"
          disabled={isClockedIn || isLoading}
          loading={isLoading}
          onPress={handleClockIn}
        />
        <ClockButton
          type="out"
          disabled={!isClockedIn || isLoading}
          loading={isLoading}
          onPress={handleClockOut}
        />
      </View>

      {/* Today's Activity */}
      <ActivityCard records={clockStatus?.todayRecords || []} />

      {/* Last Activity Summary */}
      {(clockStatus?.lastClockIn || clockStatus?.lastClockOut) && (
        <View style={styles.lastActivityContainer}>
          <Text variant="titleLarge" style={styles.sectionTitle}>
            Last Activity
          </Text>
          {clockStatus?.lastClockIn && (
            <View style={styles.lastActivityItem}>
              <Text variant="bodyMedium" style={styles.lastActivityLabel}>
                Last Clock In
              </Text>
              <Text variant="bodyMedium" style={styles.lastActivityValue}>
                {formatTime(clockStatus.lastClockIn.timestamp)}
              </Text>
            </View>
          )}
          {clockStatus?.lastClockOut && (
            <View style={styles.lastActivityItem}>
              <Text variant="bodyMedium" style={styles.lastActivityLabel}>
                Last Clock Out
              </Text>
              <Text variant="bodyMedium" style={styles.lastActivityValue}>
                {formatTime(clockStatus.lastClockOut.timestamp)}
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    fontWeight: '600' as const,
    fontSize: 22,
    color: '#1E293B',
    marginBottom: 16,
  },
  lastActivityContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  lastActivityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  lastActivityLabel: {
    color: '#475569',
  },
  lastActivityValue: {
    fontWeight: '600' as const,
    color: '#1E293B',
  },
});

export default DashboardScreen;
