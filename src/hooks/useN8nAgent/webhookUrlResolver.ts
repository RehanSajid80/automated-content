
import { supabase } from "@/integrations/supabase/client";

export const resolveWebhookUrl = async (webhookType?: 'keywords' | 'content' | 'custom-keywords' | 'content-adjustment'): Promise<string> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.warn("No authenticated user found, using fallback webhook");
      return 'https://officespacesoftware.app.n8n.cloud/webhook-test/sync-keywords';
    }

    // Default to 'content' if no type specified
    const targetType = webhookType || 'content';

    const { data: webhookConfig, error } = await supabase
      .from('webhook_configs')
      .select('webhook_url')
      .eq('user_id', user.id)
      .eq('webhook_type', targetType)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching ${targetType} webhook:`, error);
      return getFallbackWebhook(targetType);
    }

    if (webhookConfig?.webhook_url) {
      console.log(`Using user's ${targetType} webhook:`, webhookConfig.webhook_url);
      return webhookConfig.webhook_url;
    }

    console.warn(`No ${targetType} webhook found for user, using fallback`);
    return getFallbackWebhook(targetType);

  } catch (error) {
    console.error("Error resolving webhook URL:", error);
    return getFallbackWebhook(webhookType || 'content');
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
