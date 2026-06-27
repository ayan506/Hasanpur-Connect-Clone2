import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { useEffect } from "react";
import { useTrackEvent, useGetSettings } from "@workspace/api-client-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import CookiesBanner from "@/components/CookiesBanner";
import { PageProgressBar } from "@/components/PageProgressBar";
import { LanguageProvider } from "@/contexts/LanguageContext";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import SearchPage from "@/pages/Search";
import CategoryPage from "@/pages/Category";
import BusinessDetail from "@/pages/BusinessDetail";
import BlogPage from "@/pages/Blog";
import BlogPostPage from "@/pages/BlogPost";
import LoginPage from "@/pages/Login";
import RegisterPage from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Admin from "@/pages/Admin";
import AboutPage from "@/pages/About";
import ContactPage from "@/pages/Contact";
import FAQPage from "@/pages/FAQ";
import PrivacyPolicyPage from "@/pages/PrivacyPolicy";
import TermsPage from "@/pages/Terms";
import DisclaimerPage from "@/pages/Disclaimer";
import ReviewPolicyPage from "@/pages/ReviewPolicy";
import GovernmentContactsPage from "@/pages/GovernmentContacts";
import CommunityPartnersPage from "@/pages/CommunityPartners";
import ForgotPasswordPage from "@/pages/ForgotPassword";
import UnderConstruction from "@/pages/UnderConstruction";
import CustomPage from "@/pages/CustomPage";
import PagesListPage from "@/pages/Pages";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      retry: 1,
    },
  },
});

function PageViewTracker() {
  const [location] = useLocation();
  const track = useTrackEvent();

  useEffect(() => {
    track.mutate({
      data: {
        eventType: "page_view",
        entityType: "page",
        metadata: { path: location } as any,
      },
    });
  }, [location]);

  return null;
}

function MaintenanceGate({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: settings, isLoading } = useGetSettings();

  useEffect(() => {
    const color = (settings as any)?.themeColor;
    if (color && typeof color === "string" && color.trim()) {
      document.documentElement.style.setProperty("--primary", color.trim());
    }
  }, [(settings as any)?.themeColor]);

  if (isLoading) return null;

  const isAdminRoute = location.startsWith("/admin");
  if (settings?.maintenanceMode && !isAdminRoute) {
    return <UnderConstruction />;
  }
  return <>{children}</>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={SearchPage} />
      <Route path="/category/:slug" component={CategoryPage} />
      <Route path="/business/:slug" component={BusinessDetail} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPostPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/admin" component={Admin} />
      <Route path="/about" component={AboutPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/disclaimer" component={DisclaimerPage} />
      <Route path="/review-policy" component={ReviewPolicyPage} />
      <Route path="/government-contacts" component={GovernmentContactsPage} />
      <Route path="/community-partners" component={CommunityPartnersPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/pages" component={PagesListPage} />
      <Route path="/:slug" component={CustomPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <LanguageProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <PageViewTracker />
            <PageProgressBar />
            <MaintenanceGate>
              <Router />
            </MaintenanceGate>
            <CookiesBanner />
          </WouterRouter>
          <Toaster />
        </LanguageProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
