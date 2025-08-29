import { pgTable, text, integer, boolean, uuid, timestamp, json, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User profiles table
export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  avatarUrl: text("avatar_url"),
  patientCode: text("patient_code"),
  role: text("role").default("user"),
  hashedPassword: text("hashed_password"), // Added for password authentication
  emailVerified: boolean("email_verified").default(false),
  emailVerificationToken: text("email_verification_token"),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: timestamp("password_reset_expires"),
  authMethod: text("auth_method").default("email"), // 'email' or 'google'
  licenseNumber: text("license_number"), // For therapists
  licenseState: text("license_state"), // For therapists
  licenseGraceDeadline: timestamp("license_grace_deadline"), // 24-hour grace period
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat sessions table
export const chatSessions = pgTable("chat_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(), // Changed from uuid to text for user compatibility
  title: text("title").default("New Chat Session"),
  aiCompanion: text("ai_companion").default("vanessa"),
  language: text("language").default("english"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat messages table
export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionId: uuid("session_id").notNull(),
  userId: text("user_id").notNull(), // Changed from uuid to text for user compatibility
  content: text("content").notNull(),
  sender: text("sender").notNull(), // 'user' or 'ai'
  createdAt: timestamp("created_at").defaultNow(),
});

// Anxiety analyses table
export const anxietyAnalyses = pgTable("anxiety_analyses", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(), // Changed from uuid to text for user compatibility
  messageId: uuid("message_id"),
  anxietyLevel: integer("anxiety_level").notNull(),
  analysisSource: text("analysis_source").default("claude"),
  anxietyTriggers: text("anxiety_triggers").array(),
  copingStrategies: text("coping_strategies").array(),
  personalizedResponse: text("personalized_response"),
  confidenceScore: numeric("confidence_score", { precision: 3, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Therapists table  
export const therapists = pgTable("therapists", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  address: text("address").notNull(),
  city: text("city").notNull(),
  state: text("state").notNull(),
  zipCode: text("zip_code").notNull(),
  licensure: text("licensure").notNull(),
  specialty: text("specialty").array(),
  insurance: text("insurance").array(),
  practiceType: text("practice_type"),
  acceptingPatients: boolean("accepting_patients"),
  acceptsUninsured: boolean("accepts_uninsured"),
  yearsOfExperience: integer("years_of_experience"),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  bio: text("bio"),
  website: text("website"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User therapists (for tracking user-therapist relationships)
export const userTherapists = pgTable("user_therapists", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(), // Changed from uuid to text for user compatibility
  therapistName: text("therapist_name").notNull(),
  contactMethod: text("contact_method").notNull(),
  contactValue: text("contact_value").notNull(),
  notes: text("notes"),
  shareReport: boolean("share_report").default(true),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// HIPAA-compliant therapist-patient connections table
export const therapistPatientConnections = pgTable("therapist_patient_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  patientId: uuid("patient_id").notNull(),
  therapistEmail: text("therapist_email").notNull(),
  patientEmail: text("patient_email").notNull(),
  patientCode: text("patient_code").notNull(),
  patientConsentGiven: boolean("patient_consent_given").default(false),
  therapistAccepted: boolean("therapist_accepted").default(false),
  connectionRequestDate: timestamp("connection_request_date").defaultNow(),
  connectionAcceptedDate: timestamp("connection_accepted_date"),
  shareAnalytics: boolean("share_analytics").default(false),
  shareReports: boolean("share_reports").default(false),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User goals table
export const userGoals = pgTable("user_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(), // Changed from uuid to text for user compatibility
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  frequency: text("frequency").notNull(),
  targetValue: numeric("target_value"),
  unit: text("unit"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Goal progress tracking
export const goalProgress = pgTable("goal_progress", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(), // Changed from uuid to text for user compatibility
  goalId: uuid("goal_id").notNull(),
  score: integer("score").notNull(),
  notes: text("notes"),
  recordedAt: text("recorded_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Intervention summaries
export const interventionSummaries = pgTable("intervention_summaries", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(), // Changed from uuid to text for user compatibility
  weekStart: text("week_start").notNull(),
  weekEnd: text("week_end").notNull(),
  interventionType: text("intervention_type").default("cbt"),
  conversationCount: integer("conversation_count").default(0),
  keyPoints: text("key_points").array().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Internal email queue for all notifications
export const emailQueue = pgTable("email_queue", {
  id: uuid("id").primaryKey().defaultRandom(),
  toEmail: text("to_email").notNull(),
  fromEmail: text("from_email").default("info@tranquiloo-app.com"),
  subject: text("subject").notNull(),
  htmlContent: text("html_content").notNull(),
  textContent: text("text_content"),
  emailType: text("email_type").notNull(), // 'email_verification', 'password_reset', 'connection_request', 'app_recommendation', etc.
  status: text("status").default("pending"), // 'pending', 'sent', 'failed'
  metadata: text("metadata"), // JSON string for additional data
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas for form validation
export const insertProfileSchema = createInsertSchema(profiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertAnxietyAnalysisSchema = createInsertSchema(anxietyAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertTherapistSchema = createInsertSchema(therapists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserTherapistSchema = createInsertSchema(userTherapists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserGoalSchema = createInsertSchema(userGoals).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTherapistPatientConnectionSchema = createInsertSchema(therapistPatientConnections).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGoalProgressSchema = createInsertSchema(goalProgress).omit({
  id: true,
  createdAt: true,
});

export const insertInterventionSummarySchema = createInsertSchema(interventionSummaries).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Type exports
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Profile = typeof profiles.$inferSelect;

export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;

export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;

export type InsertAnxietyAnalysis = z.infer<typeof insertAnxietyAnalysisSchema>;
export type AnxietyAnalysis = typeof anxietyAnalyses.$inferSelect;

export type InsertTherapist = z.infer<typeof insertTherapistSchema>;
export type Therapist = typeof therapists.$inferSelect;

export type InsertUserTherapist = z.infer<typeof insertUserTherapistSchema>;
export type UserTherapist = typeof userTherapists.$inferSelect;

export type InsertUserGoal = z.infer<typeof insertUserGoalSchema>;
export type UserGoal = typeof userGoals.$inferSelect;

export type InsertGoalProgress = z.infer<typeof insertGoalProgressSchema>;
export type GoalProgress = typeof goalProgress.$inferSelect;

export type InsertInterventionSummary = z.infer<typeof insertInterventionSummarySchema>;
export type InterventionSummary = typeof interventionSummaries.$inferSelect;

export type InsertTherapistPatientConnection = z.infer<typeof insertTherapistPatientConnectionSchema>;
export type TherapistPatientConnection = typeof therapistPatientConnections.$inferSelect;

// Normalized intervention summary interface with snake_case fields
export interface NormalizedInterventionSummary {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  intervention_type: string;
  conversation_count: number;
  key_points: string[];
  recommendations: string[];
  limitations: string[];
  created_at?: string;
}

// Helper: coerce an arbitrary object into a normalized InterventionSummary
export const normalizeInterventionSummary = (s: any): NormalizedInterventionSummary => {
  const toArray = (v: unknown): string[] => {
    if (Array.isArray(v)) return v.filter(Boolean).map(String);
    if (typeof v === 'string' && v.trim().length) {
      // handle "{...}" or 'a, b, c'
      if (v.startsWith('{') && v.endsWith('}')) {
        return v
          .slice(1, -1)
          .split('","')
          .map(t => t.replace(/^"|"$/g, '').trim())
          .filter(Boolean);
      }
      return v.split(',').map(t => t.trim()).filter(Boolean);
    }
    return [];
  };

  const id = String(
    s.id ??
      `${s.userId ?? s.user_id ?? 'u'}-${s.weekStart ?? s.week_start ?? Date.now()}`
  );

  const week_start =
    s.weekStart ??
    s.week_start ??
    s.week ?? // some backends use week
    new Date().toISOString();

  const week_end =
    s.weekEnd ??
    s.week_end ??
    week_start;

  const intervention_type = String(
    s.interventionType ?? s.intervention_type ?? s.type ?? 'unknown'
  )
    .replace(/[\s-]+/g, '_')
    .toLowerCase();

  const conversation_count = Number(s.conversationCount ?? s.conversation_count ?? 0);

  return {
    id,
    user_id: String(s.user_id ?? s.userId ?? 'unknown'),
    week_start,
    week_end,
    intervention_type,
    conversation_count,
    key_points: toArray(s.key_points ?? s.keyPoints),
    recommendations: toArray(s.recommendations),
    limitations: toArray(s.limitations ?? s.limitation_points),
    created_at: s.created_at ?? s.createdAt
  } as NormalizedInterventionSummary;
};
