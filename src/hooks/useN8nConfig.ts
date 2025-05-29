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

      const { data: adminResult, error } = await supabase
        .rpc('is_admin', { user_id: user.id });

      if (!error) {
        setIsAdmin(adminResult || false);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
      setIsAdmin(false);
    }
  };

  const fetchWebhookUrls = async () => {
    setIsLoading(true);
    try {
      // Fetch admin-controlled webhooks (everyone can see these)
      const { data: adminWebhooks, error: adminError } = await supabase
        .from('webhook_configs')
        .select('type, url')
        .eq('admin_controlled', true)
        .eq('is_active', true);

      if (adminError) {
        console.error("Error fetching admin webhook configs:", adminError);
      }

      // Fetch user's personal webhooks
      const { data: { user } } = await supabase.auth.getUser();
      let userWebhooks: any[] = [];
      
      if (user) {
        const { data, error: userError } = await supabase
          .from('webhook_configs')
          .select('type, url')
          .eq('user_id', user.id)
          .eq('admin_controlled', false)
          .eq('is_active', true);

        if (userError) {
          console.error("Error fetching user webhook configs:", userError);
        } else {
          userWebhooks = data || [];
        }
      }

      const webhookMap = {
        keywordWebhook: '',
        contentWebhook: '',
        customKeywordsWebhook: '',
        contentAdjustmentWebhook: ''
      };

      // Prioritize admin webhooks, fallback to user webhooks
      const allWebhooks = [...(adminWebhooks || []), ...userWebhooks];
      
      allWebhooks.forEach(config => {
        switch (config.type) {
          case 'keywords':
            if (!webhookMap.keywordWebhook) webhookMap.keywordWebhook = config.url;
            break;
          case 'content':
            if (!webhookMap.contentWebhook) webhookMap.contentWebhook = config.url;
            break;
          case 'custom-keywords':
            if (!webhookMap.customKeywordsWebhook) webhookMap.customKeywordsWebhook = config.url;
            break;
          case 'content-adjustment':
            if (!webhookMap.contentAdjustmentWebhook) webhookMap.contentAdjustmentWebhook = config.url;
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

  const saveWebhookUrl = async (url: string, type: 'keywords' | 'content' | 'custom-keywords' | 'content-adjustment' = 'keywords', asAdmin = false) => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Please sign in to save webhook configuration");
        setIsLoading(false);
        return false;
      }

      // If saving as admin, check admin status
      if (asAdmin && !isAdmin) {
        toast.error("Admin privileges required to save admin-controlled webhooks");
        setIsLoading(false);
        return false;
      }

      const webhookData = {
        user_id: asAdmin ? null : user.id,
        type: type,
        url: url,
        name: `${type.charAt(0).toUpperCase() + type.slice(1)} Webhook`,
        is_active: true,
        admin_controlled: asAdmin
      };

      // For admin webhooks, use a different conflict resolution
      const conflictColumns = asAdmin ? 'type, admin_controlled' : 'user_id, type, admin_controlled';

      const { error } = await supabase
        .from('webhook_configs')
        .upsert(webhookData, {
          onConflict: conflictColumns
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

      const webhookScope = asAdmin ? "Admin" : "User";
      toast.success(`${webhookScope} ${type.charAt(0).toUpperCase() + type.slice(1)} webhook saved successfully`);
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
