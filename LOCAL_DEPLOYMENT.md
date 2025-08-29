# Local / External Deployment

## Requirements
- Node.js 18+
- PostgreSQL database and connection string in `DATABASE_URL`
- API keys: `GOOGLE_CLIENT_ID`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`
- Optional: `SENDGRID_API_KEY` for email features

## Setup
1. Install dependencies
   ```bash
   npm install
   ```
2. Create a `.env` file with the variables above.
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
