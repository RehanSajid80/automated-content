
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("No authenticated user found");
        setIsLoading(false);
        return;
      }

      const { data: webhookConfigs, error } = await supabase
        .from('webhook_configs')
        .select('webhook_type, webhook_url')
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) {
        console.error("Error fetching webhook configs:", error);
        toast.error("Failed to load webhook configurations");
        setIsLoading(false);
        return;
      }

      const webhookMap = {
        keywordWebhook: '',
        contentWebhook: '',
        customKeywordsWebhook: '',
        contentAdjustmentWebhook: ''
      };

      webhookConfigs?.forEach(config => {
        switch (config.webhook_type) {
          case 'keywords':
            webhookMap.keywordWebhook = config.webhook_url;
            break;
          case 'content':
            webhookMap.contentWebhook = config.webhook_url;
            break;
          case 'custom-keywords':
            webhookMap.customKeywordsWebhook = config.webhook_url;
            break;
          case 'content-adjustment':
            webhookMap.contentAdjustmentWebhook = config.webhook_url;
            break;
        }
      });

      setWebhooks(webhookMap);
      
    } catch (error) {
      console.error("Error fetching webhook URLs:", error);
      toast.error("Failed to load webhook configurations");
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save webhook configuration");
        setIsLoading(false);
        return false;
      }

      // Upsert webhook configuration
      const { error } = await supabase
        .from('webhook_configs')
        .upsert({
          user_id: user.id,
          webhook_type: type,
          webhook_url: url,
          name: `${type.charAt(0).toUpperCase() + type.slice(1)} Webhook`,
          is_active: true
        }, {
          onConflict: 'user_id, webhook_type'
        });

      if (error) {
        console.error("Error saving webhook URL:", error);
        toast.error("Failed to save webhook configuration");
        return false;
      }

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
        return updated;
      });

      toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} webhook saved successfully`);
      return true;
    } catch (error) {
      console.error("Error saving webhook URL:", error);
      toast.error("Failed to save webhook configuration");
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
