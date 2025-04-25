interface ContentGenerationParams {
  contentType: string;
  mainKeyword: string;
  keywords: string[];
  targetUrl?: string;
  minWords?: number;
  socialContext?: string;
}

export async function generatePillarContentWithExtension(
  apiKey: string, 
  params: ContentGenerationParams, 
  initialContent: string
): Promise<string> {
  const currentWordCount = initialContent.split(/\s+/).filter(word => word.length > 0).length;
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
    
    const combinedContent = `${initialContent}\n\n${additionalContent}`;
    console.log(`Extended content to ${combinedContent.split(/\s+/).filter(word => word.length > 0).length} words`);
    
    return combinedContent;
  } catch (error) {
    console.error("Error generating extended content:", error);
    return initialContent;
  }
}
