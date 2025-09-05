# Local / External Deployment

## Requirements
- Node.js 18+
- PostgreSQL database and connection string in `DATABASE_URL`
- Google OAuth:
  - Server: `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`
  - Client: `VITE_GOOGLE_CLIENT_ID`
- Optional: `SENDGRID_API_KEY` (email queue), `ANTHROPIC_API_KEY` (AI replies)

## Setup
1. Install dependencies
   ```bash
   npm install
   ```
2. Create a `.env` file from `.env.example` and fill values.
3. Apply database schema
   ```bash
   npm run db:push
   ```
4. Start the development server
   ```bash
   npm run dev
   ```
   The web app and API will be available at `http://localhost:5000`.
5. Build for production
   ```bash
   npm run build
   npm start
   ```
6. (Optional) Run the React Native mobile app
   ```bash
   cd mobile && npm install
   npm start
   npm run android # or npm run ios
   ```

## Notes
- Email delivery: without `SENDGRID_API_KEY`, emails are queued and logged to console; you can manually verify via `POST /api/auth/manual-verify`.
- Google OAuth locally: add `http://localhost:5000/auth/google/callback` to Google Console authorized redirect URIs and set `VITE_GOOGLE_CLIENT_ID` to your Web client ID.
- Data privacy: server logs are minimal; no JSON response bodies are logged.
