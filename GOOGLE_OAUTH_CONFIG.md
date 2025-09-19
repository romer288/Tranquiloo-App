# Step 3: Google Cloud Console OAuth Configuration

Based on the redirect URI mismatch error and your live Replit domain, here's the **EXACT** configuration you need:

## Google Cloud Console → Credentials → "Client ID for Web application"

### Authorized JavaScript origins:
```
https://tranquiloo-app-arthrombus.replit.app
```

### Authorized redirect URIs:
```
https://tranquiloo-app-arthrombus.replit.app/auth/google/callback
```

## Important Notes:

1. **Use ONLY the Web Client ID** (`522576524084-pr5i8ucn0o6r4ckd0967te9orpiigkt2.apps.googleusercontent.com`)
   - This is for ALL website authentication, including mobile browsers
   - The iOS/Android clients are ONLY for native apps, not web browsers

2. **Remove any localhost or development URLs** from the Web client
   - Only use the production Replit domain shown above

3. **Case-sensitive exact match required**
   - Must be exactly: `https://tranquiloo-app-arthrombus.replit.app/auth/google/callback`
   - No trailing slashes, no variations

4. **Test the configuration:**
   - Visit: `https://tranquiloo-app-arthrombus.replit.app/auth/google`
   - Check that the redirect URL in the Google OAuth page matches exactly

## Why This Fixes iPhone Authentication:

- iPhone Safari uses the same web flow as desktop
- Google validates the redirect URI against the Web client settings
- Your current error shows a mismatch between registered and actual domains
- This configuration aligns them perfectly

## After updating Google Cloud Console:

1. Save the changes (may take a few minutes to propagate)
2. Test on iPhone Safari using "Open in New Tab"
3. Both Gmail login and email/password will work correctly