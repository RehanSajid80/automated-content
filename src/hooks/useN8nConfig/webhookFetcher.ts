
import { supabase } from "@/integrations/supabase/client";
import { WebhookConfig } from "./types";

export const fetchWebhookUrls = async (): Promise<WebhookConfig> => {
  const defaultWebhooks: WebhookConfig = {
    keywordWebhook: '',
    contentWebhook: '',
    customKeywordsWebhook: '',
    contentAdjustmentWebhook: ''
  };

  try {
    // Try to fetch global webhooks from database
    try {
      const { data: globalWebhooks, error } = await supabase
        .from('webhook_configs')
        .select('type, url, webhook_type, webhook_url')
        .eq('is_active', true);

      if (!error && globalWebhooks) {
        const webhookMap = { ...defaultWebhooks };

        globalWebhooks.forEach((config: any) => {
          // Handle both new 'type' field and legacy 'webhook_type' field
          const webhookType = config.type || config.webhook_type;
          const webhookUrl = config.url || config.webhook_url;
          
          switch (webhookType) {
            case 'keywords':
            case 'keyword-sync':
              webhookMap.keywordWebhook = webhookUrl;
              break;
            case 'content':
              webhookMap.contentWebhook = webhookUrl;
              break;
            case 'custom-keywords':
              webhookMap.customKeywordsWebhook = webhookUrl;
              break;
            case 'content-adjustment':
              webhookMap.contentAdjustmentWebhook = webhookUrl;
              break;
          }
        });

        // Also save to localStorage for offline access
        localStorage.setItem('webhook-configs', JSON.stringify(webhookMap));
        return webhookMap;
      } else {
        return loadFromLocalStorage();
      }
    } catch (dbError) {
      console.error('Webhook configs table not available, using localStorage');
      return loadFromLocalStorage();
    }
    
  } catch (error) {
    console.error("Error fetching webhook URLs:", error);
    return loadFromLocalStorage();
  }
};

const loadFromLocalStorage = (): WebhookConfig => {
  const defaultWebhooks: WebhookConfig = {
    keywordWebhook: '',
    contentWebhook: '',
    customKeywordsWebhook: '',
    contentAdjustmentWebhook: ''
  };

  try {
    const saved = localStorage.getItem('webhook-configs');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error);
  }
  
  return defaultWebhooks;
};
