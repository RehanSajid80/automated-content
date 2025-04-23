
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AgentResponseViewer from "../AgentResponseViewer";

const formSchema = z.object({
  webhookUrl: z.string().url("Please enter a valid URL").min(5, "Please enter a URL"),
  agentName: z.string().min(1, "Please provide a name for this agent")
});

const WebhookForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [targetKeywords, setTargetKeywords] = useState("");
  const [agentResponse, setAgentResponse] = useState(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      webhookUrl: "",
      agentName: "My n8n Webhook Agent"
    }
  });

  const handleTriggerWebhook = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    console.log("Triggering n8n webhook:", values.webhookUrl);

    try {
      const response = await fetch(values.webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: "Content generation for Office Space Software",
          contentType: "pillar",
          timestamp: new Date().toISOString(),
          source: "Office Space Software Content Generator",
          triggerType: "manual",
          sampleData: {
            title: "Optimizing Office Space for Hybrid Work",
            keywords: ["hybrid workplace", "office space optimization", "desk booking"],
            wordCount: 1500
          }
        }),
      });

      toast({
        title: "Workflow Triggered",
        description: "The request was sent to n8n. Check your n8n dashboard to see the workflow execution.",
      });
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Error",
        description: "Failed to trigger the n8n webhook. Please check the URL and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleTriggerWebhook)} className="space-y-4">
          <FormField
            control={form.control}
            name="webhookUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>n8n Webhook URL</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="https://your-n8n-instance.com/webhook/path"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Create a Webhook node in n8n and paste the URL here
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="agentName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Agent Name</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="My Content Webhook"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  A name to identify this webhook connection
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="rounded-md bg-amber-50 dark:bg-amber-950/50 p-4 border border-amber-200 dark:border-amber-800">
            <h4 className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">Example Workflow</h4>
            <p className="text-xs text-amber-700 dark:text-amber-400">
              1. Webhook node (Trigger) → 2. HTTP Request node (Send to API) → 3. OpenAI node (Generate content) → 4. Email node (Deliver content)
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <FormLabel>Target Keywords for Pillar Content</FormLabel>
              <Input 
                placeholder="Enter keywords for pillar content generation"
                value={targetKeywords}
                onChange={(e) => setTargetKeywords(e.target.value)}
              />
              <FormDescription>
                Keywords that will be used to generate pillar content in n8n
              </FormDescription>
            </div>
          </div>
          
          <Button 
            type="button" 
            variant="default" 
            disabled={isLoading || !targetKeywords} 
            className="w-full mt-4"
            onClick={() => handleTriggerWebhook(form.getValues())}
          >
            {isLoading ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Triggering Workflow...
              </>
            ) : (
              <>
                Generate Pillar Content <ArrowRight size={16} className="ml-2" />
              </>
            )}
          </Button>
        </form>
      </Form>
      
      {(isLoading || agentResponse) && (
        <div className="mt-6">
          <AgentResponseViewer 
            response={agentResponse}
            isLoading={isLoading}
          />
        </div>
      )}
    </>
  );
};

export default WebhookForm;
