
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TopicAreaSelector } from "./TopicAreaSelector";
import { CustomKeywordsInput } from "./CustomKeywordsInput";
import { MarketingPersonaSelector } from "./MarketingPersonaSelector";
import { MarketingContentGoalSelector } from "./MarketingContentGoalSelector";
import { ContextInput } from "./ContextInput";
import { FileUploadInput } from "./FileUploadInput";
import { Loader2, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { getContentSuggestions } from "@/services/openai/contentSuggestions";
import { KeywordData } from "@/utils/excelUtils";
import { API_KEYS, getApiKey } from "@/utils/apiKeyUtils";

interface StrategicContentFormProps {
  onSuggestionsGenerated?: (suggestions: any[]) => void;
}

export const StrategicContentForm: React.FC<StrategicContentFormProps> = ({
  onSuggestionsGenerated
}) => {
  const [topicArea, setTopicArea] = useState("");
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [targetPersona, setTargetPersona] = useState("");
  const [contentGoal, setContentGoal] = useState("");
  const [context, setContext] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateSuggestions = async () => {
    // Validation
    if (!topicArea || !targetPersona || !contentGoal) {
      toast.error("Please fill in all required fields: Topic Area, Target Persona, and Content Goal");
      return;
    }

    setIsLoading(true);

    try {
      // Check if OpenAI API key is available
      let apiKey = null;
      try {
        apiKey = await getApiKey(API_KEYS.OPENAI);
      } catch (error) {
        console.error("Error getting OpenAI API key:", error);
        toast.error("OpenAI API key not configured. Please set up your OpenAI connection in settings.");
        return;
      }

      if (!apiKey) {
        toast.error("OpenAI API key not found. Please configure your OpenAI connection in settings.");
        return;
      }

      console.log("StrategicContentForm: Starting OpenAI content generation");
      console.log("Topic:", topicArea);
      console.log("Persona:", targetPersona);
      console.log("Goal:", contentGoal);
      console.log("Keywords:", customKeywords);
      console.log("Context:", context);
      console.log("File:", selectedFile?.name);

      // Read file content if provided
      let fileContent = "";
      if (selectedFile) {
        try {
          fileContent = await readFileContent(selectedFile);
          console.log("File content length:", fileContent.length);
        } catch (error) {
          console.error("Error reading file:", error);
          toast.error("Failed to read the uploaded file");
          return;
        }
      }

      // Create keyword data for OpenAI processing
      const keywordData: KeywordData[] = customKeywords.map(keyword => ({
        keyword,
        volume: 1000,
        difficulty: 50,
        cpc: 1.0,
        trend: "neutral"
      }));

      // Add topic area as primary keyword if not in custom keywords
      if (!customKeywords.includes(topicArea)) {
        keywordData.unshift({
          keyword: topicArea,
          volume: 2000,
          difficulty: 45,
          cpc: 1.2,
          trend: "up"
        });
      }

      // Generate content suggestions using OpenAI
      const suggestions = await generateStrategicContentSuggestions(
        keywordData,
        targetPersona,
        contentGoal,
        context,
        fileContent,
        apiKey
      );

      console.log("StrategicContentForm: Generated suggestions:", suggestions);

      if (suggestions && suggestions.length > 0) {
        toast.success("Strategic content suggestions generated successfully!");
        
        // Pass suggestions to parent component
        if (onSuggestionsGenerated) {
          onSuggestionsGenerated(suggestions);
        }
      } else {
        toast.error("No suggestions generated. Please try again with different inputs.");
      }

    } catch (error) {
      console.error("StrategicContentForm: Error generating suggestions:", error);
      toast.error("Failed to generate content suggestions: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const readFileContent = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsText(file);
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          Strategic Content Suggestions
        </CardTitle>
        <CardDescription>
          Generate targeted content suggestions based on your business goals and target persona
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <TopicAreaSelector 
          selectedTopic={topicArea} 
          onTopicChange={setTopicArea} 
        />
        
        <CustomKeywordsInput 
          keywords={customKeywords} 
          onKeywordsChange={setCustomKeywords} 
        />
        
        <MarketingPersonaSelector 
          selectedPersona={targetPersona} 
          onPersonaChange={setTargetPersona} 
        />
        
        <MarketingContentGoalSelector 
          selectedGoal={contentGoal} 
          onGoalChange={setContentGoal} 
        />
        
        <ContextInput value={context} onChange={setContext} />
        
        <FileUploadInput 
          onFileSelect={setSelectedFile} 
          disabled={isLoading}
        />
        
        <Button 
          onClick={handleGenerateSuggestions}
          disabled={isLoading || !topicArea || !targetPersona || !contentGoal}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Strategic Content Suggestions...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Generate Strategic Content Suggestions
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

// Helper function to generate strategic content suggestions using OpenAI
const generateStrategicContentSuggestions = async (
  keywords: KeywordData[],
  targetPersona: string,
  contentGoal: string,
  context: string,
  fileContent: string,
  apiKey: string
) => {
  const keywordsText = keywords.map(k => 
    `"${k.keyword}" (search volume: ${k.volume || 'unknown'}, trend: ${k.trend || 'unknown'})`
  ).join(", ");
  
  const prompt = `
    You are a senior content strategist for Office Space Software. Create comprehensive strategic content recommendations based on the following inputs:
    
    KEYWORDS: ${keywordsText}
    TARGET PERSONA: ${targetPersona}
    CONTENT GOAL: ${contentGoal}
    STRATEGIC CONTEXT: ${context || 'General office space software content strategy'}
    ${fileContent ? `REFERENCE DOCUMENT CONTENT: ${fileContent.substring(0, 3000)}` : ''}
    
    Generate strategic content recommendations that include:
    
    1. PILLAR CONTENT (2-3 comprehensive guides of 1500+ words each):
       - Detailed titles and descriptions
       - Key sections and talking points
       - Strategic value proposition
    
    2. SUPPORT PAGES (3-4 focused content pieces):
       - Specific topic-focused articles
       - How-to guides and tutorials
       - Use case studies
    
    3. META CONTENT (SEO optimization):
       - Optimized title tags (60 chars max)
       - Meta descriptions (160 chars max)
       - Target keyword strategies
    
    4. SOCIAL MEDIA STRATEGY (4-5 posts per platform):
       - LinkedIn professional posts with hashtags
       - Twitter/X thought leadership posts
       - Platform-specific engagement strategies
    
    5. EMAIL CAMPAIGN SERIES (3-4 emails):
       - Subject lines and preview text
       - Email body outlines
       - Call-to-action strategies
    
    6. STRATEGIC REASONING:
       - Why this content strategy aligns with the persona and goal
       - How it addresses specific business challenges
       - Expected outcomes and KPIs
    
    Format your response as a JSON array where each object represents a content strategy theme:
    {
      "topicArea": "Specific strategic theme name",
      "pillarContent": ["Detailed pillar content title and description", "..."],
      "supportPages": ["Specific support content title and description", "..."],
      "metaTags": [{"title": "SEO optimized title", "description": "Meta description"}, "..."],
      "socialMedia": ["Platform-specific post with hashtags", "..."],
      "email": [{"subject": "Email subject", "preview": "Preview text", "outline": "Body outline"}, "..."],
      "reasoning": "Comprehensive strategic explanation of why this content strategy will achieve the specified goal for the target persona, including specific business outcomes and metrics"
    }
    
    IMPORTANT: Return ONLY the JSON array with no additional text, comments, or explanations.
  `;

  try {
    console.log(`Making OpenAI API request for strategic content suggestions`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: "system",
            content: "You are a strategic content advisor for B2B SaaS companies specializing in office space software. You provide comprehensive, actionable content strategies that drive business results."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      console.error(`OpenAI API error: ${response.status} ${response.statusText}`);
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error("No content received from OpenAI");
    }
    
    console.log("Received OpenAI strategic content of length:", content.length);

    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      const cleanJsonString = jsonString.replace(/^[\s\S]*?(\[[\s\S]*\])[\s\S]*$/, "$1").trim();
      
      console.log("Processing strategic JSON content...");
      const parsedContent = JSON.parse(cleanJsonString);
      console.log(`Successfully parsed ${parsedContent.length} strategic content suggestions`);
      
      return parsedContent;
    } catch (parseError) {
      console.error("Error parsing OpenAI strategic response:", parseError);
      console.error("Raw content:", content);
      throw new Error("Failed to parse strategic content suggestions");
    }
  } catch (error) {
    console.error("Error generating strategic content suggestions:", error);
    throw error;
  }
};
