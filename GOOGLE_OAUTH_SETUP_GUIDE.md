# Google OAuth Setup Guide for Tranquil Support

## Mobile App Configuration Values

### 🤖 Android OAuth Client
- **Application Type:** Android app
- **Package Name:** `com.tranquilsupport`
- **SHA-1 Certificate Fingerprint:** `43:63:EF:72:EC:64:B3:12:28:70:58:3C:E4:F4:5A:C8:33:BC:02:C0`

### 📱 iOS OAuth Client  
- **Application Type:** iOS app
- **Bundle ID:** `com.tranquilsupport`

### 🌐 Web OAuth Client (Current)
- **Application Type:** Web application
- **Authorized JavaScript Origins:**
  - `https://6c8ae978-61a0-44a7-9865-6053862c2e21-00-1ntklv2gkiqw5.picard.replit.dev`
- **Authorized Redirect URIs:**
  - `https://6c8ae978-61a0-44a7-9865-6053862c2e21-00-1ntklv2gkiqw5.picard.replit.dev`

## Step-by-Step Google Console Setup

### 1. Go to Google Cloud Console
- Navigate to: https://console.cloud.google.com/
- Go to: APIs & Services → Credentials

### 2. Create OAuth 2.0 Client IDs

#### For Web (Current App)
1. Click "Create Credentials" → OAuth 2.0 Client ID
2. Application type: Web application
3. Name: Tranquil Support Web
4. Authorized JavaScript origins: Add the Replit URL above
5. Authorized redirect URIs: Add the Replit URL above
6. Save and copy Client ID

#### For Android
1. Click "Create Credentials" → OAuth 2.0 Client ID  
2. Application type: Android
3. Name: Tranquil Support Android
4. Package name: `com.tranquilsupport`
5. SHA-1 certificate fingerprint: [Use generated SHA-1 below]
6. Save and download google-services.json

#### For iOS
1. Click "Create Credentials" → OAuth 2.0 Client ID
2. Application type: iOS
3. Name: Tranquil Support iOS  
4. Bundle ID: `com.tranquilsupport`
5. Save and download GoogleService-Info.plist

### 3. Configure Mobile Apps

#### Android Setup
1. Place `google-services.json` in `mobile/android/app/`
2. Update `mobile/android/app/build.gradle` (already configured)
3. SHA-1 fingerprint will be generated and displayed below

#### iOS Setup  
1. Place `GoogleService-Info.plist` in `mobile/ios/TranquilSupport/`
2. Update Info.plist with bundle ID (already created)
3. Install CocoaPods dependencies

### 4. Update Environment Variables
Add the new Client IDs to your Replit secrets:
- `GOOGLE_CLIENT_ID` (web)
- `ANDROID_GOOGLE_CLIENT_ID` (android)  
- `IOS_GOOGLE_CLIENT_ID` (ios)

## File Locations
- Android config: `mobile/android/app/google-services.json`
- iOS config: `mobile/ios/TranquilSupport/GoogleService-Info.plist`
- Web config: Environment variable `GOOGLE_CLIENT_ID`

## Current Project Status
✅ Android package configured: com.tranquilsupport
✅ iOS bundle configured: com.tranquilsupport  
✅ iOS Info.plist created
🔄 SHA-1 certificate generating...
🔄 Debug keystore created