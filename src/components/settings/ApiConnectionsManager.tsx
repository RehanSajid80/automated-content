
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Webhook, Braces } from "lucide-react";
import N8nIntegration from "../integrations/N8nIntegration";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { API_KEYS, getApiKey, saveApiKey } from "@/utils/apiKeyUtils";

const ApiConnectionsManager = () => {
  const [openaiApiKey, setOpenaiApiKey] = React.useState("");
  const [semrushWebhookUrl, setSemrushWebhookUrl] = React.useState(() => 
    localStorage.getItem("semrush-webhook-url") || ""
  );
  const { toast } = useToast();

  // Load the OpenAI API key when the component mounts
  React.useEffect(() => {
    const loadApiKey = async () => {
      const key = await getApiKey(API_KEYS.OPENAI);
      if (key) {
        setOpenaiApiKey("••••••••••••••••••••••••••");
      }
    };
    
    loadApiKey();
  }, []);

  const handleSaveOpenaiKey = async () => {
    if (openaiApiKey && openaiApiKey !== "••••••••••••••••••••••••••") {
      await saveApiKey(API_KEYS.OPENAI, openaiApiKey, "OpenAI");
      setOpenaiApiKey("••••••••••••••••••••••••••");
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
    localStorage.setItem("semrush-webhook-url", semrushWebhookUrl);
    toast({
      title: "Webhook URL Saved",
      description: "Your SEMrush keyword sync webhook URL has been saved",
    });
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
            <h1 className="text-2xl font-semibold tracking-tight mb-1">API Connections</h1>
            <p className="text-muted-foreground">
              Configure your integrations and API connections
            </p>
          </div>

          <div className="space-y-6">
            {/* OpenAI API Key Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Braces className="h-5 w-5" />
                  OpenAI API Connection
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

            {/* SEMrush Keyword Sync Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  SEMrush Keyword Sync
                </CardTitle>
                <CardDescription>
                  Connect your n8n workflow that syncs keyword data from SEMrush
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="webhook-url" className="text-sm font-medium">
                    Webhook URL
                  </label>
                  <Input
                    id="webhook-url"
                    placeholder="Enter your n8n webhook URL for SEMrush sync"
                    value={semrushWebhookUrl}
                    onChange={(e) => setSemrushWebhookUrl(e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    This webhook will be used to sync keyword data from SEMrush via your n8n workflow
                  </p>
                </div>
                <Button onClick={handleSaveWebhook} className="w-full sm:w-auto">
                  Save Webhook URL
                </Button>
              </CardContent>
            </Card>

            {/* n8n Integration Section */}
            <N8nIntegration />
          </div>
        </main>
      </SidebarProvider>
    </div>
  );
};

export default ApiConnectionsManager;
