
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
