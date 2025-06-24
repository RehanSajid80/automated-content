
import React, { useEffect } from "react";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import ApiUsageMetrics from "./ApiUsageMetrics";
import { useToast } from "@/hooks/use-toast";
import { API_KEYS, getApiKey, saveApiKey, removeApiKey } from "@/utils/apiKeyUtils";
import ConnectionHeader from "./api/ConnectionHeader";
import OpenAIConnection from "./api/OpenAIConnection";
import WebhookConnection from "./api/WebhookConnection";
import SemrushConnection from "./api/SemrushConnection";
import AdminSettings from "./api/AdminSettings";
import ErrorBoundary from "@/components/ui/error-boundary";
import { useN8nConfig } from "@/hooks/useN8nConfig";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const ApiConnectionsManager = () => {
  // API key state
  const [openaiApiKey, setOpenaiApiKey] = React.useState("");
  const [openaiStatus, setOpenaiStatus] = React.useState<'checking' | 'connected' | 'disconnected'>('checking');
  
  // Webhook state
  const [activeWebhookType, setActiveWebhookType] = React.useState<'keywords' | 'content' | 'custom-keywords' | 'content-adjustment'>('keywords');
  const [webhookStatus, setWebhookStatus] = React.useState<'checking' | 'connected' | 'disconnected'>('checking');
  
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = React.useState<boolean | null>(null);
  
  const { toast } = useToast();
  const { webhooks, fetchWebhookUrls, isAdmin } = useN8nConfig();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        console.error('Error checking auth status:', error);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      if (event === 'SIGNED_IN') {
        // Refresh data when user signs in
        setTimeout(() => {
          fetchWebhookUrls();
          checkOpenAI();
        }, 100);
      }
    });

    return () => subscription.unsubscribe();
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
      setOpenaiStatus('checking');
      setWebhookStatus('checking');
      
      toast({
        title: "Connections Reset",
        description: "All API connections have been reset successfully",
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

  // Check OpenAI API key on mount
  const checkOpenAI = async () => {
    try {
      const key = await getApiKey(API_KEYS.OPENAI);
      if (!key) {
        setOpenaiStatus('disconnected');
        return;
      }
      
      // Validate key with OpenAI API
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${key}`,
        },
      });
      
      if (response.ok) {
        setOpenaiStatus('connected');
        setOpenaiApiKey("••••••••••••••••••••••••••");
      } else {
        setOpenaiStatus('disconnected');
      }
    } catch (error) {
      console.error('OpenAI connection error:', error);
      setOpenaiStatus('disconnected');
    }
  };

  useEffect(() => {
    if (isAuthenticated !== null) {
      checkOpenAI();
    }
  }, [isAuthenticated]);

  // Update webhook status based on type
  useEffect(() => {
    if (activeWebhookType === 'keywords') {
      setWebhookStatus(webhooks.keywordWebhook ? 'connected' : 'disconnected');
    } else if (activeWebhookType === 'content') {
      setWebhookStatus(webhooks.contentWebhook ? 'connected' : 'disconnected');
    } else if (activeWebhookType === 'content-adjustment') {
      setWebhookStatus(webhooks.contentAdjustmentWebhook ? 'connected' : 'disconnected');
    } else {
      setWebhookStatus(webhooks.customKeywordsWebhook ? 'connected' : 'disconnected');
    }
  }, [activeWebhookType, webhooks]);

  // Fetch webhook URLs on mount
  useEffect(() => {
    if (isAuthenticated !== null) {
      fetchWebhookUrls();
    }
  }, [isAuthenticated]);

  const handleSaveOpenaiKey = async () => {
    if (openaiApiKey && openaiApiKey !== "••••••••••••••••••••••••••") {
      try {
        await saveApiKey(API_KEYS.OPENAI, openaiApiKey, "OpenAI");
        setOpenaiApiKey("••••••••••••••••••••••••••");
        setOpenaiStatus('checking');
        toast({
          title: "OpenAI API Key Saved",
          description: isAuthenticated 
            ? "Your OpenAI API key has been saved securely and will sync across browsers" 
            : "Your OpenAI API key has been saved locally",
        });
        
        // Re-check the connection
        setTimeout(checkOpenAI, 500);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save OpenAI API key",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "API Key Required",
        description: "Please enter a valid OpenAI API key",
        variant: "destructive",
      });
    }
  };

  const handleWebhookTypeChange = (type: 'keywords' | 'content' | 'custom-keywords' | 'content-adjustment') => {
    setActiveWebhookType(type);
  };

  const handleSemrushConfigSave = () => {
    toast({
      title: "SEMrush Configuration Saved",
      description: isAuthenticated 
        ? "Your SEMrush settings have been updated and will sync across browsers"
        : "Your SEMrush settings have been saved locally",
    });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen flex w-full">
        <SidebarProvider>
          <Sidebar />
          <main className="flex-1 p-6 md:p-8 pt-6 max-w-5xl mx-auto w-full">
            <ConnectionHeader onResetConnections={resetConnections} />
            
            {isAuthenticated === false && (
              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Not signed in:</strong> Your API keys and webhooks are stored locally and won't sync across browsers. 
                  Sign in to sync your settings across all devices and browsers.
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-6">
              <ApiUsageMetrics />
              {isAdmin && <AdminSettings />}
              <OpenAIConnection
                apiKey={openaiApiKey}
                status={openaiStatus}
                onSaveKey={handleSaveOpenaiKey}
                onKeyChange={setOpenaiApiKey}
              />
              <SemrushConnection onSaveConfig={handleSemrushConfigSave} />
              <WebhookConnection
                activeWebhookType={activeWebhookType}
                onWebhookTypeChange={handleWebhookTypeChange}
              />
            </div>
          </main>
        </SidebarProvider>
      </div>
    </ErrorBoundary>
  );
};

export default ApiConnectionsManager;
