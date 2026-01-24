import { ThemeProvider } from "@/components/ThemeProvider";
import MaintenancePage from "@/components/MaintenancePage";

// Set this to false to disable maintenance mode
const MAINTENANCE_MODE = true;

const App = () => {
  if (MAINTENANCE_MODE) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <MaintenancePage />
      </ThemeProvider>
    );
  }

  // Normal app - imports are dynamic to avoid loading when in maintenance
  return <NormalApp />;
};

// Lazy load normal app components only when not in maintenance mode
const NormalApp = () => {
  const { Toaster } = require("@/components/ui/toaster");
  const { Toaster: Sonner } = require("@/components/ui/sonner");
  const { TooltipProvider } = require("@/components/ui/tooltip");
  const { QueryClient, QueryClientProvider } = require("@tanstack/react-query");
  const { BrowserRouter, Routes, Route } = require("react-router-dom");
  const Index = require("./pages/Index").default;
  const About = require("./pages/About").default;
  const NotFound = require("./pages/NotFound").default;
  const PrivacyPolicy = require("./pages/PrivacyPolicy").default;
  const TermsOfService = require("./pages/TermsOfService").default;
  const Contact = require("./pages/Contact").default;
  const Blog = require("./pages/Blog").default;
  const BlogPost = require("./pages/BlogPost").default;

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:postId" element={<BlogPost />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;