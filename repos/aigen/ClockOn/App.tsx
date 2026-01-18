/**
 * ClockOn - Employee Attendance Tracking App
 * Automatic geofence-based clock in/out system
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Navigation from './src/navigation/Navigation';
import LocationService from './src/services/LocationService';
import ClockService from './src/services/ClockService';

function App() {
  useEffect(() => {
    // Initialize services on app start
    initializeApp();

    return () => {
      // Cleanup on app unmount
      LocationService.cleanup();
      ClockService.cleanup();
    };
  }, []);

  const initializeApp = async () => {
    try {
      console.log('Initializing ClockOn app...');

      // Initialize clock service (which initializes database)
      await ClockService.initialize();

      // Start background geofencing
      await LocationService.startBackgroundGeofencing();

      console.log('ClockOn app initialized successfully');
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Navigation />
    </SafeAreaProvider>
  );
}

export default App;
