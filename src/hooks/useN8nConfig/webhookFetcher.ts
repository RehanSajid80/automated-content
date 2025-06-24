
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
    console.log('🌐 Fetching global webhook configurations...');
    
    // Fetch global webhooks from database (no authentication required)
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

      console.log('✅ Loaded global webhooks from database:', webhookMap);
      return webhookMap;
    } else if (error) {
      console.error('❌ Database error fetching webhooks:', error);
    } else {
      console.log('⚠️ No global webhooks found in database');
    }
    
    // Fallback to localStorage only if database fails or is empty
    return loadFromLocalStorage();
    
  } catch (error) {
    console.error("❌ Error fetching global webhook URLs:", error);
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
      console.log('✅ Loaded webhooks from localStorage fallback:', parsed);
      return parsed;
    }
  } catch (error) {
    console.error("❌ Error loading from localStorage:", error);
  }
  
  return defaultWebhooks;
};
