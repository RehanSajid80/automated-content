
import { API_KEYS, getApiKey } from "@/utils/apiKeyUtils";
import { OPENAI_MODELS } from "@/utils/openaiUtils";

interface ContentGenerationParams {
  contentType: string;
  mainKeyword: string;
  keywords: string[];
  targetUrl?: string;
  minWords?: number;
  socialContext?: string;
}

export async function generateContentByType(params: ContentGenerationParams): Promise<string> {
  const apiKey = await getApiKey(API_KEYS.OPENAI);
  if (!apiKey) {
    throw new Error("OpenAI API key not found");
  }

  const { systemPrompt, userPrompt } = await getPrompts(params);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: params.contentType === 'pillar' ? 4500 : 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    if (params.contentType === 'pillar') {
      const wordCount = countWords(generatedContent);
      console.log(`Generated ${params.contentType} content with ${wordCount} words`);
      
      if (wordCount < (params.minWords || 1500)) {
        console.log("Content too short, regenerating with extension...");
        return generatePillarContentWithExtension(apiKey, params, generatedContent);
      }
    }
    
    return generatedContent;
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to generate content");
  }
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

