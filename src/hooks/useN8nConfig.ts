
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

      // Try to call is_admin function if it exists
      try {
        const { data: adminResult, error } = await supabase.rpc('is_admin', { 
          user_id: user.id 
        });
        
        if (!error) {
          setIsAdmin(adminResult || false);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.log("is_admin function not available, defaulting to false");
        setIsAdmin(false);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  const fetchWebhookUrls = async () => {
    setIsLoading(true);
    try {
      // Try to fetch global webhooks from database
      try {
        const { data: globalWebhooks, error } = await supabase
          .from('webhook_configs')
          .select('type, url')
          .eq('is_active', true);

        if (!error && globalWebhooks) {
          const webhookMap = {
            keywordWebhook: '',
            contentWebhook: '',
            customKeywordsWebhook: '',
            contentAdjustmentWebhook: ''
          };

          globalWebhooks.forEach((config: any) => {
            switch (config.type) {
              case 'keywords':
                webhookMap.keywordWebhook = config.url;
                break;
              case 'content':
                webhookMap.contentWebhook = config.url;
                break;
              case 'custom-keywords':
                webhookMap.customKeywordsWebhook = config.url;
                break;
              case 'content-adjustment':
                webhookMap.contentAdjustmentWebhook = config.url;
                break;
            }
          });

          setWebhooks(webhookMap);
          
          // Also save to localStorage for offline access
          localStorage.setItem('webhook-configs', JSON.stringify(webhookMap));
        } else {
          loadFromLocalStorage();
        }
      } catch (dbError) {
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
      // Try to save to database
      try {
        const { error } = await supabase
          .from('webhook_configs')
          .upsert({
            type: type,
            url: url,
            is_global: true,
            is_active: true
          });

        if (error) {
          console.error("Error saving webhook URL:", error);
        }
      } catch (dbError) {
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
