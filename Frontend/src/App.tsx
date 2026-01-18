import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Analyze from "./pages/Analyze";
import Balance from "./pages/Balance";
import Track from "./pages/Track";
import Opposing from "./pages/Opposing";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import PlaceholderPage from "./pages/Placeholder";
import NotFound from "./pages/NotFound";
import { Building2, Shield, HelpCircle } from "lucide-react";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

// Public route that redirects authenticated users
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<PublicRoute><Auth /></PublicRoute>} />
    <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
    <Route path="/analyze" element={<ProtectedRoute><Analyze /></ProtectedRoute>} />
    <Route path="/balance" element={<ProtectedRoute><Balance /></ProtectedRoute>} />
    <Route path="/track" element={<ProtectedRoute><Track /></ProtectedRoute>} />
    <Route path="/opposing" element={<ProtectedRoute><Opposing /></ProtectedRoute>} />
    <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
    <Route 
      path="/funding" 
      element={
        <ProtectedRoute>
          <PlaceholderPage 
            title="Funding & Entities" 
            description="Discover who funds media outlets and the organizations behind content."
            icon={Building2}
          />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/profiles" 
      element={
        <ProtectedRoute>
          <PlaceholderPage 
            title="High Profiles" 
            description="Track and analyze high-profile accounts and influencers."
            icon={Shield}
          />
        </ProtectedRoute>
      } 
    />
    <Route 
      path="/help" 
      element={
        <ProtectedRoute>
          <PlaceholderPage 
            title="Help & Support" 
            description="Get help understanding how ClearLens works and how to use it effectively."
            icon={HelpCircle}
          />
        </ProtectedRoute>
      } 
    />
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
