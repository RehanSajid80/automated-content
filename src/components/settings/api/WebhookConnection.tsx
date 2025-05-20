
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Webhook, CheckCircle, XCircle, Globe } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface WebhookConnectionProps {
  webhookUrl: string;
  contentWebhookUrl?: string;
  status: 'checking' | 'connected' | 'disconnected';
  onSaveWebhook: () => void;
  onUrlChange: (url: string) => void;
  onContentUrlChange?: (url: string) => void;
  onWebhookTypeChange?: (type: 'keywords' | 'content') => void;
  activeWebhookType?: 'keywords' | 'content';
}

const WebhookConnection: React.FC<WebhookConnectionProps> = ({
  webhookUrl,
  contentWebhookUrl,
  status,
  onSaveWebhook,
  onUrlChange,
  onContentUrlChange,
  onWebhookTypeChange,
  activeWebhookType = 'keywords'
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
          Connect your webhooks for data synchronization and content generation
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {onWebhookTypeChange && (
          <RadioGroup 
            value={activeWebhookType} 
            onValueChange={(value) => onWebhookTypeChange(value as 'keywords' | 'content')}
            className="flex flex-col space-y-1 mb-4"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="keywords" id="keywords" />
              <Label htmlFor="keywords">Keyword Sync Webhook</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="content" id="content" />
              <Label htmlFor="content">Content Generation Webhook</Label>
            </div>
          </RadioGroup>
        )}

        {activeWebhookType === 'content' && onContentUrlChange ? (
          <div className="space-y-2">
            <label htmlFor="content-webhook-url" className="text-sm font-medium">
              Content Generation Webhook URL
            </label>
            <Input
              id="content-webhook-url"
              placeholder="Enter your content generation webhook URL"
              value={contentWebhookUrl || ''}
              onChange={(e) => onContentUrlChange(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This webhook will be used for AI content generation
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <label htmlFor="webhook-url" className="text-sm font-medium">
              {onWebhookTypeChange ? 'Keyword Sync' : ''} Webhook URL
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
        )}
        <Button onClick={onSaveWebhook} className="w-full sm:w-auto">
          <Globe className="mr-2 h-4 w-4" />
          Save Webhook URL
        </Button>
      </CardContent>
    </Card>
  );
};

export default WebhookConnection;
