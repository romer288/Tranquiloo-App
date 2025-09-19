import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";

// HIPAA-compliant therapist-patient connections
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

export type TherapistPatientConnection = typeof therapistPatientConnections.$inferSelect;
export type InsertTherapistPatientConnection = typeof therapistPatientConnections.$inferInsert;