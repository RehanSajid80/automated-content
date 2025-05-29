
import { supabase } from "@/integrations/supabase/client";

export const resolveWebhookUrl = async (webhookType?: 'keywords' | 'content' | 'custom-keywords' | 'content-adjustment'): Promise<string> => {
  try {
    // Default to 'content' if no type specified
    const targetType = webhookType || 'content';

    // First, try to get admin-controlled webhook (available to all users)
    const { data: adminWebhook, error: adminError } = await supabase
      .from('webhook_configs')
      .select('url')
      .eq('type', targetType)
      .eq('admin_controlled', true)
      .eq('is_active', true)
      .maybeSingle();

    if (adminError) {
      console.error(`Error fetching admin ${targetType} webhook:`, adminError);
    }

    if (adminWebhook?.url) {
      console.log(`Using admin-controlled ${targetType} webhook:`, adminWebhook.url);
      return adminWebhook.url;
    }

    // If no admin webhook, try to get user's personal webhook
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: userWebhook, error: userError } = await supabase
        .from('webhook_configs')
        .select('url')
        .eq('user_id', user.id)
        .eq('type', targetType)
        .eq('admin_controlled', false)
        .eq('is_active', true)
        .maybeSingle();

      if (userError) {
        console.error(`Error fetching user ${targetType} webhook:`, userError);
      }

      if (userWebhook?.url) {
        console.log(`Using user's ${targetType} webhook:`, userWebhook.url);
        return userWebhook.url;
      }
    }

    console.warn(`No ${targetType} webhook found, using fallback`);
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
