
import React from "react";
import { BarChart, BarChart3, TrendingUp, Eye, Share, ThumbsUp, ExternalLink, FileText, Building2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ContentAnalyticsProps {
  className?: string;
}

const ContentAnalytics: React.FC<ContentAnalyticsProps> = ({ className }) => {
  // Reset all mock data values to zero
  const contentPerformance = [
    { 
      title: "Office Space Planning Best Practices", 
      type: "Pillar Content",
      views: 0,
      shares: 0,
      engagement: 0,
      trend: "neutral" 
    },
    { 
      title: "Hybrid Workplace Management Guide", 
      type: "Pillar Content",
      views: 0,
      shares: 0,
      engagement: 0,
      trend: "neutral"
    },
    { 
      title: "Desk Booking Systems Comparison", 
      type: "Support Page",
      views: 0,
      shares: 0,
      engagement: 0,
      trend: "neutral"
    },
    { 
      title: "Optimizing Meeting Room Utilization", 
      type: "Support Page",
      views: 0,
      shares: 0,
      engagement: 0,
      trend: "neutral"
    },
    { 
      title: "Workplace Analytics Tools Guide", 
      type: "Support Page",
      views: 0,
      shares: 0,
      engagement: 0,
      trend: "neutral"
    },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">Total Content Views</h3>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="bg-primary/10 rounded-full p-2">
              <Eye className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>No change</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">Social Shares</h3>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="bg-blue-500/10 rounded-full p-2">
              <Share className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>No change</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">Avg. Engagement</h3>
              <p className="text-3xl font-bold mt-2">0%</p>
            </div>
            <div className="bg-orange-500/10 rounded-full p-2">
              <ThumbsUp className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <span>No change</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-400">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Top Performing Content</h3>
          <Button variant="outline" size="sm" className="text-xs">
            Export Data <ExternalLink size={14} className="ml-1" />
          </Button>
        </div>
        
        <div className="rounded-lg border border-border overflow-hidden">
          <div className="bg-secondary/50 text-xs font-medium text-muted-foreground grid grid-cols-12 gap-4 px-4 py-3">
            <div className="col-span-5">Title</div>
            <div className="col-span-2">Type</div>
            <div className="col-span-1 text-right">Views</div>
            <div className="col-span-1 text-right">Shares</div>
            <div className="col-span-2 text-right">Engagement</div>
            <div className="col-span-1"></div>
          </div>
          
          <div className="divide-y divide-border">
            {contentPerformance.map((content, index) => (
              <div 
                key={index}
                className="grid grid-cols-12 gap-4 px-4 py-3 text-sm hover:bg-secondary/30 transition-colors"
              >
                <div className="col-span-5 font-medium flex items-center">
                  <FileText size={16} className="mr-2 text-muted-foreground" />
                  {content.title}
                </div>
                <div className="col-span-2 text-muted-foreground">{content.type}</div>
                <div className="col-span-1 text-right">{content.views.toLocaleString()}</div>
                <div className="col-span-1 text-right">{content.shares}</div>
                <div className="col-span-2 text-right">
                  <div className="inline-flex items-center">
                    <div className="w-8 h-2 rounded-full bg-muted overflow-hidden mr-2">
                      <div 
                        className="h-full bg-gray-500"
                        style={{ width: "0%" }}
                      ></div>
                    </div>
                    {content.engagement}%
                  </div>
                </div>
                <div className="col-span-1 text-right flex justify-end">
                  <BarChart3 size={16} className="text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-500">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Content Distribution by Type</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 border border-border rounded-lg flex flex-col items-center">
            <div className="bg-primary/10 rounded-full p-3 mb-3">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h4 className="font-medium">Pillar Content</h4>
            <p className="text-2xl font-bold mt-1">0</p>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <span>No new content</span>
            </div>
          </div>
          
          <div className="p-4 border border-border rounded-lg flex flex-col items-center">
            <div className="bg-blue-500/10 rounded-full p-3 mb-3">
              <Building2 className="h-6 w-6 text-blue-500" />
            </div>
            <h4 className="font-medium">Support Pages</h4>
            <p className="text-2xl font-bold mt-1">0</p>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <span>No new content</span>
            </div>
          </div>
          
          <div className="p-4 border border-border rounded-lg flex flex-col items-center">
            <div className="bg-orange-500/10 rounded-full p-3 mb-3">
              <Tag className="h-6 w-6 text-orange-500" />
            </div>
            <h4 className="font-medium">Meta Tags</h4>
            <p className="text-2xl font-bold mt-1">0</p>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <span>No content</span>
            </div>
          </div>
          
          <div className="p-4 border border-border rounded-lg flex flex-col items-center">
            <div className="bg-green-500/10 rounded-full p-3 mb-3">
              <Share className="h-6 w-6 text-green-500" />
            </div>
            <h4 className="font-medium">Social Posts</h4>
            <p className="text-2xl font-bold mt-1">0</p>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <span>No new content</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentAnalytics;
