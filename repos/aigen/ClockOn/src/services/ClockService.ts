// Clock service - business logic for clock in/out operations

import { Platform } from 'react-native';
import { EmployeeRecord, ClockStatus, Location, ClockType, TriggerMethod } from '../types';
import DatabaseService from '../database/DatabaseService';
import SettingsService from './SettingsService';
import LocationService from './LocationService';
import { isInGeofence as checkInGeofence, isAccurateEnough } from '../utils/location';
import { validateDebounceTime, generateUUID, validateAccuracy } from '../utils/validation';

type ClockEventCallback = (record: EmployeeRecord) => void;
type ErrorCallback = (error: string) => void;

class ClockService {
  private currentStatus: ClockStatus = {
    isClockedIn: false,
    todayRecords: [],
  };
  private clockEventListeners = new Set<ClockEventCallback>();
  private errorListeners = new Set<ErrorCallback>();
  private initialized = false;

  /**
   * Initialize the clock service
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      await DatabaseService.initialize();

      // Set up geofence event listeners
      LocationService.onGeofenceEvent(this.handleGeofenceEvent);

      // Set up location error listeners
      LocationService.onError(this.handleLocationError);

      this.initialized = true;
      console.log('ClockService initialized');
    } catch (error) {
      console.error('Failed to initialize ClockService:', error);
      throw error;
    }
  }

  /**
   * Refresh current clock status
   */
  async refreshStatus(): Promise<ClockStatus> {
    const employeeId = await SettingsService.getEmployeeId();

    if (!employeeId) {
      this.currentStatus = {
        isClockedIn: false,
        todayRecords: [],
      };
      return this.currentStatus;
    }

    try {
      const [lastRecord, lastClockIn, lastClockOut, todayRecords] =
        await Promise.all([
          DatabaseService.getLastRecord(employeeId),
          DatabaseService.getLastClockIn(employeeId),
          DatabaseService.getLastClockOut(employeeId),
          DatabaseService.getTodayRecords(employeeId),
        ]);

      const isClockedIn =
        lastRecord?.clockType === 'IN' &&
        (!lastClockOut || new Date(lastClockOut.timestamp) < new Date(lastRecord.timestamp));

      this.currentStatus = {
        isClockedIn,
        currentRecord: isClockedIn ? lastRecord : undefined,
        lastClockIn: lastClockIn || undefined,
        lastClockOut: lastClockOut || undefined,
        todayRecords,
      };

      return this.currentStatus;
    } catch (error) {
      console.error('Failed to refresh status:', error);
      throw error;
    }
  }

  /**
   * Get current clock status
   */
  async getStatus(): Promise<ClockStatus> {
    if (!this.initialized) {
      await this.initialize();
    }
    return this.refreshStatus();
  }

  /**
   * Manual clock in
   */
  async clockIn(): Promise<EmployeeRecord | null> {
    const employeeId = await SettingsService.getEmployeeId();

    if (!employeeId) {
      this.notifyError('Employee ID not configured');
      return null;
    }

    // Check if already clocked in
    const status = await this.getStatus();
    if (status.isClockedIn) {
      this.notifyError('Already clocked in');
      return null;
    }

    // Get current location
    const location = await LocationService.getCurrentLocation();
    if (!location) {
      this.notifyError('Unable to get current location');
      return null;
    }

    // Validate accuracy
    const settings = await SettingsService.getSettings();
    if (!isAccurateEnough(location, settings.maxAccuracyMeters)) {
      this.notifyError(
        `GPS accuracy too low (${location.accuracy}m). Please try again.`
      );
      return null;
    }

    // Check if in geofence (optional for manual clock in)
    const offices = await SettingsService.getOfficeLocations();
    const { inGeofence, nearestOffice } = checkInGeofence(location, offices);

    if (!inGeofence && offices.length > 0) {
      this.notifyError('Not in office geofence. Please move closer to the office.');
      return null;
    }

    // Check debounce time
    if (status.lastClockOut) {
      const debounceCheck = validateDebounceTime(
        status.lastClockOut.timestamp,
        settings.debounceMinutes
      );

      if (!debounceCheck.valid) {
        this.notifyError(
          `Please wait ${debounceCheck.remainingSeconds} seconds before clocking in again`
        );
        return null;
      }
    }

    // Create record
    const record = await this.createRecord(
      employeeId,
      'IN',
      location,
      'MANUAL_CHECK'
    );

    await DatabaseService.insertRecord(record);
    await this.refreshStatus();
    this.notifyClockEvent(record);

    console.log('Clocked IN:', record.id);
    return record;
  }

  /**
   * Manual clock out
   */
  async clockOut(): Promise<EmployeeRecord | null> {
    const employeeId = await SettingsService.getEmployeeId();

    if (!employeeId) {
      this.notifyError('Employee ID not configured');
      return null;
    }

    // Check if clocked in
    const status = await this.getStatus();
    if (!status.isClockedIn) {
      this.notifyError('Not clocked in');
      return null;
    }

    // Get current location
    const location = await LocationService.getCurrentLocation();
    if (!location) {
      this.notifyError('Unable to get current location');
      return null;
    }

    // Validate accuracy
    const settings = await SettingsService.getSettings();
    if (!isAccurateEnough(location, settings.maxAccuracyMeters)) {
      this.notifyError(
        `GPS accuracy too low (${location.accuracy}m). Please try again.`
      );
      return null;
    }

    // Check debounce time
    if (status.currentRecord) {
      const debounceCheck = validateDebounceTime(
        status.currentRecord.timestamp,
        settings.debounceMinutes
      );

      if (!debounceCheck.valid) {
        this.notifyError(
          `Please wait ${debounceCheck.remainingSeconds} seconds before clocking out`
        );
        return null;
      }
    }

    // Create record
    const record = await this.createRecord(
      employeeId,
      'OUT',
      location,
      'MANUAL_CHECK'
    );

    await DatabaseService.insertRecord(record);
    await this.refreshStatus();
    this.notifyClockEvent(record);

    console.log('Clocked OUT:', record.id);
    return record;
  }

  /**
   * Handle automatic geofence events
   */
  private handleGeofenceEvent = async (
    event: any
  ): Promise<void> => {
    const employeeId = await SettingsService.getEmployeeId();
    if (!employeeId) {
      console.log('No employee ID configured, skipping automatic clock');
      return;
    }

    const settings = await SettingsService.getSettings();
    const status = await this.getStatus();

    // Entry event - clock in
    if (event.type === 'entry' && !status.isClockedIn) {
      // Check debounce time
      if (status.lastClockOut) {
        const debounceCheck = validateDebounceTime(
          status.lastClockOut.timestamp,
          settings.debounceMinutes
        );

        if (!debounceCheck.valid) {
          console.log('Debounce active, skipping automatic clock in');
          return;
        }
      }

      // Check accuracy
      if (event.currentPosition.accuracy) {
        const accuracyCheck = validateAccuracy(
          event.currentPosition.accuracy,
          settings.maxAccuracyMeters
        );

        if (!accuracyCheck.valid) {
          console.log('Low accuracy, skipping automatic clock in:', accuracyCheck.error);
          return;
        }
      }

      // Create automatic clock in record
      const record = await this.createRecord(
        employeeId,
        'IN',
        event.currentPosition,
        'AUTOMATIC_GEOFENCE'
      );

      await DatabaseService.insertRecord(record);
      await this.refreshStatus();
      this.notifyClockEvent(record);

      console.log('Automatic clock IN:', record.id);
    }
    // Exit event - clock out
    else if (event.type === 'exit' && status.isClockedIn) {
      // Check debounce time
      if (status.currentRecord) {
        const debounceCheck = validateDebounceTime(
          status.currentRecord.timestamp,
          settings.debounceMinutes
        );

        if (!debounceCheck.valid) {
          console.log('Debounce active, skipping automatic clock out');
          return;
        }
      }

      // Create automatic clock out record
      const record = await this.createRecord(
        employeeId,
        'OUT',
        event.currentPosition,
        'AUTOMATIC_GEOFENCE'
      );

      await DatabaseService.insertRecord(record);
      await this.refreshStatus();
      this.notifyClockEvent(record);

      console.log('Automatic clock OUT:', record.id);
    }
  };

  /**
   * Handle location errors
   */
  private handleLocationError = (error: string): void => {
    this.notifyError(error);
  };

  /**
   * Create a new employee record
   */
  private async createRecord(
    employeeId: string,
    clockType: ClockType,
    location: Location,
    triggerMethod: TriggerMethod
  ): Promise<EmployeeRecord> {
    const appVersion = '1.0.0'; // Could be from package.json

    return {
      id: generateUUID(),
      employeeId,
      timestamp: new Date().toISOString(),
      clockType,
      location,
      triggerMethod,
      deviceInfo: {
        platform: Platform.OS as 'ios' | 'android',
        appVersion,
      },
    };
  }

  /**
   * Subscribe to clock events
   */
  onClockEvent(callback: ClockEventCallback): () => void {
    this.clockEventListeners.add(callback);
    return () => this.clockEventListeners.delete(callback);
  }

  /**
   * Subscribe to errors
   */
  onError(callback: ErrorCallback): () => void {
    this.errorListeners.add(callback);
    return () => this.errorListeners.delete(callback);
  }

  private notifyClockEvent(record: EmployeeRecord): void {
    this.clockEventListeners.forEach((callback) => {
      try {
        callback(record);
      } catch (error) {
        console.error('Error in clock event listener:', error);
      }
    });
  }

  private notifyError(error: string): void {
    this.errorListeners.forEach((callback) => {
      try {
        callback(error);
      } catch (err) {
        console.error('Error in error listener:', err);
      }
    });
  }

  /**
   * Get today's work duration in milliseconds
   */
  async getTodayWorkDuration(): Promise<number> {
    const status = await this.getStatus();
    let totalDuration = 0;
    let clockInTime: Date | null = null;

    // Sort records by timestamp
    const sortedRecords = [...status.todayRecords].sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (const record of sortedRecords) {
      if (record.clockType === 'IN') {
        clockInTime = new Date(record.timestamp);
      } else if (record.clockType === 'OUT' && clockInTime) {
        const clockOutTime = new Date(record.timestamp);
        totalDuration += clockOutTime.getTime() - clockInTime.getTime();
        clockInTime = null;
      }
    }

    // If currently clocked in, add time from last clock in to now
    if (status.isClockedIn && status.currentRecord) {
      const now = Date.now();
      const clockInTime = new Date(status.currentRecord.timestamp).getTime();
      totalDuration += now - clockInTime;
    }

    return totalDuration;
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.clockEventListeners.clear();
    this.errorListeners.clear();
  }
}

export default new ClockService();
