
import { useState } from 'react';
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { suggestedUrls } from "@/components/dashboard/types/content";

export const useUrlSuggestions = () => {
  const [targetUrl, setTargetUrl] = useState(suggestedUrls[0]);
  const [urlExists, setUrlExists] = useState(true);
  const [existingMetaTags, setExistingMetaTags] = useState(false);
  const [isCheckingExistence, setIsCheckingExistence] = useState(false);

  const checkExistingMetaTags = async (url: string) => {
    try {
      const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .eq('content_type', 'meta')
        .ilike('content', `%${url}%`)
        .limit(1);
      
      if (error) {
        console.error("Error checking for existing meta tags:", error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (e) {
      console.error("Error in checkExistingMetaTags:", e);
      return false;
    }
  };

  const suggestNewUrl = (mainKeyword: string) => {
    const keywordSlug = mainKeyword.toLowerCase().replace(/\s+/g, '-');
    
    let newUrl = "";
    
    if (mainKeyword.includes("management")) {
      newUrl = `https://officespacesoftware.com/solutions/${keywordSlug}`;
    } else if (mainKeyword.includes("booking") || mainKeyword.includes("analytics") || 
               mainKeyword.includes("scheduling")) {
      newUrl = `https://officespacesoftware.com/features/${keywordSlug}`;
    } else {
      newUrl = `https://officespacesoftware.com/blog/${keywordSlug}`;
    }
    
    setTargetUrl(newUrl);
    setUrlExists(false);
    
    return newUrl;
  };

  const handleSuggestUrl = async (keywords: string) => {
    setIsCheckingExistence(true);
    
    const mainKeyword = keywords.split(',')[0]?.trim() || "office space management";
    const keywordSlug = mainKeyword.toLowerCase().replace(/\s+/g, '-');
    
    let foundUrl = suggestedUrls.find(url => 
      url.toLowerCase().includes(keywordSlug) || 
      url.toLowerCase().includes(mainKeyword.replace(/\s+/g, ''))
    );
    
    if (foundUrl) {
      setTargetUrl(foundUrl);
      setUrlExists(true);
    } else {
      foundUrl = suggestNewUrl(mainKeyword);
    }
    
    const tagsExist = await checkExistingMetaTags(foundUrl);
    setExistingMetaTags(tagsExist);
    
    setIsCheckingExistence(false);
    
    if (!urlExists) {
      toast("New page suggestion", {
        description: "We suggest creating a new target page for this keyword."
      });
    }
    
    if (tagsExist) {
      toast("Meta tags already exist", {
        description: "Meta tags for this URL already exist in the content library."
      });
    }
  };

  return {
    targetUrl,
    setTargetUrl,
    urlExists,
    existingMetaTags,
    isCheckingExistence,
    handleSuggestUrl
  };
};
