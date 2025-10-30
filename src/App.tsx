import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Contact from "./pages/Contact";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import { EmailVerification } from "./pages/EmailVerification";
import Demo from "./pages/Demo";
import Forums from "./pages/Forums";
import TestSubscriptions from "./pages/TestSubscriptions";
import TestWebhooks from "./pages/TestWebhooks";
import PaymentSuccess from "./pages/PaymentSuccess";







const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/demo" element={<Demo />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/verify-email" element={<EmailVerification />} />
              <Route path="/forums" element={<Forums />} />
              <Route path="/test-subscriptions" element={<TestSubscriptions />} />
              <Route path="/test-webhooks" element={<TestWebhooks />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />






              <Route path="*" element={<NotFound />} />
            </Routes>

          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;