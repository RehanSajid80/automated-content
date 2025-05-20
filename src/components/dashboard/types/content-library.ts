
import { ContentTypeConfig } from "./recent-content";

export interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  topic_area: string | null;
  created_at: string;
  updated_at: string;
  keywords: string[];
  is_saved: boolean;
}

export interface ContentLibraryProps {
  className?: string;
}

export interface ContentFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export interface ContentTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  contentTypes: Array<{ id: string; label: string }>;
}

export interface ContentGridProps {
  items: ContentItem[];
  isLoading: boolean;
  copyContent: (contentId: string) => Promise<void>;
  viewContent: (contentId: string, topicArea: string) => void;
}
