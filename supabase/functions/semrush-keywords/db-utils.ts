
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Check for existing cached keywords in database
export const getExistingKeywords = async (domain: string, topicArea: string) => {
  const { data: existingKeywords, error: fetchError } = await supabaseAdmin
    .from('semrush_keywords')
    .select('*')
    .eq('domain', domain)
    .eq('topic_area', topicArea);

  if (fetchError) {
    console.error('Error fetching existing keywords:', fetchError);
    throw new Error('Failed to check for existing keywords');
  }

  return existingKeywords;
};

// Delete existing keywords for a domain and topic
export const deleteExistingKeywords = async (domain: string, topicArea: string) => {
  try {
    await supabaseAdmin
      .from('semrush_keywords')
      .delete()
      .eq('domain', domain)
      .eq('topic_area', topicArea);
    
    console.log(`Successfully deleted existing keywords for domain: ${domain} and topic: ${topicArea}`);
  } catch (deleteError) {
    console.error('Error during deletion of existing keywords:', deleteError);
    throw deleteError;
  }
};

// Insert new keywords into database
export const insertKeywords = async (keywords: any[]) => {
  const insertedKeywords = [];
  for (const keyword of keywords) {
    try {
      const { data, error: insertError } = await supabaseAdmin
        .from('semrush_keywords')
        .insert([keyword])
        .select();

      if (insertError) {
        console.error(`Error inserting keyword "${keyword.keyword}":`, insertError);
      } else if (data) {
        insertedKeywords.push(data[0]);
      }
    } catch (err) {
      console.error(`Exception inserting keyword "${keyword.keyword}":`, err);
    }
  }
  return insertedKeywords;
};
