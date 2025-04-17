
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
      systemPrompt = "You are an expert content writer specializing in office space and asset management technology. Your writing is authoritative, well-researched, and valuable to professionals in the field. Create content that demonstrates expertise, builds trust, and positions the brand as an industry leader. Focus on providing specific actionable insights and practical examples throughout.";
      userPrompt = `Create an in-depth, comprehensive guide about "${params.mainKeyword}" that is AT LEAST ${params.minWords || 1500} words. 

CONTENT STRUCTURE:
1. Start with a compelling introduction that establishes the importance of ${params.mainKeyword} and outlines what the reader will learn
2. Create at least 5-7 major sections with descriptive H2 headings
3. Include relevant H3 subheadings within each section to organize information logically
4. End with a strong conclusion summarizing key points and providing next steps

CONTENT REQUIREMENTS:
- Include concrete examples, case studies, and specific scenarios throughout
- Provide practical, actionable advice that readers can implement immediately
- Cite specific industry statistics and research findings (you can create realistic examples)
- Address common challenges and provide detailed solutions
- Include pros and cons analysis where appropriate
- Discuss future trends and innovations in this area
- Naturally incorporate these keywords throughout: ${params.keywords.join(", ")}

CONTENT STYLE:
- Write in a professional but conversational tone
- Use active voice and second-person perspective where appropriate
- Break up text with bullet points and numbered lists for better readability
- Ensure all content is factually accurate and valuable to industry professionals
- Format in proper Markdown with headings (H1, H2, H3), lists, and emphasis

The content MUST be AT LEAST ${params.minWords || 1500} words and provide significant value to office space professionals.`;
      break;

    case "social":
      systemPrompt = "You are a social media content strategist for B2B SaaS companies specializing in workplace technology. You create engaging, shareable content that drives engagement and demonstrates thought leadership.";
      userPrompt = `Create a set of 6 engaging social media posts about "${params.mainKeyword}" - 3 for LinkedIn and 3 for Twitter.

FOR EACH PLATFORM:
- Create 1 educational post sharing a valuable insight or tip
- Create 1 thought leadership post positioning the brand as an industry expert
- Create 1 engagement post asking questions or encouraging discussion

CONTENT REQUIREMENTS:
- Each post should be unique and incorporate different aspects of these keywords: ${params.keywords.join(", ")}
- LinkedIn posts should be professional, detailed (200-300 characters), and include a strong call-to-action
- Twitter posts should be concise (under 280 characters) while still providing value
- Include relevant hashtags tailored to each platform (3-5 per post)
- For LinkedIn, suggest 1-2 appropriate emoji per post where relevant
- For Twitter, use more casual language while maintaining professionalism

Format each post clearly with "LinkedIn:" or "Twitter:" prefix, and separate each post with a line break. Include a brief note about the best time to post each type of content.`;
      break;

    case "meta":
      systemPrompt = "You are an SEO specialist with expertise in technical SEO for B2B SaaS websites. You create optimized meta tags that improve search visibility while accurately representing page content.";
      userPrompt = `Analyze the target URL: ${params.targetUrl || "https://officespacesoftware.com"}
                    
Based on best SEO practices for B2B SaaS websites, create a complete set of optimized meta tags for a page about "${params.mainKeyword}" including:

1. Title tag (50-60 characters) that balances keyword usage with compelling copy
2. Meta description (140-155 characters) that includes a value proposition and call-to-action
3. 5 primary keywords in order of priority
4. 5 secondary long-tail keywords
5. Complete Open Graph tags (og:title, og:description, og:type, og:url, og:image)
6. Twitter card tags (twitter:card, twitter:title, twitter:description, twitter:image)
7. Suggested H1 heading for the page

TARGET KEYWORDS: ${params.keywords.join(", ")}

Your meta tags should prioritize click-through rate while maintaining keyword relevance. Format your response clearly with each element labeled and separated.`;
      break;

    case "support":
      systemPrompt = "You are a technical documentation specialist for enterprise software. You create clear, comprehensive support documentation that helps users troubleshoot issues and maximize their use of the software.";
      userPrompt = `Create a detailed support guide about "${params.mainKeyword}" for office space management software users.

DOCUMENT STRUCTURE:
1. Overview and key concepts (with clear definitions)
2. Step-by-step instructions for common tasks related to ${params.mainKeyword}
3. Frequently asked questions with comprehensive answers
4. Troubleshooting section addressing common issues and their solutions
5. Best practices and optimization tips
6. Related features and integration possibilities

CONTENT REQUIREMENTS:
- Include specific examples of how to use the features
- Create detailed step-by-step instructions with numbered steps
- Include pro tips and warnings where appropriate
- Use clear, concise language accessible to both technical and non-technical users
- Naturally incorporate these keywords: ${params.keywords.join(", ")}
- Format in proper Markdown with appropriate headings, lists, and code blocks where needed
- For technical instructions, provide specific UI navigation paths (e.g., "Settings > Users > Permissions")

The final document should be comprehensive, easy to follow, and serve as a valuable reference for users at different expertise levels.`;
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
            content: "You are an expert content writer specializing in expanding and enhancing existing content with specific, detailed examples, case studies, and actionable insights. Your additions are seamlessly integrated, matching the tone and style of the original content while adding significant value."
          },
          { 
            role: 'user', 
            content: `I have the following content about "${params.mainKeyword}" but it needs to be expanded by approximately ${additionalWordsNeeded} words to reach a minimum of ${params.minWords || 1200} words.
                      
                      Please analyze this content and provide ADDITIONAL sections, detailed examples, case studies, statistics, and deeper explanations that would enhance it. Focus on adding specific, actionable value, not just words.
                      
                      EXISTING CONTENT:
                      ${initialContent}
                      
                      Please provide ONLY the new content to add, formatted in Markdown. I will integrate it with the existing content. Include at least one new major section (H2) with subsections (H3) that wasn't covered in the original content.`
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
