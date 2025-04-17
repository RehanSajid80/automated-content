
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
      systemPrompt = "You are an expert content writer specializing in office space and asset management technology. Write comprehensive, well-structured content that is engaging and informative. Your content should be thorough, detailed, and provide significant value to readers.";
      userPrompt = `Create a comprehensive guide about "${params.mainKeyword}" that is AT LEAST ${params.minWords || 1500} words. 
                    Include practical examples, industry statistics, actionable insights, and address common questions.
                    Structure the content with a clear introduction, multiple sections with descriptive headings and subheadings, and a conclusion.
                    Cover the topic from multiple angles including benefits, challenges, implementation strategies, and future trends.
                    Incorporate these keywords naturally throughout the content: ${params.keywords.join(", ")}.
                    Ensure the content is optimized for SEO while maintaining high readability and value for the audience.
                    For asset management topics, include information about tracking systems, software solutions, and ROI calculations.
                    Format the content in Markdown with proper headings (H1, H2, H3), bullet points, and numbered lists where appropriate.`;
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
        max_tokens: params.contentType === 'pillar' ? 4500 : 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    // For pillar content, verify it meets minimum word count
    if (params.contentType === 'pillar') {
      const wordCount = countWords(generatedContent);
      console.log(`Generated ${params.contentType} content with ${wordCount} words`);
      
      if (wordCount < (params.minWords || 1200)) {
        console.log("Content too short, regenerating with more detailed instructions...");
        return generatePillarContentWithExtension(apiKey, params, generatedContent);
      }
    }
    
    return generatedContent;
  } catch (error) {
    console.error("Error generating content:", error);
    throw new Error("Failed to generate content");
  }
}

// Count words in a string
function countWords(text: string): number {
  return text.split(/\s+/).filter(word => word.length > 0).length;
}

// Generate extended pillar content if initial content is too short
async function generatePillarContentWithExtension(
  apiKey: string, 
  params: ContentGenerationParams, 
  initialContent: string
): Promise<string> {
  const currentWordCount = countWords(initialContent);
  const additionalWordsNeeded = (params.minWords || 1200) - currentWordCount;
  
  if (additionalWordsNeeded <= 0) {
    return initialContent;
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
          { 
            role: 'system', 
            content: "You are an expert content writer specializing in expanding and enhancing existing content. You provide additional sections, examples, and depth to make content more comprehensive."
          },
          { 
            role: 'user', 
            content: `I have the following content about "${params.mainKeyword}" but it needs to be expanded by approximately ${additionalWordsNeeded} words to reach a minimum of ${params.minWords || 1200} words.
                      
                      Please analyze this content and provide ADDITIONAL sections, examples, case studies, statistics, or deeper explanations that would enhance it. Focus on adding value, not just words.
                      
                      EXISTING CONTENT:
                      ${initialContent}
                      
                      Please provide ONLY the new content to add, formatted in Markdown. I will integrate it with the existing content.`
          }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const additionalContent = data.choices[0].message.content;
    
    // Combine initial content with additional content
    const combinedContent = `${initialContent}\n\n${additionalContent}`;
    const finalWordCount = countWords(combinedContent);
    
    console.log(`Extended content to ${finalWordCount} words`);
    return combinedContent;
  } catch (error) {
    console.error("Error generating extended content:", error);
    return initialContent; // Return the original content if extension fails
  }
}
