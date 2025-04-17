
const storeContentInLibrary = async (suggestion: ContentSuggestion) => {
  try {
    const insertPromises = [
      ...suggestion.pillarContent.map(content => 
        supabase.from('content_library').insert({
          topic_area: suggestion.topicArea,
          content_type: 'pillar',
          content: content,
          reasoning: suggestion.reasoning,
          keywords: keywords
            .filter(kw => selectedKeywords.includes(kw.keyword))
            .map(kw => kw.keyword),
          title: content.length > 80 ? content.substring(0, 80) + '...' : content
        })
      ),
      ...suggestion.supportPages.map(content => 
        supabase.from('content_library').insert({
          topic_area: suggestion.topicArea,
          content_type: 'support',
          content: content,
          reasoning: suggestion.reasoning,
          keywords: keywords
            .filter(kw => selectedKeywords.includes(kw.keyword))
            .map(kw => kw.keyword),
          title: content.length > 80 ? content.substring(0, 80) + '...' : content
        })
      ),
      ...suggestion.metaTags.map(content => 
        supabase.from('content_library').insert({
          topic_area: suggestion.topicArea,
          content_type: 'meta',
          content: content,
          reasoning: suggestion.reasoning,
          keywords: keywords
            .filter(kw => selectedKeywords.includes(kw.keyword))
            .map(kw => kw.keyword),
          title: content.length > 80 ? content.substring(0, 80) + '...' : content
        })
      ),
      ...suggestion.socialMedia.map(content => 
        supabase.from('content_library').insert({
          topic_area: suggestion.topicArea,
          content_type: 'social',
          content: content,
          reasoning: suggestion.reasoning,
          keywords: keywords
            .filter(kw => selectedKeywords.includes(kw.keyword))
            .map(kw => kw.keyword),
          title: content.length > 80 ? content.substring(0, 80) + '...' : content
        })
      )
    ];

    const results = await Promise.allSettled(insertPromises);

    const successCount = results.filter(result => 
      result.status === 'fulfilled' && 
      result.value.data !== null
    ).length;

    const failedCount = results.filter(result => 
      result.status === 'rejected' || 
      (result.status === 'fulfilled' && result.value.error !== null)
    ).length;

    if (successCount > 0) {
      toast({
        title: "Content Stored Successfully",
        description: `Stored ${successCount} content items for "${suggestion.topicArea}"`,
        variant: successCount === insertPromises.length ? "default" : "warning"
      });
    }

    if (failedCount > 0) {
      toast({
        title: "Partial Content Storage",
        description: `${failedCount} content items failed to store`,
        variant: "destructive"
      });
    }

  } catch (error) {
    console.error('Comprehensive Error storing content:', error);
    toast({
      title: "Storage Error",
      description: "Failed to store content in library",
      variant: "destructive"
    });
  }
};
