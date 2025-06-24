
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
      try {
        const { error } = await supabase
          .from('api_keys')
          .upsert({
            user_id: user.id,
            service_name: serviceName.toLowerCase(),
            key_name: keyName,
            encrypted_key: encryptedKey,
            is_active: true
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
        const { data, error } = await supabase
          .from('api_keys')
          .select('encrypted_key')
          .eq('user_id', user.id)
          .eq('key_name', keyName)
          .eq('is_active', true)
          .maybeSingle();
        
        if (!error && data) {
          return decryptKey(data.encrypted_key);
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
        await supabase
          .from('api_keys')
          .delete()
          .eq('user_id', user.id)
          .eq('key_name', keyName);
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
