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
      systemPrompt = "You are a social media content strategist for OfficeSpace Software. You create engaging LinkedIn posts that mirror the company's conversational yet professional tone, using creative formatting, relevant emojis, and compelling storytelling to drive engagement.";
      userPrompt = `Create 2-3 engaging LinkedIn posts about "${mainKeyword}" following OfficeSpace Software's distinctive social media style.

STYLE REFERENCE - Use these examples for length, structure, and tone:

**Example 1**
☀️ Days are heating up, but your workplace mojo doesn't have to melt.

In our July newsletter:
🔹 Beat the heat (and bad chairs).
🔹 Design more inclusive floor plans.
🔹 Get total visibility into space use and assets.

🧠 Ready for a five‑minute brain‑boost by the pool?

**Example 2**
🚪✨Imagine walking into a meeting room and—𝘱𝘪𝘯𝘨—it's already booked. Or, sitting at a desk and—𝘱𝘪𝘯𝘨—you're checked in. No apps, no taps.

That's the magic of presence data and OfficeSpace's Universal Presence API: a single, secure connection that turns every badge swipe, Wi-Fi ping, or sensor signal (from equipment you already own!) into self-booking spaces and rock-solid utilization insights.

Employees dive straight into work.

**Example 3**
📦 Tired of chasing assets around the office?

OfficeSpace's asset tracking tools bring total clarity to your workplace. Know where everything is—without the manual audits.

Best time to post: Thursday at 10 AM

LENGTH REQUIREMENTS:
- Create posts that are 60-120 words (similar to Example 2)
- Include multiple paragraphs with clear narrative flow
- Add descriptive details and specific scenarios
- Expand on benefits and outcomes, not just features

FORMATTING REQUIREMENTS:
- Start with an engaging emoji that relates to the content
- Use conversational, friendly language with personality
- Include creative formatting (italics, em dashes, bullet points with emoji)
- Use 🔹 for bullet points when listing features/benefits
- Include vivid imagery and "imagine" scenarios
- End with a short, punchy conclusion or CTA
- Format posts in plain text with no HTML
- Include best posting time recommendation

CONTENT REQUIREMENTS:
- Naturally incorporate these keywords: ${keywords.join(", ")}
- Focus on employee benefits and workplace transformation
- Use OfficeSpace-specific terminology and features
- Include concrete outcomes and benefits
- Make it feel authentic to the OfficeSpace brand voice

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
      systemPrompt = "You are a workplace technology expert writing for OfficeSpace Software. Your writing is conversational yet authoritative, data-driven, and solution-focused. You explain complex concepts in accessible terms while maintaining credibility through specific statistics and real-world examples.";
      userPrompt = `Create an in-depth support guide about "${mainKeyword}" using OfficeSpace Software's distinctive voice and structure.

TONE & STYLE REQUIREMENTS:
- Conversational yet professional (use phrases like "now what?" or "here's the thing")
- Lead with compelling statistics and industry insights
- Problem-solution narrative structure
- Technical concepts explained in accessible language
- Concrete benefits and outcomes, not just features
- Strong, actionable conclusions

DOCUMENT STRUCTURE:
1. **Key Takeaways** section with 4-5 bullet points highlighting main insights with specific data points
2. **Problem Context** section with industry context and challenges (include relevant statistics)
3. **Why Traditional Approaches Fall Short** explaining current pain points
4. **OfficeSpace Solution** section detailing how the software addresses these challenges
5. **How It Works** with specific examples and outcomes
6. **Real-World Benefits** for different user types (workplace teams, employees, facilities)
7. **Getting Started** with clear next steps and call-to-action

CONTENT REQUIREMENTS:
- Include specific percentages, statistics, and data points throughout
- Reference real customer examples and use cases
- Use descriptive, engaging subheadings that tell a story
- Naturally incorporate these keywords: ${keywords.join(", ")}
- Include concrete examples of outcomes (e.g., "Walk into a room and it books itself")
- End with specific implementation steps and contact information
- Maintain focus on practical value and business impact

WRITING STYLE:
- Use active voice and direct language
- Break up text with bullet points and numbered lists
- Include rhetorical questions to engage readers
- Use metaphors and analogies to explain complex concepts
- Focus on outcomes and benefits rather than just features

The content should read like authoritative industry analysis while remaining approachable and actionable for facility managers and workplace teams.`;
      break;

    default:
      throw new Error("Invalid content type");
  }

  return { systemPrompt, userPrompt };
}
