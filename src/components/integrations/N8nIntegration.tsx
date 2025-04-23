
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Workflow, BrainCircuit } from "lucide-react";
import WebhookForm from "./n8n/WebhookForm";
import ApiForm from "./n8n/ApiForm";
import AiAgentForm from "./n8n/AiAgentForm";

const N8nIntegration = () => {
  const [activeTab, setActiveTab] = useState("webhook");

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
            <WebhookForm />
          </TabsContent>
          
          <TabsContent value="api">
            <ApiForm />
          </TabsContent>

          <TabsContent value="ai-agent">
            <AiAgentForm />
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
