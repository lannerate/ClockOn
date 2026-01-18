// Dashboard screen - main attendance status display (Enhanced UI)

import React, { useEffect, useState, useCallback } from 'react';
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
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import useAppStore from '../store/useAppStore';
import ClockService from '../services/ClockService';
import LocationService from '../services/LocationService';
import SettingsService from '../services/SettingsService';
import DatabaseService from '../database/DatabaseService';
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
  const [totalDaysWorked, setTotalDaysWorked] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  // Ref to track timer ID
  const durationIntervalRef = React.useRef<NodeJS.Timeout | null>(null);

  // Load initial data
  useEffect(() => {
    initializeData();

    // Subscribe to clock events - refresh ALL dashboard data immediately
    const unsubscribe = ClockService.onClockEvent(async (record) => {
      setRecentEvent(record);

      // Refresh everything in parallel for instant updates
      // Use Promise.all to execute all queries simultaneously
      const [status, location] = await Promise.all([
        ClockService.getStatus(),
        LocationService.getCurrentLocation(),
      ]);

      // Update all state immediately - no waiting between updates
      setClockStatus(status);
      updateWorkDuration();
      updateTotalDaysWorked();

      if (location) {
        await updateLocationStatus(location);
      }
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

    return () => {
      unsubscribe();
      unsubscribeError();
      unsubscribeLocation();
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  // Separate effect for timer to access latest clockStatus
  useEffect(() => {
    // Clear any existing timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
    }

    // Timer for work duration - update when clocked in for live counter
    if (clockStatus?.isClockedIn) {
      durationIntervalRef.current = setInterval(() => {
        updateWorkDuration();
      }, 1000);
    }

    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, [clockStatus?.isClockedIn]); // Re-run when clock status changes

  // Refresh all data when dashboard comes into focus (after deleting records, etc.)
  useFocusEffect(
    useCallback(() => {
      refreshAll();
    }, [])
  );

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

      // Update total days worked
      await updateTotalDaysWorked();

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

  const updateTotalDaysWorked = async () => {
    try {
      const employeeId = await SettingsService.getEmployeeId();
      if (!employeeId) {
        return;
      }

      const allRecords = await DatabaseService.getAllRecords(employeeId);

      // Count unique days with clock-in records
      const uniqueDays = new Set<string>();
      allRecords.forEach((record) => {
        const date = new Date(record.timestamp);
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        uniqueDays.add(dateKey);
      });

      setTotalDaysWorked(uniqueDays.size);
    } catch (error) {
      console.error('Failed to update total days worked:', error);
    }
  };

  // Comprehensive refresh - updates ALL dashboard data in parallel
  const refreshAll = async () => {
    try {
      // Refresh all data in parallel for maximum speed
      const [status, location] = await Promise.all([
        ClockService.getStatus(),
        LocationService.getCurrentLocation(),
      ]);

      // Update clock status and work duration
      setClockStatus(status);
      updateWorkDuration();
      updateTotalDaysWorked();

      // Update location status if we got a location
      if (location) {
        await updateLocationStatus(location);
      }
    } catch (err) {
      console.error('Failed to refresh all data:', err);
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

  const handleClockIn = async () => {
    try {
      setIsLoading(true);
      const record = await ClockService.clockIn();
      if (record) {
        Alert.alert('Success', `Clocked IN at ${formatTime(record.timestamp)}`);
        // Clock event listener will trigger refreshAll automatically
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
        // Clock event listener will trigger refreshAll automatically
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to clock out');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshAll();
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
        totalDaysWorked={totalDaysWorked}
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
      <ActivityCard
        records={clockStatus?.todayRecords || []}
        onRefresh={refreshAll}
      />
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
});

export default DashboardScreen;
