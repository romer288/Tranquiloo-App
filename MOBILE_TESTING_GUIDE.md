# Mobile Testing Guide for Tranquil Support App

## Option 1: Test Web Version on Phone (Immediate)

**Access via Mobile Browser:**
- URL: `https://6c8ae978-61a0-44a7-9865-6053862c2e21-00-1ntklv2gkiqw5.picard.replit.dev`
- Works on any smartphone browser (Chrome, Safari, Firefox)
- Fully responsive design optimized for mobile
- All features available: Gmail OAuth, chat, analytics, therapist connection

**Features Working on Mobile Web:**
- Patient and therapist login portals
- Gmail authentication
- Email registration/login
- AI chat with Vanessa
- Progress analytics and charts
- Therapist matching and contact
- Responsive mobile-optimized interface

## Option 2: Native React Native App (Advanced)

**Prerequisites:**
- Node.js installed on development machine
- React Native CLI: `npm install -g react-native-cli`
- For Android: Android Studio + Android SDK
- For iOS: Xcode (macOS only)

**Setup Steps:**
```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# For Android development
npm run android

# For iOS development (macOS only)
npm run ios
```

**Mobile App Features:**
- Native iOS and Android compatibility
- Offline data persistence with AsyncStorage
- Native Google OAuth integration
- Voice recognition and text-to-speech
- Push notifications support
- Native navigation and animations
- Biometric authentication ready

## Option 3: Progressive Web App (PWA) - Recommended

**Install as Phone App:**
1. Open the web URL in your phone's browser
2. Look for "Add to Home Screen" or "Install App" option
3. The app will behave like a native app with:
   - Home screen icon
   - Full-screen experience
   - Offline capabilities (partial)
   - Push notifications (when configured)

## Testing Checklist

### Authentication Testing
- [ ] Gmail OAuth login (patient portal)
- [ ] Gmail OAuth login (therapist portal) 
- [ ] Email registration/login
- [ ] Role-based dashboard access
- [ ] Logout functionality

### Core Features Testing
- [ ] Chat with AI companion
- [ ] Voice input/output (if supported by browser)
- [ ] Progress analytics viewing
- [ ] Therapist connection flow
- [ ] Settings and profile management

### Mobile UX Testing
- [ ] Touch interactions (tap, swipe, scroll)
- [ ] Screen orientation (portrait/landscape)
- [ ] Keyboard input and form handling
- [ ] Navigation between screens
- [ ] Responsive layout on different screen sizes

## Deployment Options

### For Public Access
1. **Replit Deployments**: Deploy directly from Replit for public access
2. **Vercel/Netlify**: Deploy the web version for custom domains
3. **App Store Publishing**: Build and submit native apps

### For Testing
1. **QR Code Access**: Generate QR code for the web URL
2. **Share Link**: Send the URL directly to test devices
3. **Local Network**: Access via local network IP during development

## Mobile Browser Compatibility

**Fully Supported:**
- Chrome Mobile (Android)
- Safari Mobile (iOS)
- Firefox Mobile
- Samsung Internet
- Edge Mobile

**Features by Browser:**
- **Speech Recognition**: Chrome, Edge (limited Safari support)
- **Push Notifications**: All major browsers
- **Offline Storage**: All browsers support localStorage/sessionStorage
- **Camera/File Access**: All browsers with user permission

## Quick Start for Phone Testing

**Easiest Method:**
1. Open your phone's web browser
2. Go to: `https://6c8ae978-61a0-44a7-9865-6053862c2e21-00-1ntklv2gkiqw5.picard.replit.dev`
3. Test patient login with Gmail or email
4. Explore all features: chat, analytics, therapist connection
5. Add to home screen for app-like experience

**For Best Mobile Experience:**
- Use in portrait mode for optimal layout
- Enable location services if prompted (for therapist matching)
- Allow microphone access for voice features
- Add to home screen for quick access

The web version is fully mobile-optimized and provides the complete mental health support experience on any smartphone.