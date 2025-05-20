/**
 * This hook manages webhook URL configuration for n8n integrations.
 */
export const useN8nConfig = () => {
  /**
   * Gets the webhook URL from local storage
   * Checks multiple storage keys for backward compatibility
   */
  const getWebhookUrl = (type?: string): string => {
    // Get content webhook specifically if type is content
    if (type === 'content') {
      const contentWebhookUrl = localStorage.getItem("n8n-content-webhook-url");
      if (contentWebhookUrl) return contentWebhookUrl;
    }
    
    // Otherwise get the general webhook URL
    const storedWebhookUrl = localStorage.getItem("n8n-webhook-url") || 
                             localStorage.getItem("semrush-webhook-url");
    
    return storedWebhookUrl || "https://officespacesoftware.app.n8n.cloud/webhook/sync-keywords";
  };

  /**
   * Gets the content generation webhook URL
   */
  const getContentWebhookUrl = (): string => {
    const contentUrl = localStorage.getItem("n8n-content-webhook-url");
    return contentUrl || "https://analyzelens.app.n8n.cloud/webhook/d9b7f2f7-1140-48a6-85dc-aee39fc6e5b4";
  };

  /**
   * Saves a webhook URL to local storage
   */
  const saveWebhookUrl = (url: string, type?: string): void => {
    if (type === 'content') {
      localStorage.setItem("n8n-content-webhook-url", url);
    } else {
      localStorage.setItem("n8n-webhook-url", url);
    }
  };

  return {
    getWebhookUrl,
    getContentWebhookUrl,
    saveWebhookUrl
  };
};
