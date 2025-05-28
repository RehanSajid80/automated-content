
import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Webhook } from "lucide-react";
import { useN8nConfig } from "@/hooks/useN8nConfig";
import { toast } from "sonner";
import { WebhookTypeSelector } from "./webhook/WebhookTypeSelector";
import { WebhookUrlInput } from "./webhook/WebhookUrlInput";
import { WebhookStatusBadge } from "./webhook/WebhookStatusBadge";
import { WebhookActions } from "./webhook/WebhookActions";

interface WebhookConnectionProps {
  onSaveWebhook?: () => void;
  activeWebhookType?: 'keywords' | 'content' | 'custom-keywords' | 'content-adjustment';
  onWebhookTypeChange?: (type: 'keywords' | 'content' | 'custom-keywords' | 'content-adjustment') => void;
}

const WebhookConnection: React.FC<WebhookConnectionProps> = ({
  onSaveWebhook,
  onWebhookTypeChange,
  activeWebhookType = 'content' // Default to content for AI Content Suggestions
}) => {
  const { 
    getWebhookUrl, 
    getContentWebhookUrl,
    getCustomKeywordsWebhookUrl,
    getContentAdjustmentWebhookUrl,
    saveWebhookUrl, 
    isLoading, 
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
    if (activeWebhookType === 'keywords') {
      setStatus(keywordWebhookUrl ? 'connected' : 'disconnected');
    } else if (activeWebhookType === 'content') {
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
    
    if (activeWebhookType === 'keywords' && webhookUrl) {
      await saveWebhookUrl(webhookUrl);
      setStatus('connected');
    } else if (activeWebhookType === 'content' && contentWebhookUrl) {
      await saveWebhookUrl(contentWebhookUrl, 'content');
      setStatus('connected');
      toast.success("AI Content Suggestions webhook configured successfully");
    } else if (activeWebhookType === 'custom-keywords' && customKeywordsWebhookUrl) {
      await saveWebhookUrl(customKeywordsWebhookUrl, 'custom-keywords');
      setStatus('connected');
    } else if (activeWebhookType === 'content-adjustment' && contentAdjustmentWebhookUrl) {
      await saveWebhookUrl(contentAdjustmentWebhookUrl, 'content-adjustment');
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Webhook Integration
          <WebhookStatusBadge status={status} />
        </CardTitle>
        <CardDescription>
          Connect your content generation system to n8n.io workflows for automation.
          {activeWebhookType === 'content' && " Configure the AI Content Suggestions webhook here."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
