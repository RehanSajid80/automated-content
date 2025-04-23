
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, BrainCircuit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { saveApiKey } from "@/utils/apiKeyUtils";

const aiAgentFormSchema = z.object({
  apiUrl: z.string().url("Please enter a valid URL").min(5, "Please enter a URL"),
  apiKey: z.string().min(1, "API key is required"),
  agentName: z.string().min(1, "Please provide a name for this agent")
});

const AiAgentForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const aiAgentForm = useForm<z.infer<typeof aiAgentFormSchema>>({
    resolver: zodResolver(aiAgentFormSchema),
    defaultValues: {
      apiUrl: "",
      apiKey: "",
      agentName: "My n8n AI Agent"
    }
  });

  const handleAIAgentConnection = async (values: z.infer<typeof aiAgentFormSchema>) => {
    setIsLoading(true);
    console.log("Connecting to n8n AI Agent:", values.apiUrl);

    try {
      const customKey = `n8n-agent-${Date.now()}`;
      saveApiKey(customKey, values.apiKey, values.agentName);
      
      localStorage.setItem(`${customKey}-url`, values.apiUrl);

      toast({
        title: "AI Agent Connected",
        description: "Your n8n AI Agent has been saved and can now be used for content generation.",
      });
      
      aiAgentForm.reset();
    } catch (error) {
      console.error("Error connecting to AI Agent:", error);
      toast({
        title: "Error",
        description: "Failed to connect to the n8n AI Agent. Please check your credentials.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...aiAgentForm}>
      <form onSubmit={aiAgentForm.handleSubmit(handleAIAgentConnection)} className="space-y-4">
        <div className="rounded-md bg-blue-50 dark:bg-blue-950/50 p-4 border border-blue-200 dark:border-blue-800 mb-4">
          <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">About n8n AI Agents</h4>
          <p className="text-xs text-blue-700 dark:text-blue-400">
            Create your AI agent in n8n first using the HTTP Request node and OpenAI node. Then connect to it here to use it for content generation.
          </p>
        </div>

        <FormField
          control={aiAgentForm.control}
          name="agentName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent Name</FormLabel>
              <FormControl>
                <Input 
                  placeholder="My n8n AI Agent"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A name to identify this AI agent
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={aiAgentForm.control}
          name="apiUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent Endpoint URL</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://your-n8n-instance.com/webhook/ai-agent"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                The webhook URL that triggers your AI agent workflow
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={aiAgentForm.control}
          name="apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Agent API Key (if required)</FormLabel>
              <FormControl>
                <Input 
                  type="password"
                  placeholder="Optional API key for authentication"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                If your n8n workflow requires authentication
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" variant="default" disabled={isLoading} className="w-full mt-4">
          {isLoading ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Connecting AI Agent...
            </>
          ) : (
            <>
              Connect AI Agent <BrainCircuit size={16} className="ml-2" />
            </>
          )}
        </Button>
      </form>
    </Form>
  );
};

export default AiAgentForm;
