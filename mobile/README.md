# Tranquil Support Mobile App

A React Native mobile application for both iOS and Android platforms providing mental health support with Google OAuth authentication.

## Features

- **Cross-Platform**: Works on both iOS and Android
- **Google OAuth**: Native Google Sign-In integration
- **Role-Based Authentication**: Support for both patients and therapists
- **Unified Registration**: Single portal with role selection
- **Native UI**: Platform-specific design patterns

## Setup Instructions

### Prerequisites

1. Node.js 18+ installed
2. React Native development environment set up
3. Android Studio (for Android development)
4. Xcode (for iOS development on macOS)

### Installation

```bash
cd mobile
npm install
```

### Android Setup

1. Place `google-services.json` in `android/app/`
2. Ensure Android SDK is installed
3. Run: `npm run android`

### iOS Setup

1. Copy `ios/TranquilSupport/GoogleService-Info.plist.example` to `ios/TranquilSupport/GoogleService-Info.plist`
2. Populate the new file with real values using environment variables or CI secrets (see below)
3. Install iOS dependencies: `cd ios && pod install`
4. Run: `npm run ios`

### Supplying API Keys Securely

The repo only contains a template `GoogleService-Info.plist.example` with a dummy `API_KEY`.
During development or automated builds, inject the real file from a secure source:

```bash
# decode base64 plist from IOS_GOOGLE_SERVICE_INFO env var
echo "$IOS_GOOGLE_SERVICE_INFO" | base64 --decode > ios/TranquilSupport/GoogleService-Info.plist
```

Never commit the real `GoogleService-Info.plist` to version control.

## OAuth Configuration

The app is configured with three OAuth clients:

- **Web Client ID**: `522576524084-pr5i8ucn0o6r4ckd0967te9orpiigkt2.apps.googleusercontent.com`
- **iOS Client ID**: `522576524084-28q57dbq1hk0b5e24oaklp9hkn0v6jra.apps.googleusercontent.com`
- **Android Client ID**: `522576524084-sdbirsc4aitpet16h9pcsk8kdobv30bu.apps.googleusercontent.com`

## Package Information

- **Package Name (Android)**: `com.tranquilsupport`
- **Bundle ID (iOS)**: `com.tranquilsupport`
- **SHA-1 Certificate**: `43:63:EF:72:EC:64:B3:12:28:70:58:3C:E4:F4:5A:C8:33:BC:02:C0`

## Project Structure

```
mobile/
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx     # Authentication state management
│   └── screens/
│       ├── LoginScreen.tsx     # Unified login with role selection
│       ├── DashboardScreen.tsx # Patient dashboard
│       └── TherapistDashboardScreen.tsx # Therapist dashboard
├── android/                    # Android-specific files
├── ios/                       # iOS-specific files
├── App.tsx                    # Main app component
└── package.json              # Dependencies and scripts
```

## Key Features

### Authentication
- Google OAuth with platform-specific client IDs
- Email/password authentication fallback
- Persistent login state with AsyncStorage
- Role-based navigation (patient vs therapist)

### User Interface
- Native platform design patterns
- Responsive layouts for different screen sizes
- Professional styling for healthcare applications
- Accessibility features

### Navigation
- Stack navigation with React Navigation
- Role-based dashboard routing
- Secure authentication flow

## Development

### Running the App

```bash
# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Building for Production

```bash
# Android APK
npm run build:android

# iOS Release
npm run build:ios
```

## Security

- OAuth tokens stored securely in AsyncStorage
- Platform-specific Google OAuth client configurations
- Secure certificate-based Android authentication
- iOS Keychain integration support

## Support

This mobile app complements the web application and provides native mobile experience for Tranquil Support users on both iOS and Android platforms.