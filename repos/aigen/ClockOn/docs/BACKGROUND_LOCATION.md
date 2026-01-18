# Background App Refresh & Geofencing Setup

This document explains how ClockOn implements background location tracking for automatic clock in/out functionality.

## Overview

ClockOn uses background location tracking to automatically clock you in when you arrive at the office and clock you out when you leave. This works even when the app is suspended or in the background.

## How It Works

### Architecture

```
LocationService (Background)
    ↓
Continuous GPS Tracking (10m filter, 5s interval)
    ↓
Geofence Detection (Entry/Exit)
    ↓
ClockService (Automatic Clock In/Out)
    ↓
Database Storage
```

### Platform Implementation

#### iOS
- **Background Mode**: `UIBackgroundModes` includes `location` and `fetch`
- **Permission**: Requests `NSLocationAlwaysAndWhenInUseUsageDescription`
- **Location Service**: Uses `react-native-geolocation-service` with background support
- **Geofencing**: Dwell time (30s) confirms entry before triggering clock in

#### Android
- **Foreground Service**: Configured with `FOREGROUND_SERVICE_LOCATION` permission
- **Permission**: Requests `ACCESS_BACKGROUND_LOCATION`
- **Location Service**: Continuous tracking with background support
- **Geofencing**: Immediate exit detection, dwell time for entry

## Configuration

### iOS Configuration

#### Info.plist Settings
```xml
<key>UIBackgroundModes</key>
<array>
    <string>location</string>
    <string>fetch</string>
</array>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>ClockOn needs background location access to automatically track your attendance when you arrive at or leave the office, even when the app is not actively in use.</string>

<key>NSLocationWhenInUseUsageDescription</key>
<string>ClockOn needs access to your location to automatically clock you in when you arrive at the office and clock you out when you leave.</string>
```

#### Permissions Flow
1. App requests "Always" location permission on first launch
2. If user grants "Always": Background geofencing works reliably
3. If user grants "When In Use": Background geofencing may work but not guaranteed

### Android Configuration

#### AndroidManifest.xml Permissions
```xml
<!-- Location permissions -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />

<!-- Foreground service -->
<uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
<uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

#### Permissions Flow
1. App requests "Allow all the time" location permission
2. Android 11+ users need to manually grant background location in settings
3. Foreground service notification shows location tracking is active

## Location Service Implementation

### Start Background Geofencing
```typescript
// Called from App.tsx on app startup
await LocationService.startBackgroundGeofencing();
```

**What it does:**
- Loads enabled office locations from settings
- Initializes geofence state tracking
- Starts continuous location watching
- Configures background location updates

### Location Watching Configuration
```typescript
Geolocation.watchPosition(
  (position) => {
    // Process location update
    this.checkGeofenceTransition(location);
  },
  (error) => {
    // Handle errors
  },
  {
    enableHighAccuracy: true,
    distanceFilter: 10,    // Update every 10 meters
    interval: 5000,        // Every 5 seconds
    fastestInterval: 3000,
    accuracy: {
      android: 'high',
      ios: 'best'
    }
  }
);
```

### Geofence Detection Logic

#### Entry Detection (Clock In)
1. User enters office geofence (GPS accuracy < 50m)
2. **Wait for dwell time** (30 seconds) to confirm presence
3. Double-check still in geofence after dwell
4. Trigger automatic clock in
5. Update status and notify user

#### Exit Detection (Clock Out)
1. User leaves office geofence
2. **Immediate clock out** (no dwell time)
3. Update status and notify user

#### Safety Checks
- **Debounce time**: Prevents rapid clock in/out (default 5 minutes)
- **Accuracy validation**: Requires GPS accuracy < 50m
- **Permission checks**: Verifies proper location permissions

## Testing Background Location

### iOS Testing

#### Method 1: Xcode Simulator
1. Run app in iOS Simulator
2. Debug → Location → Custom Location
3. Select location near your office geofence
4. Put app in background (Cmd+H)
5. Change location to inside geofence
6. Wait 30+ seconds for dwell time
7. Check console logs for geofence events

#### Method 2: Physical Device
1. Install app on iPhone
2. Grant "Always" location permission
3. Configure office location in Settings
4. Enable Background App Refresh (Settings → General → Background App Refresh)
5. Physically walk to/from office
6. Check attendance records after clock in/out

#### Verify Background Modes
```bash
# Check if background modes are enabled
grep -A 2 "UIBackgroundModes" ios/ClockOn/Info.plist
```

### Android Testing

#### Method 1: Android Studio Emulator
1. Run app in emulator
2. Extended controls → Location
3. Set location near your office
4. Put app in background (Home button)
5. Change location to inside geofence
6. Wait 30+ seconds
7. Check console logs for geofence events

#### Method 2: Physical Device
1. Install app on Android device
2. Grant "Allow all the time" location permission
3. Verify background location permission in settings
4. Configure office location in Settings
5. Physically walk to/from office
6. Check notification and attendance records

#### Verify Permissions
```bash
# Check granted permissions
adb shell dumpsys package com.clockon | grep permission
```

## Debugging

### Console Logs

#### Successful Background Geofencing
```
Starting background geofencing for 1 offices
Background geofencing: Location watching started
Background geofencing initialized successfully
- Platform: ios
- Offices: 1
- Status: Active
Location watching started
Geofence event: entry - Office Main
Automatic clock IN: [record-id]
```

#### Common Issues

**Issue: "Only whenInUse permission granted"**
```
iOS: Only whenInUse permission granted. Background geofencing may not work reliably.
```
**Solution**: Go to iOS Settings → Privacy → Location Services → ClockOn → Change to "Always"

**Issue: "Debounce active, skipping automatic clock in"**
```
Debounce active, skipping automatic clock in
```
**Solution**: Wait 5 minutes between clock operations (configurable in Settings)

**Issue: "Low accuracy, skipping automatic clock in"**
```
Low accuracy, skipping automatic clock in: 150m
```
**Solution**: Move to location with better GPS reception (outdoors, near windows)

### Monitoring

#### Check Location Service Status
```typescript
// In DashboardScreen or via React Native Debugger
console.log('Is watching:', LocationService.isWatching);
console.log('Current location:', LocationService.getCurrentCachedLocation());
```

#### Check Database Records
```typescript
// Query recent automatic clock events
const records = await DatabaseService.getAllRecords(employeeId);
const automaticRecords = records.filter(r => r.triggerMethod === 'AUTOMATIC_GEOFENCE');
console.log('Automatic clock events:', automaticRecords);
```

## Battery Optimization

### Current Implementation
- **Location update interval**: 5 seconds (foreground)
- **Distance filter**: 10 meters
- **Accuracy**: High/Best (depends on platform)

### Battery Saving Tips
1. **Reduce office geofence radius**: Smaller radius = fewer location checks needed
2. **Increase distance filter**: Update only after significant movement
3. **Increase interval**: Check location less frequently
4. **Disable unnecessary offices**: Only enable offices you regularly visit

### Configuration
Edit `src/services/LocationService.ts`:
```typescript
{
  enableHighAccuracy: true,
  distanceFilter: 10,    // Increase to 20-50 for battery saving
  interval: 5000,        // Increase to 10000-30000 for battery saving
  fastestInterval: 3000,
  accuracy: {
    android: 'high',     // Change to 'balanced' for battery saving
    ios: 'best'          // Change to 'nearestTenMeters' for battery saving
  }
}
```

## Best Practices

### For Users
1. **Grant "Always" location permission** for reliable background tracking
2. **Keep app installed** and don't force-quit it
3. **Enable Background App Refresh** (iOS)
4. **Disable battery optimization** for ClockOn (Android)
5. **Configure office locations accurately** with appropriate radius
6. **Test geofence boundaries** to ensure they match your office location

### For Developers
1. **Test on physical devices** (emulators have limited background support)
2. **Monitor battery usage** and optimize location settings
3. **Handle permission changes** gracefully
4. **Provide clear feedback** when background tracking fails
5. **Log all geofence events** for debugging
6. **Test dwell time** to balance sensitivity and false positives

## Troubleshooting

### Problem: Automatic clock in/out not working

**Check 1: Permissions**
- iOS: Settings → Privacy → Location Services → ClockOn → "Always"
- Android: Settings → Apps → ClockOn → Permissions → Location → "Allow all the time"

**Check 2: Background App Refresh (iOS)**
- Settings → General → Background App Refresh → ClockOn → Enabled

**Check 3: Battery Optimization (Android)**
- Settings → Apps → ClockOn → Battery → "Unrestricted"
- Settings → Apps → ClockOn → Background limit → "No restrictions"

**Check 4: Office Configuration**
- Settings → Office Locations → Verify office is enabled
- Check geofence radius is appropriate (100-500m recommended)
- Verify office coordinates are correct

**Check 5: Location Services**
- iOS: Settings → Privacy → Location Services → Enabled
- Android: Settings → Location → Enabled

### Problem: App crashes in background

**Solution**: Check Xcode/Android Studio logs for crash reports
- iOS: Settings → Privacy & Security → Analytics & Improvements
- Android: `adb logcat` while reproducing the crash

### Problem: Geofence events delayed

**Possible causes:**
1. Poor GPS signal (indoors, urban canyons)
2. Dwell time too long (currently 30 seconds)
3. Distance filter too large (currently 10 meters)
4. Phone in low power mode

**Solution**: Adjust geofence configuration in Settings

## Performance Monitoring

### Key Metrics
- **Location update frequency**: Every 5 seconds when active
- **Geofence detection accuracy**: ~10-50m depending on GPS
- **Battery impact**: ~2-5% per hour with continuous tracking
- **Memory usage**: Minimal (~10-20MB for location service)

### Optimization Checklist
- [ ] Test on real devices (not emulators)
- [ ] Monitor battery usage over 8-hour workday
- [ ] Verify background tracking after 1 hour
- [ ] Test with multiple office locations
- [ ] Verify debouncing prevents false clock events
- [ ] Test with poor GPS conditions (indoors, basement)

## Security & Privacy

### Data Handling
- Location data is stored locally on device (SQLite)
- No location data is transmitted to external servers
- Automatic clock events include GPS coordinates and accuracy
- User can delete all data from Settings

### Privacy Best Practices
1. **Minimal data collection**: Only location when clocking in/out
2. **Local storage**: No cloud sync of location history
3. **User control**: Can disable background tracking anytime
4. **Transparency**: Clear permission explanations
5. **Data retention**: User can delete all records

## Future Enhancements

### Potential Improvements
1. **Native geofencing**: Use platform-specific geofencing APIs for better battery life
2. **Significant location change**: Use iOS's built-in significant location change API
3. **Adaptive location updates**: Reduce frequency when not near office
4. **WiFi geofencing**: Use WiFi network detection as additional signal
5. **Bluetooth beacons**: Add Bluetooth LE beacons for indoor detection
6. **Motion activity**: Detect user movement to optimize location updates

## Resources

### Documentation
- [react-native-geolocation-service](https://github.com/Agontuk/react-native-geolocation-service)
- [iOS Background Modes](https://developer.apple.com/documentation/uikit/app_and_environment/scenes/preparing_your_app_to_run_in_the_background/enabling_background_modes)
- [Android Background Location](https://developer.android.com/training/location/background)

### Testing Tools
- [Xcode Location Simulation](https://developer.apple.com/documentation/xcode/running-your-app-in-the-simulator-or-on-a-device#Simulate-location)
- [Android Location Testing](https://developer.android.com/training/location/location-testing)
- [Fake GPS location apps for testing](https://play.google.com/store/search?q=fake+gps)

---

**Last Updated**: 2025-01-18
**Version**: 1.0.0
**Platform**: React Native 0.83.1
