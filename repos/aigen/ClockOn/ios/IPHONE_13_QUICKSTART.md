# Quick Start: ClockOn on iPhone 13

## ✅ Verified Compatibility

Your iPhone 13 is **fully supported** with ClockOn!

### Specs Verified:
- ✅ **iOS 15.1+** required (iPhone 13 launched with iOS 15)
- ✅ **Screen:** 6.1" Super Retina XDR (390x844)
- ✅ **Notch:** Handled by SafeAreaProvider
- ✅ **Home Indicator:** SafeAreaProvider handles this
- ✅ **React Native 0.83.1:** Fully compatible

## 🚀 How to Install on Your iPhone 13

### Option 1: Using Xcode (Recommended)

1. **Open project in Xcode:**
   ```bash
   open ios/ClockOn.xcworkspace
   ```

2. **Connect your iPhone 13:**
   - Use USB cable to connect to Mac
   - Unlock your iPhone
   - Tap "Trust" when prompted

3. **Select your team in Xcode:**
   - Click "ClockOn" project (left sidebar)
   - Go to "Signing & Capabilities" tab
   - Under "Signing", select your Apple ID from "Team" dropdown
   - Xcode will create provisioning profile automatically

4. **Select your iPhone 13:**
   - Click device selector in Xcode toolbar (top)
   - Choose your iPhone 13 from the list

5. **Build and Run:**
   - Press ▶️ (Play button) in Xcode
   - First build takes 2-5 minutes
   - App will install and launch on your iPhone

### Option 2: Command Line

```bash
# Make sure iPhone is connected and trusted first
npx react-native run-ios --device
```

## 📱 First Launch Setup

When ClockOn opens on your iPhone 13:

### 1. Location Permissions (Critical!)
You'll see prompts like:
- **"ClockOn would like to access your location"**
  → Tap **"Allow While Using App"**

**For automatic clock in/out, you also need:**
- Go to iPhone **Settings > Privacy & Location Services**
- Find **ClockOn**
- Enable **"Precise Location"** toggle
- Enable **"Background Location"** toggle (for automatic geofence)

### 2. Testing the App

**Test these features:**
1. ✅ **Clock In/Out button** - Main dashboard
2. ✅ **Settings** - Tap the gear icon (bottom right)
3. ✅ **Monthly Stats** - Tap the chart icon (bottom right)
4. ✅ **Geofence** - Add office location in Settings first

### iPhone 13 Specific Considerations

**Display:** ✅ Perfect fit
- 6.1" screen size fully supported
- Notch doesn't interfere (SafeAreaProvider handles it)
- Bottom tabs have proper spacing from home indicator

**Performance:** ✅ Optimized
- Hermes JavaScript engine (fast startup)
- Efficient SQLite database
- Smooth 60fps animations

**Battery:** ✅ Geofencing optimized
- Background location only when needed
- Efficient GPS polling (10m filter, 5s interval)
- 30-second dwell timer prevents false positives

## 🔧 Troubleshooting

### "App won't install"
1. Check USB connection
2. Ensure iPhone is unlocked
3. Trust computer on iPhone (Settings > General > VPN & Device Management)
4. Check Xcode console for errors

### "Location not working"
1. Go to iPhone Settings > Privacy > Location Services
2. Find ClockOn and enable all permissions
3. Enable "Precise Location" (not Approximate)
4. Enable "Background Location" if using automatic geofence

### "App crashes on launch"
1. Check bundle ID matches: `org.reactjs.native.ClockOn`
2. Verify development team selected in Xcode
3. Check iPhone trusts developer certificate
4. Review crash logs in Xcode Organizer

### "Geofence not triggering"
1. Enable background location permission
2. Ensure office location is added in Settings
3. Walk >100m away from office to trigger clock out
4. Wait 30 seconds when entering before clock in (dwell timer)

## 📊 Test Results Expected

On iPhone 13 with iOS 15+, you should experience:

- ✅ Fast app launch (<3 seconds)
- ✅ Smooth screen transitions
- ✅ Accurate GPS location (<50m accuracy)
- ✅ Automatic clock in/out at office boundaries
- ✅ Reliable database operations
- ✅ No layout issues or overlap
- ✅ Proper spacing from notch and home indicator

## 📝 Bundle Information

**For reference:**
- **Bundle ID:** `org.reactjs.native.ClockOn`
- **Display Name:** ClockOn
- **Version:** 1.0.0
- **Build:** Debug (for development)

## 🎯 Success Indicators

You'll know it's working when:
1. App appears on iPhone home screen as "ClockOn"
2. Tap to launch opens app quickly
3. Dashboard shows clock status
4. Location permission prompt appears
5. You can clock in/out with button tap
6. Settings screen is accessible
7. Monthly stats load correctly

**Your iPhone 13 is fully compatible with ClockOn!** 🎉
