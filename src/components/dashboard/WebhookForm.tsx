
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Link2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface WebhookFormProps {
  onSync?: (webhookUrl: string) => Promise<void>;
}

const WebhookForm: React.FC<WebhookFormProps> = ({ onSync }) => {
  const [webhookUrl, setWebhookUrl] = useState("https://officespacesoftware.app.n8n.cloud/webhook-test/sync-keywords");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch existing webhook URL on component mount
  useEffect(() => {
    const fetchWebhook = async () => {
      try {
        const { data, error } = await supabase
          .from('webhook_configs')
          .select('url')
          .eq('type', 'keyword-sync')
          .maybeSingle();

        if (error) {
          console.error('Error fetching webhook:', error);
          return;
        }

        if (data) {
          setWebhookUrl(data.url);
          // Also store in localStorage for easy access by other components
          localStorage.setItem("n8n-webhook-url", data.url);
        }
      } catch (err) {
        console.error("Error in fetchWebhook:", err);
      }
    };

    // First try to get from localStorage for faster load
    const savedUrl = localStorage.getItem("n8n-webhook-url");
    if (savedUrl) {
      setWebhookUrl(savedUrl);
    } else {
      // If not in localStorage, try to fetch from Supabase
      fetchWebhook();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookUrl) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Save to localStorage first for immediate access
      localStorage.setItem("n8n-webhook-url", webhookUrl);
      
      // Save to Supabase
      try {
        const { data: existingWebhook } = await supabase
          .from('webhook_configs')
          .select('id')
          .eq('type', 'keyword-sync')
          .maybeSingle();

        if (existingWebhook) {
          // Update existing webhook
          await supabase
            .from('webhook_configs')
            .update({ url: webhookUrl })
            .eq('id', existingWebhook.id);
        } else {
          // Insert new webhook
          await supabase
            .from('webhook_configs')
            .insert([{ url: webhookUrl, type: 'keyword-sync' }]);
        }
      } catch (dbError) {
        console.error("Error saving webhook to database:", dbError);
        // Continue since we already saved to localStorage
      }

      // Test the connection if onSync is provided
      if (onSync) {
        try {
          await onSync(webhookUrl);
        } catch (syncError) {
          console.error("Error testing webhook connection:", syncError);
          toast({
            title: "Connection Test Failed",
            description: "Saved the URL but could not establish a connection.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }

      toast({
        title: "Success",
        description: "Webhook URL saved successfully",
      });
    } catch (error) {
      console.error("Error saving webhook:", error);
      toast({
        title: "Error",
        description: "Failed to save webhook URL",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="webhookUrl">n8n Webhook URL</Label>
        <Input
          id="webhookUrl"
          placeholder="https://officespacesoftware.app.n8n.cloud/webhook-test/sync-keywords"
          value={webhookUrl}
          onChange={(e) => setWebhookUrl(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Create a webhook node in n8n that returns SEMrush keyword data in JSON format
        </p>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          The webhook should return an array of keyword objects in this format:
          <pre className="mt-2 bg-secondary/50 p-2 rounded-md text-xs">
{`[
  {
    "keyword": "office space management",
    "volume": 5400,
    "difficulty": 78,
    "cpc": 14.5,
    "trend": "up"
  }
]`}
          </pre>
        </AlertDescription>
      </Alert>

      <div className="flex items-center gap-2">
        <Button type="submit" disabled={isLoading}>
          <Link2Icon className="w-4 h-4 mr-2" />
          {isLoading ? "Syncing..." : "Save & Test Connection"}
        </Button>
      </div>
    </form>
  );
};

export default WebhookForm;
