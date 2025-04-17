
import { API_KEYS, getApiKey } from "./apiKeyUtils";

interface ContentGenerationParams {
  contentType: string;
  mainKeyword: string;
  keywords: string[];
  targetUrl?: string;
  minWords?: number;
}

export async function generateContentByType(params: ContentGenerationParams): Promise<string> {
  const apiKey = await getApiKey(API_KEYS.OPENAI);
  if (!apiKey) {
    throw new Error("OpenAI API key not found");
  }

  let systemPrompt = "";
  let userPrompt = "";

  switch (params.contentType) {
    case "pillar":
      systemPrompt = "You are an expert content writer specializing in office space and asset management technology. Write comprehensive, well-structured content that is engaging and informative.";
      userPrompt = `Create a comprehensive guide about "${params.mainKeyword}" that is at least ${params.minWords} words. 
                    Include practical examples, industry statistics, and actionable insights.
                    Use proper headings, subheadings, and incorporate these keywords naturally: ${params.keywords.join(", ")}.
                    Format the content in Markdown.`;
      break;

    case "social":
      systemPrompt = "You are a social media content expert for B2B software companies.";
      userPrompt = `Create a set of 5 engaging social media posts about "${params.mainKeyword}" for LinkedIn and Twitter.
                    Each post should be unique and incorporate different aspects of these keywords: ${params.keywords.join(", ")}.
                    Include relevant hashtags and call-to-actions.
                    Format each post clearly with "LinkedIn:" or "Twitter:" prefix.`;
      break;

    case "meta":
      systemPrompt = "You are an SEO expert specialized in B2B SaaS websites.";
      userPrompt = `Analyze the URL: ${params.targetUrl}
                    Create optimized meta tags including:
                    1. Title tag (50-60 characters)
                    2. Meta description (150-160 characters)
                    3. Primary and secondary keywords
                    4. Open Graph tags
                    Using these target keywords: ${params.keywords.join(", ")}`;
      break;

    case "support":
      systemPrompt = "You are a technical documentation writer for enterprise software.";
      userPrompt = `Create a comprehensive support guide about "${params.mainKeyword}".
                    Include:
                    1. Overview and key concepts
                    2. Step-by-step instructions
                    3. Common issues and solutions
                    4. Best practices
                    5. Related features
                    Format in Markdown and incorporate these keywords naturally: ${params.keywords.join(", ")}`;
      break;

    default:
      throw new Error("Invalid content type");
  }

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
        max_tokens: params.contentType === 'pillar' ? 4000 : 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to generate content");
  }
}
