# How to Download Your Complete Project

## Project Type
This is a **hybrid application** with:
- **Web Application**: Full React web app that runs in browsers (desktop and mobile browsers)
- **Native Mobile App**: React Native app in the `/mobile` folder for iOS and Android native apps

## Method 1: Download as ZIP (Easiest)
1. Click the three dots menu (⋮) in the Files panel on the left
2. Select "Download as zip"
3. This downloads your entire project including all code files

## Method 2: Using Git (If you want version control)
1. In Replit, open the Shell tab
2. Initialize git and push to your own GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Database Export
Your PostgreSQL database schema and data can be exported:

### Schema Only (Structure):
```bash
pg_dump $DATABASE_URL --schema-only > database-schema.sql
```

### Full Database (Schema + Data):
```bash
pg_dump $DATABASE_URL > full-database-backup.sql
```

### Current Database Tables:
- profiles (users)
- chat_sessions
- chat_messages  
- anxiety_analyses
- therapists
- user_goals
- goal_progress
- intervention_summaries
- user_therapists
- email_queue

## Project Structure:
```
/
├── client/           # React web application
│   └── src/         # Web app source code
├── server/          # Express.js backend API
├── shared/          # Shared TypeScript types and schemas
├── mobile/          # React Native mobile app (iOS & Android)
├── supabase/        # Database migrations history
│   └── migrations/  # SQL migration files
└── database-schema.sql  # Complete database structure
```

## What's Included:
- ✅ Complete React web application
- ✅ React Native mobile app (iOS & Android)
- ✅ Express.js backend with TypeScript
- ✅ PostgreSQL database schema (Drizzle ORM)
- ✅ Authentication system (email + Google OAuth)
- ✅ SendGrid email integration
- ✅ Claude AI integration for anxiety analysis
- ✅ All configuration files

## Deployment Options:

### Web App:
- Deploy to Vercel, Netlify, or any Node.js hosting
- Use the included `package.json` scripts
- Set up environment variables from `.env` file

### Mobile App:
- Build with React Native CLI or Expo
- Configure Google OAuth certificates for production
- Deploy to App Store and Google Play

### Database:
- Import the SQL schema to any PostgreSQL instance
- Recommended: Neon, Supabase, or Railway for serverless PostgreSQL

## Environment Variables Needed:
- DATABASE_URL (PostgreSQL connection)
- SENDGRID_API_KEY (Email service)
- GOOGLE_CLIENT_ID (OAuth)
- CLAUDE_API_KEY or ANTHROPIC_API_KEY (AI features)

## Next Steps After Download:
1. Install dependencies: `npm install`
2. Set up PostgreSQL database
3. Configure environment variables
4. Run development server: `npm run dev`
5. For mobile: `cd mobile && npm install`