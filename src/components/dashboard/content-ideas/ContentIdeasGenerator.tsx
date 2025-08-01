import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Sparkles, Copy, RefreshCw } from "lucide-react";
import { TopicAreaSelector } from "../TopicAreaSelector";
import { PersonaSelector } from "../content-suggestions/PersonaSelector";
import { useToast } from "@/hooks/use-toast";
import { getApiKey, API_KEYS } from "@/utils/apiKeyUtils";

interface ContentIdea {
  title: string;
  description: string;
  contentType: string;
  targetAudience: string;
  keyPoints: string[];
  callToAction: string;
  keywords: string[];
  difficulty: "Easy" | "Medium" | "Hard";
  timeToCreate: string;
}

export const ContentIdeasGenerator: React.FC = () => {
  const [topicArea, setTopicArea] = useState("");
  const [targetKeywords, setTargetKeywords] = useState("");
  const [selectedPersona, setSelectedPersona] = useState("");
  const [contentGoal, setContentGoal] = useState("");
  const [ideas, setIdeas] = useState<ContentIdea[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateContentIdeas = async () => {
    if (!topicArea.trim()) {
      toast({
        title: "Topic Area Required",
        description: "Please select a topic area to generate content ideas.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const apiKey = await getApiKey(API_KEYS.OPENAI);
      if (!apiKey) {
        throw new Error("OpenAI API key not found. Please configure it in settings.");
      }

      const prompt = `
        Generate 5 specific, actionable content ideas for OfficeSpace software targeting workplace management professionals.
        
        Context:
        - Topic Area: ${topicArea}
        - Target Keywords: ${targetKeywords || "office space management, workplace optimization"}
        - Target Persona: ${selectedPersona || "Business Decision Makers"}
        - Content Goal: ${contentGoal || "Educational and lead generation"}
        
        For each idea, provide:
        1. Compelling title (specific to OfficeSpace use cases)
        2. Detailed description (2-3 sentences)
        3. Content type (Blog Post, Guide, Case Study, Infographic, Video, etc.)
        4. Target audience (specific job roles)
        5. 3-4 key points to cover
        6. Clear call-to-action
        7. Relevant keywords (3-5)
        8. Difficulty level (Easy/Medium/Hard)
        9. Estimated time to create
        
        Focus on real workplace challenges that OfficeSpace solves: space utilization, desk booking, employee experience, hybrid work management, workplace analytics.
        
        Return as JSON array with this structure:
        [
          {
            "title": "string",
            "description": "string", 
            "contentType": "string",
            "targetAudience": "string",
            "keyPoints": ["string"],
            "callToAction": "string",
            "keywords": ["string"],
            "difficulty": "Easy|Medium|Hard",
            "timeToCreate": "string"
          }
        ]
      `;

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4.1-2025-04-14',
          messages: [
            {
              role: "system",
              content: "You are a content strategy expert for B2B SaaS companies, specializing in workplace management and office space software. Generate specific, actionable content ideas that drive engagement and leads."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          temperature: 0.8,
          max_tokens: 2000,
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

      // Parse JSON response
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\[[\s\S]*\]/);
      const jsonString = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
      
      const generatedIdeas = JSON.parse(jsonString) as ContentIdea[];
      setIdeas(generatedIdeas);
      
      toast({
        title: "Content Ideas Generated!",
        description: `Generated ${generatedIdeas.length} content ideas for ${topicArea}`,
      });

    } catch (error) {
      console.error("Error generating content ideas:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate content ideas",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyIdeaToClipboard = (idea: ContentIdea) => {
    const formattedIdea = `
Title: ${idea.title}

Description: ${idea.description}

Content Type: ${idea.contentType}
Target Audience: ${idea.targetAudience}
Difficulty: ${idea.difficulty}
Time to Create: ${idea.timeToCreate}

Key Points:
${idea.keyPoints.map(point => `• ${point}`).join('\n')}

Call to Action: ${idea.callToAction}

Keywords: ${idea.keywords.join(', ')}
    `.trim();

    navigator.clipboard.writeText(formattedIdea);
    toast({
      title: "Copied!",
      description: "Content idea copied to clipboard",
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Medium": return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "Hard": return "bg-red-500/10 text-red-600 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            Content Ideas Generator
          </CardTitle>
          <CardDescription>
            Generate specific, actionable content ideas for OfficeSpace based on your topic areas and keywords
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic-area">Topic Area *</Label>
              <TopicAreaSelector 
                value={topicArea}
                onChange={setTopicArea}
              />
            </div>

            <div className="space-y-2">
              <PersonaSelector 
                selectedPersona={selectedPersona}
                onPersonaChange={setSelectedPersona}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keywords">Target Keywords</Label>
              <Input
                id="keywords"
                placeholder="e.g., desk booking, space utilization, hybrid work"
                value={targetKeywords}
                onChange={(e) => setTargetKeywords(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="goal">Content Goal</Label>
              <Input
                id="goal"
                placeholder="e.g., Lead generation, Educational, Brand awareness"
                value={contentGoal}
                onChange={(e) => setContentGoal(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={generateContentIdeas}
            disabled={isGenerating || !topicArea.trim()}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Generating Ideas...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Content Ideas
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Ideas Display */}
      {ideas.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Generated Content Ideas</h3>
          <div className="grid gap-4">
            {ideas.map((idea, index) => (
              <Card key={index} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight mb-2">{idea.title}</CardTitle>
                      <CardDescription className="text-sm">{idea.description}</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyIdeaToClipboard(idea)}
                      className="ml-4 shrink-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Metadata */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{idea.contentType}</Badge>
                    <Badge className={getDifficultyColor(idea.difficulty)}>
                      {idea.difficulty}
                    </Badge>
                    <Badge variant="outline">{idea.timeToCreate}</Badge>
                  </div>

                  {/* Target Audience */}
                  <div>
                    <span className="text-sm font-medium">Target Audience: </span>
                    <span className="text-sm text-muted-foreground">{idea.targetAudience}</span>
                  </div>

                  {/* Key Points */}
                  <div>
                    <span className="text-sm font-medium mb-2 block">Key Points to Cover:</span>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {idea.keyPoints.map((point, pointIndex) => (
                        <li key={pointIndex} className="flex items-start">
                          <span className="mr-2">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Call to Action */}
                  <div>
                    <span className="text-sm font-medium">Call to Action: </span>
                    <span className="text-sm text-muted-foreground">{idea.callToAction}</span>
                  </div>

                  {/* Keywords */}
                  <div>
                    <span className="text-sm font-medium mb-2 block">Keywords:</span>
                    <div className="flex flex-wrap gap-1">
                      {idea.keywords.map((keyword, keywordIndex) => (
                        <Badge key={keywordIndex} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};