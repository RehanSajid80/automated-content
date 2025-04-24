
import { ContentSuggestion } from "@/utils/contentSuggestionUtils";

export interface ContentType {
  id: string;
  name: string;
  icon: string;
  description: string;
  sample: string;
}

export const contentTypes: ContentType[] = [
  { 
    id: "pillar", 
    name: "Pillar Content", 
    icon: "FileText",
    description: "Comprehensive guides on workplace management and space optimization",
    sample: "# The Complete Guide to Office Space Management\n\n## Introduction\nModern workplace management is evolving rapidly with new technologies leading the charge...\n\n## What is Office Space Management Software?\nOffice space management software enables businesses to efficiently organize, allocate, and optimize their physical workspaces..."
  },
  { 
    id: "support", 
    name: "Support Pages", 
    icon: "Building2",
    description: "Helpful documentation for software features, implementation guides, and FAQs",
    sample: "# How to Implement Desk Booking in Your Office\n\n## Getting Started\n1. Set up your floor plans in the admin portal\n2. Configure booking rules and restrictions\n3. Import employee data and departments\n4. Launch the booking system\n\n## Troubleshooting\nIf employees cannot see available desks..."
  },
  { 
    id: "meta", 
    name: "Meta Tags", 
    icon: "Tag",
    description: "SEO-optimized title tags, meta descriptions, and headers for office software pages",
    sample: "Title: Office Space Management Software: Optimize Your Workplace in 2024\n\nMeta Description: Discover how our advanced office space management tools can transform your workplace efficiency. Our comprehensive solution covers desk booking, space analytics, and hybrid work management."
  },
  { 
    id: "social", 
    name: "Social Posts", 
    icon: "Share2",
    description: "Professional social media content for LinkedIn, Twitter, and other platforms",
    sample: "LinkedIn:\n📊 Are you getting the most out of your office space? Our latest workplace analytics report shows that companies are only utilizing 60% of their available space effectively.\n\n✅ Optimize desk allocation\n✅ Implement hoteling and hot-desking\n✅ Track space utilization metrics\n\nBook a demo today: [link]"
  },
];

export const suggestedUrls = [
  "https://officespacesoftware.com/features/desk-booking",
  "https://officespacesoftware.com/features/space-analytics",
  "https://officespacesoftware.com/features/workplace-scheduling",
  "https://officespacesoftware.com/solutions/hybrid-work",
  "https://officespacesoftware.com/blog/workplace-optimization",
];

export interface ContentGeneratorProps {
  className?: string;
  keywords?: string[];
}
