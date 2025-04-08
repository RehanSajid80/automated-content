
import { KeywordData } from "./excelUtils";
import { toast } from "@/hooks/use-toast";
import { getApiKey, API_KEYS } from "./apiKeyUtils";

interface ContentSuggestion {
  topicArea: string;
  pillarContent: string[];
  supportPages: string[];
  metaTags: string[];
  socialMedia: string[];
  reasoning: string;
}

export async function getContentSuggestions(
  keywords: KeywordData[],
  customApiKey?: string
): Promise<ContentSuggestion[]> {
  try {
    // Use provided API key or get from storage
    const apiKey = customApiKey || getApiKey(API_KEYS.OPENAI);
    
    if (!apiKey) {
      throw new Error("No OpenAI API key provided");
    }

    // Prepare the data for OpenAI
    const keywordData = keywords.map((kw) => ({
      keyword: kw.keyword,
      volume: kw.volume,
      difficulty: kw.difficulty,
      cpc: kw.cpc,
      trend: kw.trend,
    }));

    // Create the prompt for OpenAI
    const prompt = `
      I have the following keyword data for office space management content:
      ${JSON.stringify(keywordData, null, 2)}

      Based on this data, suggest 3-5 topic areas for content creation. 
      For each topic area, recommend:
      1. Pillar content ideas (comprehensive guides)
      2. Support page ideas (specific aspects of the topic)
      3. Meta tag suggestions (for SEO)
      4. Social media post ideas

      Prioritize keywords with higher volume, upward trends, and reasonable difficulty.
      Format your response as a JSON array where each object has:
      { 
        "topicArea": "Topic name", 
        "pillarContent": ["idea1", "idea2"], 
        "supportPages": ["idea1", "idea2"],
        "metaTags": ["tag1", "tag2"],
        "socialMedia": ["post idea1", "post idea2"],
        "reasoning": "Brief explanation of why this topic was chosen"
      }
    `;

    // Make the API call to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a content strategy expert specializing in SEO and office space management.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      const errorMessage = errorData.error?.message || `API error (${response.status})`;
      
      // Check for common API key issues
      if (response.status === 401) {
        throw new Error("Invalid API key. Please check your OpenAI API key and try again.");
      } else if (response.status === 429) {
        // More specific rate limit error handling
        const retryAfter = response.headers.get("retry-after");
        const waitTime = retryAfter ? parseInt(retryAfter) : 60;
        const waitMinutes = Math.ceil(waitTime / 60);
        
        throw new Error(
          `Rate limit exceeded. Your OpenAI account has reached its request limit. ` + 
          `Please wait approximately ${waitMinutes} ${waitMinutes === 1 ? 'minute' : 'minutes'} before trying again, ` +
          `or check your OpenAI usage limits at https://platform.openai.com/account/usage.`
        );
      } else {
        throw new Error(errorMessage);
      }
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error("No content returned from OpenAI");
    }

    // Extract the JSON from the response
    // The response might contain markdown or other formatting
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || 
                      content.match(/```\n([\s\S]*?)\n```/) || 
                      [null, content];
    
    const jsonString = jsonMatch[1] || content;
    
    try {
      const suggestions = JSON.parse(jsonString);
      return Array.isArray(suggestions) ? suggestions : [suggestions];
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      throw new Error("Failed to parse content suggestions from OpenAI");
    }
  } catch (error) {
    console.error("Error getting content suggestions:", error);
    toast({
      title: "OpenAI Error",
      description: error instanceof Error ? error.message : "Failed to get content suggestions",
      variant: "destructive",
    });
    throw error;
  }
}
