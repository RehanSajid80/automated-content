
/**
 * Utility for managing API keys in the application
 * Supports both localStorage (for development/testing) and 
 * Supabase storage (for production) when connected
 */

// Storage keys for different API services
export const API_KEYS = {
  OPENAI: 'office-space-openai-key',
  // Add more API services as needed
};

export interface ApiKeyInfo {
  key: string;
  name: string;
  lastUpdated: string;
  isActive: boolean;
  useSupabase?: boolean; // Flag to indicate if this key should use Supabase
}

/**
 * Determines if Supabase is connected and available for use
 * This will be replaced with actual Supabase connection check
 * once the Supabase integration is complete
 */
export function isSupabaseConnected(): boolean {
  // This is a placeholder. Will be replaced with actual check
  // when Supabase integration is enabled
  return false;
}

/**
 * Saves an API key to localStorage with metadata
 * In future, will save to Supabase if connected and useSupabase is true
 * 
 * @param storageKey - Unique identifier for the API key
 * @param apiKey - The actual API key value to store
 * @param name - Display name for this API connection (optional)
 * @param useSupabase - Whether to use Supabase storage when available (optional)
 */
export function saveApiKey(
  storageKey: string, 
  apiKey: string, 
  name: string = 'Default',
  useSupabase: boolean = false
): void {
  const info: ApiKeyInfo = {
    key: apiKey,
    name,
    lastUpdated: new Date().toISOString(),
    isActive: true,
    useSupabase
  };
  
  if (useSupabase && isSupabaseConnected()) {
    // This will be implemented when Supabase is connected
    console.log('Supabase storage is not yet implemented');
    // For now, still save to localStorage as fallback
  }
  
  localStorage.setItem(storageKey, JSON.stringify(info));
}

/**
 * Retrieves an API key info object from storage
 * Will check Supabase first if the key is flagged for Supabase storage
 */
export function getApiKeyInfo(storageKey: string): ApiKeyInfo | null {
  // First try localStorage (always available)
  const data = localStorage.getItem(storageKey);
  if (!data) return null;
  
  try {
    const info = JSON.parse(data) as ApiKeyInfo;
    
    // In future: If this key is meant to use Supabase and Supabase is connected,
    // we would retrieve from Supabase instead and update localStorage
    
    return info;
  } catch (error) {
    console.error(`Error parsing API key info for ${storageKey}:`, error);
    return null;
  }
}

/**
 * Retrieves just the API key from storage
 */
export function getApiKey(storageKey: string): string | null {
  const info = getApiKeyInfo(storageKey);
  return info?.key || null;
}

/**
 * Updates an existing API key with new information
 */
export function updateApiKey(
  storageKey: string, 
  apiKey: string, 
  name?: string,
  useSupabase?: boolean
): void {
  const existingInfo = getApiKeyInfo(storageKey);
  
  if (existingInfo) {
    const updatedInfo: ApiKeyInfo = {
      ...existingInfo,
      key: apiKey,
      lastUpdated: new Date().toISOString(),
      ...(name !== undefined && { name }),
      ...(useSupabase !== undefined && { useSupabase })
    };
    
    if (updatedInfo.useSupabase && isSupabaseConnected()) {
      // This will be implemented when Supabase is connected
      console.log('Supabase storage update is not yet implemented');
      // For now, still save to localStorage as fallback
    }
    
    localStorage.setItem(storageKey, JSON.stringify(updatedInfo));
  } else {
    saveApiKey(storageKey, apiKey, name || 'Default', useSupabase);
  }
}

/**
 * Removes an API key from storage
 */
export function removeApiKey(storageKey: string): void {
  const info = getApiKeyInfo(storageKey);
  
  if (info?.useSupabase && isSupabaseConnected()) {
    // This will be implemented when Supabase is connected
    console.log('Supabase key removal is not yet implemented');
  }
  
  localStorage.removeItem(storageKey);
}

/**
 * Lists all stored API keys (without exposing the actual keys)
 */
export function listApiKeys(): { [key: string]: Omit<ApiKeyInfo, 'key'> & { id: string, hasKey: boolean } } {
  const result: { [key: string]: any } = {};
  
  // For now, just get keys from localStorage
  Object.values(API_KEYS).forEach(storageKey => {
    const info = getApiKeyInfo(storageKey);
    if (info) {
      // Create a safe version without the actual key
      const { key, ...safeInfo } = info;
      result[storageKey] = {
        ...safeInfo,
        id: storageKey,
        hasKey: Boolean(key)
      };
    }
  });
  
  // In future: Combine with keys from Supabase
  
  return result;
}

/**
 * Sets the preference to use Supabase for a specific API key
 */
export function setSupabasePreference(storageKey: string, useSupabase: boolean): void {
  const existingInfo = getApiKeyInfo(storageKey);
  
  if (existingInfo) {
    updateApiKey(storageKey, existingInfo.key, existingInfo.name, useSupabase);
  }
}

/**
 * Migrates all API keys to Supabase once connected
 * This would be called when Supabase connection is established
 */
export function migrateKeysToSupabase(): void {
  if (!isSupabaseConnected()) {
    console.warn('Cannot migrate keys: Supabase is not connected');
    return;
  }
  
  // Get all keys from localStorage
  Object.values(API_KEYS).forEach(storageKey => {
    const info = getApiKeyInfo(storageKey);
    if (info) {
      // Update the useSupabase flag
      updateApiKey(storageKey, info.key, info.name, true);
      
      // Future: actual migration to Supabase
    }
  });
}
