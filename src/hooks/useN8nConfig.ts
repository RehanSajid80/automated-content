
import { useState, useEffect } from "react";
import { checkAdminStatus } from "./useN8nConfig/adminStatusChecker";
import { fetchWebhookUrls } from "./useN8nConfig/webhookFetcher";
import { saveWebhookUrl as saveWebhookUrlUtil, updateLocalStorageWebhooks } from "./useN8nConfig/webhookSaver";
import { WebhookConfig, WebhookType } from "./useN8nConfig/types";

export const useN8nConfig = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [webhooks, setWebhooks] = useState<WebhookConfig>({
    keywordWebhook: '',
    contentWebhook: '',
    customKeywordsWebhook: '',
    contentAdjustmentWebhook: ''
  });

  useEffect(() => {
    initializeConfig();
  }, []);

  const initializeConfig = async () => {
    await checkAdminStatusAndUpdate();
    await fetchWebhookUrlsAndUpdate();
  };

  const checkAdminStatusAndUpdate = async () => {
    const adminStatus = await checkAdminStatus();
    setIsAdmin(adminStatus);
  };

  const fetchWebhookUrlsAndUpdate = async () => {
    setIsLoading(true);
    try {
      const fetchedWebhooks = await fetchWebhookUrls();
      setWebhooks(fetchedWebhooks);
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

  const saveWebhookUrl = async (
    url: string, 
    type: WebhookType = 'keywords', 
    asAdmin = false
  ): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const success = await saveWebhookUrlUtil(url, type, asAdmin);
      
      if (success) {
        // Update local state
        setWebhooks(prev => {
          const updated = { ...prev };
          switch (type) {
            case 'keywords':
              updated.keywordWebhook = url;
              break;
            case 'content':
              updated.contentWebhook = url;
              break;
            case 'custom-keywords':
              updated.customKeywordsWebhook = url;
              break;
            case 'content-adjustment':
              updated.contentAdjustmentWebhook = url;
              break;
          }
          
          // Save to localStorage as backup
          updateLocalStorageWebhooks(updated);
          return updated;
        });
      }
      
      return success;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isAdmin,
    webhooks,
    fetchWebhookUrls: fetchWebhookUrlsAndUpdate,
    getWebhookUrl,
    getContentWebhookUrl,
    getCustomKeywordsWebhookUrl,
    getContentAdjustmentWebhookUrl,
    saveWebhookUrl
  };
};
