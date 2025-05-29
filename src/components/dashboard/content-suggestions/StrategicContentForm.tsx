
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
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      console.log("Generating strategic content suggestions...");

      let fileContent = null;
      
      // Process file if uploaded
      if (selectedFile) {
        try {
          if (selectedFile.type === 'application/pdf') {
            // For PDF files, we'll send file info but note that full text extraction 
            // would require additional libraries
            fileContent = {
              fileName: selectedFile.name,
              fileType: selectedFile.type,
              fileSize: selectedFile.size,
              note: "PDF file uploaded - content extraction may be limited"
            };
          } else {
            // For text-based files, read the content
            const text = await selectedFile.text();
            fileContent = {
              fileName: selectedFile.name,
              fileType: selectedFile.type,
              fileSize: selectedFile.size,
              content: text
            };
          }
        } catch (error) {
          console.error("Error reading file:", error);
          toast.error("Error reading uploaded file. Proceeding without file content.");
        }
      }

      const payload = {
        topicArea,
        customKeywords,
        targetPersona,
        contentGoal,
        context,
        referenceDocument: fileContent,
        requestType: "contentSuggestions" as const
      };

      console.log("Sending payload to AI Content Suggestions webhook:", payload);

      // Explicitly use the content webhook by passing 'content' as the webhook option
      await sendToN8n(payload, 'content');

      toast.success("Content suggestions generated successfully!");
    } catch (error) {
      console.error("Error generating content suggestions:", error);
      toast.error("Failed to generate content suggestions. Please try again.");
    }
  };

  const isFormValid = topicArea && targetPersona && contentGoal;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          AI Content Suggestions
        </CardTitle>
        <CardDescription>
          Get targeted content suggestions based on personas and business goals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <TopicAreaSelector
            selectedTopic={topicArea}
            onTopicChange={setTopicArea}
            disabled={isLoading}
          />
          
          <MarketingPersonaSelector
            selectedPersona={targetPersona}
            onPersonaChange={setTargetPersona}
            disabled={isLoading}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <MarketingContentGoalSelector
            selectedGoal={contentGoal}
            onGoalChange={setContentGoal}
            disabled={isLoading}
          />

          <div className="md:col-span-1">
            <CustomKeywordsInput
              keywords={customKeywords}
              onKeywordsChange={setCustomKeywords}
              disabled={isLoading}
            />
          </div>
        </div>

        <ContextInput
          value={context}
          onChange={setContext}
          disabled={isLoading}
        />

        <FileUploadInput
          onFileSelect={setSelectedFile}
          disabled={isLoading}
        />

        <Button
          onClick={handleGenerateSuggestions}
          disabled={!isFormValid || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Suggestions...
            </>
          ) : (
            <>
              <Lightbulb className="mr-2 h-4 w-4" />
              Generate Suggestions
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
