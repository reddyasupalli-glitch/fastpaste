import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";

// Pages
import Landing from "./pages/Landing";
import Paste from "./pages/Paste";
import PasteView from "./pages/PasteView";
import CodingRooms from "./pages/CodingRooms";
import CodingRoom from "./pages/CodingRoom";
import Explore from "./pages/Explore";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Contact from "./pages/Contact";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Main Routes */}
              <Route path="/" element={<Landing />} />
              
              {/* Paste System */}
              <Route path="/paste" element={<Paste />} />
              <Route path="/paste/:pasteId" element={<PasteView />} />
              
              {/* Coding Rooms */}
              <Route path="/rooms" element={<CodingRooms />} />
              <Route path="/room/:roomCode" element={<CodingRoom />} />
              
              {/* Explore & Discovery */}
              <Route path="/explore" element={<Explore />} />
              
              {/* Info Pages */}
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
