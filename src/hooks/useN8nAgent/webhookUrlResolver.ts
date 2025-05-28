
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
  
  console.log("Resolving webhook URL for payload:", payload);
  console.log("Webhook option:", webhookOption);
  console.log("Custom webhook URL:", customWebhookUrl);
  
  if (customWebhookUrl) {
    webhookUrl = customWebhookUrl;
    console.log("Using custom webhook URL:", webhookUrl);
  } else if (payload.requestType === 'customKeywords') {
    webhookUrl = webhookUrls.getCustomKeywordsWebhookUrl();
    console.log("Using custom keywords webhook:", webhookUrl);
  } else if (payload.requestType === 'contentSuggestions') {
    // Always use content webhook for AI content suggestions
    webhookUrl = webhookUrls.getContentWebhookUrl();
    console.log("Using content webhook for content suggestions:", webhookUrl);
  } else if (payload.requestType === 'contentAdjustment') {
    webhookUrl = webhookUrls.getContentAdjustmentWebhookUrl();
    console.log("Using content adjustment webhook:", webhookUrl);
  } else if (typeof webhookOption === 'string') {
    // Use specific webhook type
    if (webhookOption === 'content') {
      webhookUrl = webhookUrls.getContentWebhookUrl();
      console.log("Using content webhook via option:", webhookUrl);
    } else if (webhookOption === 'custom-keywords') {
      webhookUrl = webhookUrls.getCustomKeywordsWebhookUrl();
      console.log("Using custom keywords webhook via option:", webhookUrl);
    } else if (webhookOption === 'content-adjustment') {
      webhookUrl = webhookUrls.getContentAdjustmentWebhookUrl();
      console.log("Using content adjustment webhook via option:", webhookUrl);
    } else {
      webhookUrl = webhookUrls.getWebhookUrl();
      console.log("Using default keywords webhook via option:", webhookUrl);
    }
  } else {
    // Default to keyword webhook
    webhookUrl = webhookUrls.getWebhookUrl();
    console.log("Using default keywords webhook:", webhookUrl);
  }
  
  console.log("Final resolved webhook URL:", webhookUrl);
  return webhookUrl;
};
