import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Analyze from "./pages/Analyze";
import Balance from "./pages/Balance";
import Track from "./pages/Track";
import Opposing from "./pages/Opposing";
import Settings from "./pages/Settings";
import PlaceholderPage from "./pages/Placeholder";
import NotFound from "./pages/NotFound";
import { Building2, Shield, HelpCircle } from "lucide-react";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/balance" element={<Balance />} />
          <Route path="/track" element={<Track />} />
          <Route path="/opposing" element={<Opposing />} />
          <Route path="/settings" element={<Settings />} />
          <Route 
            path="/funding" 
            element={
              <PlaceholderPage 
                title="Funding & Entities" 
                description="Discover who funds media outlets and the organizations behind content."
                icon={Building2}
              />
            } 
          />
          <Route 
            path="/profiles" 
            element={
              <PlaceholderPage 
                title="High Profiles" 
                description="Track and analyze high-profile accounts and influencers."
                icon={Shield}
              />
            } 
          />
          <Route 
            path="/help" 
            element={
              <PlaceholderPage 
                title="Help & Support" 
                description="Get help understanding how ClearLens works and how to use it effectively."
                icon={HelpCircle}
              />
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
