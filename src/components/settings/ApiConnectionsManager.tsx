import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Webhook, Braces, CheckCircle, XCircle } from "lucide-react";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import ApiUsageMetrics from "./ApiUsageMetrics";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { API_KEYS, getApiKey, saveApiKey, removeApiKey } from "@/utils/apiKeyUtils";
import { Badge } from "@/components/ui/badge";

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

  const renderStatus = (status: 'checking' | 'connected' | 'disconnected') => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="success" className="ml-2">
            <CheckCircle className="w-4 h-4 mr-1" />
            Connected
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="destructive" className="ml-2">
            <XCircle className="w-4 h-4 mr-1" />
            Not Connected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="ml-2">
            Checking...
          </Badge>
        );
    }
  };

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
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight mb-1">API Connections</h1>
                <p className="text-muted-foreground">
                  Configure your integrations and API connections
                </p>
              </div>
              <Button variant="outline" onClick={resetConnections}>
                Reset All Connections
              </Button>
            </div>
          </div>

          <div className="space-y-6">
            <ApiUsageMetrics />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Braces className="h-5 w-5" />
                  OpenAI API Connection
                  {renderStatus(openaiStatus)}
                </CardTitle>
                <CardDescription>
                  Connect your OpenAI API for content generation features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="openai-api-key" className="text-sm font-medium">
                    API Key
                  </label>
                  <Input
                    id="openai-api-key"
                    type="password"
                    placeholder="Enter your OpenAI API key"
                    value={openaiApiKey}
                    onChange={(e) => setOpenaiApiKey(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Your API key is stored securely. Find your API key in the 
                    <a 
                      href="https://platform.openai.com/api-keys" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline ml-1"
                    >
                      OpenAI dashboard
                    </a>
                  </p>
                </div>
                <Button onClick={handleSaveOpenaiKey} className="w-full sm:w-auto">
                  Save API Key
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  Webhook Integration
                  {renderStatus(webhookStatus)}
                </CardTitle>
                <CardDescription>
                  Connect your webhook for data synchronization
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="webhook-url" className="text-sm font-medium">
                    Webhook URL
                  </label>
                  <Input
                    id="webhook-url"
                    placeholder="Enter your webhook URL"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    This webhook will be used to sync data with external services
                  </p>
                </div>
                <Button onClick={handleSaveWebhook} className="w-full sm:w-auto">
                  Save Webhook URL
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
};

export default ApiConnectionsManager;
