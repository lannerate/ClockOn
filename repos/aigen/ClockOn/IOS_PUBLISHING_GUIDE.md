# ClockOn iOS App - Build and Publishing Guide

This guide walks you through building and publishing the ClockOn app to the Apple App Store.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Code Signing Setup](#code-signing-setup)
3. [App Store Connect Setup](#app-store-connect-setup)
4. [Xcode Configuration](#xcode-configuration)
5. [Building for Distribution](#building-for-distribution)
6. [Uploading to App Store](#uploading-to-app-store)
7. [App Store Submission](#app-store-submission)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Accounts & Tools

1. **Apple Developer Account** ($99/year)
   - Sign up at: https://developer.apple.com/programs/enroll/
   - Required for code signing and App Store distribution

2. **App Store Connect Account**
   - Included with Apple Developer Program
   - Access at: https://appstoreconnect.apple.com/

3. **Xcode** (Latest version)
   - Download from Mac App Store
   - Version 15.0 or higher recommended

4. **CocoaPods** (Already installed)
   ```bash
   gem install cocoapods
   ```

5. **Command Line Tools**
   ```bash
   xcode-select --install
   ```

### Before You Begin

✅ App version updated to `1.0.0` in `package.json`
✅ Info.plist configured with all required permissions
✅ Privacy descriptions added for location tracking
✅ App tested on iOS simulator and real device

---

## Code Signing Setup

### Step 1: Create App ID in Apple Developer Portal

1. Go to: https://developer.apple.com/account/resources/identifiers/list
2. Click **+** button to create new App ID
3. Select **App IDs** → Click **Continue**
4. Choose **App** → Click **Continue**
5. Fill in the details:
   - **Description**: `ClockOn - Attendance Tracking`
   - **Bundle ID**: Select **Explicit**
   - **Bundle ID**: `com.yourcompany.clockon` (replace with your company)
   - **Capabilities**: Enable the following:
     - ✅ Maps
     - ✅ Location Services (Always and When In Use)
     - ✅ Background Modes
6. Click **Continue** then **Register**

### Step 2: Create Distribution Certificate

1. Go to: https://developer.apple.com/account/resources/certificates/list
2. Click **+** to create certificate
3. Select **App Store and Ad Hoc** → Click **Continue**
4. Follow instructions to create a CSR (Certificate Signing Request):
   ```bash
   # Open Keychain Access on your Mac
   # Keychain Access > Certificate Assistant > Request a Certificate From a Certificate Authority
   # Save the CSR file to disk
   ```
5. Upload the CSR file
6. Download the certificate (.cer file)
7. Double-click to install in Keychain Access

### Step 3: Create Provisioning Profile

1. Go to: https://developer.apple.com/account/resources/profiles/list
2. Click **+** to create profile
3. Select **App Store** → Click **Continue**
4. Choose your App ID from dropdown → Click **Continue**
5. Select your distribution certificate → Click **Continue**
6. Enter profile name: `ClockOn App Store Distribution`
7. Click **Generate**
8. Download the profile and install it

---

## App Store Connect Setup

### Step 1: Create New App

1. Go to: https://appstoreconnect.apple.com/
2. Click **My Apps** → **+** → **New App**
3. Fill in app information:
   - **Platform**: iOS
   - **Name**: `ClockOn`
   - **Primary Language**: `English`
   - **Bundle ID**: Select your App ID
   - **SKU**: `CLOCKON-001` (unique identifier)
4. Click **Create**

### Step 2: App Information

Complete all required sections:

**General Information**:
- App Name: `ClockOn - Attendance Tracking`
- Subtitle: `Automatic Attendance Tracker`
- Privacy Policy URL: (your website privacy policy)

**Age Ratings**:
- Complete the content questionnaire
- Typical rating: 4+ (Business apps)

**Pricing and Availability**:
- Price: Free or Paid
- Availability: Select countries/regions

**App Privacy**:
- Complete privacy questionnaire
- Disclose data collection (location data)

**Prepare for Submission** fields needed:
- **Screenshots**: Required (see below)
- **Description**: See provided template
- **Keywords**: `attendance, time tracking, clock in, clock out, geofence, employee, work hours`
- **Support URL**: Your website/support page
- **Marketing URL**: (optional) Your website
- **Privacy Policy URL**: Required

### Step 3: Required Screenshots

You need screenshots for each device size:

**iPhone**:
- 6.7" Display (iPhone 14 Pro Max, iPhone 15 Pro Max): 1290×2796px
- 6.5" Display (iPhone XS Max, iPhone 11 Pro Max): 1242×2688px
- 5.5" Display (iPhone 8 Plus): 1242×2208px

**iPad**:
- 12.9" Display: 2048×2732px
- 11" Display: 1668×2388px

**Requirements**:
- Minimum 3 screenshots per device size
- Maximum 10 screenshots per device size
- All screenshots must be:
  - PNG or JPEG format
  - Exact pixel dimensions
  - No frames or device bezels
  - No additional text overlay

---

## Xcode Configuration

### Step 1: Open Project in Xcode

```bash
cd ios
open ClockOn.xcworkspace
```

**Important**: Always open the `.xcworkspace` file, NOT the `.xcodeproj`

### Step 2: Update Bundle Identifier

1. Select **ClockOn** project in left sidebar
2. Select **ClockOn** target
3. Go to **General** tab
4. Update **Bundle Identifier** to match your App ID:
   ```
   com.yourcompany.clockon
   ```

### Step 3: Update Version and Build

1. In **General** tab:
   - **Version**: `1.0.0` (Marketing version)
   - **Build**: `1` (Increment this for each update)

### Step 4: Configure Signing

1. In **Signing & Capabilities** tab:
2. Check **Automatically manage signing**
3. Select your **Team** (Apple Developer account)
4. Verify Provisioning Profile is selected

### Step 5: Add Capabilities

If not already added, ensure these capabilities are enabled:
- ✅ **Maps** (for location display)
- ✅ **Location - Always** (for background location)
- ✅ **Background Modes**:
  - Location updates
  - Background fetch

### Step 6: Update Display Name

1. Go to **Info** tab
2. Set **Bundle name** to `ClockOn`
3. Set **Display Name** to `ClockOn`

### Step 7: Configure Launch Screen

1. Open `LaunchScreen.storyboard`
2. Design your app's launch screen
3. Must match your app's visual design
4. No dynamic content or loading indicators

---

## Building for Distribution

### Option 1: Build from Xcode (Recommended)

1. Select **Any iOS Device (arm64)** as the target
2. Product → **Scheme** → Edit Scheme
3. Set **Build Configuration** to **Release**
4. Click **Close**

5. Build the archive:
   ```
   Product → Archive
   ```

6. After build completes, Xcode Organizer will open

### Option 2: Build from Command Line

```bash
# Navigate to project root
cd /Users/hui/repos/aigen/ClockOn

# Clean build folder
npm run ios:clean

# Install/update pods
npm run ios:pods

# Build archive
xcodebuild -workspace ios/ClockOn.xcworkspace \
  -scheme ClockOn \
  -configuration Release \
  -archivePath build/ClockOn.xcarchive \
  -destination 'generic/platform=iOS' \
  -allowProvisioningUpdates
```

---

## Uploading to App Store

### Using Xcode Organizer (Recommended)

1. After archive is created, **Organizer** window opens
2. Select your archive
3. Click **Distribute App**
4. Select **App Store Connect** → Click **Distribute**
5. Sign in with your Apple ID
6. Choose your **Team** → Click **Choose**
7. Select the distribution certificate → Click **Choose**
8. Click **Upload**

9. Wait for upload and processing
10. Verify in App Store Connect under **TestFlight** → **iOS App**

### Using Transporter Command Line

```bash
# Export IPA from archive
xcodebuild -exportArchive \
  -archivePath build/ClockOn.xcarchive \
  -exportPath build/ipa \
  -exportOptionsPlist ios/ExportOptions.plist

# Upload using Transporter
xcrun altool --upload-app \
  --type ios \
  --file build/ipa/ClockOn.ipa \
  --username "your-apple-id@example.com" \
  --password "app-specific-password"
```

---

## App Store Submission

### Step 1: TestFlight Testing (Required)

Before submitting to App Store review:

1. Go to **TestFlight** tab in App Store Connect
2. Create **Internal Testing** group
3. Add yourself as tester
4. Test the build thoroughly:
   - ✅ Clock in/out functionality
   - ✅ Location permissions flow
   - ✅ Background location tracking
   - ✅ Settings and configuration
   - ✅ Data persistence
   - ✅ UI/UX on different devices

5. Create **External Testing** group (optional)
   - Add beta testers (up to 10,000)
   - Collect feedback

### Step 2: Prepare Store Metadata

**App Name**: ClockOn - Attendance Tracking

**Subtitle** (30 chars): Automatic Attendance Tracker

**Description**:
```
ClockOn is the ultimate attendance tracking solution for modern businesses.

Whether you're a small business or a large enterprise, ClockOn makes time tracking effortless and accurate.

FEATURES:

✅ Automatic Clock In/Out
- Uses GPS geofencing to detect when you arrive at or leave the office
- No manual intervention required - just walk in and walk out
- Configurable dwell time prevents false triggers

✅ Manual Clock Options
- Quick clock in/out buttons for manual control
- GPS accuracy validation prevents errors
- Debounce timer prevents rapid clock in/out cycles

✅ Location Tracking
- Add multiple office locations with GPS coordinates
- Customizable geofence radius for each office
- Real-time location status display
- Distance from office displayed

✅ Attendance Records
- Complete history of all clock in/out times
- Filter by date to view specific days
- Automatic data export options

✅ Monthly Statistics
- Track attendance rate percentage
- View days worked per month
- Monitor total hours worked
- Visual progress indicators

✅ Privacy & Security
- All data stored locally on your device
- No cloud sync required
- Background location used only for attendance
- Your data stays private

PERFECT FOR:

• Small businesses tracking employee attendance
• Remote teams with office locations
• Companies with geographically distributed offices
• Anyone who needs accurate time tracking

WHY CLOCKON?

• No monthly subscription fees
• Works offline - no internet required
• Automatic tracking saves time
• Accurate GPS-based verification
• Beautiful, intuitive interface
• Accessible design with high contrast
• Fast and reliable

Download ClockOn today and simplify your attendance tracking!

Terms of Service: [Your Website URL]
Privacy Policy: [Your Privacy Policy URL]
Support: [Your Support Email]
```

**Keywords** (100 chars):
```
attendance, time tracking, clock in, clock out, geofence, employee, work hours, gps, location, timesheet
```

**Support URL**: Your website/support page
**Marketing URL**: Your website (optional)

### Step 3: App Privacy Details

Complete the privacy questionnaire:

**Data Collection**:
- ✅ **Location**: Precise location
  - Purpose: App functionality (automatic clock in/out)
  - Used for: Tracking attendance based on office location

**Data Types**:
- Contact info (optional, if user shares)
- Location (precise coordinates)
- Usage data (attendance records)

**Data Sharing**:
- ❌ No data sharing with third parties
- ❌ No data collected for advertising

### Step 4: Build Information

1. Go to **App Store Connect** → **My Apps** → **ClockOn**
2. Click **+** button next to **iOS App** in left sidebar
3. Select **New Version** or **Add Version**
4. Version: `1.0.0`
5. Complete all required fields:
   - ✅ Screenshots uploaded
   - ✅ Description provided
   - ✅ Keywords added
   - ✅ Support URLs configured
   - ✅ Privacy information completed
   - ✅ App icon uploaded (1024×1024px PNG)
   - ✅ Age rating completed

### Step 5: Submit for Review

1. Click **Add for Review** button
2. Review all information
3. Check the certification boxes:
   - ✅ Export compliance
   - ✅ Content rights
   - ✅ Advertising identifier (if NOT using IDFA, check "No")
4. Click **Submit for Review**

---

## App Store Review Process

### What to Expect:

**Timeline**: 1-3 business days (typically 24-48 hours)

**Review Process**:
1. Apple reviews your app for:
   - Technical compliance
   - Design guidelines
   - Content policies
   - Privacy practices

2. You may receive:
   - **Approval**: App is live on App Store! 🎉
   - **Rejection**: Fix issues and resubmit
   - **Questions**: Clarify aspects of your app

### Common Rejection Reasons:

- ❌ Missing or insufficient privacy policy
- ❌ Location permissions not justified
- ❌ Background location not necessary for app function
- ❌ App crashes or bugs
- ❌ Placeholder content
- ❌ Violation of design guidelines
- ❌ Metadata not matching app functionality

### How to Avoid Rejection:

1. **Test thoroughly** on real devices (not just simulator)
2. **Provide clear privacy policy** explaining location usage
3. **Document location necessity** in app description
4. **Test all features** before submission
5. **Include helpful error messages** for edge cases
6. **Follow Apple's Human Interface Guidelines**
7. **Ensure app is production-ready** (no debug code)

---

## Post-Submission Checklist

### After Approval:

- [ ] App is live on App Store
- [ ] Download and test from App Store
- [ ] Verify all features work correctly
- [ ] Check app listing displays properly
- [ ] Set up analytics (App Store Connect)
- [ ] Monitor crash reports
- [ ] Respond to user reviews
- [ ] Update app metadata as needed

### Marketing:

- [ ] Share App Store link
- [ ] Promote on social media
- [ ] Add to company website
- [ ] Create demo video
- [ ] Gather user testimonials

---

## Building Updates

### Version Updates Workflow:

1. Update version in `package.json`:
   ```json
   "version": "1.1.0"
   ```

2. Make code changes

3. Update Xcode build number:
   - Open project in Xcode
   - Increment **Build** number (e.g., 2, 3, 4...)

4. Test thoroughly

5. Create new archive:
   ```
   Product → Archive
   ```

6. Upload to App Store Connect

7. Submit as new version

### Version Numbering:

- **Marketing Version** (1.0.0, 1.1.0, 2.0.0)
  - MAJOR.MINOR.PATCH
  - MAJOR: Breaking changes
  - MINOR: New features
  - PATCH: Bug fixes

- **Build Number** (1, 2, 3...)
  - Increment with each build
  - Must always increase

---

## Troubleshooting

### Build Errors

**Error**: "No signing certificate found"
- **Solution**:
  1. Go to Xcode Preferences → Accounts
  2. Select your Apple ID
  3. Download manual profiles
  4. Clean and rebuild

**Error**: "Bundle identifier exists"
- **Solution**: Use unique bundle identifier
- Format: `com.yourcompany.clockon`

**Error**: "Provisioning profile doesn't include signing certificate"
- **Solution**:
  1. Re-download provisioning profile
  2. Reinstall certificate in Keychain Access

**Error**: "Architecture not supported"
- **Solution**:
  1. Build target: Any iOS Device (arm64)
  2. Excluded Architectures: armv7, armv7s

### Upload Errors

**Error**: "Invalid IPA"
- **Solution**:
  1. Clean build folder
  2. Rebuild archive
  3. Ensure Release configuration

**Error**: "App uses private APIs"
- **Solution**:
  1. Review third-party libraries
  2. Check for deprecated APIs
  3. Update React Native and dependencies

**Error**: "Missing icon"
- **Solution**:
  1. Add all required icon sizes
  2. Use Asset Catalog in Xcode
  3. Verify 1024×1024px app store icon

### Rejection Issues

**Reason**: "Location not justified"
- **Solution**:
  1. Update app description with clear use case
  2. Add privacy policy explaining location usage
  3. Consider adding location-independent features
  4. Resubmit with justification

**Reason**: "App crashes on launch"
- **Solution**:
  1. Test on physical device
  2. Check crash logs in Xcode Organizer
  3. Fix issues, rebuild, and resubmit

**Reason**: "Metadata mismatch"
- **Solution**:
  1. Ensure screenshots match app functionality
  2. Update description to reflect app features
  3. Remove references to unreleased features

---

## Quick Reference Commands

### Build Commands

```bash
# Clean build
npm run ios:clean

# Install pods
npm run ios:pods

# List available devices
npm run ios:devices

# Run in release mode
npm run ios:release

# Build archive (from project root)
xcodebuild -workspace ios/ClockOn.xcworkspace \
  -scheme ClockOn \
  -configuration Release \
  -archivePath build/ClockOn.xcarchive \
  -destination 'generic/platform=iOS' \
  -allowProvisioningUpdates
```

### Verification Commands

```bash
# Check bundle identifier
/usr/libexec/PlistBuddy -c "Print :CFBundleIdentifier" \
  ios/ClockOn/Info.plist

# Check version
/usr/libexec/PlistBuddy -c "Print :CFBundleShortVersionString" \
  ios/ClockOn/Info.plist

# Verify provisioning profile
security cms -D -i ios/profile/ClockOn.mobileprovision
```

---

## Resources

### Documentation

- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [App Store Connect Help](https://help.apple.com/app-store-connect/)
- [Code Signing Guide](https://developer.apple.com/support/code-signing/)

### Tools

- [Transporter](https://apps.apple.com/app/transporter/id1450874784)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Developer Portal](https://developer.apple.com/account/)

### Testing

- [TestFlight](https://developer.apple.com/testflight/)
- [Xcode Cloud](https://developer.apple.com/xcode-cloud/)

---

## Success Checklist

Before submitting, verify:

### Technical
- [ ] Build compiles without errors
- [ ] App runs on physical iOS device
- [ ] All features tested and working
- [ ] No console errors or warnings
- [ ] Memory leaks checked
- [ ] Battery usage optimized
- [ ] Background location working correctly

### Configuration
- [ ] Bundle identifier is unique
- [ ] Version number set to 1.0.0
- [ ] Build number incremented
- [ ] Code signing configured
- [ ] Provisioning profile valid
- [ ] All permissions described in Info.plist

### Store Assets
- [ ] App icon (1024×1024px) uploaded
- [ ] All required screenshots prepared
- [ ] Description written and reviewed
- [ ] Keywords optimized
- [ ] Privacy policy URL provided
- [ ] Support URL configured
- [ ] Age rating completed

### Legal
- [ ] Privacy policy created
- [ ] Terms of service created
- [ ] Export compliance documented
- [ ] Content rights declared
- [ ] Advertising ID usage declared

### Testing
- [ ] Tested on iPhone 6.7" display
- [ ] Tested on iPad (if supported)
- [ ] Tested on different iOS versions
- [ ] Location permissions flow tested
- [ ] Background location verified
- [ ] TestFlight testing completed

---

## Congratulations! 🎉

Once approved, your ClockOn app will be live on the App Store for millions of users to download!

### Next Steps:

1. Monitor downloads and analytics
2. Respond to user reviews promptly
3. Fix any bugs reported by users
4. Plan future updates
5. Gather feedback for improvements

### Support:

For issues during submission, contact:
- Apple Developer Support: https://developer.apple.com/support/
- App Store Connect Support: Available in App Store Connect

---

**Document Version**: 1.0
**Last Updated**: 2025-01-17
**For ClockOn Version**: 1.0.0
