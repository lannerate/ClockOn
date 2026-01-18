// Settings service using AsyncStorage for app configuration

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings, OfficeLocation } from '../types';

const SETTINGS_KEY = '@ClockOn:settings';
const EMPLOYEE_ID_KEY = '@ClockOn:employeeId';
const OFFICE_LOCATIONS_KEY = '@ClockOn:officeLocations';

const DEFAULT_SETTINGS: AppSettings = {
  employeeId: '',
  officeLocations: [],
  debounceMinutes: 0.5, // 30 seconds
  dwellTimeSeconds: 30,
  maxAccuracyMeters: 50,
};

class SettingsService {
  async getSettings(): Promise<AppSettings> {
    try {
      const [employeeId, locationsJson] = await Promise.all([
        AsyncStorage.getItem(EMPLOYEE_ID_KEY),
        AsyncStorage.getItem(OFFICE_LOCATIONS_KEY),
      ]);

      return {
        employeeId: employeeId || '',
        officeLocations: locationsJson ? JSON.parse(locationsJson) : [],
        debounceMinutes: DEFAULT_SETTINGS.debounceMinutes,
        dwellTimeSeconds: DEFAULT_SETTINGS.dwellTimeSeconds,
        maxAccuracyMeters: DEFAULT_SETTINGS.maxAccuracyMeters,
      };
    } catch (error) {
      console.error('Failed to get settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async getEmployeeId(): Promise<string> {
    try {
      const employeeId = await AsyncStorage.getItem(EMPLOYEE_ID_KEY);
      return employeeId || '';
    } catch (error) {
      console.error('Failed to get employee ID:', error);
      return '';
    }
  }

  async setEmployeeId(employeeId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(EMPLOYEE_ID_KEY, employeeId);
      console.log('Employee ID saved:', employeeId);
    } catch (error) {
      console.error('Failed to save employee ID:', error);
      throw error;
    }
  }

  async getOfficeLocations(): Promise<OfficeLocation[]> {
    try {
      const locationsJson = await AsyncStorage.getItem(OFFICE_LOCATIONS_KEY);
      return locationsJson ? JSON.parse(locationsJson) : [];
    } catch (error) {
      console.error('Failed to get office locations:', error);
      return [];
    }
  }

  async setOfficeLocations(locations: OfficeLocation[]): Promise<void> {
    try {
      await AsyncStorage.setItem(OFFICE_LOCATIONS_KEY, JSON.stringify(locations));
      console.log('Office locations saved:', locations.length);
    } catch (error) {
      console.error('Failed to save office locations:', error);
      throw error;
    }
  }

  async addOfficeLocation(location: OfficeLocation): Promise<void> {
    try {
      const locations = await this.getOfficeLocations();
      const existingIndex = locations.findIndex((l) => l.id === location.id);

      if (existingIndex >= 0) {
        locations[existingIndex] = location;
      } else {
        locations.push(location);
      }

      await this.setOfficeLocations(locations);
      console.log('Office location added/updated:', location.id);
    } catch (error) {
      console.error('Failed to add office location:', error);
      throw error;
    }
  }

  async deleteOfficeLocation(locationId: string): Promise<void> {
    try {
      const locations = await this.getOfficeLocations();
      const filtered = locations.filter((l) => l.id !== locationId);
      await this.setOfficeLocations(filtered);
      console.log('Office location deleted:', locationId);
    } catch (error) {
      console.error('Failed to delete office location:', error);
      throw error;
    }
  }

  async clearAllSettings(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(EMPLOYEE_ID_KEY),
        AsyncStorage.removeItem(OFFICE_LOCATIONS_KEY),
      ]);
      console.log('All settings cleared');
    } catch (error) {
      console.error('Failed to clear settings:', error);
      throw error;
    }
  }

  // Generate unique ID for office locations
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export default new SettingsService();
