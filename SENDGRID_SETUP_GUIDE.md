# SendGrid API Key Setup Guide

## Step 1: Navigate to API Keys
1. In your SendGrid dashboard (where you are now)
2. Click on **Settings** in the left sidebar
3. Click on **API Keys**

## Step 2: Create API Key
1. Click **Create API Key** button
2. Choose **Restricted Access** (not Full Access)
3. Give it a name like "Tranquil-App-Email"

## Step 3: Set Permissions
1. Find **Mail Send** in the permissions list
2. Enable **ONLY** this permission
3. All other permissions should remain disabled

## Step 4: Generate and Copy
1. Click **Create & View** 
2. Copy the API key (starts with "SG.")
3. **IMPORTANT**: Save it immediately - you can't view it again!

## Step 5: Add to Replit
1. Go to your Replit project
2. Click the **Secrets** tab (lock icon)
3. Find **SENDGRID_API_KEY**
4. Replace the current value with your new key

## What You'll See
- Current key starts with "Jll" (wrong format)
- New key should start with "SG." (correct format)

## Test It
Once added, create a new account in your app - you should receive real emails!

## Common Issues
- Key doesn't start with "SG." → Wrong key type
- "Unauthorized" error → Wrong permissions set
- No emails received → Check spam folder first