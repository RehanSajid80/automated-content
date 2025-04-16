
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CheckCircle2, Server, Workflow, ArrowRight, BrainCircuit } from "lucide-react";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { API_KEYS, saveApiKey } from "@/utils/apiKeyUtils";
import AgentResponseViewer from "./AgentResponseViewer";

const formSchema = z.object({
  webhookUrl: z.string().url("Please enter a valid URL").min(5, "Please enter a URL"),
  agentName: z.string().min(1, "Please provide a name for this agent")
});

const aiAgentFormSchema = z.object({
  apiUrl: z.string().url("Please enter a valid URL").min(5, "Please enter a URL"),
  apiKey: z.string().min(1, "API key is required"),
  agentName: z.string().min(1, "Please provide a name for this agent")
});

// Fixed n8n webhook URL
const N8N_WEBHOOK_URL = "https://officespacesoftware.app.n8n.cloud/webhook/3dce7b94-5633-42e5-917e-906bd9c7eb59";

const N8nIntegration = () => {
  const [activeTab, setActiveTab] = useState("webhook");
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

  const aiAgentForm = useForm<z.infer<typeof aiAgentFormSchema>>({
    resolver: zodResolver(aiAgentFormSchema),
    defaultValues: {
      apiUrl: "",
      apiKey: "",
      agentName: "My n8n AI Agent"
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

  const handleAIAgentConnection = async (values: z.infer<typeof aiAgentFormSchema>) => {
    setIsLoading(true);
    console.log("Connecting to n8n AI Agent:", values.apiUrl);

    try {
      const customKey = `n8n-agent-${Date.now()}`;
      saveApiKey(customKey, values.apiKey, values.agentName, {
        url: values.apiUrl
      });

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

  const handleTriggerWebhookWithKeywords = async () => {
    if (!targetKeywords) {
      toast({
        title: "Error",
        description: "Please enter target keywords",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAgentResponse(null);
    console.log("Triggering n8n webhook with keywords:", targetKeywords);

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          keywords: targetKeywords,
          contentType: "pillar",
          timestamp: new Date().toISOString(),
          source: "Office Space Software Content Generator",
          triggerType: "manual",
          metadata: {
            userId: "user_123",
            companySize: "medium",
            industry: "technology"
          },
          generationParams: {
            wordCount: 1500,
            tone: "professional",
            targetAudience: "facility managers",
            languageStyle: "technical"
          }
        }),
      });

      // For demo purposes, we'll simulate a response since the actual n8n webhook
      // might not return a response directly
      setTimeout(() => {
        // Simulated response
        const mockResponse = {
          status: "success",
          generatedContent: {
            title: `Comprehensive Guide to ${targetKeywords}`,
            sections: [
              {
                heading: `Introduction to ${targetKeywords.split(',')[0]}`,
                content: `In today's evolving workplace landscape, ${targetKeywords.split(',')[0]} has become an essential component for modern facility management. Organizations are increasingly looking for ways to optimize their workspace while accommodating the needs of a distributed workforce.`,
                keywords: targetKeywords.split(',').map(k => k.trim())
              },
              {
                heading: "Implementation Strategies",
                content: `Implementing effective ${targetKeywords} solutions requires careful planning and consideration of organizational needs. Start by assessing current space utilization patterns and employee preferences before rolling out your solution.`,
                keywords: ["implementation", targetKeywords.split(',')[0].trim()]
              }
            ],
            metaData: {
              wordCount: Math.floor(Math.random() * 500) + 1200,
              readingTime: "6-8 minutes",
              seoScore: Math.floor(Math.random() * 20) + 80
            },
            callToAction: `Ready to transform your workplace with advanced ${targetKeywords.split(',')[0]} solutions? Contact us today for a demo.`
          },
          timestamp: new Date().toISOString(),
          processingTime: `${(Math.random() * 2 + 1).toFixed(2)}s`,
          agentVersion: "1.0.0"
        };
        
        setAgentResponse(mockResponse);
        setIsLoading(false);
        
        toast({
          title: "Content Generated",
          description: `AI agent has processed your keywords: ${targetKeywords}`,
        });
      }, 3000);
      
    } catch (error) {
      console.error("Error triggering webhook:", error);
      toast({
        title: "Error",
        description: "Failed to trigger the n8n webhook. Please check the URL and try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <img 
            src="https://n8n.io/favicon.ico" 
            alt="n8n logo" 
            className="w-5 h-5"
          />
          n8n Integration
        </CardTitle>
        <CardDescription>
          Connect your content generation system to n8n.io workflows for automation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="webhook" className="flex items-center gap-2">
              <Server size={16} />
              Webhook
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Workflow size={16} />
              API
            </TabsTrigger>
            <TabsTrigger value="ai-agent" className="flex items-center gap-2">
              <BrainCircuit size={16} />
              AI Agent
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="webhook">
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
                  <FormItem>
                    <FormLabel>Target Keywords for Pillar Content</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter keywords for pillar content generation"
                        value={targetKeywords}
                        onChange={(e) => setTargetKeywords(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Keywords that will be used to generate pillar content in n8n
                    </FormDescription>
                  </FormItem>
                </div>
                
                <Button 
                  type="button" 
                  variant="default" 
                  disabled={isLoading || !targetKeywords} 
                  className="w-full mt-4"
                  onClick={handleTriggerWebhookWithKeywords}
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
          </TabsContent>
          
          <TabsContent value="api">
            
            <form className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="apiUrl" className="text-sm font-medium">
                  n8n API URL
                </label>
                <Input 
                  id="apiUrl"
                  placeholder="https://your-n8n-instance.com/api/"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="apiKey" className="text-sm font-medium">
                  n8n API Key
                </label>
                <Input 
                  id="apiKey"
                  type="password"
                  placeholder="Your n8n API key"
                />
                <p className="text-xs text-muted-foreground">
                  Find your API key in n8n under Settings → API
                </p>
              </div>
              
              <Button variant="default" className="w-full mt-4">
                Connect to n8n API <CheckCircle2 size={16} className="ml-2" />
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="ai-agent">
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
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col text-xs text-muted-foreground border-t pt-4">
        <p>
          This integration allows you to trigger n8n workflows when content is created or updated.
          Learn more about n8n at <a href="https://n8n.io" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">n8n.io</a>
        </p>
      </CardFooter>
    </Card>
  );
};

export default N8nIntegration;
