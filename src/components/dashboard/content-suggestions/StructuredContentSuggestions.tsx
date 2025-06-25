
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Users, 
  Target, 
  Hash, 
  Share2, 
  Mail,
  ChevronDown,
  ChevronUp,
  Plus,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import { ContentPreview } from "../content-display/debug/ContentPreview";

interface StructuredContentSuggestionsProps {
  suggestions: any[];
  persona?: string;
  goal?: string;
  isLoading?: boolean;
}

export const StructuredContentSuggestions: React.FC<StructuredContentSuggestionsProps> = ({
  suggestions,
  persona = "strategic-marketing",
  goal = "content-suggestions",
  isLoading = false
}) => {
  const [expandedSections, setExpandedSections] = useState<{ [key: string]: boolean }>({});
  const [creatingContent, setCreatingContent] = useState<{ [key: string]: boolean }>({});
  const [createdContent, setCreatedContent] = useState<{ [key: string]: any }>({});
  
  const { sendToN8n, isLoading: n8nLoading } = useN8nAgent();

  const toggleSection = (sectionKey: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const handleCreateContent = async (contentType: string, contentData: any, suggestionIndex: number) => {
    const contentKey = `${suggestionIndex}-${contentType}`;
    setCreatingContent(prev => ({ ...prev, [contentKey]: true }));
    
    console.log(`Creating ${contentType} content for:`, contentData);
    
    try {
      // Prepare the content creation payload
      const payload = {
        requestType: 'contentGeneration' as const,
        contentType: contentType,
        contentData: contentData,
        persona: persona,
        goal: goal,
        context: {
          source: "structured-content-suggestions",
          suggestionIndex: suggestionIndex,
          timestamp: new Date().toISOString()
        }
      };

      console.log("Sending content creation payload:", payload);
      
      toast(`Creating ${contentType} content...`, {
        description: typeof contentData === 'object' ? contentData.title || contentData.subject : contentData
      });

      const result = await sendToN8n(payload, 'content');
      
      console.log("Content creation result:", result);
      
      if (result.success && result.content) {
        setCreatedContent(prev => ({
          ...prev,
          [contentKey]: result.content
        }));
        
        toast.success("Content Created!", {
          description: `Your ${contentType} content is ready for review`
        });
      } else {
        throw new Error(result.error || "Failed to create content");
      }
      
    } catch (error) {
      console.error(`Error creating ${contentType} content:`, error);
      toast.error("Content Creation Failed", {
        description: error instanceof Error ? error.message : "Please try again"
      });
    } finally {
      setCreatingContent(prev => ({ ...prev, [contentKey]: false }));
    }
  };

  const renderContentSection = (
    title: string, 
    items: any[], 
    icon: React.ReactNode, 
    contentType: string,
    suggestionIndex: number
  ) => {
    if (!items || items.length === 0) return null;
    
    const sectionKey = `${suggestionIndex}-${contentType}`;
    const isExpanded = expandedSections[sectionKey];
    const isCreating = creatingContent[sectionKey];
    const hasCreatedContent = createdContent[sectionKey];

    return (
      <div className="border rounded-lg">
        <div 
          className="p-4 cursor-pointer hover:bg-gray-50 flex items-center justify-between"
          onClick={() => toggleSection(sectionKey)}
        >
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium">{title}</span>
            <Badge variant="secondary">{items.length}</Badge>
          </div>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
        
        {isExpanded && (
          <div className="border-t p-4 space-y-3">
            {items.map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    {typeof item === 'string' ? (
                      <p className="text-sm">{item}</p>
                    ) : (
                      <div>
                        <h4 className="font-medium text-sm">{item.title || item.subject}</h4>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                        {item.preview && (
                          <p className="text-sm text-gray-500 mt-1">{item.preview}</p>
                        )}
                        {item.keySections && (
                          <div className="mt-2">
                            <p className="text-xs font-medium text-gray-700">Key Sections:</p>
                            <ul className="text-xs text-gray-600 list-disc list-inside">
                              {item.keySections.map((section: string, i: number) => (
                                <li key={i}>{section}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateContent(contentType, item, suggestionIndex);
                    }}
                    disabled={isCreating || n8nLoading}
                    className="flex items-center gap-1"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3" />
                        Create Content
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
            
            {/* Show created content preview */}
            {hasCreatedContent && (
              <div className="mt-4 p-4 border-2 border-green-200 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Generated Content Preview
                </h4>
                <ContentPreview generatedContent={hasCreatedContent} />
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading strategic content suggestions...</span>
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No content suggestions available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {suggestions.map((suggestion, suggestionIndex) => (
        <Card key={suggestionIndex}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {suggestion.topicArea || `Content Strategy ${suggestionIndex + 1}`}
            </CardTitle>
            {suggestion.reasoning && (
              <p className="text-sm text-gray-600">{suggestion.reasoning}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {renderContentSection(
              "Pillar Content", 
              suggestion.pillarContent || [], 
              <FileText className="h-4 w-4" />, 
              "pillar",
              suggestionIndex
            )}
            
            {renderContentSection(
              "Support Pages", 
              suggestion.supportContent || suggestion.supportPages || [], 
              <Users className="h-4 w-4" />, 
              "support",
              suggestionIndex
            )}
            
            {renderContentSection(
              "Meta Tags", 
              suggestion.metaTags || [], 
              <Hash className="h-4 w-4" />, 
              "meta",
              suggestionIndex
            )}
            
            {renderContentSection(
              "Social Media", 
              suggestion.socialMediaPosts || suggestion.socialMedia || [], 
              <Share2 className="h-4 w-4" />, 
              "social",
              suggestionIndex
            )}
            
            {renderContentSection(
              "Email Campaign", 
              suggestion.emailSeries || suggestion.email || [], 
              <Mail className="h-4 w-4" />, 
              "email",
              suggestionIndex
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
