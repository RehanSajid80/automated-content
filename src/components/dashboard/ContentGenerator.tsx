
import React, { useState, useEffect } from "react";
import { FileText, Tag, Share2, ArrowRight, Check, Loader2, Building2, Globe, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateContentByType } from "@/utils/contentGenerationUtils";

interface ContentGeneratorProps {
  className?: string;
  keywords?: string[];
}

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
  const [generatingProgress, setGeneratingProgress] = useState("");
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

  const checkUrlExists = (url: string) => {
    const mainKeyword = keywords.split(',')[0]?.trim().toLowerCase() || "";
    
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
    
    const mainKeyword = keywords.split(',')[0]?.trim() || "office space management";
    const keywordSlug = mainKeyword.toLowerCase().replace(/\s+/g, '-');
    
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

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedContent("");
    
    // Set initial loading message
    if (activeTab === "pillar") {
      setGeneratingProgress("Generating comprehensive pillar content (this may take a minute)...");
    } else {
      setGeneratingProgress("Generating content...");
    }
    
    try {
      const mainKeyword = keywords.split(',')[0]?.trim() || "";
      const contentType = activeTab;
      
      // Define minimum words based on content type
      let minWords;
      if (contentType === 'pillar') {
        minWords = 1500; // Setting higher than requested to ensure we meet the minimum
        toast.info("Generating pillar content", {
          description: "Creating comprehensive content of at least 1200 words. This may take a minute...",
          duration: 5000,
        });
      }
      
      // Create progress update interval for pillar content
      let progressDots = 0;
      let progressInterval: number | null = null;
      
      if (contentType === 'pillar') {
        progressInterval = window.setInterval(() => {
          progressDots = (progressDots + 1) % 4;
          const dots = '.'.repeat(progressDots);
          setGeneratingProgress(`Creating comprehensive ${mainKeyword} guide${dots} This may take a minute.`);
        }, 500);
      }
      
      const generatedResult = await generateContentByType({
        contentType,
        mainKeyword,
        keywords: keywords.split(',').map(k => k.trim()),
        targetUrl: contentType === 'meta' ? targetUrl : undefined,
        minWords
      });
      
      // Clear the progress interval if it exists
      if (progressInterval !== null) {
        clearInterval(progressInterval);
      }
      
      setGeneratedContent(generatedResult);
      
      const wordCount = generatedResult.split(/\s+/).filter(word => word.length > 0).length;
      
      if (contentType === 'pillar') {
        toast.success(`Content generated successfully!`, {
          description: `Created a ${wordCount.toLocaleString()} word guide on ${mainKeyword}`,
        });
      } else {
        toast.success("Content generated successfully!");
      }
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error("Failed to generate content. Please try again.");
    } finally {
      setIsGenerating(false);
      setGeneratingProgress("");
    }
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
                      {generatingProgress || "Generating..."}
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
                    <div className="text-sm font-medium">
                      Generated Content 
                      {activeTab === "pillar" && (
                        <span className="text-xs text-muted-foreground ml-2">
                          ({generatedContent.split(/\s+/).filter(word => word.length > 0).length.toLocaleString()} words)
                        </span>
                      )}
                    </div>
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
