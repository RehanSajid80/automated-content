
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { API_KEYS, getApiKey, saveApiKey, removeApiKey } from "@/utils/apiKeyUtils";

export const useOpenAIConnection = () => {
  const [openaiApiKey, setOpenaiApiKey] = useState("");
  const [openaiStatus, setOpenaiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const { toast } = useToast();

  // Check OpenAI API key on component mount
  const checkOpenAI = async () => {
    console.log('🔍 Checking global OpenAI connection...');
    setOpenaiStatus('checking');
    
    try {
      // Get global API key from Supabase
      const key = await getApiKey(API_KEYS.OPENAI);
      console.log('🔑 Global OpenAI key retrieval result:', key ? 'Key found' : 'No key found');
      
      if (!key) {
        console.log('❌ No OpenAI API key found in global storage');
        setOpenaiStatus('disconnected');
        setOpenaiApiKey("");
        return;
      }
      
      // Show that a global key exists (masked)
      setOpenaiApiKey("••••••••••••••••••••••••••");
      
      // Validate key with OpenAI API
      console.log('🔬 Validating OpenAI API key with OpenAI servers...');
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📡 OpenAI API validation response status:', response.status);
      
      if (response.ok) {
        console.log('✅ OpenAI API key is valid and working globally');
        setOpenaiStatus('connected');
        console.log('🌍 Global API key loaded and ready for all users');
      } else {
        const errorText = await response.text();
        console.log('❌ OpenAI API key validation failed:', response.status, errorText);
        setOpenaiStatus('disconnected');
        setOpenaiApiKey("");
      }
    } catch (error) {
      console.error('💥 OpenAI connection check error:', error);
      setOpenaiStatus('disconnected');
      setOpenaiApiKey("");
    }
  };

  const handleSaveOpenaiKey = async () => {
    if (openaiApiKey && openaiApiKey !== "••••••••••••••••••••••••••") {
      try {
        console.log('💾 Saving OpenAI API key globally...');
        await saveApiKey(API_KEYS.OPENAI, openaiApiKey, "OpenAI");
        setOpenaiApiKey("••••••••••••••••••••••••••");
        setOpenaiStatus('checking');
        
        console.log(`✅ OpenAI API key saved globally (available to all users everywhere)`);
        
        toast({
          title: "OpenAI API Key Saved Globally",
          description: "Your OpenAI API key has been saved and is now available to all users of this application worldwide",
        });
        
        // Re-check the connection after saving
        setTimeout(checkOpenAI, 500);
      } catch (error) {
        console.error('❌ Failed to save OpenAI API key:', error);
        toast({
          title: "Error",
          description: "Failed to save OpenAI API key",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "API Key Required",
        description: "Please enter a valid OpenAI API key",
        variant: "destructive",
      });
    }
  };

  return {
    openaiApiKey,
    setOpenaiApiKey,
    openaiStatus,
    checkOpenAI,
    handleSaveOpenaiKey
  };
};
