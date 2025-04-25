
import React from "react";
import { Edit, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { authorPersonas } from "@/data/authorPersonas";
import { contentTypes } from "@/data/contentTypes";

export interface ContentFormData {
  keywords: string;
  contentType: string;
  context: string;
  author: string;
  tone: string;
}

interface ContentFormProps {
  onSubmit: (data: ContentFormData) => void;
  isGenerating: boolean;
}

export const ContentForm: React.FC<ContentFormProps> = ({ onSubmit, isGenerating }) => {
  const form = useForm<ContentFormData>({
    defaultValues: {
      keywords: "",
      contentType: "pillar",
      context: "",
      author: "erica",
      tone: "professional"
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Target Keywords</FormLabel>
              <FormControl>
                <Input placeholder="e.g., desk booking system, workplace management" {...field} />
              </FormControl>
              <FormDescription>Enter primary keywords separated by commas</FormDescription>
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="contentType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Content Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select content type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {contentTypes.map(type => (
                      <SelectItem key={type.id} value={type.id}>
                        <div className="flex flex-col">
                          <span>{type.name}</span>
                          <span className="text-xs text-muted-foreground">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="author"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Author Persona</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select author" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {authorPersonas.map(author => (
                      <SelectItem key={author.id} value={author.id}>
                        <div className="flex flex-col">
                          <span>{author.name}</span>
                          <span className="text-xs text-muted-foreground">{author.style}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The author persona will influence content style and tone
                </FormDescription>
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="context"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content Context</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Provide context about your target audience, purpose of the content, and any specific points to include..." 
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate Content <Edit size={16} className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
