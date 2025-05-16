
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Webhook, CheckCircle, XCircle } from "lucide-react";

interface WebhookConnectionProps {
  webhookUrl: string;
  status: 'checking' | 'connected' | 'disconnected';
  onSaveWebhook: () => void;
  onUrlChange: (url: string) => void;
}

const WebhookConnection: React.FC<WebhookConnectionProps> = ({
  webhookUrl,
  status,
  onSaveWebhook,
  onUrlChange,
}) => {
  const renderStatus = () => {
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Webhook Integration
          {renderStatus()}
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
            onChange={(e) => onUrlChange(e.target.value)}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            This webhook will be used to sync data with external services
          </p>
        </div>
        <Button onClick={onSaveWebhook} className="w-full sm:w-auto">
          Save Webhook URL
        </Button>
      </CardContent>
    </Card>
  );
};

export default WebhookConnection;
