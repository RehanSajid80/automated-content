
import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Webhook, Shield, Crown } from "lucide-react";
import { useN8nConfig } from "@/hooks/useN8nConfig";
import { toast } from "sonner";
import { WebhookTypeSelector } from "./webhook/WebhookTypeSelector";
import { WebhookUrlInput } from "./webhook/WebhookUrlInput";
import { WebhookStatusBadge } from "./webhook/WebhookStatusBadge";
import { WebhookActions } from "./webhook/WebhookActions";
import { supabase } from "@/integrations/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface WebhookConnectionProps {
  onSaveWebhook?: () => void;
  activeWebhookType?: 'keywords' | 'content' | 'custom-keywords' | 'content-adjustment';
  onWebhookTypeChange?: (type: 'keywords' | 'content' | 'custom-keywords' | 'content-adjustment') => void;
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
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [saveAsAdmin, setSaveAsAdmin] = React.useState(false);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session?.user);
      if (session?.user) {
        fetchWebhookUrls();
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchWebhookUrls]);

  // Load webhook URLs on mount and when activeWebhookType changes
  useEffect(() => {
    if (isAuthenticated) {
      loadWebhookUrls();
    }
  }, [activeWebhookType, isAuthenticated]);
  
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
    if (!isAuthenticated) {
      toast.error("Please sign in to refresh webhook configurations");
      return;
    }
    
    setStatus('checking');
    await fetchWebhookUrls();
    loadWebhookUrls();
    toast.success("Webhook configurations refreshed");
  };

  const handleSaveWebhook = async () => {
    if (!isAuthenticated) {
      toast.error("Please sign in to save webhook configuration");
      return;
    }

    setStatus('checking');
    
    if (activeWebhookType === 'keywords' && webhookUrl) {
      const success = await saveWebhookUrl(webhookUrl, 'keywords', saveAsAdmin);
      setStatus(success ? 'connected' : 'disconnected');
    } else if (activeWebhookType === 'content' && contentWebhookUrl) {
      const success = await saveWebhookUrl(contentWebhookUrl, 'content', saveAsAdmin);
      setStatus(success ? 'connected' : 'disconnected');
    } else if (activeWebhookType === 'custom-keywords' && customKeywordsWebhookUrl) {
      const success = await saveWebhookUrl(customKeywordsWebhookUrl, 'custom-keywords', saveAsAdmin);
      setStatus(success ? 'connected' : 'disconnected');
    } else if (activeWebhookType === 'content-adjustment' && contentAdjustmentWebhookUrl) {
      const success = await saveWebhookUrl(contentAdjustmentWebhookUrl, 'content-adjustment', saveAsAdmin);
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

  if (!isAuthenticated) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Webhook className="h-5 w-5" />
            Webhook Integration
            <Shield className="h-4 w-4 text-amber-500" />
          </CardTitle>
          <CardDescription>
            Please sign in to configure your webhook integrations. Each user has their own secure webhook configurations.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Webhook className="h-5 w-5" />
          Webhook Integration
          <WebhookStatusBadge status={status} />
          <Shield className="h-4 w-4 text-green-500" />
          {isAdmin && <Crown className="h-4 w-4 text-yellow-500" />}
        </CardTitle>
        <CardDescription>
          Connect your content generation system to n8n.io workflows for automation.
          {isAdmin && " As an admin, you can configure webhooks for all users."}
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

        {isAdmin && (
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <Crown className="h-4 w-4 text-yellow-600" />
            <Switch
              id="admin-mode"
              checked={saveAsAdmin}
              onCheckedChange={setSaveAsAdmin}
            />
            <Label htmlFor="admin-mode" className="text-sm font-medium text-yellow-800">
              Save as admin-controlled webhook (available to all users)
            </Label>
          </div>
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
