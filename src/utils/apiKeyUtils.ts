
import { supabase } from "@/integrations/supabase/client";

export const API_KEYS = {
  OPENAI: 'openai-api-key',
  SEMRUSH: 'semrush-api-key',
  N8N_WEBHOOK: 'n8n-webhook-url'
} as const;

// Simple encryption/decryption using base64 (in production, use proper encryption)
const encryptKey = (key: string): string => {
  return btoa(key);
};

const decryptKey = (encryptedKey: string): string => {
  try {
    return atob(encryptedKey);
  } catch {
    return encryptedKey; // Return as-is if not encrypted
  }
};

export const saveApiKey = async (keyName: string, keyValue: string, serviceName: string): Promise<void> => {
  try {
    const encryptedKey = encryptKey(keyValue);
    
    // Save to localStorage as fallback
    localStorage.setItem(keyName, keyValue);
    
    // Try to save to database if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Use raw SQL to check if api_keys table exists and insert data
      try {
        const { error } = await supabase.rpc('exec_sql', {
          sql: `
            INSERT INTO api_keys (user_id, service_name, key_name, encrypted_key, is_active)
            VALUES ($1, $2, $3, $4, true)
            ON CONFLICT (user_id, service_name, key_name) 
            DO UPDATE SET 
              encrypted_key = EXCLUDED.encrypted_key,
              updated_at = now()
          `,
          params: [user.id, serviceName.toLowerCase(), keyName, encryptedKey]
        });
        
        if (error) {
          console.log('Database save failed, using localStorage only:', error);
        }
      } catch (dbError) {
        console.log('API keys table not available, using localStorage only');
      }
    }
  } catch (error) {
    console.error('Error saving API key:', error);
    throw error;
  }
};

export const getApiKey = async (keyName: string): Promise<string | null> => {
  try {
    // First try to get from database if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          sql: `
            SELECT encrypted_key 
            FROM api_keys 
            WHERE user_id = $1 AND key_name = $2 AND is_active = true
          `,
          params: [user.id, keyName]
        });
        
        if (!error && data && data.length > 0) {
          return decryptKey(data[0].encrypted_key);
        }
      } catch (dbError) {
        console.log('Database fetch failed, using localStorage');
      }
    }
    
    // Fallback to localStorage
    return localStorage.getItem(keyName);
  } catch (error) {
    console.error('Error getting API key:', error);
    // Fallback to localStorage
    return localStorage.getItem(keyName);
  }
};

export const deleteApiKey = async (keyName: string): Promise<void> => {
  try {
    // Remove from localStorage
    localStorage.removeItem(keyName);
    
    // Remove from database if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      try {
        await supabase.rpc('exec_sql', {
          sql: 'DELETE FROM api_keys WHERE user_id = $1 AND key_name = $2',
          params: [user.id, keyName]
        });
      } catch (dbError) {
        console.log('Database delete failed, but localStorage cleared');
      }
    }
  } catch (error) {
    console.error('Error deleting API key:', error);
    throw error;
  }
};

// Export removeApiKey as an alias for deleteApiKey to fix the import error
export const removeApiKey = deleteApiKey;
