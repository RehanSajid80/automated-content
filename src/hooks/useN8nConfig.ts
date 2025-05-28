
// Implementing this file based on how the hooks are likely structured in your project

import { useState, useEffect } from "react";

export const useN8nConfig = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [webhooks, setWebhooks] = useState({
    keywordWebhook: '',
    contentWebhook: '',
    customKeywordsWebhook: '',
    contentAdjustmentWebhook: ''
  });

  useEffect(() => {
    fetchWebhookUrls();
  }, []);

  const fetchWebhookUrls = async () => {
    setIsLoading(true);
    try {
      const keywordWebhook = localStorage.getItem('n8n-webhook-url') || '';
      const contentWebhook = localStorage.getItem('n8n-content-webhook-url') || '';
      const customKeywordsWebhook = localStorage.getItem('n8n-custom-keywords-webhook-url') || '';
      const contentAdjustmentWebhook = localStorage.getItem('n8n-content-adjustment-webhook-url') || '';
      
      setWebhooks({
        keywordWebhook,
        contentWebhook,
        customKeywordsWebhook,
        contentAdjustmentWebhook
      });
      
    } catch (error) {
      console.error("Error fetching webhook URLs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWebhookUrl = () => {
    return webhooks.keywordWebhook;
  };

  const getContentWebhookUrl = () => {
    return webhooks.contentWebhook;
  };
  
  const getCustomKeywordsWebhookUrl = () => {
    return webhooks.customKeywordsWebhook;
  };

  const getContentAdjustmentWebhookUrl = () => {
    return webhooks.contentAdjustmentWebhook;
  };

  const saveWebhookUrl = async (url: string, type: 'keywords' | 'content' | 'custom-keywords' | 'content-adjustment' = 'keywords') => {
    setIsLoading(true);
    try {
      if (type === 'content') {
        localStorage.setItem('n8n-content-webhook-url', url);
        setWebhooks(prev => ({ ...prev, contentWebhook: url }));
      } else if (type === 'custom-keywords') {
        localStorage.setItem('n8n-custom-keywords-webhook-url', url);
        setWebhooks(prev => ({ ...prev, customKeywordsWebhook: url }));
      } else if (type === 'content-adjustment') {
        localStorage.setItem('n8n-content-adjustment-webhook-url', url);
        setWebhooks(prev => ({ ...prev, contentAdjustmentWebhook: url }));
      } else {
        localStorage.setItem('n8n-webhook-url', url);
        setWebhooks(prev => ({ ...prev, keywordWebhook: url }));
      }
      return true;
    } catch (error) {
      console.error("Error saving webhook URL:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    webhooks,
    fetchWebhookUrls,
    getWebhookUrl,
    getContentWebhookUrl,
    getCustomKeywordsWebhookUrl,
    getContentAdjustmentWebhookUrl,
    saveWebhookUrl
  };
};
