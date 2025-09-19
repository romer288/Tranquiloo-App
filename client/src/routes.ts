// Centralized route constants to ensure consistency across the app
export const ROUTES = {
  root: "/",
  login: "/login",
  patientLogin: "/patient-login",
  therapistLogin: "/therapist-login",
  register: "/registration",
  verify: "/verify",
  resetPassword: "/reset-password",
  forgotPassword: "/forgot-password",
  dashboard: "/dashboard",
  chat: "/chat",
  chatHistory: "/chat-history",
  findTherapist: "/find-therapist",
  contactTherapist: "/contact-therapist",
  analytics: "/analytics",
  treatmentResources: "/treatment-resources",
  settings: "/settings",
  notifications: "/notifications",
  help: "/help",
  privacy: "/privacy",
  support: "/support",
  termsOfService: "/terms-of-service",
  therapistPortal: "/therapist-portal",
  therapistDashboard: "/therapist-dashboard",
  therapistLicenseVerification: "/therapist-license-verification",
  therapistInfo: "/therapist-info",
  assessment: "/assessment",
  recommendApp: "/recommend-app"
} as const;

export type RoutePath = typeof ROUTES[keyof typeof ROUTES];