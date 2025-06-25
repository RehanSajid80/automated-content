
import { useState } from "react";
import { KeywordData } from "@/utils/excelUtils";
import { getContentSuggestions } from "@/services/openai/contentSuggestions";
import { useToast } from "@/hooks/use-toast";
import { API_KEYS, getApiKey } from "@/utils/apiKeyUtils";
import { OPENAI_MODELS } from "@/utils/openaiUtils";

interface ContentStrategyRecommendation {
  priorityKeywords: string[];
  contentTypes: {
    pillarContent: string[];
    supportPages: string[];
    metaContent: string[];
    socialMedia: string[];
  };
  reasoning: string;
  officeSpaceRelevance: string;
}

export const useAIContentStrategy = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<ContentStrategyRecommendation | null>(null);
  const { toast } = useToast();

  const generateContentStrategy = async (keywords: KeywordData[], topicArea: string, domain: string) => {
    let apiKey = null;
    
    try {
      apiKey = await getApiKey(API_KEYS.OPENAI);
    } catch (error) {
      console.error("Error getting API key:", error);
    }
    
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please set up your OpenAI API connection",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const keywordsText = keywords.map(k => 
        `"${k.keyword}" (volume: ${k.volume || 'unknown'}, difficulty: ${k.difficulty || 'unknown'}, trend: ${k.trend || 'unknown'})`
      ).join(", ");
      
      const prompt = `
        You are a content strategist specializing in office space management software. Analyze these SEMrush keywords for the topic "${topicArea}" and domain "${domain}":
        
        Keywords: ${keywordsText}
        
        Provide strategic recommendations for Office Space Software content creation:
        
        1. Priority Keywords: Select the 5-8 most valuable keywords for office space management content
        2. Content Type Recommendations:
           - Pillar Content: 2-3 comprehensive guide topics (1500+ words each)
           - Support Pages: 4-5 focused page topics (500-800 words each)
           - Meta Content: 3-4 SEO-optimized page titles/descriptions
           - Social Media: 3-4 social post themes for LinkedIn/professional networks
        3. Strategic Reasoning: Why these keywords and content types work best for office space software
        4. Office Space Relevance: How this content addresses real workplace management challenges
        
        Focus on content that helps businesses with:
        - Space optimization and utilization
        - Workplace efficiency and productivity
        - Employee experience and satisfaction
        - Cost management and ROI
        - Facility management and operations
        
        Format as JSON with this structure:
        {
          "priorityKeywords": ["keyword1", "keyword2", ...],
          "contentTypes": {
            "pillarContent": ["Guide title 1", "Guide title 2", ...],
            "supportPages": ["Page title 1", "Page title 2", ...],
            "metaContent": ["Meta title 1", "Meta title 2", ...],
            "socialMedia": ["Social theme 1", "Social theme 2", ...]
          },
          "reasoning": "Strategic explanation of keyword selection and content approach",
          "officeSpaceRelevance": "How this content addresses office space management challenges"
        }
        
        Return ONLY the JSON with no additional text.
      `;

      console.log("Generating AI content strategy...");
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: OPENAI_MODELS.PREMIUM,
          messages: [
            {
              role: "system",
              content: "You are an expert content strategist for office space management software. Provide strategic, actionable recommendations based on SEMrush keyword data."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error("No content received from OpenAI");
      }
      
      try {
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : content;
        const cleanJsonString = jsonString.replace(/^[\s\S]*?(\{[\s\S]*\})[\s\S]*$/, "$1").trim();
        
        const parsedRecommendations = JSON.parse(cleanJsonString) as ContentStrategyRecommendation;
        setRecommendations(parsedRecommendations);
        
        toast({
          title: "AI Content Strategy Ready",
          description: `Generated strategic recommendations for ${parsedRecommendations.priorityKeywords.length} priority keywords`,
        });
        
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        throw new Error("Failed to parse content strategy recommendations");
      }
    } catch (error) {
      console.error("Error generating content strategy:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate content strategy",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearRecommendations = () => {
    setRecommendations(null);
  };

  return {
    isLoading,
    recommendations,
    generateContentStrategy,
    clearRecommendations
  };
};
