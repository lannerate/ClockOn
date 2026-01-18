# Location Testing Commands

## Android Emulator - Set Location to Office

```bash
# Set location to San Francisco office (inside geofence)
telnet localhost 5554
# Then enter:
geo fix -122.4194 37.7749
# Exit: quit
```

## iOS Simulator - Set Location to Office

```bash
# Set location to San Francisco office
xcrun simctl location booted set 37.7749,-122.4194
```

## Reset to Default Location

### Android:
```bash
telnet localhost 5554
geo fix 0 0  # Reset to origin
```

### iOS:
```bash
xcrun simctl location booted reset
```

## Test Scenarios

### Scenario 1: Inside Geofence
Location: 37.7749, -122.4194 (San Francisco office)
Expected: Should show "In Geofence" status

### Scenario 2: Outside Geofence (Near)
Location: 37.7849, -122.4294 (1km away)
Expected: Should show distance to office

### Scenario 3: Far Outside Geofence
Location: 40.7128, -74.0060 (New York)
Expected: Should show large distance
