// Location service for GPS tracking and geofencing

import { Platform, AppState, AppStateStatus } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { Location, OfficeLocation, GeofenceEvent } from '../types';
import { isInGeofence as checkInGeofence, isAccurateEnough } from '../utils/location';
import SettingsService from './SettingsService';

type LocationCallback = (location: Location) => void;
type GeofenceCallback = (event: GeofenceEvent) => void;
type ErrorCallback = (error: string) => void;

class LocationService {
  private currentLocation: Location | null = null;
  private isWatching = false;
  private listeners: Set<LocationCallback> = new Set();
  private geofenceListeners: Set<GeofenceCallback> = new Set();
  private errorListeners: Set<ErrorCallback> = new Set();
  private lastGeofenceState: Map<string, boolean> = new Map(); // Track per-office state
  private dwellTimers: Map<string, number> = new Map();
  private appState = AppState.currentState;

  constructor() {
    this.setupAppStateListener();
  }

  private setupAppStateListener() {
    AppState.addEventListener('change', this.handleAppStateChange);
  }

  private handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (
      this.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      // App has come to the foreground
      console.log('App came to foreground, refreshing location');
      this.getCurrentLocation();
    }
    this.appState = nextAppState;
  };

  /**
   * Request location permissions
   */
  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const auth = await Geolocation.requestAuthorization('whenInUse');
        return auth === 'granted';
      } else {
        const granted = await Geolocation.requestAuthorization('always');
        return granted === 'granted';
      }
    } catch (error) {
      console.error('Failed to request location permissions:', error);
      return false;
    }
  }

  /**
   * Check if location services are enabled
   */
  async isLocationEnabled(): Promise<boolean> {
    try {
      return await Geolocation.requestAuthorization('whenInUse')
        .then(() => true)
        .catch(() => false);
    } catch {
      return false;
    }
  }

  /**
   * Get current location once
   */
  async getCurrentLocation(): Promise<Location | null> {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          this.currentLocation = location;
          this.notifyListeners(location);
          resolve(location);
        },
        (error) => {
          console.error('Geolocation error:', error);
          this.notifyErrorListeners(this.getErrorMessage(error));
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
          accuracy: { android: 'high', ios: 'best' },
        }
      );
    });
  }

  /**
   * Start watching location
   */
  async startWatching(): Promise<void> {
    if (this.isWatching) {
      return;
    }

    try {
      this.isWatching = true;

      // Foreground location watching
      this.watchId = Geolocation.watchPosition(
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
          };
          this.currentLocation = location;
          this.notifyListeners(location);
          this.checkGeofenceTransition(location);
        },
        (error) => {
          console.error('Location watch error:', error);
          this.notifyErrorListeners(this.getErrorMessage(error));
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 10, // Update every 10 meters
          interval: 5000, // Every 5 seconds
          fastestInterval: 3000,
          accuracy: { android: 'high', ios: 'best' },
        }
      );

      console.log('Location watching started');
    } catch (error) {
      console.error('Failed to start location watching:', error);
      this.isWatching = false;
    }
  }

  /**
   * Stop watching location
   */
  stopWatching(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isWatching = false;
    console.log('Location watching stopped');
  }

  private watchId: number | null = null;

  /**
   * Start background geofencing
   */
  async startBackgroundGeofencing(): Promise<void> {
    const offices = await SettingsService.getOfficeLocations();
    const enabledOffices = offices.filter((o) => o.enabled);

    if (enabledOffices.length === 0) {
      console.log('No enabled offices, skipping background geofencing');
      return;
    }

    // Note: Background geofencing requires additional platform-specific setup
    // For now, foreground geofencing via watchPosition is enabled
    console.log('Background geofencing: Enabled offices', enabledOffices.length);

    // Initialize geofence states
    for (const office of enabledOffices) {
      this.lastGeofenceState.set(office.id, false);
    }

    try {
      // Try to configure background geolocation (may not work on all platforms)
      // The foreground location watcher will handle geofence detection
      console.log('Background geofencing initialized (foreground active)');
    } catch (error) {
      console.warn('Background geofencing not fully supported:', error);
    }
  }

  /**
   * Stop background geofencing
   */
  async stopBackgroundGeofencing(): Promise<void> {
    this.lastGeofenceState.clear();
    console.log('Background geofencing stopped');
  }

  /**
   * Check for geofence transitions (for foreground)
   */
  private async checkGeofenceTransition(location: Location): Promise<void> {
    const offices = await SettingsService.getOfficeLocations();
    const enabledOffices = offices.filter((o) => o.enabled);

    if (enabledOffices.length === 0) {
      return;
    }

    for (const office of enabledOffices) {
      const { inGeofence } = checkInGeofence(location, [office]);
      const wasInGeofence = this.lastGeofenceState.get(office.id) || false;

      if (inGeofence && !wasInGeofence) {
        // Entry detected - use dwell time to confirm
        this.handleEntryWithDwell(office, location);
      } else if (!inGeofence && wasInGeofence) {
        // Exit detected - immediate
        this.lastGeofenceState.set(office.id, false);
        this.clearDwellTimer(office.id);
        this.notifyGeofenceListeners({
          type: 'exit',
          location: office,
          timestamp: Date.now(),
          currentPosition: location,
        });
      }
    }
  }

  /**
   * Handle entry with dwell time check
   */
  private handleEntryWithDwell(office: OfficeLocation, location: Location): void {
    // Clear existing timer
    this.clearDwellTimer(office.id);

    // Set dwell timer
    const settings = SettingsService.getSettings().then((s) => {
      const dwellTime = s.dwellTimeSeconds * 1000;

      const timer = setTimeout(() => {
        // Double-check still in geofence
        const { inGeofence } = checkInGeofence(
          this.currentLocation || location,
          [office]
        );

        if (inGeofence) {
          this.lastGeofenceState.set(office.id, true);
          this.notifyGeofenceListeners({
            type: 'entry',
            location: office,
            timestamp: Date.now(),
            currentPosition: this.currentLocation || location,
          });
        }
      }, dwellTime);

      this.dwellTimers.set(office.id, timer);
    });
  }

  private clearDwellTimer(officeId: string): void {
    const timer = this.dwellTimers.get(officeId);
    if (timer) {
      clearTimeout(timer);
      this.dwellTimers.delete(officeId);
    }
  }

  /**
   * Subscribe to location updates
   */
  onLocationUpdate(callback: LocationCallback): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  /**
   * Subscribe to geofence events
   */
  onGeofenceEvent(callback: GeofenceCallback): () => void {
    this.geofenceListeners.add(callback);
    return () => this.geofenceListeners.delete(callback);
  }

  /**
   * Subscribe to errors
   */
  onError(callback: ErrorCallback): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  private notifyListeners(location: Location): void {
    this.listeners.forEach((callback) => {
      try {
        callback(location);
      } catch (error) {
        console.error('Error in location listener:', error);
      }
    });
  }

  private notifyGeofenceListeners(event: GeofenceEvent): void {
    this.geofenceListeners.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in geofence listener:', error);
      }
    });
  }

  private notifyErrorListeners(error: string): void {
    this.errorListeners.forEach((callback) => {
      try {
        callback(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }

  private getErrorMessage(error: any): string {
    if (error.code === 1) {
      return 'Location permission denied';
    } else if (error.code === 2) {
      return 'Location unavailable. Please check your GPS';
    } else if (error.code === 3) {
      return 'Location request timed out';
    }
    return error.message || 'Unknown location error';
  }

  /**
   * Get current cached location
   */
  getCurrentCachedLocation(): Location | null {
    return this.currentLocation;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.stopWatching();
    this.stopBackgroundGeofencing();
    this.dwellTimers.forEach((timer) => clearTimeout(timer));
    this.dwellTimers.clear();
  }
}

export default new LocationService();
