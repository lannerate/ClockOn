// Validation utility functions

import { OfficeLocation, EmployeeRecord } from '../types';

/**
 * Validate employee ID
 */
export function validateEmployeeId(employeeId: string): {
  valid: boolean;
  error?: string;
} {
  if (!employeeId || employeeId.trim().length === 0) {
    return { valid: false, error: 'Employee ID is required' };
  }

  if (employeeId.length < 3) {
    return { valid: false, error: 'Employee ID must be at least 3 characters' };
  }

  if (employeeId.length > 50) {
    return { valid: false, error: 'Employee ID must be less than 50 characters' };
  }

  return { valid: true };
}

/**
 * Validate office location
 */
export function validateOfficeLocation(location: OfficeLocation): {
  valid: boolean;
  error?: string;
} {
  if (!location.name || location.name.trim().length === 0) {
    return { valid: false, error: 'Location name is required' };
  }

  if (location.name.length > 100) {
    return { valid: false, error: 'Location name must be less than 100 characters' };
  }

  if (location.latitude < -90 || location.latitude > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }

  if (location.longitude < -180 || location.longitude > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }

  if (location.radius < 10 || location.radius > 500) {
    return { valid: false, error: 'Radius must be between 10 and 500 meters' };
  }

  return { valid: true };
}

/**
 * Validate coordinates
 */
export function validateCoordinates(latitude: number, longitude: number): {
  valid: boolean;
  error?: string;
} {
  if (isNaN(latitude) || isNaN(longitude)) {
    return { valid: false, error: 'Coordinates must be valid numbers' };
  }

  if (latitude < -90 || latitude > 90) {
    return { valid: false, error: 'Latitude must be between -90 and 90' };
  }

  if (longitude < -180 || longitude > 180) {
    return { valid: false, error: 'Longitude must be between -180 and 180' };
  }

  return { valid: true };
}

/**
 * Validate employee record
 */
export function validateEmployeeRecord(record: EmployeeRecord): {
  valid: boolean;
  error?: string;
} {
  if (!record.id || record.id.trim().length === 0) {
    return { valid: false, error: 'Record ID is required' };
  }

  if (!record.employeeId || record.employeeId.trim().length === 0) {
    return { valid: false, error: 'Employee ID is required' };
  }

  if (!record.timestamp || record.timestamp.trim().length === 0) {
    return { valid: false, error: 'Timestamp is required' };
  }

  if (!['IN', 'OUT'].includes(record.clockType)) {
    return { valid: false, error: 'Clock type must be IN or OUT' };
  }

  if (!['AUTOMATIC_GEOFENCE', 'MANUAL_CHECK'].includes(record.triggerMethod)) {
    return { valid: false, error: 'Trigger method is invalid' };
  }

  const coordValidation = validateCoordinates(
    record.location.latitude,
    record.location.longitude
  );

  if (!coordValidation.valid) {
    return coordValidation;
  }

  return { valid: true };
}

/**
 * Validate GPS accuracy
 */
export function validateAccuracy(accuracy: number, maxAccuracy: number): {
  valid: boolean;
  error?: string;
} {
  if (isNaN(accuracy)) {
    return { valid: false, error: 'Accuracy must be a valid number' };
  }

  if (accuracy < 0) {
    return { valid: false, error: 'Accuracy cannot be negative' };
  }

  if (accuracy > maxAccuracy) {
    return {
      valid: false,
      error: `GPS accuracy (${Math.round(accuracy)}m) exceeds maximum (${maxAccuracy}m)`,
    };
  }

  return { valid: true };
}

/**
 * Validate debounce time
 */
export function validateDebounceTime(
  lastClockTime: string,
  debounceMinutes: number
): { valid: boolean; remainingSeconds?: number } {
  if (!lastClockTime) {
    return { valid: true };
  }

  const lastTime = new Date(lastClockTime).getTime();
  const now = Date.now();
  const elapsed = now - lastTime;
  const debounceMs = debounceMinutes * 60 * 1000;

  if (elapsed < debounceMs) {
    const remaining = Math.ceil((debounceMs - elapsed) / 1000);
    return { valid: false, remainingSeconds: remaining };
  }

  return { valid: true };
}

/**
 * Generate UUID for records
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
