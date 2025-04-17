import React, { useState, useEffect } from "react";
import { FileText, Tag, Share2, ArrowRight, Check, Loader2, Building2, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface ContentGeneratorProps {
  className?: string;
  keywords?: string[];
}

// Mock content templates for Office Space Software
const contentTypes = [
  { 
    id: "pillar", 
    name: "Pillar Content", 
    icon: <FileText size={16} />,
    description: "Comprehensive guides on workplace management and space optimization",
    sample: "# The Complete Guide to Office Space Management\n\n## Introduction\nModern workplace management is evolving rapidly with new technologies leading the charge...\n\n## What is Office Space Management Software?\nOffice space management software enables businesses to efficiently organize, allocate, and optimize their physical workspaces..."
  },
  { 
    id: "support", 
    name: "Support Pages", 
    icon: <Building2 size={16} />,
    description: "Helpful documentation for software features, implementation guides, and FAQs",
    sample: "# How to Implement Desk Booking in Your Office\n\n## Getting Started\n1. Set up your floor plans in the admin portal\n2. Configure booking rules and restrictions\n3. Import employee data and departments\n4. Launch the booking system\n\n## Troubleshooting\nIf employees cannot see available desks..."
  },
  { 
    id: "meta", 
    name: "Meta Tags", 
    icon: <Tag size={16} />,
    description: "SEO-optimized title tags, meta descriptions, and headers for office software pages",
    sample: "Title: Office Space Management Software: Optimize Your Workplace in 2024\n\nMeta Description: Discover how our advanced office space management tools can transform your workplace efficiency. Our comprehensive solution covers desk booking, space analytics, and hybrid work management."
  },
  { 
    id: "social", 
    name: "Social Posts", 
    icon: <Share2 size={16} />,
    description: "Professional social media content for LinkedIn, Twitter, and other platforms",
    sample: "LinkedIn:\n📊 Are you getting the most out of your office space? Our latest workplace analytics report shows that companies are only utilizing 60% of their available space effectively.\n\n✅ Optimize desk allocation\n✅ Implement hoteling and hot-desking\n✅ Track space utilization metrics\n\nBook a demo today: [link]"
  },
];

// Suggested URLs for OfficeSpaceSoftware.com
const suggestedUrls = [
  "https://officespacesoftware.com/features/desk-booking",
  "https://officespacesoftware.com/features/space-analytics",
  "https://officespacesoftware.com/features/workplace-scheduling",
  "https://officespacesoftware.com/solutions/hybrid-work",
  "https://officespacesoftware.com/blog/workplace-optimization",
];

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ className, keywords: initialKeywords }) => {
  const [activeTab, setActiveTab] = useState("pillar");
  const [keywords, setKeywords] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [targetUrl, setTargetUrl] = useState(suggestedUrls[0]);
  
  useEffect(() => {
    if (initialKeywords && initialKeywords.length > 0) {
      setKeywords(initialKeywords.join(", "));
      setActiveTab("pillar");
      setGeneratedContent("");
    }
  }, [initialKeywords]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedContent("");
    
    setTimeout(() => {
      const keywordList = keywords.split(',').map(k => k.trim());
      const mainKeyword = keywordList[0] || "office space management";
      
      let content = "";
      
      if (activeTab === "pillar") {
        content = `# The Complete Guide to ${mainKeyword}\n\n## Introduction\nModern workplace management is evolving rapidly with OfficeSpaceSoftware.com leading the charge in ${mainKeyword} solutions. This comprehensive guide will explore how our platform addresses the challenges of ${keywordList.slice(1, 3).join(" and ")}.\n\n## What is ${mainKeyword}?\n${mainKeyword.charAt(0).toUpperCase() + mainKeyword.slice(1)} enables businesses to efficiently organize, allocate, and optimize their physical workspaces through OfficeSpaceSoftware.com's intuitive platform.\n\n## Key Benefits for Facility Managers\n1. Improved space utilization metrics\n2. Enhanced employee experience and satisfaction\n3. Data-driven decision making for workplace strategy\n4. Reduced operational costs through optimized space usage\n\n## Implementation Strategies\nOur clients typically follow these steps when implementing ${mainKeyword} with OfficeSpaceSoftware.com:\n\n1. Assess current workspace usage patterns\n2. Configure the software to match your organizational structure\n3. Integrate with existing systems (HRIS, IoT sensors, etc.)\n4. Deploy user-friendly booking interfaces\n5. Analyze data to continuously improve workspace optimization`;
      } else if (activeTab === "support") {
        content = `# ${mainKeyword} Troubleshooting and Support Guide\n\n## Common Issues & Solutions\n\n### Issue: Users cannot access the booking system\n**Solution:** Verify user permissions in the admin dashboard. Navigate to Users > Permissions and ensure the appropriate access levels are set.\n\n### Issue: Floor plans not displaying correctly\n**Solution:** Check that floor plan files are in the proper format (.jpg, .png, or .svg) and under 5MB in size. Re-upload if necessary.\n\n### Issue: Integration with Google Calendar not syncing\n**Solution:** Ensure OAuth credentials are valid and that scopes include both read and write permissions for calendar events.\n\n## FAQ for ${mainKeyword}\n\n**Q: How do I set up recurring bookings?**\nA: Navigate to Bookings > New Booking and toggle the "Recurring" option. You can then set daily, weekly, or monthly patterns.\n\n**Q: Can I limit the number of bookings per user?**\nA: Yes, this setting is available under Admin > Policies > Booking Limits. Customize per department or role.\n\n**Q: How do we handle visitors and guests?**\nA: The Visitor Management module allows employees to pre-register guests, who will receive automated check-in instructions via email.\n\n## Installation & Setup\n\n1. **Initial Setup**\n   - Configure your domain settings\n   - Set primary admin contacts\n   - Import employee directory\n\n2. **Floor Plan Configuration**\n   - Upload building plans\n   - Mark bookable and non-bookable areas\n   - Set capacity and distancing rules\n\n3. **User Onboarding**\n   - Schedule training sessions\n   - Distribute quick-start guides\n   - Set up help desk resources`;
      } else if (activeTab === "meta") {
        const urlPath = targetUrl.split('/').pop() || '';
        const formattedUrlPath = urlPath.replace(/-/g, ' ');
        
        content = `## Meta Tags for: ${targetUrl}\n\n**Title Tag (60 chars):**\n${mainKeyword} - OfficeSpaceSoftware.com ${formattedUrlPath ? `| ${formattedUrlPath.charAt(0).toUpperCase() + formattedUrlPath.slice(1)}` : ''}\n\n**Meta Description (150-160 chars):**\nDiscover how OfficeSpaceSoftware.com's ${mainKeyword} solution transforms workplace efficiency. Get data-driven insights, optimize space utilization, and enhance employee experience.\n\n**H1 Heading:**\nEnterprise-Grade ${mainKeyword} for Modern Workplaces\n\n**H2 Headings:**\n- How ${mainKeyword} Drives Workplace Efficiency\n- Key Features of Our ${mainKeyword} Platform\n- Why Companies Choose OfficeSpaceSoftware for ${mainKeyword}\n- Implementing ${mainKeyword} With Minimal Disruption\n\n**Focus Keywords:**\n${keywordList.join(', ')}\n\n**Image Alt Tags:**\n1. "${mainKeyword} dashboard interface screenshot"\n2. "${mainKeyword} analytics and reporting features"\n3. "OfficeSpaceSoftware ${mainKeyword} mobile app"\n\n**URL Structure:**\n${targetUrl}`;
      } else {
        content = `LinkedIn:\n📊 Are you getting the most out of your ${mainKeyword}? Our latest workplace analytics report from OfficeSpaceSoftware.com shows that companies are only utilizing 60% of their available space effectively.\n\n✅ Optimize desk allocation with our smart booking system\n✅ Implement hoteling and hot-desking with minimal friction\n✅ Track detailed space utilization metrics across your entire portfolio\n\nBook a demo today and see how OfficeSpaceSoftware.com can transform your ${mainKeyword} strategy: [link]\n\n#${mainKeyword.replace(/\s+/g, '')} #OfficeSpaceSoftware #WorkplaceOptimization`;
      }
      
      setGeneratedContent(content);
      setIsGenerating(false);
    }, 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedContent);
    toast("Content copied to clipboard", {
      description: "You can now paste it wherever you need it."
    });
  };

  return (
    <div className={cn("", className)}>
      <Tabs defaultValue="pillar" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          {contentTypes.map(type => (
            <TabsTrigger 
              key={type.id} 
              value={type.id}
              className="flex items-center"
            >
              {type.icon}
              <span className="ml-2 hidden sm:inline">{type.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        {contentTypes.map(type => (
          <TabsContent key={type.id} value={type.id} className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              {type.description}
            </p>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="keywords" className="text-sm font-medium mb-1.5 block">
                  Target Keywords
                </label>
                <Textarea 
                  id="keywords"
                  placeholder="Enter keywords separated by commas"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="resize-none h-20"
                />
              </div>
              
              {type.id === "meta" && (
                <div>
                  <label htmlFor="targetUrl" className="text-sm font-medium mb-1.5 block flex items-center">
                    <Globe size={16} className="mr-2" /> Target URL
                  </label>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <Input
                      id="targetUrl"
                      placeholder="Enter target URL for meta tags"
                      value={targetUrl}
                      onChange={(e) => setTargetUrl(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="whitespace-nowrap"
                      onClick={() => {
                        const randomUrl = suggestedUrls[Math.floor(Math.random() * suggestedUrls.length)];
                        setTargetUrl(randomUrl);
                      }}
                    >
                      Suggest URL
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter an OfficeSpaceSoftware.com URL to generate optimized meta tags
                  </p>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button onClick={handleGenerate} disabled={isGenerating}>
                  {isGenerating ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      Generate {type.name} <ArrowRight size={16} className="ml-2" />
                    </>
                  )}
                </Button>
              </div>
              
              {generatedContent && activeTab === type.id && (
                <div className="rounded-lg border border-border p-4 mt-4 animate-fade-in">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                    <div className="text-sm font-medium">Generated Content</div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="ghost" className="h-8 text-xs px-2">
                        Regenerate
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-xs px-2"
                        onClick={handleCopy}
                      >
                        Copy
                      </Button>
                      <Button size="sm" className="h-8 text-xs px-2">
                        Save <Check size={14} className="ml-1" />
                      </Button>
                    </div>
                  </div>
                  <Textarea 
                    value={generatedContent}
                    onChange={(e) => setGeneratedContent(e.target.value)}
                    className="resize-none h-60 font-mono text-sm"
                  />
                </div>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default ContentGenerator;
