
interface ContentPayload {
  content_type: string;
  topic: string;
  goal: string;
  primary_keyword: string;
  related_keywords: string;
  long_tail_keywords: string;
  paa_questions: string;
  competitor_domains: string;
  competitor_structure: string;
  word_count: string;
  headings: string;
  tone: string;
  brand_voice: string;
  unique_points: string;
  internal_links: string;
  output_format?: any; // Adding this property to fix the type error
}

export const createContentPayload = (data: Partial<ContentPayload>): ContentPayload => {
  // Ensure all fields exist with defaults as empty strings
  return {
    content_type: data.content_type || "",
    topic: data.topic || "",
    goal: data.goal || "",
    primary_keyword: data.primary_keyword || "",
    related_keywords: data.related_keywords || "",
    long_tail_keywords: data.long_tail_keywords || "",
    paa_questions: data.paa_questions || "",
    competitor_domains: data.competitor_domains || "",
    competitor_structure: data.competitor_structure || "",
    word_count: data.word_count || "",
    headings: data.headings || "",
    tone: data.tone || "",
    brand_voice: data.brand_voice || "",
    unique_points: data.unique_points || "",
    internal_links: data.internal_links || "",
    output_format: data.output_format || undefined
  };
};

// This URL is now managed by useN8nConfig.ts hook
// The constant below is maintained for backward compatibility
export const CONTENT_WEBHOOK_URL = "https://analyzelens.app.n8n.cloud/webhook/d9b7f2f7-1140-48a6-85dc-aee39fc6e5b4";
