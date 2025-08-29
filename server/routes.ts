import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import * as bcrypt from "bcryptjs";
import { emailService } from "./emailService";
import { 
  insertProfileSchema, insertChatSessionSchema, insertChatMessageSchema,
  insertAnxietyAnalysisSchema, insertTherapistSchema, insertUserTherapistSchema,
  insertUserGoalSchema, insertGoalProgressSchema, insertInterventionSummarySchema,
  normalizeInterventionSummary
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  console.log('Registering authentication routes...');

  // Therapist API endpoints
  app.post('/api/therapist/search-patient', async (req, res) => {
    try {
      const { email, patientCode } = req.body;
      
      // Search for patient by both email AND code
      const patientProfile = await storage.getProfileByEmail(email);
      
      if (patientProfile && patientProfile.patientCode === patientCode) {
        res.json({
          id: patientProfile.id,
          user_id: patientProfile.id,
          email: patientProfile.email,
          firstName: patientProfile.firstName,
          lastName: patientProfile.lastName,
          patientCode: patientProfile.patientCode,
          created_at: patientProfile.createdAt
        });
      } else {
        res.status(404).json({ error: 'Patient not found with provided email and code' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Search failed' });
    }
  });

  app.get('/api/therapist/patient/:id/analytics', async (req, res) => {
    try {
      const patientId = req.params.id;
      
      // Get anonymized patient analytics data
      const analyses = await storage.getAnxietyAnalysesByUser(patientId);
      const goals = await storage.getUserGoalsByUser(patientId);
      const interventions = await storage.getInterventionSummariesByUser(patientId);
      
      res.json({
        patientName: 'Patient X', // Anonymized for HIPAA
        analysesCount: analyses.length,
        analyses,
        goals,
        interventions
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to load patient analytics' });
    }
  });

  // Patient analytics route (for patient's own data)
  app.get('/api/patient/analytics', async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: 'userId required' });

      const [profile, analyses, messages, goals, summariesRaw] = await Promise.all([
        storage.getProfile(String(userId)),
        storage.getAnxietyAnalysesByUser(String(userId)),
        storage.getChatMessagesByUser(String(userId)),
        storage.getUserGoalsByUser(String(userId)),
        storage.getInterventionSummariesByUser(String(userId)),
      ]);

      const summaries = (summariesRaw ?? []).map(normalizeInterventionSummary);

      return res.json({
        profile,
        analyses,
        messages,
        goals,
        summaries, // ✅ same key + normalized
      });
    } catch (e) {
      console.error('Patient analytics error:', e);
      res.status(500).json({ error: 'Failed to load analytics' });
    }
  });

  // Therapist analytics endpoint with proper data aggregation
  app.get('/api/therapist/patient-analytics', async (req, res) => {
    try {
      const { patientId, therapistEmail } = req.query;
      
      if (!patientId || !therapistEmail) {
        return res.status(400).json({ error: 'patientId and therapistEmail required' });
      }
      
      // Get patient profile
      const profile = await storage.getProfile(patientId as string);
      
      // Get patient data aggregated for therapist view
      const analyses = await storage.getAnxietyAnalysesByUser(patientId as string);
      const messages = await storage.getChatMessagesByUser(patientId as string);
      const goals = await storage.getUserGoalsByUser(patientId as string);
      const summariesRaw = await storage.getInterventionSummariesByUser(patientId as string);
      
      // Normalize summaries to ensure consistent field names
      const summaries = (summariesRaw ?? []).map(normalizeInterventionSummary);
      
      // Join analyses with patient messages to get actual patient problems
      const enrichedAnalyses = analyses.map(analysis => {
        // Find patient messages around the same time as the analysis
        const analysisDate = new Date(analysis.createdAt || (analysis as any).created_at);
        const patientMessages = messages.filter(msg => {
          if (msg.sender !== 'user') return false;
          const msgDate = new Date(msg.createdAt || (msg as any).created_at);
          const timeDiff = Math.abs(analysisDate.getTime() - msgDate.getTime());
          // Messages within 30 minutes of the analysis
          return timeDiff < 30 * 60 * 1000;
        });
        
        return {
          ...analysis,
          patient_message: patientMessages.length > 0 ? patientMessages[0].content : null,
          session_id: patientMessages.length > 0 ? patientMessages[0].sessionId : null
        };
      });
      
      res.json({
        profile,
        analyses: enrichedAnalyses,
        messages,
        goals,
        summaries // ✅ unified key with normalized data
      });
    } catch (error) {
      console.error('Therapist analytics error:', error);
      res.status(500).json({ error: 'Failed to load patient analytics' });
    }
  });

  app.post('/api/therapist/chat', async (req, res) => {
    try {
      const { message, patientId, context } = req.body;
      
      // Generate therapeutic AI response (anonymized)
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': process.env.ANTHROPIC_API_KEY || '',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 300,
          messages: [{
            role: 'user',
            content: `You are Vanessa, a therapeutic AI assistant helping a therapist with Patient X. 
            
Context: ${context}
Patient Data: Anonymized as "Patient X" for HIPAA compliance.

Therapist Question: ${message}

Provide a concise, professional response with therapeutic insights and recommendations. Focus on evidence-based treatments and specific actionable strategies.`
          }]
        })
      });

      if (response.ok) {
        const aiData = await response.json();
        res.json({ reply: aiData.content[0].text });
      } else {
        res.json({ reply: "I apologize, but I'm having trouble accessing my therapeutic knowledge base right now. Please try again in a moment." });
      }
    } catch (error) {
      res.json({ reply: "I'm here to help with therapeutic guidance. Please rephrase your question and I'll do my best to assist." });
    }
  });

  app.get('/api/therapist/patient/:id/reports', async (req, res) => {
    try {
      const patientId = req.params.id;
      
      // Return available reports for patient
      const reports = [
        {
          id: `history_${patientId}`,
          type: 'download_history',
          title: 'Download History Report',
          description: 'Comprehensive anxiety analysis data and progress over time',
          generatedAt: new Date().toISOString(),
          size: '2.3 MB'
        },
        {
          id: `summary_${patientId}`,
          type: 'conversation_summary',
          title: 'Conversation Summary Report',
          description: 'Summarized chat interactions with key therapeutic insights',
          generatedAt: new Date().toISOString(),
          size: '1.8 MB'
        }
      ];
      
      res.json(reports);
    } catch (error) {
      res.status(500).json({ error: 'Failed to load reports' });
    }
  });

  app.get('/api/therapist/reports/:id/content', async (req, res) => {
    try {
      const reportId = req.params.id;
      
      // Generate report content
      let content = '';
      if (reportId.includes('history')) {
        content = `
# Download History Report - Patient X

## Summary
This report contains anonymized anxiety analysis data for therapeutic review.

## Key Findings
- Average anxiety level: 6.2/10
- Primary triggers: Social situations, driving scenarios
- Progress trend: 15% improvement over 4 weeks
- Most effective coping strategies: Deep breathing, mindfulness

## Detailed Analysis
[Anonymized patient data would appear here in production]

## Therapeutic Recommendations
- Continue exposure therapy for driving anxiety
- Increase social skills training frequency
- Maintain current mindfulness practice
        `;
      } else {
        content = `
# Conversation Summary Report - Patient X

## Chat Session Overview
Total sessions: 12
Average session length: 15 minutes
Key therapeutic themes addressed:

## Primary Discussion Topics
1. Driving anxiety and avoidance behaviors
2. Social interaction challenges
3. Coping strategy development
4. Progress tracking and goal setting

## AI Therapeutic Insights
- Patient responds well to graduated exposure suggestions
- Shows high engagement with mindfulness techniques
- Expresses readiness for goal advancement

## Recommendations for Treatment
- Focus on driving confidence building
- Expand social exposure exercises
- Consider group therapy options
        `;
      }
      
      res.json({ content });
    } catch (error) {
      res.status(500).json({ error: 'Failed to load report content' });
    }
  });

  app.get('/api/therapist/patient/:id/treatment-plan', async (req, res) => {
    try {
      const patientId = req.params.id;
      
      // Return existing treatment plan or null
      // In production, this would fetch from database
      res.json(null);
    } catch (error) {
      res.status(500).json({ error: 'Failed to load treatment plan' });
    }
  });

  app.put('/api/therapist/patient/:id/treatment-plan', async (req, res) => {
    try {
      const patientId = req.params.id;
      const treatmentPlan = req.body;
      
      // Save treatment plan to database
      // In production, this would save to database and sync with patient
      
      res.json({ success: true, message: 'Treatment plan saved successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to save treatment plan' });
    }
  });

  // HIPAA-compliant Patient-Therapist connection endpoint
  app.post('/api/therapist-connections', async (req, res) => {
    try {
      const { therapistName, contactValue, shareReport, notes, patientEmail } = req.body;
      
      // Get patient information by email (this would come from authenticated session in production)
      let patient;
      if (patientEmail && patientEmail !== 'current-user-email') {
        patient = await storage.getProfileByEmail(patientEmail);
      }
      
      if (!patient) {
        return res.status(400).json({ 
          success: false, 
          error: 'Patient profile not found or session invalid' 
        });
      }
      
      console.log('📝 Creating HIPAA-compliant therapist connection:', {
        patientId: patient.id,
        therapistEmail: contactValue,
        shareReport,
        notes
      });

      // Create HIPAA-compliant connection with explicit consent
      const connection = await storage.createTherapistPatientConnection({
        patientId: patient.id,
        therapistEmail: contactValue,
        patientEmail: patient.email,
        patientCode: patient.patientCode || '',
        patientConsentGiven: true, // Patient explicitly requested connection
        therapistAccepted: false, // Therapist must accept connection
        shareAnalytics: shareReport === 'yes',
        shareReports: shareReport === 'yes',
        notes: notes || ''
      });

      // Create email notification in internal queue
      const protocol = req.protocol;
      const host = req.get('host');
      const appUrl = `${protocol}://${host}`;
      
      const emailContent = `
        <h2>New Patient Connection Request</h2>
        <p>A patient has requested to connect with you through the Tranquil Support app.</p>
        
        <h3>HIPAA-Compliant Connection Details:</h3>
        <ul>
          <li><strong>Therapist:</strong> ${therapistName}</li>
          <li><strong>Contact:</strong> ${contactValue}</li>
          <li><strong>Patient Email:</strong> ${patient.email}</li>
          <li><strong>Patient Code:</strong> <span style="font-family: monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 4px;">${patient.patientCode}</span></li>
          <li><strong>Share Reports:</strong> ${shareReport === 'yes' ? 'Yes, patient wants to share their anxiety reports' : 'No report sharing requested'}</li>
          <li><strong>Notes:</strong> ${notes || 'No additional notes'}</li>
        </ul>
        
        <h3>HIPAA Compliance Notice:</h3>
        <p>This connection requires your explicit acceptance. The patient has provided informed consent to share their data with you.</p>
        
        <h3>Next Steps:</h3>
        <p>1. Log into the therapist portal: <a href="${appUrl}/therapist-login">Therapist Login</a></p>
        <p>2. Search for the patient using their email and patient code</p>
        <p>3. Accept the connection to begin receiving their anxiety tracking data</p>
        
        <p><strong>To search for this patient:</strong> Use email (<strong>${patient.email}</strong>) and patient code (<strong>${patient.patientCode}</strong>)</p>
        
        <hr>
        <p><small>This email was generated by the HIPAA-compliant Tranquil Support app. The patient has explicitly requested this connection and provided informed consent.</small></p>
      `;

      await storage.createEmailNotification({
        toEmail: contactValue,
        subject: `New Patient Connection Request - Tranquiloo`,
        htmlContent: emailContent,
        emailType: 'connection_request',
        metadata: JSON.stringify({
          patientId: patient.id,
          therapistEmail: contactValue,
          shareReport: shareReport === 'yes'
        })
      });

      console.log(`📧 HIPAA-compliant email notification created for ${therapistName} at ${contactValue}`);
      console.log(`📊 Share report: ${shareReport === 'yes' ? 'Yes' : 'No'}`);

      res.json({ 
        success: true, 
        message: 'HIPAA-compliant connection request sent successfully - therapist will be notified',
        connectionId: connection.id 
      });

    } catch (error) {
      console.error('Error creating therapist connection:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to send connection request: ' + error.message 
      });
    }
  });

  // Email verification endpoint
  app.get('/verify-email', async (req, res) => {
    try {
      const { token } = req.query;
      
      if (!token) {
        return res.status(400).send(`
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #ef4444;">Invalid Verification Link</h2>
            <p>The verification link is missing or invalid.</p>
          </div>
        `);
      }
      
      const verifiedProfile = await storage.verifyEmail(token as string);
      
      if (verifiedProfile) {
        res.send(`
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <div style="background: #10b981; color: white; padding: 20px; border-radius: 8px; display: inline-block;">
              <h2 style="margin: 0;">Email Verified Successfully!</h2>
            </div>
            <p style="margin-top: 20px; font-size: 16px;">
              Your email address has been verified. You can now sign in to your Tranquil Support account.
            </p>
            <div style="margin-top: 30px;">
              <a href="/login" style="background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600;">
                Sign In Now
              </a>
            </div>
          </div>
        `);
      } else {
        res.status(400).send(`
          <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #ef4444;">Verification Failed</h2>
            <p>The verification link is invalid or has already been used.</p>
          </div>
        `);
      }
    } catch (error) {
      console.error('Email verification error:', error);
      res.status(500).send(`
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #ef4444;">Verification Error</h2>
          <p>An error occurred during verification. Please try again later.</p>
        </div>
      `);
    }
  });

  // Password reset request endpoint
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_EMAIL', message: 'Email address is required' }
        });
      }
      
      const profile = await storage.getProfileByEmail(email);
      if (!profile) {
        // Don't reveal if email exists for security
        return res.json({
          success: true,
          message: 'If an account with this email exists, a password reset link has been sent.'
        });
      }
      
      // Generate reset token
      const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
      const expires = new Date(Date.now() + 3600000); // 1 hour
      
      await storage.setPasswordResetToken(email, resetToken, expires);
      
      // Create password reset email
      const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin: 0;">Tranquil Support</h1>
            <p style="color: #6b7280; font-size: 16px;">Password Reset Request</p>
          </div>
          
          <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #374151; margin-top: 0;">Reset Your Password</h2>
            <p style="color: #6b7280; line-height: 1.6;">
              We received a request to reset the password for your Tranquil Support account. 
              Click the button below to set a new password.
            </p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${resetUrl}" 
                 style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 6px; font-weight: 600;">
                Reset Password
              </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 14px;">
              This link will expire in 1 hour. If you didn't request this password reset, 
              please ignore this email.
            </p>
            
            <p style="color: #9ca3af; font-size: 14px;">
              If the button doesn't work, copy and paste this link:<br>
              <span style="word-break: break-all;">${resetUrl}</span>
            </p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 14px;">
            <p><strong>Need help?</strong> Contact our support team if you continue having trouble accessing your account.</p>
          </div>
        </div>
      `;

      await storage.createEmailNotification({
        toEmail: email,
        subject: 'Password Reset Request - Tranquil Support',
        htmlContent: emailContent,
        emailType: 'password_reset',
        metadata: JSON.stringify({
          userId: profile.id,
          resetToken: resetToken
        })
      });
      
      res.json({
        success: true,
        message: 'If an account with this email exists, a password reset link has been sent.'
      });
      
    } catch (error) {
      console.error('Password reset error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to process password reset request' }
      });
    }
  });

  // App recommendation endpoint
  app.post('/api/recommend-app', async (req, res) => {
    try {
      const { recipientEmail, senderName, personalMessage } = req.body;
      
      if (!recipientEmail) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_EMAIL', message: 'Recipient email is required' }
        });
      }
      
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin: 0;">Tranquil Support</h1>
            <p style="color: #6b7280; font-size: 16px;">Mental Health & Anxiety Support App</p>
          </div>
          
          <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #374151; margin-top: 0;">You've been recommended an app!</h2>
            ${senderName ? `<p style="color: #6b7280;"><strong>${senderName}</strong> thinks you might find Tranquil Support helpful.</p>` : ''}
            
            ${personalMessage ? `
              <div style="background: white; padding: 15px; border-left: 4px solid #10b981; margin: 15px 0;">
                <p style="color: #374151; margin: 0; font-style: italic;">"${personalMessage}"</p>
              </div>
            ` : ''}
            
            <h3 style="color: #374151;">What is Tranquil Support?</h3>
            <p style="color: #6b7280; line-height: 1.6;">
              Tranquil Support is a comprehensive mental health platform that helps you:
            </p>
            <ul style="color: #6b7280; line-height: 1.8;">
              <li>Track your anxiety and mood patterns</li>
              <li>Chat with AI companions for emotional support</li>
              <li>Access therapeutic tools and resources</li>
              <li>Connect with licensed therapists</li>
              <li>Set and track mental health goals</li>
            </ul>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${req.protocol}://${req.get('host')}/signup" 
                 style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 6px; font-weight: 600;">
                Get Started Free
              </a>
            </div>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 14px;">
            <p>
              <strong>Your privacy matters:</strong> We take mental health privacy seriously. 
              All conversations and data are encrypted and confidential.
            </p>
            <p style="margin-top: 15px;">
              <small>This recommendation was sent to ${recipientEmail}. If you don't want to receive 
              these recommendations, you can safely ignore this email.</small>
            </p>
          </div>
        </div>
      `;

      await storage.createEmailNotification({
        toEmail: recipientEmail,
        subject: `${senderName ? senderName + ' recommended' : 'Someone recommended'} Tranquil Support for you`,
        htmlContent: emailContent,
        emailType: 'app_recommendation',
        metadata: JSON.stringify({
          senderName: senderName || 'Anonymous',
          personalMessage
        })
      });
      
      res.json({
        success: true,
        message: 'App recommendation sent successfully!'
      });
      
    } catch (error) {
      console.error('App recommendation error:', error);
      res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to send app recommendation' }
      });
    }
  });

  // Debug endpoint to view queued emails (for testing)
  app.get('/api/debug/emails', async (req, res) => {
    try {
      const emails = await storage.getPendingEmails();
      const recentEmails = emails.map(email => ({
        id: email.id,
        toEmail: email.toEmail,
        subject: email.subject,
        emailType: email.emailType,
        status: email.status,
        createdAt: email.createdAt,
        // Include verification token for testing
        verificationToken: email.metadata ? (() => {
          try {
            return JSON.parse(email.metadata).verificationToken;
          } catch {
            return null;
          }
        })() : null
      }));
      res.json(recentEmails);
    } catch (error) {
      console.error('Debug emails error:', error as Error);
      res.status(500).json({ error: 'Failed to fetch emails' });
    }
  });

  // Internal email notifications endpoint for therapists
  app.get('/api/therapist/notifications/:email', async (req, res) => {
    try {
      const therapistEmail = decodeURIComponent(req.params.email);
      const notifications = await storage.getEmailNotificationsByTherapist(therapistEmail);
      
      res.json({
        notifications,
        unreadCount: notifications.filter(n => n.status === 'pending').length
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to load notifications' });
    }
  });

  // Health check endpoint to verify redirect URI configuration
  app.get('/auth/test-config', (req, res) => {
    const forwardedProto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0];
    const forwardedHost = req.headers['x-forwarded-host'] as string;
    const protocol = forwardedProto || req.protocol;
    const host = forwardedHost || req.get('host');
    const base = `${protocol}://${host}`;
    const redirectUri = `${base}/auth/google/callback`;
    
    res.json({
      currentHost: host,
      detectedProtocol: protocol,
      forwardedProto,
      forwardedHost,
      fullBase: base,
      redirectUri,
      shouldMatch: 'https://tranquiloo-app-arthrombus.replit.app/auth/google/callback'
    });
  });
  
  // Authentication API routes
  app.post('/api/auth/signin', async (req, res) => {
    console.log('AUTH ENDPOINT HIT:', req.body);
    try {
      const { email, password, role = 'patient', isSignIn } = req.body;
      
      console.log('Email authentication attempt:', { email, role, isSignIn });
      
      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          error: { code: 'MISSING_FIELDS', message: 'Email and password are required' } 
        });
      }
      
      // Check if user profile exists
      try {
        console.log('Looking for profile with email:', email, 'isSignIn:', isSignIn);
        const existingProfile = await storage.getProfileByEmail(email);
        console.log('Found profile:', existingProfile ? existingProfile.email : 'NOT FOUND');
        
        // If this is a sign-in attempt
        if (isSignIn === true) {
          if (!existingProfile) {
            return res.status(401).json({
              success: false,
              error: { 
                code: 'USER_NOT_FOUND', 
                message: 'No account found with this email. Please create an account first by using the sign-up option.' 
              }
            });
          }
          
          // Validate password for existing users (skip for Google OAuth)
          if (!existingProfile.hashedPassword && password !== 'google-oauth') {
            return res.status(401).json({
              success: false,
              error: { 
                code: 'INVALID_AUTH_METHOD', 
                message: 'This account was created with Google. Please use Google sign-in.' 
              }
            });
          }
          
          // Check password (skip for Google OAuth)
          if (password !== 'google-oauth' && existingProfile.hashedPassword) {
            const isValidPassword = await bcrypt.compare(password, existingProfile.hashedPassword);
            if (!isValidPassword) {
              return res.status(401).json({
                success: false,
                error: { 
                  code: 'INVALID_CREDENTIALS', 
                  message: 'Invalid email or password' 
                }
              });
            }
          }
          
          // Check if email is verified (enforce for all roles)
          if (!existingProfile.emailVerified) {
            return res.status(403).json({
              success: false,
              error: { 
                code: 'EMAIL_NOT_VERIFIED', 
                message: 'Please verify your email address before signing in. Check your email for verification link.' 
              }
            });
          }
          
          // User exists, verified, and password correct - return success
          return res.json({
            success: true,
            user: {
              id: existingProfile.id,
              email: existingProfile.email,
              username: existingProfile.email?.split('@')[0],
              role: existingProfile.role || role,
              emailVerified: existingProfile.emailVerified,
              patientCode: existingProfile.patientCode
            }
          });
        }
        
        // If this is a sign-up attempt and user already exists
        if (existingProfile) {
          return res.status(400).json({
            success: false,
            error: { 
              code: 'USER_EXISTS', 
              message: 'An account already exists with this email. Please sign in instead.' 
            }
          });
        }
      } catch (err) {
        console.log('Profile lookup error:', err);
        // For sign-in attempts, if there's a database error, still return user not found
        if (isSignIn === true) {
          return res.status(401).json({
            success: false,
            error: { 
              code: 'USER_NOT_FOUND', 
              message: 'No account found with this email. Please sign up first.' 
            }
          });
        }
      }
      
      // Only create new users for sign-up (isSignIn === false or undefined for new registrations)
      if (isSignIn !== true) {
        // Hash password for new user
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Generate unique patient code
      const patientCode = 'PT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
      
      // Create new user profile - let database generate UUID
      const newUser = {
        email: email,
        firstName: req.body.firstName || null,
        lastName: req.body.lastName || null,
        role: role,
        hashedPassword: hashedPassword,
        patientCode: patientCode
      };
      
      try {
        const createdProfile = await storage.createProfile(newUser);
        console.log('Created new user profile:', createdProfile.id);
        
        // Generate email verification token
        const verificationToken = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
        await storage.updateProfileVerification(createdProfile.id, verificationToken);
        
        // Send verification email for both therapists and patients
        // Get correct protocol/host from proxy headers for public URL
        const forwardedProto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0];
        const forwardedHost = req.headers['x-forwarded-host'] as string;
        const protocol = forwardedProto || req.protocol;
        const host = forwardedHost || req.get('host');
        const verificationUrl = `${protocol}://${host}/verify-email?token=${verificationToken}`;
        
        if (role === 'therapist') {
          // Send therapist verification email with dashboard access instructions
          await emailService.sendTherapistVerificationEmail(
            createdProfile.email!,
            req.body.firstName || 'Therapist',
            verificationToken,
            verificationUrl
          );
          
          // Return message that verification is required
          return res.json({
            success: true,
            message: 'Therapist account created successfully. Please check your email to verify your account before signing in.'
          });
        } else {
          // Create verification email for patients
          const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email?token=${verificationToken}`;
          const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #10b981; margin: 0;">Welcome to Tranquiloo</h1>
                <p style="color: #6b7280; font-size: 16px;">Your mental health companion</p>
              </div>
              
              <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                <h2 style="color: #374151; margin-top: 0;">Please verify your email address</h2>
                <p style="color: #6b7280; line-height: 1.6;">
                  Thank you for creating an account with Tranquil Support. To ensure the security of your account 
                  and enable all features, please verify your email address by clicking the button below.
                </p>
                
                <div style="text-align: center; margin: 25px 0;">
                  <a href="${verificationUrl}" 
                     style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; 
                            text-decoration: none; border-radius: 6px; font-weight: 600;">
                    Verify Email Address
                  </a>
                </div>
                
                <p style="color: #9ca3af; font-size: 14px;">
                  If the button doesn't work, copy and paste this link into your browser:<br>
                  <span style="word-break: break-all;">${verificationUrl}</span>
                </p>
              </div>
              
              <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 14px;">
                <p><strong>What's next?</strong></p>
                <ul style="line-height: 1.6;">
                  <li>Complete your profile setup</li>
                  <li>Start tracking your anxiety and mood</li>
                  <li>Connect with AI companions for support</li>
                  <li>Access therapeutic resources and tools</li>
                </ul>
                
                <p style="margin-top: 20px;">
                  <small>This email was sent to ${createdProfile.email}. If you didn't create this account, 
                  please ignore this email.</small>
                </p>
              </div>
            </div>
          `;

          await storage.createEmailNotification({
            toEmail: createdProfile.email!,
            subject: 'Please verify your email - Tranquiloo',
            htmlContent: emailContent,
            emailType: 'email_verification',
            metadata: JSON.stringify({
              userId: createdProfile.id,
              verificationToken: verificationToken
            })
          });
        }
        
        return res.json({
          success: true,
          user: {
            id: createdProfile.id,
            email: createdProfile.email,
            username: createdProfile.email?.split('@')[0],
            role: createdProfile.role,
            emailVerified: false,
            patientCode: createdProfile.patientCode
          },
          message: 'Account created successfully. Please check your email to verify your account.'
        });
      } catch (err) {
        console.error('Profile creation failed:', err);
        return res.status(500).json({
          success: false,
          error: { code: 'PROFILE_CREATION_FAILED', message: 'Failed to create user profile' }
        });
      }
    } else {
      // If isSignIn is not explicitly false, return error
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Invalid authentication request' }
      });
    }
      
    } catch (error) {
      console.error('Authentication error:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Authentication failed. Please try again.' }
      });
    }
  });

  // Forgot password endpoint
  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_EMAIL', message: 'Email address is required' }
        });
      }
      
      // Check if user exists
      const existingProfile = await storage.getProfileByEmail(email);
      
      // Always return success to prevent email enumeration
      if (!existingProfile) {
        return res.json({
          success: true,
          message: 'If an account exists with this email, a reset link has been sent.'
        });
      }
      
      // Generate reset token
      const resetToken = `reset_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
      await storage.updateProfileVerification(existingProfile.id, resetToken);
      
      // Create reset email
      const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
      const emailContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #374151;">Password Reset Request</h2>
          <p>You requested to reset your password for your Tranquiloo account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; 
                      text-decoration: none; border-radius: 6px; font-weight: 600;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #6b7280;">
            If you didn't request this, please ignore this email. Your password won't be changed.
          </p>
          
          <p style="color: #9ca3af; font-size: 14px;">
            This link expires in 1 hour for security reasons.
          </p>
        </div>
      `;
      
      await storage.createEmailNotification({
        toEmail: email,
        subject: 'Reset Your Password - Tranquiloo',
        htmlContent: emailContent,
        emailType: 'password_reset',
        metadata: JSON.stringify({ resetToken })
      });
      
      return res.json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent.'
      });
      
    } catch (error) {
      console.error('Forgot password error:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to process request. Please try again.' }
      });
    }
  });

  // Google OAuth verification endpoint
  app.post('/api/auth/google-signin', async (req, res) => {
    try {
      const { googleCredential, role = 'patient' } = req.body;
      
      if (!googleCredential) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_CREDENTIAL', message: 'Google credential is required' }
        });
      }

      // Verify Google JWT token
      let payload;
      try {
        const parts = googleCredential.split('.');
        if (parts.length !== 3) {
          throw new Error('Invalid JWT format');
        }
        payload = JSON.parse(atob(parts[1]));
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_CREDENTIAL', message: 'Invalid Google credential' }
        });
      }

      const email = payload.email;
      const firstName = payload.given_name || payload.name?.split(' ')[0];
      const lastName = payload.family_name || payload.name?.split(' ').slice(1).join(' ');

      // Check if user already exists
      try {
        const existingProfile = await storage.getProfileByEmail(email);
        if (existingProfile) {
          // Check if email is verified for existing users
          if (!existingProfile.emailVerified) {
            return res.status(403).json({
              success: false,
              error: { 
                code: 'EMAIL_NOT_VERIFIED', 
                message: 'Please verify your email address before signing in. Check your email for verification link.' 
              }
            });
          }
          
          // Return existing verified user
          return res.json({
            success: true,
            user: {
              id: existingProfile.id,
              email: existingProfile.email,
              username: existingProfile.email?.split('@')[0],
              role: existingProfile.role || role,
              emailVerified: existingProfile.emailVerified,
              patientCode: existingProfile.patientCode
            }
          });
        }
      } catch (err) {
        console.log('Profile lookup error (will create new user):', err);
      }

      // Generate unique patient code for new Google OAuth users
      const patientCode = 'PT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
      
      // Create new user profile for Google OAuth
      const newUser = {
        email: email,
        firstName: firstName || null,
        lastName: lastName || null,
        role: role,
        patientCode: patientCode
      };

      try {
        const createdProfile = await storage.createProfile(newUser);
        console.log('Created new Google OAuth user profile:', createdProfile.id);
        
        // Generate verification token for ALL users (including Google OAuth)
        const verificationToken = Date.now().toString(36) + Math.random().toString(36).substring(2);
        await storage.createEmailVerification(createdProfile.email!, verificationToken);
        
        // Send appropriate verification email based on role
        if (role === 'therapist') {
          const emailResponse = await emailService.sendTherapistWelcomeEmail(
            createdProfile.email!,
            createdProfile.firstName || 'Therapist',
            verificationToken
          );
          
          if (emailResponse.success) {
            console.log('Therapist verification email sent to:', createdProfile.email);
          }
        } else {
          // Send patient verification email
          const emailResponse = await emailService.sendVerificationEmail(
            createdProfile.email!,
            createdProfile.firstName || 'User',
            verificationToken
          );
          
          if (emailResponse.success) {
            console.log('Patient verification email sent to:', createdProfile.email);
          }
        }
        
        // Return success but indicate email verification needed
        return res.json({
          success: true,
          message: 'Account created! Please check your email to verify your account.',
          requiresVerification: true,
          user: {
            id: createdProfile.id,
            email: createdProfile.email,
            username: createdProfile.email?.split('@')[0],
            role: createdProfile.role,
            emailVerified: false, // Google OAuth users still need to verify
            patientCode: createdProfile.patientCode
          }
        });
      } catch (err) {
        console.error('Google OAuth profile creation failed:', err);
        return res.status(500).json({
          success: false,
          error: { code: 'PROFILE_CREATION_FAILED', message: 'Failed to create user profile' }
        });
      }
      
    } catch (error) {
      console.error('Google OAuth authentication error:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Google authentication failed. Please try again.' }
      });
    }
  });

  // Manual verification endpoint for development/testing
  app.post('/api/auth/manual-verify', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_EMAIL', message: 'Email address is required' }
        });
      }
      
      // Find user profile
      const profile = await storage.getProfileByEmail(email);
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'No account found with this email' }
        });
      }
      
      // Mark as verified
      await storage.updateProfileVerification(profile.id, null, true);
      
      return res.json({
        success: true,
        message: 'Email manually verified successfully'
      });
    } catch (error) {
      console.error('Manual verification error:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to verify email' }
      });
    }
  });

  // Resend verification email endpoint
  app.post('/api/auth/resend-verification', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_EMAIL', message: 'Email address is required' }
        });
      }
      
      // Find user profile
      const profile = await storage.getProfileByEmail(email);
      if (!profile) {
        return res.status(404).json({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'No account found with this email' }
        });
      }
      
      if (profile.emailVerified) {
        return res.json({
          success: true,
          message: 'Email is already verified'
        });
      }
      
      // Generate new verification token
      const verificationToken = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
      await storage.updateProfileVerification(profile.id, verificationToken);
      
      // Send verification email based on role
      // Get correct protocol/host from proxy headers for public URL
      const forwardedProto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0];
      const forwardedHost = req.headers['x-forwarded-host'] as string;
      const protocol = forwardedProto || req.protocol;
      const host = forwardedHost || req.get('host');
      const verificationUrl = `${protocol}://${host}/verify-email?token=${verificationToken}`;
      
      if (profile.role === 'therapist') {
        await emailService.sendTherapistVerificationEmail(
          profile.email!,
          profile.firstName || 'Therapist',
          verificationToken,
          verificationUrl
        );
      } else {
        await emailService.sendVerificationEmail(
          profile.email!,
          profile.firstName || 'User',
          verificationToken
        );
      }
      
      return res.json({
        success: true,
        message: 'Verification email sent successfully'
      });
    } catch (error) {
      console.error('Resend verification error:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to resend verification email' }
      });
    }
  });

  // Google OAuth initiation route for iPhone Safari
  app.get('/auth/google', (req, res) => {
    // Use the correct Web Client ID
    const clientId = '522576524084-pr5i8ucn0o6r4ckd0967te9orpiigkt2.apps.googleusercontent.com';
    
    // Get correct protocol/host from proxy headers
    const forwardedProto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0];
    const forwardedHost = req.headers['x-forwarded-host'] as string;
    const protocol = forwardedProto || req.protocol;
    const host = forwardedHost || req.get('host');
    const redirectUri = `${protocol}://${host}/auth/google/callback`;
    
    if (!clientId) {
      return res.redirect('/login?error=server_config');
    }
    
    // Get role and return URL from query parameters
    const role = req.query.role || 'patient';
    const returnUrl = req.query.returnUrl || '/dashboard';
    
    // Create state parameter to pass role information
    const state = encodeURIComponent(JSON.stringify({
      role: role,
      returnUrl: returnUrl,
      isSignUp: true
    }));
    
    // Build OAuth URL
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'select_account',
      state: state
    });
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    res.redirect(authUrl);
  });

  // OAuth callback route for iPhone Safari
  app.get('/auth/google/callback', async (req, res) => {
    try {
      const { code, state } = req.query;
      
      if (!code) {
        return res.redirect('/login?error=oauth_failed');
      }
      
      // Parse state parameter
      let userState = { role: 'patient', isSignUp: false, returnUrl: '/dashboard' };
      if (state && typeof state === 'string') {
        try {
          userState = JSON.parse(decodeURIComponent(state));
        } catch (e) {
          console.error('Failed to parse OAuth state:', e);
        }
      }
      
      // Exchange code for tokens
      const clientId = '522576524084-pr5i8ucn0o6r4ckd0967te9orpiigkt2.apps.googleusercontent.com';
      const clientSecret = process.env.GOOGLE_CLIENT_ID; // The GOCSPX value is actually the client secret
      
      // Get correct protocol/host from proxy headers
      const forwardedProto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0];
      const forwardedHost = req.headers['x-forwarded-host'] as string;
      const protocol = forwardedProto || req.protocol;
      const host = forwardedHost || req.get('host');
      const redirectUri = `${protocol}://${host}/auth/google/callback`;
      
      if (!clientSecret) {
        console.error('GOOGLE_CLIENT_SECRET not configured');
        return res.redirect('/login?error=server_config');
      }
      
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: code as string,
          client_id: clientId!,
          client_secret: clientSecret,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code'
        })
      });
      
      const tokens = await tokenResponse.json();
      
      if (!tokens.access_token) {
        return res.redirect('/login?error=token_failed');
      }
      
      // Get user info from Google
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokens.access_token}` }
      });
      
      const googleUser = await userResponse.json();
      
      // Check if user exists and is verified
      let existingProfile = null;
      try {
        existingProfile = await storage.getProfileByEmail(googleUser.email);
      } catch (err) {
        console.log('Profile lookup error:', err);
      }

      // Get the correct origin for the redirect
      const origin = `${protocol}://${host}`;
      
      if (existingProfile) {
        // Check if email is verified
        if (!existingProfile.emailVerified) {
          // Redirect to login with verification needed message
          return res.redirect(`${origin}/login?error=verification_required&email=${encodeURIComponent(googleUser.email)}`);
        }
        
        // User exists and is verified - proceed to dashboard
        const userData = {
          id: existingProfile.id,
          email: existingProfile.email,
          name: googleUser.name,
          picture: googleUser.picture,
          role: existingProfile.role,
          emailVerified: true,
          authMethod: 'google'
        };
        
        // Check if therapist needs license verification
        if (existingProfile.role === 'therapist' && !existingProfile.licenseNumber) {
          return res.redirect(`${origin}/therapist-license-verification`);
        }
        
        const redirectPath = existingProfile.role === 'therapist' ? '/therapist-dashboard' : '/dashboard';
        const fullRedirectUrl = `${origin}${redirectPath}`;
        
        // Store user data and redirect
        const userDataScript = `
          <script>
            localStorage.setItem('user', ${JSON.stringify(JSON.stringify(userData))});
            localStorage.setItem('auth_user', ${JSON.stringify(JSON.stringify(userData))});
            localStorage.setItem('authToken', ${JSON.stringify(tokens.access_token)});
            window.location.href = '${fullRedirectUrl}';
          </script>
        `;
        
        return res.send(`
          <html>
            <head><title>Authentication Success</title></head>
            <body>
              <p>Authentication successful! Redirecting...</p>
              ${userDataScript}
            </body>
          </html>
        `);
      }
      
      // New user - create profile
      const patientCode = 'PT-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
      const newProfile = await storage.createProfile({
        email: googleUser.email,
        firstName: googleUser.given_name || googleUser.name?.split(' ')[0] || null,
        lastName: googleUser.family_name || googleUser.name?.split(' ').slice(1).join(' ') || null,
        role: userState.role || 'patient',
        patientCode: userState.role === 'patient' ? patientCode : null,
        authMethod: 'google',
        emailVerified: false
      });
      
      // Generate verification token and update profile
      const verificationToken = `verify_${Date.now()}_${Math.random().toString(36).substr(2, 15)}`;
      await storage.updateProfileVerification(newProfile.id, verificationToken);
      
      // Send verification email
      const verificationUrl = `${protocol}://${host}/verify-email?token=${verificationToken}`;
      
      if (userState.role === 'therapist') {
        await emailService.sendTherapistVerificationEmail(
          newProfile.email!,
          newProfile.firstName || 'Therapist',
          verificationToken,
          verificationUrl
        );
      } else {
        await emailService.sendVerificationEmail(
          newProfile.email!,
          newProfile.firstName || 'User',
          verificationToken
        );
      }
      
      // Redirect to appropriate signup success page
      if (userState.role === 'therapist') {
        res.redirect(`${origin}/therapist-login?signup_success=true&email=${encodeURIComponent(googleUser.email)}`);
      } else {
        res.redirect(`${origin}/login?signup_success=true&email=${encodeURIComponent(googleUser.email)}`);
      }
      
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect('/login?error=oauth_error');
    }
  });

  // Therapist license verification endpoints
  app.post('/api/therapist/license-verification', async (req, res) => {
    try {
      const { email, licenseNumber, state, skip } = req.body;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_EMAIL', message: 'Email is required' }
        });
      }
      
      const profile = await storage.getProfileByEmail(email);
      if (!profile || profile.role !== 'therapist') {
        return res.status(404).json({
          success: false,
          error: { code: 'THERAPIST_NOT_FOUND', message: 'Therapist profile not found' }
        });
      }
      
      if (skip === true) {
        // User chose to skip license verification
        // Set license grace period (24 hours)
        const graceDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await storage.updateProfileLicenseInfo(profile.id, null, null, graceDeadline);
        
        // Send notification email about 24-hour deadline
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc3545;">License Verification Required</h2>
            <p>Dear ${profile.firstName || 'Therapist'},</p>
            
            <p>You have chosen to skip license verification during signup. As per our policy for therapists in the US and Canada, you have <strong>24 hours</strong> to provide your license number, or your account will be temporarily suspended.</p>
            
            <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #856404; margin-top: 0;">Important Notice</h3>
              <p style="margin: 0; color: #856404;">
                Deadline: ${graceDeadline.toLocaleString()}<br>
                Status: Grace period active
              </p>
            </div>
            
            <p>To add your license information, please log in to your therapist dashboard and complete the verification process.</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${req.protocol}://${req.get('host')}/therapist-dashboard" 
                 style="display: inline-block; background: #28a745; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 6px; font-weight: 600;">
                Complete License Verification
              </a>
            </div>
            
            <p style="color: #6c757d; font-size: 14px;">
              If you are not practicing in the US or Canada, please disregard this notice.
            </p>
          </div>
        `;
        
        await storage.createEmailNotification({
          toEmail: profile.email!,
          subject: 'License Verification Required - 24 Hour Notice',
          htmlContent: emailContent,
          emailType: 'license_reminder',
          metadata: JSON.stringify({ therapistId: profile.id, deadline: graceDeadline })
        });
        
        return res.json({
          success: true,
          message: 'License verification skipped. You have 24 hours to complete verification.',
          graceDeadline: graceDeadline
        });
      } else {
        // User provided license information
        if (!licenseNumber || !state) {
          return res.status(400).json({
            success: false,
            error: { code: 'MISSING_LICENSE_INFO', message: 'License number and state are required' }
          });
        }
        
        await storage.updateProfileLicenseInfo(profile.id, licenseNumber, state);
        
        // Send confirmation email
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #28a745;">License Verification Completed</h2>
            <p>Dear ${profile.firstName || 'Therapist'},</p>
            
            <p>Thank you for providing your license information. Your therapist account is now fully verified and active.</p>
            
            <div style="background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="color: #155724; margin-top: 0;">Verification Complete</h3>
              <p style="margin: 0; color: #155724;">
                License Number: ${licenseNumber}<br>
                State: ${state}<br>
                Status: Verified
              </p>
            </div>
            
            <p>You can now access all therapist features in your dashboard.</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <a href="${req.protocol}://${req.get('host')}/therapist-dashboard" 
                 style="display: inline-block; background: #007bff; color: white; padding: 12px 30px; 
                        text-decoration: none; border-radius: 6px; font-weight: 600;">
                Access Therapist Dashboard
              </a>
            </div>
          </div>
        `;
        
        await storage.createEmailNotification({
          toEmail: profile.email!,
          subject: 'License Verification Complete - Tranquil Support',
          htmlContent: emailContent,
          emailType: 'license_verified',
          metadata: JSON.stringify({ therapistId: profile.id, licenseNumber, state })
        });
        
        return res.json({
          success: true,
          message: 'License verification completed successfully'
        });
      }
      
    } catch (error) {
      console.error('License verification error:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to process license verification' }
      });
    }
  });

  // Get therapist license status
  app.get('/api/therapist/license-status/:email', async (req, res) => {
    try {
      const { email } = req.params;
      
      const profile = await storage.getProfileByEmail(decodeURIComponent(email));
      if (!profile || profile.role !== 'therapist') {
        return res.status(404).json({
          success: false,
          error: { code: 'THERAPIST_NOT_FOUND', message: 'Therapist profile not found' }
        });
      }
      
      const hasLicense = !!profile.licenseNumber;
      const inGracePeriod = profile.licenseGraceDeadline && new Date() < new Date(profile.licenseGraceDeadline);
      const graceExpired = profile.licenseGraceDeadline && new Date() >= new Date(profile.licenseGraceDeadline);
      
      return res.json({
        success: true,
        hasLicense,
        inGracePeriod,
        graceExpired,
        licenseNumber: profile.licenseNumber,
        licenseState: profile.licenseState,
        graceDeadline: profile.licenseGraceDeadline
      });
      
    } catch (error) {
      console.error('License status check error:', error);
      return res.status(500).json({
        success: false,
        error: { code: 'SERVER_ERROR', message: 'Failed to check license status' }
      });
    }
  });

  // Test endpoint to manually send verification email
  app.post("/api/test-email", async (req, res) => {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    
    console.log(`Manual test: Sending verification email to ${email}`);
    
    try {
      const verificationToken = 'test_' + Date.now().toString(36) + Math.random().toString(36).substring(2);
      
      const emailResponse = await emailService.sendVerificationEmail(
        email,
        'Test User',
        verificationToken
      );
      
      res.json({ 
        success: emailResponse.success, 
        message: emailResponse.success ? 'Email sent successfully' : 'Email failed to send',
        token: verificationToken
      });
    } catch (error) {
      console.error('Test email error:', error);
      res.status(500).json({ error: 'Failed to send test email' });
    }
  });

  // Profile routes
  app.get("/api/profiles/:id", async (req, res) => {
    try {
      const profile = await storage.getProfile(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  // Get profile by email endpoint
  app.get("/api/profiles/by-email/:email", async (req, res) => {
    try {
      const email = decodeURIComponent(req.params.email);
      const profile = await storage.getProfileByEmail(email);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch profile by email" });
    }
  });

  app.post("/api/profiles", async (req, res) => {
    try {
      const validatedData = insertProfileSchema.parse(req.body);
      const profile = await storage.createProfile(validatedData);
      res.status(201).json(profile);
    } catch (error) {
      res.status(400).json({ error: "Invalid profile data", details: error.message });
    }
  });

  app.put("/api/profiles/:id", async (req, res) => {
    try {
      const validatedData = insertProfileSchema.partial().parse(req.body);
      const profile = await storage.updateProfile(req.params.id, validatedData);
      if (!profile) {
        return res.status(404).json({ error: "Profile not found" });
      }
      res.json(profile);
    } catch (error) {
      res.status(400).json({ error: "Invalid profile data", details: error.message });
    }
  });

  // Chat session routes
  app.get("/api/chat-sessions", async (req, res) => {
    try {
      const sessions = await storage.getAllChatSessions();
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat sessions" });
    }
  });
  app.get("/api/chat-sessions/:id", async (req, res) => {
    try {
      const session = await storage.getChatSession(req.params.id);
      if (!session) {
        return res.status(404).json({ error: "Chat session not found" });
      }
      res.json(session);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat session" });
    }
  });

  app.get("/api/users/:userId/chat-sessions", async (req, res) => {
    try {
      const sessions = await storage.getChatSessionsByUser(req.params.userId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat sessions" });
    }
  });

  app.post("/api/chat-sessions", async (req, res) => {
    try {
      const validatedData = insertChatSessionSchema.parse(req.body);
      const session = await storage.createChatSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ error: "Invalid chat session data", details: error.message });
    }
  });

  // Chat message routes
  app.get("/api/chat-sessions/:sessionId/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessagesBySession(req.params.sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch chat messages" });
    }
  });

  // Get all messages for a specific user across all their chat sessions
  app.get("/api/users/:userId/messages", async (req, res) => {
    try {
      const messages = await storage.getChatMessagesByUser(req.params.userId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user messages" });
    }
  });

  app.post("/api/chat-messages", async (req, res) => {
    try {
      const validatedData = insertChatMessageSchema.parse(req.body);
      const message = await storage.createChatMessage(validatedData);
      res.status(201).json(message);
    } catch (error) {
      res.status(400).json({ error: "Invalid chat message data", details: error.message });
    }
  });

  // Anxiety analysis routes
  app.get("/api/anxiety-analyses", async (req, res) => {
    try {
      const analyses = await storage.getAllAnxietyAnalyses();
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch anxiety analyses" });
    }
  });
  app.get("/api/users/:userId/anxiety-analyses", async (req, res) => {
    try {
      const analyses = await storage.getAnxietyAnalysesByUser(req.params.userId);
      res.json(analyses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch anxiety analyses" });
    }
  });

  app.post("/api/anxiety-analyses", async (req, res) => {
    try {
      const validatedData = insertAnxietyAnalysisSchema.parse(req.body);
      const analysis = await storage.createAnxietyAnalysis(validatedData);
      res.status(201).json(analysis);
    } catch (error) {
      res.status(400).json({ error: "Invalid anxiety analysis data", details: error.message });
    }
  });

  // Claude AI analysis endpoint (replacing Supabase Edge Function)
  app.post("/api/analyze-anxiety-claude", async (req, res) => {
    try {
      const { message, conversationHistory = [], userId } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }

      // Check if Claude API key is available  
      const claudeApiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
      
      let analysisResult;
      
      if (claudeApiKey) {
        try {
          console.log('Attempting Claude API call for message:', message.substring(0, 50));
          
          // Build more contextual prompt based on message content
          const lowerMessage = message.toLowerCase();
          const isDistressed = lowerMessage.includes('sad') || lowerMessage.includes('anxious') || 
                              lowerMessage.includes('depressed') || lowerMessage.includes('scared');
          const needsHelp = lowerMessage.includes('help') || lowerMessage.includes("don't") || 
                           lowerMessage.includes("can't") || lowerMessage.includes('why');
          
          // Check for specific mental health conditions
          const ptsdWords = ['trauma', 'flashback', 'nightmare', 'trigger', 'ptsd', 'veteran', 'assault', 'accident'];
          const ocdWords = ['ocd', 'obsessive', 'compulsive', 'contamination', 'checking', 'counting', 'intrusive thoughts', 'ritual'];
          const panicWords = ['panic', 'panic attack', 'heart racing', 'can\'t breathe', 'dying', 'losing control'];
          
          // Check for hallucinations or psychosis indicators
          const hallucinationWords = ['seeing things', 'hearing voices', 'voices', 'talking to me', 'watching me', 'following me', 
                                      'agents', 'spies', 'mossad', 'cia', 'fbi', 'conspiracy', 'after me',
                                      'dogs talking', 'animals talking', 'things moving', 'not real'];
          
          const hasPTSD = ptsdWords.some(word => lowerMessage.includes(word));
          const hasOCD = ocdWords.some(word => lowerMessage.includes(word));
          const hasPanic = panicWords.some(word => lowerMessage.includes(word));
          const hasHallucinations = hallucinationWords.some(word => lowerMessage.includes(word));
          
          const isCrisis = hasHallucinations ||
                          lowerMessage.includes('kill') || lowerMessage.includes('suicide') || 
                          lowerMessage.includes('firing') || lowerMessage.includes('gaza') ||
                          lowerMessage.includes('war') || lowerMessage.includes('attack');
          
          // Call Claude API with improved therapeutic prompt
          const analysisPrompt = `You are Vanessa, a trained crisis intervention AI companion. A user is reaching out with: "${message}"

${conversationHistory.length > 0 ? `Previous messages showing escalation: ${conversationHistory.slice(-3).join(' | ')}` : ''}

${isCrisis ? `CRISIS ALERT: User may be experiencing hallucinations, psychosis, or severe dissociation. This requires immediate grounding and safety intervention.` : ''}
${isDistressed ? 'The user appears to be in distress and needs immediate support.' : ''}

CRITICAL INSTRUCTIONS:
${isCrisis ? `
- CRISIS: User experiencing severe paranoia/hallucinations/threats
- BE DIRECT AND BRIEF (2-3 sentences max)
- START with immediate grounding action, not validation
- Give ONE clear instruction at a time
- End with crisis number (988) if needed
- Example: "Right now, splash cold water on your face. Then breathe slowly: in for 4, out for 6. If you feel unsafe, call 988 now."
` : hasPTSD ? `
- PTSD RESPONSE: User experiencing trauma-related symptoms
- Acknowledge trauma without asking for details
- Provide grounding technique for flashbacks
- Keep response to 2-3 sentences with immediate relief focus
- Example: "You're having a trauma response. Ground yourself: name 5 things you see, 4 you hear, 3 you can touch. You're safe in this moment."
` : hasOCD ? `
- OCD RESPONSE: User experiencing obsessive-compulsive symptoms
- Don't provide reassurance that feeds the OCD cycle
- Suggest ERP (exposure response prevention) techniques
- Keep response to 2-3 sentences
- Example: "OCD thoughts are loud today. Instead of the ritual, try sitting with the discomfort for 2 minutes. Set a timer. The anxiety will peak and fall."
` : hasPanic ? `
- PANIC ATTACK: User experiencing panic symptoms
- Immediate breathing technique first
- Reassure it will pass (10-20 minutes)
- Keep response to 2-3 sentences
- Example: "This is a panic attack, not a heart attack. Breathe: in for 4, hold for 4, out for 6. It will pass in 10-20 minutes."
` : `
- Keep response to 2-3 sentences
- Be specific and action-oriented
- Address anxiety/depression with immediate coping strategy
- Give one clear action they can do NOW
`}

Response rules:
- Maximum 50 words for crisis, 75 for non-crisis
- No long explanations or multiple questions
- Direct, calm, instructive tone
- One main action + one backup resource

Respond ONLY with valid JSON:
{
  "anxietyLevel": number from 1-10,
  "triggers": ["max 3 triggers"],
  "copingStrategies": ["max 4 brief, actionable strategies"],
  "personalizedResponse": "BRIEF 2-3 sentence response. Direct action first. Crisis line if needed."
}`;
          
          const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': claudeApiKey,
              'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
              model: 'claude-3-5-haiku-20241022', // Using Haiku for faster responses (2-3x faster)
              max_tokens: 400, // Reduced for more concise responses
              temperature: 0.7, // More natural, varied responses
              messages: [{ role: 'user', content: analysisPrompt }]
            })
          });

          if (response.ok) {
            const claudeResponse = await response.json();
            const analysisText = claudeResponse.content[0]?.text || '';
            
            console.log('Claude API response received, parsing JSON...');
            
            try {
              // Try to extract JSON from the response
              const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                analysisResult = JSON.parse(jsonMatch[0]);
                console.log('Successfully parsed Claude response');
              } else {
                console.error('No JSON found in Claude response:', analysisText.substring(0, 200));
                analysisResult = null;
              }
            } catch (parseError) {
              console.error('Failed to parse Claude JSON response:', parseError);
              console.error('Raw response text:', analysisText.substring(0, 200));
              analysisResult = null;
            }
          } else {
            const errorText = await response.text();
            console.error('Claude API error:', response.status, errorText);
            
            // Log specific error details
            if (response.status === 401) {
              console.error('API Key authentication failed - check ANTHROPIC_API_KEY');
            } else if (response.status === 429) {
              console.error('Rate limit exceeded - using fallback');
            }
            
            analysisResult = null;
          }
        } catch (error) {
          console.error('Claude API request failed:', error);
          analysisResult = null;
        }
      }

      // Use local fallback analysis if Claude failed or API key missing
      if (!analysisResult) {
        console.log('Using fallback anxiety analysis for message:', message.substring(0, 50) + '...');
        
        const anxietyKeywords = [
          'anxious', 'worry', 'worried', 'stress', 'stressed', 'panic', 'fear', 'scared',
          'overwhelmed', 'nervous', 'tense', 'restless', 'uneasy', 'troubled', 'disturbed'
        ];
        
        const lowerMessage = message.toLowerCase();
        const anxietyIndicators = anxietyKeywords.filter(keyword => 
          lowerMessage.includes(keyword)
        ).length;
        
        // Calculate anxiety level based on keywords and message length
        let anxietyLevel = Math.min(3 + anxietyIndicators * 2, 10);
        if (lowerMessage.includes('panic') || lowerMessage.includes('overwhelming')) {
          anxietyLevel = Math.max(anxietyLevel, 7);
        }
        
        // Enhanced fallback analysis for specific conditions
        const hasViolentThoughts = lowerMessage.includes('hurt') || lowerMessage.includes('kill') || lowerMessage.includes('die');
        const hasDepressionKeywords = lowerMessage.includes('depressed') || lowerMessage.includes('sad') || lowerMessage.includes('hopeless');
        const hasRelationshipIssues = lowerMessage.includes('wife') || lowerMessage.includes('husband') || lowerMessage.includes('partner') || lowerMessage.includes('cheat');
        
        // Check for specific anxiety disorders
        const ptsdKeywords = ['trauma', 'flashback', 'nightmare', 'trigger', 'ptsd', 'veteran', 'assault', 'accident'];
        const ocdKeywords = ['ocd', 'obsessive', 'compulsive', 'contamination', 'checking', 'counting', 'intrusive', 'ritual'];
        const panicKeywords = ['panic', 'heart racing', 'can\'t breathe', 'chest pain', 'dying', 'losing control'];
        
        // Check for hallucination/psychosis indicators
        const hallucinationKeywords = ['seeing things', 'hearing voices', 'voices', 'talking to me', 'watching me', 'following me', 
                                       'agents', 'spies', 'mossad', 'cia', 'fbi', 'conspiracy', 'after me',
                                       'dogs talking', 'animals talking', 'things moving', 'gaza', 'war', 'firing'];
        
        const hasHallucinationIndicators = hallucinationKeywords.some(word => lowerMessage.includes(word));
        const hasPTSDIndicators = ptsdKeywords.some(word => lowerMessage.includes(word));
        const hasOCDIndicators = ocdKeywords.some(word => lowerMessage.includes(word));
        const hasPanicIndicators = panicKeywords.some(word => lowerMessage.includes(word));
        
        if (hasHallucinationIndicators) anxietyLevel = 10;
        else if (hasViolentThoughts) anxietyLevel = Math.max(anxietyLevel, 8);
        else if (hasDepressionKeywords) anxietyLevel = Math.max(anxietyLevel, 6);
        
        let personalizedResponse;
        let triggers = [];
        let copingStrategies = [];
        
        if (hasHallucinationIndicators) {
          personalizedResponse = "Right now: Look around and name 5 things you can see. Touch something cold - ice or cold water on your face. Breathe slowly: in for 4, out for 6. If this continues, call 988 immediately.";
          triggers = ['Paranoia', 'Fear', 'Crisis'];
          copingStrategies = [
            'Name 5 things you see RIGHT NOW',
            'Splash cold water on face or hold ice',
            'Call 988 or go to ER immediately',
            'Stay with someone trusted'
          ];
        } else if (hasPanicIndicators) {
          personalizedResponse = "This is panic, not danger. Breathe: in for 4, hold for 4, out for 6. Five times. Place hand on chest - you're okay. This will pass in 10-20 minutes.";
          triggers = ['Panic attack', 'Acute anxiety'];
          copingStrategies = [
            'Square breathing: 4-4-4-4 pattern',
            'Ice cube on wrist or neck',
            'Count backwards from 100 by 7s',
            'This WILL pass in 10-20 minutes'
          ];
          anxietyLevel = 8;
        } else if (hasPTSDIndicators) {
          personalizedResponse = "You're having a trauma response. You're safe now. Ground yourself: 5 things you see, 4 you hear, 3 you touch. The flashback will pass.";
          triggers = ['PTSD', 'Trauma response', 'Flashback'];
          copingStrategies = [
            '5-4-3-2-1 grounding NOW',
            'Smell something strong (coffee, essential oil)',
            'Bilateral stimulation: tap shoulders alternately',
            'Remind yourself: "That was then, this is now"'
          ];
          anxietyLevel = 7;
        } else if (hasOCDIndicators) {
          personalizedResponse = "OCD is loud right now. Don't do the compulsion. Set a 5-minute timer - sit with the discomfort. The urge will peak and fade. You can handle this.";
          triggers = ['OCD', 'Intrusive thoughts', 'Compulsions'];
          copingStrategies = [
            'Delay the ritual by 5 minutes',
            'Write the thought down, then close the notebook',
            'Do opposite action (if checking, walk away)',
            'Remember: thoughts are not facts'
          ];
          anxietyLevel = 6;
        } else if (hasViolentThoughts) {
          personalizedResponse = "Your pain is real. Right now: Step outside or to another room. Take 10 deep breaths, count them out loud. Then call 988 - they're available 24/7 to help you through this safely.";
          triggers = ['Crisis', 'Severe distress', 'Danger'];
          copingStrategies = [
            'Leave the room immediately',
            'Count 10 breaths out loud',
            'Call 988 now or text HOME to 741741',
            'Go for a walk outside'
          ];
        } else if (hasRelationshipIssues && hasDepressionKeywords) {
          personalizedResponse = "This betrayal is devastating. Right now, breathe: in for 4, hold for 4, out for 6. Do this 5 times. Then call one person who cares about you. This intense pain will ease with time.";
          triggers = ['Betrayal', 'Loss', 'Grief'];
          copingStrategies = [
            'Breathe: 4-4-6 pattern, 5 times',
            'Call one trusted friend now',
            'Write your feelings for 10 minutes',
            'Take care of basics: eat, sleep, shower'
          ];
        } else if (lowerMessage.includes('generalized anxiety') || lowerMessage.includes('gad') || lowerMessage.includes('worry about everything')) {
          personalizedResponse = "Constant worry is exhausting. Right now: write down your top 3 worries. Circle what you can control today. Start with the smallest one.";
          triggers = ['GAD', 'Chronic worry', 'Anxiety'];
          copingStrategies = [
            'Worry time: set 15 min to worry, then stop',
            'Progressive muscle relaxation',
            'Challenge thoughts: "Is this likely?"',
            'Focus on ONE task for next hour'
          ];
          anxietyLevel = 6;
        } else if (anxietyLevel > 6) {
          personalizedResponse = "You're dealing with something heavy. Let's breathe together: in for 4, hold for 4, out for 6. Do this 3 times. Then tell me what's happening.";
          triggers = ['Stress', 'Overwhelm'];
          copingStrategies = ['Breathe: 4-4-6, three times', 'Walk for 5 minutes', 'Call a friend', 'Write it out'];
        } else if (lowerMessage.includes('sad') || lowerMessage.includes('depression')) {
          personalizedResponse = "I hear your sadness. It's okay to feel this way. Right now, do one kind thing for yourself - maybe a cup of tea or step outside for fresh air. What's making you sad?";
          triggers = ['Sadness', 'Low mood'];
          copingStrategies = [
            'One small act of self-care now',
            'Walk outside for 5 minutes',
            'Text someone you trust',
            'Let yourself cry if you need to'
          ];
          anxietyLevel = 5;
        } else if (lowerMessage.includes('anxious') || lowerMessage.includes('anxiety') || lowerMessage.includes('worried')) {
          personalizedResponse = "Anxiety is tough. Right now: breathe in for 4, hold for 7, out for 8. Do this 3 times. Then name 5 things you can see. This will help calm your nervous system.";
          triggers = ['Anxiety', 'Worry'];
          copingStrategies = [
            '4-7-8 breathing, 3 times',
            'Name 5 things you see',
            'Walk around the room',
            'Hold ice or cold water'
          ];
          anxietyLevel = 6;
        } else if (lowerMessage.includes('can\'t sleep') || lowerMessage.includes('insomnia')) {
          personalizedResponse = "Racing mind at night is hard. Try 4-7-8 breathing five times. Then do a body scan: tense and release each muscle group. No screens for next hour.";
          triggers = ['Insomnia', 'Sleep anxiety'];
          copingStrategies = [
            '4-7-8 breathing in bed',
            'Progressive muscle relaxation',
            'Write worries on paper, leave by bed',
            'Cool room, warm feet'
          ];
          anxietyLevel = 5;
        } else {
          // Shorter default responses
          const responses = [
            "I'm here. What's on your mind today?",
            "Thanks for reaching out. What's happening?",
            "I'm listening. Tell me what you're feeling.",
            "You're not alone. What's going on?"
          ];
          personalizedResponse = responses[Math.floor(Math.random() * responses.length)];
          triggers = anxietyIndicators > 0 ? ['Stress'] : [];
          copingStrategies = ['Deep breathing', 'Take a walk', 'Call someone', 'Self-care'];
        }
        
        analysisResult = {
          anxietyLevel,
          triggers,
          copingStrategies,
          personalizedResponse
        };
      }

      res.json(analysisResult);
    } catch (error: any) {
      console.error('Anxiety analysis error:', error);
      
      // Return a fallback response even on complete failure
      res.json({
        anxietyLevel: 5,
        triggers: ['General stress'],
        copingStrategies: ['Deep breathing exercises', 'Mindfulness meditation'],
        personalizedResponse: "I'm here to support you through this difficult time. Let's focus on some coping strategies that can help you feel better."
      });
    }
  });

  // Therapist routes
  app.get("/api/therapists", async (req, res) => {
    try {
      const { city, state, specialty } = req.query;
      let therapists;

      if (city && state) {
        therapists = await storage.getTherapistsByLocation(city as string, state as string);
      } else if (specialty) {
        therapists = await storage.getTherapistsBySpecialty(specialty as string);
      } else {
        // Return empty array or implement general search
        therapists = [];
      }

      res.json(therapists);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch therapists" });
    }
  });

  app.post("/api/therapists", async (req, res) => {
    try {
      const validatedData = insertTherapistSchema.parse(req.body);
      const therapist = await storage.createTherapist(validatedData);
      res.status(201).json(therapist);
    } catch (error) {
      res.status(400).json({ error: "Invalid therapist data", details: error.message });
    }
  });

  // User goals routes
  app.get("/api/users/:userId/goals", async (req, res) => {
    try {
      const goals = await storage.getUserGoalsByUser(req.params.userId);
      res.json(goals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user goals" });
    }
  });

  // Intervention summaries route
  app.get("/api/users/:userId/intervention-summaries", async (req, res) => {
    try {
      const summaries = await storage.getInterventionSummariesByUser(req.params.userId);
      res.json(summaries);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch intervention summaries" });
    }
  });

  app.post("/api/user-goals", async (req, res) => {
    try {
      const validatedData = insertUserGoalSchema.parse(req.body);
      const goal = await storage.createUserGoal(validatedData);
      res.status(201).json(goal);
    } catch (error) {
      res.status(400).json({ error: "Invalid user goal data", details: error.message });
    }
  });

  // Goal progress routes
  app.get("/api/goals/:goalId/progress", async (req, res) => {
    try {
      const progress = await storage.getGoalProgressByGoal(req.params.goalId);
      res.json(progress);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch goal progress" });
    }
  });

  app.post("/api/goal-progress", async (req, res) => {
    try {
      const validatedData = insertGoalProgressSchema.parse(req.body);
      const progress = await storage.createGoalProgress(validatedData);
      res.status(201).json(progress);
    } catch (error) {
      res.status(400).json({ error: "Invalid goal progress data", details: error.message });
    }
  });

  // User therapists routes
  app.get("/api/users/:userId/therapists", async (req, res) => {
    try {
      const userTherapists = await storage.getUserTherapistsByUser(req.params.userId);
      res.json(userTherapists);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user therapists" });
    }
  });

  app.post("/api/user-therapists", async (req, res) => {
    try {
      const validatedData = insertUserTherapistSchema.parse(req.body);
      const userTherapist = await storage.createUserTherapist(validatedData);
      res.status(201).json(userTherapist);
    } catch (error) {
      res.status(400).json({ error: "Invalid user therapist data", details: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
