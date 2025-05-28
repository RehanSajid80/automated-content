
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
    const { error } = await supabaseAdmin
      .from('semrush_keywords')
      .delete()
      .eq('domain', domain)
      .eq('topic_area', topicArea);
    
    if (error) {
      console.error('Error during deletion of existing keywords:', error);
      throw error;
    }
    
    console.log(`Successfully deleted existing keywords for domain: ${domain} and topic: ${topicArea}`);
  } catch (deleteError) {
    console.error('Error during deletion of existing keywords:', deleteError);
    throw deleteError;
  }
};

// Insert new keywords into database with better error handling
export const insertKeywords = async (keywords: any[]) => {
  const insertedKeywords = [];
  
  // Try batch insert first
  try {
    const { data, error } = await supabaseAdmin
      .from('semrush_keywords')
      .insert(keywords)
      .select();

    if (!error && data) {
      console.log(`Successfully batch inserted ${data.length} keywords`);
      return data;
    }
  } catch (batchError) {
    console.log('Batch insert failed, falling back to individual inserts');
  }
  
  // Fall back to individual inserts if batch fails
  for (const keyword of keywords) {
    try {
      const { data, error: insertError } = await supabaseAdmin
        .from('semrush_keywords')
        .insert([keyword])
        .select();

      if (!insertError && data) {
        insertedKeywords.push(data[0]);
      } else if (insertError && !insertError.message.includes('duplicate key')) {
        console.error(`Error inserting keyword "${keyword.keyword}":`, insertError);
      }
    } catch (err) {
      if (!err.message?.includes('duplicate key')) {
        console.error(`Exception inserting keyword "${keyword.keyword}":`, err);
      }
    }
  }
  
  return insertedKeywords;
};
