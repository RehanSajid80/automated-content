
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeywordData } from "@/utils/excelUtils";
import { getContentSuggestions } from "@/utils/openaiUtils";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  ChevronDown, 
  ChevronUp, 
  FileText, 
  Tag, 
  MessageSquare, 
  PenTool,
  EyeIcon,
  EyeOffIcon,
  KeyIcon,
  RefreshCwIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Local storage key for API key
const API_KEY_STORAGE = 'office-space-openai-key';

interface ContentSuggestion {
  topicArea: string;
  pillarContent: string[];
  supportPages: string[];
  metaTags: string[];
  socialMedia: string[];
  reasoning: string;
}

interface ContentSuggestionsProps {
  keywords: KeywordData[];
  className?: string;
}

// Form schema for API key
const apiKeyFormSchema = z.object({
  apiKey: z.string().min(20, "API key is too short").max(200, "API key is too long"),
});

const ContentSuggestions: React.FC<ContentSuggestionsProps> = ({
  keywords,
  className,
}) => {
  const [apiKey, setApiKey] = useState("");
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ContentSuggestion[]>([]);
  const [openCards, setOpenCards] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  // Initialize form with zod resolver
  const form = useForm<z.infer<typeof apiKeyFormSchema>>({
    resolver: zodResolver(apiKeyFormSchema),
    defaultValues: {
      apiKey: "",
    },
  });

  // Load API key from local storage on component mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem(API_KEY_STORAGE);
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setIsApiKeySet(true);
      // Pre-fill the form
      form.setValue("apiKey", savedApiKey);
      toast({
        title: "API Key Loaded",
        description: "Your saved OpenAI API key has been loaded securely",
      });
    }
  }, [toast]);

  const toggleApiKeyVisibility = () => {
    setIsApiKeyVisible(!isApiKeyVisible);
  };

  const toggleCard = (index: number) => {
    setOpenCards({
      ...openCards,
      [index]: !openCards[index],
    });
  };

  const onSubmitApiKey = (values: z.infer<typeof apiKeyFormSchema>) => {
    const newApiKey = values.apiKey.trim();
    // Save to local storage
    localStorage.setItem(API_KEY_STORAGE, newApiKey);
    setApiKey(newApiKey);
    setIsApiKeySet(true);
    setIsApiKeyDialogOpen(false);
    toast({
      title: "API Key Saved",
      description: "Your OpenAI API key has been saved securely",
    });
  };

  const clearApiKey = () => {
    if (window.confirm("Are you sure you want to remove your saved API key?")) {
      localStorage.removeItem(API_KEY_STORAGE);
      setApiKey("");
      form.reset({ apiKey: "" });
      setIsApiKeySet(false);
      toast({
        title: "API Key Removed",
        description: "Your OpenAI API key has been removed",
      });
    }
  };

  const generateSuggestions = async () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key",
        variant: "destructive",
      });
      setIsApiKeyDialogOpen(true);
      return;
    }

    if (keywords.length === 0) {
      toast({
        title: "No Keywords",
        description: "Please upload or select keywords first",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const results = await getContentSuggestions(keywords, apiKey);
      setSuggestions(results);
      toast({
        title: "Success",
        description: `Generated ${results.length} content topic suggestions`,
      });
    } catch (error) {
      console.error("Error generating suggestions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Card>
        <CardHeader>
          <CardTitle>AI Content Suggestions</CardTitle>
          <CardDescription>
            Use OpenAI to analyze your keywords and suggest content topics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">
                  OpenAI API Key
                </label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleApiKeyVisibility}
                    className="h-8 px-2"
                  >
                    {isApiKeyVisible ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsApiKeyDialogOpen(true)}
                    className="h-8"
                  >
                    {isApiKeySet ? "Update Key" : "Set Key"}
                  </Button>
                  {isApiKeySet && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearApiKey}
                      className="h-8"
                    >
                      Clear Key
                    </Button>
                  )}
                </div>
              </div>

              {/* API Key Display */}
              {isApiKeySet ? (
                <div className="bg-secondary/30 p-3 rounded-md flex items-center justify-between">
                  <div className="font-mono text-sm truncate flex-1">
                    {isApiKeyVisible 
                      ? apiKey 
                      : `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`}
                  </div>
                  <div className="text-green-600 text-xs font-medium flex items-center">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-1.5"></span>
                    Key Saved
                  </div>
                </div>
              ) : (
                <div 
                  className="bg-secondary/30 p-3 rounded-md flex items-center justify-between cursor-pointer hover:bg-secondary/50"
                  onClick={() => setIsApiKeyDialogOpen(true)}
                >
                  <div className="text-muted-foreground flex items-center">
                    <KeyIcon className="h-4 w-4 mr-2" />
                    <span>Click to set your OpenAI API key</span>
                  </div>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Your API key is stored locally on your device and not sent to our servers
              </p>
            </div>

            <Button
              onClick={generateSuggestions}
              disabled={isLoading || keywords.length === 0}
              className="w-full"
            >
              {isLoading
                ? "Generating Suggestions..."
                : `Generate Content Suggestions (${keywords.length} keywords)`}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* API Key Dialog */}
      <Dialog open={isApiKeyDialogOpen} onOpenChange={setIsApiKeyDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set OpenAI API Key</DialogTitle>
            <DialogDescription>
              Enter your OpenAI API key to enable content suggestions
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitApiKey)} className="space-y-4">
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          type={isApiKeyVisible ? "text" : "password"}
                          placeholder="sk-..."
                          className="pr-10 font-mono"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={toggleApiKeyVisibility}
                        >
                          {isApiKeyVisible ? (
                            <EyeOffIcon className="h-4 w-4" />
                          ) : (
                            <EyeIcon className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your key begins with &apos;sk-&apos; and is stored only in your browser
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="gap-2 sm:gap-0">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsApiKeyDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save API Key</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {suggestions.length > 0 && (
        <div className="space-y-4 mt-6">
          <h3 className="text-lg font-semibold">Content Topic Suggestions</h3>
          {suggestions.map((suggestion, index) => (
            <Card key={index} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{suggestion.topicArea}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleCard(index)}
                  >
                    {openCards[index] ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </Button>
                </div>
                <CardDescription>{suggestion.reasoning}</CardDescription>
              </CardHeader>
              <Collapsible open={openCards[index]} className="w-full">
                <CollapsibleContent>
                  <CardContent className="pt-0">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <h4 className="font-medium">Pillar Content</h4>
                        </div>
                        <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                          {suggestion.pillarContent.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <PenTool className="h-4 w-4 text-orange-500" />
                          <h4 className="font-medium">Support Pages</h4>
                        </div>
                        <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                          {suggestion.supportPages.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Tag className="h-4 w-4 text-green-500" />
                          <h4 className="font-medium">Meta Tags</h4>
                        </div>
                        <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                          {suggestion.metaTags.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="h-4 w-4 text-blue-500" />
                          <h4 className="font-medium">Social Media</h4>
                        </div>
                        <ul className="list-disc list-inside pl-2 space-y-1 text-sm">
                          {suggestion.socialMedia.map((item, itemIndex) => (
                            <li key={itemIndex}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContentSuggestions;
