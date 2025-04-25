
export interface ContentType {
  id: string;
  name: string;
  description: string;
}

export const contentTypes: ContentType[] = [
  {
    id: "pillar",
    name: "Pillar Content",
    description: "Comprehensive, authoritative content (2000+ words)"
  },
  {
    id: "support",
    name: "Support Pages",
    description: "Helpful guides and documentation (800-1500 words)"
  },
  {
    id: "meta",
    name: "Meta Tags",
    description: "SEO-optimized titles and descriptions"
  },
  {
    id: "social",
    name: "Social Posts",
    description: "Engaging platform-specific social content"
  }
];
