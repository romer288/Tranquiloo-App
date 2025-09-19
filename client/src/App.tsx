
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { AppSidebar } from "@/components/AppSidebar";
import ProtectedRoute from "@/components/ProtectedRoute";
import Registration from "./pages/Registration";
import PatientLogin from "./pages/PatientLogin";
import TherapistLogin from "./pages/TherapistLogin";
import ResetPassword from "./pages/ResetPassword";
import Assessment from "./pages/Assessment";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import ChatHistory from "./pages/ChatHistory";
import Index from "./pages/Index";

import Analytics from "./pages/Analytics";
import FindTherapist from "./pages/FindTherapist";
import TreatmentResources from "./pages/TreatmentResources";
import ContactTherapist from "./pages/ContactTherapist";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Help from "./pages/Help";
import Privacy from "./pages/Privacy";
import Support from "./pages/Support";
import TermsOfService from "./pages/TermsOfService";
import Notifications from "./pages/Notifications";
import TherapistPortal from "./pages/TherapistPortal";
import TherapistDashboard from "./pages/TherapistDashboard";
import TherapistLicenseVerification from "./pages/TherapistLicenseVerification";
import TherapistInfo from "./pages/TherapistInfo";
import Verify from "./pages/Verify";
import ForgotPasswordForm from "./components/auth/ForgotPasswordForm";
import RecommendAppForm from "./components/auth/RecommendAppForm";
import PWAInstallPrompt from "./components/PWAInstallPrompt";
import MobileNavigation from "./components/MobileNavigation";
import MobileHeader from "./components/MobileHeader";

// Create QueryClient outside of component to avoid hooks violations
const queryClient = new QueryClient();



const App = () => {
  // Shared layout component to avoid duplicating sidebar on every route
  const ProtectedAppLayout = ({ children }: { children: React.ReactNode }) => {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <AppSidebar />
          </div>
          
          {/* Mobile Header */}
          <MobileHeader />
          
          {/* Main Content */}
          <main className="flex-1 pt-14 pb-16 md:pt-0 md:pb-0" style={{ zIndex: 1 }}>
            <ProtectedRoute>
              {children}
            </ProtectedRoute>
          </main>
          
          {/* Mobile Bottom Navigation */}
          <MobileNavigation />
        </div>
      </SidebarProvider>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <PWAInstallPrompt />
          <BrowserRouter>
            <Routes>
              {/* Public routes - no sidebar */}
              <Route path="/" element={<PatientLogin />} />
              <Route path="/login" element={<PatientLogin />} />
              <Route path="/index.html" element={<PatientLogin />} />
              <Route path="/patient-login" element={<PatientLogin />} />
              <Route path="/therapist-login" element={<TherapistLogin />} />
              <Route path="/registration" element={<Registration />} />
              <Route path="/old-registration" element={<Registration />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/forgot-password" element={<ForgotPasswordForm />} />
              <Route path="/recommend-app" element={<RecommendAppForm />} />
              <Route path="/support" element={<Support />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/therapist-portal" element={<ProtectedRoute role="therapist"><TherapistPortal /></ProtectedRoute>} />
              <Route path="/therapist-dashboard" element={<ProtectedRoute role="therapist"><TherapistDashboard /></ProtectedRoute>} />
              <Route path="/therapist-license-verification" element={<TherapistLicenseVerification />} />
              <Route path="/therapist-info" element={<TherapistInfo />} />
              
              {/* Assessment route - no sidebar for now */}
              <Route path="/assessment" element={<Assessment />} />
              
              {/* Protected routes - with shared sidebar layout */}
              <Route path="/dashboard" element={<ProtectedAppLayout><Dashboard /></ProtectedAppLayout>} />
              <Route path="/chat" element={<ProtectedAppLayout><Chat /></ProtectedAppLayout>} />
              <Route path="/chat-history" element={<ProtectedAppLayout><ChatHistory /></ProtectedAppLayout>} />
              <Route path="/analytics" element={<ProtectedAppLayout><Analytics /></ProtectedAppLayout>} />
              <Route path="/find-therapist" element={<ProtectedAppLayout><FindTherapist /></ProtectedAppLayout>} />
              <Route path="/treatment-resources" element={<ProtectedAppLayout><TreatmentResources /></ProtectedAppLayout>} />
              <Route path="/contact-therapist" element={<ProtectedAppLayout><ContactTherapist /></ProtectedAppLayout>} />
              <Route path="/settings" element={<ProtectedAppLayout><Settings /></ProtectedAppLayout>} />
              <Route path="/help" element={<ProtectedAppLayout><Help /></ProtectedAppLayout>} />
              <Route path="/notifications" element={<ProtectedAppLayout><Notifications /></ProtectedAppLayout>} />
              
              {/* Catch all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
