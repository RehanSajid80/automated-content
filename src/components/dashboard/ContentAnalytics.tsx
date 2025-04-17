import React from "react";
import { BarChart, BarChart3, TrendingUp, Eye, Share, ThumbsUp, ExternalLink, FileText, Building2, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ContentAnalyticsProps {
  className?: string;
}

const ContentAnalytics: React.FC<ContentAnalyticsProps> = ({ className }) => {
  // Updated mock data for content performance with reduced numbers
  const contentPerformance = [
    { 
      title: "Office Space Planning Best Practices", 
      type: "Pillar Content",
      views: 456,
      shares: 23,
      engagement: 78,
      trend: "up" 
    },
    { 
      title: "Hybrid Workplace Management Guide", 
      type: "Pillar Content",
      views: 379,
      shares: 19,
      engagement: 82,
      trend: "up"
    },
    { 
      title: "Desk Booking Systems Comparison", 
      type: "Support Page",
      views: 540,
      shares: 17,
      engagement: 65,
      trend: "neutral"
    },
    { 
      title: "Optimizing Meeting Room Utilization", 
      type: "Support Page",
      views: 260,
      shares: 12,
      engagement: 59,
      trend: "up"
    },
    { 
      title: "Workplace Analytics Tools Guide", 
      type: "Support Page",
      views: 180,
      shares: 9,
      engagement: 71,
      trend: "down"
    },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">Total Content Views</h3>
              <p className="text-3xl font-bold mt-2">24,789</p>
            </div>
            <div className="bg-primary/10 rounded-full p-2">
              <Eye className="h-5 w-5 text-primary" />
            </div>
          </div>
          <div className="flex items-center text-sm text-green-500">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>12% increase from last month</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-200">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">Social Shares</h3>
              <p className="text-3xl font-bold mt-2">1,245</p>
            </div>
            <div className="bg-blue-500/10 rounded-full p-2">
              <Share className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="flex items-center text-sm text-green-500">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>8% increase from last month</span>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-300">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">Avg. Engagement</h3>
              <p className="text-3xl font-bold mt-2">72%</p>
            </div>
            <div className="bg-orange-500/10 rounded-full p-2">
              <ThumbsUp className="h-5 w-5 text-orange-500" />
            </div>
          </div>
          <div className="flex items-center text-sm text-green-500">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>5% increase from last month</span>
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
                        className={cn(
                          "h-full",
                          content.engagement > 75 ? "bg-green-500" : 
                          content.engagement > 60 ? "bg-blue-500" : 
                          content.engagement > 40 ? "bg-orange-500" : 
                          "bg-red-500"
                        )}
                        style={{ width: `${content.engagement}%` }}
                      ></div>
                    </div>
                    {content.engagement}%
                  </div>
                </div>
                <div className="col-span-1 text-right flex justify-end">
                  {content.trend === "up" && <TrendingUp size={16} className="text-green-500" />}
                  {content.trend === "down" && <TrendingUp size={16} className="text-red-500 rotate-180" />}
                  {content.trend === "neutral" && <BarChart3 size={16} className="text-blue-500" />}
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
            <p className="text-2xl font-bold mt-1">8</p>
            <div className="flex items-center text-xs text-green-500 mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>3 new this week</span>
            </div>
          </div>
          
          <div className="p-4 border border-border rounded-lg flex flex-col items-center">
            <div className="bg-blue-500/10 rounded-full p-3 mb-3">
              <Building2 className="h-6 w-6 text-blue-500" />
            </div>
            <h4 className="font-medium">Support Pages</h4>
            <p className="text-2xl font-bold mt-1">22</p>
            <div className="flex items-center text-xs text-green-500 mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>5 new this week</span>
            </div>
          </div>
          
          <div className="p-4 border border-border rounded-lg flex flex-col items-center">
            <div className="bg-orange-500/10 rounded-full p-3 mb-3">
              <Tag className="h-6 w-6 text-orange-500" />
            </div>
            <h4 className="font-medium">Meta Tags</h4>
            <p className="text-2xl font-bold mt-1">46</p>
            <div className="flex items-center text-xs text-muted-foreground mt-2">
              <BarChart3 className="h-3 w-3 mr-1" />
              <span>Same as last week</span>
            </div>
          </div>
          
          <div className="p-4 border border-border rounded-lg flex flex-col items-center">
            <div className="bg-green-500/10 rounded-full p-3 mb-3">
              <Share className="h-6 w-6 text-green-500" />
            </div>
            <h4 className="font-medium">Social Posts</h4>
            <p className="text-2xl font-bold mt-1">94</p>
            <div className="flex items-center text-xs text-green-500 mt-2">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>18 new this week</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentAnalytics;
