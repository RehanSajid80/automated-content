
import React, { useEffect } from "react";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { API_KEYS, removeApiKey } from "@/utils/apiKeyUtils";
import ConnectionHeader from "./api/ConnectionHeader";
import ErrorBoundary from "@/components/ui/error-boundary";
import { useN8nConfig } from "@/hooks/useN8nConfig";
import GlobalConfigAlert from "./api/GlobalConfigAlert";
import ApiConnectionsContent from "./api/ApiConnectionsContent";
import { useOpenAIConnection } from "@/hooks/useOpenAIConnection";
import { useWebhookManager } from "@/hooks/useWebhookManager";

const ApiConnectionsManager = () => {
  const { toast } = useToast();
  const { fetchWebhookUrls } = useN8nConfig();
  
  // Use custom hooks for state management
  const {
    openaiApiKey,
    setOpenaiApiKey,
    openaiStatus,
    checkOpenAI,
    handleSaveOpenaiKey
  } = useOpenAIConnection();
  
  const {
    activeWebhookType,
    handleWebhookTypeChange
  } = useWebhookManager();

  // Run checks immediately on component mount
  useEffect(() => {
    console.log('🚀 Component mounted, checking global connections...');
    checkOpenAI();
    fetchWebhookUrls();
  }, []);

  const resetConnections = async () => {
    try {
      await removeApiKey(API_KEYS.OPENAI);
      localStorage.removeItem("n8n-webhook-url");
      localStorage.removeItem("semrush-webhook-url");
      localStorage.removeItem("n8n-content-webhook-url");
      localStorage.removeItem("n8n-custom-keywords-webhook-url");
      localStorage.removeItem("n8n-content-adjustment-webhook-url");
      localStorage.removeItem("semrush-keyword-limit");
      setOpenaiApiKey("");
      
      toast({
        title: "Global Connections Reset",
        description: "All global API connections have been reset successfully",
      });
      
      // Force reload page to refresh all states
      window.location.reload();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset connections",
        variant: "destructive",
      });
    }
  };

  const handleSemrushConfigSave = () => {
    toast({
      title: "SEMrush Configuration Saved",
      description: "Your SEMrush settings have been updated globally",
    });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex w-full">
        <SidebarProvider>
          <Sidebar />
          <main className="flex-1 p-6 md:p-8 pt-6 max-w-5xl mx-auto w-full">
            <ConnectionHeader onResetConnections={resetConnections} />
            <GlobalConfigAlert />
            <ApiConnectionsContent
              openaiApiKey={openaiApiKey}
              openaiStatus={openaiStatus}
              onSaveOpenaiKey={handleSaveOpenaiKey}
              onOpenaiKeyChange={setOpenaiApiKey}
              activeWebhookType={activeWebhookType}
              onWebhookTypeChange={handleWebhookTypeChange}
              onSemrushConfigSave={handleSemrushConfigSave}
            />
          </main>
        </SidebarProvider>
      </div>
    </ErrorBoundary>
  );
};

export default ApiConnectionsManager;
