
/**
 * This hook manages webhook URL configuration for n8n integrations.
 */
export const useN8nConfig = () => {
  /**
   * Gets the webhook URL from local storage
   * Checks multiple storage keys for backward compatibility
   */
  const getWebhookUrl = (): string => {
    const storedWebhookUrl = localStorage.getItem("n8n-webhook-url") || 
                             localStorage.getItem("semrush-webhook-url");
    
    return storedWebhookUrl || "https://officespacesoftware.app.n8n.cloud/webhook/sync-keywords";
  };

  /**
   * Saves a webhook URL to local storage
   */
  const saveWebhookUrl = (url: string): void => {
    localStorage.setItem("n8n-webhook-url", url);
  };

  return {
    getWebhookUrl,
    saveWebhookUrl
  };
};
