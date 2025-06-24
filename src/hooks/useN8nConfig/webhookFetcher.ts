
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
    // First check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Try to fetch user-specific or global webhooks from database
      try {
        const { data: webhookConfigs, error } = await supabase
          .from('webhook_configs')
          .select('type, url, webhook_type, webhook_url')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && webhookConfigs && webhookConfigs.length > 0) {
          const webhookMap = { ...defaultWebhooks };

          webhookConfigs.forEach((config: any) => {
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

          console.log('Loaded webhooks from database:', webhookMap);
          return webhookMap;
        }
      } catch (dbError) {
        console.error('Database error fetching webhooks, falling back to localStorage:', dbError);
      }
    } else {
      console.log('User not authenticated, using localStorage only');
    }
    
    // Fallback to localStorage for unauthenticated users or database errors
    return loadFromLocalStorage();
    
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
      const parsed = JSON.parse(saved);
      console.log('Loaded webhooks from localStorage:', parsed);
      return parsed;
    }
  } catch (error) {
    console.error("Error loading from localStorage:", error);
  }
  
  return defaultWebhooks;
};
