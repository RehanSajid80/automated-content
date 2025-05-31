
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TopicAreaSelector } from "./TopicAreaSelector";
import { CustomKeywordsInput } from "./CustomKeywordsInput";
import { MarketingPersonaSelector } from "./MarketingPersonaSelector";
import { MarketingContentGoalSelector } from "./MarketingContentGoalSelector";
import { ContextInput } from "./ContextInput";
import { FileUploadInput } from "./FileUploadInput";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import { Loader2, Lightbulb } from "lucide-react";
import { toast } from "sonner";

export const StrategicContentForm: React.FC = () => {
  const [topicArea, setTopicArea] = useState("");
  const [customKeywords, setCustomKeywords] = useState<string[]>([]);
  const [targetPersona, setTargetPersona] = useState("");
  const [contentGoal, setContentGoal] = useState("");
  const [context, setContext] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { sendToN8n, isLoading } = useN8nAgent();

  const handleGenerateSuggestions = async () => {
    // Validation
    if (!topicArea || !targetPersona || !contentGoal) {
      toast.error("Please fill in all required fields: Topic Area, Target Persona, and Content Goal");
      return;
    }

    try {
      console.log("StrategicContentForm: Starting content generation");
      console.log("Topic:", topicArea);
      console.log("Persona:", targetPersona);
      console.log("Goal:", contentGoal);
      console.log("Keywords:", customKeywords);

      // Create the payload for strategic content suggestions
      const payload = {
        topicArea,
        targetPersona,
        contentGoal,
        customKeywords,
        context,
        requestType: 'ai-suggestions',
        outputFormat: {
          pillarContent: "Comprehensive pillar content suggestions",
          supportContent: "Supporting content ideas",
          socialMediaPosts: "Social media post suggestions",
          emailSeries: "Email campaign suggestions"
        }
      };

      console.log("StrategicContentForm: Sending payload:", payload);

      // Use 'custom-keywords' webhook which has the correct AI Content Suggestions URL
      const result = await sendToN8n({
        customPayload: payload
      }, 'custom-keywords');

      console.log("StrategicContentForm: Received result:", result);

      if (result.success) {
        toast.success("AI content suggestions generated successfully!");
        console.log("StrategicContentForm: Content generated successfully");
      } else {
        toast.error("Failed to generate suggestions: " + (result.error || "Unknown error"));
        console.error("StrategicContentForm: Generation failed:", result.error);
      }
    } catch (error) {
      console.error("StrategicContentForm: Error generating suggestions:", error);
      toast.error("Failed to generate content suggestions");
    }
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
              Generating AI Suggestions...
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
