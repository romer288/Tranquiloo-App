# Tranquil Support Mobile App Deployment Guide

This guide covers deploying the React Native mobile app to both Google Play Store (Android) and Apple App Store (iOS).

## Pre-Deployment Checklist

> **Security Warning:** Never commit real keystore passwords or other secrets to version control. Store them in environment variables or a secret manager.

### 1. OAuth Configuration Complete
- ✅ Web OAuth Client: `522576524084-pr5i8ucn0o6r4ckd0967te9orpiigkt2.apps.googleusercontent.com`
- ✅ iOS OAuth Client: `522576524084-28q57dbq1hk0b5e24oaklp9hkn0v6jra.apps.googleusercontent.com` 
- ✅ Android OAuth Client: `522576524084-sdbirsc4aitpet16h9pcsk8kdobv30bu.apps.googleusercontent.com`
- ✅ SHA-1 Certificate: `43:63:EF:72:EC:64:B3:12:28:70:58:3C:E4:F4:5A:C8:33:BC:02:C0`

### 2. Required Files
- ✅ `android/app/google-services.json` (Android)
- ✅ `ios/TranquilSupport/GoogleService-Info.plist` (iOS)
- ✅ `android/app/debug.keystore` (Development)
- ⚠️  Production keystore needed for Play Store

### 3. App Configuration
- ✅ Package Name: `com.tranquilsupport`
- ✅ Bundle ID: `com.tranquilsupport`
- ✅ App Name: "Tranquil Support"
- ✅ Version: 1.0.0

## Android Deployment (Google Play Store)

### Step 1: Generate Release Keystore
```bash
cd mobile/android/app
keytool -genkey -v -keystore release.keystore -alias release -keyalg RSA -keysize 2048 -validity 10000
```

### Step 2: Configure Release Signing
Add to `android/gradle.properties` (use environment variables or a secret manager for the actual values):
```
RELEASE_STORE_FILE=release.keystore
RELEASE_KEY_ALIAS=release
RELEASE_STORE_PASSWORD=${RELEASE_STORE_PASSWORD}
RELEASE_KEY_PASSWORD=${RELEASE_KEY_PASSWORD}
```

Set the real passwords in your environment or CI/CD secret manager:

```
export RELEASE_STORE_PASSWORD="your_store_password"
export RELEASE_KEY_PASSWORD="your_key_password"
```

### Step 3: Build Release APK
```bash
cd mobile
npm run build:android
```

### Step 4: Generate Release SHA-1
```bash
keytool -list -v -keystore android/app/release.keystore -alias release
```

### Step 5: Update Google Console
- Add the new release SHA-1 to your Android OAuth client
- Keep both debug and release SHA-1 certificates

### Step 6: Upload to Play Store
1. Create developer account at [Google Play Console](https://play.google.com/console)
2. Create new application
3. Upload the release APK/AAB
4. Complete store listing with app details
5. Submit for review

## iOS Deployment (Apple App Store)

### Step 1: Apple Developer Setup
1. Enroll in [Apple Developer Program](https://developer.apple.com/programs/)
2. Create App ID for `com.tranquilsupport`
3. Generate provisioning profiles

### Step 2: Xcode Configuration
```bash
cd mobile/ios
pod install
```

1. Open `TranquilSupport.xcworkspace` in Xcode
2. Configure signing with your developer certificate
3. Set deployment target (iOS 12.0+)
4. Configure app icons and launch screens

### Step 3: Build for Release
1. Product → Archive in Xcode
2. Validate and export IPA
3. Upload to App Store Connect

### Step 4: App Store Connect
1. Create app in [App Store Connect](https://appstoreconnect.apple.com)
2. Upload IPA through Xcode or Transporter
3. Complete app information and metadata
4. Submit for App Store review

## Testing Before Deployment

### Android Testing
```bash
# Install on device
adb install android/app/build/outputs/apk/release/app-release.apk

# Test OAuth flow
# Test on multiple devices/Android versions
```

### iOS Testing
```bash
# TestFlight (beta testing)
# Upload beta build to App Store Connect
# Invite testers via TestFlight
```

## OAuth Production Configuration

### Google Console Updates Needed
1. **Android OAuth Client** - Add production SHA-1
2. **iOS OAuth Client** - Already configured
3. **Web OAuth Client** - Add production domains if needed

### Production SHA-1 (Example)
```
Debug: 43:63:EF:72:EC:64:B3:12:28:70:58:3C:E4:F4:5A:C8:33:BC:02:C0
Release: [Generate new SHA-1 from release keystore]
```

## Store Listing Information

### App Description
"Tranquil Support is a comprehensive mental health platform connecting patients with licensed therapists. Features include AI-powered anxiety tracking, personalized treatment plans, secure messaging, and progress analytics. Available for both patients seeking support and therapists managing their practice."

### Keywords
- Mental health
- Therapy
- Anxiety support
- Telehealth
- Patient care
- Therapist tools

### Screenshots Needed
- Login screen with role selection
- Patient dashboard
- Therapist dashboard  
- OAuth sign-in flow
- Key features in action

### Age Rating
- **Google Play**: Teen (13+)
- **App Store**: 12+ (Medical/Treatment Information)

## Post-Deployment

### Monitoring
- Monitor OAuth sign-in success rates
- Track app crashes and performance
- Collect user feedback

### Updates
- Plan regular updates for both platforms
- Maintain OAuth certificate validity
- Keep dependencies updated for security

## Support Documents
- Privacy Policy URL (required)
- Terms of Service URL (required)
- Support contact information
- App website URL

This deployment guide ensures your React Native app is properly configured for both platforms with working Google OAuth authentication.
