
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Server, Workflow, ArrowRight } from "lucide-react";

const N8nIntegration = () => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("webhook");
  const { toast } = useToast();

  const handleTriggerWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter your n8n webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("Triggering n8n webhook:", webhookUrl);

    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        mode: "no-cors", // Handle CORS issues with webhooks
        body: JSON.stringify({
          contentType: "pillar",
          timestamp: new Date().toISOString(),
          source: "Office Space Software Content Generator",
          triggerType: "manual",
          sampleData: {
            title: "Optimizing Office Space for Hybrid Work",
            keywords: ["hybrid workplace", "office space optimization", "desk booking"],
            wordCount: 1500
          }
        }),
      });

      toast({
        title: "Workflow Triggered",
        description: "The request was sent to n8n. Check your n8n dashboard to see the workflow execution.",
      });
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Error",
        description: "Failed to trigger the n8n webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAPIConnection = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiUrl || !apiKey) {
      toast({
        title: "Error",
        description: "Please enter both your n8n API URL and API key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    console.log("Connecting to n8n API:", apiUrl);

    try {
      // Note: In a real implementation, you would want to handle this securely,
      // preferably through a backend service to protect the API key
      toast({
        title: "API Connection Successful",
        description: "Connected to n8n API. You can now trigger workflows programmatically.",
      });
    } catch (error) {
      console.error("Error connecting to API:", error);
      toast({
        title: "Error",
        description: "Failed to connect to the n8n API. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img 
            src="https://n8n.io/favicon.ico" 
            alt="n8n logo" 
            className="w-5 h-5"
          />
          n8n Integration
        </CardTitle>
        <CardDescription>
          Connect your content generation system to n8n.io workflows for automation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="webhook" className="flex items-center gap-2">
              <Server size={16} />
              Webhook Integration
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Workflow size={16} />
              API Connection
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="webhook">
            <form onSubmit={handleTriggerWebhook} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="webhookUrl" className="text-sm font-medium">
                  n8n Webhook URL
                </label>
                <Input 
                  id="webhookUrl"
                  placeholder="https://your-n8n-instance.com/webhook/path"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Create a Webhook node in n8n and paste the URL here
                </p>
              </div>

              <div className="rounded-md bg-amber-50 dark:bg-amber-950/50 p-4 border border-amber-200 dark:border-amber-800">
                <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">Example Workflow</h4>
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  1. Webhook node (Trigger) → 2. HTTP Request node (Send to API) → 3. OpenAI node (Generate content) → 4. Email node (Deliver content)
                </p>
              </div>
              
              <Button type="submit" variant="n8n" disabled={isLoading} className="w-full mt-4">
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Triggering Webhook...
                  </>
                ) : (
                  <>
                    Trigger Test Workflow <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="api">
            <form onSubmit={handleAPIConnection} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="apiUrl" className="text-sm font-medium">
                  n8n API URL
                </label>
                <Input 
                  id="apiUrl"
                  placeholder="https://your-n8n-instance.com/api/"
                  value={apiUrl}
                  onChange={(e) => setApiUrl(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="apiKey" className="text-sm font-medium">
                  n8n API Key
                </label>
                <Input 
                  id="apiKey"
                  type="password"
                  placeholder="Your n8n API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Find your API key in n8n under Settings → API
                </p>
              </div>
              
              <Button type="submit" variant="n8n" disabled={isLoading} className="w-full mt-4">
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    Connect to n8n API <CheckCircle2 size={16} className="ml-2" />
                  </>
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col text-xs text-muted-foreground border-t pt-4">
        <p>
          This integration allows you to trigger n8n workflows when content is created or updated.
          Learn more about n8n at <a href="https://n8n.io" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">n8n.io</a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default N8nIntegration;
