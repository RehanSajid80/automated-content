
export interface ContentItem {
  id: string;
  title: string;
  content_type: string;
  created_at: string;
  keywords: string[];
  views?: number;
}

export interface ContentTypeConfig {
  icon: JSX.Element;
  label: string;
  className: string;
}
