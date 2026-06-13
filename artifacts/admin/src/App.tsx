import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect } from "react";

import { isAuthenticated } from "@/lib/auth";
import Layout from "@/components/layout";

// Synchronously process URL token if present (cross-origin login redirection)
if (typeof window !== "undefined") {
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get("token");
  if (urlToken) {
    localStorage.setItem("admin_token", urlToken);
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
}

// Pages
import Dashboard from "@/pages/dashboard";
import Students from "@/pages/students";
import StudentDetail from "@/pages/student-detail";
import Certificates from "@/pages/certificates";
import Content from "@/pages/content";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  useEffect(() => {
    if (!isAuthenticated()) {
      const studentUrl = window.location.origin.includes("localhost")
        ? "http://localhost:8081"
        : "/";
      window.location.href = studentUrl;
    }
  }, []);

  if (!isAuthenticated()) return null;

  return (
    <Layout>
      <Component />
    </Layout>
  );
}

function Router() {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Redirect root/login to dashboard if logged in, else redirect to student app
    if (location === "/" || location === "/login") {
      if (isAuthenticated()) {
        setLocation("/dashboard");
      } else {
        const studentUrl = window.location.origin.includes("localhost")
          ? "http://localhost:8081"
          : "/";
        window.location.href = studentUrl;
      }
    }
  }, [location, setLocation]);

  return (
    <Switch>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/students">
        <ProtectedRoute component={Students} />
      </Route>
      <Route path="/students/:id">
        <ProtectedRoute component={StudentDetail} />
      </Route>
      <Route path="/certificates">
        <ProtectedRoute component={Certificates} />
      </Route>
      <Route path="/content">
        <ProtectedRoute component={Content} />
      </Route>
      <Route path="/" component={() => null} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;