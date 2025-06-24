
import { supabase } from "@/integrations/supabase/client";

export const resolveWebhookUrl = async (webhookType?: 'keywords' | 'content' | 'custom-keywords' | 'content-adjustment'): Promise<string> => {
  try {
    // Default to 'content' if no type specified
    const targetType = webhookType || 'content';

    // Try to get global webhook from database first
    try {
      const { data: globalWebhooks, error } = await supabase.rpc('exec_sql', {
        sql: `
          SELECT url as webhook_url 
          FROM webhook_configs 
          WHERE type = $1 AND is_active = true 
          ORDER BY created_at DESC 
          LIMIT 1
        `,
        params: [targetType]
      });

      if (!error && globalWebhooks && globalWebhooks.length > 0) {
        const webhookUrl = globalWebhooks[0].webhook_url;
        console.log(`Using global ${targetType} webhook:`, webhookUrl);
        return webhookUrl;
      }
    } catch (dbError) {
      console.error(`Error fetching global ${targetType} webhook:`, dbError);
    }

    // Fallback to localStorage if database is unavailable
    try {
      const saved = localStorage.getItem('webhook-configs');
      if (saved) {
        const webhooks = JSON.parse(saved);
        const urlKey = getUrlKey(targetType);
        if (webhooks[urlKey]) {
          console.log(`Using localStorage ${targetType} webhook:`, webhooks[urlKey]);
          return webhooks[urlKey];
        }
      }
    } catch (localStorageError) {
      console.error("Error reading from localStorage:", localStorageError);
    }

    console.warn(`No ${targetType} webhook found, using fallback`);
    return getFallbackWebhook(targetType);

  } catch (error) {
    console.error("Error resolving webhook URL:", error);
    return getFallbackWebhook(webhookType || 'content');
  }
};

const getUrlKey = (type: string): string => {
  switch (type) {
    case 'content':
      return 'contentWebhook';
    case 'custom-keywords':
      return 'customKeywordsWebhook';
    case 'content-adjustment':
      return 'contentAdjustmentWebhook';
    case 'keywords':
    default:
      return 'keywordWebhook';
  }
};

const getFallbackWebhook = (type: string): string => {
  switch (type) {
    case 'content':
      return 'https://officespacesoftware.app.n8n.cloud/webhook/AI-Content-Suggestions';
    case 'custom-keywords':
      return 'https://officespacesoftware.app.n8n.cloud/webhook/custom-keywords';
    case 'content-adjustment':
      return 'https://officespacesoftware.app.n8n.cloud/webhook/content-adjustment';
    case 'keywords':
    default:
      return 'https://officespacesoftware.app.n8n.cloud/webhook-test/sync-keywords';
  }
};
