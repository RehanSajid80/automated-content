
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
import { Globe } from "lucide-react";

const ApiConnectionsManager = () => {
  // API key state
  const [openaiApiKey, setOpenaiApiKey] = React.useState("");
  const [openaiStatus, setOpenaiStatus] = React.useState<'checking' | 'connected' | 'disconnected'>('checking');
  
  // Webhook state
  const [activeWebhookType, setActiveWebhookType] = React.useState<'keywords' | 'content' | 'custom-keywords' | 'content-adjustment'>('keywords');
  const [webhookStatus, setWebhookStatus] = React.useState<'checking' | 'connected' | 'disconnected'>('checking');
  
  const { toast } = useToast();
  const { webhooks, fetchWebhookUrls, isAdmin } = useN8nConfig();

  // Check OpenAI API key - improved version with better logging
  const checkOpenAI = async () => {
    console.log('🔍 Starting global OpenAI connection check...');
    setOpenaiStatus('checking');
    
    try {
      // Get global API key from Supabase or localStorage
      const key = await getApiKey(API_KEYS.OPENAI);
      console.log('🔑 Global OpenAI key retrieval result:', key ? 'Key found' : 'No key found');
      
      if (!key) {
        console.log('❌ No OpenAI API key found in global storage');
        setOpenaiStatus('disconnected');
        setOpenaiApiKey("");
        return;
      }
      
      // Validate key with OpenAI API
      console.log('🔬 Validating OpenAI API key with OpenAI servers...');
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 OpenAI API validation response status:', response.status);
      
      if (response.ok) {
        console.log('✅ OpenAI API key is valid and working globally');
        setOpenaiStatus('connected');
        setOpenaiApiKey("••••••••••••••••••••••••••");
        console.log('🌍 API key loaded from global configuration (available to all users)');
      } else {
        const errorText = await response.text();
        console.log('❌ OpenAI API key validation failed:', response.status, errorText);
        setOpenaiStatus('disconnected');
        setOpenaiApiKey("");
      }
    } catch (error) {
      console.error('💥 OpenAI connection check error:', error);
      setOpenaiStatus('disconnected');
      setOpenaiApiKey("");
    }
  };

  // Run OpenAI check immediately on component mount
  useEffect(() => {
    console.log('🚀 Component mounted, checking global OpenAI connection...');
    checkOpenAI();
  }, []);

  // Also run when component loads to ensure fresh data
  useEffect(() => {
    console.log('🔄 Fetching global webhook URLs...');
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
      setOpenaiStatus('checking');
      setWebhookStatus('checking');
      
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

  const handleSaveOpenaiKey = async () => {
    if (openaiApiKey && openaiApiKey !== "••••••••••••••••••••••••••") {
      try {
        console.log('💾 Saving OpenAI API key globally...');
        await saveApiKey(API_KEYS.OPENAI, openaiApiKey, "OpenAI");
        setOpenaiApiKey("••••••••••••••••••••••••••");
        setOpenaiStatus('checking');
        
        console.log(`✅ OpenAI API key saved globally (available to all users)`);
        
        toast({
          title: "OpenAI API Key Saved Globally",
          description: "Your OpenAI API key has been saved and is now available to all users of this application",
        });
        
        // Re-check the connection after saving
        setTimeout(checkOpenAI, 500);
      } catch (error) {
        console.error('❌ Failed to save OpenAI API key:', error);
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
            
            <Alert className="mb-6">
              <Globe className="h-4 w-4" />
              <AlertDescription>
                <strong>Global Configuration:</strong> API keys and webhooks configured here are shared across all users. 
                No sign-in required - this works for everyone using this application.
              </AlertDescription>
            </Alert>
            
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
