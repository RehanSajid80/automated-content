
import { useState, useEffect } from "react";
import { useN8nConfig } from "@/hooks/useN8nConfig";

export const useWebhookManager = () => {
  const [activeWebhookType, setActiveWebhookType] = useState<'content' | 'custom-keywords' | 'content-adjustment'>('content');
  const [webhookStatus, setWebhookStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const { webhooks } = useN8nConfig();

  // Update webhook status based on type
  useEffect(() => {
    if (activeWebhookType === 'content') {
      setWebhookStatus(webhooks.contentWebhook ? 'connected' : 'disconnected');
    } else if (activeWebhookType === 'content-adjustment') {
      setWebhookStatus(webhooks.contentAdjustmentWebhook ? 'connected' : 'disconnected');
    } else {
      setWebhookStatus(webhooks.customKeywordsWebhook ? 'connected' : 'disconnected');
    }
  }, [activeWebhookType, webhooks]);

  const handleWebhookTypeChange = (type: 'content' | 'custom-keywords' | 'content-adjustment') => {
    setActiveWebhookType(type);
  };

  return {
    activeWebhookType,
    webhookStatus,
    handleWebhookTypeChange
  };
};
