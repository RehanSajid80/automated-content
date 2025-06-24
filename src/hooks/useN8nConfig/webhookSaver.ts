
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
    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      try {
        // Use both new and legacy fields to ensure compatibility
        const webhookData = {
          type: type,
          url: url,
          webhook_type: type === 'keywords' ? 'keyword-sync' : type,
          webhook_url: url,
          is_global: asAdmin,
          is_active: true
        };

        // First try to update existing webhook of this type
        const { data: existing } = await supabase
          .from('webhook_configs')
          .select('id')
          .eq('type', type)
          .eq('is_active', true)
          .maybeSingle();

        if (existing) {
          // Update existing webhook
          const { error } = await supabase
            .from('webhook_configs')
            .update(webhookData)
            .eq('id', existing.id);

          if (error) {
            console.error("Error updating webhook URL:", error);
            throw new Error('Failed to update webhook configuration');
          }
        } else {
          // Insert new webhook
          const { error } = await supabase
            .from('webhook_configs')
            .insert(webhookData);

          if (error) {
            console.error("Error saving webhook URL:", error);
            throw new Error('Failed to save webhook configuration');
          }
        }

        console.log(`Saved ${type} webhook to database:`, url);
      } catch (dbError) {
        console.error('Database save failed, falling back to localStorage:', dbError);
        // Fallback to localStorage if database fails
        saveToLocalStorage(url, type);
      }
    } else {
      console.log('User not authenticated, saving to localStorage only');
      saveToLocalStorage(url, type);
    }

    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} webhook saved successfully`);
    return true;
  } catch (error) {
    console.error("Error saving webhook URL:", error);
    toast.error("Failed to save webhook configuration");
    return false;
  }
};

const saveToLocalStorage = (url: string, type: WebhookType) => {
  try {
    const saved = localStorage.getItem('webhook-configs');
    let webhooks = saved ? JSON.parse(saved) : {};
    
    switch (type) {
      case 'keywords':
        webhooks.keywordWebhook = url;
        break;
      case 'content':
        webhooks.contentWebhook = url;
        break;
      case 'custom-keywords':
        webhooks.customKeywordsWebhook = url;
        break;
      case 'content-adjustment':
        webhooks.contentAdjustmentWebhook = url;
        break;
    }
    
    localStorage.setItem('webhook-configs', JSON.stringify(webhooks));
    console.log(`Saved ${type} webhook to localStorage:`, url);
  } catch (error) {
    console.error("Error saving to localStorage:", error);
  }
};

export const updateLocalStorageWebhooks = (webhooks: WebhookConfig): void => {
  try {
    localStorage.setItem('webhook-configs', JSON.stringify(webhooks));
  } catch (error) {
    console.error("Error updating localStorage:", error);
  }
};
