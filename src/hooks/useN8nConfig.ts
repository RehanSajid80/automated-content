
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useN8nConfig = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [webhooks, setWebhooks] = useState({
    keywordWebhook: '',
    contentWebhook: '',
    customKeywordsWebhook: '',
    contentAdjustmentWebhook: ''
  });

  useEffect(() => {
    checkAdminStatus();
    fetchWebhookUrls();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }

      // For now, set admin to false. Can be implemented later with proper admin logic
      setIsAdmin(false);
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  const fetchWebhookUrls = async () => {
    setIsLoading(true);
    try {
      // Check if webhook_configs table is available
      const { error: testError } = await supabase
        .from('webhook_configs')
        .select('id')
        .limit(1);

      if (!testError) {
        // Fetch global webhooks from database
        const { data: globalWebhooks, error } = await supabase
          .from('webhook_configs')
          .select('webhook_type, webhook_url')
          .eq('is_active', true);

        if (error) {
          console.error("Error fetching webhook configs:", error);
          loadFromLocalStorage();
          return;
        }

        const webhookMap = {
          keywordWebhook: '',
          contentWebhook: '',
          customKeywordsWebhook: '',
          contentAdjustmentWebhook: ''
        };

        globalWebhooks?.forEach(config => {
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
        
        // Also save to localStorage for offline access
        localStorage.setItem('webhook-configs', JSON.stringify(webhookMap));
      } else {
        console.log('Webhook configs table not available, using localStorage');
        loadFromLocalStorage();
      }
      
    } catch (error) {
      console.error("Error fetching webhook URLs:", error);
      loadFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromLocalStorage = () => {
    try {
      const saved = localStorage.getItem('webhook-configs');
      if (saved) {
        setWebhooks(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error loading from localStorage:", error);
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

  const saveWebhookUrl = async (url: string, type: 'keywords' | 'content' | 'custom-keywords' | 'content-adjustment' = 'keywords', asAdmin = false) => {
    setIsLoading(true);
    try {
      // Check if webhook_configs table is available
      const { error: testError } = await supabase
        .from('webhook_configs')
        .select('id')
        .limit(1);

      if (!testError) {
        // Check if webhook of this type already exists
        const { data: existingWebhook, error: fetchError } = await supabase
          .from('webhook_configs')
          .select('id')
          .eq('webhook_type', type)
          .eq('is_active', true)
          .maybeSingle();

        if (fetchError) {
          console.error("Error checking existing webhook:", fetchError);
          toast.error("Failed to check existing webhook configuration");
          return false;
        }

        let result;
        if (existingWebhook) {
          // Update existing webhook
          result = await supabase
            .from('webhook_configs')
            .update({
              webhook_url: url,
              updated_at: new Date().toISOString()
            })
            .eq('id', existingWebhook.id);
        } else {
          // Insert new webhook
          result = await supabase
            .from('webhook_configs')
            .insert({
              webhook_type: type,
              webhook_url: url,
              is_active: true
            });
        }

        if (result.error) {
          console.error("Error saving webhook URL:", result.error);
          toast.error("Failed to save webhook configuration");
          return false;
        }
      } else {
        console.log('Webhook configs table not available, saving to localStorage only');
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
        
        // Save to localStorage as backup
        localStorage.setItem('webhook-configs', JSON.stringify(updated));
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
    isAdmin,
    webhooks,
    fetchWebhookUrls,
    getWebhookUrl,
    getContentWebhookUrl,
    getCustomKeywordsWebhookUrl,
    getContentAdjustmentWebhookUrl,
    saveWebhookUrl
  };
};
