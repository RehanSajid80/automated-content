
export interface N8nAgentPayload {
  keywords?: any[];
  topicArea?: string;
  targetUrl?: string;
  url?: string;
  requestType?: 'contentSuggestions' | 'keywordAnalysis' | 'customKeywords' | 'contentAdjustment' | 'contentGeneration';
  contentType?: string;
  chatHistory?: any[];
  currentInstruction?: string;
  currentImageUrl?: string;
  customPayload?: any;
  output_format?: any;
  customKeywords?: string[];
  contentData?: any;
  persona?: string;
  goal?: string;
  context?: any;
}

export interface WebhookPayload {
  keywords?: any[];
  topicArea?: string;
  targetUrl?: string;
  url?: string;
  requestType?: 'contentSuggestions' | 'keywordAnalysis' | 'customKeywords' | 'contentAdjustment' | 'contentGeneration';
  contentType?: string;
  chatHistory?: any[];
  currentInstruction?: string;
  currentImageUrl?: string;
  customPayload?: any;
  output_format?: any;
  customKeywords?: string[];
  contentData?: any;
  persona?: string;
  goal?: string;
  context?: any;
}

export interface N8nAgentResponse {
  success?: boolean;
  suggestions?: any[];
  content: any[];
  title: string;
  rawResponse?: any;
  error?: string;
}

export interface N8nAgentState {
  isLoading: boolean;
  error: string | null;
  suggestions: any[];
  generatedContent: any[];
  contentTitle: string;
  rawResponse: any;
}
