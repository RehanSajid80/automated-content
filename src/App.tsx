
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import ContentLibraryPage from "./pages/ContentLibraryPage";
import NotFound from "./pages/NotFound";
import ApiConnectionsManager from "./components/settings/ApiConnectionsManager";
import { SidebarProvider } from "@/components/ui/sidebar";

// Create a new query client instance
const queryClient = new QueryClient();

// RouteChangeHandler component to listen for URL changes
const RouteChangeHandler = () => {
  const location = useLocation();

  React.useEffect(() => {
    // On route change, check for tab param and dispatch event
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get("tab");
    
    if (tab) {
      // Dispatch event to change tab
      window.dispatchEvent(
        new CustomEvent("navigate-to-tab", { detail: { tab } })
      );
    } else if (location.pathname === "/") {
      // If on root with no tab, default to dashboard
      window.dispatchEvent(
        new CustomEvent("navigate-to-tab", { detail: { tab: "dashboard" } })
      );
    }
  }, [location]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <SidebarProvider>
        <BrowserRouter>
          <RouteChangeHandler />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/library" element={<ContentLibraryPage />} />
            <Route path="/api-connections" element={<ApiConnectionsManager />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SidebarProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
