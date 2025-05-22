import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

/**
 * This hook manages webhook URL configuration for n8n integrations.
 * It syncs with both localStorage and Supabase database.
 */
export const useN8nConfig = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [webhooks, setWebhooks] = useState<{
    keywordWebhook: string,
    contentWebhook: string
  }>({
    keywordWebhook: "",
    contentWebhook: ""
  });

  /**
   * Fetches webhook URLs from Supabase
   * Falls back to localStorage if Supabase fetch fails
   */
  const fetchWebhookUrls = async () => {
    setIsLoading(true);
    try {
      // Fetch webhooks from Supabase
      const { data: keywordWebhookData, error: keywordError } = await supabase
        .from('webhook_configs')
        .select('url')
        .eq('type', 'keyword-sync')
        .maybeSingle();

      const { data: contentWebhookData, error: contentError } = await supabase
        .from('webhook_configs')
        .select('url')
        .eq('type', 'content')
        .maybeSingle();

      // If Supabase fetch was successful, update state and localStorage
      if (!keywordError && keywordWebhookData) {
        localStorage.setItem("n8n-webhook-url", keywordWebhookData.url);
        setWebhooks(prev => ({ ...prev, keywordWebhook: keywordWebhookData.url }));
      }

      if (!contentError && contentWebhookData) {
        localStorage.setItem("n8n-content-webhook-url", contentWebhookData.url);
        setWebhooks(prev => ({ ...prev, contentWebhook: contentWebhookData.url }));
      }

      // If Supabase fetch had errors, try to load from localStorage
      if (keywordError || !keywordWebhookData) {
        const localKeywordUrl = localStorage.getItem("n8n-webhook-url") || 
                                localStorage.getItem("semrush-webhook-url");
        if (localKeywordUrl) {
          setWebhooks(prev => ({ ...prev, keywordWebhook: localKeywordUrl }));
        }
      }

      if (contentError || !contentWebhookData) {
        const localContentUrl = localStorage.getItem("n8n-content-webhook-url");
        if (localContentUrl) {
          setWebhooks(prev => ({ ...prev, contentWebhook: localContentUrl }));
        }
      }
    } catch (error) {
      console.error("Error fetching webhook URLs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load webhooks on initial mount
  useEffect(() => {
    fetchWebhookUrls();
  }, []);

  /**
   * Gets the webhook URL from state, or falls back to localStorage
   */
  const getWebhookUrl = (type?: string): string => {
    // Get content webhook specifically if type is content
    if (type === 'content') {
      if (webhooks.contentWebhook) return webhooks.contentWebhook;
      
      const contentWebhookUrl = localStorage.getItem("n8n-content-webhook-url");
      if (contentWebhookUrl) return contentWebhookUrl;
      
      return "https://analyzelens.app.n8n.cloud/webhook/d9b7f2f7-1140-48a6-85dc-aee39fc6e5b4";
    }
    
    // Otherwise get the general webhook URL
    if (webhooks.keywordWebhook) return webhooks.keywordWebhook;
    
    const storedWebhookUrl = localStorage.getItem("n8n-webhook-url") || 
                             localStorage.getItem("semrush-webhook-url");
    
    return storedWebhookUrl || "https://officespacesoftware.app.n8n.cloud/webhook/sync-keywords";
  };

  /**
   * Gets the content generation webhook URL
   */
  const getContentWebhookUrl = (): string => {
    if (webhooks.contentWebhook) return webhooks.contentWebhook;
    
    const contentUrl = localStorage.getItem("n8n-content-webhook-url");
    return contentUrl || "https://analyzelens.app.n8n.cloud/webhook/d9b7f2f7-1140-48a6-85dc-aee39fc6e5b4";
  };

  /**
   * Saves a webhook URL to both Supabase and localStorage
   */
  const saveWebhookUrl = async (url: string, type?: string): Promise<void> => {
    const webhookType = type === 'content' ? 'content' : 'keyword-sync';
    
    // Save to localStorage first (as a backup)
    if (type === 'content') {
      localStorage.setItem("n8n-content-webhook-url", url);
      setWebhooks(prev => ({ ...prev, contentWebhook: url }));
    } else {
      localStorage.setItem("n8n-webhook-url", url);
      setWebhooks(prev => ({ ...prev, keywordWebhook: url }));
    }
    
    try {
      // Check if webhook config already exists
      const { data: existingWebhook, error: fetchError } = await supabase
        .from('webhook_configs')
        .select('id')
        .eq('type', webhookType)
        .maybeSingle();
      
      if (fetchError) throw fetchError;
      
      if (existingWebhook) {
        // Update existing webhook
        const { error: updateError } = await supabase
          .from('webhook_configs')
          .update({ url, updated_at: new Date().toISOString() })
          .eq('id', existingWebhook.id);
          
        if (updateError) throw updateError;
      } else {
        // Insert new webhook
        const { error: insertError } = await supabase
          .from('webhook_configs')
          .insert([{ 
            url, 
            type: webhookType,
            is_active: true 
          }]);
          
        if (insertError) throw insertError;
      }
      
      toast.success(`${webhookType === 'content' ? 'Content' : 'Keyword'} webhook URL saved successfully`);
    } catch (error) {
      console.error("Error saving webhook to Supabase:", error);
      toast.error("Failed to save webhook URL to database. It's saved in your browser but may not persist across devices.");
    }
  };

  return {
    getWebhookUrl,
    getContentWebhookUrl,
    saveWebhookUrl,
    isLoading,
    webhooks,
    fetchWebhookUrls
  };
};
