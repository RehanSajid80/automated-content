import { supabase } from "@/integrations/supabase/client";

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
 * Checks if the Supabase client is properly initialized
 */
export async function isSupabaseConnected(): Promise<boolean> {
  try {
    // Test connection by making a simple auth status request
    // This is safer than trying to query a table that might not exist
    const { data, error } = await supabase.auth.getSession();
    
    // If there's no connection error, Supabase is connected
    return !error;
  } catch (error) {
    console.error("Error checking Supabase connection:", error);
    return false;
  }
}

/**
 * Saves an API key to storage with metadata
 * Uses Supabase if connected and useSupabase is true, otherwise uses localStorage
 * 
 * @param storageKey - Unique identifier for the API key
 * @param apiKey - The actual API key value to store
 * @param name - Display name for this API connection (optional)
 * @param useSupabase - Whether to use Supabase storage when available (optional)
 */
export async function saveApiKey(
  storageKey: string, 
  apiKey: string, 
  name: string = 'Default',
  useSupabase: boolean = false
): Promise<void> {
  const info: ApiKeyInfo = {
    key: apiKey,
    name,
    lastUpdated: new Date().toISOString(),
    isActive: true,
    useSupabase
  };
  
  if (useSupabase) {
    const isConnected = await isSupabaseConnected();
    if (isConnected) {
      try {
        // Store in Supabase private user metadata if user is authenticated
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (user && !userError) {
          // Store in user metadata
          const { error } = await supabase.auth.updateUser({
            data: { 
              apiKeys: { 
                ...user.user_metadata?.apiKeys,
                [storageKey]: info 
              } 
            }
          });
          
          if (error) {
            console.error("Error storing API key in Supabase:", error);
            // Fallback to localStorage if there's an error
            localStorage.setItem(storageKey, JSON.stringify(info));
          }
        } else {
          // Fallback to localStorage if user not authenticated
          localStorage.setItem(storageKey, JSON.stringify(info));
        }
      } catch (error) {
        console.error("Error storing API key in Supabase:", error);
        // Fallback to localStorage
        localStorage.setItem(storageKey, JSON.stringify(info));
      }
    } else {
      // Fallback to localStorage if Supabase not connected
      localStorage.setItem(storageKey, JSON.stringify(info));
    }
  } else {
    // Store in localStorage
    localStorage.setItem(storageKey, JSON.stringify(info));
  }
}

/**
 * Retrieves an API key info object from storage
 * Will check Supabase first if the key is flagged for Supabase storage
 */
export async function getApiKeyInfo(storageKey: string): Promise<ApiKeyInfo | null> {
  // First check localStorage to see if we have the info and whether it's flagged for Supabase
  const localData = localStorage.getItem(storageKey);
  let localInfo: ApiKeyInfo | null = null;
  
  if (localData) {
    try {
      localInfo = JSON.parse(localData) as ApiKeyInfo;
      
      // If this key is meant to use Supabase, try getting from Supabase
      if (localInfo?.useSupabase) {
        const isConnected = await isSupabaseConnected();
        
        if (isConnected) {
          try {
            // Get from Supabase private user metadata
            const { data: { user }, error: userError } = await supabase.auth.getUser();
            
            if (user && !userError) {
              const supabaseInfo = user.user_metadata?.apiKeys?.[storageKey] as ApiKeyInfo;
              
              if (supabaseInfo) {
                // Update localStorage with the data from Supabase
                localStorage.setItem(storageKey, JSON.stringify(supabaseInfo));
                return supabaseInfo;
              }
              
              // If we couldn't find in Supabase but it's flagged for Supabase,
              // save the local copy to Supabase
              await saveApiKey(storageKey, localInfo.key, localInfo.name, true);
            }
          } catch (error) {
            console.error("Error retrieving API key from Supabase:", error);
          }
        }
      }
      
      return localInfo;
    } catch (error) {
      console.error(`Error parsing API key info for ${storageKey}:`, error);
      return null;
    }
  }
  
  // If nothing in localStorage, check Supabase as a last resort
  try {
    const isConnected = await isSupabaseConnected();
    
    if (isConnected) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (user && !userError) {
        const supabaseInfo = user.user_metadata?.apiKeys?.[storageKey] as ApiKeyInfo;
        
        if (supabaseInfo) {
          // Update localStorage with the data from Supabase
          localStorage.setItem(storageKey, JSON.stringify(supabaseInfo));
          return supabaseInfo;
        }
      }
    }
  } catch (error) {
    console.error("Error retrieving API key from Supabase:", error);
  }
  
  return null;
}

/**
 * Retrieves just the API key from storage
 * Simplified version of getApiKeyInfo that returns just the key
 */
export async function getApiKey(storageKey: string): Promise<string | null> {
  const info = await getApiKeyInfo(storageKey);
  return info?.key || null;
}

/**
 * Updates an existing API key with new information
 */
export async function updateApiKey(
  storageKey: string, 
  apiKey: string, 
  name?: string,
  useSupabase?: boolean
): Promise<void> {
  const existingInfo = await getApiKeyInfo(storageKey);
  
  if (existingInfo) {
    const updatedInfo: ApiKeyInfo = {
      ...existingInfo,
      key: apiKey,
      lastUpdated: new Date().toISOString(),
      ...(name !== undefined && { name }),
      ...(useSupabase !== undefined && { useSupabase })
    };
    
    if (updatedInfo.useSupabase) {
      const isConnected = await isSupabaseConnected();
      if (isConnected) {
        try {
          // Update in Supabase
          const { data: { user }, error: userError } = await supabase.auth.getUser();
          
          if (user && !userError) {
            const { error } = await supabase.auth.updateUser({
              data: { 
                apiKeys: { 
                  ...user.user_metadata?.apiKeys,
                  [storageKey]: updatedInfo 
                } 
              }
            });
            
            if (error) {
              console.error("Error updating API key in Supabase:", error);
              // Fallback to localStorage
              localStorage.setItem(storageKey, JSON.stringify(updatedInfo));
            }
          } else {
            // Fallback to localStorage
            localStorage.setItem(storageKey, JSON.stringify(updatedInfo));
          }
        } catch (error) {
          console.error("Error updating API key in Supabase:", error);
          // Fallback to localStorage
          localStorage.setItem(storageKey, JSON.stringify(updatedInfo));
        }
      } else {
        // Fallback to localStorage
        localStorage.setItem(storageKey, JSON.stringify(updatedInfo));
      }
    } else {
      // Update in localStorage
      localStorage.setItem(storageKey, JSON.stringify(updatedInfo));
    }
  } else {
    await saveApiKey(storageKey, apiKey, name || 'Default', useSupabase);
  }
}

/**
 * Removes an API key from storage
 */
export async function removeApiKey(storageKey: string): Promise<void> {
  const info = await getApiKeyInfo(storageKey);
  
  if (info?.useSupabase) {
    const isConnected = await isSupabaseConnected();
    
    if (isConnected) {
      try {
        // Remove from Supabase
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (user && !userError && user.user_metadata?.apiKeys) {
          const apiKeys = { ...user.user_metadata.apiKeys };
          delete apiKeys[storageKey];
          
          const { error } = await supabase.auth.updateUser({
            data: { apiKeys }
          });
          
          if (error) {
            console.error("Error removing API key from Supabase:", error);
          }
        }
      } catch (error) {
        console.error("Error removing API key from Supabase:", error);
      }
    }
  }
  
  // Always remove from localStorage
  localStorage.removeItem(storageKey);
}

/**
 * Lists all stored API keys (without exposing the actual keys)
 */
export async function listApiKeys(): Promise<{ [key: string]: Omit<ApiKeyInfo, 'key'> & { id: string, hasKey: boolean } }> {
  const result: { [key: string]: any } = {};
  
  // First get keys from localStorage
  Object.values(API_KEYS).forEach(storageKey => {
    const localData = localStorage.getItem(storageKey);
    if (localData) {
      try {
        const info = JSON.parse(localData) as ApiKeyInfo;
        // Create a safe version without the actual key
        const { key, ...safeInfo } = info;
        result[storageKey] = {
          ...safeInfo,
          id: storageKey,
          hasKey: Boolean(key)
        };
      } catch (error) {
        console.error(`Error parsing API key info for ${storageKey}:`, error);
      }
    }
  });
  
  // Check Supabase for additional keys
  try {
    const isConnected = await isSupabaseConnected();
    
    if (isConnected) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (user && !userError && user.user_metadata?.apiKeys) {
        // Add keys from Supabase, overriding duplicates
        Object.entries(user.user_metadata.apiKeys).forEach(([storageKey, info]) => {
          const apiInfo = info as ApiKeyInfo;
          // Create a safe version without the actual key
          const { key, ...safeInfo } = apiInfo;
          result[storageKey] = {
            ...safeInfo,
            id: storageKey,
            hasKey: Boolean(key)
          };
        });
      }
    }
  } catch (error) {
    console.error("Error retrieving API keys from Supabase:", error);
  }
  
  return result;
}

/**
 * Sets the preference to use Supabase for a specific API key
 */
export async function setSupabasePreference(storageKey: string, useSupabase: boolean): Promise<void> {
  const existingInfo = await getApiKeyInfo(storageKey);
  
  if (existingInfo) {
    await updateApiKey(storageKey, existingInfo.key, existingInfo.name, useSupabase);
  }
}

/**
 * Migrates all API keys to Supabase once connected
 * This would be called when Supabase connection is established
 */
export async function migrateKeysToSupabase(): Promise<void> {
  const isConnected = await isSupabaseConnected();
  
  if (!isConnected) {
    console.warn('Cannot migrate keys: Supabase is not connected');
    return;
  }
  
  // Get all keys from localStorage
  for (const storageKey of Object.values(API_KEYS)) {
    const info = await getApiKeyInfo(storageKey);
    if (info) {
      // Update the useSupabase flag and migrate
      await updateApiKey(storageKey, info.key, info.name, true);
    }
  }
}
