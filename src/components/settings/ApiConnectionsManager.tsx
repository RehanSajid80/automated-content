
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import N8nIntegration from "../integrations/N8nIntegration";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { useLocation } from "react-router-dom";

const ApiConnectionsManager = () => {
  return (
    <div className="min-h-screen flex w-full">
      <SidebarProvider>
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 pt-6 max-w-5xl mx-auto w-full">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight mb-1">API Connections</h1>
            <p className="text-muted-foreground">
              Configure your integrations and API connections
            </p>
          </div>

          <div className="space-y-6">
            <N8nIntegration />
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
};

export default ApiConnectionsManager;
