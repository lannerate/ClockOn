# Rename iOS App from "ClockOn" to "ClockOn"

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rename the iOS app from "ClockOn" to "ClockOn" across all Xcode project files, directories, and CocoaPods configuration.

**Architecture:** This is a straightforward refactoring that involves renaming directories, updating Xcode project configuration files, and updating CocoaPods integration. The app display name is already "ClockOn" in Info.plist, so only internal project names need updates.

**Tech Stack:** React Native 0.76, Xcode project files, CocoaPods, Swift

---

### Task 1: Verify Current State and Backup

**Files:**
- Read: `ios/Podfile`
- Read: `ios/ClockOn.xcodeproj/project.pbxproj`

**Step 1: Verify current app name**

Run: `grep -n "ClockOn" ios/Podfile`
Expected Output:
```
17:target 'ClockOn' do
```

**Step 2: Count project.pbxproj references**

Run: `grep -c "ClockOn" ios/ClockOn.xcodeproj/project.pbxproj`
Expected Output: A number > 50 (all references that need updating)

**Step 3: Verify display name is already correct**

Run: `grep "CFBundleDisplayName" ios/ClockOn/Info.plist`
Expected Output:
```
<key>CFBundleDisplayName</key>
<string>ClockOn</string>
```

**Step 4: Create git commit checkpoint**

Run: `git status`
Expected: Clean working directory or only untracked files

Run: `git add -A && git commit -m "checkpoint: before iOS app rename"`
Expected: Commit created successfully

---

### Task 2: Rename Podfile Target

**Files:**
- Modify: `ios/Podfile:17`

**Step 1: Update Podfile target name**

Edit line 17 from:
```ruby
target 'ClockOn' do
```

To:
```ruby
target 'ClockOn' do
```

**Step 2: Verify the change**

Run: `grep "target '" ios/Podfile`
Expected Output:
```
target 'ClockOn' do
```

**Step 3: Commit Podfile change**

Run: `git add ios/Podfile && git commit -m "rename: update Podfile target from ClockOn to ClockOn"`
Expected: Commit created successfully

---

### Task 3: Rename Main App Directory

**Files:**
- Rename: `ios/ClockOn/` → `ios/ClockOn/`

**Step 1: Rename the app folder**

Run: `cd ios && mv ClockOn ClockOn`
Expected: No output, directory renamed

**Step 2: Verify directory exists**

Run: `ls -la ios/ | grep ClockOn`
Expected Output:
```
drwxr-xr-x  ClockOn
```

**Step 3: Verify old directory is gone**

Run: `ls ios/ClockOn 2>&1`
Expected Output: `No such file or directory` error

**Step 4: Commit directory rename**

Run: `git add -A && git commit -m "rename: move ios/ClockOn to ios/ClockOn"`
Expected: Commit created successfully (Git should track the rename)

---

### Task 4: Rename Xcode Project File

**Files:**
- Rename: `ios/ClockOn.xcodeproj/` → `ios/ClockOn.xcodeproj/`

**Step 1: Rename project directory**

Run: `cd ios && mv ClockOn.xcodeproj ClockOn.xcodeproj`
Expected: No output, directory renamed

**Step 2: Verify project directory exists**

Run: `ls -la ios/*.xcodeproj`
Expected Output:
```
ClockOn.xcodeproj
```

**Step 3: Verify old project is gone**

Run: `ls ios/ClockOn.xcodeproj 2>&1`
Expected Output: `No such file or directory` error

**Step 4: Commit project rename**

Run: `git add -A && git commit -m "rename: move ClockOn.xcodeproj to ClockOn.xcodeproj"`
Expected: Commit created successfully

---

### Task 5: Rename Workspace Directory

**Files:**
- Rename: `ios/ClockOn.xcworkspace/` → `ios/ClockOn.xcworkspace/`

**Step 1: Rename workspace directory**

Run: `cd ios && mv ClockOn.xcworkspace ClockOn.xcworkspace`
Expected: No output, directory renamed

**Step 2: Verify workspace directory exists**

Run: `ls -la ios/*.xcworkspace`
Expected Output:
```
ClockOn.xcworkspace
```

**Step 3: Verify old workspace is gone**

Run: `ls ios/ClockOn.xcworkspace 2>&1`
Expected Output: `No such file or directory` error

**Step 4: Commit workspace rename**

Run: `git add -A && git commit -m "rename: move ClockOn.xcworkspace to ClockOn.xcworkspace"`
Expected: Commit created successfully

---

### Task 6: Update Workspace Contents

**Files:**
- Modify: `ios/ClockOn.xcworkspace/contents.xcworkspacedata`

**Step 1: Read workspace contents**

Run: `cat ios/ClockOn.xcworkspace/contents.xcworkspacedata`
Expected: XML with reference to `ClockOn.xcodeproj`

**Step 2: Update workspace file reference**

Edit the file from:
```xml
<FileRef
   location = "group:ClockOn.xcodeproj">
</FileRef>
```

To:
```xml
<FileRef
   location = "group:ClockOn.xcodeproj">
</FileRef>
```

**Step 3: Verify the change**

Run: `grep "location = " ios/ClockOn.xcworkspace/contents.xcworkspacedata`
Expected Output:
```
location = "group:ClockOn.xcodeproj"
```

**Step 4: Commit workspace update**

Run: `git add ios/ClockOn.xcworkspace/contents.xcworkspacedata && git commit -m "rename: update workspace to reference ClockOn.xcodeproj"`
Expected: Commit created successfully

---

### Task 7: Rename Scheme File

**Files:**
- Rename: `ios/ClockOn.xcodeproj/xcshareddata/xcschemes/ClockOn.xcscheme` → `ClockOn.xcscheme`

**Step 1: Rename scheme file**

Run: `mv ios/ClockOn.xcodeproj/xcshareddata/xcschemes/ClockOn.xcscheme ios/ClockOn.xcodeproj/xcshareddata/xcschemes/ClockOn.xcscheme`
Expected: No output, file renamed

**Step 2: Verify scheme file exists**

Run: `ls ios/ClockOn.xcodeproj/xcshareddata/xcschemes/`
Expected Output:
```
ClockOn.xcscheme
```

**Step 3: Verify old scheme is gone**

Run: `ls ios/ClockOn.xcodeproj/xcshareddata/xcschemes/ClockOn.xcscheme 2>&1`
Expected Output: `No such file or directory` error

**Step 4: Commit scheme rename**

Run: `git add ios/ClockOn.xcodeproj/xcshareddata/xcschemes/ && git commit -m "rename: rename scheme from ClockOn to ClockOn"`
Expected: Commit created successfully

---

### Task 8: Update project.pbxproj - File Path References

**Files:**
- Modify: `ios/ClockOn.xcodeproj/project.pbxproj`

**Step 1: Update directory path references (ClockOn/ → ClockOn/)**

Run: `sed -i '' 's|path = ClockOn/|path = ClockOn/|g' ios/ClockOn.xcodeproj/project.pbxproj`
Expected: No output

**Step 2: Verify path changes**

Run: `grep "path = ClockOn/" ios/ClockOn.xcodeproj/project.pbxproj | head -3`
Expected Output:
```
path = ClockOn/Images.xcassets
path = ClockOn/Info.plist
path = ClockOn/PrivacyInfo.xcprivacy
```

**Step 3: Verify no old paths remain**

Run: `grep "path = ClockOn/" ios/ClockOn.xcodeproj/project.pbxproj`
Expected Output: (empty - no matches)

**Step 4: Commit path updates**

Run: `git add ios/ClockOn.xcodeproj/project.pbxproj && git commit -m "rename: update project.pbxproj file paths from ClockOn to ClockOn"`
Expected: Commit created successfully

---

### Task 9: Update project.pbxproj - Product Name References

**Files:**
- Modify: `ios/ClockOn.xcodeproj/project.pbxproj`

**Step 1: Update PRODUCT_NAME setting**

Run: `sed -i '' 's/productName = ClockOn;/productName = ClockOn;/g' ios/ClockOn.xcodeproj/project.pbxproj`
Expected: No output

**Step 2: Verify product name changes**

Run: `grep "productName = " ios/ClockOn.xcodeproj/project.pbxproj`
Expected Output:
```
productName = ClockOn;
```

**Step 3: Verify no old product names remain**

Run: `grep "productName = ClockOn" ios/ClockOn.xcodeproj/project.pbxproj`
Expected Output: (empty - no matches)

**Step 4: Commit product name updates**

Run: `git add ios/ClockOn.xcodeproj/project.pbxproj && git commit -m "rename: update PRODUCT_NAME from ClockOn to ClockOn"`
Expected: Commit created successfully

---

### Task 10: Update project.pbxproj - Target and Project Names

**Files:**
- Modify: `ios/ClockOn.xcodeproj/project.pbxproj`

**Step 1: Update target name references**

Run: `sed -i '' 's/ClockOn\.app/ClockOn.app/g' ios/ClockOn.xcodeproj/project.pbxproj`
Expected: No output

**Step 2: Update build file references**

Run: `sed -i '' 's/libPods-ClockOn/libPods-ClockOn/g' ios/ClockOn.xcodeproj/project.pbxproj`
Expected: No output

**Step 3: Update xcconfig file references**

Run: `sed -i '' 's/Pods-ClockOn\./Pods-ClockOn./g' ios/ClockOn.xcodeproj/project.pbxproj`
Expected: No output

**Step 4: Verify changes**

Run: `grep -E "(ClockOn\.app|libPods-ClockOn|Pods-ClockOn\.)" ios/ClockOn.xcodeproj/project.pbxproj | head -3`
Expected Output:
```
ClockOn.app
libPods-ClockOn.a
Pods-ClockOn.debug.xcconfig
```

**Step 5: Commit target name updates**

Run: `git add ios/ClockOn.xcodeproj/project.pbxproj && git commit -m "rename: update target references from ClockOn to ClockOn"`
Expected: Commit created successfully

---

### Task 11: Update project.pbxproj - Target and Project Display Names

**Files:**
- Modify: `ios/ClockOn.xcodeproj/project.pbxproj`

**Step 1: Update PBXNativeTarget name**

Run: `sed -i '' 's/PBXNativeTarget "ClockOn"/PBXNativeTarget "ClockOn"/g' ios/ClockOn.xcodeproj/project.pbxproj`
Expected: No output

**Step 2: Update project name references**

Run: `sed -i '' 's/name = ClockOn;/name = ClockOn;/g' ios/ClockOn.xcodeproj/project.pbxproj`
Expected: No output

**Step 3: Verify name changes**

Run: `grep -E "PBXNativeTarget|name = ClockOn;" ios/ClockOn.xcodeproj/project.pbxproj | head -5`
Expected Output should show "ClockOn" not "ClockOn"

**Step 4: Verify no old names remain**

Run: `grep -i "ClockOn" ios/ClockOn.xcodeproj/project.pbxproj | wc -l`
Expected Output: `0` (or very few incidental references in comments)

**Step 5: Commit name updates**

Run: `git add ios/ClockOn.xcodeproj/project.pbxproj && git commit -m "rename: update target and project display names to ClockOn"`
Expected: Commit created successfully

---

### Task 12: Clean and Reinstall CocoaPods

**Files:**
- Clean: `ios/Pods/`
- Regenerate: `ios/Podfile.lock`

**Step 1: Remove existing Pods installation**

Run: `cd ios && rm -rf Pods Podfile.lock`
Expected: No output

**Step 2: Verify Pods directory removed**

Run: `ls ios/Pods 2>&1`
Expected Output: `No such file or directory` error

**Step 3: Reinstall CocoaPods dependencies**

Run: `cd ios && bundle exec pod install`
Expected Output:
```
Analyzing dependencies
...
Pod installation complete!
```

**Step 4: Verify new Pods directory**

Run: `ls ios/ | grep -E "Pods|Podfile"`
Expected Output:
```
Pods
Podfile.lock
```

**Step 5: Verify new Podfile.lock references ClockOn**

Run: `grep -i "ClockOn" ios/Podfile.lock | head -3`
Expected Output: References to "ClockOn" not "ClockOn"

**Step 6: Commit CocoaPods updates**

Run: `git add ios/Podfile.lock ios/Pods && git commit -m "rename: reinstall CocoaPods with ClockOn target"`
Expected: Commit created successfully

---

### Task 13: Verify Build Configuration

**Files:**
- Test: `ios/ClockOn.xcodeproj`

**Step 1: Open project in Xcode**

Run: `open ios/ClockOn.xcworkspace`
Expected: Xcode opens with the project

**Step 2: Check scheme selector**

In Xcode: Look at the scheme selector (top bar)
Expected: Should show "ClockOn" > "ClockOn" or similar

**Step 3: Verify no build errors**

In Xcode: Press `Cmd+B` to build
Expected: Build succeeds without errors

**Step 4: Close Xcode**

Run: Click Xcode > Quit Xcode or press `Cmd+Q`
Expected: Xcode closes

---

### Task 14: Final Verification and Testing

**Files:**
- Verify: All iOS configuration files

**Step 1: Verify no ClockOn references remain**

Run: `find ios -name "*.xcodeproj" -o -name "*.xcworkspace" -o -name "*.plist" | xargs grep -l "ClockOn" 2>/dev/null | grep -v Pods`
Expected Output: (empty - no matches outside Pods)

**Step 2: Verify ClockOn references are present**

Run: `find ios -name "*.xcodeproj" -o -name "*.xcworkspace" | xargs grep -l "ClockOn" 2>/dev/null | grep -v Pods | head -3`
Expected Output: Multiple files referencing "ClockOn"

**Step 3: Check iOS directory structure**

Run: `ls -la ios/ | grep -E "^d" | grep -v "^\.$"`
Expected Output should show:
```
ClockOn
ClockOn.xcodeproj
ClockOn.xcworkspace
Pods
build
```

**Step 4: Verify git status**

Run: `git status`
Expected: All changes committed, clean working directory

**Step 5: Create final summary commit**

Run: `git commit --allow-empty -m "rename: complete iOS app rename from ClockOn to ClockOn

- Renamed main app directory: ClockOn → ClockOn
- Renamed Xcode project: ClockOn.xcodeproj → ClockOn.xcodeproj
- Renamed workspace: ClockOn.xcworkspace → ClockOn.xcworkspace
- Renamed scheme: ClockOn.xcscheme → ClockOn.xcscheme
- Updated all project.pbxproj references
- Updated Podfile target
- Reinstalled CocoaPods dependencies
- App display name was already 'ClockOn' in Info.plist"
Expected: Commit created successfully

---

### Task 15: Update App Config (if applicable)

**Files:**
- Check: `app.json`
- Check: `package.json`

**Step 1: Check app.json for iOS name**

Run: `grep -A 5 "ios" app.json 2>/dev/null || echo "No app.json or no iOS config"`
Expected: Verify if any iOS-specific configuration needs updating

**Step 2: Check package.json for name**

Run: `grep '"name"' package.json`
Expected Output:
```
"name": "ClockOn"
```

**Step 3: Note if package.json needs updating**

If package.json name is "ClockOn" and should match the app name, this is a separate concern. The iOS app name is now "ClockOn" which matches the display name. The package name (npm scope) can remain different.

**Step 4: Document any discrepancies**

If there are discrepancies between package name and app name, note them in project README or documentation.

---

## Testing Checklist

After completing all tasks:

- [ ] `open ios/ClockOn.xcworkspace` opens project successfully
- [ ] Xcode scheme selector shows "ClockOn"
- [ ] Build succeeds (`Cmd+B` in Xcode)
- [ ] No "ClockOn" references in project files (excluding Pods)
- [ ] Podfile target is `ClockOn`
- [ ] All directories renamed correctly
- [ ] Git history shows clean rename progression

## Rollback Instructions

If anything goes wrong:

```bash
# Reset to checkpoint commit
git log --oneline | grep "checkpoint: before iOS app rename"
git reset --hard <commit-hash>

# Or revert all rename commits
git revert --no-commit HEAD~<number-of-commits>..HEAD
git commit -m "revert: roll back iOS app rename"
```

## Notes

- The `CFBundleDisplayName` in Info.plist was already "ClockOn" - this ensures the app name under the icon on device is correct
- Only internal Xcode project names needed updating
- CocoaPods had to be reinstalled because it generates target-specific files
- This change affects iOS build configuration but doesn't change the app's bundle identifier or npm package name
