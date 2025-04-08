
/**
 * Utility for managing API keys in the application
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
}

/**
 * Saves an API key to localStorage with metadata
 */
export function saveApiKey(storageKey: string, apiKey: string, name: string = 'Default'): void {
  const info: ApiKeyInfo = {
    key: apiKey,
    name,
    lastUpdated: new Date().toISOString(),
    isActive: true
  };
  
  localStorage.setItem(storageKey, JSON.stringify(info));
}

/**
 * Retrieves an API key info object from localStorage
 */
export function getApiKeyInfo(storageKey: string): ApiKeyInfo | null {
  const data = localStorage.getItem(storageKey);
  if (!data) return null;
  
  try {
    return JSON.parse(data) as ApiKeyInfo;
  } catch (error) {
    console.error(`Error parsing API key info for ${storageKey}:`, error);
    return null;
  }
}

/**
 * Retrieves just the API key from localStorage
 */
export function getApiKey(storageKey: string): string | null {
  const info = getApiKeyInfo(storageKey);
  return info?.key || null;
}

/**
 * Updates an existing API key with new information
 */
export function updateApiKey(storageKey: string, apiKey: string, name?: string): void {
  const existingInfo = getApiKeyInfo(storageKey);
  
  if (existingInfo) {
    const updatedInfo: ApiKeyInfo = {
      ...existingInfo,
      key: apiKey,
      lastUpdated: new Date().toISOString(),
      ...(name && { name })
    };
    
    localStorage.setItem(storageKey, JSON.stringify(updatedInfo));
  } else {
    saveApiKey(storageKey, apiKey, name);
  }
}

/**
 * Removes an API key from localStorage
 */
export function removeApiKey(storageKey: string): void {
  localStorage.removeItem(storageKey);
}

/**
 * Lists all stored API keys (without exposing the actual keys)
 */
export function listApiKeys(): { [key: string]: Omit<ApiKeyInfo, 'key'> & { id: string, hasKey: boolean } } {
  const result: { [key: string]: any } = {};
  
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
  
  return result;
}
