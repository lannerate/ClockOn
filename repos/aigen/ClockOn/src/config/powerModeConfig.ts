// Power mode configurations for battery-optimized location tracking

import { PowerMode, PowerModeConfig } from '../types';

/**
 * Power mode configurations
 *
 * High Performance: Maximum accuracy, frequent updates (2-5% battery/hour)
 * Balanced: Good accuracy with moderate updates (1-2% battery/hour)
 * Power Saver: Basic accuracy with minimal updates (<1% battery/hour)
 */
export const POWER_MODE_CONFIGS: Record<PowerMode, PowerModeConfig> = {
  high_performance: {
    distanceFilter: 5, // 5 meters
    interval: 3000, // 3 seconds
    fastestInterval: 2000, // 2 seconds
    accuracy: {
      android: 'high',
      ios: 'best',
    },
    adaptiveUpdates: true,
    significantLocationChange: false,
    description: 'Maximum accuracy with frequent location updates. Best for precise geofencing.',
    batteryImpact: 'High',
  },
  balanced: {
    distanceFilter: 15, // 15 meters
    interval: 10000, // 10 seconds
    fastestInterval: 5000, // 5 seconds
    accuracy: {
      android: 'balanced',
      ios: 'nearestTenMeters',
    },
    adaptiveUpdates: true,
    significantLocationChange: true,
    description: 'Good balance between accuracy and battery life. Recommended for daily use.',
    batteryImpact: 'Medium',
  },
  power_saver: {
    distanceFilter: 50, // 50 meters
    interval: 30000, // 30 seconds
    fastestInterval: 15000, // 15 seconds
    accuracy: {
      android: 'low',
      ios: 'hundredMeters',
    },
    adaptiveUpdates: true,
    significantLocationChange: true,
    description: 'Maximum battery savings with basic accuracy. Suitable for large geofences.',
    batteryImpact: 'Low',
  },
};

/**
 * Adaptive location configuration based on proximity to office
 *
 * When far from office: Use significant location change + lower frequency
 * When near office: Use standard tracking with current power mode settings
 */
export const ADAPTIVE_CONFIG = {
  // Distance threshold to consider user "near" office (meters)
  nearThreshold: 1000, // 1km

  // Configuration when far from office
  farFromOffice: {
    distanceFilter: 100, // 100 meters
    interval: 60000, // 1 minute
    fastestInterval: 30000, // 30 seconds
    useSignificantLocationChange: true, // iOS only
  },
};

/**
 * Get power mode configuration
 */
export function getPowerModeConfig(powerMode: PowerMode): PowerModeConfig {
  return POWER_MODE_CONFIGS[powerMode];
}

/**
 * Determine if user is near any enabled office
 */
export function isNearAnyOffice(
  currentLocation: { latitude: number; longitude: number },
  offices: Array<{ latitude: number; longitude: number; enabled: boolean }>,
  thresholdMeters: number = ADAPTIVE_CONFIG.nearThreshold
): boolean {
  // If no offices enabled, always use standard tracking
  const enabledOffices = offices.filter(o => o.enabled);
  if (enabledOffices.length === 0) {
    return true; // Treat as "near" to use standard tracking
  }

  // Check if within threshold of any office
  for (const office of enabledOffices) {
    const distance = getDistanceBetweenCoordinates(
      currentLocation.latitude,
      currentLocation.longitude,
      office.latitude,
      office.longitude
    );

    if (distance <= thresholdMeters) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 * Returns distance in meters
 */
function getDistanceBetweenCoordinates(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
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
 * Get adaptive location configuration
 * Combines power mode with proximity-based optimization
 */
export function getAdaptiveLocationConfig(
  powerMode: PowerMode,
  currentLocation: { latitude: number; longitude: number } | null,
  offices: Array<{ latitude: number; longitude: number; enabled: boolean }>
): PowerModeConfig {
  const config = getPowerModeConfig(powerMode);

  // If adaptive updates disabled or no location, return standard config
  if (!config.adaptiveUpdates || !currentLocation) {
    return config;
  }

  // Check if near office
  const near = isNearAnyOffice(currentLocation, offices);

  // If far from office and significant location change enabled, use optimized config
  if (!near && config.significantLocationChange) {
    return {
      ...config,
      distanceFilter: ADAPTIVE_CONFIG.farFromOffice.distanceFilter,
      interval: ADAPTIVE_CONFIG.farFromOffice.interval,
      fastestInterval: ADAPTIVE_CONFIG.farFromOffice.fastestInterval,
    };
  }

  return config;
}

/**
 * Get description of power mode for UI display
 */
export function getPowerModeDescription(powerMode: PowerMode): string {
  const config = POWER_MODE_CONFIGS[powerMode];
  return `${config.description} Battery impact: ${config.batteryImpact}.`;
}

/**
 * Get estimated battery usage per hour
 */
export function getEstimatedBatteryUsage(powerMode: PowerMode): string {
  const config = POWER_MODE_CONFIGS[powerMode];

  switch (config.batteryImpact) {
    case 'High':
      return '3-5% per hour';
    case 'Medium':
      return '1-2% per hour';
    case 'Low':
      return '<1% per hour';
    default:
      return 'Unknown';
  }
}
