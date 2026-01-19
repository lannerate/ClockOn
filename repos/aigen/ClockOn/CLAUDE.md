# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm start` - Start Metro bundler (runs on port 8081)
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS (requires `bundle install` and `bundle exec pod install` first)
- `npm run ios:release` - Build iOS release configuration
- `npm run ios:devices` - List available iOS simulators
- `npm run ios:clean` - Clean iOS build artifacts
- `npm run ios:pods` - Install CocoaPods dependencies
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests

### iOS Setup
First time setup requires:
```sh
bundle install
bundle exec pod install
```

### Testing
- `npm test` - Run Jest tests
- `npm test -- --testNamePattern="pattern"` - Run specific tests by name pattern
- Jest preset: `react-native` (configured in jest.config.js)

## Architecture Overview

ClockOn is a React Native attendance tracking app with automatic geofence-based clock in/out.

### Technology Stack
- **React Native 0.83.1** with React 19.2.0
- **TypeScript** with `@react-native/typescript-config`
- **Navigation**: React Navigation v7 with bottom tabs
- **UI**: Material Design 3 via `react-native-paper`
- **State**: Zustand (`useAppStore`) - lightweight global state
- **Database**: SQLite via `react-native-quick-sqlite`
- **Location**: `react-native-geolocation-service` and `react-native-maps`
- **Date/Time**: date-fns
- **Node**: >=20 required

### Core Architecture

**Service Layer** (`src/services/`)
- `ClockService` - Business logic for clock operations (manual & automatic), debounce validation, record creation
- `LocationService` - GPS tracking, geofence monitoring with dwell time, power mode optimization
- `SettingsService` - App configuration persistence (AsyncStorage)
- `MonthlyStatsService` - Statistics calculation, attendance rate, total hours

**Data Layer** (`src/database/`)
- `DatabaseService` - SQLite wrapper using `react-native-quick-sqlite`
- `schema.ts` - Database migrations and table definitions
- Single table `employee_records` with indexed queries
- Key queries: `getLastRecord()`, `getTodayRecords()`, `getRecordsByMonth()`, `getMonthsRecords()`

**State Management** (`src/store/`)
- `useAppStore` - Zustand store for global state (clock status, location status, settings)
- Actions: refreshClockStatus(), refreshLocationStatus(), updateSettings()

**Navigation** (`src/navigation/`)
- React Navigation v7 with bottom tabs (Home, Monthly Stats, Settings)
- Material Design 3 theme integration

**Theme** (`src/theme/theme.ts`)
- Custom design system built on MD3LightTheme
- Color palette: Primary (#3B82F6), Success (#10B981), Error (#EF4444)
- Typography system with 4px base spacing unit
- High contrast text for accessibility (WCAG compliant)

**Components** (`src/components/`)
- ActivityCard, ClockButton, EmployeeIDCard, LocationCard, OfficeLocationCard
- StatusCard, StatsSummaryCard, MonthSelectorCard
- All use Material Design 3 patterns and react-native-paper

**Screens** (`src/screens/`)
- `DashboardScreen` (was HomeScreen): Main clock in/out interface with status cards
- `MonthlyStatsScreen`: Calendar view, month selector, statistics summary
- `SettingsScreen`: Employee ID, office locations, power mode configuration

**Utilities** (`src/utils/`)
- `validation.ts` - Employee ID, office location, coordinates, accuracy, debounce validation
- `location.ts` - Haversine distance calculation, geofence checking
- `export.ts` - CSV export functionality

**Config** (`src/config/`)
- `powerModeConfig.ts` - Three power modes: high_performance, balanced, power_saver
- Adaptive location updates based on proximity to office (1km threshold)

### Type System (`src/types/index.ts`)

Core types:
- `ClockType`: 'IN' | 'OUT'
- `TriggerMethod`: 'AUTOMATIC_GEOFENCE' | 'MANUAL_CHECK'
- `PowerMode`: 'high_performance' | 'balanced' | 'power_saver'
- `PowerModeConfig`: Location update settings (distanceFilter, interval, accuracy)
- `EmployeeRecord`: Attendance record with location, device info, timestamp
- `OfficeLocation`: Geofence configuration with radius and enabled flag
- `ClockStatus`: Current clock state with today's records
- `LocationStatus`: Geofence status, distance to nearest office
- `GeofenceEvent`: Entry/exit events from location monitoring
- `AppSettings`: Employee ID, offices, debounce time, dwell time, max accuracy, power mode
- `MonthlyStats`: Year, month, working days, attendance rate, total hours

### Key Workflows

**Manual Clock In/Out:**
1. Get current location with high accuracy GPS
2. Validate accuracy against threshold (default 50m)
3. Check geofence if offices configured
4. Validate debounce time (default 5 minutes)
5. Create record with device info and save to SQLite
6. Refresh clock status and notify listeners via ClockService events

**Automatic Geofence:**
1. LocationService watches position changes (power mode dependent filters)
2. On geofence entry: start dwell timer (default 30s) to confirm presence
3. After dwell time: automatic clock in (if not already clocked in)
4. On geofence exit: immediate clock out
5. ClockService handles automatic record creation with debounce check
6. Adaptive location updates: slower when >1km from office (power saver)

**Location Accuracy:**
- Configurable max accuracy threshold (default 50m)
- Low accuracy prevents clock operations with user feedback
- High accuracy mode enabled for all location requests
- Power mode affects accuracy vs battery tradeoff

**Debouncing:**
- Prevents rapid clock in/out (default 5 minutes, configurable)
- Checked for both manual and automatic operations
- `validateDebounceTime()` returns remaining seconds for user feedback

**Monthly Statistics:**
- Working days: Monday-Friday (excludes weekends)
- Attendance rate: days clocked in / total working days
- Total hours: paired IN/OUT records calculated
- Month/year aggregation from database queries

### Database Schema

**Table:** `employee_records`
- Primary key: `id` (UUID)
- Indexed: `employeeId`, `timestamp DESC`, `clockType`
- Composite index: `(employeeId, timestamp DESC)`
- CHECK constraints for `clockType` ('IN', 'OUT') and `triggerMethod` ('AUTOMATIC_GEOFENCE', 'MANUAL_CHECK')
- `created_at` timestamp for record insertion

**Key Query Methods:**
- `getLastRecord(employeeId)` - Most recent record for status determination
- `getTodayRecords(employeeId)` - Today's records: `date(timestamp) = date('now')`
- `getLastClockIn/Out(employeeId)` - Last record of specific type
- `getRecordsByMonth(employeeId, year, month)` - Monthly data for statistics
- `getMonthsRecords(employeeId)` - All months with data
- `getRecordsCount(employeeId)` - Total record count

### Platform-Specific Notes

**Android:**
- Requires `always` location permission for background geofencing
- Manifest permissions in `android/app/src/main/AndroidManifest.xml`
- MainActivity and MainApplication require Kotlin imports for geofencing modules

**iOS:**
- App name: "ClockOn"
- Bundle identifier: `org.reactjs.native.example.ClockOn`
- Workspace: `ios/ClockOn.xcworkspace` (must use workspace, not project)
- Requires `whenInUse` or `always` authorization
- Background geofencing requires Info.plist configuration (`NSLocationWhenInUseUsageDescription`, `NSLocationAlwaysAndWhenInUseUsageDescription`)
- CocoaPods dependencies managed via Podfile - requires `bundle install` and `bundle exec pod install`
- **Important:** When renaming iOS app, the `.xcscheme` file contains hardcoded references that must be updated separately from `project.pbxproj`

### Key Patterns

**Singleton Services:** All services exported as default singletons (`export default new Service()`)

**Event Emitters:** Services use Set-based listeners that return unsubscribe functions:
```typescript
onClockEvent(callback: ClockEventCallback): () => void
```

**Error Handling:** Services emit errors via listeners, logged to console, displayed in UI via store.

**Validation Functions** (src/utils/validation.ts):
- `validateEmployeeId()` - Employee ID format (3-50 chars)
- `validateOfficeLocation()` - Location name, coordinates, radius (10-500m)
- `validateCoordinates()` - Lat/long ranges
- `validateAccuracy()` - GPS accuracy against threshold
- `validateDebounceTime()` - Time between operations, returns remaining seconds
- `generateUUID()` - Unique record IDs

**Power Mode Optimization** (src/config/powerModeConfig.ts):
- `high_performance`: 5m filter, 3s interval, best accuracy (3-5% battery/hour)
- `balanced`: 15m filter, 10s interval, nearestTenMeters (1-2% battery/hour)
- `power_saver`: 50m filter, 30s interval, hundredMeters (<1% battery/hour)
- Adaptive updates: slower tracking when >1km from office
- iOS significant location change for battery optimization

### Design System

**Colors** (src/theme/theme.ts):
- Primary: #3B82F6 (blue), Secondary: #10B981 (green), Error: #EF4444 (red)
- High contrast text for WCAG compliance
- Status colors: clockedIn (#10B981), clockedOut (#EF4444), inGeofence (#10B981), outOfGeofence (#F59E0B)

**Typography:**
- Display: 57/45/36px, Headline: 32/28/24px, Title: 22/18/16px, Body: 16/14/12px, Label: 14/12/11px
- System font family, weights 400-700
- Line heights: 1.2 (tight), 1.5 (normal), 1.75 (relaxed)

**Spacing:** 4px base unit (xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48)

**Components** use Material Design 3 patterns from `react-native-paper` with custom theme tokens
