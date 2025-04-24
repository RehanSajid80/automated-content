
import React from "react";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import ApiUsageMetrics from "./ApiUsageMetrics";
import { useToast } from "@/hooks/use-toast";
import { API_KEYS, getApiKey, saveApiKey, removeApiKey } from "@/utils/apiKeyUtils";
import ConnectionHeader from "./api/ConnectionHeader";
import OpenAIConnection from "./api/OpenAIConnection";
import WebhookConnection from "./api/WebhookConnection";

const ApiConnectionsManager = () => {
  const [openaiApiKey, setOpenaiApiKey] = React.useState("");
  const [openaiStatus, setOpenaiStatus] = React.useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [webhookUrl, setWebhookUrl] = React.useState("");
  const [webhookStatus, setWebhookStatus] = React.useState<'checking' | 'connected' | 'disconnected'>('checking');
  const { toast } = useToast();

  const resetConnections = async () => {
    try {
      await removeApiKey(API_KEYS.OPENAI);
      localStorage.removeItem("semrush-webhook-url");
      setOpenaiApiKey("");
      setWebhookUrl("");
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
    const checkWebhook = async () => {
      try {
        const url = localStorage.getItem("semrush-webhook-url");
        if (!url) {
          setWebhookStatus('disconnected');
          return;
        }
        setWebhookUrl(url);
        
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'no-cors',
          body: JSON.stringify({ test: true }),
        });
        
        setWebhookStatus('connected');
      } catch (error) {
        console.error('Webhook connection error:', error);
        setWebhookStatus('disconnected');
      }
    };
    
    checkWebhook();
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

  const handleSaveWebhook = () => {
    if (webhookUrl) {
      localStorage.setItem("semrush-webhook-url", webhookUrl);
      setWebhookStatus('checking');
      toast({
        title: "Webhook URL Saved",
        description: "Your webhook URL has been saved",
      });
    } else {
      toast({
        title: "Webhook URL Required",
        description: "Please enter a valid webhook URL",
        variant: "destructive",
      });
    }
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
              status={webhookStatus}
              onSaveWebhook={handleSaveWebhook}
              onUrlChange={setWebhookUrl}
            />
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
};

export default ApiConnectionsManager;
