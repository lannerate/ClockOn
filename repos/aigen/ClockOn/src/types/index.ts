// Core type definitions for ClockOn app

export type ClockType = 'IN' | 'OUT';

export type TriggerMethod = 'AUTOMATIC_GEOFENCE' | 'MANUAL_CHECK';

export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface DeviceInfo {
  platform: 'ios' | 'android';
  appVersion: string;
}

export interface EmployeeRecord {
  id: string;
  employeeId: string;
  timestamp: string; // ISO datetime
  clockType: ClockType;
  location: Location;
  triggerMethod: TriggerMethod;
  deviceInfo: DeviceInfo;
}

export interface OfficeLocation {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number; // meters
  enabled: boolean;
}

export interface ClockStatus {
  isClockedIn: boolean;
  currentRecord?: EmployeeRecord;
  lastClockIn?: EmployeeRecord;
  lastClockOut?: EmployeeRecord;
  todayRecords: EmployeeRecord[];
}

export interface LocationStatus {
  isInGeofence: boolean;
  distance?: number; // meters to nearest office
  nearestOffice?: OfficeLocation;
  currentLocation?: Location;
}

export interface GeofenceEvent {
  type: 'entry' | 'exit';
  location: OfficeLocation;
  timestamp: number;
  currentPosition: Location;
}

export interface AppSettings {
  employeeId: string;
  officeLocations: OfficeLocation[];
  debounceMinutes: number; // default 5
  dwellTimeSeconds: number; // default 30
  maxAccuracyMeters: number; // default 50
}

export interface MonthlyStats {
  year: number;
  month: number; // 1-12
  totalWorkingDays: number;
  daysClockedIn: number;
  attendanceRate: number; // 0-100 percentage
  totalHours: number; // total hours worked
  records: EmployeeRecord[];
}
