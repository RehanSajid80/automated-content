
import React from "react";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import ApiUsageMetrics from "./ApiUsageMetrics";
import { useToast } from "@/hooks/use-toast";
import { API_KEYS, getApiKey, saveApiKey, removeApiKey } from "@/utils/apiKeyUtils";
import ConnectionHeader from "./api/ConnectionHeader";
import OpenAIConnection from "./api/OpenAIConnection";
import WebhookConnection from "./api/WebhookConnection";
import { useN8nConfig } from "@/hooks/useN8nConfig";

const ApiConnectionsManager = () => {
  const [openaiApiKey, setOpenaiApiKey] = React.useState("");
  const [openaiStatus, setOpenaiStatus] = React.useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [webhookUrl, setWebhookUrl] = React.useState("");
  const [contentWebhookUrl, setContentWebhookUrl] = React.useState("");
  const [webhookStatus, setWebhookStatus] = React.useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [activeWebhookType, setActiveWebhookType] = React.useState<'keywords' | 'content'>('keywords');
  const { toast } = useToast();
  const { getWebhookUrl, getContentWebhookUrl, saveWebhookUrl } = useN8nConfig();

  const resetConnections = async () => {
    try {
      await removeApiKey(API_KEYS.OPENAI);
      localStorage.removeItem("n8n-webhook-url");
      localStorage.removeItem("semrush-webhook-url");
      localStorage.removeItem("n8n-content-webhook-url");
      setOpenaiApiKey("");
      setWebhookUrl("");
      setContentWebhookUrl("");
      setOpenaiStatus('checking');
      setWebhookStatus('checking');
      
      toast({
        title: "Connections Reset",
        description: "All API connections have been reset successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset connections",
        variant: "destructive",
      });
    }
  };

  React.useEffect(() => {
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

  React.useEffect(() => {
    const loadWebhookUrls = () => {
      // Load both webhook URLs
      const keywordWebhookUrl = getWebhookUrl();
      const contentGenUrl = getContentWebhookUrl();
      
      setWebhookUrl(keywordWebhookUrl);
      setContentWebhookUrl(contentGenUrl);
      
      // Simple check to set status - we can't really test the webhook without sending data
      if (activeWebhookType === 'keywords') {
        setWebhookStatus(keywordWebhookUrl ? 'connected' : 'disconnected');
      } else {
        setWebhookStatus(contentGenUrl ? 'connected' : 'disconnected');
      }
    };
    
    loadWebhookUrls();
  }, [activeWebhookType]);

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

  const handleSaveWebhook = () => {
    if (activeWebhookType === 'keywords' && webhookUrl) {
      saveWebhookUrl(webhookUrl);
      setWebhookStatus('checking');
      toast({
        title: "Keyword Webhook URL Saved",
        description: "Your keyword webhook URL has been saved",
      });
    } else if (activeWebhookType === 'content' && contentWebhookUrl) {
      saveWebhookUrl(contentWebhookUrl, 'content');
      setWebhookStatus('checking');
      toast({
        title: "Content Webhook URL Saved",
        description: "Your content generation webhook URL has been saved",
      });
    } else {
      toast({
        title: "Webhook URL Required",
        description: "Please enter a valid webhook URL",
        variant: "destructive",
      });
    }
    
    // Set status after a short delay to simulate checking
    setTimeout(() => {
      setWebhookStatus('connected');
    }, 1000);
  };

  const handleWebhookTypeChange = (type: 'keywords' | 'content') => {
    setActiveWebhookType(type);
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
            <WebhookConnection
              webhookUrl={webhookUrl}
              contentWebhookUrl={contentWebhookUrl}
              status={webhookStatus}
              onSaveWebhook={handleSaveWebhook}
              onUrlChange={setWebhookUrl}
              onContentUrlChange={setContentWebhookUrl}
              onWebhookTypeChange={handleWebhookTypeChange}
              activeWebhookType={activeWebhookType}
            />
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
};

export default ApiConnectionsManager;
