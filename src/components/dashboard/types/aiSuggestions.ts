
import { KeywordData } from "@/utils/excelUtils";

export interface AISuggestion {
  id: string;
  title: string;
  description: string;
  contentType: 'pillar' | 'support' | 'meta' | 'social';
  keywords: string[];
}

export interface AISuggestionsListProps {
  suggestions: AISuggestion[];
  onSelect: (suggestion: AISuggestion) => void;
  isLoading?: boolean;
}

export interface ContentSuggestionsProps {
  keywords: KeywordData[];
  className?: string;
}

export interface AIContentGeneratorProps {
  keywords: KeywordData[];
  topicArea: string;
  onSuggestionSelect: (suggestion: AISuggestion) => void;
  isLoading: boolean;
}
