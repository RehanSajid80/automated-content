import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const payload = await req.json();
    const { 
      content_type = 'pillar',
      primary_keyword = '',
      related_keywords = '',
      topic_area = '',
      target_url = '',
      social_context = '',
      use_rag = true 
    } = payload;

    console.log('Enhanced Content Generation Request:', { content_type, primary_keyword, topic_area, use_rag });

    let ragExamples = '';
    let ragContext = '';

    // Fetch similar content using RAG if enabled
    if (use_rag && primary_keyword) {
      try {
        const ragResponse = await fetch(`${supabaseUrl}/functions/v1/rag-content-search`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: `${primary_keyword} ${related_keywords}`,
            content_type: content_type === 'all' ? null : content_type,
            topic_area: topic_area || null,
            limit: 3,
            similarity_threshold: 0.6
          })
        });

        if (ragResponse.ok) {
          const ragData = await ragResponse.json();
          const similarContent = ragData.results || [];

          if (similarContent.length > 0) {
            ragExamples = similarContent.map((item: any, index: number) => 
              `\n**Example ${index + 1} (${item.content_type}):**\nTitle: ${item.title}\nContent: ${item.excerpt}\nKeywords: ${item.keywords?.join(', ') || 'None'}\n`
            ).join('\n');

            ragContext = `\n\n**YOUR STYLE REFERENCE - Use these examples from your content library as style and structure guidance:**${ragExamples}\n\nMaintain consistency with the voice, tone, and structure patterns shown in these examples while creating new content about "${primary_keyword}".`;
          }
        }
      } catch (error) {
        console.error('RAG search failed, proceeding without examples:', error);
      }
    }

    // Enhanced system prompt with RAG context
    let systemPrompt = "";
    let userPrompt = "";

    switch (content_type) {
      case "pillar":
        systemPrompt = `You are an expert content writer specializing in office space and asset management technology. Your writing is authoritative, well-researched, and valuable to professionals in the field. Create content that demonstrates expertise while maintaining engaging, readable style with concise headlines and comprehensive content. Focus on providing specific actionable insights and practical examples throughout.${ragContext ? '\n\nIMPORTANT: Use the provided style references to maintain consistency with the established voice and approach.' : ''}`;
        
        userPrompt = `Create an in-depth, expert guide about "${primary_keyword}" that is AT LEAST 1500 words.${ragContext}

TITLE REQUIREMENTS:
- Create a concise, impactful title (maximum 60 characters)
- Make it action-oriented and benefit-focused
- Avoid long, complex phrases

CONTENT STRUCTURE:
1. Start with a compelling executive summary (2-3 short paragraphs)
2. Create 6-8 major sections with clear H2 headings
3. Include relevant H3 subheadings within each section
4. End with actionable takeaways and next steps

CONTENT REQUIREMENTS:
- Provide concrete examples from the office space management industry
- Include relevant statistics and research findings
- Address ROI and cost-benefit considerations
- Naturally incorporate these keywords: ${related_keywords}
${target_url ? `- Reference this URL when relevant: ${target_url}` : ''}

Format in proper Markdown with clear H1, H2, H3 headings, lists, and emphasis. The content MUST be AT LEAST 1500 words.`;
        break;

      case "social":
        systemPrompt = `You are a social media content strategist for OfficeSpace Software. You create engaging LinkedIn posts that mirror the company's conversational yet professional tone, using creative formatting, relevant emojis, and compelling storytelling to drive engagement.${ragContext ? '\n\nIMPORTANT: Use the provided style references to maintain consistency with successful social posts.' : ''}`;
        
        userPrompt = `Create 2-3 engaging LinkedIn posts about "${primary_keyword}" following OfficeSpace Software's distinctive social media style.${ragContext}

LENGTH REQUIREMENTS:
- Create posts that are 60-120 words (similar to successful examples)
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

CONTENT REQUIREMENTS:
- Naturally incorporate these keywords: ${related_keywords}
- Focus on employee benefits and workplace transformation
${target_url ? `- Reference or link to: ${target_url}` : ''}
${social_context ? `\nADDITIONAL CONTEXT:\n${social_context}` : ''}`;
        break;

      case "meta":
        systemPrompt = `You are an SEO specialist with expertise in technical SEO for B2B SaaS websites. You create optimized meta tags that improve search visibility while accurately representing page content.${ragContext ? '\n\nIMPORTANT: Use the provided examples to understand successful meta tag patterns.' : ''}`;
        
        userPrompt = `Create optimized meta tags for a page about "${primary_keyword}".${ragContext}

Based on best SEO practices for B2B SaaS websites, create:
1. Title tag (50-60 characters) that balances keyword usage with compelling copy
2. Meta description (140-155 characters) that includes a value proposition and call-to-action
3. 5 primary keywords in order of priority
4. 5 secondary long-tail keywords
5. Complete Open Graph tags
6. Twitter card tags
7. Suggested H1 heading for the page

TARGET KEYWORDS: ${related_keywords}
${target_url ? `TARGET URL: ${target_url}` : ''}`;
        break;

      case "support":
        systemPrompt = `You are a workplace technology expert writing for OfficeSpace Software. Your writing is conversational yet authoritative, data-driven, and solution-focused. You explain complex concepts in accessible terms while maintaining credibility through specific statistics and real-world examples.${ragContext ? '\n\nIMPORTANT: Use the provided examples to maintain the established voice and structure.' : ''}`;
        
        userPrompt = `Create an in-depth support guide about "${primary_keyword}" using OfficeSpace Software's distinctive voice and structure.${ragContext}

TONE & STYLE REQUIREMENTS:
- Conversational yet professional (use phrases like "now what?" or "here's the thing")
- Lead with compelling statistics and industry insights
- Problem-solution narrative structure
- Technical concepts explained in accessible language

DOCUMENT STRUCTURE:
1. **Key Takeaways** section with 4-5 bullet points highlighting main insights
2. **Problem Context** section with industry context and challenges
3. **Why Traditional Approaches Fall Short** explaining current pain points
4. **OfficeSpace Solution** section detailing how the software addresses challenges
5. **How It Works** with specific examples and outcomes
6. **Real-World Benefits** for different user types
7. **Getting Started** with clear next steps

CONTENT REQUIREMENTS:
- Include specific percentages, statistics, and data points throughout
- Naturally incorporate these keywords: ${related_keywords}
${target_url ? `- Reference this URL when relevant: ${target_url}` : ''}`;
        break;

      default:
        throw new Error("Invalid content type");
    }

    // Generate content with OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    // Save generated content to content_library
    const { data: savedContent, error: saveError } = await supabase
      .from('content_library')
      .insert({
        title: `Generated ${content_type} content: ${primary_keyword}`,
        content: generatedContent,
        content_type,
        topic_area: topic_area || 'general',
        keywords: related_keywords ? related_keywords.split(',').map((k: string) => k.trim()) : [primary_keyword],
        is_saved: true
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save content:', saveError);
    }

    // Generate embedding for the new content
    if (savedContent) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/content-embeddings`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'generate_embedding',
            content_id: savedContent.id,
            content_text: `${savedContent.title}\n\n${generatedContent}`,
            content_type,
            topic_area: topic_area || 'general',
            keywords: savedContent.keywords
          })
        });
      } catch (error) {
        console.error('Failed to generate embedding for new content:', error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      content: generatedContent,
      content_id: savedContent?.id,
      rag_used: ragExamples.length > 0,
      similar_content_found: ragExamples.length > 0 ? ragExamples.split('**Example').length - 1 : 0,
      metadata: {
        content_type,
        primary_keyword,
        topic_area,
        generated_at: new Date().toISOString()
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in enhanced content generation:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});