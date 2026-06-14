import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MedicalProfileProvider } from "@/contexts/MedicalProfileContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Symptoms from "./pages/Symptoms";
import AiDoctor from "./pages/AiDoctor";
import AiAnalysis from "./pages/AiAnalysis";
import Medicines from "./pages/Medicines";
import Hospitals from "./pages/Hospitals";
import About from "./pages/About";
import Feedback from "./pages/Feedback";
import Profile from "./pages/Profile";
import Premium from "./pages/Premium";
import Journals from "./pages/Journals";
import NotFound from "./pages/NotFound";
import { ScrollToTop } from "./components/ScrollToTop";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <ThemeProvider>
        <AuthProvider>
          <MedicalProfileProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTop />
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/symptoms" element={<Symptoms />} />
                  <Route path="/ai-doctor" element={<AiDoctor />} />
                  <Route path="/ai-analysis" element={<AiAnalysis />} />
                  <Route path="/medicines" element={<Medicines />} />
                  <Route path="/hospitals" element={<Hospitals />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/feedback" element={<Feedback />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/premium" element={<Premium />} />
                  <Route path="/journals" element={<Journals />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </MedicalProfileProvider>
        </AuthProvider>
      </ThemeProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
