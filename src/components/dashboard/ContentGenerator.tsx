
import React, { useState } from "react";
import { FileText, Tag, Share2, ArrowRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ContentGeneratorProps {
  className?: string;
}

// Mock content templates
const contentTypes = [
  { 
    id: "pillar", 
    name: "Pillar Content", 
    icon: <FileText size={16} />,
    description: "Long-form, comprehensive content that covers a topic in-depth",
    sample: "# The Complete Guide to AI Content Generation\n\n## Introduction\nContent creation is evolving rapidly with AI technologies leading the charge...\n\n## What is AI Content Generation?\nAI content generation uses machine learning algorithms to create written content..."
  },
  { 
    id: "support", 
    name: "Support Pages", 
    icon: <FileText size={16} />,
    description: "Helpful content for your website FAQ, guides, and support documentation",
    sample: "# How to Use Our AI Content Generator\n\n## Getting Started\n1. Connect your SEMrush account\n2. Select target keywords\n3. Choose your content type\n4. Generate and review\n\n## Troubleshooting\nIf you encounter any issues..."
  },
  { 
    id: "meta", 
    name: "Meta Tags", 
    icon: <Tag size={16} />,
    description: "SEO-optimized title tags, meta descriptions, and headers",
    sample: "Title: Complete AI Content Generation Guide: Boost Your SEO in 2024\n\nMeta Description: Discover how AI content generation tools can transform your content strategy. Our comprehensive guide covers everything from keyword research to publishing."
  },
  { 
    id: "social", 
    name: "Social Posts", 
    icon: <Share2 size={16} />,
    description: "Eye-catching social media posts optimized for each platform",
    sample: "Twitter/X:\n📊 Struggling with content creation? Our AI tool just analyzed 1000+ top-performing articles in your industry. Here's what works now:\n\n✅ Lists over long paragraphs\n✅ Real data over generic advice\n✅ Action steps, not just theory\n\nTry our tool free: [link]"
  },
];

const ContentGenerator: React.FC<ContentGeneratorProps> = ({ className }) => {
  const [activeTab, setActiveTab] = useState("pillar");
  const [keywords, setKeywords] = useState("ai content generation, content marketing strategy");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  
  // Mock content generation
  const handleGenerate = () => {
    setIsGenerating(true);
    setGeneratedContent("");
    
    // Simulate API call delay
    setTimeout(() => {
      const selectedContentType = contentTypes.find(type => type.id === activeTab);
      setGeneratedContent(selectedContentType?.sample || "");
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-400", className)}>
      <h3 className="text-lg font-semibold mb-6">Content Generator</h3>
      
      <Tabs defaultValue="pillar" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          {contentTypes.map(type => (
            <TabsTrigger 
              key={type.id} 
              value={type.id}
              className="flex items-center"
            >
              {type.icon}
              <span className="ml-2">{type.name}</span>
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
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-sm font-medium">Generated Content</div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" className="h-8 text-xs px-2">
                        Regenerate
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 text-xs px-2">
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
