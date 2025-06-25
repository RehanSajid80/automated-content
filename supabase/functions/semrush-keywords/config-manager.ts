
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Initialize Supabase client for reading global API keys
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to get global API key from database
export async function getGlobalApiKey(keyName: string): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('key_name', keyName)
      .is('user_id', null) // Global keys have null user_id
      .eq('is_active', true)
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching global API key:', error);
      return null;
    }
    
    if (!data) {
      console.log(`Global API key ${keyName} not found`);
      return null;
    }
    
    // Decrypt the key (simple base64 decoding)
    try {
      return atob(data.encrypted_key);
    } catch {
      // If decoding fails, return as-is (might not be encrypted)
      return data.encrypted_key;
    }
  } catch (error) {
    console.error('Error in getGlobalApiKey:', error);
    return null;
  }
}

// Function to get global keyword limit setting
export async function getGlobalKeywordLimit(): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('key_name', 'semrush-keyword-limit')
      .is('user_id', null)
      .eq('is_active', true)
      .maybeSingle();
    
    if (!error && data) {
      const limit = parseInt(data.encrypted_key, 10);
      return isNaN(limit) ? 100 : limit;
    }
  } catch (error) {
    console.error('Error fetching global keyword limit:', error);
  }
  
  return 100; // Default limit
}
