
import React, { useState, useEffect } from "react";
import { FileText, Tag, Share2, ArrowRight, Check, Loader2, Building2, Globe, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

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
  const [urlExists, setUrlExists] = useState(true);
  const [existingMetaTags, setExistingMetaTags] = useState(false);
  const [isCheckingExistence, setIsCheckingExistence] = useState(false);
  
  useEffect(() => {
    if (initialKeywords && initialKeywords.length > 0) {
      setKeywords(initialKeywords.join(", "));
      setActiveTab("pillar");
      setGeneratedContent("");
    }
  }, [initialKeywords]);

  // Function to check if meta tags already exist in the database
  const checkExistingMetaTags = async (url: string) => {
    try {
      const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .eq('content_type', 'meta')
        .ilike('content', `%${url}%`)
        .limit(1);
      
      if (error) {
        console.error("Error checking for existing meta tags:", error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (e) {
      console.error("Error in checkExistingMetaTags:", e);
      return false;
    }
  };

  // Function to check if a URL exists (mock implementation)
  const checkUrlExists = (url: string) => {
    // Simplified check - you might want to implement a more comprehensive solution
    // such as an actual HTTP request to verify if the URL exists
    const mainKeyword = keywords.split(',')[0]?.trim().toLowerCase() || "";
    
    // Check if the URL or the keyword is reflected in any of the suggested URLs
    const urlMatch = suggestedUrls.some(suggestedUrl => {
      const urlParts = suggestedUrl.toLowerCase().split('/');
      const lastPart = urlParts[urlParts.length - 1].replace(/-/g, ' ');
      
      return suggestedUrl.toLowerCase() === url.toLowerCase() ||
             lastPart.includes(mainKeyword.toLowerCase());
    });
    
    return urlMatch;
  };

  const suggestNewUrl = () => {
    const mainKeyword = keywords.split(',')[0]?.trim() || "office space management";
    const keywordSlug = mainKeyword.toLowerCase().replace(/\s+/g, '-');
    
    // Create a new suggested URL based on the main keyword
    let newUrl = "";
    
    if (mainKeyword.includes("management")) {
      newUrl = `https://officespacesoftware.com/solutions/${keywordSlug}`;
    } else if (mainKeyword.includes("booking") || mainKeyword.includes("analytics") || 
               mainKeyword.includes("scheduling")) {
      newUrl = `https://officespacesoftware.com/features/${keywordSlug}`;
    } else {
      newUrl = `https://officespacesoftware.com/blog/${keywordSlug}`;
    }
    
    setTargetUrl(newUrl);
    setUrlExists(false);
    
    return newUrl;
  };

  const handleSuggestUrl = async () => {
    setIsCheckingExistence(true);
    
    // Generate a URL based on the main keyword
    const mainKeyword = keywords.split(',')[0]?.trim() || "office space management";
    const keywordSlug = mainKeyword.toLowerCase().replace(/\s+/g, '-');
    
    // First, try existing URLs
    let foundUrl = suggestedUrls.find(url => 
      url.toLowerCase().includes(keywordSlug) || 
      url.toLowerCase().includes(mainKeyword.replace(/\s+/g, ''))
    );
    
    if (foundUrl) {
      setTargetUrl(foundUrl);
      setUrlExists(true);
    } else {
      foundUrl = suggestNewUrl();
    }
    
    // Check if meta tags already exist for this URL
    const tagsExist = await checkExistingMetaTags(foundUrl);
    setExistingMetaTags(tagsExist);
    
    setIsCheckingExistence(false);
    
    if (!urlExists) {
      toast("New page suggestion", {
        description: "We suggest creating a new target page for this keyword."
      });
    }
    
    if (tagsExist) {
      toast("Meta tags already exist", {
        description: "Meta tags for this URL already exist in the content library."
      });
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedContent("");
    
    setTimeout(() => {
      const keywordList = keywords.split(',').map(k => k.trim());
      const mainKeyword = keywordList[0] || "office space management";
      
      let content = "";
      
      if (activeTab === "pillar") {
        content = `# The Ultimate Guide to ${mainKeyword} in 2024: A Comprehensive Analysis

## Introduction
In today's dynamic workplace landscape, ${mainKeyword} has emerged as a critical component of successful business operations. This comprehensive guide explores how OfficeSpaceSoftware.com's solutions address the evolving challenges of modern workplace management, with a particular focus on ${keywordList.slice(1, 3).join(" and ")}.

## Understanding ${mainKeyword}
### Definition and Core Concepts
${mainKeyword.charAt(0).toUpperCase() + mainKeyword.slice(1)} represents a strategic approach to organizing and optimizing workplace resources through OfficeSpaceSoftware.com's advanced platform. This encompasses:
- Space utilization analytics
- Workplace capacity planning
- Resource allocation optimization
- Employee experience enhancement

### The Evolution of ${mainKeyword}
#### Historical Context
Traditional office management methods have evolved significantly over the past decade, driven by:
1. Technological advancements
2. Changing workforce demographics
3. Shifting workplace expectations
4. Global workplace trends

#### Current Industry Landscape
Modern ${mainKeyword} solutions integrate:
- IoT sensors for real-time occupancy monitoring
- AI-powered predictive analytics
- Mobile-first booking interfaces
- Integration capabilities with existing enterprise systems

## Key Benefits for Organizations
### 1. Operational Efficiency
- Streamlined booking processes
- Automated space allocation
- Reduced administrative overhead
- Improved resource utilization rates

### 2. Cost Optimization
- Reduced real estate costs through data-driven decisions
- Lower utility expenses through optimized space usage
- Minimized maintenance costs through predictive scheduling
- Enhanced ROI on workplace investments

### 3. Employee Experience
- Intuitive interface for space booking
- Flexible workplace options
- Improved collaboration opportunities
- Enhanced workplace satisfaction metrics

### 4. Data-Driven Decision Making
- Real-time occupancy analytics
- Historical usage patterns
- Predictive space requirements
- Actionable insights for workplace strategy

## Implementation Strategy
### Phase 1: Assessment and Planning
1. Evaluate current workplace metrics
2. Define organizational objectives
3. Identify key stakeholders
4. Establish success criteria
5. Develop implementation timeline

### Phase 2: Technical Setup
1. Configure OfficeSpaceSoftware.com platform settings
2. Import organizational structure and employee data
3. Set up integration with existing systems
4. Configure custom workflows and automation rules
5. Establish reporting frameworks

### Phase 3: User Onboarding
1. Develop training materials
2. Conduct user workshops
3. Establish support channels
4. Create user documentation
5. Set up feedback mechanisms

## Best Practices for ${mainKeyword}
### Data-Driven Decision Making
- Regular analysis of usage patterns
- Continuous monitoring of key metrics
- Iterative improvements based on feedback
- Strategic planning using historical data

### Change Management
- Clear communication strategies
- Stakeholder engagement plans
- Training and support programs
- Feedback collection mechanisms

### Technology Integration
- Seamless system connections
- API utilization
- Mobile accessibility
- Security compliance

## Future Trends in ${mainKeyword}
### Emerging Technologies
1. AI-powered space optimization
2. IoT integration for real-time monitoring
3. Predictive analytics for space planning
4. Blockchain for resource tracking

### Industry Developments
1. Hybrid work model optimization
2. Sustainability focus
3. Employee wellness integration
4. Smart building integration

## Case Studies
### Enterprise Implementation
Learn how Fortune 500 companies have achieved:
- 30% reduction in real estate costs
- 45% improvement in space utilization
- 85% increase in employee satisfaction
- 25% decrease in operational expenses

### Mid-Market Success Stories
Discover how growing businesses have:
- Optimized their workplace strategy
- Improved employee experience
- Reduced administrative overhead
- Enhanced decision-making processes

## Conclusion
${mainKeyword} continues to evolve as a critical component of successful business operations. By leveraging OfficeSpaceSoftware.com's comprehensive platform, organizations can:
- Optimize their workplace resources
- Enhance employee experience
- Make data-driven decisions
- Prepare for future workplace trends

## Additional Resources
- OfficeSpaceSoftware.com documentation
- Implementation guides
- Best practices documentation
- Industry research and whitepapers
- Customer success stories

## Get Started
Transform your workplace with OfficeSpaceSoftware.com's ${mainKeyword} solution. Contact our team for a personalized demo and consultation.`;
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
                      onClick={handleSuggestUrl}
                      disabled={isCheckingExistence}
                    >
                      {isCheckingExistence ? (
                        <>
                          <Loader2 size={14} className="mr-2 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        <>Suggest URL</>
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center mt-2 text-xs">
                    {!urlExists && !isCheckingExistence && (
                      <div className="text-amber-500 flex items-center">
                        <AlertTriangle size={14} className="mr-1" />
                        <span>New page recommendation for this keyword</span>
                      </div>
                    )}
                    {existingMetaTags && !isCheckingExistence && (
                      <div className="text-blue-500 flex items-center ml-auto">
                        <Tag size={14} className="mr-1" />
                        <span>Meta tags already exist for this URL</span>
                      </div>
                    )}
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
