
export interface WebhookConfig {
  keywordWebhook: string;
  contentWebhook: string;
  customKeywordsWebhook: string;
  contentAdjustmentWebhook: string;
}

export type WebhookType = 'keywords' | 'content' | 'custom-keywords' | 'content-adjustment';
