# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
- `npm start` - Start Metro bundler
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS (requires `bundle install` and `bundle exec pod install` first)
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests

### iOS Setup
First time setup requires:
```sh
bundle install
bundle exec pod install
```

### Building
- Build directly from Android Studio or Xcode
- Metro runs on port 8081 by default

## Architecture Overview

ClockOn is a React Native attendance tracking app with automatic geofence-based clock in/out.

### Core Architecture

**Service Layer** (`src/services/`)
- `ClockService` - Business logic for clock operations, manual and automatic
- `LocationService` - GPS tracking and geofence monitoring with dwell time
- `SettingsService` - App configuration persistence (AsyncStorage)

**Data Layer** (`src/database/`)
- `DatabaseService` - SQLite wrapper using `react-native-quick-sqlite`
- `schema.ts` - Database migrations and table definitions
- Single table `employee_records` with indexed queries

**State Management** (`src/store/`)
- `useAppStore` - Zustand store for global state (clock status, location status, settings)
- Lightweight alternative to Redux/Context API

**Navigation** (`src/navigation/`)
- React Navigation v7 with bottom tabs
- Material Design 3 theme via `react-native-paper`

### Type System (`src/types/`)

Core types:
- `ClockType`: 'IN' | 'OUT'
- `TriggerMethod`: 'AUTOMATIC_GEOFENCE' | 'MANUAL_CHECK'
- `EmployeeRecord`: Attendance record with location, device info, timestamp
- `OfficeLocation`: Geofence configuration with radius
- `ClockStatus`: Current clock state with today's records
- `GeofenceEvent`: Entry/exit events from location monitoring

### Key Workflows

**Manual Clock In/Out:**
1. Get current location with GPS accuracy validation
2. Check geofence if offices configured
3. Validate debounce time (default 5 minutes)
4. Create record with device info and save to SQLite
5. Refresh status and notify listeners

**Automatic Geofence:**
1. LocationService watches position changes (10m filter, 5s interval)
2. On entry: start dwell timer (default 30s) to confirm presence
3. On exit: immediate clock out
4. ClockService handles automatic record creation with debounce check

**Location Accuracy:**
- Configurable max accuracy threshold (default 50m)
- Low accuracy prevents clock operations with user feedback
- High accuracy mode enabled for all location requests

**Debouncing:**
- Prevents rapid clock in/out (default 5 minutes)
- Checked for both manual and automatic operations
- Calculates remaining seconds for user feedback

### Database Schema

Single table with indexes:
- Primary key: `id` (UUID)
- Indexed: `employeeId`, `timestamp DESC`, `clockType`
- Composite index: `(employeeId, timestamp DESC)`
- CHECK constraints for `clockType` and `triggerMethod`

Common queries:
- `getLastRecord()` - Most recent for status determination
- `getTodayRecords()` - Filtered by `date(timestamp) = date('now')`
- `getLastClockIn/Out()` - Last of specific type

### Platform-Specific Notes

**Android:**
- Requires `always` location permission for background geofencing
- Manifest permissions in `android/app/src/main/AndroidManifest.xml`

**iOS:**
- App name: "ClockOn" (renamed from "ClockOnTemp" Jan 2025)
- Requires `whenInUse` or `always` authorization
- Background geofencing requires Info.plist configuration
- CocoaPods dependencies managed via Podfile
- **Important:** When renaming iOS app, the `.xcscheme` file contains hardcoded references that must be updated separately from `project.pbxproj`
- Bundle identifier remains `org.reactjs.native.example.ClockOnTemp` (contains legacy name)

### Key Patterns

**Singleton Services:** All services exported as default singletons (`export default new Service()`)

**Event Emitters:** Services use Set-based listeners:
```typescript
onClockEvent(callback: ClockEventCallback): () => void
```
Returns unsubscribe function.

**Error Handling:** Services emit errors via listeners, logged to console, displayed in UI via store.

**Validation Utils:**
- `validateDebounceTime()` - Check time between operations
- `isAccurateEnough()` - GPS accuracy threshold check
- `isInGeofence()` - Haversine distance calculation
- `generateUUID()` - Unique record IDs
