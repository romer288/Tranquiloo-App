# Overview

This is a full-stack anxiety support application providing AI-powered anxiety management. It offers conversational companions, clinical assessment tools, anxiety tracking analytics, goal setting, and therapist matching services. The application leverages advanced AI for anxiety analysis, implements comprehensive chat functionality with speech recognition and synthesis, and provides detailed analytics for tracking mental health progress. It aims to offer comprehensive mental health support for various anxiety disorders and related conditions, providing immediate grounding techniques and evidence-based interventions during crisis situations.

# User Preferences

Preferred communication style: Simple, everyday language.
Authentication behavior: When therapists try to sign in without having an account, show clear message directing them to sign up first.

# System Architecture

## Frontend Architecture
- **Web Framework**: React 18 with TypeScript using Vite.
- **Mobile Framework**: React Native 0.75.4 for iOS and Android.
- **UI Library**: Shadcn/ui (web) built on Radix UI with Tailwind CSS; Native React Native components (mobile).
- **State Management**: React hooks and context for local state, React Query for server state.
- **Routing**: React Router for web, React Navigation Stack for mobile.
- **Authentication**: Multi-platform Google OAuth (Web, iOS, Android) with server-side callback and email/password fallback.

## Backend Architecture
- **Runtime**: Node.js with Express.js using TypeScript.
- **API Design**: RESTful API.
- **Database Layer**: Drizzle ORM with PostgreSQL.
- **Session Management**: Express sessions with PostgreSQL session store.
- **File Structure**: Modular architecture.

## Data Storage Solutions
- **Primary Database**: PostgreSQL with Neon serverless hosting.
- **ORM**: Drizzle ORM.
- **Schema Location**: Centralized schema definitions.
- **Tables**: User profiles, chat sessions, messages, anxiety analyses, therapists, user goals, goal progress, and intervention summaries.

## Authentication and Authorization
- **Provider**: Supabase.
- **Methods**: Google OAuth, email/password, phone OTP.
- **Session Management**: Supabase session handling.
- **Route Protection**: Protected route wrappers.

## Key Features and Components
- **AI Companions**: Vanessa (English) and Monica (Spanish) with emotion-aware avatars.
- **Speech Integration**: Web Speech API for voice input/output.
- **Anxiety Analysis**: Claude AI integration with local fallback for anxiety level assessment.
- **Clinical Tools**: GAD-7, PHQ-9, and other validated assessment instruments.
- **Analytics Dashboard**: Comprehensive anxiety tracking with charts, trends, and goal progress.
- **Goal Management**: SMART goal setting with progress tracking.
- **Crisis Response**: AI-driven crisis intervention with immediate grounding techniques and condition-specific responses for PTSD, OCD, GAD, panic attacks, and hallucinations.
- **Therapist Integration**: Gmail OAuth for therapist registration, license verification system for US/Canada therapists, HIPAA-compliant patient directory with explicit patient consent, and a comprehensive therapist dashboard.

# External Dependencies

## Core Backend Services
- **Neon PostgreSQL**: Serverless PostgreSQL database hosting.
- **Supabase**: Authentication and user management platform.

## AI and Analysis Services
- **Claude AI**: Advanced anxiety analysis and personalized response generation.
- **Web Speech API**: Browser-based speech recognition and synthesis.

## Frontend Libraries
- **Radix UI**: Accessible component primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **React Query**: Server state management and caching.
- **Recharts**: Data visualization library.
- **Lucide Icons**: Icon library.

## Development and Build Tools
- **Vite**: Fast build tool and development server.
- **TypeScript**: Type safety across the application stack.
- **ESBuild**: JavaScript bundler.
- **Drizzle Kit**: Database migration and schema management.

## Replit Deployment

To run this project on [Replit](https://replit.com):

1. **Create a new Repl** from this repository.
2. **Add environment variables** in the Replit *Secrets* panel:
   - `DATABASE_URL`
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`
   - `GOOGLE_CLIENT_ID`
   - (optional) `SENDGRID_API_KEY`
3. **Install dependencies** and start the development server:
   ```bash
   npm install
   npm run dev
   ```
   The web client and API will be served on port `5000`.
4. **Apply database schema** when needed:
   ```bash
   npm run db:push
   ```

Replit automatically exposes the running server. Use the generated URL to test the application from a browser or mobile device.
