
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Webhook } from "lucide-react";
import N8nIntegration from "../integrations/N8nIntegration";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const ApiConnectionsManager = () => {
  const [semrushWebhookUrl, setSemrushWebhookUrl] = React.useState(() => 
    localStorage.getItem("semrush-webhook-url") || ""
  );
  const { toast } = useToast();

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
