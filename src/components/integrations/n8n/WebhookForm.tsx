
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertTriangle, Link2Icon } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface WebhookFormProps {
  onSync?: (webhookUrl: string) => Promise<void>;
}

const WebhookForm: React.FC<WebhookFormProps> = ({ onSync }) => {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookUrl) {
      toast.error("Please enter your n8n webhook URL");
      return;
    }

    setIsLoading(true);

    try {
      await onSync?.(webhookUrl);
      toast.success("Keywords synced successfully from n8n");
    } catch (error) {
      console.error("Error syncing keywords:", error);
      toast.error("Failed to sync keywords. Please check your webhook URL and try again.");
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
          placeholder="https://your-n8n-instance.com/webhook/keyword-sync"
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
          {isLoading ? "Syncing..." : "Test Connection"}
        </Button>
      </div>
    </form>
  );
};

export default WebhookForm;
