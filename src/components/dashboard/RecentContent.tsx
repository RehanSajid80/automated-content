
import React from "react";
import { FileText, Tag, Share2, Eye, Copy, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface RecentContentProps {
  className?: string;
}

// Mock recent content
const recentContent = [
  { 
    id: 1, 
    title: "The Ultimate Guide to Content Marketing in 2024", 
    type: "pillar", 
    date: "2 hours ago",
    keywords: ["content marketing", "digital strategy", "seo optimization"],
    views: 24
  },
  { 
    id: 2, 
    title: "How to Set Up Your First SEO Strategy", 
    type: "support", 
    date: "Yesterday",
    keywords: ["seo strategy", "beginners guide", "website optimization"],
    views: 56
  },
  { 
    id: 3, 
    title: "AI Content Tools: A Comprehensive Review", 
    type: "pillar", 
    date: "3 days ago",
    keywords: ["ai tools", "content creation", "productivity"],
    views: 143
  },
  { 
    id: 4, 
    title: "10 Ways to Improve Your Social Media Presence", 
    type: "social", 
    date: "5 days ago",
    keywords: ["social media", "online presence", "engagement"],
    views: 89
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case "pillar":
    case "support":
      return <FileText size={16} />;
    case "meta":
      return <Tag size={16} />;
    case "social":
      return <Share2 size={16} />;
    default:
      return <FileText size={16} />;
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case "pillar":
      return "Pillar Content";
    case "support":
      return "Support Page";
    case "meta":
      return "Meta Tags";
    case "social":
      return "Social Posts";
    default:
      return type;
  }
};

const RecentContent: React.FC<RecentContentProps> = ({ className }) => {
  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-500", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Content</h3>
        <Button variant="ghost" size="sm" className="text-xs">
          View Library <ArrowRight size={14} className="ml-1" />
        </Button>
      </div>
      
      <div className="space-y-4">
        {recentContent.map((content) => (
          <div 
            key={content.id}
            className="flex items-start space-x-4 p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors"
          >
            <div className={cn(
              "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
              content.type === "pillar" && "bg-primary/10 text-primary",
              content.type === "support" && "bg-green-100 text-green-600",
              content.type === "meta" && "bg-purple-100 text-purple-600",
              content.type === "social" && "bg-blue-100 text-blue-600",
            )}>
              {getIcon(content.type)}
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium truncate">{content.title}</h4>
              <div className="mt-1 flex items-center text-xs text-muted-foreground">
                <span className="inline-flex items-center">
                  {getTypeLabel(content.type)}
                </span>
                <span className="mx-2">•</span>
                <span>{content.date}</span>
                <span className="mx-2">•</span>
                <span className="inline-flex items-center">
                  <Eye size={12} className="mr-1" />
                  {content.views}
                </span>
              </div>
              
              <div className="mt-2 flex flex-wrap gap-1">
                {content.keywords.map((keyword, i) => (
                  <span 
                    key={i}
                    className="inline-flex text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Copy size={14} />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentContent;
