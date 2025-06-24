
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { WebhookType, WebhookConfig } from "./types";

export const saveWebhookUrl = async (
  url: string, 
  type: WebhookType = 'keywords', 
  asAdmin = false
): Promise<boolean> => {
  if (!url || url.trim() === '') {
    toast.error("Webhook URL cannot be empty");
    return false;
  }

  // Validate URL format
  try {
    new URL(url);
  } catch {
    toast.error("Please enter a valid URL");
    return false;
  }

  try {
    // Try to save to database
    try {
      // Use both new and legacy fields to ensure compatibility
      const webhookData = {
        type: type,
        url: url,
        webhook_type: type === 'keywords' ? 'keyword-sync' : type,
        webhook_url: url,
        is_global: true,
        is_active: true
      };

      const { error } = await supabase
        .from('webhook_configs')
        .upsert(webhookData);

      if (error) {
        console.error("Error saving webhook URL:", error);
        throw new Error('Failed to save webhook configuration');
      }
    } catch (dbError) {
      console.error('Webhook configs table not available:', dbError);
      throw new Error('Database not available for webhook storage');
    }

    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} webhook saved successfully`);
    return true;
  } catch (error) {
    console.error("Error saving webhook URL:", error);
    toast.error("Failed to save webhook configuration");
    return false;
  }
};

export const updateLocalStorageWebhooks = (webhooks: WebhookConfig): void => {
  try {
    localStorage.setItem('webhook-configs', JSON.stringify(webhooks));
  } catch (error) {
    console.error("Error updating localStorage:", error);
  }
};
