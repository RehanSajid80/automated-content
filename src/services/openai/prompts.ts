interface ContentGenerationParams {
  contentType: string;
  mainKeyword: string;
  keywords: string[];
  targetUrl?: string;
  minWords?: number;
  socialContext?: string;
}

interface Prompts {
  systemPrompt: string;
  userPrompt: string;
}

export async function getPrompts(params: ContentGenerationParams): Promise<Prompts> {
  const { contentType, mainKeyword, keywords, targetUrl, minWords, socialContext } = params;

  let systemPrompt = "";
  let userPrompt = "";

  switch (contentType) {
    case "pillar":
      systemPrompt = "You are an expert content writer specializing in office space and asset management technology. Your writing is authoritative, well-researched, and valuable to professionals in the field. Create content that demonstrates expertise while maintaining engaging, readable style with concise headlines and comprehensive content. Focus on providing specific actionable insights and practical examples throughout.";
      userPrompt = `Create an in-depth, expert guide about "${mainKeyword}" that is AT LEAST ${minWords || 1500} words. 

TITLE REQUIREMENTS:
- Create a concise, impactful title (maximum 60 characters)
- Make it action-oriented and benefit-focused
- Avoid long, complex phrases
- Example format: "Office Asset Management: A Strategic Guide" instead of "The Ultimate Guide to Asset Management in Office Spaces: Explore the foundational elements..."

CONTENT STRUCTURE:
1. Start with a compelling executive summary (2-3 short paragraphs)
2. Create 6-8 major sections with clear H2 headings
3. Include relevant H3 subheadings within each section
4. End with actionable takeaways and next steps

CONTENT REQUIREMENTS:
- Provide concrete examples from the office space management industry
- Include relevant statistics and research findings
- Address ROI and cost-benefit considerations
- Discuss integration with existing office management systems
- Cover best practices and common pitfalls
- Include specific OfficeSpace Software features where relevant
- Naturally incorporate these keywords: ${keywords.join(", ")}

SECTIONS TO INCLUDE:
- Current challenges in office asset management
- Technology solutions and integrations
- Implementation strategies
- ROI and performance metrics
- Future trends and innovations
- Case studies and success stories
- Best practices and optimization tips

CONTENT STYLE:
- Use clear, professional language
- Break up text with bullet points and numbered lists
- Include specific examples and scenarios
- Focus on practical implementation
- Target facility managers and operations leaders

Format in proper Markdown with clear H1, H2, H3 headings, lists, and emphasis. The content MUST be AT LEAST ${minWords || 1500} words.`;
      break;

    case "social":
      systemPrompt = "You are a social media content strategist for B2B SaaS companies specializing in workplace technology. You create engaging, shareable content that drives engagement and demonstrates thought leadership. You incorporate relevant emojis to improve engagement while maintaining professionalism.";
      userPrompt = `Create a set of 6 engaging social media posts about "${mainKeyword}" - 3 for LinkedIn and 3 for Twitter.

FOR EACH PLATFORM:
- Create 1 educational post sharing a valuable insight or tip
- Create 1 thought leadership post positioning the brand as an industry expert
- Create 1 engagement post asking questions or encouraging discussion

CONTENT REQUIREMENTS:
- Each post should be unique and incorporate different aspects of these keywords: ${keywords.join(", ")}
- LinkedIn posts should be professional, detailed (200-300 characters), and include relevant emojis (2-3 per post) from this set:
  🏢 (office building)
  📊 (analytics/data)
  💡 (insights/ideas)
  ✨ (highlights/features)
  🚀 (growth/success)
  📈 (positive trends)
  🎯 (targets/goals)
  🤝 (partnerships/collaboration)
  💼 (business/workplace)
  ⭐ (excellence/quality)
  ✅ (completion/success)
  🔑 (key points/solutions)
  
- Twitter posts should be concise (under 280 characters) and use casual but professional emojis (1-2 per post) from this set:
  📱 (mobile/tech)
  🔍 (search/discover)
  💫 (innovation)
  🎉 (celebration)
  👥 (teams/people)
  📍 (location)
  💪 (empowerment)
  🌟 (highlights)
  ⚡ (quick tips)
  🎪 (workspace)
  
- Include relevant hashtags tailored to each platform (3-5 per post)
- Each post should start with the most relevant emoji for its content
- Space emojis naturally throughout the text, don't cluster them
- Include a strong call-to-action in each post

${socialContext ? `\nADDITIONAL CONTEXT:\n${socialContext}` : ''}`;
      break;

    case "meta":
      systemPrompt = "You are an SEO specialist with expertise in technical SEO for B2B SaaS websites. You create optimized meta tags that improve search visibility while accurately representing page content.";
      userPrompt = `Analyze the target URL: ${targetUrl || "https://officespacesoftware.com"}
                    
Based on best SEO practices for B2B SaaS websites, create a complete set of optimized meta tags for a page about "${mainKeyword}" including:

1. Title tag (50-60 characters) that balances keyword usage with compelling copy
2. Meta description (140-155 characters) that includes a value proposition and call-to-action
3. 5 primary keywords in order of priority
4. 5 secondary long-tail keywords
5. Complete Open Graph tags (og:title, og:description, og:type, og:url, og:image)
6. Twitter card tags (twitter:card, twitter:title, twitter:description, twitter:image)
7. Suggested H1 heading for the page

TARGET KEYWORDS: ${keywords.join(", ")}

Your meta tags should prioritize click-through rate while maintaining keyword relevance. Format your response clearly with each element labeled and separated.`;
      break;

    case "support":
      systemPrompt = "You are a technical documentation specialist for enterprise software. You create clear, comprehensive support documentation that helps users troubleshoot issues and maximize their use of the software.";
      userPrompt = `Create a detailed support guide about "${mainKeyword}" for office space management software users.

DOCUMENT STRUCTURE:
1. Overview and key concepts (with clear definitions)
2. Step-by-step instructions for common tasks related to ${mainKeyword}
3. Frequently asked questions with comprehensive answers
4. Troubleshooting section addressing common issues and their solutions
5. Best practices and optimization tips
6. Related features and integration possibilities

CONTENT REQUIREMENTS:
- Include specific examples of how to use the features
- Create detailed step-by-step instructions with numbered steps
- Include pro tips and warnings where appropriate
- Use clear, concise language accessible to both technical and non-technical users
- Naturally incorporate these keywords: ${keywords.join(", ")}
- Format in proper Markdown with appropriate headings, lists, and code blocks where needed
- For technical instructions, provide specific UI navigation paths (e.g., "Settings > Users > Permissions")

The final document should be comprehensive, easy to follow, and serve as a valuable reference for users at different expertise levels.`;
      break;

    default:
      throw new Error("Invalid content type");
  }

  return { systemPrompt, userPrompt };
}
