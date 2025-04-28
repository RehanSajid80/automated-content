
import { KeywordData } from "@/utils/excelUtils";
import { API_KEYS, getApiKey } from "@/utils/apiKeyUtils";

interface ContentSuggestion {
  topicArea: string;
  pillarContent: string[];
  supportPages: string[];
  metaTags: string[];
  socialMedia: string[];
  reasoning: string;
  searchAnalysis?: {
    totalVolume?: number;
    averageDifficulty?: number;
    trendingKeywords?: string[];
    competitiveLandscape?: string;
  };
}

export async function getContentSuggestions(
  keywords: KeywordData[],
  toast?: any,
  model: string = 'gpt-4o'
): Promise<ContentSuggestion[]> {
  const apiKey = await getApiKey(API_KEYS.OPENAI);
  if (!apiKey) {
    throw new Error("OpenAI API key not found");
  }

  const keywordsText = keywords.map(k => 
    `"${k.keyword}" (search volume: ${k.volume || 'unknown'}, trend: ${k.trend || 'unknown'}, competitiveness: ${k.difficulty || 'unknown'})`
  ).join(", ");
  
  const prompt = `
    You are a senior content strategist for Office Space Software. Analyze these SEO keywords in depth: ${keywordsText}.
    
    For each logical topic group in these keywords, create high-value content recommendations:
    
    1. Create a descriptive topic area name that captures the essence of the keyword group
    2. Provide 2-3 pillar content ideas (comprehensive guides of 1500+ words) with detailed descriptions
    3. Suggest 3-4 supporting page ideas (focused content that addresses specific aspects)
    4. Create 2-3 meta tag ideas optimized for SEO and click-through rates
    5. Develop 2-3 engaging social media post ideas with platform-specific formatting
    6. Include an insightful reasoning section explaining the strategic value of your suggestions
    
    Ensure all recommendations are:
    - Highly specific to workplace management/office space software
    - Tailored to business professionals and decision-makers
    - Focused on solving real business challenges
    - Aligned with current industry trends and best practices
    
    Format your response as a JSON array where each object has the following structure:
    {
      "topicArea": "Specific, descriptive name for the topic area",
      "pillarContent": ["Detailed pillar content idea 1", "Detailed pillar content idea 2"],
      "supportPages": ["Specific support page idea 1", "Specific support page idea 2", "Specific support page idea 3"],
      "metaTags": ["Optimized meta tag 1", "Optimized meta tag 2"],
      "socialMedia": ["Engaging social post idea 1", "Engaging social post idea 2"],
      "reasoning": "Strategic explanation of why these content pieces will resonate with the target audience and address their needs"
    }
    
    IMPORTANT: Return ONLY the JSON array with no additional text, comments, or explanations.
  `;

  try {
    console.log(`Making OpenAI API request with model: ${model}`);
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: "system",
            content: "You are a strategic content advisor for B2B SaaS companies. You analyze SEO data and provide specific, actionable content recommendations that drive business results."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
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
    
    console.log("Received OpenAI content of length:", content.length);

    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonString = jsonMatch ? jsonMatch[1] : content;
      const cleanJsonString = jsonString.replace(/^[\s\S]*?(\[[\s\S]*\])[\s\S]*$/, "$1").trim();
      
      console.log("Processing JSON content...");
      const parsedContent = JSON.parse(cleanJsonString) as ContentSuggestion[];
      console.log(`Successfully parsed ${parsedContent.length} content suggestions`);
      
      return parsedContent;
    } catch (parseError) {
      console.error("Error parsing OpenAI response:", parseError);
      console.error("Raw content:", content);
      throw new Error("Failed to parse content suggestions");
    }
  } catch (error) {
    console.error("Error generating content suggestions:", error);
    throw error;
  }
}
