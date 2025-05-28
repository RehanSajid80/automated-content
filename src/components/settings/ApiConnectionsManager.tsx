
import React, { useEffect } from "react";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import ApiUsageMetrics from "./ApiUsageMetrics";
import { useToast } from "@/hooks/use-toast";
import { API_KEYS, getApiKey, saveApiKey, removeApiKey } from "@/utils/apiKeyUtils";
import ConnectionHeader from "./api/ConnectionHeader";
import OpenAIConnection from "./api/OpenAIConnection";
import WebhookConnection from "./api/WebhookConnection";
import SemrushConnection from "./api/SemrushConnection";
import { useN8nConfig } from "@/hooks/useN8nConfig";

const ApiConnectionsManager = () => {
  // API key state
  const [openaiApiKey, setOpenaiApiKey] = React.useState("");
  const [openaiStatus, setOpenaiStatus] = React.useState<'checking' | 'connected' | 'disconnected'>('checking');
  
  // Webhook state - default back to keywords
  const [activeWebhookType, setActiveWebhookType] = React.useState<'keywords' | 'content' | 'custom-keywords'>('keywords');
  const [webhookStatus, setWebhookStatus] = React.useState<'checking' | 'connected' | 'disconnected'>('checking');
  
  const { toast } = useToast();
  const { webhooks, fetchWebhookUrls } = useN8nConfig();

  const resetConnections = async () => {
    try {
      await removeApiKey(API_KEYS.OPENAI);
      localStorage.removeItem("n8n-webhook-url");
      localStorage.removeItem("semrush-webhook-url");
      localStorage.removeItem("n8n-content-webhook-url");
      localStorage.removeItem("n8n-custom-keywords-webhook-url");
      localStorage.removeItem("semrush-keyword-limit"); // Also clear SEMrush settings
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
  useEffect(() => {
    const checkOpenAI = async () => {
      try {
        const key = await getApiKey(API_KEYS.OPENAI);
        if (!key) {
          setOpenaiStatus('disconnected');
          return;
        }
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
    
    checkOpenAI();
  }, []);

  // Update webhook status based on type
  useEffect(() => {
    if (activeWebhookType === 'keywords') {
      setWebhookStatus(webhooks.keywordWebhook ? 'connected' : 'disconnected');
    } else if (activeWebhookType === 'content') {
      setWebhookStatus(webhooks.contentWebhook ? 'connected' : 'disconnected');
    } else {
      setWebhookStatus(webhooks.customKeywordsWebhook ? 'connected' : 'disconnected');
    }
  }, [activeWebhookType, webhooks]);

  // Fetch webhook URLs on mount
  useEffect(() => {
    fetchWebhookUrls();
  }, []);

  const handleSaveOpenaiKey = async () => {
    if (openaiApiKey && openaiApiKey !== "••••••••••••••••••••••••••") {
      await saveApiKey(API_KEYS.OPENAI, openaiApiKey, "OpenAI");
      setOpenaiApiKey("••••••••••••••••••••••••••");
      setOpenaiStatus('checking');
      toast({
        title: "OpenAI API Key Saved",
        description: "Your OpenAI API key has been saved securely",
      });
    } else {
      toast({
        title: "API Key Required",
        description: "Please enter a valid OpenAI API key",
        variant: "destructive",
      });
    }
  };

  const handleWebhookTypeChange = (type: 'keywords' | 'content' | 'custom-keywords') => {
    setActiveWebhookType(type);
  };

  const handleSemrushConfigSave = () => {
    toast({
      title: "SEMrush Configuration Saved",
      description: "Your SEMrush settings have been updated",
    });
  };

  return (
    <div className="min-h-screen flex w-full">
      <SidebarProvider>
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 pt-6 max-w-5xl mx-auto w-full">
          <ConnectionHeader onResetConnections={resetConnections} />
          <div className="space-y-6">
            <ApiUsageMetrics />
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
  );
};

export default ApiConnectionsManager;
