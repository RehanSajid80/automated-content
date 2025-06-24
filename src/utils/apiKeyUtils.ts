
import { supabase } from "@/integrations/supabase/client";

export const API_KEYS = {
  OPENAI: 'openai-api-key',
  SEMRUSH: 'semrush-api-key',
  N8N_WEBHOOK: 'n8n-webhook-url'
} as const;

// Simple encryption using base64 (can be enhanced later)
const encryptKey = (key: string): string => {
  try {
    return btoa(key);
  } catch (error) {
    console.warn("Encryption failed, storing as plain text");
    return key;
  }
};

const decryptKey = (encryptedKey: string): string => {
  try {
    return atob(encryptedKey);
  } catch {
    return encryptedKey; // Return as-is if not encrypted
  }
};

export const saveApiKey = async (keyName: string, keyValue: string, serviceName: string): Promise<void> => {
  if (!keyValue || keyValue.trim() === '') {
    throw new Error('API key cannot be empty');
  }

  console.log(`💾 Saving ${serviceName} API key globally for all users...`);

  try {
    const encryptedKey = encryptKey(keyValue);
    
    // Save to localStorage as immediate fallback
    localStorage.setItem(keyName, keyValue);
    console.log(`✅ ${serviceName} API key saved to localStorage as backup`);
    
    // Save to database as global configuration (no user authentication required)
    console.log(`🌐 Saving ${serviceName} API key to Supabase as global configuration...`);
    
    // Check if global key already exists
    const { data: existing } = await supabase
      .from('api_keys')
      .select('id')
      .eq('key_name', keyName)
      .is('user_id', null) // Global keys have null user_id
      .maybeSingle();

    const keyData = {
      user_id: null, // Global configuration - no user required
      service_name: serviceName.toLowerCase(),
      key_name: keyName,
      encrypted_key: encryptedKey,
      is_active: true
    };

    if (existing) {
      // Update existing global key
      const { error } = await supabase
        .from('api_keys')
        .update(keyData)
        .eq('id', existing.id);
        
      if (error) {
        console.error("❌ Supabase update failed:", error);
        throw new Error('Failed to update global API key in database');
      }
      console.log(`✅ ${serviceName} global API key updated in Supabase database`);
    } else {
      // Insert new global key
      const { error } = await supabase
        .from('api_keys')
        .insert(keyData);
        
      if (error) {
        console.error("❌ Supabase insert failed:", error);
        throw new Error('Failed to save global API key to database');
      }
      console.log(`✅ ${serviceName} global API key saved to Supabase database`);
    }
    
    console.log(`🌍 ${serviceName} API key now available globally for all users on any device`);
  } catch (error) {
    console.error('❌ Error saving API key:', error);
    throw error;
  }
};

export const getApiKey = async (keyName: string): Promise<string | null> => {
  console.log(`🔍 Retrieving global API key: ${keyName}`);
  
  try {
    // First try to get global configuration from database (no authentication required)
    console.log(`🌐 Checking Supabase for global ${keyName}...`);
    
    const { data, error } = await supabase
      .from('api_keys')
      .select('encrypted_key')
      .eq('key_name', keyName)
      .is('user_id', null) // Global keys have null user_id
      .eq('is_active', true)
      .maybeSingle();
    
    if (!error && data) {
      const decryptedKey = decryptKey(data.encrypted_key);
      console.log(`✅ ${keyName} retrieved from Supabase global configuration`);
      return decryptedKey;
    } else if (error) {
      console.error('❌ Database fetch error:', error);
    } else {
      console.log(`⚠️ ${keyName} not found in global configuration`);
    }
    
    // Fallback to localStorage only if database fails
    const localKey = localStorage.getItem(keyName);
    if (localKey) {
      console.log(`✅ ${keyName} retrieved from localStorage fallback`);
      return localKey;
    } else {
      console.log(`❌ ${keyName} not found anywhere`);
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting API key:', error);
    // Final fallback to localStorage
    const fallbackKey = localStorage.getItem(keyName);
    if (fallbackKey) {
      console.log(`✅ ${keyName} retrieved from localStorage (error fallback)`);
    }
    return fallbackKey;
  }
};

export const deleteApiKey = async (keyName: string): Promise<void> => {
  try {
    // Remove from localStorage
    localStorage.removeItem(keyName);
    
    // Remove from database (global configuration)
    const { error } = await supabase
      .from('api_keys')
      .delete()
      .eq('key_name', keyName)
      .is('user_id', null); // Global keys have null user_id
      
    if (error) {
      console.error('Database delete failed:', error);
    } else {
      console.log(`Deleted global ${keyName} from database`);
    }
  } catch (error) {
    console.error('Error deleting API key:', error);
    throw error;
  }
};

// Export removeApiKey as an alias for deleteApiKey
export const removeApiKey = deleteApiKey;
