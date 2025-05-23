
import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Webhook, CheckCircle, XCircle, Globe, RefreshCw } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useN8nConfig } from "@/hooks/useN8nConfig";
import { toast } from "sonner";

interface WebhookConnectionProps {
  onSaveWebhook?: () => void;
  activeWebhookType?: 'keywords' | 'content' | 'custom-keywords';
  onWebhookTypeChange?: (type: 'keywords' | 'content' | 'custom-keywords') => void;
}

const WebhookConnection: React.FC<WebhookConnectionProps> = ({
  onSaveWebhook,
  onWebhookTypeChange,
  activeWebhookType = 'keywords'
}) => {
  const { 
    getWebhookUrl, 
    getContentWebhookUrl,
    getCustomKeywordsWebhookUrl,
    saveWebhookUrl, 
    isLoading, 
    fetchWebhookUrls 
  } = useN8nConfig();
  
  const [webhookUrl, setWebhookUrl] = React.useState("");
  const [contentWebhookUrl, setContentWebhookUrl] = React.useState("");
  const [customKeywordsWebhookUrl, setCustomKeywordsWebhookUrl] = React.useState("");
  const [status, setStatus] = React.useState<'checking' | 'connected' | 'disconnected'>('checking');
  
  // Load webhook URLs on mount and when activeWebhookType changes
  useEffect(() => {
    loadWebhookUrls();
  }, [activeWebhookType]);
  
  const loadWebhookUrls = () => {
    const keywordWebhookUrl = getWebhookUrl();
    const contentGenUrl = getContentWebhookUrl();
    const customKeywordsUrl = getCustomKeywordsWebhookUrl();
    
    setWebhookUrl(keywordWebhookUrl);
    setContentWebhookUrl(contentGenUrl);
    setCustomKeywordsWebhookUrl(customKeywordsUrl);
    
    // Set status based on active webhook type
    if (activeWebhookType === 'keywords') {
      setStatus(keywordWebhookUrl ? 'connected' : 'disconnected');
    } else if (activeWebhookType === 'content') {
      setStatus(contentGenUrl ? 'connected' : 'disconnected');
    } else {
      setStatus(customKeywordsUrl ? 'connected' : 'disconnected');
    }
  };

  const handleRefreshWebhooks = async () => {
    setStatus('checking');
    await fetchWebhookUrls();
    loadWebhookUrls();
    toast.success("Webhook configurations refreshed");
  };

  const handleSaveWebhook = async () => {
    setStatus('checking');
    
    if (activeWebhookType === 'keywords' && webhookUrl) {
      await saveWebhookUrl(webhookUrl);
      setStatus('connected');
    } else if (activeWebhookType === 'content' && contentWebhookUrl) {
      await saveWebhookUrl(contentWebhookUrl, 'content');
      setStatus('connected');
    } else if (activeWebhookType === 'custom-keywords' && customKeywordsWebhookUrl) {
      await saveWebhookUrl(customKeywordsWebhookUrl, 'custom-keywords');
      setStatus('connected');
    } else {
      toast.error("Please enter a valid webhook URL");
      setStatus('disconnected');
      return;
    }
    
    if (onSaveWebhook) {
      onSaveWebhook();
    }
  };

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
            onValueChange={(value) => onWebhookTypeChange(value as 'keywords' | 'content' | 'custom-keywords')}
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
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="custom-keywords" id="custom-keywords" />
              <Label htmlFor="custom-keywords">Custom Keywords Webhook</Label>
            </div>
          </RadioGroup>
        )}

        {activeWebhookType === 'content' ? (
          <div className="space-y-2">
            <label htmlFor="content-webhook-url" className="text-sm font-medium">
              Content Generation Webhook URL
            </label>
            <Input
              id="content-webhook-url"
              placeholder="Enter your content generation webhook URL"
              value={contentWebhookUrl || ''}
              onChange={(e) => setContentWebhookUrl(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This webhook will be used for AI content generation
            </p>
          </div>
        ) : activeWebhookType === 'custom-keywords' ? (
          <div className="space-y-2">
            <label htmlFor="custom-keywords-webhook-url" className="text-sm font-medium">
              Custom Keywords Webhook URL
            </label>
            <Input
              id="custom-keywords-webhook-url"
              placeholder="Enter your custom keywords webhook URL"
              value={customKeywordsWebhookUrl || ''}
              onChange={(e) => setCustomKeywordsWebhookUrl(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This webhook will be used to process user-entered custom keywords
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
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              This webhook will be used to sync data with external services
            </p>
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={handleSaveWebhook} className="w-full sm:w-auto" disabled={isLoading}>
            <Globe className="mr-2 h-4 w-4" />
            Save Webhook URL
          </Button>
          <Button onClick={handleRefreshWebhooks} variant="outline" className="w-full sm:w-auto" disabled={isLoading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookConnection;
