
import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Webhook, Shield, Crown, Globe } from "lucide-react";
import { useN8nConfig } from "@/hooks/useN8nConfig";
import { toast } from "sonner";
import { WebhookTypeSelector } from "./webhook/WebhookTypeSelector";
import { WebhookUrlInput } from "./webhook/WebhookUrlInput";
import { WebhookStatusBadge } from "./webhook/WebhookStatusBadge";
import { WebhookActions } from "./webhook/WebhookActions";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WebhookConnectionProps {
  onSaveWebhook?: () => void;
  activeWebhookType?: 'content' | 'custom-keywords' | 'content-adjustment';
  onWebhookTypeChange?: (type: 'content' | 'custom-keywords' | 'content-adjustment') => void;
}

const WebhookConnection: React.FC<WebhookConnectionProps> = ({
  onSaveWebhook,
  onWebhookTypeChange,
  activeWebhookType = 'content'
}) => {
  const { 
    getWebhookUrl, 
    getContentWebhookUrl,
    getCustomKeywordsWebhookUrl,
    getContentAdjustmentWebhookUrl,
    saveWebhookUrl, 
    isLoading, 
    isAdmin,
    fetchWebhookUrls 
  } = useN8nConfig();
  
  const [webhookUrl, setWebhookUrl] = React.useState("");
  const [contentWebhookUrl, setContentWebhookUrl] = React.useState("");
  const [customKeywordsWebhookUrl, setCustomKeywordsWebhookUrl] = React.useState("");
  const [contentAdjustmentWebhookUrl, setContentAdjustmentWebhookUrl] = React.useState("");
  const [status, setStatus] = React.useState<'checking' | 'connected' | 'disconnected'>('checking');

  // Load webhook URLs on mount and when activeWebhookType changes
  useEffect(() => {
    loadWebhookUrls();
  }, [activeWebhookType]);
  
  const loadWebhookUrls = () => {
    const keywordWebhookUrl = getWebhookUrl();
    const contentGenUrl = getContentWebhookUrl();
    const customKeywordsUrl = getCustomKeywordsWebhookUrl();
    const contentAdjustmentUrl = getContentAdjustmentWebhookUrl();
    
    setWebhookUrl(keywordWebhookUrl);
    setContentWebhookUrl(contentGenUrl);
    setCustomKeywordsWebhookUrl(customKeywordsUrl);
    setContentAdjustmentWebhookUrl(contentAdjustmentUrl);
    
    // Set status based on active webhook type
    if (activeWebhookType === 'content') {
      setStatus(contentGenUrl ? 'connected' : 'disconnected');
    } else if (activeWebhookType === 'content-adjustment') {
      setStatus(contentAdjustmentUrl ? 'connected' : 'disconnected');
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
    
    if (activeWebhookType === 'content' && contentWebhookUrl) {
      const success = await saveWebhookUrl(contentWebhookUrl, 'content');
      setStatus(success ? 'connected' : 'disconnected');
    } else if (activeWebhookType === 'custom-keywords' && customKeywordsWebhookUrl) {
      const success = await saveWebhookUrl(customKeywordsWebhookUrl, 'custom-keywords');
      setStatus(success ? 'connected' : 'disconnected');
    } else if (activeWebhookType === 'content-adjustment' && contentAdjustmentWebhookUrl) {
      const success = await saveWebhookUrl(contentAdjustmentWebhookUrl, 'content-adjustment');
      setStatus(success ? 'connected' : 'disconnected');
    } else {
      toast.error("Please enter a valid webhook URL");
      setStatus('disconnected');
      return;
    }
    
    if (onSaveWebhook) {
      onSaveWebhook();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Global Webhook Integration
          <WebhookStatusBadge status={status} />
          <Globe className="h-4 w-4 text-blue-500" />
          {isAdmin && <Crown className="h-4 w-4 text-yellow-500" />}
        </CardTitle>
        <CardDescription>
          Configure global webhook integrations for n8n.io workflows. These settings are shared across all users of the application.
          {activeWebhookType === 'content' && " Configure the AI Content Suggestions webhook here."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Globe className="h-4 w-4" />
          <AlertDescription>
            <strong>Global Configuration:</strong> Webhook URLs saved here will be used by all users of this application. 
            Changes are automatically synchronized across all browser sessions.
          </AlertDescription>
        </Alert>

        {onWebhookTypeChange && (
          <WebhookTypeSelector 
            activeWebhookType={activeWebhookType} 
            onWebhookTypeChange={onWebhookTypeChange} 
          />
        )}

        {activeWebhookType === 'content' ? (
          <WebhookUrlInput
            type="content"
            value={contentWebhookUrl || ''}
            onChange={setContentWebhookUrl}
          />
        ) : activeWebhookType === 'custom-keywords' ? (
          <WebhookUrlInput
            type="custom-keywords"
            value={customKeywordsWebhookUrl || ''}
            onChange={setCustomKeywordsWebhookUrl}
          />
        ) : activeWebhookType === 'content-adjustment' ? (
          <WebhookUrlInput
            type="content-adjustment"
            value={contentAdjustmentWebhookUrl || ''}
            onChange={setContentAdjustmentWebhookUrl}
          />
        ) : (
          <WebhookUrlInput
            type="keywords"
            value={webhookUrl}
            onChange={setWebhookUrl}
          />
        )}
        <WebhookActions 
          onSave={handleSaveWebhook} 
          onRefresh={handleRefreshWebhooks} 
          isLoading={isLoading} 
          activeWebhookType={activeWebhookType}
        />
      </CardContent>
    </Card>
  );
};

export default WebhookConnection;
