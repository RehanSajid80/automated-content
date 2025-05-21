
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, CheckIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ContentViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  content: string;
}

const ContentViewDialog: React.FC<ContentViewDialogProps> = ({ 
  open, 
  onOpenChange, 
  title, 
  content 
}) => {
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Content has been copied to your clipboard",
      });
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title || 'Content Preview'}</DialogTitle>
        </DialogHeader>
        
        <div className="mt-2">
          <div className="bg-secondary/30 rounded-md p-4 max-h-[60vh] overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm">{content || 'No content available'}</pre>
          </div>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            onClick={copyToClipboard}
            className={cn(copied ? "bg-green-500 hover:bg-green-600" : "")}
          >
            {copied ? (
              <>
                <CheckIcon className="h-4 w-4 mr-2" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ContentViewDialog;
