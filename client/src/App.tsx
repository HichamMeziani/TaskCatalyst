import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Subscribe from "@/pages/subscribe";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  return (
    <Switch>
      {isLoading ? (
        <Route path="/" component={Landing} />
      ) : !isAuthenticated ? (
        <>
          <Route path="/" component={Home} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/subscribe" component={Subscribe} />
        </>
      ) : !(user as any)?.onboardingCompleted ? (
        <>
          <Route path="/" component={Onboarding} />
          <Route path="/onboarding" component={Onboarding} />
          <Route path="/subscribe" component={Subscribe} />
        </>
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/subscribe" component={Subscribe} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
