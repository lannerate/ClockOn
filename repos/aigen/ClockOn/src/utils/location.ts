// Location utility functions

import { Location, OfficeLocation } from '../types';

/**
 * Calculate distance between two coordinates using Haversine formula
 * @returns distance in meters
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if a location is within any office geofence
 */
export function isInGeofence(
  currentLocation: Location,
  offices: OfficeLocation[]
): { inGeofence: boolean; nearestOffice?: OfficeLocation; distance?: number } {
  if (offices.length === 0) {
    return { inGeofence: false };
  }

  const enabledOffices = offices.filter((o) => o.enabled);
  if (enabledOffices.length === 0) {
    return { inGeofence: false };
  }

  let nearestDistance = Infinity;
  let nearestOffice: OfficeLocation | undefined;

  for (const office of enabledOffices) {
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      office.latitude,
      office.longitude
    );

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestOffice = office;
    }

    if (distance <= office.radius) {
      return { inGeofence: true, nearestOffice: office, distance };
    }
  }

  return {
    inGeofence: false,
    nearestOffice,
    distance: nearestDistance,
  };
}

/**
 * Get the nearest office location
 */
export function getNearestOffice(
  currentLocation: Location,
  offices: OfficeLocation[]
): { office?: OfficeLocation; distance: number } | null {
  if (offices.length === 0) {
    return null;
  }

  const enabledOffices = offices.filter((o) => o.enabled);
  if (enabledOffices.length === 0) {
    return null;
  }

  let nearestDistance = Infinity;
  let nearestOffice: OfficeLocation | undefined;

  for (const office of enabledOffices) {
    const distance = calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      office.latitude,
      office.longitude
    );

    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestOffice = office;
    }
  }

  return nearestOffice ? { office: nearestOffice, distance: nearestDistance } : null;
}

/**
 * Check if location accuracy is acceptable
 */
export function isAccurateEnough(
  location: Location,
  maxAccuracyMeters: number
): boolean {
  if (!location.accuracy) {
    return true; // No accuracy data, assume acceptable
  }
  return location.accuracy <= maxAccuracyMeters;
}

/**
 * Format location for display
 */
export function formatLocation(location: Location): string {
  return `${location.latitude.toFixed(6)}, ${location.longitude.toFixed(6)}`;
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
