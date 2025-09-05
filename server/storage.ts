import { 
  profiles, chatSessions, chatMessages, anxietyAnalyses, therapists, 
  userTherapists, userGoals, goalProgress, interventionSummaries, emailQueue,
  therapistPatientConnections,
  type Profile, type InsertProfile, type ChatSession, type InsertChatSession,
  type ChatMessage, type InsertChatMessage, type AnxietyAnalysis, type InsertAnxietyAnalysis,
  type Therapist, type InsertTherapist, type UserTherapist, type InsertUserTherapist,
  type UserGoal, type InsertUserGoal, type GoalProgress, type InsertGoalProgress,
  type InterventionSummary, type InsertInterventionSummary,
  type TherapistPatientConnection, type InsertTherapistPatientConnection,
  type NormalizedInterventionSummary
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, gt } from "drizzle-orm";

export interface IStorage {
  // Profile management
  getProfile(id: string): Promise<Profile | undefined>;
  getProfileByEmail(email: string): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  updateProfile(id: string, profile: Partial<InsertProfile>): Promise<Profile | undefined>;

  // Chat sessions
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getChatSessionsByUser(userId: string): Promise<ChatSession[]>;
  getAllChatSessions(): Promise<ChatSession[]>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  updateChatSession(id: string, session: Partial<InsertChatSession>): Promise<ChatSession | undefined>;

  // Chat messages
  getChatMessage(id: string): Promise<ChatMessage | undefined>;
  getChatMessagesBySession(sessionId: string): Promise<ChatMessage[]>;
  getChatMessagesByUser(userId: string): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;

  // Anxiety analyses
  getAnxietyAnalysis(id: string): Promise<AnxietyAnalysis | undefined>;
  getAnxietyAnalysesByUser(userId: string): Promise<AnxietyAnalysis[]>;
  getAllAnxietyAnalyses(): Promise<AnxietyAnalysis[]>;
  createAnxietyAnalysis(analysis: InsertAnxietyAnalysis): Promise<AnxietyAnalysis>;

  // Therapists
  getTherapist(id: string): Promise<Therapist | undefined>;
  getTherapistsByLocation(city: string, state: string): Promise<Therapist[]>;
  getTherapistsBySpecialty(specialty: string): Promise<Therapist[]>;
  createTherapist(therapist: InsertTherapist): Promise<Therapist>;
  updateTherapist(id: string, therapist: Partial<InsertTherapist>): Promise<Therapist | undefined>;

  // User therapists
  getUserTherapistsByUser(userId: string): Promise<UserTherapist[]>;
  createUserTherapist(userTherapist: InsertUserTherapist): Promise<UserTherapist>;
  updateUserTherapist(id: string, userTherapist: Partial<InsertUserTherapist>): Promise<UserTherapist | undefined>;

  // User goals
  getUserGoal(id: string): Promise<UserGoal | undefined>;
  getUserGoalsByUser(userId: string): Promise<UserGoal[]>;
  createUserGoal(goal: InsertUserGoal): Promise<UserGoal>;
  updateUserGoal(id: string, goal: Partial<InsertUserGoal>): Promise<UserGoal | undefined>;

  // Goal progress
  getGoalProgressByGoal(goalId: string): Promise<GoalProgress[]>;
  createGoalProgress(progress: InsertGoalProgress): Promise<GoalProgress>;

  // Intervention summaries
  getInterventionSummariesByUser(userId: string): Promise<NormalizedInterventionSummary[]>;
  createInterventionSummary(summary: InsertInterventionSummary): Promise<InterventionSummary>;
  updateInterventionSummary(id: string, summary: Partial<InsertInterventionSummary>): Promise<InterventionSummary | undefined>;

  // Therapist connections
  createTherapistConnection(connection: { userId: string; therapistName: string; contactValue: string; notes: string; shareReport: boolean }): Promise<UserTherapist>;

  // Email queue
  createEmailNotification(email: { toEmail: string; subject: string; htmlContent: string; emailType: string; metadata?: string }): Promise<any>;
  getEmailNotificationsByTherapist(therapistEmail: string): Promise<any[]>;
  
  // Email verification
  createEmailVerification(email: string, token: string): Promise<void>;
  
  // License management
  updateProfileLicenseInfo(id: string, licenseNumber?: string | null, licenseState?: string | null, graceDeadline?: Date | null): Promise<void>;
  updateProfileVerification(id: string, token: string): Promise<Profile | undefined>;
  verifyEmail(token: string): Promise<Profile | undefined>;
  verifyEmailByAddress(email: string): Promise<Profile | undefined>;
  getPendingEmails(): Promise<any[]>;
  updateEmailStatus(emailId: string, status: string): Promise<void>;
  setPasswordResetToken(email: string, token: string, expires: Date): Promise<Profile | undefined>;
  resetPassword(token: string, newPassword: string): Promise<Profile | undefined>;
  
  // Email queue management
  getPendingEmails(): Promise<any[]>;
  updateEmailStatus(emailId: string, status: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // Profile management
  async getProfile(id: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.id, id)).limit(1);
    return result[0];
  }

  async getProfileByEmail(email: string): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.email, email)).limit(1);
    return result[0];
  }

  async createProfile(profile: InsertProfile): Promise<Profile> {
    const result = await db.insert(profiles).values(profile).returning();
    return result[0];
  }

  async updateProfile(id: string, profile: Partial<InsertProfile>): Promise<Profile | undefined> {
    const result = await db.update(profiles).set({
      ...profile,
      updatedAt: new Date()
    }).where(eq(profiles.id, id)).returning();
    return result[0];
  }

  // Chat sessions
  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const result = await db.select().from(chatSessions).where(eq(chatSessions.id, id)).limit(1);
    return result[0];
  }

  async getChatSessionsByUser(userId: string): Promise<ChatSession[]> {
    return await db.select().from(chatSessions).where(eq(chatSessions.userId, userId));
  }

  async getAllChatSessions(): Promise<ChatSession[]> {
    return await db.select().from(chatSessions).orderBy(desc(chatSessions.updatedAt));
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const result = await db.insert(chatSessions).values(session).returning();
    return result[0];
  }

  async updateChatSession(id: string, session: Partial<InsertChatSession>): Promise<ChatSession | undefined> {
    const result = await db.update(chatSessions).set({
      ...session,
      updatedAt: new Date()
    }).where(eq(chatSessions.id, id)).returning();
    return result[0];
  }

  // Chat messages
  async getChatMessage(id: string): Promise<ChatMessage | undefined> {
    const result = await db.select().from(chatMessages).where(eq(chatMessages.id, id)).limit(1);
    return result[0];
  }

  async getChatMessagesBySession(sessionId: string): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages).where(eq(chatMessages.sessionId, sessionId)).orderBy(chatMessages.createdAt);
  }

  async getChatMessagesByUser(userId: string): Promise<ChatMessage[]> {
    // Join with chat_sessions to get all messages for a user across all sessions
    const result = await db
      .select({
        id: chatMessages.id,
        sessionId: chatMessages.sessionId,
        userId: chatMessages.userId,
        content: chatMessages.content,
        sender: chatMessages.sender,
        createdAt: chatMessages.createdAt
      })
      .from(chatMessages)
      .innerJoin(chatSessions, eq(chatMessages.sessionId, chatSessions.id))
      .where(eq(chatSessions.userId, userId))
      .orderBy(chatMessages.createdAt);
    
    return result;
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const result = await db.insert(chatMessages).values(message).returning();
    return result[0];
  }

  // Anxiety analyses
  async getAnxietyAnalysis(id: string): Promise<AnxietyAnalysis | undefined> {
    const result = await db.select().from(anxietyAnalyses).where(eq(anxietyAnalyses.id, id)).limit(1);
    return result[0];
  }

  async getAnxietyAnalysesByUser(userId: string): Promise<AnxietyAnalysis[]> {
    return await db.select().from(anxietyAnalyses).where(eq(anxietyAnalyses.userId, userId));
  }

  async getAllAnxietyAnalyses(): Promise<AnxietyAnalysis[]> {
    return await db.select().from(anxietyAnalyses).orderBy(desc(anxietyAnalyses.createdAt));
  }

  async createAnxietyAnalysis(analysis: InsertAnxietyAnalysis): Promise<AnxietyAnalysis> {
    const result = await db.insert(anxietyAnalyses).values(analysis).returning();
    return result[0];
  }

  // Therapists
  async getTherapist(id: string): Promise<Therapist | undefined> {
    const result = await db.select().from(therapists).where(eq(therapists.id, id)).limit(1);
    return result[0];
  }

  async getTherapistsByLocation(city: string, state: string): Promise<Therapist[]> {
    return await db.select().from(therapists).where(
      and(eq(therapists.city, city), eq(therapists.state, state))
    );
  }

  async getTherapistsBySpecialty(specialty: string): Promise<Therapist[]> {
    return await db.select().from(therapists);  // TODO: Implement array contains search
  }

  async createTherapist(therapist: InsertTherapist): Promise<Therapist> {
    const result = await db.insert(therapists).values(therapist).returning();
    return result[0];
  }

  async updateTherapist(id: string, therapist: Partial<InsertTherapist>): Promise<Therapist | undefined> {
    const result = await db.update(therapists).set({
      ...therapist,
      updatedAt: new Date()
    }).where(eq(therapists.id, id)).returning();
    return result[0];
  }

  // User therapists
  async getUserTherapistsByUser(userId: string): Promise<UserTherapist[]> {
    return await db.select().from(userTherapists).where(eq(userTherapists.userId, userId));
  }

  async createUserTherapist(userTherapist: InsertUserTherapist): Promise<UserTherapist> {
    const result = await db.insert(userTherapists).values(userTherapist).returning();
    return result[0];
  }

  async updateUserTherapist(id: string, userTherapist: Partial<InsertUserTherapist>): Promise<UserTherapist | undefined> {
    const result = await db.update(userTherapists).set({
      ...userTherapist,
      updatedAt: new Date()
    }).where(eq(userTherapists.id, id)).returning();
    return result[0];
  }

  // User goals
  async getUserGoal(id: string): Promise<UserGoal | undefined> {
    const result = await db.select().from(userGoals).where(eq(userGoals.id, id)).limit(1);
    return result[0];
  }

  async getUserGoalsByUser(userId: string): Promise<UserGoal[]> {
    return await db.select().from(userGoals).where(eq(userGoals.userId, userId));
  }

  async createUserGoal(goal: InsertUserGoal): Promise<UserGoal> {
    const result = await db.insert(userGoals).values(goal).returning();
    return result[0];
  }

  async updateUserGoal(id: string, goal: Partial<InsertUserGoal>): Promise<UserGoal | undefined> {
    const result = await db.update(userGoals).set({
      ...goal,
      updatedAt: new Date()
    }).where(eq(userGoals.id, id)).returning();
    return result[0];
  }

  // Goal progress
  async getGoalProgressByGoal(goalId: string): Promise<GoalProgress[]> {
    return await db.select().from(goalProgress).where(eq(goalProgress.goalId, goalId));
  }

  async createGoalProgress(progress: InsertGoalProgress): Promise<GoalProgress> {
    const result = await db.insert(goalProgress).values(progress).returning();
    return result[0];
  }

  // Intervention summaries
  async getInterventionSummariesByUser(userId: string): Promise<NormalizedInterventionSummary[]> {
    const raw = await db
      .select()
      .from(interventionSummaries)
      .where(eq(interventionSummaries.userId, userId));

    const { normalizeInterventionSummary } = await import('@shared/schema');
    return raw.map(normalizeInterventionSummary);
  }

  async createInterventionSummary(summary: InsertInterventionSummary): Promise<InterventionSummary> {
    const result = await db.insert(interventionSummaries).values(summary).returning();
    return result[0];
  }

  async updateInterventionSummary(id: string, summary: Partial<InsertInterventionSummary>): Promise<InterventionSummary | undefined> {
    const result = await db.update(interventionSummaries).set({
      ...summary,
      updatedAt: new Date()
    }).where(eq(interventionSummaries.id, id)).returning();
    return result[0];
  }

  // Therapist connections
  async createTherapistConnection(connection: { userId: string; therapistName: string; contactValue: string; notes: string; shareReport: boolean }): Promise<UserTherapist> {
    const result = await db.insert(userTherapists).values({
      userId: connection.userId,
      therapistName: connection.therapistName,
      contactMethod: 'email', // Default to email since contactValue appears to be email
      contactValue: connection.contactValue,
      notes: connection.notes,
      shareReport: connection.shareReport
    }).returning();
    return result[0];
  }

  // HIPAA-compliant connection management
  async createTherapistPatientConnection(connection: InsertTherapistPatientConnection): Promise<TherapistPatientConnection> {
    const [result] = await db
      .insert(therapistPatientConnections)
      .values(connection)
      .returning();
    return result;
  }

  async getTherapistPatientConnections(therapistEmail: string): Promise<TherapistPatientConnection[]> {
    return await db
      .select()
      .from(therapistPatientConnections)
      .where(and(
        eq(therapistPatientConnections.therapistEmail, therapistEmail),
        eq(therapistPatientConnections.isActive, true),
        eq(therapistPatientConnections.patientConsentGiven, true),
        eq(therapistPatientConnections.therapistAccepted, true)
      ));
  }

  async acceptTherapistConnection(connectionId: string, therapistEmail: string): Promise<TherapistPatientConnection | undefined> {
    const [result] = await db
      .update(therapistPatientConnections)
      .set({
        therapistAccepted: true,
        connectionAcceptedDate: new Date(),
        updatedAt: new Date()
      })
      .where(and(
        eq(therapistPatientConnections.id, connectionId),
        eq(therapistPatientConnections.therapistEmail, therapistEmail)
      ))
      .returning();
    
    return result;
  }

  // Email queue
  async createEmailNotification(email: { toEmail: string; subject: string; htmlContent: string; emailType: string; metadata?: string }): Promise<any> {
    const result = await db.insert(emailQueue).values({
      toEmail: email.toEmail,
      fromEmail: 'info@tranquiloo-app.com', // Use verified sender
      subject: email.subject,
      htmlContent: email.htmlContent,
      textContent: email.htmlContent.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      emailType: email.emailType,
      metadata: email.metadata || null
    }).returning();
    return result[0];
  }

  async getEmailNotificationsByTherapist(therapistEmail: string): Promise<any[]> {
    return await db.select().from(emailQueue)
      .where(eq(emailQueue.toEmail, therapistEmail))
      .orderBy(desc(emailQueue.createdAt));
  }

  // Email verification methods
  async updateProfileVerification(id: string, token: string | null, verified?: boolean): Promise<Profile | undefined> {
    const updateData: any = {
      emailVerificationToken: token,
      updatedAt: new Date()
    };
    
    if (verified !== undefined) {
      updateData.emailVerified = verified;
    }
    
    const result = await db.update(profiles).set(updateData).where(eq(profiles.id, id)).returning();
    return result[0];
  }

  async verifyEmail(token: string): Promise<Profile | undefined> {
    const result = await db.update(profiles).set({
      emailVerified: true,
      emailVerificationToken: null,
      updatedAt: new Date()
    }).where(eq(profiles.emailVerificationToken, token)).returning();
    return result[0];
  }

  async createEmailVerification(email: string, token: string): Promise<void> {
    await db.update(profiles).set({
      emailVerificationToken: token,
      updatedAt: new Date()
    }).where(eq(profiles.email, email));
  }

  async verifyEmailByAddress(email: string): Promise<Profile | undefined> {
    const result = await db.update(profiles).set({
      emailVerified: true,
      emailVerificationToken: null,
      updatedAt: new Date()
    }).where(eq(profiles.email, email)).returning();
    return result[0];
  }

  async setPasswordResetToken(email: string, token: string, expires: Date): Promise<Profile | undefined> {
    const result = await db.update(profiles).set({
      passwordResetToken: token,
      passwordResetExpires: expires,
      updatedAt: new Date()
    }).where(eq(profiles.email, email)).returning();
    return result[0];
  }

  async resetPassword(token: string, newPassword: string): Promise<Profile | undefined> {
    // Ensure token is valid and not expired
    const now = new Date();
    const existing = await db
      .select()
      .from(profiles)
      .where(and(eq(profiles.passwordResetToken, token), gt(profiles.passwordResetExpires, now)))
      .limit(1);

    const profile = existing[0];
    if (!profile) return undefined;

    // Hash the new password before storing
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await db
      .update(profiles)
      .set({
        hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profile.id))
      .returning();
    return result[0];
  }

  // License management
  async updateProfileLicenseInfo(id: string, licenseNumber?: string | null, licenseState?: string | null, graceDeadline?: Date | null): Promise<void> {
    await db.update(profiles).set({
      licenseNumber: licenseNumber,
      licenseState: licenseState,
      licenseGraceDeadline: graceDeadline,
      updatedAt: new Date()
    }).where(eq(profiles.id, id));
  }

  // Email queue management methods
  async getPendingEmails(): Promise<any[]> {
    return await db.select().from(emailQueue)
      .where(eq(emailQueue.status, 'pending'))
      .orderBy(emailQueue.createdAt);
  }

  async updateEmailStatus(emailId: string, status: string): Promise<void> {
    await db.update(emailQueue).set({
      status: status,
      sentAt: status === 'sent' ? new Date() : null
    }).where(eq(emailQueue.id, emailId));
  }
}

export const storage = new DatabaseStorage();
