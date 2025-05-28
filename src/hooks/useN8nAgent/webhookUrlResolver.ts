
/**
 * Utility for resolving the correct webhook URL based on request type
 */

interface WebhookUrls {
  getWebhookUrl: () => string;
  getContentWebhookUrl: () => string;
  getCustomKeywordsWebhookUrl: () => string;
  getContentAdjustmentWebhookUrl: () => string;
}

export const resolveWebhookUrl = (
  payload: any,
  webhookUrls: WebhookUrls,
  webhookOption?: boolean | string,
  customWebhookUrl?: string
): string => {
  // Determine which webhook to use based on request type or explicit option
  let webhookUrl = '';
  
  if (customWebhookUrl) {
    webhookUrl = customWebhookUrl;
  } else if (payload.requestType === 'customKeywords') {
    webhookUrl = webhookUrls.getCustomKeywordsWebhookUrl();
  } else if (payload.requestType === 'contentSuggestions') {
    // Always use content webhook for AI content suggestions
    webhookUrl = webhookUrls.getContentWebhookUrl();
  } else if (payload.requestType === 'contentAdjustment') {
    webhookUrl = webhookUrls.getContentAdjustmentWebhookUrl();
  } else if (typeof webhookOption === 'string') {
    // Use specific webhook type
    if (webhookOption === 'content') {
      webhookUrl = webhookUrls.getContentWebhookUrl();
    } else if (webhookOption === 'custom-keywords') {
      webhookUrl = webhookUrls.getCustomKeywordsWebhookUrl();
    } else if (webhookOption === 'content-adjustment') {
      webhookUrl = webhookUrls.getContentAdjustmentWebhookUrl();
    } else {
      webhookUrl = webhookUrls.getWebhookUrl();
    }
  } else {
    // Default to keyword webhook
    webhookUrl = webhookUrls.getWebhookUrl();
  }
  
  return webhookUrl;
};
